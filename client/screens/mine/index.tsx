'use client';

/**
 * 我的页面 - DAPP 版本
 * 支持钱包连接和 Web3 身份
 */
import { Screen } from '@/components/Screen';
import { Text, View, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons, FontAwesome6 } from '@expo/vector-icons';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { useWeb3 } from '@/contexts/Web3Context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_FEATURES = [
  { icon: 'document-text-outline', label: '我的订单', color: '#00F0FF', badge: '' },
  { icon: 'wallet-outline', label: '我的持仓', color: '#A855F7', badge: '' },
  { icon: 'people-outline', label: '我的跟单', color: '#F59E0B', badge: '' },
  { icon: 'star-outline', label: '我的自选', color: '#10B981', badge: '' },
  { icon: 'chatbox-ellipses-outline', label: '消息通知', color: '#EF4444', badge: '3' },
];

const MENU_ITEMS = [
  { icon: 'settings-outline', label: '设置', color: '#9CA3AF', path: '/settings' },
  { icon: 'shield-outline', label: '隐私', color: '#9CA3AF', path: '/settings/privacy' },
  { icon: 'help-circle-outline', label: '帮助中心', color: '#9CA3AF', path: '/settings/help' },
  { icon: 'information-circle-outline', label: '关于我们', color: '#9CA3AF', path: '/settings/about' },
];

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
};

export default function MineScreen() {
  const router = useSafeRouter();
  const { address, shortAddress, balance, isConnected, connect, disconnect } = useWeb3();

  const handleLogin = () => {
    router.push('/auth');
  };

  const handleFeaturePress = (label: string) => {
    switch (label) {
      case '我的订单':
        router.push('/trading');
        break;
      case '我的持仓':
        router.push('/trading');
        break;
      case '我的跟单':
        router.push('/copytrading');
        break;
      case '我的自选':
        router.push('/follow');
        break;
      case '消息通知':
        router.push('/notification');
        break;
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

  const copyAddress = () => {
    if (address) {
      // 使用剪贴板复制地址
      Alert.alert('地址已复制', address);
    }
  };

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-5 pt-3 pb-4">
          <Text className="text-2xl font-bold text-white">我的</Text>
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
                    <Text className="text-lg font-semibold text-white">Web3 用户</Text>
                    <TouchableOpacity onPress={copyAddress} className="flex-row items-center gap-1 mt-1">
                      <Text className="text-sm text-gray-400">{shortAddress}</Text>
                      <Ionicons name="copy-outline" size={12} color="#6B7280" />
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
                    <Text className="text-sm font-semibold text-purple-400">Ethereum</Text>
                  </View>
                  <View className="w-px bg-gray-800" />
                  <View className="items-center flex-1">
                    <Text className="text-xs text-gray-500 mb-1">状态</Text>
                    <View className="flex-row items-center gap-1">
                      <View className="w-2 h-2 rounded-full bg-green-500" />
                      <Text className="text-sm font-semibold text-green-400">已连接</Text>
                    </View>
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
                <Text className="text-sm text-gray-500 mb-4">
                  连接 Web3 钱包体验完整功能
                </Text>
                <TouchableOpacity 
                  className="bg-cyan-500 rounded-xl px-8 py-2.5"
                  onPress={handleLogin}
                >
                  <Text className="text-sm font-semibold text-black">连接钱包</Text>
                </TouchableOpacity>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Web3 功能提示 */}
        <View className="px-5 mb-5">
          <TouchableOpacity 
            className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-2xl p-4 border border-cyan-500/20"
            onPress={() => router.push('/vip')}
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

        {/* User Features */}
        <View className="px-5 mb-5">
          <View className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
            {USER_FEATURES.map((item, index) => (
              <TouchableOpacity
                key={item.label}
                className="flex-row items-center justify-between px-4 py-4"
                onPress={() => handleFeaturePress(item.label)}
                style={index < USER_FEATURES.length - 1 ? {
                  borderBottomWidth: 1,
                  borderBottomColor: '#1F2937'
                } : undefined}
              >
                <View className="flex-row items-center gap-3">
                  <View 
                    className="w-9 h-9 rounded-xl items-center justify-center"
                    style={{ backgroundColor: `${item.color}20` }}
                  >
                    <Ionicons name={item.icon as any} size={18} color={item.color} />
                  </View>
                  <Text className="text-sm text-white">{item.label}</Text>
                </View>
                <View className="flex-row items-center gap-2">
                  {item.badge ? (
                    <View className="bg-red-500 w-5 h-5 rounded-full items-center justify-center">
                      <Text className="text-xs text-white font-bold">{item.badge}</Text>
                    </View>
                  ) : null}
                  <Ionicons name="chevron-forward" size={16} color="#4B5563" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Web3 相关菜单 */}
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
              className="flex-row items-center justify-between px-4 py-4"
              onPress={() => router.push('/support')}
            >
              <View className="flex-row items-center gap-3">
                <Ionicons name="help-buoy" size={20} color="#8B5CF6" />
                <Text className="text-sm text-white">Web3 帮助</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#4B5563" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Menu Items */}
        <View className="px-5 mb-5">
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
                <Ionicons name="chevron-forward" size={16} color="#4B5563" />
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
