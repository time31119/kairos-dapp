import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { Screen } from '@/components/Screen';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { Ionicons, FontAwesome6 } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { formatAddress, isValidAddress } from '@/services/metamask';

// 钱包信息格式（与 Web3Context 一致）
interface WalletInfo {
  address: string;
  chain: string;
  connectedAt: number;
}

// 存储键（与 Web3Context 一致）
const WALLET_INFO_KEY = 'wallet_info';
const WALLET_TYPE_KEY = 'wallet_type';

// 钱包连接状态
const WalletStatus = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
};

// TP Wallet 提供者类型
declare global {
  interface Window {
    trustwallet?: {
      isTrust?: boolean;
      request?: (args: any) => Promise<any>;
    };
    BinanceChain?: {
      bsc?: boolean;
      request?: (args: any) => Promise<any>;
    };
  }
}

// 我的页面主组件
export default function MineScreen() {
  const router = useSafeRouter();
  const [walletStatus, setWalletStatus] = useState(WalletStatus.DISCONNECTED);
  const [walletAddress, setWalletAddress] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // 用户数据
  const [userStats] = useState({
    totalOrders: 0,
    totalFollowers: 0,
    totalProfit: 0,
    vipLevel: 0,
  });

  // 钱包类型
  const [walletType, setWalletType] = useState<'trust' | 'metamask' | 'bsc' | null>(null);

  // 恢复钱包连接状态
  useEffect(() => {
    const restoreWallet = async () => {
      try {
        // 从本地存储恢复钱包信息（与 Web3Context 一致）
        const storedInfo = await AsyncStorage.getItem(WALLET_INFO_KEY);
        const storedWalletType = await AsyncStorage.getItem(WALLET_TYPE_KEY);
        
        if (storedInfo) {
          const info: WalletInfo = JSON.parse(storedInfo);
          if (info.address && /^0x[a-fA-F0-9]{40}$/.test(info.address)) {
            setWalletAddress(info.address);
            setWalletStatus(WalletStatus.CONNECTED);
            
            if (storedWalletType) {
              setWalletType(storedWalletType as 'trust' | 'metamask' | 'bsc');
            } else if ((window as any).trustwallet || (window as any).trustwallet?.isTrust) {
              setWalletType('trust');
            }
          }
        }
      } catch (error) {
        console.error('Restore wallet failed:', error);
      }
    };
    
    restoreWallet();
  }, []);

  // 获取以太坊提供者 (TP Wallet / MetaMask)
  const getEthereumProvider = () => {
    // 仅在 Web 环境检查
    if (Platform.OS !== 'web') {
      return null;
    }

    if (typeof window !== 'undefined') {
      // TP Wallet (Trust Wallet) - 主要检测方式
      // Trust Wallet 在内置浏览器中会注入 trustwallet 对象
      if ((window as any).trustwallet || window.trustwallet?.isTrust) {
        return window;
      }
      
      // TP Wallet 也可能注入 ethereum 对象
      if ((window as any).ethereum) {
        // 检查是否是 TP Wallet
        const ethereum = (window as any).ethereum;
        if (ethereum?.isTokenPocket || ethereum?.isTrust || (window as any).tokenpocket) {
          return window;
        }
        // 其他钱包 (MetaMask)
        return window;
      }
    }
    return null;
  };

  // 断开钱包连接
  const disconnectWallet = async () => {
    setWalletAddress('');
    setWalletStatus(WalletStatus.DISCONNECTED);
    setWalletType(null);
    await AsyncStorage.removeItem(WALLET_INFO_KEY);
    await AsyncStorage.removeItem(WALLET_TYPE_KEY);
  };

  // 连接 TP 钱包
  const handleConnectWallet = async () => {
    try {
      setWalletStatus(WalletStatus.CONNECTING);

      // 在 Web 环境尝试连接
      if (typeof window !== 'undefined') {
        const provider = getEthereumProvider();

        if (provider) {
          try {
            // 请求钱包连接
            const accounts = await (provider as any).ethereum.request({
              method: 'eth_requestAccounts',
            });

            // 验证返回的地址是否是有效的以太坊地址
            const isValidEthAddress = (addr: string) => /^0x[a-fA-F0-9]{40}$/.test(addr);

            if (accounts && accounts.length > 0 && isValidEthAddress(accounts[0])) {
              setWalletAddress(accounts[0]);
              setWalletStatus(WalletStatus.CONNECTED);

              // 检测钱包类型
              let detectedType: 'trust' | 'metamask' | 'bsc' = 'metamask';
              const ethereum = (provider as any).ethereum || (window as any).ethereum;
              if ((provider as any).trustwallet || (window as any).trustwallet || ethereum?.isTokenPocket || ethereum?.isTrust || (window as any).tokenpocket) {
                detectedType = 'trust';
              } else if ((provider as any).BinanceChain?.bsc) {
                detectedType = 'bsc';
              }
              setWalletType(detectedType);
              
              // 保存到本地存储（与 Web3Context 一致）
              const walletInfo: WalletInfo = {
                address: accounts[0],
                chain: 'bsc',
                connectedAt: Date.now(),
              };
              await AsyncStorage.setItem(WALLET_INFO_KEY, JSON.stringify(walletInfo));
              await AsyncStorage.setItem(WALLET_TYPE_KEY, detectedType);
              return;
            } else {
              // 返回了无效地址
              Alert.alert('连接失败', '钱包返回了无效的地址，请重试');
              setWalletStatus(WalletStatus.DISCONNECTED);
              return;
            }
          } catch (err: any) {
            // 用户拒绝或连接失败
            if (err.code === 4001) {
              Alert.alert('连接失败', '您拒绝了钱包连接请求');
            } else {
              Alert.alert('连接失败', '无法连接到钱包，请确保在 TP 钱包浏览器中打开此页面');
            }
          }
        } else {
          // 未检测到钱包
          Alert.alert('请使用 TP 钱包', '请在 TP 钱包的内置浏览器中打开此页面');
        }
      } else {
        // 非 Web 环境
        Alert.alert('请使用 TP 钱包', '请在 TP 钱包的内置浏览器中打开此页面');
      }

      setWalletStatus(WalletStatus.DISCONNECTED);
    } catch (error) {
      console.error('Wallet connection failed:', error);
      Alert.alert('连接失败', '钱包连接过程中发生错误');
      setWalletStatus(WalletStatus.DISCONNECTED);
    }
  };

  // 复制地址到剪贴板
  const copyAddress = async () => {
    try {
      await Clipboard.setStringAsync(walletAddress);
      Alert.alert('已复制', '钱包地址已复制到剪贴板');
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  // 获取钱包图标
  const getWalletIcon = () => {
    if (walletType === 'trust') return '💎';
    if (walletType === 'bsc') return '🟡';
    return '🦊';
  };

  // 获取钱包名称
  const getWalletName = () => {
    if (walletType === 'trust') return 'TP 钱包';
    if (walletType === 'bsc') return 'BNB 钱包';
    return 'MetaMask';
  };

  return (
    <Screen safeAreaEdges={['left', 'right', 'bottom']}>
      <ScrollView className="flex-1" style={{ backgroundColor: '#000' }}>
        {/* 顶部标题 */}
        <View className="px-5 pt-4 pb-3">
          <Text className="text-2xl font-bold" style={{ color: '#FFFFFF' }}>我的</Text>
        </View>

        {/* 钱包连接卡片 */}
        <View className="px-5 mb-5">
          <TouchableOpacity
            className="rounded-2xl p-4"
            style={{
              backgroundColor: walletStatus === WalletStatus.CONNECTED ? '#0A0A0F' : '#1A1A22',
              borderWidth: walletStatus === WalletStatus.CONNECTED ? 1 : 0,
              borderColor: '#00F0FF',
            }}
            onPress={walletStatus === WalletStatus.CONNECTED ? disconnectWallet : handleConnectWallet}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <View 
                  className="w-12 h-12 rounded-full items-center justify-center"
                  style={{ backgroundColor: 'rgba(0, 240, 255, 0.1)' }}
                >
                  <Text style={{ fontSize: 24 }}>{getWalletIcon()}</Text>
                </View>
                <View>
                  {walletStatus === WalletStatus.CONNECTED ? (
                    <>
                      <Text className="text-sm font-medium" style={{ color: '#FFFFFF' }}>
                        {formatAddress(walletAddress)}
                      </Text>
                      <Text className="text-xs" style={{ color: '#00F0FF' }}>{getWalletName()} 已连接</Text>
                    </>
                  ) : (
                    <>
                      <Text className="text-sm font-medium" style={{ color: '#FFFFFF' }}>
                        {walletStatus === WalletStatus.CONNECTING ? '连接中...' : '连接 TP 钱包'}
                      </Text>
                      <Text className="text-xs" style={{ color: '#6B7280' }}>点击连接钱包</Text>
                    </>
                  )}
                </View>
              </View>
              {walletStatus === WalletStatus.CONNECTED ? (
                <TouchableOpacity
                  className="px-3 py-1.5 rounded-full"
                  style={{ backgroundColor: 'rgba(255, 68, 68, 0.1)' }}
                  onPress={disconnectWallet}
                >
                  <Text className="text-xs font-medium" style={{ color: '#FF4444' }}>断开</Text>
                </TouchableOpacity>
              ) : (
                <View 
                  className="px-3 py-1.5 rounded-full"
                  style={{ backgroundColor: 'rgba(0, 240, 255, 0.1)' }}
                >
                  <Text className="text-xs font-medium" style={{ color: '#00F0FF' }}>
                    {walletStatus === WalletStatus.CONNECTING ? '...' : '连接'}
                  </Text>
                </View>
              )}
            </View>
            {/* 已连接时显示完整地址可复制 */}
            {walletStatus === WalletStatus.CONNECTED && (
              <TouchableOpacity 
                className="mt-3 p-2 rounded-lg"
                style={{ backgroundColor: 'rgba(0, 240, 255, 0.05)' }}
                onPress={copyAddress}
              >
                <Text className="text-xs" style={{ color: '#6B7280' }} numberOfLines={1}>
                  {walletAddress}
                </Text>
                <Text className="text-xs mt-1" style={{ color: '#00F0FF' }}>点击复制地址</Text>
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        </View>

        {/* 用户数据统计 */}
        {walletStatus === WalletStatus.CONNECTED && (
          <View className="px-5 mb-5">
            <View 
              className="rounded-2xl p-4"
              style={{ backgroundColor: '#0A0A0F', borderWidth: 1, borderColor: '#1F1F2E' }}
            >
              <View className="flex-row justify-between">
                <View className="items-center flex-1">
                  <Text className="text-xl font-bold" style={{ color: '#00F0FF' }}>
                    {userStats.totalOrders}
                  </Text>
                  <Text className="text-xs mt-1" style={{ color: '#6B7280' }}>订单数</Text>
                </View>
                <View className="items-center flex-1">
                  <Text className="text-xl font-bold" style={{ color: '#FFD700' }}>
                    {userStats.totalFollowers}
                  </Text>
                  <Text className="text-xs mt-1" style={{ color: '#6B7280' }}>跟单数</Text>
                </View>
                <View className="items-center flex-1">
                  <Text className="text-xl font-bold" style={{ color: '#10B981' }}>
                    ${userStats.totalProfit.toFixed(2)}
                  </Text>
                  <Text className="text-xs mt-1" style={{ color: '#6B7280' }}>累计收益</Text>
                </View>
                <View className="items-center flex-1">
                  <View className={`px-2 py-0.5 rounded ${userStats.vipLevel > 0 ? 'bg-yellow-500/20' : 'bg-gray-500/20'}`}>
                    <Text className={`text-xs font-medium ${userStats.vipLevel > 0 ? 'text-yellow-500' : 'text-gray-500'}`}>
                      {userStats.vipLevel > 0 ? `VIP ${userStats.vipLevel}` : '普通'}
                    </Text>
                  </View>
                  <Text className="text-xs mt-1" style={{ color: '#6B7280' }}>会员等级</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* VIP 会员 Banner */}
        <View className="px-5 mb-5">
          <TouchableOpacity
            className="rounded-2xl p-4 overflow-hidden"
            style={{
              backgroundColor: '#0A0A0F',
              borderWidth: 1,
              borderColor: '#FFD700',
            }}
            onPress={() => router.push('/vip')}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <View 
                  className="w-12 h-12 rounded-xl items-center justify-center"
                  style={{ backgroundColor: 'rgba(255, 215, 0, 0.1)' }}
                >
                  <FontAwesome6 name="crown" size={24} color="#FFD700" />
                </View>
                <View>
                  <Text className="text-sm font-semibold" style={{ color: '#FFD700' }}>开通会员</Text>
                  <Text className="text-xs" style={{ color: '#6B7280' }}>尊享更多特权</Text>
                </View>
              </View>
              <View className="flex-row items-center gap-2">
                <Text className="text-xs" style={{ color: '#6B7280' }}>立即开通</Text>
                <Ionicons name="chevron-forward" size={16} color="#FFD700" />
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* 功能入口 - 统一 2x3 网格布局 */}
        <View className="px-5 mb-5">
          <Text className="text-xs mb-3 px-1 uppercase tracking-wider" style={{ color: '#6B7280' }}>
            功能入口
          </Text>
          <View className="flex-row flex-wrap justify-between">
            {/* 一键跟单 */}
            <TouchableOpacity
              className="items-center mb-4"
              style={{ width: '31%' }}
              onPress={() => router.push('/copytrading')}
            >
              <View 
                className="w-full rounded-xl p-3 items-center"
                style={{ backgroundColor: '#0A0A0F', borderWidth: 1, borderColor: '#1F1F2E' }}
              >
                <View 
                  className="w-10 h-10 rounded-full items-center justify-center mb-2"
                  style={{ backgroundColor: 'rgba(255, 215, 0, 0.1)' }}
                >
                  <FontAwesome6 name="users" size={18} color="#FFD700" />
                </View>
                <Text className="text-xs font-medium" style={{ color: '#FFFFFF' }}>一键跟单</Text>
              </View>
            </TouchableOpacity>

            {/* 机构跟投 */}
            <TouchableOpacity
              className="items-center mb-4"
              style={{ width: '31%' }}
              onPress={() => router.push('/signal')}
            >
              <View 
                className="w-full rounded-xl p-3 items-center"
                style={{ backgroundColor: '#0A0A0F', borderWidth: 1, borderColor: '#1F1F2E' }}
              >
                <View 
                  className="w-10 h-10 rounded-full items-center justify-center mb-2"
                  style={{ backgroundColor: 'rgba(0, 255, 136, 0.1)' }}
                >
                  <FontAwesome6 name="building-columns" size={18} color="#00FF88" />
                </View>
                <Text className="text-xs font-medium" style={{ color: '#FFFFFF' }}>机构跟投</Text>
              </View>
            </TouchableOpacity>

            {/* 委托交易 - 即将上线 */}
            <TouchableOpacity
              className="items-center mb-4"
              style={{ width: '31%' }}
              onPress={() => {
                setToastMessage?.('委托交易功能即将上线，敬请期待！');
              }}
            >
              <View 
                className="w-full rounded-xl p-3 items-center"
                style={{ backgroundColor: '#0A0A0F', borderWidth: 1, borderColor: '#1F1F2E' }}
              >
                <View 
                  className="w-10 h-10 rounded-full items-center justify-center mb-2"
                  style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)' }}
                >
                  <FontAwesome6 name="hand-holding-dollar" size={18} color="#8B5CF6" />
                </View>
                <Text className="text-xs font-medium" style={{ color: '#6B7280' }}>委托交易</Text>
                <Text className="text-xs" style={{ color: '#8B5CF6' }}>即将上线</Text>
              </View>
            </TouchableOpacity>

            {/* 会员中心 */}
            <TouchableOpacity
              className="items-center mb-4"
              style={{ width: '31%' }}
              onPress={() => router.push('/vip')}
            >
              <View 
                className="w-full rounded-xl p-3 items-center"
                style={{ backgroundColor: '#0A0A0F', borderWidth: 1, borderColor: '#1F1F2E' }}
              >
                <View 
                  className="w-10 h-10 rounded-full items-center justify-center mb-2"
                  style={{ backgroundColor: 'rgba(255, 215, 0, 0.1)' }}
                >
                  <FontAwesome6 name="gem" size={18} color="#FFD700" />
                </View>
                <Text className="text-xs" style={{ color: '#FFFFFF' }}>会员中心</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* 底部间距 */}
        <View className="h-20" />
      </ScrollView>
    </Screen>
  );
}
