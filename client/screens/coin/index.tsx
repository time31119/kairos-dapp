import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Screen } from '@/components/Screen';
import { useSafeRouter, useSafeSearchParams } from '@/hooks/useSafeRouter';
import { Ionicons, FontAwesome6, MaterialCommunityIcons } from '@expo/vector-icons';

// Mock data for demo
const MOCK_COIN_DATA = {
  id: 'bitcoin',
  symbol: 'BTC',
  name: 'Bitcoin',
  price: 67823.45,
  change24h: 2.34,
  change7d: 5.67,
  marketCap: '1.33T',
  volume24h: '28.5B',
  high24h: 68200,
  low24h: 65800,
  circulatingSupply: '19.6M',
  maxSupply: '21M',
};

const MOCK_INDICATORS = {
  rsi: { value: 65, signal: 'neutral' },
  macd: { value: 1234, histogram: 456, signal: 'bullish' },
  adx: { value: 28, signal: 'strong' },
  mfi: { value: 72, signal: 'overbought' },
  ema20: { value: 66500, signal: 'above' },
  ema50: { value: 64800, signal: 'above' },
  ema200: { value: 58000, signal: 'above' },
  bb: { upper: 68500, middle: 67000, lower: 65500 },
};

const MOCK_KEY_LEVELS = {
  resistance: [68500, 70000, 72000],
  support: [66000, 64500, 63000],
  entry: 66800,
  target: 70000,
  stopLoss: 65000,
};

const MOCK_TRADES = [
  { type: 'long', symbol: 'BTC/USDT', entry: 66500, current: 67823, pnl: 2.1, time: '2小时前' },
  { type: 'long', symbol: 'ETH/BTC', entry: 0.048, current: 0.049, pnl: 2.5, time: '5小时前' },
  { type: 'short', symbol: 'SOL/USDT', entry: 145, current: 142, pnl: 2.1, time: '1天前' },
];

type TimeFrame = '1H' | '4H' | '1D' | '1W';

