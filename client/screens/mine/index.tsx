'use client';

import { Screen } from '@/components/Screen';
import { Text, View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons, FontAwesome6 } from '@expo/vector-icons';

const MENU_ITEMS = [
  { icon: 'settings-outline', label: '设置', color: '#9CA3AF' },
  { icon: 'notifications-outline', label: '通知', color: '#9CA3AF' },
  { icon: 'shield-outline', label: '隐私', color: '#9CA3AF' },
  { icon: 'help-circle-outline', label: '帮助', color: '#9CA3AF' },
  { icon: 'information-circle-outline', label: '关于', color: '#9CA3AF' },
];

export default function MineScreen() {
  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-5 pt-3 pb-6">
          <Text className="text-xl font-bold text-white">我的</Text>
        </View>

        {/* Profile Card */}
        <View className="mx-5 mb-6">
          <View className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-5 border border-gray-800">
            {/* Not Logged In State */}
            <View className="items-center py-4">
              <View className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 items-center justify-center mb-4">
                <FontAwesome6 name="user" size={32} color="#6B7280" />
              </View>
              <Text className="text-lg font-semibold text-white mb-1">登录 KAIROS</Text>
              <Text className="text-sm text-gray-500 mb-4">
                登录后解锁更多功能
              </Text>
              
              {/* VIP Badge Preview */}
              <View className="flex-row items-center gap-2 bg-gray-800/50 px-4 py-2 rounded-full">
                <Ionicons name="diamond" size={16} color="#FFD700" />
                <Text className="text-sm text-yellow-400 font-medium">开通会员</Text>
              </View>
            </View>
          </View>
        </View>

        {/* VIP Benefits Preview */}
        <View className="px-5 mb-6">
          <View className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-2xl p-4 border border-yellow-500/20">
            <View className="flex-row items-center gap-3 mb-3">
              <Ionicons name="ribbon" size={24} color="#FFD700" />
              <View>
                <Text className="text-sm font-semibold text-yellow-400">KAIROS 会员</Text>
                <Text className="text-xs text-gray-500">解锁全部高级功能</Text>
              </View>
            </View>
            
            <View className="grid grid-cols-2 gap-2">
              {[
                '全量代币筛选',
                '自定义筛选条件',
                '实时价格提醒',
                '历史数据查询',
              ].map((item, i) => (
                <View key={i} className="flex-row items-center gap-2">
                  <Ionicons name="checkmark-circle" size={14} color="#FFD700" />
                  <Text className="text-xs text-gray-400">{item}</Text>
                </View>
              ))}
            </View>
            
            <TouchableOpacity className="mt-4 bg-yellow-500 rounded-xl py-3 items-center">
              <Text className="text-sm font-semibold text-black">立即开通</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Menu Items */}
        <View className="px-5 mb-8">
          <View className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
            {MENU_ITEMS.map((item, index) => (
              <TouchableOpacity
                key={item.label}
                className="flex-row items-center justify-between px-4 py-4"
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
