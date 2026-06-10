'use client';

import { Screen } from '@/components/Screen';
import { Text, View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const NEWS = [
  {
    id: '1',
    title: 'BTC 突破 68000 美元关口',
    source: 'CoinDesk',
    time: '10分钟前',
    tags: ['BTC', '快讯'],
    hot: true,
  },
  {
    id: '2',
    title: '以太坊 ETF 净流入创历史新高',
    source: 'Bloomberg',
    time: '30分钟前',
    tags: ['ETH', 'ETF'],
    hot: false,
  },
  {
    id: '3',
    title: 'Solana 生态 TVL 突破 50 亿美元',
    source: 'DeFiLlama',
    time: '1小时前',
    tags: ['SOL', 'DeFi'],
    hot: false,
  },
  {
    id: '4',
    title: '美联储维持利率不变，加密市场反应平淡',
    source: 'Reuters',
    time: '2小时前',
    tags: ['宏观', '快讯'],
    hot: false,
  },
  {
    id: '5',
    title: 'BlackRock BTC 持有量突破 30 万枚',
    source: '链上数据',
    time: '3小时前',
    tags: ['BTC', '机构'],
    hot: true,
  },
];

export default function NewsScreen() {
  return (
    <Screen>
      {/* Header */}
      <View className="px-5 pt-3 pb-4">
        <Text className="text-xl font-bold text-white">资讯</Text>
        <Text className="text-xs text-gray-500 mt-1">实时行情资讯与市场快讯</Text>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* News List */}
        <View className="space-y-3">
          {NEWS.map((item) => (
            <TouchableOpacity
              key={item.id}
              className="bg-gray-900 rounded-2xl p-4 border border-gray-800"
            >
              <View className="flex-row items-start gap-3">
                <View className="flex-1">
                  {/* Tags & Hot */}
                  <View className="flex-row items-center gap-2 mb-2">
                    {item.hot && (
                      <View className="flex-row items-center gap-1 bg-red-500/20 px-2 py-0.5 rounded">
                        <Ionicons name="flame" size={10} color="#EF4444" />
                        <Text className="text-xs text-red-400 font-medium">热门</Text>
                      </View>
                    )}
                    {item.tags.map((tag) => (
                      <View
                        key={tag}
                        className="bg-gray-800 px-2 py-0.5 rounded"
                      >
                        <Text className="text-xs text-gray-400">{tag}</Text>
                      </View>
                    ))}
                  </View>
                  
                  {/* Title */}
                  <Text className="text-sm font-medium text-white leading-5 mb-2">
                    {item.title}
                  </Text>
                  
                  {/* Source & Time */}
                  <View className="flex-row items-center gap-2">
                    <Text className="text-xs text-gray-500">{item.source}</Text>
                    <Text className="text-gray-700">•</Text>
                    <Text className="text-xs text-gray-500">{item.time}</Text>
                  </View>
                </View>
                
                <Ionicons name="chevron-forward" size={16} color="#4B5563" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Market Summary */}
        <View className="mt-6 mb-4">
          <Text className="text-sm font-semibold text-gray-400 mb-3">市场总览</Text>
          <View className="flex-row gap-3">
            <View className="flex-1 bg-gray-900 rounded-2xl p-4 border border-gray-800">
              <Text className="text-xs text-gray-500 mb-1">总市值</Text>
              <Text className="text-lg font-bold text-white">$2.42T</Text>
              <Text className="text-xs text-cyan-400">+1.23%</Text>
            </View>
            <View className="flex-1 bg-gray-900 rounded-2xl p-4 border border-gray-800">
              <Text className="text-xs text-gray-500 mb-1">24h 成交量</Text>
              <Text className="text-lg font-bold text-white">$98.5B</Text>
              <Text className="text-xs text-gray-400">-0.45%</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}
