'use client';

import React from 'react';
import { Screen } from '@/components/Screen';
import { Text, View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeRouter } from '@/hooks/useSafeRouter';

export default function TermsScreen() {
  const router = useSafeRouter();

  const chapters = [
    { id: 1, title: '第一章 总则', icon: 'document-text-outline' },
    { id: 2, title: '第二章 服务说明', icon: 'information-circle-outline' },
    { id: 3, title: '第三章 用户注册', icon: 'person-add-outline' },
    { id: 4, title: '第四章 账户安全', icon: 'shield-checkmark-outline' },
    { id: 5, title: '第五章 交易规则', icon: 'swap-horizontal-outline' },
    { id: 6, title: '第六章 费用说明', icon: 'card-outline' },
    { id: 7, title: '第七章 风险提示', icon: 'warning-outline' },
    { id: 8, title: '第八章 隐私保护', icon: 'eye-off-outline' },
    { id: 9, title: '第九章 知识产权', icon: 'bulb-outline' },
    { id: 10, title: '第十章 免责声明', icon: 'shield-outline' },
    { id: 11, title: '第十一章 争议解决', icon: 'gavel-outline' },
    { id: 12, title: '第十二章 其他条款', icon: 'ellipsis-horizontal-outline' },
  ];

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-5 pt-3 pb-4 flex-row items-center gap-3">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-white">用户协议</Text>
        </View>

        {/* Last Update */}
        <View className="px-5 mb-5">
          <View className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
            <View className="flex-row items-center gap-2 mb-2">
              <Ionicons name="time-outline" size={16} color="#6B7280" />
              <Text className="text-xs text-gray-500">最后更新</Text>
            </View>
            <Text className="text-white font-medium">2024年1月15日</Text>
            <Text className="text-xs text-gray-500 mt-1">请在使用我们的服务前仔细阅读本协议</Text>
          </View>
        </View>

        {/* Agreement Content */}
        <View className="px-5 mb-5">
          <Text className="text-xs text-gray-500 uppercase mb-3 ml-1">协议目录</Text>
          <View className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
            {chapters.map((chapter, index) => (
              <TouchableOpacity
                key={chapter.id}
                className="flex-row items-center justify-between px-4 py-4"
                style={index < chapters.length - 1 ? {
                  borderBottomWidth: 1,
                  borderBottomColor: '#1F2937'
                } : undefined}
              >
                <View className="flex-row items-center gap-3">
                  <View className="w-8 h-8 rounded-lg bg-cyan-500/20 items-center justify-center">
                    <Ionicons name={chapter.icon as any} size={16} color="#00F0FF" />
                  </View>
                  <Text className="text-sm text-white">{chapter.title}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#4B5563" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Agreement Summary */}
        <View className="px-5 mb-5">
          <Text className="text-xs text-gray-500 uppercase mb-3 ml-1">协议摘要</Text>
          <View className="space-y-3">
            <View className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
              <Text className="text-white font-medium mb-2">服务范围</Text>
              <Text className="text-xs text-gray-400 leading-5">
                KAIROS 提供加密货币行情分析、跟单交易、技术指标等 services。使用本应用即表示您同意遵守本协议的所有条款。
              </Text>
            </View>
            <View className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
              <Text className="text-white font-medium mb-2">风险披露</Text>
              <Text className="text-xs text-gray-400 leading-5">
                加密货币交易存在重大风险，价格波动可能导致损失。我们不对任何交易损失承担责任，请理性投资。
              </Text>
            </View>
            <View className="bg-yellow-500/10 rounded-2xl p-4 border border-yellow-500/30">
              <View className="flex-row items-center gap-2 mb-2">
                <Ionicons name="warning" size={16} color="#F59E0B" />
                <Text className="text-yellow-400 font-medium">重要提示</Text>
              </View>
              <Text className="text-xs text-gray-400 leading-5">
                开始使用服务前，请确保您已年满18周岁，并充分了解加密货币交易的风险。
              </Text>
            </View>
          </View>
        </View>

        {/* Agreement Full Text Link */}
        <View className="px-5 mb-8">
          <TouchableOpacity className="bg-gray-900 rounded-2xl p-4 border border-gray-800 flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <Ionicons name="document-outline" size={20} color="#00F0FF" />
              <Text className="text-sm text-white">查看完整协议全文</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#4B5563" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Screen>
  );
}
