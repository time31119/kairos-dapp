'use client';

/**
 * 我的页面 - DAPP 版本
 * 支持钱包连接和 Web3 身份
 */
import { Screen } from '@/components/Screen';
import { Text, View, TouchableOpacity, ScrollView, Alert, RefreshControl } from 'react-native';
import { Ionicons, FontAwesome6 } from '@expo/vector-icons';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { useWeb3 } from '@/contexts/Web3Context';
import { useState, useEffect, useCallback } from 'react';

// DAPP 暗黑科技风配色
const colors = {
  bg: '#0A0A0F',
  card: '#141419',
  cardLight: '#1A1A22',
  neonCyan: '#00F0FF',
  neonPurple: '#BF00FF',
  neonGold: '#FFD700',
  text: '#FFFFFF',
  textMuted: '#8B8B9E',
  success: '#00FF88',
  warning: '#FFD700',
  error: '#EF4444',
};

interface UserStats {
  totalOrders: number;
  totalFollowers: number;
  totalProfit: number;
  vipLevel: number;
  nftCount: number;
}

const MENU_ITEMS = [
  { icon: 'settings-outline', label: '设置', color: '#9CA3AF', path: '/settings', badge: '' },
  { icon: 'shield-outline', label: '隐私设置', color: '#9CA3AF', path: '/settings/privacy', badge: '' },
  { icon: 'key-outline', label: '安全中心', color: '#9CA3AF', path: '/settings/security', badge: '' },
  { icon: 'language-outline', label: '语言', color: '#9CA3AF', path: '', badge: '简体中文' },
  { icon: 'help-circle-outline', label: '帮助中心', color: '#9CA3AF', path: '/support', badge: '' },
  { icon: 'document-text-outline', label: '用户协议', color: '#9CA3AF', path: '/settings/terms', badge: '' },
  { icon: 'information-circle-outline', label: '关于我们', color: '#9CA3AF', path: '/settings/about', badge: '' },
];

