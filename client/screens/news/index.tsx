'use client';

import { Screen } from '@/components/Screen';
import { Text, View, StyleSheet, TouchableOpacity, ScrollView, RefreshControl, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState, useCallback } from 'react';

// 热搜榜单数据
const HOT_SEARCH = [
  { rank: 1, symbol: 'BTC', change: '+3.2%', trend: 'up' },
  { rank: 2, symbol: 'ETH', change: '+5.8%', trend: 'up' },
  { rank: 3, symbol: 'SOL', change: '+12.4%', trend: 'up' },
  { rank: 4, symbol: 'PEPE', change: '+28.7%', trend: 'up' },
  { rank: 5, symbol: 'WIF', change: '-2.1%', trend: 'down' },
  { rank: 6, symbol: 'BNB', change: '+1.5%', trend: 'up' },
  { rank: 7, symbol: 'DOGE', change: '+8.3%', trend: 'up' },
  { rank: 8, symbol: 'AVAX', change: '+6.2%', trend: 'up' },
];

// 恐慌贪婪指数
const FEAR_GREED = {
  value: 72,
  status: '贪婪',
  change: '+5',
};

// 资讯分类
const CATEGORIES = ['快讯', '深度', '宏观', 'DeFi', 'NFT'];

// 资讯数据
const NEWS = [
  {
    id: '1',
    title: 'BTC 突破 68000 美元关口，机构资金持续涌入',
    source: 'CoinDesk',
    time: '10分钟前',
    category: '快讯',
    tags: ['BTC', '快讯'],
    hot: true,
    summary: '比特币价格今日突破 68000 美元关口，续刷历史新高...',
  },
  {
    id: '2',
    title: '以太坊 ETF 净流入创历史新高，单日净流入超 5 亿美元',
    source: 'Bloomberg',
    time: '30分钟前',
    category: '快讯',
    tags: ['ETH', 'ETF'],
    hot: true,
    summary: '以太坊现货 ETF 今日净流入达到 5.23 亿美元...',
  },
  {
    id: '3',
    title: 'Solana 生态 TVL 突破 50 亿美元，开发者活动创新高',
    source: 'DeFiLlama',
    time: '1小时前',
    category: 'DeFi',
    tags: ['SOL', 'DeFi'],
    hot: false,
    summary: 'Solana 链上总锁仓量突破 50 亿美元大关...',
  },
  {
    id: '4',
    title: '美联储维持利率不变，鲍威尔称通胀仍需时间回落',
    source: 'Reuters',
    time: '2小时前',
    category: '宏观',
    tags: ['宏观', '美联储'],
    hot: false,
    summary: '美联储今日公布利率决议，维持联邦基金利率不变...',
  },
  {
    id: '5',
    title: 'BlackRock BTC 持有量突破 30 万枚，机构化趋势加速',
    source: '链上数据',
    time: '3小时前',
    category: '深度',
    tags: ['BTC', '机构'],
    hot: true,
    summary: '全球最大资管公司 BlackRock 的比特币 ETF 持仓突破 30 万枚...',
  },
  {
    id: '6',
    title: '以太坊 Gas 费用骤降，Layer2 采用率创新高',
    source: 'Etherscan',
    time: '4小时前',
    category: 'DeFi',
    tags: ['ETH', 'Gas'],
    hot: false,
    summary: '以太坊网络 Gas 费用降至年内最低水平...',
  },
];

// 涨跌榜数据
const GAINERS = [
  { symbol: 'PEPE', name: 'Pepe', price: '$0.00001234', change: '+28.7%', volume: '$2.1B' },
  { symbol: 'WIF', name: 'dogwifhat', price: '$2.34', change: '+15.2%', volume: '$890M' },
  { symbol: 'SOL', name: 'Solana', price: '$178.5', change: '+12.4%', volume: '$3.2B' },
  { symbol: 'ETH', name: 'Ethereum', price: '$3,456', change: '+5.8%', volume: '$12.5B' },
];

