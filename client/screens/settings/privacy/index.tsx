'use client';

import { Screen } from '@/components/Screen';
import { Text, View, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PRIVACY_ITEMS = [
  { label: '允许陌生人查看我的自选', value: true },
  { label: '允许陌生人查看我的跟单', value: false },
  { label: '显示我的交易记录', value: true },
  { label: '接收好友申请', value: true },
];

export default function PrivacyScreen() {
  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-5 pt-3 pb-4">
          <Text className="text-2xl font-bold text-white">隐私设置</Text>
        </View>

        {/* Privacy Items */}
        <View className="px-5 mb-5">
          <Text className="text-xs text-gray-500 uppercase mb-2 ml-1">可见性设置</Text>
          <View className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
            {PRIVACY_ITEMS.map((item, index) => (
              <View
                key={item.label}
                className="flex-row items-center justify-between px-4 py-4"
                style={index < PRIVACY_ITEMS.length - 1 ? {
                  borderBottomWidth: 1,
                  borderBottomColor: '#1F2937'
                } : undefined}
              >
                <Text className="text-sm text-white flex-1">{item.label}</Text>
                <Switch
                  value={item.value}
                  trackColor={{ false: '#374151', true: '#00F0FF50' }}
                  thumbColor={item.value ? '#00F0FF' : '#9CA3AF'}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Account Data */}
        <View className="px-5 mb-5">
          <Text className="text-xs text-gray-500 uppercase mb-2 ml-1">账号数据</Text>
          <View className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
            <TouchableOpacity className="flex-row items-center justify-between px-4 py-4 border-b border-gray-800">
              <Text className="text-sm text-white">导出账号数据</Text>
              <Ionicons name="chevron-forward" size={16} color="#4B5563" />
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center justify-between px-4 py-4 border-b border-gray-800">
              <Text className="text-sm text-white">下载交易记录</Text>
              <Ionicons name="chevron-forward" size={16} color="#4B5563" />
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center justify-between px-4 py-4">
              <Text className="text-sm text-red-400">删除账号</Text>
              <Ionicons name="chevron-forward" size={16} color="#4B5563" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Warning */}
        <View className="mx-5 p-4 bg-red-500/10 rounded-2xl border border-red-500/30 mb-8">
          <View className="flex-row gap-3">
            <Ionicons name="warning" size={20} color="#EF4444" />
            <View className="flex-1">
              <Text className="text-sm text-red-400 font-medium mb-1">删除账号</Text>
              <Text className="text-xs text-gray-400 leading-5">
                删除账号将永久清除您的所有数据，包括交易记录、跟单信息、自选列表等。此操作不可恢复，请谨慎操作。
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}
