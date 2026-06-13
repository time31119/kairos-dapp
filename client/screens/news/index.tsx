'use client';

import { Screen } from '@/components/Screen';
import { Text, View, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState, useCallback, useEffect } from 'react';
import { apiRequest } from '@/utils/api';

// 资讯分类
const CATEGORIES = ['快讯', '深度', '宏观', 'DeFi', 'NFT'];

// 获取恐惧贪婪指数颜色
const getFearGreedColor = (value: number) => {
  if (value <= 25) return '#EF4444';
  if (value <= 45) return '#F97316';
  if (value <= 55) return '#EAB308';
  if (value <= 75) return '#22C55E';
  return '#10B981';
};

export default function NewsScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('快讯');
  const [activeTab, setActiveTab] = useState<'news' | 'hot' | 'market'>('news');

  // 数据状态
  const [marketOverview, setMarketOverview] = useState<{
    totalMarketCap: string;
    totalVolume24h: string;
    btcDominance: string;
    ethDominance: string;
    fearGreedIndex: number;
    fearGreedValue: string;
    fearGreedStatus: string;
  } | null>(null);

  const [news, setNews] = useState<any[]>([]);
  const [hotSearch, setHotSearch] = useState<any[]>([]);
  const [gainers, setGainers] = useState<any[]>([]);
  const [losers, setLosers] = useState<any[]>([]);

  // 获取市场概览
  const fetchMarketOverview = async () => {
    const result = await apiRequest<{
      totalMarketCap: string;
      totalVolume24h: string;
      btcDominance: string;
      ethDominance: string;
      fearGreedIndex: number;
      fearGreedValue: string;
      fearGreedStatus: string;
    }>('/market/overview');
    if (result.success && result.data) {
      setMarketOverview(result.data);
    }
  };

  // 获取资讯
  const fetchNews = async () => {
    const result = await apiRequest<any[]>('/news');
    if (result.success && result.data) {
      const data = result.data as any;
      if (Array.isArray(data)) {
        setNews(data);
      } else if (data.articles) {
        setNews(data.articles);
      }
    }
  };

  // 获取热搜
  const fetchHotSearch = async () => {
    const result = await apiRequest<any[]>('/market/hot');
    if (result.success && result.data) {
      const data = result.data as any;
      if (Array.isArray(data)) {
        setHotSearch(data);
      } else if (data.trending) {
        setHotSearch(data.trending);
      }
    }
  };

  // 获取涨跌榜
  const fetchTopMovers = async () => {
    const result = await apiRequest<{ gainers?: any[]; losers?: any[] }>('/market/top-movers');
    if (result.success && result.data) {
      if (result.data.gainers) setGainers(result.data.gainers);
      if (result.data.losers) setLosers(result.data.losers);
    }
  };

  // 加载所有数据
  const loadData = async () => {
    setLoading(true);
    await Promise.all([
      fetchMarketOverview(),
      fetchNews(),
      fetchHotSearch(),
      fetchTopMovers(),
    ]);
  };

  useEffect(() => {
    setLoading(true);
    loadData().finally(() => setLoading(false));
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  // 根据分类筛选新闻
  const filteredNews = activeCategory === '快讯' 
    ? news 
    : news.filter((item: any) => item.category === activeCategory || item.tag === activeCategory);

  // 如果后端数据为空，使用默认数据
  const displayNews = filteredNews.length > 0 ? filteredNews : [
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
  ];

  const displayHotSearch = hotSearch.length > 0 ? hotSearch : [
    { rank: 1, symbol: 'BTC', change: '+3.2%', trend: 'up' },
    { rank: 2, symbol: 'ETH', change: '+5.8%', trend: 'up' },
    { rank: 3, symbol: 'SOL', change: '+12.4%', trend: 'up' },
    { rank: 4, symbol: 'PEPE', change: '+28.7%', trend: 'up' },
    { rank: 5, symbol: 'WIF', change: '-2.1%', trend: 'down' },
    { rank: 6, symbol: 'BNB', change: '+1.5%', trend: 'up' },
    { rank: 7, symbol: 'DOGE', change: '+8.3%', trend: 'up' },
    { rank: 8, symbol: 'AVAX', change: '+6.2%', trend: 'up' },
  ];

  const displayGainers = gainers.length > 0 ? gainers : [
    { symbol: 'PEPE', name: 'Pepe', price: '$0.00001234', change: '+28.7%', volume: '$2.1B' },
    { symbol: 'WIF', name: 'dogwifhat', price: '$2.34', change: '+15.2%', volume: '$890M' },
    { symbol: 'SOL', name: 'Solana', price: '$178.5', change: '+12.4%', volume: '$3.2B' },
    { symbol: 'ETH', name: 'Ethereum', price: '$3,456', change: '+5.8%', volume: '$12.5B' },
  ];

  const displayLosers = losers.length > 0 ? losers : [
    { symbol: 'WIF', name: 'dogwifhat', price: '$2.34', change: '-8.3%', volume: '$890M' },
    { symbol: 'ARB', name: 'Arbitrum', price: '$1.12', change: '-5.2%', volume: '$456M' },
    { symbol: 'OP', name: 'Optimism', price: '$2.45', change: '-4.1%', volume: '$523M' },
    { symbol: 'INJ', name: 'Injective', price: '$25.6', change: '-3.8%', volume: '$234M' },
  ];

  const fearGreedIndex = marketOverview?.fearGreedIndex || 72;
  const fearGreedValue = marketOverview?.fearGreedValue || '+5';
  const fearGreedStatus = marketOverview?.fearGreedStatus || '贪婪';

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

        {/* Tab Switcher - 暗黑科技风格 */}
        <View className="px-5 mb-4">
          <View className="bg-black/60 rounded-xl p-1 border border-gray-800/50">
            {[
              { key: 'news', label: '资讯', icon: 'newspaper-outline' },
              { key: 'hot', label: '热搜', icon: 'trending-up-outline' },
              { key: 'market', label: '市场', icon: 'analytics-outline' },
            ].map((tab) => (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key as any)}
                className={`flex-1 py-3 rounded-lg flex-row items-center justify-center gap-2 ${
                  activeTab === tab.key ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20' : ''
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

        {loading && !refreshing ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color="#00F0FF" />
            <Text className="text-gray-500 mt-3">加载中...</Text>
          </View>
        ) : (
          <>
            {activeTab === 'news' && (
              <>
                {/* Fear & Greed Index - 优化配色 */}
                <View className="px-5 mb-4">
                  <View 
                    className="rounded-2xl p-4 border"
                    style={{ 
                      borderColor: getFearGreedColor(fearGreedIndex),
                      backgroundColor: `${getFearGreedColor(fearGreedIndex)}10`,
                      shadowColor: getFearGreedColor(fearGreedIndex),
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 0.3,
                      shadowRadius: 8,
                      elevation: 4,
                    }}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center gap-3">
                        <View 
                          className="w-14 h-14 rounded-full items-center justify-center"
                          style={{ 
                            backgroundColor: getFearGreedColor(fearGreedIndex),
                            shadowColor: getFearGreedColor(fearGreedIndex),
                            shadowOffset: { width: 0, height: 0 },
                            shadowOpacity: 0.5,
                            shadowRadius: 10,
                            elevation: 5,
                          }}
                        >
                          <Text className="text-xl font-bold text-black">{fearGreedIndex}</Text>
                        </View>
                        <View>
                          <Text className="text-white font-semibold">恐慌贪婪指数</Text>
                          <Text 
                            className="text-sm font-medium"
                            style={{ color: getFearGreedColor(fearGreedIndex) }}
                          >
                            {fearGreedStatus}
                          </Text>
                        </View>
                      </View>
                      <View className="flex-row items-center gap-1 bg-black/40 px-3 py-1.5 rounded-full">
                        <Ionicons 
                          name={fearGreedValue.startsWith('+') ? 'arrow-up' : 'arrow-down'} 
                          size={14} 
                          color="#22C55E" 
                        />
                        <Text className="text-sm text-green-400 font-medium">{fearGreedValue}</Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Category Filter - 优化样式 */}
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
                          ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/50'
                          : 'bg-black/60 border border-gray-800/50'
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

                {/* News List - 统一暗黑风格 */}
                <View className="px-5 pb-4 space-y-3">
                  {displayNews.map((item: any) => (
                    <TouchableOpacity
                      key={item.id}
                      className="bg-black/60 rounded-2xl p-4 border border-gray-800/50"
                      style={{
                        shadowColor: '#00F0FF',
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 0.05,
                        shadowRadius: 4,
                        elevation: 2,
                      }}
                    >
                      <View className="flex-row items-start gap-3">
                        <View className="flex-1">
                          {/* Tags & Hot */}
                          <View className="flex-row items-center gap-2 mb-2">
                            {item.hot && (
                              <View className="flex-row items-center gap-1 bg-red-500/20 px-2 py-0.5 rounded border border-red-500/30">
                                <Ionicons name="flame" size={10} color="#EF4444" />
                                <Text className="text-xs text-red-400 font-medium">热门</Text>
                              </View>
                            )}
                            <View className="bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                              <Text className="text-xs text-cyan-400">{item.category || '快讯'}</Text>
                            </View>
                            {item.tags?.slice(1).map((tag: string) => (
                              <View
                                key={tag}
                                className="bg-gray-800/50 px-2 py-0.5 rounded"
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
                          {item.summary && (
                            <Text className="text-xs text-gray-500 mb-2 leading-4">
                              {item.summary}
                            </Text>
                          )}
                          
                          {/* Source & Time */}
                          <View className="flex-row items-center gap-2">
                            <Text className="text-xs text-gray-500">{item.source}</Text>
                            <Text className="text-gray-700">•</Text>
                            <Text className="text-xs text-gray-500">{item.time || item.publishedAt}</Text>
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
                {/* Hot Search List - 统一暗黑风格 */}
                <View className="px-5 mb-4">
                  <View className="bg-black/60 rounded-2xl p-4 border border-gray-800/50">
                    <View className="flex-row items-center justify-between mb-4">
                      <View className="flex-row items-center gap-2">
                        <Ionicons name="trending-up" size={18} color="#00F0FF" />
                        <Text className="text-white font-semibold">热搜榜单</Text>
                      </View>
                      <View className="flex-row items-center gap-1">
                        <View className="w-2 h-2 rounded-full bg-green-400" />
                        <Text className="text-xs text-gray-500">实时更新</Text>
                      </View>
                    </View>
                    <View className="space-y-1">
                      {displayHotSearch.map((item: any, index: number) => (
                        <View 
                          key={item.symbol || item.coin || index}
                          className={`flex-row items-center justify-between py-3 ${
                            index !== displayHotSearch.length - 1 ? 'border-b border-gray-800/30' : ''
                          }`}
                        >
                          <View className="flex-row items-center gap-3">
                            <View 
                              className={`w-7 h-7 rounded-full items-center justify-center ${
                                index < 3 ? 'bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30' : 'bg-gray-800/50'
                              }`}
                            >
                              <Text 
                                className={`text-xs font-bold ${
                                  index < 3 ? 'text-cyan-400' : 'text-gray-500'
                                }`}
                              >
                                {item.rank || index + 1}
                              </Text>
                            </View>
                            <View>
                              <Text className="text-white font-medium">{item.symbol || item.coin}</Text>
                              <Text className="text-xs text-gray-500">热度指数</Text>
                            </View>
                          </View>
                          <View className="flex-row items-center gap-2">
                            <Text 
                              className={`text-sm font-medium ${
                                (item.change?.startsWith('+') || item.trend === 'up') ? 'text-green-400' : 'text-red-400'
                              }`}
                            >
                              {item.change || (item.trend === 'up' ? '+0%' : '-0%')}
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
                {/* Market Overview Cards - 统一暗黑风格 */}
                <View className="px-5 mb-4 space-y-3">
                  {/* Top Row */}
                  <View className="flex-row gap-3">
                    <View className="flex-1 bg-black/60 rounded-2xl p-4 border border-gray-800/50">
                      <Text className="text-xs text-gray-500 mb-1">总市值</Text>
                      <Text className="text-lg font-bold text-white">$2.42T</Text>
                      <View className="flex-row items-center gap-1 mt-1 bg-green-500/10 px-2 py-0.5 rounded-full self-start">
                        <Ionicons name="arrow-up" size={12} color="#22C55E" />
                        <Text className="text-xs text-green-400">+2.15%</Text>
                      </View>
                    </View>
                    <View className="flex-1 bg-black/60 rounded-2xl p-4 border border-gray-800/50">
                      <Text className="text-xs text-gray-500 mb-1">24h 成交量</Text>
                      <Text className="text-lg font-bold text-white">$98.5B</Text>
                      <View className="flex-row items-center gap-1 mt-1 bg-red-500/10 px-2 py-0.5 rounded-full self-start">
                        <Ionicons name="arrow-down" size={12} color="#EF4444" />
                        <Text className="text-xs text-red-400">-0.45%</Text>
                      </View>
                    </View>
                  </View>

                  {/* Bottom Row */}
                  <View className="flex-row gap-3">
                    <View className="flex-1 bg-black/60 rounded-2xl p-4 border border-cyan-500/20">
                      <Text className="text-xs text-gray-500 mb-1">BTC 占比</Text>
                      <Text className="text-lg font-bold text-cyan-400">52.4%</Text>
                      <View className="w-full h-1 bg-gray-800 rounded-full mt-2">
                        <View className="h-full bg-cyan-400 rounded-full" style={{ width: '52.4%' }} />
                      </View>
                    </View>
                    <View className="flex-1 bg-black/60 rounded-2xl p-4 border border-purple-500/20">
                      <Text className="text-xs text-gray-500 mb-1">ETH 占比</Text>
                      <Text className="text-lg font-bold text-purple-400">17.8%</Text>
                      <View className="w-full h-1 bg-gray-800 rounded-full mt-2">
                        <View className="h-full bg-purple-400 rounded-full" style={{ width: '17.8%' }} />
                      </View>
                    </View>
                  </View>

                  {/* DeFi TVL */}
                  <View className="bg-black/60 rounded-2xl p-4 border border-blue-500/20">
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center gap-3">
                        <View className="w-10 h-10 rounded-full bg-blue-500/20 items-center justify-center border border-blue-500/30">
                          <Ionicons name="layers" size={18} color="#3B82F6" />
                        </View>
                        <View>
                          <Text className="text-sm text-white font-medium">DeFi 总锁仓量</Text>
                          <Text className="text-xs text-gray-500">DeFiLlama 数据</Text>
                        </View>
                      </View>
                      <View className="text-right">
                        <Text className="text-lg font-bold text-white">$128.5B</Text>
                        <View className="flex-row items-center justify-end gap-1">
                          <Ionicons name="arrow-up" size={12} color="#22C55E" />
                          <Text className="text-xs text-green-400">+5.2%</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Gainers & Losers - 统一暗黑风格 */}
                <View className="px-5 pb-4">
                  {/* Gainers */}
                  <View className="mb-4">
                    <View className="flex-row items-center justify-between mb-3 px-1">
                      <View className="flex-row items-center gap-2">
                        <Ionicons name="trending-up" size={18} color="#22C55E" />
                        <Text className="text-white font-semibold">涨幅榜</Text>
                      </View>
                      <Text className="text-xs text-gray-500">24h</Text>
                    </View>
                    <View className="bg-black/60 rounded-2xl border border-gray-800/50 overflow-hidden">
                      {displayGainers.map((item: any, index: number) => (
                        <View 
                          key={item.symbol || index}
                          className={`flex-row items-center justify-between p-3 ${
                            index !== displayGainers.length - 1 ? 'border-b border-gray-800/30' : ''
                          }`}
                        >
                          <View className="flex-row items-center gap-3">
                            <View className="w-9 h-9 rounded-full bg-green-500/20 items-center justify-center border border-green-500/30">
                              <Text className="text-xs font-bold text-green-400">{(item.symbol || '?')[0]}</Text>
                            </View>
                            <View>
                              <Text className="text-sm text-white font-medium">{item.symbol}</Text>
                              <Text className="text-xs text-gray-500">{item.name}</Text>
                            </View>
                          </View>
                          <View className="items-end">
                            <Text className="text-sm text-white">{item.price}</Text>
                            <View className="bg-green-500/20 px-2 py-0.5 rounded">
                              <Text className="text-xs text-green-400 font-medium">{item.change}</Text>
                            </View>
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* Losers */}
                  <View>
                    <View className="flex-row items-center justify-between mb-3 px-1">
                      <View className="flex-row items-center gap-2">
                        <Ionicons name="trending-down" size={18} color="#EF4444" />
                        <Text className="text-white font-semibold">跌幅榜</Text>
                      </View>
                      <Text className="text-xs text-gray-500">24h</Text>
                    </View>
                    <View className="bg-black/60 rounded-2xl border border-gray-800/50 overflow-hidden">
                      {displayLosers.map((item: any, index: number) => (
                        <View 
                          key={item.symbol || index}
                          className={`flex-row items-center justify-between p-3 ${
                            index !== displayLosers.length - 1 ? 'border-b border-gray-800/30' : ''
                          }`}
                        >
                          <View className="flex-row items-center gap-3">
                            <View className="w-9 h-9 rounded-full bg-red-500/20 items-center justify-center border border-red-500/30">
                              <Text className="text-xs font-bold text-red-400">{(item.symbol || '?')[0]}</Text>
                            </View>
                            <View>
                              <Text className="text-sm text-white font-medium">{item.symbol}</Text>
                              <Text className="text-xs text-gray-500">{item.name}</Text>
                            </View>
                          </View>
                          <View className="items-end">
                            <Text className="text-sm text-white">{item.price}</Text>
                            <View className="bg-red-500/20 px-2 py-0.5 rounded">
                              <Text className="text-xs text-red-400 font-medium">{item.change}</Text>
                            </View>
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              </>
            )}
          </>
        )}

        <View className="h-20" />
      </ScrollView>
    </Screen>
  );
}
