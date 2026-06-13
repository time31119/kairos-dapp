'use client';

import { Screen } from '@/components/Screen';
import { Text, View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons, FontAwesome6 } from '@expo/vector-icons';
import { useSafeRouter } from '@/hooks/useSafeRouter';

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

export default function MineScreen() {
  const router = useSafeRouter();

  const isLoggedIn = false; // 模拟未登录状态

  const handleLogin = () => {
    router.push('/auth');
  };

  const handleNotification = () => {
    router.push('/notification');
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

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-5 pt-3 pb-4">
          <Text className="text-2xl font-bold text-white">我的</Text>
        </View>

        {/* Profile Card - Logged In State */}
        <View className="mx-5 mb-5">
          <TouchableOpacity 
            className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-5 border border-gray-800"
            onPress={handleLogin}
          >
            {isLoggedIn ? (
              <View className="flex-row items-center gap-4">
                <View className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 items-center justify-center">
                  <FontAwesome6 name="user" size={24} color="#fff" />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-white">币圈老王</Text>
                  <Text className="text-sm text-gray-400">UID: 88866688</Text>
                </View>
                <View className="flex-row items-center gap-1 bg-yellow-500/20 px-3 py-1 rounded-full">
                  <Ionicons name="diamond" size={14} color="#FFD700" />
                  <Text className="text-xs text-yellow-400 font-medium">VIP</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#4B5563" />
              </View>
            ) : (
              <View className="items-center py-4">
                <View className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-800 to-gray-700 items-center justify-center mb-4">
                  <FontAwesome6 name="user" size={36} color="#6B7280" />
                </View>
                <Text className="text-lg font-semibold text-white mb-1">登录 KAIROS</Text>
                <Text className="text-sm text-gray-500 mb-4">
                  登录后解锁更多功能
                </Text>
                <TouchableOpacity className="bg-cyan-500 rounded-xl px-8 py-2.5">
                  <Text className="text-sm font-semibold text-black">立即登录</Text>
                </TouchableOpacity>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* VIP Banner */}
        <View className="px-5 mb-5">
          <TouchableOpacity 
            className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-2xl p-4 border border-yellow-500/30"
            onPress={() => router.push('/vip')}
          >
            <View className="flex-row items-center gap-3 mb-3">
              <View className="w-10 h-10 rounded-xl bg-yellow-500/20 items-center justify-center">
                <Ionicons name="ribbon" size={22} color="#FFD700" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-yellow-400">KAIROS 会员</Text>
                <Text className="text-xs text-gray-500">解锁全部高级功能</Text>
              </View>
              <View className="bg-yellow-500 px-3 py-1 rounded-full">
                <Text className="text-xs font-bold text-black">开通</Text>
              </View>
            </View>
            
            <View className="flex-row justify-between">
              {['全量代币', '自定义筛选', '实时提醒'].map((item, i) => (
                <View key={i} className="items-center">
                  <Ionicons name="checkmark-circle" size={16} color="#FFD700" />
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
          <Text className="text-xs text-gray-600">KAIROS v1.0.0</Text>
        </View>
      </ScrollView>
    </Screen>
  );
}
