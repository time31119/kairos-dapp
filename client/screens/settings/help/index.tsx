'use client';

import { Screen } from '@/components/Screen';
import { Text, View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const FAQ_ITEMS = [
  { icon: 'wallet-outline', question: '如何充值USDT？', answer: '您可以通过交易所购买USDT后转入钱包地址。' },
  { icon: 'swap-horizontal-outline', question: '如何开始跟单交易？', answer: '在一键跟单页面选择交易员，点击跟单按钮设置跟单参数。' },
  { icon: 'analytics-outline', question: '技术指标是如何计算的？', answer: '我们使用标准的TA-Lib指标库进行计算，包括RSI、MACD等。' },
  { icon: 'cash-outline', question: '手续费如何收取？', answer: '跟单交易手续费为盈利的10%，无盈利不收费。' },
  { icon: 'shield-checkmark-outline', question: '如何保障资金安全？', answer: '您的资金由专业托管机构保管，我们无法直接访问您的资产。' },
];

export default function HelpCenterScreen() {
  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-5 pt-3 pb-4">
          <Text className="text-2xl font-bold text-white">帮助中心</Text>
        </View>

        {/* Quick Help */}
        <View className="px-5 mb-5">
          <Text className="text-xs text-gray-500 uppercase mb-3 ml-1">快捷帮助</Text>
          <View className="flex-row gap-3 mb-5">
            <TouchableOpacity className="flex-1 bg-gray-900 rounded-2xl p-4 border border-gray-800 items-center">
              <View className="w-12 h-12 rounded-full bg-cyan-500/20 items-center justify-center mb-2">
                <Ionicons name="chatbubbles-outline" size={24} color="#00F0FF" />
              </View>
              <Text className="text-xs text-gray-300">在线客服</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 bg-gray-900 rounded-2xl p-4 border border-gray-800 items-center">
              <View className="w-12 h-12 rounded-full bg-green-500/20 items-center justify-center mb-2">
                <Ionicons name="videocam-outline" size={24} color="#10B981" />
              </View>
              <Text className="text-xs text-gray-300">视频教程</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 bg-gray-900 rounded-2xl p-4 border border-gray-800 items-center">
              <View className="w-12 h-12 rounded-full bg-purple-500/20 items-center justify-center mb-2">
                <Ionicons name="document-text-outline" size={24} color="#8B5CF6" />
              </View>
              <Text className="text-xs text-gray-300">使用指南</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* FAQ */}
        <View className="px-5 mb-8">
          <Text className="text-xs text-gray-500 uppercase mb-3 ml-1">常见问题</Text>
          <View className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
            {FAQ_ITEMS.map((item, index) => (
              <TouchableOpacity
                key={item.question}
                className="px-4 py-4"
                style={index < FAQ_ITEMS.length - 1 ? {
                  borderBottomWidth: 1,
                  borderBottomColor: '#1F2937'
                } : undefined}
              >
                <View className="flex-row items-center gap-3 mb-2">
                  <View className="w-8 h-8 rounded-lg bg-cyan-500/20 items-center justify-center">
                    <Ionicons name={item.icon as any} size={16} color="#00F0FF" />
                  </View>
                  <Text className="text-sm text-white flex-1">{item.question}</Text>
                  <Ionicons name="chevron-down" size={16} color="#4B5563" />
                </View>
                <Text className="text-xs text-gray-500 leading-5 pl-11">{item.answer}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Contact */}
        <View className="mx-5 p-4 bg-gray-900 rounded-2xl border border-gray-800 mb-8">
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-full bg-orange-500/20 items-center justify-center">
              <Ionicons name="headset" size={20} color="#F59E0B" />
            </View>
            <View className="flex-1">
              <Text className="text-sm text-white font-medium">遇到问题？</Text>
              <Text className="text-xs text-gray-500">我们的客服团队随时为您服务</Text>
            </View>
            <TouchableOpacity className="px-4 py-2 bg-cyan-500 rounded-xl">
              <Text className="text-xs text-black font-semibold">联系客服</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}
