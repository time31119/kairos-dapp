'use client';

/**
 * 我的页面 - KAIROS DAPP
 * 暗黑科技风格，优化链接到实际存在页面
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

// VIP功能入口 - 只链接到实际存在的页面
const VIP_FUNCTIONS = [
  { icon: 'people', label: '一键跟单', color: '#FFD700', path: '/copytrading', desc: '复制顶尖交易员' },
  { icon: 'chart-line', label: 'K线分析', color: '#00F0FF', path: '/analysis', desc: '专业技术指标' },
  { icon: 'repeat', label: '币币兑换', color: '#BF00FF', path: '/swap', desc: '多链即时兑换' },
  { icon: 'trending-up', label: '热门赛道', color: '#10B981', path: '/categories', desc: '赛道行情分析' },
];

// 交易功能 - 只链接到实际存在的页面
const TRADING_FUNCTIONS = [
  { icon: 'document-text-outline', label: '我的持仓', color: '#00F0FF', path: '/trading', desc: '当前仓位' },
  { icon: 'people-outline', label: '一键跟单', color: '#FFD700', path: '/copytrading', desc: '跟单记录' },
  { icon: 'star-outline', label: '关注列表', color: '#10B981', path: '/categories', desc: '自选代币' },
  { icon: 'repeat-outline', label: '兑换记录', color: '#BF00FF', path: '/swap', desc: '兑换历史' },
];

interface UserStats {
  totalOrders: number;
  totalFollowers: number;
  totalProfit: number;
  vipLevel: number;
}

const UTILITY_ITEMS = [
  { icon: 'shield-outline', label: '安全中心', color: '#00FF88' },
  { icon: 'language-outline', label: '语言设置', color: '#8B5CF6', badge: '简体中文' },
  { icon: 'help-circle-outline', label: '帮助中心', color: '#F97316' },
  { icon: 'document-text-outline', label: '用户协议', color: '#6B7280' },
  { icon: 'information-circle-outline', label: '关于我们', color: '#6B7280' },
];

export default function MineScreen() {
  const router = useSafeRouter();
  const { wallet, connect, disconnect } = useWeb3();
  const [refreshing, setRefreshing] = useState(false);
  const [userStats, setUserStats] = useState<UserStats>({
    totalOrders: 0,
    totalFollowers: 0,
    totalProfit: 0,
    vipLevel: 0,
  });
  const [showAddress, setShowAddress] = useState(false);

  useEffect(() => {
    if (wallet.isConnected) {
      // 模拟真实数据
      setUserStats({
        totalOrders: 12,
        totalFollowers: 5,
        totalProfit: 8.67,
        vipLevel: 1,
      });
    }
  }, [wallet.isConnected, wallet.address]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (wallet.isConnected) {
      setUserStats(prev => ({
        ...prev,
        totalOrders: prev.totalOrders + Math.floor(Math.random() * 3),
        totalProfit: parseFloat((Math.random() * 15 - 5).toFixed(2)),
      }));
    }
    setRefreshing(false);
  }, [wallet.isConnected]);

  const handleConnectWallet = async () => {
    try {
      await connect('trust');
    } catch (error) {
      Alert.alert('连接失败', '请确保已安装 TP 钱包');
    }
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
      case 'polygon': return 'MATIC';
      case 'bsc': return 'BSC';
      case 'arbitrum': return 'ARB';
      case 'optimism': return 'OP';
      case 'tron': return 'TRX';
      default: return 'ETH';
    }
  };

  const getNetworkColor = (id: string | null) => {
    switch (id) {
      case 'ethereum': return '#627EEA';
      case 'polygon': return '#8247E5';
      case 'bsc': return '#F3BA2F';
      case 'arbitrum': return '#28A0F0';
      case 'optimism': return '#FF0420';
      case 'tron': return '#EF0027';
      default: return '#627EEA';
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
            >
              <Ionicons name="notifications-outline" size={22} color="#fff" />
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
            onPress={wallet.isConnected ? copyAddress : handleConnectWallet}
          >
            {wallet.isConnected ? (
              <View>
                {/* 用户信息行 */}
                <View className="flex-row items-center gap-4 mb-4">
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
                      {userStats.vipLevel > 0 && (
                        <TouchableOpacity
                          onPress={() => router.push('/vip')}
                        >
                          <View 
                            className="px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: '#1A1A22', borderWidth: 1, borderColor: '#FFD700' }}
                          >
                            <Text className="text-xs" style={{ color: '#FFD700' }}>VIP {userStats.vipLevel}</Text>
                          </View>
                        </TouchableOpacity>
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
                  <TouchableOpacity className="items-center flex-1" onPress={() => router.push('/vip')}>
                    <Text className="text-xs" style={{ color: '#6B7280' }}>会员</Text>
                    <Text className="text-sm font-semibold mt-1" style={{ color: userStats.vipLevel > 0 ? '#FFD700' : '#6B7280' }}>
                      {userStats.vipLevel > 0 ? `VIP ${userStats.vipLevel}` : '未开通'}
                    </Text>
                  </TouchableOpacity>
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
                  }}
                  onPress={handleConnectWallet}
                >
                  <Text className="text-sm font-bold" style={{ color: '#0A0A0F' }}>连接 TP 钱包</Text>
                </TouchableOpacity>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* 用户统计 */}
        {wallet.isConnected && (
          <View className="px-5 mb-5">
            <View 
              className="rounded-2xl p-4"
              style={{ 
                backgroundColor: '#0A0A0F',
                borderWidth: 1,
                borderColor: '#1F1F2E',
              }}
            >
              <View className="flex-row justify-around">
                <View className="items-center flex-1">
                  <Text className="text-xl font-bold" style={{ color: '#00F0FF' }}>{userStats.totalOrders}</Text>
                  <Text className="text-xs mt-1" style={{ color: '#6B7280' }}>订单数</Text>
                </View>
                <View className="w-px" style={{ backgroundColor: '#1F1F2E' }} />
                <View className="items-center flex-1">
                  <Text className="text-xl font-bold" style={{ color: '#BF00FF' }}>{userStats.totalFollowers}</Text>
                  <Text className="text-xs mt-1" style={{ color: '#6B7280' }}>跟单数</Text>
                </View>
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
              </View>
            </View>
          </View>
        )}

        {/* VIP功能入口 */}
        <View className="px-5 mb-5">
          <View className="flex-row items-center justify-between mb-2 px-1">
            <Text className="text-xs uppercase tracking-wider" style={{ color: '#FFD700' }}>VIP 功能</Text>
            <TouchableOpacity onPress={() => router.push('/vip')}>
              <Text className="text-xs" style={{ color: '#FFD700' }}>全部 &rarr;</Text>
            </TouchableOpacity>
          </View>
          <View 
            className="rounded-2xl p-4"
            style={{ 
              backgroundColor: '#0A0A0F',
              borderWidth: 1,
              borderColor: '#1F1F2E',
            }}
          >
            <View className="flex-row flex-wrap justify-between">
              {VIP_FUNCTIONS.map((item) => (
                <TouchableOpacity
                  key={item.label}
                  className="items-center mb-3"
                  style={{ width: '23%' }}
                  onPress={() => router.push(item.path)}
                >
                  <View 
                    className="w-12 h-12 rounded-2xl items-center justify-center mb-2"
                    style={{ 
                      backgroundColor: '#1A1A22',
                      borderWidth: 1,
                      borderColor: item.color,
                    }}
                  >
                    <FontAwesome6 name={item.icon as any} size={20} color={item.color} />
                  </View>
                  <Text className="text-xs text-center" style={{ color: '#FFFFFF' }}>{item.label}</Text>
                  <Text className="text-xs text-center mt-0.5" style={{ color: '#6B7280' }}>{item.desc}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* 交易功能 */}
        <View className="px-5 mb-5">
          <Text className="text-xs mb-2 px-1 uppercase tracking-wider" style={{ color: '#00F0FF' }}>交易功能</Text>
          <View 
            className="rounded-2xl p-4"
            style={{ 
              backgroundColor: '#0A0A0F',
              borderWidth: 1,
              borderColor: '#1F1F2E',
            }}
          >
            <View className="flex-row flex-wrap justify-between">
              {TRADING_FUNCTIONS.map((item) => (
                <TouchableOpacity
                  key={item.label}
                  className="items-center mb-4"
                  style={{ width: '48%' }}
                  onPress={() => router.push(item.path)}
                >
                  <View 
                    className="w-full rounded-xl p-3 flex-row items-center gap-3"
                    style={{ 
                      backgroundColor: '#1A1A22',
                      borderWidth: 1,
                      borderColor: item.color,
                    }}
                  >
                    <FontAwesome6 name={item.icon as any} size={18} color={item.color} />
                    <View className="flex-1">
                      <Text className="text-sm" style={{ color: '#FFFFFF' }}>{item.label}</Text>
                      <Text className="text-xs" style={{ color: '#6B7280' }}>{item.desc}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color="#6B7280" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* 会员入口 Banner */}
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

        {/* 常用功能 */}
        <View className="px-5 mb-5">
          <Text className="text-xs mb-2 px-1 uppercase tracking-wider" style={{ color: '#6B7280' }}>常用功能</Text>
          <View 
            className="rounded-2xl overflow-hidden"
            style={{ backgroundColor: '#0A0A0F', borderWidth: 1, borderColor: '#1F1F2E' }}
          >
            {UTILITY_ITEMS.map((item, index) => (
              <TouchableOpacity
                key={item.label}
                className="flex-row items-center justify-between px-4 py-4"
                style={index < UTILITY_ITEMS.length - 1 ? {
                  borderBottomWidth: 1,
                  borderBottomColor: '#1F1F2E'
                } : undefined}
              >
                <View className="flex-row items-center gap-3">
                  <Ionicons name={item.icon as any} size={20} color={item.color} />
                  <Text className="text-sm" style={{ color: '#FFFFFF' }}>{item.label}</Text>
                </View>
                <View className="flex-row items-center gap-2">
                  {item.badge && (
                    <Text className="text-xs" style={{ color: '#6B7280' }}>{item.badge}</Text>
                  )}
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
