'use client';

/**
 * 我的页面 - KAIROS DAPP 版本
 * 暗黑科技风格，优化布局和功能
 */
import { Screen } from '@/components/Screen';
import { Text, View, TouchableOpacity, ScrollView, Alert, RefreshControl } from 'react-native';
import { Ionicons, FontAwesome6 } from '@expo/vector-icons';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { useWeb3 } from '@/contexts/Web3Context';
import { useState, useEffect, useCallback } from 'react';

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
  totalProfit: number;
  winRate: number;
  vipLevel: number;
  isVip: boolean;
}

const MENU_ITEMS = [
  { icon: 'settings-outline', label: '设置', color: '#6B7280', path: '/settings' },
  { icon: 'shield-outline', label: '隐私设置', color: '#6B7280', path: '/settings/privacy' },
  { icon: 'key-outline', label: '安全中心', color: '#6B7280', path: '/settings/security' },
  { icon: 'language-outline', label: '语言', color: '#6B7280', badge: '简体中文' },
  { icon: 'help-circle-outline', label: '帮助中心', color: '#6B7280', path: '/support' },
  { icon: 'document-text-outline', label: '用户协议', color: '#6B7280', path: '/settings/terms' },
  { icon: 'information-circle-outline', label: '关于我们', color: '#6B7280', path: '/settings/about' },
];

