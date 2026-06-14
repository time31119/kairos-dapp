import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  Modal,
  Alert as RNAlert,
} from 'react-native';
import { Screen } from '@/components/Screen';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';

interface PriceAlert {
  id: string;
  symbol: string;
  name: string;
  currentPrice: number;
  targetPrice: number;
  direction: 'up' | 'down';
  status: 'active' | 'triggered';
  createdAt: string;
}

// Mock data
const MOCK_ALERTS: PriceAlert[] = [
  {
    id: '1',
    symbol: 'BTC',
    name: 'Bitcoin',
    currentPrice: 67542.80,
    targetPrice: 70000,
    direction: 'up',
    status: 'active',
    createdAt: '2024-01-15 10:30',
  },
  {
    id: '2',
    symbol: 'ETH',
    name: 'Ethereum',
    currentPrice: 3521.45,
    targetPrice: 3200,
    direction: 'down',
    status: 'active',
    createdAt: '2024-01-14 15:20',
  },
  {
    id: '3',
    symbol: 'SOL',
    name: 'Solana',
    currentPrice: 142.30,
    targetPrice: 150,
    direction: 'up',
    status: 'triggered',
    createdAt: '2024-01-10 09:00',
  },
];

const POPULAR_TOKENS = [
  { symbol: 'BTC', name: 'Bitcoin', price: 67542.80 },
  { symbol: 'ETH', name: 'Ethereum', price: 3521.45 },
  { symbol: 'BNB', name: 'BNB', price: 598.20 },
  { symbol: 'SOL', name: 'Solana', price: 142.30 },
  { symbol: 'XRP', name: 'XRP', price: 0.52 },
  { symbol: 'ADA', name: 'Cardano', price: 0.45 },
];

