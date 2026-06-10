'use client';

import { Screen } from '@/components/Screen';
import { Text, View, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useSafeRouter } from '@/hooks/useSafeRouter';

const SETTING_GROUPS = [
  {
    title: '通知设置',
    items: [
      { icon: 'notifications-outline', label: '价格提醒', type: 'switch', value: true, color: '#EF4444' },
      { icon: 'trending-up-outline', label: '行情快讯', type: 'switch', value: true, color: '#10B981' },
      { icon: 'megaphone-outline', label: '活动推送', type: 'switch', value: false, color: '#F59E0B' },
      { icon: 'shield-outline', label: '系统通知', type: 'switch', value: true, color: '#3B82F6' },
    ],
  },
  {
    title: '显示设置',
    items: [
      { icon: 'moon-outline', label: '深色模式', type: 'switch', value: true, color: '#8B5CF6' },
      { icon: 'text-outline', label: '字体大小', type: 'value', value: '标准', color: '#6366F1' },
      { icon: 'grid-outline', label: '首页布局', type: 'value', value: '卡片', color: '#EC4899' },
    ],
  },
  {
    title: '账号安全',
    items: [
      { icon: 'lock-closed-outline', label: '登录密码', type: 'arrow', color: '#F59E0B' },
      { icon: 'phone-portrait-outline', label: '手机绑定', type: 'arrow', color: '#10B981' },
      { icon: 'mail-outline', label: '邮箱绑定', type: 'arrow', color: '#3B82F6' },
      { icon: 'finger-print-outline', label: '生物识别', type: 'switch', value: false, color: '#8B5CF6' },
    ],
  },
];

export default function SettingsScreen() {
  const router = useSafeRouter();

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {/* Header */}
        <View className="px-5 pt-3 pb-4">
          <Text className="text-2xl font-bold text-white">设置</Text>
        </View>

        {/* Settings Groups */}
        {SETTING_GROUPS.map((group, groupIndex) => (
          <View key={group.title} className="px-5 mb-5">
            <Text className="text-xs text-gray-500 uppercase mb-2 ml-1">{group.title}</Text>
            <View className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
              {group.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={item.label}
                  className="flex-row items-center justify-between px-4 py-4"
                  style={itemIndex < group.items.length - 1 ? {
                    borderBottomWidth: 1,
                    borderBottomColor: '#1F2937'
                  } : undefined}
                >
                  <View className="flex-row items-center gap-3 flex-1">
                    <View 
                      className="w-9 h-9 rounded-xl items-center justify-center"
                      style={{ backgroundColor: `${item.color}20` }}
                    >
                      <Ionicons name={item.icon as any} size={18} color={item.color} />
                    </View>
                    <Text className="text-sm text-white">{item.label}</Text>
                  </View>
                  
                  {item.type === 'switch' && (
                    <Switch
                      value={item.value as boolean}
                      trackColor={{ false: '#374151', true: '#00F0FF50' }}
                      thumbColor={item.value ? '#00F0FF' : '#9CA3AF'}
                    />
                  )}
                  
                  {item.type === 'value' && (
                    <View className="flex-row items-center gap-1">
                      <Text className="text-sm text-gray-500">{(item.value as string)}</Text>
                      <Ionicons name="chevron-forward" size={16} color="#4B5563" />
                    </View>
                  )}
                  
                  {item.type === 'arrow' && (
                    <Ionicons name="chevron-forward" size={16} color="#4B5563" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Cache & Data */}
        <View className="px-5 mb-5">
          <Text className="text-xs text-gray-500 uppercase mb-2 ml-1">数据管理</Text>
          <View className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
            <TouchableOpacity className="flex-row items-center justify-between px-4 py-4 border-b border-gray-800">
              <View className="flex-row items-center gap-3">
                <View className="w-9 h-9 rounded-xl items-center justify-center bg-orange-500/20">
                  <MaterialIcons name="delete-sweep" size={18} color="#F59E0B" />
                </View>
                <Text className="text-sm text-white">清理缓存</Text>
              </View>
              <View className="flex-row items-center gap-1">
                <Text className="text-sm text-gray-500">23.5 MB</Text>
                <Ionicons name="chevron-forward" size={16} color="#4B5563" />
              </View>
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center justify-between px-4 py-4">
              <View className="flex-row items-center gap-3">
                <View className="w-9 h-9 rounded-xl items-center justify-center bg-blue-500/20">
                  <Ionicons name="cloud-download-outline" size={18} color="#3B82F6" />
                </View>
                <Text className="text-sm text-white">检查更新</Text>
              </View>
              <View className="flex-row items-center gap-1">
                <Text className="text-sm text-gray-500">已是最新</Text>
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout */}
        <View className="px-5 mb-8">
          <TouchableOpacity className="bg-red-500/20 rounded-2xl py-4 items-center border border-red-500/30">
            <Text className="text-red-400 font-semibold">退出登录</Text>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <View className="items-center pb-8">
          <Text className="text-xs text-gray-600">KAIROS v1.0.0</Text>
        </View>
      </ScrollView>
    </Screen>
  );
}