export default function CoinDetailScreen() {
  const router = useSafeRouter();
  const params = useSafeSearchParams<{ id?: string; symbol?: string }>();
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('1H');
  const [refreshing, setRefreshing] = useState(false);
  const [isFollowed, setIsFollowed] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const coin = MOCK_COIN_DATA;
  const indicators = MOCK_INDICATORS;
  const keyLevels = MOCK_KEY_LEVELS;

  const getIndicatorColor = (signal: string) => {
    switch (signal) {
      case 'bullish':
      case 'above':
      case 'strong':
        return '#00F0FF';
      case 'bearish':
      case 'below':
        return '#BF00FF';
      default:
        return '#FFD700';
    }
  };

  const getSignalIcon = (signal: string) => {
    switch (signal) {
      case 'bullish':
      case 'above':
      case 'strong':
        return 'trending-up' as const;
      case 'bearish':
      case 'below':
        return 'trending-down' as const;
      default:
        return 'remove-circle' as const;
    }
  };

  return (
    <Screen>
      <ScrollView
        className="flex-1 bg-[#0A0A0F]"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#00F0FF"
          />
        }
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-[#1A1A2E]">
          <TouchableOpacity onPress={() => router.back()} className="p-2">
            <Ionicons name="chevron-back" size={24} color="#00F0FF" />
          </TouchableOpacity>
          <View className="flex-row items-center gap-2">
            <View className="w-10 h-10 rounded-full bg-[#F7931A] items-center justify-center">
              <Text className="text-white font-bold text-lg">₿</Text>
            </View>
            <View>
              <Text className="text-white font-bold text-lg">{coin.symbol}</Text>
              <Text className="text-[#888] text-xs">{coin.name}</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => setIsFollowed(!isFollowed)}
            className="p-2"
          >
            <Ionicons
              name={isFollowed ? 'star' : 'star-outline'}
              size={24}
              color={isFollowed ? '#FFD700' : '#888'}
            />
          </TouchableOpacity>
        </View>

        {/* Price Section */}
        <View className="px-4 py-4">
          <Text className="text-white text-3xl font-bold font-mono">
            ${coin.price.toLocaleString()}
          </Text>
          <View className="flex-row items-center gap-2 mt-1">
            <Text
              className={`text-lg font-medium ${coin.change24h >= 0 ? 'text-[#00FF88]' : 'text-[#FF4444]'}`}
            >
              {coin.change24h >= 0 ? '+' : ''}{coin.change24h}%
            </Text>
            <Text className="text-[#888] text-sm">24h</Text>
            <Text className="text-[#888] text-sm ml-4">{coin.change7d >= 0 ? '+' : ''}{coin.change7d}% 7d</Text>
          </View>
        </View>

        {/* Time Frame Selector */}
        <View className="px-4 mb-4">
          <View className="flex-row bg-[#1A1A2E] rounded-lg p-1">
            {(['1H', '4H', '1D', '1W'] as TimeFrame[]).map((tf) => (
              <TouchableOpacity
                key={tf}
                onPress={() => setTimeFrame(tf)}
                className={`flex-1 py-2 rounded-md ${timeFrame === tf ? 'bg-[#00F0FF]' : ''}`}
              >
                <Text
                  className={`text-center text-sm font-medium ${timeFrame === tf ? 'text-[#0A0A0F]' : 'text-[#888]'}`}
                >
                  {tf}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Chart Placeholder */}
        <View className="px-4 mb-4">
          <View className="bg-[#1A1A2E] rounded-xl p-4 h-48 items-center justify-center">
            <View className="absolute inset-4">
              {/* Simple chart visualization */}
              <View className="flex-1 flex-row items-end justify-between px-2">
                {[40, 55, 45, 60, 50, 70, 65, 80, 75, 85, 78, 90].map((h, i) => (
                  <View
                    key={i}
                    className="w-5 bg-[#00F0FF] rounded-t-sm opacity-80"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </View>
            </View>
            <View className="flex-row justify-between w-full px-4">
              <Text className="text-[#888] text-xs">09:00</Text>
              <Text className="text-[#888] text-xs">12:00</Text>
              <Text className="text-[#888] text-xs">15:00</Text>
              <Text className="text-[#888] text-xs">18:00</Text>
            </View>
          </View>
        </View>

        {/* Key Levels */}
        <View className="px-4 mb-4">
          <View className="bg-[#1A1A2E] rounded-xl p-4">
            <Text className="text-white font-bold mb-3">关键价位</Text>
            <View className="flex-row gap-3">
              <View className="flex-1 bg-[#FF4444]/10 rounded-lg p-3 border border-[#FF4444]/30">
                <Text className="text-[#888] text-xs mb-1">阻力位</Text>
                <Text className="text-[#FF4444] font-mono font-bold text-sm">
                  ${keyLevels.resistance[0].toLocaleString()}
                </Text>
              </View>
              <View className="flex-1 bg-[#00F0FF]/10 rounded-lg p-3 border border-[#00F0FF]/30">
                <Text className="text-[#888] text-xs mb-1">入场点</Text>
                <Text className="text-[#00F0FF] font-mono font-bold text-sm">
                  ${keyLevels.entry.toLocaleString()}
                </Text>
              </View>
              <View className="flex-1 bg-[#00FF88]/10 rounded-lg p-3 border border-[#00FF88]/30">
                <Text className="text-[#888] text-xs mb-1">目标价</Text>
                <Text className="text-[#00FF88] font-mono font-bold text-sm">
                  ${keyLevels.target.toLocaleString()}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Technical Indicators */}
        <View className="px-4 mb-4">
          <View className="bg-[#1A1A2E] rounded-xl p-4">
            <Text className="text-white font-bold mb-3">技术指标</Text>
            <View className="flex-row flex-wrap gap-3">
              {/* RSI */}
              <View className="w-[48%] bg-[#0A0A0F] rounded-lg p-3">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-[#888] text-sm">RSI (14)</Text>
                  <Ionicons
                    name={getSignalIcon(indicators.rsi.signal)}
                    size={16}
                    color={getIndicatorColor(indicators.rsi.signal)}
                  />
                </View>
                <Text className="text-white font-mono font-bold text-xl">{indicators.rsi.value}</Text>
                <Text className="text-[#888] text-xs mt-1">中性区域</Text>
              </View>

              {/* MACD */}
              <View className="w-[48%] bg-[#0A0A0F] rounded-lg p-3">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-[#888] text-sm">MACD</Text>
                  <Ionicons
                    name={getSignalIcon(indicators.macd.signal)}
                    size={16}
                    color={getIndicatorColor(indicators.macd.signal)}
                  />
                </View>
                <Text className="text-white font-mono font-bold text-xl">+{indicators.macd.histogram}</Text>
                <Text className="text-[#00FF88] text-xs mt-1">多头信号</Text>
              </View>

              {/* ADX */}
              <View className="w-[48%] bg-[#0A0A0F] rounded-lg p-3">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-[#888] text-sm">ADX</Text>
                  <Ionicons
                    name={getSignalIcon(indicators.adx.signal)}
                    size={16}
                    color={getIndicatorColor(indicators.adx.signal)}
                  />
                </View>
                <Text className="text-white font-mono font-bold text-xl">{indicators.adx.value}</Text>
                <Text className="text-[#00F0FF] text-xs mt-1">趋势强劲</Text>
              </View>

              {/* MFI */}
              <View className="w-[48%] bg-[#0A0A0F] rounded-lg p-3">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-[#888] text-sm">MFI</Text>
                  <Ionicons
                    name={getSignalIcon(indicators.mfi.signal)}
                    size={16}
                    color={getIndicatorColor(indicators.mfi.signal)}
                  />
                </View>
                <Text className="text-white font-mono font-bold text-xl">{indicators.mfi.value}</Text>
                <Text className="text-[#FFD700] text-xs mt-1">资金流入</Text>
              </View>

              {/* EMA */}
              <View className="w-full bg-[#0A0A0F] rounded-lg p-3 mt-1">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-[#888] text-sm">均线系统</Text>
                  <View className="flex-row gap-1">
                    <View className="w-2 h-2 rounded-full bg-[#00F0FF]" />
                    <View className="w-2 h-2 rounded-full bg-[#FFD700]" />
                    <View className="w-2 h-2 rounded-full bg-[#BF00FF]" />
                  </View>
                </View>
                <View className="flex-row justify-between">
                  <View>
                    <Text className="text-[#888] text-xs">EMA20</Text>
                    <Text className="text-[#00F0FF] font-mono text-sm">${indicators.ema20.value.toLocaleString()}</Text>
                  </View>
                  <View>
                    <Text className="text-[#888] text-xs">EMA50</Text>
                    <Text className="text-[#FFD700] font-mono text-sm">${indicators.ema50.value.toLocaleString()}</Text>
                  </View>
                  <View>
                    <Text className="text-[#888] text-xs">EMA200</Text>
                    <Text className="text-[#BF00FF] font-mono text-sm">${indicators.ema200.value.toLocaleString()}</Text>
                  </View>
                </View>
                <Text className="text-[#00FF88] text-xs mt-2">均线多头排列，上涨趋势</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Recent Trades */}
        <View className="px-4 mb-4">
          <View className="bg-[#1A1A2E] rounded-xl p-4">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-white font-bold">近期交易信号</Text>
              <TouchableOpacity>
                <Text className="text-[#00F0FF] text-sm">查看全部</Text>
              </TouchableOpacity>
            </View>
            {MOCK_TRADES.map((trade, index) => (
              <View
                key={index}
                className="flex-row items-center justify-between py-3 border-b border-[#0A0A0F] last:border-b-0"
              >
                <View className="flex-row items-center gap-2">
                  <View className={`w-8 h-8 rounded-lg items-center justify-center ${trade.type === 'long' ? 'bg-[#00FF88]/10' : 'bg-[#FF4444]/10'}`}>
                    <Ionicons
                      name={trade.type === 'long' ? 'arrow-up' : 'arrow-down'}
                      size={16}
                      color={trade.type === 'long' ? '#00FF88' : '#FF4444'}
                    />
                  </View>
                  <View>
                    <Text className="text-white text-sm font-medium">{trade.symbol}</Text>
                    <Text className="text-[#888] text-xs">{trade.time}</Text>
                  </View>
                </View>
                <View className="items-end">
                  <Text className={`font-mono font-bold ${trade.pnl >= 0 ? 'text-[#00FF88]' : 'text-[#FF4444]'}`}>
                    {trade.pnl >= 0 ? '+' : ''}{trade.pnl}%
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Market Info */}
        <View className="px-4 mb-4">
          <View className="bg-[#1A1A2E] rounded-xl p-4">
            <Text className="text-white font-bold mb-3">市场数据</Text>
            <View className="flex-row flex-wrap">
              <View className="w-1/2 mb-3">
                <Text className="text-[#888] text-xs mb-1">市值</Text>
                <Text className="text-white font-mono">${coin.marketCap}</Text>
              </View>
              <View className="w-1/2 mb-3">
                <Text className="text-[#888] text-xs mb-1">24h成交量</Text>
                <Text className="text-white font-mono">${coin.volume24h}</Text>
              </View>
              <View className="w-1/2 mb-3">
                <Text className="text-[#888] text-xs mb-1">24h高</Text>
                <Text className="text-[#00FF88] font-mono">${coin.high24h.toLocaleString()}</Text>
              </View>
              <View className="w-1/2 mb-3">
                <Text className="text-[#888] text-xs mb-1">24h低</Text>
                <Text className="text-[#FF4444] font-mono">${coin.low24h.toLocaleString()}</Text>
              </View>
              <View className="w-1/2">
                <Text className="text-[#888] text-xs mb-1">流通量</Text>
                <Text className="text-white font-mono">{coin.circulatingSupply}</Text>
              </View>
              <View className="w-1/2">
                <Text className="text-[#888] text-xs mb-1">总供应量</Text>
                <Text className="text-white font-mono">{coin.maxSupply}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Analysis Summary */}
        <View className="px-4 pb-8">
          <View className="bg-[#1A1A2E] rounded-xl p-4">
            <View className="flex-row items-center gap-2 mb-3">
              <Ionicons name="analytics" size={20} color="#00F0FF" />
              <Text className="text-white font-bold">综合分析</Text>
            </View>
            <View className="bg-[#0A0A0F] rounded-lg p-3">
              <View className="flex-row items-center gap-2 mb-2">
                <View className="w-3 h-3 rounded-full bg-[#00FF88]" />
                <Text className="text-white text-sm">技术面：看涨</Text>
              </View>
              <Text className="text-[#888] text-xs leading-5">
                RSI 处于中性偏强区域，MACD 多头信号，均线系统形成多头排列。
                短期支撑位 $66,000，建议在该位置上方保持多头思路。
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action */}
      <View className="bg-[#0A0A0F] border-t border-[#1A1A2E] px-4 py-4 pb-8">
        <TouchableOpacity className="bg-[#00F0FF] rounded-xl py-4 items-center">
          <Text className="text-[#0A0A0F] font-bold text-base">添加自选</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}
