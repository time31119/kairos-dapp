import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Screen } from '@/components/Screen';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { Ionicons, FontAwesome6 } from '@expo/vector-icons';

// 钱包连接状态
const WalletStatus = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
};

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

  // 连接 TP 钱包
  const handleConnectWallet = async () => {
    try {
      setWalletStatus(WalletStatus.CONNECTING);
      // 模拟 TP 钱包连接
      await new Promise(resolve => setTimeout(resolve, 1500));
      setWalletAddress('0x1234...5678');
      setWalletStatus(WalletStatus.CONNECTED);
    } catch (error) {
      console.error('Wallet connection failed:', error);
      setWalletStatus(WalletStatus.DISCONNECTED);
    }
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
            onPress={handleConnectWallet}
            disabled={walletStatus === WalletStatus.CONNECTED}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <View 
                  className="w-12 h-12 rounded-full items-center justify-center"
                  style={{ backgroundColor: 'rgba(0, 240, 255, 0.1)' }}
                >
                  <Ionicons name="wallet" size={24} color="#00F0FF" />
                </View>
                <View>
                  {walletStatus === WalletStatus.CONNECTED ? (
                    <>
                      <Text className="text-sm font-medium" style={{ color: '#FFFFFF' }}>
                        {walletAddress}
                      </Text>
                      <Text className="text-xs" style={{ color: '#00F0FF' }}>已连接</Text>
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
              {walletStatus !== WalletStatus.CONNECTED && (
                <View 
                  className="px-3 py-1.5 rounded-full"
                  style={{ backgroundColor: 'rgba(0, 240, 255, 0.1)' }}
                >
                  <Text className="text-xs font-medium" style={{ color: '#00F0FF' }}>连接</Text>
                </View>
              )}
            </View>
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
                <Text className="text-xs" style={{ color: '#FFFFFF' }}>一键跟单</Text>
              </View>
            </TouchableOpacity>

            {/* K线分析 */}
            <TouchableOpacity
              className="items-center mb-4"
              style={{ width: '31%' }}
              onPress={() => router.push('/analysis')}
            >
              <View 
                className="w-full rounded-xl p-3 items-center"
                style={{ backgroundColor: '#0A0A0F', borderWidth: 1, borderColor: '#1F1F2E' }}
              >
                <View 
                  className="w-10 h-10 rounded-full items-center justify-center mb-2"
                  style={{ backgroundColor: 'rgba(0, 240, 255, 0.1)' }}
                >
                  <Ionicons name="analytics" size={18} color="#00F0FF" />
                </View>
                <Text className="text-xs" style={{ color: '#FFFFFF' }}>K线分析</Text>
              </View>
            </TouchableOpacity>

            {/* 热门赛道 */}
            <TouchableOpacity
              className="items-center mb-4"
              style={{ width: '31%' }}
              onPress={() => router.push('/categories')}
            >
              <View 
                className="w-full rounded-xl p-3 items-center"
                style={{ backgroundColor: '#0A0A0F', borderWidth: 1, borderColor: '#1F1F2E' }}
              >
                <View 
                  className="w-10 h-10 rounded-full items-center justify-center mb-2"
                  style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}
                >
                  <Ionicons name="trending-up" size={18} color="#10B981" />
                </View>
                <Text className="text-xs" style={{ color: '#FFFFFF' }}>热门赛道</Text>
              </View>
            </TouchableOpacity>

            {/* 币币兑换 */}
            <TouchableOpacity
              className="items-center mb-4"
              style={{ width: '31%' }}
              onPress={() => router.push('/swap')}
            >
              <View 
                className="w-full rounded-xl p-3 items-center"
                style={{ backgroundColor: '#0A0A0F', borderWidth: 1, borderColor: '#1F1F2E' }}
              >
                <View 
                  className="w-10 h-10 rounded-full items-center justify-center mb-2"
                  style={{ backgroundColor: 'rgba(191, 0, 255, 0.1)' }}
                >
                  <Ionicons name="swap-horizontal" size={18} color="#BF00FF" />
                </View>
                <Text className="text-xs" style={{ color: '#FFFFFF' }}>币币兑换</Text>
              </View>
            </TouchableOpacity>

            {/* 我的持仓 */}
            <TouchableOpacity
              className="items-center mb-4"
              style={{ width: '31%' }}
              onPress={() => router.push('/trading')}
            >
              <View 
                className="w-full rounded-xl p-3 items-center"
                style={{ backgroundColor: '#0A0A0F', borderWidth: 1, borderColor: '#1F1F2E' }}
              >
                <View 
                  className="w-10 h-10 rounded-full items-center justify-center mb-2"
                  style={{ backgroundColor: 'rgba(0, 240, 255, 0.1)' }}
                >
                  <Ionicons name="document-text" size={18} color="#00F0FF" />
                </View>
                <Text className="text-xs" style={{ color: '#FFFFFF' }}>我的持仓</Text>
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
