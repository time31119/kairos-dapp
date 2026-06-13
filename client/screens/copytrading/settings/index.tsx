import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Screen } from '@/components/Screen';
import { router } from 'expo-router';

const TRADER = {
  id: '1',
  name: 'CryptoMaster',
  avatar: 'CM',
  winRate: 87.5,
  followers: 12500,
  profit: 156.8,
};

export default function CopytradingSettingsScreen() {
  const [copyAmount, setCopyAmount] = useState('1000');
  const [stopLoss, setStopLoss] = useState('20');
  const [takeProfit, setTakeProfit] = useState('50');
  const [isCopying, setIsCopying] = useState(false);

  const handleCopy = async () => {
    setIsCopying(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsCopying(false);
    router.back();
  };

  return (
    <Screen>
      <ScrollView 
        className="flex-1"
        style={{ backgroundColor: '#0A0A0F' }}
        contentContainerStyle={{ padding: 16 }}
      >
        {/* Trader Info */}
        <View 
          className="rounded-2xl p-4 mb-4"
          style={{ backgroundColor: '#0A0A0F', borderWidth: 1, borderColor: '#1F1F2E' }}
        >
          <View className="flex-row items-center">
            <View 
              className="w-14 h-14 rounded-full items-center justify-center"
              style={{ backgroundColor: '#00F0FF', borderWidth: 2, borderColor: '#00F0FF' }}
            >
              <Text className="text-xl font-bold" style={{ color: '#0A0A0F' }}>
                {TRADER.avatar}
              </Text>
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-lg font-bold" style={{ color: '#FFFFFF' }}>
                {TRADER.name}
              </Text>
              <Text className="text-sm" style={{ color: '#00FF88' }}>
                胜率 {TRADER.winRate}% · 跟随 {TRADER.followers.toLocaleString()} 人
              </Text>
            </View>
          </View>
        </View>

        {/* Copy Settings */}
        <View 
          className="rounded-2xl p-4 mb-4"
          style={{ backgroundColor: '#0A0A0F', borderWidth: 1, borderColor: '#1F1F2E' }}
        >
          <Text className="text-base font-bold mb-4" style={{ color: '#FFFFFF' }}>
            跟单设置
          </Text>

          {/* Copy Amount */}
          <View className="mb-4">
            <Text className="text-sm mb-2" style={{ color: '#6B7280' }}>跟单金额 (USDT)</Text>
            <View 
              className="flex-row items-center rounded-xl px-4 py-3"
              style={{ backgroundColor: '#1A1A22', borderWidth: 1, borderColor: '#1F1F2E' }}
            >
              <Text className="text-2xl font-bold" style={{ color: '#00F0FF' }}>$</Text>
              <Text 
                className="text-2xl font-bold ml-2 flex-1" 
                style={{ color: '#FFFFFF' }}
              >
                {copyAmount}
              </Text>
            </View>
            <View className="flex-row mt-2">
              {['500', '1000', '2000', '5000'].map(amount => (
                <View
                  key={amount}
                  className="px-3 py-1.5 rounded-lg mr-2"
                  style={{ backgroundColor: '#1A1A22' }}
                  onTouchEnd={() => setCopyAmount(amount)}
                >
                  <Text className="text-xs" style={{ color: '#6B7280' }}>${amount}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Stop Loss */}
          <View className="mb-4">
            <View className="flex-row justify-between mb-2">
              <Text className="text-sm" style={{ color: '#6B7280' }}>止损线</Text>
              <Text className="text-sm font-bold" style={{ color: '#EF4444' }}>
                -{stopLoss}%
              </Text>
            </View>
            <View 
              className="h-2 rounded-full"
              style={{ backgroundColor: '#1A1A22' }}
            >
              <View 
                className="h-full rounded-full"
                style={{ width: `${(parseInt(stopLoss) / 50) * 100}%`, backgroundColor: '#EF4444' }}
              />
            </View>
            <View className="flex-row mt-2">
              {['10', '20', '30', '50'].map(val => (
                <View
                  key={val}
                  className="px-3 py-1.5 rounded-lg mr-2"
                  style={{ backgroundColor: '#1A1A22' }}
                  onTouchEnd={() => setStopLoss(val)}
                >
                  <Text className="text-xs" style={{ color: '#6B7280' }}>-{val}%</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Take Profit */}
          <View className="mb-4">
            <View className="flex-row justify-between mb-2">
              <Text className="text-sm" style={{ color: '#6B7280' }}>止盈线</Text>
              <Text className="text-sm font-bold" style={{ color: '#00FF88' }}>
                +{takeProfit}%
              </Text>
            </View>
            <View 
              className="h-2 rounded-full"
              style={{ backgroundColor: '#1A1A22' }}
            >
              <View 
                className="h-full rounded-full"
                style={{ width: `${(parseInt(takeProfit) / 100) * 100}%`, backgroundColor: '#00FF88' }}
              />
            </View>
            <View className="flex-row mt-2">
              {['30', '50', '100', '200'].map(val => (
                <View
                  key={val}
                  className="px-3 py-1.5 rounded-lg mr-2"
                  style={{ backgroundColor: '#1A1A22' }}
                  onTouchEnd={() => setTakeProfit(val)}
                >
                  <Text className="text-xs" style={{ color: '#6B7280' }}>+{val}%</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Risk Warning */}
        <View 
          className="rounded-2xl p-4 mb-6"
          style={{ backgroundColor: '#1A1A22', borderWidth: 1, borderColor: '#EF4444' }}
        >
          <Text className="text-sm" style={{ color: '#EF4444' }}>
            ⚠️ 风险提示：跟单交易存在风险，历史业绩不代表未来表现。请根据自身风险承受能力谨慎设置跟单参数。
          </Text>
        </View>

        {/* Confirm Button */}
        <View 
          className="rounded-2xl py-4 items-center"
          style={{ backgroundColor: isCopying ? '#1A1A22' : '#00F0FF', shadowColor: '#00F0FF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 }}
          onTouchEnd={handleCopy}
        >
          <Text 
            className="text-lg font-bold" 
            style={{ color: isCopying ? '#6B7280' : '#0A0A0F' }}
          >
            {isCopying ? '跟单中...' : `确认跟单 $${copyAmount}`}
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}
