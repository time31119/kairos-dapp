'use client';

import React, { useState } from 'react';
import { Screen } from '@/components/Screen';
import { Text, View, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeRouter } from '@/hooks/useSafeRouter';

const SECURITY_ITEMS = [
  { label: '两步验证 (2FA)', description: '使用Google Authenticator', enabled: false },
  { label: '生物识别登录', description: '指纹/面容识别', enabled: true },
  { label: '登录通知', description: '新设备登录时推送通知', enabled: true },
  { label: '交易密码', description: '大额交易需要密码确认', enabled: false },
];

const ADDRESS_ITEMS = [
  { label: '常用提币地址', description: '管理您的提币地址白名单' },
  { label: '地址簿', description: '保存常用收款地址' },
];

export default function SecurityCenterScreen() {
  const router = useSafeRouter();
  const [items, setItems] = useState(SECURITY_ITEMS);

  const toggleItem = (index: number) => {
    const newItems = [...items];
    newItems[index].enabled = !newItems[index].enabled;
    setItems(newItems);
  };

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-5 pt-3 pb-4 flex-row items-center gap-3">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-white">安全中心</Text>
        </View>

        {/* Security Level */}
        <View className="px-5 mb-5">
          <View className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-white font-medium">安全等级</Text>
              <Text className="text-yellow-400 font-bold">中</Text>
            </View>
            <View className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <View className="h-full bg-yellow-400 rounded-full" style={{ width: '60%' }} />
            </View>
            <Text className="text-xs text-gray-500 mt-2">建议开启两步验证提升账户安全</Text>
          </View>
        </View>

        {/* Security Settings */}
        <View className="px-5 mb-5">
          <Text className="text-xs text-gray-500 uppercase mb-2 ml-1">安全设置</Text>
          <View className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
            {items.map((item, index) => (
              <View
                key={item.label}
                className="flex-row items-center justify-between px-4 py-4"
                style={index < items.length - 1 ? {
                  borderBottomWidth: 1,
                  borderBottomColor: '#1F2937'
                } : undefined}
              >
                <View className="flex-1">
                  <Text className="text-sm text-white">{item.label}</Text>
                  <Text className="text-xs text-gray-500 mt-0.5">{item.description}</Text>
                </View>
                <Switch
                  value={item.enabled}
                  onValueChange={() => toggleItem(index)}
                  trackColor={{ false: '#374151', true: '#00F0FF50' }}
                  thumbColor={item.enabled ? '#00F0FF' : '#9CA3AF'}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Address Management */}
        <View className="px-5 mb-5">
          <Text className="text-xs text-gray-500 uppercase mb-2 ml-1">地址管理</Text>
          <View className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
            {ADDRESS_ITEMS.map((item, index) => (
              <TouchableOpacity
                key={item.label}
                className="flex-row items-center justify-between px-4 py-4"
                style={index < ADDRESS_ITEMS.length - 1 ? {
                  borderBottomWidth: 1,
                  borderBottomColor: '#1F2937'
                } : undefined}
              >
                <View className="flex-1">
                  <Text className="text-sm text-white">{item.label}</Text>
                  <Text className="text-xs text-gray-500 mt-0.5">{item.description}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#4B5563" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Session Management */}
        <View className="px-5 mb-8">
          <Text className="text-xs text-gray-500 uppercase mb-2 ml-1">登录设备</Text>
          <View className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
            <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-800">
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-xl bg-green-500/20 items-center justify-center">
                  <Ionicons name="phone-portrait" size={20} color="#10B981" />
                </View>
                <View>
                  <Text className="text-sm text-white">iPhone 15 Pro</Text>
                  <Text className="text-xs text-gray-500">当前设备 · 北京</Text>
                </View>
              </View>
              <View className="px-2 py-1 rounded" style={{ backgroundColor: '#00FF8820' }}>
                <Text className="text-xs text-green-400">当前</Text>
              </View>
            </View>
            <TouchableOpacity className="flex-row items-center justify-between px-4 py-4">
              <Text className="text-sm text-red-400">退出所有设备</Text>
              <Ionicons name="chevron-forward" size={16} color="#4B5563" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}
