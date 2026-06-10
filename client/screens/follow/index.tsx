'use client';

import { Screen } from '@/components/Screen';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons, FontAwesome6 } from '@expo/vector-icons';

const FOLLOWED_COINS = [
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', price: 67234.56, change: 2.34 },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', price: 3456.78, change: 1.23 },
  { id: 'solana', symbol: 'SOL', name: 'Solana', price: 234.56, change: -0.87 },
];

export default function FollowScreen() {
  return (
    <Screen>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-3 pb-4">
        <Text className="text-xl font-bold text-white">我的关注</Text>
        <TouchableOpacity className="p-2">
          <Ionicons name="search" size={22} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      {/* Followed Coins */}
      <View className="px-5 flex-1">
        <Text className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
          自选代币 ({FOLLOWED_COINS.length})
        </Text>
        
        <View className="space-y-3">
          {FOLLOWED_COINS.map((coin) => (
            <View
              key={coin.id}
              className="bg-gray-900 rounded-2xl p-4 border border-gray-800"
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                  <View className="w-10 h-10 rounded-full bg-gray-800 items-center justify-center">
                    <Text className="text-xs font-bold text-gray-400">
                      {coin.symbol.slice(0, 2)}
                    </Text>
                  </View>
                  <View>
                    <Text className="text-sm font-semibold text-white">{coin.symbol}</Text>
                    <Text className="text-xs text-gray-500">{coin.name}</Text>
                  </View>
                </View>
                <View className="items-end">
                  <Text className="text-sm font-semibold text-white">
                    ${coin.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Text>
                  <Text className={`text-xs font-medium ${coin.change >= 0 ? 'text-cyan-400' : 'text-purple-400'}`}>
                    {coin.change >= 0 ? '+' : ''}{coin.change}%
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Add Button */}
        <Link href="/screener/1h_up" asChild>
          <TouchableOpacity className="mt-6 flex-row items-center justify-center gap-2 py-4 rounded-2xl border-2 border-dashed border-gray-700">
            <Ionicons name="add-circle-outline" size={22} color="#6B7280" />
            <Text className="text-sm text-gray-500">添加自选</Text>
          </TouchableOpacity>
        </Link>

        {/* Empty State Hint */}
        <View className="mt-12 items-center">
          <Ionicons name="bookmark-outline" size={48} color="#374151" />
          <Text className="text-gray-600 text-sm mt-3 text-center">
            在行情筛选中添加感兴趣的代币{'\n'}以便快速查看
          </Text>
        </View>
      </View>
    </Screen>
  );
}