export default function MineScreen() {
  const router = useSafeRouter();
  const { wallet, connect, disconnect, switchChain } = useWeb3();
  const [refreshing, setRefreshing] = useState(false);
  const [showAddress, setShowAddress] = useState(false);
  
  const [userStats] = useState<UserStats>({
    totalOrders: 0,
    totalProfit: 0,
    winRate: 0,
    vipLevel: 0,
    isVip: false,
  });

  useEffect(() => {
    if (wallet.isConnected) {
      // 模拟用户数据
    }
  }, [wallet.isConnected, wallet.address]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
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
      case 'ethereum': return 'ETH';
      case 'sepolia': return 'Sepolia';
      case 'polygon': return 'MATIC';
      case 'bsc': return 'BSC';
      case 'arbitrum': return 'ARB';
      case 'optimism': return 'OP';
      default: return '未知网络';
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

        {/* Profile Card */}
        <View className="mx-5 mb-5">
          <TouchableOpacity 
            style={{
              backgroundColor: '#0A0A0F',
              borderRadius: 20,
              padding: 20,
              borderWidth: 1,
              borderColor: '#1F1F2E',
            }}
            onPress={wallet.isConnected ? copyAddress : handleLogin}
          >
            {wallet.isConnected ? (
              <View>
                {/* 用户信息行 */}
                <View className="flex-row items-center gap-4 mb-4">
                  {/* 钱包头像 */}
                  <View 
                    className="w-14 h-14 rounded-full items-center justify-center"
                    style={{
                      backgroundColor: '#1A1A22',
                      borderWidth: 2,
                      borderColor: '#00F0FF',
                    }}
                  >
                    <FontAwesome6 name="wallet" size={22} color="#00F0FF" />
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2">
                      <Text className="text-lg font-semibold text-white">Web3 用户</Text>
                      <View 
                        className="px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: '#1A1A22', borderWidth: 1, borderColor: '#00F0FF' }}
                      >
                        <Text className="text-xs" style={{ color: '#00F0FF' }}>活跃</Text>
                      </View>
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
                  style={{ backgroundColor: '#00F0FF' }}
                  onPress={handleLogin}
                >
                  <Text className="text-sm font-bold" style={{ color: '#0A0A0F' }}>连接钱包</Text>
                </TouchableOpacity>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* VIP Banner */}
        <View className="px-5 mb-5">
          <TouchableOpacity 
            className="rounded-2xl p-4 flex-row items-center justify-between"
            style={{ 
              backgroundColor: 'linear-gradient(135deg, #1A1A22 0%, #0A0A0F 100%)',
              borderWidth: 1,
              borderColor: '#FFD700',
            }}
            onPress={() => router.push('/vip/membership')}
          >
            <View className="flex-row items-center gap-3">
              <View 
                className="w-12 h-12 rounded-xl items-center justify-center"
                style={{ backgroundColor: '#1A1A22' }}
              >
                <FontAwesome6 name="crown" size={24} color="#FFD700" />
              </View>
              <View>
                <Text className="text-sm font-semibold text-white">开通 VIP 会员</Text>
                <Text className="text-xs mt-0.5" style={{ color: '#6B7280' }}>解锁高级功能 & 专属跟单</Text>
              </View>
            </View>
            <View className="flex-row items-center gap-2">
              <Text className="text-xs" style={{ color: '#FFD700' }}>最低 $99/月</Text>
              <Ionicons name="chevron-forward" size={16} color="#FFD700" />
            </View>
          </TouchableOpacity>
        </View>

        {/* 交易功能入口 */}
        <View className="px-5 mb-5">
          <Text className="text-xs mb-2 px-1 uppercase tracking-wider" style={{ color: '#00F0FF' }}>交易功能</Text>
          <View 
            className="rounded-2xl overflow-hidden"
            style={{ backgroundColor: '#0A0A0F', borderWidth: 1, borderColor: '#1F1F2E' }}
          >
            {/* 一键跟单 */}
            <TouchableOpacity
              className="flex-row items-center justify-between px-4 py-4"
              style={{ borderBottomWidth: 1, borderBottomColor: '#1F1F2E' }}
              onPress={() => router.push('/vip')}
            >
              <View className="flex-row items-center gap-3">
                <View 
                  className="w-10 h-10 rounded-xl items-center justify-center"
                  style={{ backgroundColor: '#1A1A22', borderWidth: 1, borderColor: '#00FF88' }}
                >
                  <Ionicons name="people" size={18} color="#00FF88" />
                </View>
                <Text className="text-sm" style={{ color: '#FFFFFF' }}>一键跟单</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <View className="px-2 py-0.5 rounded" style={{ backgroundColor: '#1A1A22' }}>
                  <Text className="text-xs" style={{ color: '#00FF88' }}>VIP</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#6B7280" />
              </View>
            </TouchableOpacity>
            
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
              <Ionicons name="chevron-forward" size={16} color="#6B7280" />
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
            
            {/* 我的自选 */}
            <TouchableOpacity
              className="flex-row items-center justify-between px-4 py-4"
              onPress={() => router.push('/search')}
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

        {/* 分析工具入口 */}
        <View className="px-5 mb-5">
          <Text className="text-xs mb-2 px-1 uppercase tracking-wider" style={{ color: '#BF00FF' }}>分析工具</Text>
          <View 
            className="rounded-2xl overflow-hidden"
            style={{ backgroundColor: '#0A0A0F', borderWidth: 1, borderColor: '#1F1F2E' }}
          >
            {/* 币种筛选 */}
            <TouchableOpacity
              className="flex-row items-center justify-between px-4 py-4"
              style={{ borderBottomWidth: 1, borderBottomColor: '#1F1F2E' }}
              onPress={() => router.push('/screener')}
            >
              <View className="flex-row items-center gap-3">
                <View 
                  className="w-10 h-10 rounded-xl items-center justify-center"
                  style={{ backgroundColor: '#1A1A22', borderWidth: 1, borderColor: '#F97316' }}
                >
                  <Ionicons name="filter-outline" size={18} color="#F97316" />
                </View>
                <Text className="text-sm" style={{ color: '#FFFFFF' }}>币种筛选</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#6B7280" />
            </TouchableOpacity>
            
            {/* 热门赛道 */}
            <TouchableOpacity
              className="flex-row items-center justify-between px-4 py-4"
              onPress={() => router.push('/categories')}
            >
              <View className="flex-row items-center gap-3">
                <View 
                  className="w-10 h-10 rounded-xl items-center justify-center"
                  style={{ backgroundColor: '#1A1A22', borderWidth: 1, borderColor: '#8B5CF6' }}
                >
                  <Ionicons name="trending-up-outline" size={18} color="#8B5CF6" />
                </View>
                <Text className="text-sm" style={{ color: '#FFFFFF' }}>热门赛道</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 设置菜单 */}
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