export default function PriceAlertScreen() {
  const router = useSafeRouter();
  const [alerts, setAlerts] = useState<PriceAlert[]>(MOCK_ALERTS);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedToken, setSelectedToken] = useState<typeof POPULAR_TOKENS[0] | null>(null);
  const [targetPrice, setTargetPrice] = useState('');
  const [direction, setDirection] = useState<'up' | 'down'>('up');

  useFocusEffect(
    useCallback(() => {
      // Fetch alerts from API
    }, [])
  );

  const handleCreateAlert = () => {
    if (!selectedToken || !targetPrice) {
      RNAlert.alert('提示', '请选择代币并设置目标价格');
      return;
    }

    const price = parseFloat(targetPrice);
    if (isNaN(price) || price <= 0) {
      RNAlert.alert('提示', '请输入有效的价格');
      return;
    }

    const newAlert: PriceAlert = {
      id: Date.now().toString(),
      symbol: selectedToken.symbol,
      name: selectedToken.name,
      currentPrice: selectedToken.price,
      targetPrice: price,
      direction,
      status: 'active',
      createdAt: new Date().toLocaleString('zh-CN'),
    };

    setAlerts(prev => [newAlert, ...prev]);
    setModalVisible(false);
    setSelectedToken(null);
    setTargetPrice('');
    RNAlert.alert('成功', '价格提醒已创建');
  };

  const handleDeleteAlert = (id: string) => {
    RNAlert.alert(
      '删除提醒',
      '确定要删除这个价格提醒吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: () => setAlerts(prev => prev.filter(a => a.id !== id)),
        },
      ]
    );
  };

  const renderAlertItem = ({ item }: { item: PriceAlert }) => {
    const percentChange = ((item.targetPrice - item.currentPrice) / item.currentPrice) * 100;
    const isUp = item.direction === 'up';

    return (
      <View
        className={`mx-4 mb-3 p-4 rounded-xl ${item.status === 'triggered' ? 'bg-green-900/30 border border-green-500/30' : 'bg-gray-900 border border-gray-800'}`}
      >
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-cyan-500/20 items-center justify-center mr-3">
              <Text className="text-cyan-400 font-bold text-sm">{item.symbol.slice(0, 2)}</Text>
            </View>
            <View>
              <Text className="text-white font-semibold">{item.name}</Text>
              <Text className="text-gray-500 text-xs">{item.symbol}</Text>
            </View>
          </View>
          <View className="flex-row items-center">
            {item.status === 'triggered' ? (
              <View className="px-2 py-1 rounded-full bg-green-500/20">
                <Text className="text-green-400 text-xs">已触发</Text>
              </View>
            ) : (
              <View className="px-2 py-1 rounded-full bg-cyan-500/20">
                <Text className="text-cyan-400 text-xs">监控中</Text>
              </View>
            )}
            <TouchableOpacity
              onPress={() => handleDeleteAlert(item.id)}
              className="ml-3 p-2"
            >
              <Ionicons name="trash-outline" size={18} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-gray-500 text-xs">当前价格</Text>
            <Text className="text-white text-sm">${item.currentPrice.toLocaleString()}</Text>
          </View>
          <View className="items-center px-4">
            <Ionicons
              name={isUp ? 'arrow-up' : 'arrow-down'}
              size={20}
              color={isUp ? '#00FF88' : '#FF4444'}
            />
            <Text className={`text-xs ${isUp ? 'text-green-400' : 'text-red-400'}`}>
              {percentChange >= 0 ? '+' : ''}{percentChange.toFixed(2)}%
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-gray-500 text-xs">目标价格 ({isUp ? '↑' : '↓'})</Text>
            <Text className={`font-semibold text-sm ${isUp ? 'text-green-400' : 'text-red-400'}`}>
              ${item.targetPrice.toLocaleString()}
            </Text>
          </View>
        </View>

        <Text className="text-gray-600 text-xs mt-3">创建于 {item.createdAt}</Text>
      </View>
    );
  };

  return (
    <Screen>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-3 pb-4">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2 mr-2">
            <Ionicons name="chevron-back" size={24} color="#00F0FF" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-white">价格提醒</Text>
        </View>
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          className="px-4 py-2 rounded-full"
          style={{ backgroundColor: '#00F0FF20' }}
        >
          <Text className="text-cyan-400 font-semibold text-sm">+ 添加提醒</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View className="px-4 mb-4">
        <View className="flex-row">
          <View className="flex-1 mr-2 p-3 rounded-xl bg-gray-900 items-center">
            <Text className="text-2xl font-bold text-white">{alerts.filter(a => a.status === 'active').length}</Text>
            <Text className="text-gray-500 text-xs">监控中</Text>
          </View>
          <View className="flex-1 mx-1 p-3 rounded-xl bg-gray-900 items-center">
            <Text className="text-2xl font-bold text-green-400">{alerts.filter(a => a.status === 'triggered').length}</Text>
            <Text className="text-gray-500 text-xs">已触发</Text>
          </View>
          <View className="flex-1 ml-2 p-3 rounded-xl bg-gray-900 items-center">
            <Text className="text-2xl font-bold text-gray-400">{alerts.length}</Text>
            <Text className="text-gray-500 text-xs">全部</Text>
          </View>
        </View>
      </View>

      {/* Alert List */}
      <FlatList
        data={alerts}
        renderItem={renderAlertItem}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={
          <View className="items-center py-16">
            <Ionicons name="notifications-outline" size={48} color="#374151" />
            <Text className="text-sm text-gray-500 mt-3">暂无价格提醒</Text>
            <TouchableOpacity
              onPress={() => setModalVisible(true)}
              className="mt-4 px-6 py-2 rounded-full"
              style={{ backgroundColor: '#00F0FF20' }}
            >
              <Text className="text-cyan-400 text-sm">立即创建</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Create Alert Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View className="flex-1 bg-black/80 justify-end">
          <TouchableOpacity
            className="flex-1"
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
          />
          <View className="bg-gray-900 rounded-t-3xl p-5">
            <View className="flex-row items-center justify-between mb-5">
              <Text className="text-xl font-bold text-white">添加价格提醒</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Select Token */}
            <Text className="text-gray-400 text-sm mb-2">选择代币</Text>
            <View className="flex-row flex-wrap mb-4">
              {POPULAR_TOKENS.map(token => (
                <TouchableOpacity
                  key={token.symbol}
                  onPress={() => {
                    setSelectedToken(token);
                    setTargetPrice(token.price.toString());
                  }}
                  className={`px-3 py-2 rounded-lg mr-2 mb-2 ${selectedToken?.symbol === token.symbol ? 'bg-cyan-500/30 border border-cyan-500' : 'bg-gray-800 border border-gray-700'}`}
                >
                  <Text className={`text-sm ${selectedToken?.symbol === token.symbol ? 'text-cyan-400' : 'text-gray-300'}`}>
                    {token.symbol}
                  </Text>
                  <Text className="text-xs text-gray-500">${token.price.toLocaleString()}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Direction */}
            <Text className="text-gray-400 text-sm mb-2">提醒方向</Text>
            <View className="flex-row mb-4">
              <TouchableOpacity
                onPress={() => setDirection('up')}
                className={`flex-1 py-3 rounded-lg mr-2 items-center ${direction === 'up' ? 'bg-green-500/30 border border-green-500' : 'bg-gray-800 border border-gray-700'}`}
              >
                <Ionicons name="arrow-up" size={20} color={direction === 'up' ? '#00FF88' : '#6B7280'} />
                <Text className={`text-sm mt-1 ${direction === 'up' ? 'text-green-400' : 'text-gray-500'}`}>价格高于</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setDirection('down')}
                className={`flex-1 py-3 rounded-lg ml-2 items-center ${direction === 'down' ? 'bg-red-500/30 border border-red-500' : 'bg-gray-800 border border-gray-700'}`}
              >
                <Ionicons name="arrow-down" size={20} color={direction === 'down' ? '#FF4444' : '#6B7280'} />
                <Text className={`text-sm mt-1 ${direction === 'down' ? 'text-red-400' : 'text-gray-500'}`}>价格低于</Text>
              </TouchableOpacity>
            </View>

            {/* Target Price */}
            <Text className="text-gray-400 text-sm mb-2">目标价格 (USD)</Text>
            <TextInput
              value={targetPrice}
              onChangeText={setTargetPrice}
              placeholder="输入目标价格"
              placeholderTextColor="#6B7280"
              keyboardType="decimal-pad"
              className="bg-gray-800 text-white px-4 py-3 rounded-xl mb-5 border border-gray-700"
            />

            {/* Submit */}
            <TouchableOpacity
              onPress={handleCreateAlert}
              className="py-4 rounded-xl items-center"
              style={{ backgroundColor: '#00F0FF' }}
            >
              <Text className="text-black font-bold">确认创建</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}