const LOSERS = [
  { symbol: 'WIF', name: 'dogwifhat', price: '$2.34', change: '-8.3%', volume: '$890M' },
  { symbol: 'ARB', name: 'Arbitrum', price: '$1.12', change: '-5.2%', volume: '$456M' },
  { symbol: 'OP', name: 'Optimism', price: '$2.45', change: '-4.1%', volume: '$523M' },
  { symbol: 'INJ', name: 'Injective', price: '$25.6', change: '-3.8%', volume: '$234M' },
];

// 市场概览数据
const MARKET_OVERVIEW = {
  totalMarketCap: '$2.42T',
  marketCapChange: '+2.15%',
  volume24h: '$98.5B',
  volumeChange: '-0.45%',
  btcDominance: '52.4%',
  ethDominance: '17.8%',
  defiTVL: '$128.5B',
};

export default function NewsScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState('快讯');
  const [activeTab, setActiveTab] = useState<'news' | 'hot' | 'market'>('news');

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const getFearGreedColor = (value: number) => {
    if (value <= 25) return '#EF4444';
    if (value <= 45) return '#F97316';
    if (value <= 55) return '#EAB308';
    if (value <= 75) return '#22C55E';
    return '#10B981';
  };

  const filteredNews = activeCategory === '快讯' 
    ? NEWS 
    : NEWS.filter(item => item.category === activeCategory);

  return (
    <Screen>
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#00F0FF"
          />
        }
      >
        {/* Header */}
        <View className="px-5 pt-3 pb-4">
          <Text className="text-xl font-bold text-white">资讯</Text>
          <Text className="text-xs text-gray-500 mt-1">实时行情资讯与市场快讯</Text>
        </View>

        {/* Tab Switcher */}
        <View className="px-5 mb-4">
          <View className="flex-row bg-gray-900/80 rounded-xl p-1">
            {[
              { key: 'news', label: '资讯', icon: 'newspaper-outline' },
              { key: 'hot', label: '热搜', icon: 'trending-up-outline' },
              { key: 'market', label: '市场', icon: 'analytics-outline' },
            ].map((tab) => (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key as any)}
                className={`flex-1 py-2.5 rounded-lg flex-row items-center justify-center gap-2 ${
                  activeTab === tab.key ? 'bg-cyan-500/20' : ''
                }`}
              >
                <Ionicons
                  name={tab.icon as any}
                  size={16}
                  color={activeTab === tab.key ? '#00F0FF' : '#6B7280'}
                />
                <Text
                  className={`text-sm font-medium ${
                    activeTab === tab.key ? 'text-cyan-400' : 'text-gray-500'
                  }`}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {activeTab === 'news' && (
          <>
            {/* Fear & Greed Index */}
            <View className="px-5 mb-4">
              <View 
                className="rounded-2xl p-4 border"
                style={{ 
                  borderColor: getFearGreedColor(FEAR_GREED.value),
                  backgroundColor: `${getFearGreedColor(FEAR_GREED.value)}10`,
                }}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-3">
                    <View 
                      className="w-14 h-14 rounded-full items-center justify-center"
                      style={{ backgroundColor: getFearGreedColor(FEAR_GREED.value) }}
                    >
                      <Text className="text-xl font-bold text-black">{FEAR_GREED.value}</Text>
                    </View>
                    <View>
                      <Text className="text-white font-semibold">恐慌贪婪指数</Text>
                      <Text 
                        className="text-sm font-medium"
                        style={{ color: getFearGreedColor(FEAR_GREED.value) }}
                      >
                        {FEAR_GREED.status}
                      </Text>
                    </View>
                  </View>
                  <View className="flex-row items-center gap-1">
                    <Ionicons 
                      name={FEAR_GREED.change.startsWith('+') ? 'arrow-up' : 'arrow-down'} 
                      size={14} 
                      color="#22C55E" 
                    />
                    <Text className="text-sm text-green-400">{FEAR_GREED.change}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Category Filter */}
            <View className="mb-4 px-5">
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
              >
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full mr-2 ${
                    activeCategory === cat
                      ? 'bg-cyan-500/20 border border-cyan-500/50'
                      : 'bg-gray-900/80 border border-gray-800'
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${
                      activeCategory === cat ? 'text-cyan-400' : 'text-gray-400'
                    }`}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            </View>

            {/* News List */}
            <View className="px-5 pb-4 space-y-3">
              {filteredNews.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  className="bg-gray-900/80 rounded-2xl p-4 border border-gray-800"
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
                        <View className="bg-cyan-500/20 px-2 py-0.5 rounded">
                          <Text className="text-xs text-cyan-400">{item.category}</Text>
                        </View>
                        {item.tags.slice(1).map((tag) => (
                          <View
                            key={tag}
                            className="bg-gray-800 px-2 py-0.5 rounded"
                          >
                            <Text className="text-xs text-gray-400">{tag}</Text>
                          </View>
                        ))}
                      </View>
                      
                      {/* Title */}
                      <Text className="text-sm font-medium text-white leading-5 mb-1">
                        {item.title}
                      </Text>
                      
                      {/* Summary */}
                      <Text className="text-xs text-gray-500 mb-2 leading-4">
                        {item.summary}
                      </Text>
                      
                      {/* Source & Time */}
                      <View className="flex-row items-center gap-2">
                        <Text className="text-xs text-gray-500">{item.source}</Text>
                        <Text className="text-gray-700">•</Text>
                        <Text className="text-xs text-gray-500">{item.time}</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {activeTab === 'hot' && (
          <>
            {/* Hot Search List */}
            <View className="px-5 mb-4">
              <View className="bg-gray-900/80 rounded-2xl p-4 border border-gray-800">
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-white font-semibold">热搜榜单</Text>
                  <Text className="text-xs text-gray-500">实时更新</Text>
                </View>
                <View className="space-y-3">
                  {HOT_SEARCH.map((item, index) => (
                    <View 
                      key={item.symbol}
                      className={`flex-row items-center justify-between py-2 ${
                        index !== HOT_SEARCH.length - 1 ? 'border-b border-gray-800' : ''
                      }`}
                    >
                      <View className="flex-row items-center gap-3">
                        <View 
                          className={`w-6 h-6 rounded-full items-center justify-center ${
                            index < 3 ? 'bg-cyan-500/20' : 'bg-gray-800'
                          }`}
                        >
                          <Text 
                            className={`text-xs font-bold ${
                              index < 3 ? 'text-cyan-400' : 'text-gray-500'
                            }`}
                          >
                            {item.rank}
                          </Text>
                        </View>
                        <View>
                          <Text className="text-white font-medium">{item.symbol}</Text>
                          <Text className="text-xs text-gray-500">热度指数</Text>
                        </View>
                      </View>
                      <View className="flex-row items-center gap-2">
                        <Text 
                          className={`text-sm font-medium ${
                            item.trend === 'up' ? 'text-green-400' : 'text-red-400'
                          }`}
                        >
                          {item.change}
                        </Text>
                        <Ionicons
                          name={item.trend === 'up' ? 'trending-up' : 'trending-down'}
                          size={16}
                          color={item.trend === 'up' ? '#22C55E' : '#EF4444'}
                        />
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </>
        )}

        {activeTab === 'market' && (
          <>
            {/* Market Overview Cards */}
            <View className="px-5 mb-4 space-y-3">
              {/* Top Row */}
              <View className="flex-row gap-3">
                <View className="flex-1 bg-gray-900/80 rounded-2xl p-4 border border-gray-800">
                  <Text className="text-xs text-gray-500 mb-1">总市值</Text>
                  <Text className="text-lg font-bold text-white">{MARKET_OVERVIEW.totalMarketCap}</Text>
                  <View className="flex-row items-center gap-1 mt-1">
                    <Ionicons name="arrow-up" size={12} color="#22C55E" />
                    <Text className="text-xs text-green-400">{MARKET_OVERVIEW.marketCapChange}</Text>
                  </View>
                </View>
                <View className="flex-1 bg-gray-900/80 rounded-2xl p-4 border border-gray-800">
                  <Text className="text-xs text-gray-500 mb-1">24h 成交量</Text>
                  <Text className="text-lg font-bold text-white">{MARKET_OVERVIEW.volume24h}</Text>
                  <View className="flex-row items-center gap-1 mt-1">
                    <Ionicons name="arrow-down" size={12} color="#EF4444" />
                    <Text className="text-xs text-red-400">{MARKET_OVERVIEW.volumeChange}</Text>
                  </View>
                </View>
              </View>

              {/* Bottom Row */}
              <View className="flex-row gap-3">
                <View className="flex-1 bg-gray-900/80 rounded-2xl p-4 border border-gray-800">
                  <Text className="text-xs text-gray-500 mb-1">BTC 占比</Text>
                  <Text className="text-lg font-bold text-cyan-400">{MARKET_OVERVIEW.btcDominance}</Text>
                  <Text className="text-xs text-gray-500 mt-1">市值占比</Text>
                </View>
                <View className="flex-1 bg-gray-900/80 rounded-2xl p-4 border border-gray-800">
                  <Text className="text-xs text-gray-500 mb-1">ETH 占比</Text>
                  <Text className="text-lg font-bold text-purple-400">{MARKET_OVERVIEW.ethDominance}</Text>
                  <Text className="text-xs text-gray-500 mt-1">市值占比</Text>
                </View>
              </View>

              {/* DeFi TVL */}
              <View className="bg-gray-900/80 rounded-2xl p-4 border border-gray-800">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-2">
                    <View className="w-8 h-8 rounded-full bg-blue-500/20 items-center justify-center">
                      <Ionicons name="layers" size={16} color="#3B82F6" />
                    </View>
                    <View>
                      <Text className="text-sm text-white font-medium">DeFi 总锁仓量</Text>
                      <Text className="text-xs text-gray-500">DeFiLlama 数据</Text>
                    </View>
                  </View>
                  <Text className="text-lg font-bold text-white">{MARKET_OVERVIEW.defiTVL}</Text>
                </View>
              </View>
            </View>

            {/* Gainers & Losers */}
            <View className="px-5 pb-4">
              {/* Gainers */}
              <View className="mb-4">
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-white font-semibold">涨幅榜</Text>
                  <Ionicons name="trending-up" size={18} color="#22C55E" />
                </View>
                <View className="bg-gray-900/80 rounded-2xl border border-gray-800 overflow-hidden">
                  {GAINERS.map((item, index) => (
                    <View 
                      key={item.symbol}
                      className={`flex-row items-center justify-between p-3 ${
                        index !== GAINERS.length - 1 ? 'border-b border-gray-800' : ''
                      }`}
                    >
                      <View className="flex-row items-center gap-3">
                        <View className="w-8 h-8 rounded-full bg-green-500/20 items-center justify-center">
                          <Text className="text-xs font-bold text-green-400">{item.symbol[0]}</Text>
                        </View>
                        <View>
                          <Text className="text-sm text-white font-medium">{item.symbol}</Text>
                          <Text className="text-xs text-gray-500">{item.name}</Text>
                        </View>
                      </View>
                      <View className="items-end">
                        <Text className="text-sm text-white">{item.price}</Text>
                        <Text className="text-xs text-green-400">{item.change}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>

              {/* Losers */}
              <View>
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-white font-semibold">跌幅榜</Text>
                  <Ionicons name="trending-down" size={18} color="#EF4444" />
                </View>
                <View className="bg-gray-900/80 rounded-2xl border border-gray-800 overflow-hidden">
                  {LOSERS.map((item, index) => (
                    <View 
                      key={item.symbol}
                      className={`flex-row items-center justify-between p-3 ${
                        index !== LOSERS.length - 1 ? 'border-b border-gray-800' : ''
                      }`}
                    >
                      <View className="flex-row items-center gap-3">
                        <View className="w-8 h-8 rounded-full bg-red-500/20 items-center justify-center">
                          <Text className="text-xs font-bold text-red-400">{item.symbol[0]}</Text>
                        </View>
                        <View>
                          <Text className="text-sm text-white font-medium">{item.symbol}</Text>
                          <Text className="text-xs text-gray-500">{item.name}</Text>
                        </View>
                      </View>
                      <View className="items-end">
                        <Text className="text-sm text-white">{item.price}</Text>
                        <Text className="text-xs text-red-400">{item.change}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </>
        )}

        <View className="h-20" />
      </ScrollView>
    </Screen>
  );
}
