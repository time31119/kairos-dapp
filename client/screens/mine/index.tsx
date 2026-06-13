'use client';

/**
 * 我的页面 - DAPP 版本
 * 支持钱包连接和 Web3 身份
 * 暗黑科技风格全面优化
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
  card: '#0A0A0F',
  cardBorder: '#1F1F2E',
  neonCyan: '#00F0FF',
  neonPurple: '#BF00FF',
  neonGold: '#FFD700',
  text: '#FFFFFF',
  textMuted: '#6B7280',
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
  { icon: 'settings-outline', label: '设置', color: '#6B7280', path: '/settings', badge: '' },
  { icon: 'shield-outline', label: '隐私设置', color: '#6B7280', path: '/settings/privacy', badge: '' },
  { icon: 'key-outline', label: '安全中心', color: '#6B7280', path: '/settings/security', badge: '' },
  { icon: 'language-outline', label: '语言', color: '#6B7280', path: '', badge: '简体中文' },
  { icon: 'help-circle-outline', label: '帮助中心', color: '#6B7280', path: '/support', badge: '' },
  { icon: 'document-text-outline', label: '用户协议', color: '#6B7280', path: '/settings/terms', badge: '' },
  { icon: 'information-circle-outline', label: '关于我们', color: '#6B7280', path: '/settings/about', badge: '' },
];

export default function MineScreen() {
  const router = useSafeRouter();
  const { wallet, connect, disconnect, switchChain } = useWeb3();
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
    if (wallet.isConnected) {
      setUserStats({
        totalOrders: Math.floor(Math.random() * 50),
        totalFollowers: Math.floor(Math.random() * 20),
        totalProfit: (Math.random() * 10 - 5).toFixed(2) as unknown as number,
        vipLevel: Math.floor(Math.random() * 3),
        nftCount: Math.floor(Math.random() * 5),
      });
    }
  }, [wallet.isConnected, wallet.address]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
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
    if (wallet.address) {
      Alert.alert('地址已复制', wallet.address);
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

  const getNetworkName = (id: string | null) => {
    switch (id) {
      case 'ethereum': return 'Ethereum';
      case 'sepolia': return 'Sepolia';
      case 'polygon': return 'Polygon';
      case 'bsc': return 'BSC';
      case 'arbitrum': return 'Arbitrum';
      case 'optimism': return 'Optimism';
      case 'bscTestnet': return 'BSC Testnet';
      default: return 'Unknown';
    }
  };

  const getNetworkColor = (id: string | null) => {
    switch (id) {
      case 'ethereum': return '#627EEA';
      case 'sepolia': return '#F3BA2F';
      case 'polygon': return '#8247E5';
      case 'bsc': return '#F3BA2F';
      case 'arbitrum': return '#28A0F0';
      case 'optimism': return '#FF0420';
      case 'bscTestnet': return '#F3BA2F';
      default: return '#6B7280';
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
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: '#0A0A0F' }}
              onPress={() => router.push('/notification')}
            >
              <Ionicons name="notifications-outline" size={22} color="#fff" />
              <View className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Card - 暗黑科技风格优化 */}
        <View className="mx-5 mb-5">
          <TouchableOpacity 
            style={{
              backgroundColor: '#0A0A0F',
              borderRadius: 20,
              padding: 20,
              borderWidth: 1,
              borderColor: '#1F1F2E',
              shadowColor: '#00F0FF',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.1,
              shadowRadius: 20,
            }}
            onPress={wallet.isConnected ? copyAddress : handleLogin}
          >
            {wallet.isConnected ? (
              <View>
                {/* 用户信息行 */}
                <View className="flex-row items-center gap-4 mb-4">
                  {/* 钱包头像 - 霓虹发光 */}
                  <View 
                    className="w-14 h-14 rounded-full items-center justify-center"
                    style={{
                      backgroundColor: '#1A1A22',
                      borderWidth: 2,
                      borderColor: '#00F0FF',
                      shadowColor: '#00F0FF',
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 0.5,
                      shadowRadius: 10,
                    }}
                  >
                    <FontAwesome6 name="wallet" size={22} color="#00F0FF" />
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2">
                      <Text className="text-lg font-semibold text-white">Web3 用户</Text>
                      {userStats.vipLevel > 0 && (
                        <View 
                          className="px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: '#1A1A22', borderWidth: 1, borderColor: '#FFD700' }}
                        >
                          <Text className="text-xs" style={{ color: '#FFD700' }}>VIP {userStats.vipLevel}</Text>
                        </View>
                      )}
                    </View>
                    <TouchableOpacity onPress={() => setShowAddress(!showAddress)} className="flex-row items-center gap-1 mt-1">
                      <Text className="text-sm" style={{ color: '#6B7280' }}>{formatAddress(wallet.address || '')}</Text>
                      <Ionicons 
                        name={showAddress ? "eye-off-outline" : "eye-outline"} 
                        size={14} 
                        color="#6B7280" 
                      />
                    </TouchableOpacity>
                  </View>
                  {/* 断开按钮 */}
                  <TouchableOpacity 
                    className="px-3 py-1.5 rounded-lg"
                    style={{ backgroundColor: '#1A1A22', borderWidth: 1, borderColor: '#EF4444' }}
                    onPress={handleDisconnect}
                  >
                    <Text className="text-xs" style={{ color: '#EF4444' }}>断开</Text>
                  </TouchableOpacity>
                </View>
                
                {/* 钱包信息 */}
                <View 
                  className="flex-row justify-between rounded-xl p-3"
                  style={{ backgroundColor: '#0D0D14' }}
                >
                  <View className="items-center flex-1">
                    <Text className="text-xs" style={{ color: '#6B7280' }}>余额</Text>
                    <Text className="text-sm font-semibold mt-1" style={{ color: '#00F0FF' }}>{wallet.balance} ETH</Text>
                  </View>
                  <View className="w-px" style={{ backgroundColor: '#1F1F2E' }} />
                  <View className="items-center flex-1">
                    <Text className="text-xs" style={{ color: '#6B7280' }}>网络</Text>
                    <View className="flex-row items-center gap-1 mt-1">
                      <View style={{ backgroundColor: getNetworkColor(wallet.chain) }} className="w-2 h-2 rounded-full" />
                      <Text className="text-sm font-semibold" style={{ color: '#E5E7EB' }}>{getNetworkName(wallet.chain)}</Text>
                    </View>
                  </View>
                  <View className="w-px" style={{ backgroundColor: '#1F1F2E' }} />
                  <View className="items-center flex-1">
                    <Text className="text-xs" style={{ color: '#6B7280' }}>Gas</Text>
                    <Text className="text-sm font-semibold mt-1" style={{ color: '#BF00FF' }}>实时</Text>
                  </View>
                </View>
              </View>
            ) : (
              <View className="items-center py-4">
                <View 
                  className="w-20 h-20 rounded-full items-center justify-center mb-4"
                  style={{ backgroundColor: '#1A1A22' }}
                >
                  <FontAwesome6 name="wallet" size={36} color="#6B7280" />
                </View>
                <Text className="text-lg font-semibold text-white mb-1">连接钱包</Text>
                <Text className="text-sm mb-4 text-center" style={{ color: '#6B7280' }}>
                  连接 Web3 钱包体验完整功能
                </Text>
                <TouchableOpacity 
                  className="px-8 py-2.5 rounded-xl"
                  style={{
                    backgroundColor: '#00F0FF',
                    shadowColor: '#00F0FF',
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.5,
                    shadowRadius: 15,
                  }}
                  onPress={handleLogin}
                >
                  <Text className="text-sm font-bold" style={{ color: '#0A0A0F' }}>连接钱包</Text>
                </TouchableOpacity>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* 用户统计 - 暗黑科技风格 */}
        {wallet.isConnected && (
          <View className="px-5 mb-5">
            <View 
              className="rounded-2xl p-4"
              style={{ 
                backgroundColor: '#0A0A0F',
                borderWidth: 1,
                borderColor: '#1F1F2E',
                shadowColor: '#00F0FF',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.05,
                shadowRadius: 15,
              }}
            >
              <View className="flex-row justify-around">
                <TouchableOpacity 
                  className="items-center flex-1"
                  onPress={() => router.push('/trading')}
                >
                  <Text className="text-xl font-bold" style={{ color: '#00F0FF' }}>{userStats.totalOrders}</Text>
                  <Text className="text-xs mt-1" style={{ color: '#6B7280' }}>订单数</Text>
                </TouchableOpacity>
                <View className="w-px" style={{ backgroundColor: '#1F1F2E' }} />
                <TouchableOpacity 
                  className="items-center flex-1"
                  onPress={() => router.push('/follow')}
                >
                  <Text className="text-xl font-bold" style={{ color: '#BF00FF' }}>{userStats.totalFollowers}</Text>
                  <Text className="text-xs mt-1" style={{ color: '#6B7280' }}>跟单数</Text>
                </TouchableOpacity>
                <View className="w-px" style={{ backgroundColor: '#1F1F2E' }} />
                <View className="items-center flex-1">
                  <Text 
                    className="text-xl font-bold"
                    style={{ color: userStats.totalProfit >= 0 ? '#00FF88' : '#EF4444' }}
                  >
                    {userStats.totalProfit > 0 ? '+' : ''}{userStats.totalProfit}%
                  </Text>
                  <Text className="text-xs mt-1" style={{ color: '#6B7280' }}>收益率</Text>
                </View>
                <View className="w-px" style={{ backgroundColor: '#1F1F2E' }} />
                <View className="items-center flex-1">
                  <Text className="text-xl font-bold" style={{ color: '#FFD700' }}>{userStats.nftCount}</Text>
                  <Text className="text-xs mt-1" style={{ color: '#6B7280' }}>NFT</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* 会员卡片 - 暗黑科技风格 */}
        <View className="px-5 mb-5">
          <TouchableOpacity 
            style={{
              backgroundColor: '#0A0A0F',
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: '#00F0FF',
              shadowColor: '#00F0FF',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.15,
              shadowRadius: 20,
            }}
            onPress={() => router.push('/vip/membership')}
          >
            <View className="flex-row items-center gap-3 mb-3">
              {/* 会员图标 */}
              <View 
                className="w-12 h-12 rounded-xl items-center justify-center"
                style={{
                  backgroundColor: '#1A1A22',
                  borderWidth: 1,
                  borderColor: '#00F0FF',
                }}
              >
                <Ionicons name="diamond" size={24} color="#00F0FF" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold" style={{ color: '#00F0FF' }}>KAIROS DAPP 会员</Text>
                <Text className="text-xs" style={{ color: '#6B7280' }}>解锁链上高级功能</Text>
              </View>
              <View 
                className="px-4 py-2 rounded-full"
                style={{
                  backgroundColor: '#00F0FF',
                  shadowColor: '#00F0FF',
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.5,
                  shadowRadius: 10,
                }}
              >
                <Text className="text-xs font-bold" style={{ color: '#0A0A0F' }}>开通</Text>
              </View>
            </View>
            
            <View className="flex-row justify-between pt-3" style={{ borderTopWidth: 1, borderTopColor: '#1F1F2E' }}>
              {[
                { icon: 'checkmark-circle', label: '链上数据', color: '#00F0FF' },
                { icon: 'checkmark-circle', label: '智能筛选', color: '#BF00FF' },
                { icon: 'checkmark-circle', label: 'Web3 提醒', color: '#FFD700' },
              ].map((item, i) => (
                <View key={i} className="items-center flex-1">
                  <Ionicons name={item.icon as any} size={18} color={item.color} />
                  <Text className="text-xs mt-1" style={{ color: '#E5E7EB' }}>{item.label}</Text>
                </View>
              ))}
            </View>
          </TouchableOpacity>
        </View>

        {/* 用户功能入口 - 统一暗黑风格 */}
        <View className="px-5 mb-5">
          <Text className="text-xs mb-2 px-1 uppercase tracking-wider" style={{ color: '#00F0FF' }}>交易功能</Text>
          <View 
            className="rounded-2xl overflow-hidden"
            style={{ backgroundColor: '#0A0A0F', borderWidth: 1, borderColor: '#1F1F2E' }}
          >
            {/* 我的订单 */}
            <TouchableOpacity
              className="flex-row items-center justify-between px-4 py-4"
              style={{ borderBottomWidth: 1, borderBottomColor: '#1F1F2E' }}
              onPress={() => router.push('/trading')}
            >
              <View className="flex-row items-center gap-3">
                <View 
                  className="w-10 h-10 rounded-xl items-center justify-center"
                  style={{ backgroundColor: '#1A1A22', borderWidth: 1, borderColor: '#00F0FF' }}
                >
                  <Ionicons name="document-text-outline" size={18} color="#00F0FF" />
                </View>
                <Text className="text-sm" style={{ color: '#FFFFFF' }}>我的订单</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <Text className="text-xs" style={{ color: '#6B7280' }}>{userStats.totalOrders} 单</Text>
                <Ionicons name="chevron-forward" size={16} color="#6B7280" />
              </View>
            </TouchableOpacity>
            
            {/* 我的持仓 */}
            <TouchableOpacity
              className="flex-row items-center justify-between px-4 py-4"
              style={{ borderBottomWidth: 1, borderBottomColor: '#1F1F2E' }}
              onPress={() => router.push('/trading')}
            >
              <View className="flex-row items-center gap-3">
                <View 
                  className="w-10 h-10 rounded-xl items-center justify-center"
                  style={{ backgroundColor: '#1A1A22', borderWidth: 1, borderColor: '#BF00FF' }}
                >
                  <Ionicons name="wallet-outline" size={18} color="#BF00FF" />
                </View>
                <Text className="text-sm" style={{ color: '#FFFFFF' }}>我的持仓</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#6B7280" />
            </TouchableOpacity>
            
            {/* 我的跟单 */}
            <TouchableOpacity
              className="flex-row items-center justify-between px-4 py-4"
              style={{ borderBottomWidth: 1, borderBottomColor: '#1F1F2E' }}
              onPress={() => router.push('/copytrading')}
            >
              <View className="flex-row items-center gap-3">
                <View 
                  className="w-10 h-10 rounded-xl items-center justify-center"
                  style={{ backgroundColor: '#1A1A22', borderWidth: 1, borderColor: '#FFD700' }}
                >
                  <Ionicons name="people-outline" size={18} color="#FFD700" />
                </View>
                <Text className="text-sm" style={{ color: '#FFFFFF' }}>我的跟单</Text>
              </View>
              <View className="flex-row items-center gap-2">
                {userStats.totalFollowers > 0 && (
                  <View className="px-2 py-0.5 rounded" style={{ backgroundColor: '#1A1A22' }}>
                    <Text className="text-xs" style={{ color: '#00FF88' }}>{userStats.totalFollowers} 个</Text>
                  </View>
                )}
                <Ionicons name="chevron-forward" size={16} color="#6B7280" />
              </View>
            </TouchableOpacity>
            
            {/* 我的自选 */}
            <TouchableOpacity
              className="flex-row items-center justify-between px-4 py-4"
              onPress={() => router.push('/follow')}
            >
              <View className="flex-row items-center gap-3">
                <View 
                  className="w-10 h-10 rounded-xl items-center justify-center"
                  style={{ backgroundColor: '#1A1A22', borderWidth: 1, borderColor: '#10B981' }}
                >
                  <Ionicons name="star-outline" size={18} color="#10B981" />
                </View>
                <Text className="text-sm" style={{ color: '#FFFFFF' }}>我的自选</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Web3 特有功能 - 统一暗黑风格 */}
        <View className="px-5 mb-5">
          <Text className="text-xs mb-2 px-1 uppercase tracking-wider" style={{ color: '#BF00FF' }}>Web3 功能</Text>
          <View 
            className="rounded-2xl overflow-hidden"
            style={{ backgroundColor: '#0A0A0F', borderWidth: 1, borderColor: '#1F1F2E' }}
          >
            {/* KYC 实名认证 */}
            <TouchableOpacity
              className="flex-row items-center justify-between px-4 py-4"
              style={{ borderBottomWidth: 1, borderBottomColor: '#1F1F2E' }}
              onPress={() => router.push('/kyc')}
            >
              <View className="flex-row items-center gap-3">
                <Ionicons name="shield-checkmark" size={22} color="#10B981" />
                <Text className="text-sm" style={{ color: '#FFFFFF' }}>KYC 实名认证</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <View className="px-2 py-0.5 rounded" style={{ backgroundColor: '#1A1A22' }}>
                  <Text className="text-xs" style={{ color: '#FFD700' }}>可选</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#6B7280" />
              </View>
            </TouchableOpacity>
            
            {/* Web3 帮助 */}
            <TouchableOpacity
              className="flex-row items-center justify-between px-4 py-4"
              style={{ borderBottomWidth: 1, borderBottomColor: '#1F1F2E' }}
              onPress={() => router.push('/support')}
            >
              <View className="flex-row items-center gap-3">
                <Ionicons name="help-buoy" size={22} color="#8B5CF6" />
                <Text className="text-sm" style={{ color: '#FFFFFF' }}>Web3 帮助</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#6B7280" />
            </TouchableOpacity>
            
            {/* Gas 提醒 */}
            <TouchableOpacity
              className="flex-row items-center justify-between px-4 py-4"
              style={{ borderBottomWidth: 1, borderBottomColor: '#1F1F2E' }}
              onPress={() => Alert.alert('Gas 提醒', 'Gas 价格低时自动提醒')}
            >
              <View className="flex-row items-center gap-3">
                <Ionicons name="flame-outline" size={22} color="#F97316" />
                <Text className="text-sm" style={{ color: '#FFFFFF' }}>Gas 提醒</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <View className="px-2 py-0.5 rounded" style={{ backgroundColor: '#1A1A22' }}>
                  <Text className="text-xs" style={{ color: '#6B7280' }}>未开启</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#6B7280" />
              </View>
            </TouchableOpacity>
            
            {/* NFT 藏品 */}
            <TouchableOpacity
              className="flex-row items-center justify-between px-4 py-4"
              onPress={() => Alert.alert('NFT 藏品', '查看您的 NFT 藏品')}
            >
              <View className="flex-row items-center gap-3">
                <Ionicons name="image-outline" size={22} color="#EC4899" />
                <Text className="text-sm" style={{ color: '#FFFFFF' }}>NFT 藏品</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <Text className="text-xs" style={{ color: '#6B7280' }}>{userStats.nftCount} 个</Text>
                <Ionicons name="chevron-forward" size={16} color="#6B7280" />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* 设置菜单 - 统一暗黑风格 */}
        <View className="px-5 mb-5">
          <Text className="text-xs mb-2 px-1 uppercase tracking-wider" style={{ color: '#6B7280' }}>设置</Text>
          <View 
            className="rounded-2xl overflow-hidden"
            style={{ backgroundColor: '#0A0A0F', borderWidth: 1, borderColor: '#1F1F2E' }}
          >
            {MENU_ITEMS.map((item, index) => (
              <TouchableOpacity
                key={item.label}
                className="flex-row items-center justify-between px-4 py-4"
                onPress={() => item.path && router.push(item.path)}
                style={index < MENU_ITEMS.length - 1 ? {
                  borderBottomWidth: 1,
                  borderBottomColor: '#1F1F2E'
                } : undefined}
              >
                <View className="flex-row items-center gap-3">
                  <Ionicons name={item.icon as any} size={20} color={item.color} />
                  <Text className="text-sm" style={{ color: '#FFFFFF' }}>{item.label}</Text>
                </View>
                <View className="flex-row items-center gap-2">
                  {item.badge ? (
                    <Text className="text-xs" style={{ color: '#6B7280' }}>{item.badge}</Text>
                  ) : null}
                  <Ionicons name="chevron-forward" size={16} color="#6B7280" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* App Version */}
        <View className="items-center pb-8">
          <Text className="text-xs" style={{ color: '#6B7280' }}>KAIROS DAPP v1.0.0</Text>
          <Text className="text-xs mt-1" style={{ color: '#4B5563' }}>Powered by Ethereum</Text>
        </View>
      </ScrollView>
    </Screen>
  );
}
