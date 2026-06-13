'use client';

import { Screen } from '@/components/Screen';
import { Text, View, StyleSheet, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ABOUT_ITEMS = [
  { icon: 'document-text-outline', label: '用户协议', value: '' },
  { icon: 'shield-checkmark-outline', label: '隐私政策', value: '' },
  { icon: 'receipt-outline', label: '费率说明', value: '' },
  { icon: 'information-circle-outline', label: '关于我们', value: '' },
];

export default function AboutScreen() {
  const handleContact = () => {
    Linking.openURL('mailto:support@dapp.app');
  };

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-5 pt-3 pb-4">
          <Text className="text-2xl font-bold text-white">关于我们</Text>
        </View>

        {/* App Info */}
        <View className="items-center py-8">
          <View className="w-20 h-20 rounded-3xl bg-gradient-to-br from-cyan-500 to-purple-600 items-center justify-center mb-4 shadow-lg shadow-cyan-500/30">
            <Ionicons name="flash" size={40} color="white" />
          </View>
          <Text className="text-2xl font-bold text-white mb-1">KAIROS</Text>
          <Text className="text-sm text-gray-500">行情筛选器 v1.0.0</Text>
        </View>

        {/* About Links */}
        <View className="px-5 mb-5">
          <View className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
            {ABOUT_ITEMS.map((item, index) => (
              <TouchableOpacity
                key={item.label}
                className="flex-row items-center justify-between px-4 py-4"
                style={index < ABOUT_ITEMS.length - 1 ? {
                  borderBottomWidth: 1,
                  borderBottomColor: '#1F2937'
                } : undefined}
              >
                <View className="flex-row items-center gap-3">
                  <Ionicons name={item.icon as any} size={20} color="#00F0FF" />
                  <Text className="text-sm text-white">{item.label}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#4B5563" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Contact */}
        <View className="px-5 mb-5">
          <Text className="text-xs text-gray-500 uppercase mb-2 ml-1">联系我们</Text>
          <View className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
            <TouchableOpacity className="flex-row items-center justify-between px-4 py-4 border-b border-gray-800">
              <View className="flex-row items-center gap-3">
                <Ionicons name="mail-outline" size={20} color="#10B981" />
                <Text className="text-sm text-white">邮箱</Text>
              </View>
              <Text className="text-sm text-gray-400">support@dapp.app</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center justify-between px-4 py-4 border-b border-gray-800">
              <View className="flex-row items-center gap-3">
                <Ionicons name="logo-twitter" size={20} color="#3B82F6" />
                <Text className="text-sm text-white">Twitter</Text>
              </View>
              <Text className="text-sm text-gray-400">@dapp_app</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center justify-between px-4 py-4">
              <View className="flex-row items-center gap-3">
                <Ionicons name="logo-discord" size={20} color="#8B5CF6" />
                <Text className="text-sm text-white">Discord</Text>
              </View>
              <Text className="text-sm text-gray-400">KAIROS Community</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Disclaimer */}
        <View className="mx-5 p-4 bg-gray-900/50 rounded-2xl border border-gray-800 mb-8">
          <Text className="text-xs text-gray-500 leading-5 text-center">
            本DAPP仅提供行情数据和分析工具，不构成任何投资建议。
            加密货币投资存在风险，请谨慎决策。
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}