export default function MineScreen() {
  const router = useSafeRouter();
  const { address, shortAddress, balance, isConnected, chainId, connect, disconnect } = useWeb3();
  const [refreshing, setRefreshing] = useState(false);
  const [userStats, setUserStats] = useState<UserStats>({
    totalOrders: 0,
    totalFollowers: 0,
    totalProfit: 0,
    vipLevel: 0,
    nftCount: 0,
  });
  const [showAddress, setShowAddress] = useState(false);

  useEffect(() => {
    // 模拟加载用户数据
    if (isConnected) {
      setUserStats({
        totalOrders: Math.floor(Math.random() * 50),
        totalFollowers: Math.floor(Math.random() * 20),
        totalProfit: (Math.random() * 10 - 5).toFixed(2) as unknown as number,
        vipLevel: Math.floor(Math.random() * 3),
        nftCount: Math.floor(Math.random() * 5),
      });
    }
  }, [isConnected, address]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // 模拟刷新数据
    await new Promise(resolve => setTimeout(resolve, 1000));
    setUserStats(prev => ({
      ...prev,
      totalOrders: prev.totalOrders + Math.floor(Math.random() * 5),
    }));
    setRefreshing(false);
  }, []);

  const handleLogin = () => {
    router.push('/auth');
  };

  const copyAddress = () => {
    if (address) {
      Alert.alert('地址已复制', address);
    }
  };

  const handleDisconnect = () => {
    Alert.alert(
      '断开钱包',
      '确定要断开钱包连接吗？',
      [
        { text: '取消', style: 'cancel' },
        { text: '确定', style: 'destructive', onPress: disconnect },
      ]
    );
  };

  const formatAddress = (addr: string) => {
    if (showAddress) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const getNetworkName = (id: number | null) => {
    switch (id) {
      case 1: return 'Mainnet';
      case 5: return 'Goerli';
      case 11155111: return 'Sepolia';
      case 137: return 'Polygon';
      case 56: return 'BSC';
      default: return 'Unknown';
    }
  };

  const getNetworkColor = (id: number | null) => {
    switch (id) {
      case 1: return '#627EEA'; // Ethereum Mainnet
      case 5: return '#00D3FF'; // Goerli
      case 11155111: return '#F3BA2F'; // Sepolia
      default: return '#9CA3AF';
    }
  };

  return (
    <Screen>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.neonCyan}
            colors={[colors.neonCyan]}
          />
        }
      >
        {/* Header */}
        <View className="px-5 pt-3 pb-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-2xl font-bold text-white">我的</Text>
            <TouchableOpacity 
              className="w-10 h-10 rounded-full bg-gray-800 items-center justify-center"
              onPress={() => router.push('/notification')}
            >
              <Ionicons name="notifications-outline" size={22} color="#fff" />
              <View className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Card - Web3 版本 */}
        <View className="mx-5 mb-5">
          <TouchableOpacity 
            className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-5 border border-gray-800"
            onPress={isConnected ? copyAddress : handleLogin}
          >
            {isConnected ? (
              // 已连接钱包状态
              <View>
                <View className="flex-row items-center gap-4 mb-4">
                  {/* 钱包头像 */}
                  <View className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 items-center justify-center">
                    <FontAwesome6 name="wallet" size={24} color="#fff" />
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2">
                      <Text className="text-lg font-semibold text-white">Web3 用户</Text>
                      {userStats.vipLevel > 0 && (
                        <View className="bg-yellow-500/20 px-2 py-0.5 rounded-full">
                          <Text className="text-xs text-yellow-400">
                            VIP {userStats.vipLevel}
                          </Text>
                        </View>
                      )}
                    </View>
                    <TouchableOpacity onPress={() => setShowAddress(!showAddress)} className="flex-row items-center gap-1 mt-1">
                      <Text className="text-sm text-gray-400">{formatAddress(address || '')}</Text>
                      <Ionicons 
                        name={showAddress ? "eye-off-outline" : "eye-outline"} 
                        size={12} 
                        color="#6B7280" 
                      />
                    </TouchableOpacity>
                  </View>
                  {/* 断开按钮 */}
                  <TouchableOpacity 
                    className="px-3 py-1.5 rounded-lg border border-red-500/50"
                    onPress={handleDisconnect}
                  >
                    <Text className="text-xs text-red-400">断开</Text>
                  </TouchableOpacity>
                </View>
                
                {/* 钱包信息 */}
                <View className="flex-row justify-between bg-black/30 rounded-xl p-3">
                  <View className="items-center flex-1">
                    <Text className="text-xs text-gray-500 mb-1">余额</Text>
                    <Text className="text-sm font-semibold text-cyan-400">{balance} ETH</Text>
                  </View>
                  <View className="w-px bg-gray-800" />
                  <View className="items-center flex-1">
                    <Text className="text-xs text-gray-500 mb-1">网络</Text>
                    <View className="flex-row items-center gap-1">
                      <View style={{ backgroundColor: getNetworkColor(chainId) }} className="w-2 h-2 rounded-full" />
                      <Text className="text-sm font-semibold text-gray-300">{getNetworkName(chainId)}</Text>
                    </View>
                  </View>
                  <View className="w-px bg-gray-800" />
                  <View className="items-center flex-1">
                    <Text className="text-xs text-gray-500 mb-1">Gas</Text>
                    <Text className="text-sm font-semibold text-purple-400">实时</Text>
                  </View>
                </View>
              </View>
            ) : (
              // 未连接状态
              <View className="items-center py-4">
                <View className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-800 to-gray-700 items-center justify-center mb-4">
                  <FontAwesome6 name="wallet" size={36} color="#6B7280" />
                </View>
                <Text className="text-lg font-semibold text-white mb-1">连接钱包</Text>
                <Text className="text-sm text-gray-500 mb-4 text-center">
                  连接 Web3 钱包体验完整功能
                </Text>
                <TouchableOpacity 
                  className="bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl px-8 py-2.5"
                  onPress={handleLogin}
                >
                  <Text className="text-sm font-semibold text-black">连接钱包</Text>
                </TouchableOpacity>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* 用户统计 */}
        {isConnected && (
          <View className="px-5 mb-5">
            <View className="bg-gray-900/80 rounded-2xl p-4 border border-gray-800">
              <View className="flex-row justify-around">
                <TouchableOpacity 
                  className="items-center flex-1"
                  onPress={() => router.push('/trading')}
                >
                  <Text className="text-xl font-bold text-white">{userStats.totalOrders}</Text>
                  <Text className="text-xs text-gray-500 mt-1">订单数</Text>
                </TouchableOpacity>
                <View className="w-px bg-gray-800" />
                <TouchableOpacity 
                  className="items-center flex-1"
                  onPress={() => router.push('/follow')}
                >
                  <Text className="text-xl font-bold text-white">{userStats.totalFollowers}</Text>
                  <Text className="text-xs text-gray-500 mt-1">跟单数</Text>
                </TouchableOpacity>
                <View className="w-px bg-gray-800" />
                <View className="items-center flex-1">
                  <Text className={`text-xl font-bold ${userStats.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {userStats.totalProfit > 0 ? '+' : ''}{userStats.totalProfit}%
                  </Text>
                  <Text className="text-xs text-gray-500 mt-1">收益率</Text>
                </View>
                <View className="w-px bg-gray-800" />
                <View className="items-center flex-1">
                  <Text className="text-xl font-bold text-yellow-400">{userStats.nftCount}</Text>
                  <Text className="text-xs text-gray-500 mt-1">NFT</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Web3 功能提示 */}
        <View className="px-5 mb-5">
          <TouchableOpacity 
            className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-2xl p-4 border border-cyan-500/20"
            onPress={() => router.push('/vip/membership')}
          >
            <View className="flex-row items-center gap-3 mb-3">
              <View className="w-10 h-10 rounded-xl bg-cyan-500/20 items-center justify-center">
                <Ionicons name="diamond" size={22} color="#00F0FF" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-cyan-400">KAIROS DAPP 会员</Text>
                <Text className="text-xs text-gray-500">解锁链上高级功能</Text>
              </View>
              <View className="bg-cyan-500 px-3 py-1 rounded-full">
                <Text className="text-xs font-bold text-black">开通</Text>
              </View>
            </View>
            
            <View className="flex-row justify-between">
              {['链上数据', '智能筛选', 'Web3 提醒'].map((item, i) => (
                <View key={i} className="items-center">
                  <Ionicons name="checkmark-circle" size={16} color="#00F0FF" />
                  <Text className="text-xs text-gray-400 mt-1">{item}</Text>
                </View>
              ))}
            </View>
          </TouchableOpacity>
        </View>

        {/* 用户功能入口 */}
        <View className="px-5 mb-5">
          <Text className="text-xs text-gray-500 mb-2 px-1">交易功能</Text>
          <View className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
            <TouchableOpacity
              className="flex-row items-center justify-between px-4 py-4 border-b border-gray-800"
              onPress={() => router.push('/trading')}
            >
              <View className="flex-row items-center gap-3">
                <View className="w-9 h-9 rounded-xl bg-cyan-500/20 items-center justify-center">
                  <Ionicons name="document-text-outline" size={18} color="#00F0FF" />
                </View>
                <Text className="text-sm text-white">我的订单</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <Text className="text-xs text-gray-500">{userStats.totalOrders} 单</Text>
                <Ionicons name="chevron-forward" size={16} color="#4B5563" />
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity
              className="flex-row items-center justify-between px-4 py-4 border-b border-gray-800"
              onPress={() => router.push('/trading')}
            >
              <View className="flex-row items-center gap-3">
                <View className="w-9 h-9 rounded-xl bg-purple-500/20 items-center justify-center">
                  <Ionicons name="wallet-outline" size={18} color="#A855F7" />
                </View>
                <Text className="text-sm text-white">我的持仓</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#4B5563" />
            </TouchableOpacity>
            
            <TouchableOpacity
              className="flex-row items-center justify-between px-4 py-4 border-b border-gray-800"
              onPress={() => router.push('/copytrading')}
            >
              <View className="flex-row items-center gap-3">
                <View className="w-9 h-9 rounded-xl bg-yellow-500/20 items-center justify-center">
                  <Ionicons name="people-outline" size={18} color="#F59E0B" />
                </View>
                <Text className="text-sm text-white">我的跟单</Text>
              </View>
              <View className="flex-row items-center gap-2">
                {userStats.totalFollowers > 0 && (
                  <View className="bg-green-500/20 px-2 py-0.5 rounded">
                    <Text className="text-xs text-green-400">{userStats.totalFollowers} 个</Text>
                  </View>
                )}
                <Ionicons name="chevron-forward" size={16} color="#4B5563" />
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity
              className="flex-row items-center justify-between px-4 py-4"
              onPress={() => router.push('/follow')}
            >
              <View className="flex-row items-center gap-3">
                <View className="w-9 h-9 rounded-xl bg-green-500/20 items-center justify-center">
                  <Ionicons name="star-outline" size={18} color="#10B981" />
                </View>
                <Text className="text-sm text-white">我的自选</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#4B5563" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Web3 特有功能 */}
        <View className="px-5 mb-5">
          <Text className="text-xs text-gray-500 mb-2 px-1">Web3 功能</Text>
          <View className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
            <TouchableOpacity
              className="flex-row items-center justify-between px-4 py-4 border-b border-gray-800"
              onPress={() => router.push('/kyc')}
            >
              <View className="flex-row items-center gap-3">
                <Ionicons name="shield-checkmark" size={20} color="#10B981" />
                <Text className="text-sm text-white">KYC 实名认证</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <View className="bg-yellow-500/20 px-2 py-0.5 rounded">
                  <Text className="text-xs text-yellow-400">可选</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#4B5563" />
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity
              className="flex-row items-center justify-between px-4 py-4 border-b border-gray-800"
              onPress={() => router.push('/support')}
            >
              <View className="flex-row items-center gap-3">
                <Ionicons name="help-buoy" size={20} color="#8B5CF6" />
                <Text className="text-sm text-white">Web3 帮助</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#4B5563" />
            </TouchableOpacity>
            
            <TouchableOpacity
              className="flex-row items-center justify-between px-4 py-4 border-b border-gray-800"
              onPress={() => Alert.alert('Gas 提醒', 'Gas 价格低时自动提醒')}
            >
              <View className="flex-row items-center gap-3">
                <Ionicons name="flame-outline" size={20} color="#F97316" />
                <Text className="text-sm text-white">Gas 提醒</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <View className="bg-gray-700 px-2 py-0.5 rounded">
                  <Text className="text-xs text-gray-400">未开启</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#4B5563" />
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity
              className="flex-row items-center justify-between px-4 py-4"
              onPress={() => Alert.alert('NFT 藏品', '查看您的 NFT 藏品')}
            >
              <View className="flex-row items-center gap-3">
                <Ionicons name="image-outline" size={20} color="#EC4899" />
                <Text className="text-sm text-white">NFT 藏品</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <Text className="text-xs text-gray-500">{userStats.nftCount} 个</Text>
                <Ionicons name="chevron-forward" size={16} color="#4B5563" />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* 设置菜单 */}
        <View className="px-5 mb-5">
          <Text className="text-xs text-gray-500 mb-2 px-1">设置</Text>
          <View className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
            {MENU_ITEMS.map((item, index) => (
              <TouchableOpacity
                key={item.label}
                className="flex-row items-center justify-between px-4 py-4"
                onPress={() => item.path && router.push(item.path)}
                style={index < MENU_ITEMS.length - 1 ? {
                  borderBottomWidth: 1,
                  borderBottomColor: '#1F2937'
                } : undefined}
              >
                <View className="flex-row items-center gap-3">
                  <Ionicons name={item.icon as any} size={20} color={item.color} />
                  <Text className="text-sm text-white">{item.label}</Text>
                </View>
                <View className="flex-row items-center gap-2">
                  {item.badge ? (
                    <Text className="text-xs text-gray-500">{item.badge}</Text>
                  ) : null}
                  <Ionicons name="chevron-forward" size={16} color="#4B5563" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* App Version */}
        <View className="items-center pb-8">
          <Text className="text-xs text-gray-600">KAIROS DAPP v1.0.0</Text>
          <Text className="text-xs text-gray-700 mt-1">Powered by Ethereum</Text>
        </View>
      </ScrollView>
    </Screen>
  );
}
