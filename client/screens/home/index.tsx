/**
 * 首页 - KAIROS DAPP
 * 完善版本：增强交互和内容展示
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, RefreshControl, TouchableOpacity, Modal } from 'react-native';
import { Screen } from '@/components/Screen';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import SwapModal from '@/components/payment/SwapModal';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || '';

// 赛道分类 - 完整信息
const CATEGORIES = [
  { id: 'defi', title: 'DeFi', icon: 'swap-horizontal', color: '#00F0FF', desc: '去中心化金融', count: 1248 },
  { id: 'meme', title: 'Meme', icon: 'happy-outline', color: '#FFD700', desc: '社区驱动代币', count: 856 },
  { id: 'ai', title: 'AI', icon: 'bulb-outline', color: '#FF69B4', desc: '人工智能+区块链', count: 432 },
  { id: 'gaming', title: 'GameFi', icon: 'game-controller-outline', color: '#00FF7F', desc: '游戏化金融', count: 678 },
  { id: 'infrastructure', title: '基础设施', icon: 'construct-outline', color: '#9370DB', desc: '底层技术设施', count: 523 },
  { id: 'layer2', title: 'Layer2', icon: 'layers-outline', color: '#FF6B6B', desc: '二层扩容方案', count: 312 },
];

// 技术分析场景 - 完整版本（带更多数据）
const TECHNICAL_SCENARIOS = [
  { id: '1h_up', title: '1H上涨', icon: 'trending-up', color: '#00F0FF', desc: '短期爆发信号', signal: '强多', signalColor: '#00FF88', count: 23, winRate: 78, period: '1H' },
  { id: '4h_up', title: '4H上涨', icon: 'trending-up', color: '#00FF88', desc: '波段延续信号', signal: '看多', signalColor: '#00FF88', count: 18, winRate: 82, period: '4H' },
  { id: 'macd', title: 'MACD金叉', icon: 'sync', color: '#9370DB', desc: '趋势转折信号', signal: '买入', signalColor: '#00FF88', count: 31, winRate: 75, period: '多周期' },
  { id: 'rsi', title: 'RSI超卖', icon: 'speedometer', color: '#FFA500', desc: '超卖反弹信号', signal: '关注', signalColor: '#FFA500', count: 27, winRate: 71, period: '4H' },
  { id: 'volume', title: '成交量异动', icon: 'pulse', color: '#FF69B4', desc: '资金涌入信号', signal: '放量', signalColor: '#FF69B4', count: 42, winRate: 68, period: '1H' },
  { id: 'golden', title: '均线金叉', icon: 'git-merge', color: '#FFD700', desc: '多头发散信号', signal: '多头', signalColor: '#00FF88', count: 24, winRate: 79, period: '日线' },
  { id: 'bollinger', title: '布林下轨', icon: 'radio-button-on', color: '#00CED1', desc: '支撑反弹信号', signal: '回踩', signalColor: '#00CED1', count: 19, winRate: 73, period: '4H' },
  { id: '1h_down', title: '1H下跌', icon: 'trending-down', color: '#FF4444', desc: '做空机会信号', signal: '做空', signalColor: '#FF4444', count: 15, winRate: 65, period: '1H' },
  { id: 'kdj', title: 'KDJ超买', icon: 'analytics', color: '#FF6347', desc: '超买回调信号', signal: '警惕', signalColor: '#FF6347', count: 12, winRate: 62, period: '1H' },
  { id: 'vol_down', title: '缩量整理', icon: 'contract', color: '#808080', desc: '横盘蓄势信号', signal: '观望', signalColor: '#808080', count: 36, winRate: 0, period: '日线' },
];

// 技术分析筛选标签
const TECH_FILTER_TAGS = [
  { id: 'all', title: '全部' },
  { id: 'bull', title: '做多信号' },
  { id: 'bear', title: '做空信号' },
  { id: 'neutral', title: '观望信号' },
];

// 技术分析排序方式
const TECH_SORT_OPTIONS = [
  { id: 'count', title: '币种数量' },
  { id: 'winRate', title: '胜率' },
];

// 热门赛道标签
const FEATURED_TAGS = [
  { id: 'all', title: '全部' },
  { id: 'defi', title: 'DeFi' },
  { id: 'meme', title: 'Meme' },
  { id: 'ai', title: 'AI' },
  { id: 'layer2', title: 'L2' },
];

// 赛道区块 - 基于技术分析
function CategorySection({ category, onPress, onTokenPress }: { category: any; onPress: () => void; onTokenPress?: (token: any) => void }) {
  return (
    <Pressable style={styles.categorySection} onPress={onPress}>
      <View style={styles.categoryHeader}>
        <View style={[styles.iconBox, { backgroundColor: category.color + '20' }]}>
          <Ionicons name={category.icon} size={16} color={category.color} />
        </View>
        <View style={styles.categoryTitleWrap}>
          <Text style={styles.categoryTitle}>{category.title}</Text>
          <Text style={styles.categoryDesc}>{category.desc}</Text>
        </View>
        <View style={styles.categoryArrow}>
          <Ionicons name="chevron-forward" size={18} color="#6B7280" />
        </View>
      </View>
      
      {/* 技术分析统计 */}
      {category.techStats && (
        <View style={styles.techSignalStats}>
          <View style={styles.techStatBadge}>
            <Ionicons name="trending-up" size={10} color="#00FF88" />
            <Text style={styles.techStatText}>
              {category.techStats.bullishTokens || 0} 个做多信号
            </Text>
          </View>
          {category.techStats.avgWinRate > 0 && (
            <View style={styles.techStatBadge}>
              <Ionicons name="trophy" size={10} color="#FFD700" />
              <Text style={styles.techStatText}>
                {category.techStats.avgWinRate}% 胜率
              </Text>
            </View>
          )}
        </View>
      )}
      
      <View style={styles.tokenList}>
        {category.tokens?.slice(0, 3).map((t: any, i: number) => (
          <Pressable 
            key={t.symbol} 
            style={styles.miniTokenRow}
            onPress={() => onTokenPress?.(t)}
          >
            <View style={styles.miniTokenLeft}>
              <Text style={styles.miniRank}>{t.rank || i + 1}</Text>
              <Text style={styles.miniSymbol}>{t.symbol}</Text>
              {/* 技术分析信号标签 */}
              {t.techSignals && t.techSignals.length > 0 && (
                <View style={styles.techSignalTag}>
                  {t.techSignals.slice(0, 1).map((s: any, idx: number) => (
                    <Text key={idx} style={[styles.techSignalLabel, { color: s.color }]}>
                      {s.name}
                    </Text>
                  ))}
                </View>
              )}
            </View>
            <View style={styles.miniTokenRight}>
              <Text style={styles.miniPrice}>${formatPrice(t.price)}</Text>
              <Text style={[styles.miniChange, { color: t.change >= 0 ? '#00FF88' : '#FF4444' }]}>
                {t.change >= 0 ? '+' : ''}{t.change.toFixed(1)}%
              </Text>
            </View>
          </Pressable>
        ))}
      </View>
      
      {/* 无做多信号提示 */}
      {(!category.tokens || category.tokens.length === 0) && (
        <View style={styles.noSignal}>
          <Text style={styles.noSignalText}>暂无技术分析做多信号</Text>
        </View>
      )}
    </Pressable>
  );
}

// 技术指标卡片 - 完善版
function TechCard({ scenario, onPress }: { scenario: any; onPress: () => void }) {
  const isBullish = scenario.signalColor === '#00FF88' || scenario.signalColor === '#00CED1';
  const isBearish = scenario.signalColor === '#FF4444';
  
  // 图标映射
  const iconMap: Record<string, string> = {
    'trending-up': 'trending-up',
    'trending-down': 'trending-down',
    'sync': 'sync',
    'speedometer': 'speedometer',
    'pulse': 'pulse',
    'git-merge': 'git-merge',
    'radio-button-on': 'radio-button-on',
    'analytics': 'analytics',
    'contract': 'contract',
  };
  const iconName = iconMap[scenario.icon] || 'ellipse';
  
  return (
    <Pressable 
      style={[styles.techCard, { borderColor: scenario.color + '40' }]}
      onPress={onPress}
    >
      {/* 左侧：图标和标题 */}
      <View style={styles.techLeft}>
        <View style={[styles.techIconWrap, { backgroundColor: scenario.color + '15' }]}>
          <Ionicons name={iconName as any} size={22} color={scenario.color} />
        </View>
        <View style={styles.techContent}>
          <View style={styles.techTitleRow}>
            <Text style={styles.techTitle}>{scenario.title}</Text>
            <View style={[styles.periodBadge, { backgroundColor: scenario.color + '20' }]}>
              <Text style={[styles.periodText, { color: scenario.color }]}>{scenario.period}</Text>
            </View>
          </View>
          <Text style={styles.techDesc}>{scenario.desc}</Text>
          <View style={styles.techStats}>
            <View style={styles.statItem}>
              <Ionicons name="cube-outline" size={12} color="#6B7280" />
              <Text style={styles.statText}>{scenario.count}个币种</Text>
            </View>
            {scenario.winRate > 0 && (
              <View style={styles.statItem}>
                <Ionicons name="trophy-outline" size={12} color={scenario.winRate >= 70 ? '#FFD700' : '#6B7280'} />
                <Text style={[styles.statText, { color: scenario.winRate >= 70 ? '#FFD700' : '#6B7280' }]}>
                  {scenario.winRate}%胜率
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
      
      {/* 右侧：信号标签 */}
      <View style={styles.techRight}>
        <View style={[styles.signalBadgeLarge, { backgroundColor: scenario.signalColor + '20', borderColor: scenario.signalColor + '40' }]}>
          <Text style={[styles.signalTextLarge, { color: scenario.signalColor }]}>{scenario.signal}</Text>
        </View>
        <View style={styles.directionIcon}>
          {isBullish && <Ionicons name="arrow-up" size={16} color="#00FF88" />}
          {isBearish && <Ionicons name="arrow-down" size={16} color="#FF4444" />}
          {!isBullish && !isBearish && <Ionicons name="remove" size={16} color="#808080" />}
        </View>
      </View>
    </Pressable>
  );
}

// 赛道图标映射
function getIconName(icon: string): keyof typeof Ionicons.glyphMap {
  const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
    defi: 'trending-up',
    meme: 'chatbubbles',
    ai: 'hardware-chip',
    gaming: 'game-controller',
    infrastructure: 'server',
    layer2: 'layers',
    DeFi: 'trending-up',
    Meme: 'chatbubbles',
    AI: 'hardware-chip',
    GameFi: 'game-controller',
    Infrastructure: 'server',
    Layer2: 'layers',
    diamond: 'diamond',
    star: 'star',
    flash: 'flash',
    analytics: 'analytics',
  };
  return iconMap[icon] || 'ellipse';
}

// 赛道快捷卡片（用于热门精选）
function CategoryCard({ cat, onPress }: { cat: any; onPress: () => void }) {
  return (
    <Pressable 
      style={[styles.catCard, { borderColor: cat.color + '40' }]}
      onPress={onPress}
    >
      <View style={[styles.catIcon, { backgroundColor: cat.color + '20' }]}>
        <Ionicons name={cat.icon} size={20} color={cat.color} />
      </View>
      <Text style={styles.catTitle}>{cat.title}</Text>
      <Text style={styles.catCount}>{cat.count}个</Text>
    </Pressable>
  );
}

// 赛道分类实时卡片（用于赛道分类板块）
function CategoryCardV2({ cat, flash, onPress }: { cat: any; flash: boolean; onPress: () => void }) {
  const top10Rank = cat.top10Rank;
  const top10Count = cat.top10Count;
  const hasTop10 = top10Rank > 0 || top10Count > 0;
  
  return (
    <Pressable 
      style={[styles.catCard, flash && styles.catCardFlash]}
      onPress={onPress}
    >
      {/* 排名标签 */}
      {hasTop10 && (
        <View style={styles.rankTag}>
          <Text style={styles.rankText}>TOP{top10Rank || '#'}</Text>
        </View>
      )}
      <View style={[styles.catIcon, { backgroundColor: (cat.color || '#00F0FF') + '20' }]}>
        <Ionicons name={getIconName(cat.icon || cat.id)} size={22} color={cat.color || '#00F0FF'} />
      </View>
      <Text style={styles.catTitle}>{cat.name}</Text>
      <Text style={styles.catCount}>涨幅榜 {cat.gainers?.length || 0} · 跌幅榜 {cat.losers?.length || 0}</Text>
      {/* 热度指示 */}
      {top10Count > 0 && (
        <View style={styles.hotBadge}>
          <Text style={styles.hotText}>HOT {top10Count}</Text>
        </View>
      )}
    </Pressable>
  );
}

// 热门赛道详情卡片组件
function HotScenarioCard({ scenario, flash }: { scenario: any; flash: boolean }) {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <Pressable 
      style={[styles.hotScenarioCard, flash && styles.featuredCardFlash]}
      onPress={() => setExpanded(!expanded)}
    >
      {/* 赛道头部 */}
      <View style={styles.hotScenarioHeader}>
        <View style={[styles.catIcon, { backgroundColor: (scenario.color || '#00F0FF') + '20' }]}>
          <Ionicons name={getIconName(scenario.id)} size={24} color={scenario.color || '#00F0FF'} />
        </View>
        <View style={styles.hotScenarioInfo}>
          <Text style={styles.hotScenarioName}>{scenario.name}</Text>
          <Text style={styles.hotScenarioDesc}>{scenario.description}</Text>
        </View>
        <View style={styles.hotScenarioRight}>
          {scenario.top10Rank && (
            <View style={styles.rankBadge}>
              <Text style={styles.rankBadgeText}>#{scenario.top10Rank}</Text>
            </View>
          )}
          <Ionicons 
            name={expanded ? 'chevron-up' : 'chevron-down'} 
            size={20} 
            color="#6B7280" 
          />
        </View>
      </View>
      
      {/* 涨跌幅榜切换 */}
      {expanded && (
        <View style={styles.billboardContainer}>
          {/* 涨幅榜 */}
          <View style={styles.billboardSection}>
            <View style={styles.billboardHeader}>
              <View style={[styles.billboardBadge, { backgroundColor: '#00FF8833' }]}>
                <Ionicons name="trending-up" size={12} color="#00FF88" />
                <Text style={styles.billboardBadgeText}>涨幅榜</Text>
              </View>
            </View>
            {scenario.gainers?.slice(0, 5).map((token: any, idx: number) => (
              <View key={token.symbol + '-gain'} style={styles.billboardRow}>
                <Text style={styles.billboardRank}>{idx + 1}</Text>
                <Text style={styles.billboardSymbol}>{token.symbol}</Text>
                <Text style={styles.billboardChangeGreen}>+{token.change.toFixed(2)}%</Text>
              </View>
            ))}
          </View>
          
          {/* 跌幅榜 */}
          <View style={styles.billboardSection}>
            <View style={styles.billboardHeader}>
              <View style={[styles.billboardBadge, { backgroundColor: '#FF444433' }]}>
                <Ionicons name="trending-down" size={12} color="#FF4444" />
                <Text style={styles.billboardBadgeText}>跌幅榜</Text>
              </View>
            </View>
            {scenario.losers?.slice(0, 5).map((token: any, idx: number) => (
              <View key={token.symbol + '-loss'} style={styles.billboardRow}>
                <Text style={styles.billboardRank}>{idx + 1}</Text>
                <Text style={styles.billboardSymbol}>{token.symbol}</Text>
                <Text style={styles.billboardChangeRed}>{token.change.toFixed(2)}%</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </Pressable>
  );
}

// 辅助函数
function formatPrice(price: number): string {
  if (price >= 1000) return price.toFixed(0);
  if (price >= 1) return price.toFixed(2);
  if (price >= 0.01) return price.toFixed(3);
  return price.toFixed(4);
}

export default function HomeScreen() {
  const router = useSafeRouter();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState('all');
  const [techFilter, setTechFilter] = useState('all');
  const [techSort, setTechSort] = useState('count');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [countdown, setCountdown] = useState(30);
  
  // 实时技术分析数据
  const [techData, setTechData] = useState<any[]>(TECHNICAL_SCENARIOS);
  const [techStats, setTechStats] = useState<any>({ bullishCount: 0, bearishCount: 0, neutralCount: 0, avgWinRate: 0, totalCoins: 0 });
  const [techLoading, setTechLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [updateFlash, setUpdateFlash] = useState(false);

  // 热门精选实时数据
  const [featuredData, setFeaturedData] = useState<any[]>([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [featuredLastUpdate, setFeaturedLastUpdate] = useState<Date | null>(null);
  const [featuredFlash, setFeaturedFlash] = useState(false);

  // 赛道分类实时数据
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [categoryLastUpdate, setCategoryLastUpdate] = useState<Date | null>(null);
  const [categoryFlash, setCategoryFlash] = useState(false);

  // 兑换功能
  const [swapModalVisible, setSwapModalVisible] = useState(false);
  const [selectedSwapToken, setSelectedSwapToken] = useState<any>(null);
  
  const handleSwapToken = useCallback((token: any) => {
    setSelectedSwapToken(token);
    setSwapModalVisible(true);
  }, []);

  const fetchData = useCallback(() => {
    setLoading(true);
    fetch(API_URL + '/api/v1/screener/featured')
      .then(r => r.json())
      .then(r => { if (r.success) setData(r.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // 获取技术分析实时数据
  const fetchTechData = useCallback(async () => {
    try {
      const response = await fetch(API_URL + '/api/v1/screener/analysis/realtime');
      const result = await response.json();
      if (result.success) {
        setTechData(result.data);
        setTechStats(result.stats);
        setLastUpdate(new Date());
        
        // 触发闪烁效果
        setUpdateFlash(true);
        setTimeout(() => setUpdateFlash(false), 500);
      }
    } catch (error) {
      console.error('Failed to fetch tech data:', error);
    } finally {
      setTechLoading(false);
    }
  }, []);

  // 30秒自动刷新（热门精选）
  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          fetchData();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // 5秒实时更新技术分析数据
  useEffect(() => {
    fetchTechData();
    const techInterval = setInterval(() => {
      fetchTechData();
    }, 5000); // 每5秒更新一次
    return () => clearInterval(techInterval);
  }, [fetchTechData]);

  // 获取热门精选实时数据
  const fetchFeaturedData = useCallback(async () => {
    try {
      const response = await fetch(API_URL + '/api/v1/screener/featured/realtime?scenario=' + (selectedTag === 'all' ? '' : selectedTag));
      const result = await response.json();
      if (result.success) {
        setFeaturedData(result.data);
        setFeaturedLastUpdate(new Date());
        
        // 触发闪烁效果
        setFeaturedFlash(true);
        setTimeout(() => setFeaturedFlash(false), 500);
      }
    } catch (error) {
      console.error('Failed to fetch featured data:', error);
    } finally {
      setFeaturedLoading(false);
    }
  }, [selectedTag]);

  // 5秒实时更新热门精选数据
  useEffect(() => {
    fetchFeaturedData();
    const featuredInterval = setInterval(() => {
      fetchFeaturedData();
    }, 5000); // 每5秒更新一次
    return () => clearInterval(featuredInterval);
  }, [fetchFeaturedData]);

  // 获取赛道分类实时数据
  const fetchCategoryData = useCallback(async () => {
    try {
      const response = await fetch(API_URL + '/api/v1/screener/scenarios/realtime');
      const result = await response.json();
      if (result.success) {
        setCategoryData(result.data);
        setCategoryLastUpdate(new Date());
        
        // 触发闪烁效果
        setCategoryFlash(true);
        setTimeout(() => setCategoryFlash(false), 500);
      }
    } catch (error) {
      console.error('Failed to fetch category data:', error);
    } finally {
      setCategoryLoading(false);
    }
  }, []);

  // 5秒实时更新赛道分类数据
  useEffect(() => {
    fetchCategoryData();
    const categoryInterval = setInterval(() => {
      fetchCategoryData();
    }, 5000); // 每5秒更新一次
    return () => clearInterval(categoryInterval);
  }, [fetchCategoryData]);

  // 过滤数据
  const filteredData = selectedTag === 'all' 
    ? data 
    : data.filter((d: any) => d.scenario === selectedTag);

  // 过滤技术指标（使用实时数据）
  const getFilteredTechScenarios = () => {
    let filtered = [...techData];
    
    if (techFilter === 'bull') {
      filtered = filtered.filter(s => s.signalColor === '#00FF88' || s.signalColor === '#00CED1');
    } else if (techFilter === 'bear') {
      filtered = filtered.filter(s => s.signalColor === '#FF4444');
    } else if (techFilter === 'neutral') {
      filtered = filtered.filter(s => s.signalColor === '#808080' || s.signalColor === '#FFA500' || s.signalColor === '#FF69B4' || s.signalColor === '#FF6347');
    }
    
    // 排序
    if (techSort === 'winRate') {
      filtered.sort((a, b) => (b.winRate || 0) - (a.winRate || 0));
    } else {
      filtered.sort((a, b) => b.count - a.count);
    }
    
    return filtered;
  };

  const filteredTechScenarios = getFilteredTechScenarios();

  return (
    <Screen>
      <ScrollView 
        style={styles.container} 
        refreshControl={
          <RefreshControl 
            refreshing={loading} 
            onRefresh={fetchData} 
            tintColor="#00F0FF" 
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.logo}>KAIROS</Text>
              <Text style={styles.sub}>加密货币行情筛选</Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.headerBtn}>
                <Ionicons name="search" size={22} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerBtn}>
                <Ionicons name="notifications-outline" size={22} color="#FFF" />
                <View style={styles.notifDot} />
              </TouchableOpacity>
            </View>
          </View>
          
          {/* 快捷操作 */}
          <View style={styles.quickActions}>
            <Pressable style={styles.quickBtn}>
              <Ionicons name="flame" size={16} color="#FF6B6B" />
              <Text style={styles.quickBtnText}>热门</Text>
            </Pressable>
            <Pressable style={styles.quickBtn}>
              <Ionicons name="trending-up" size={16} color="#00FF88" />
              <Text style={styles.quickBtnText}>涨幅榜</Text>
            </Pressable>
            <Pressable style={styles.quickBtn}>
              <Ionicons name="trending-down" size={16} color="#FF4444" />
              <Text style={styles.quickBtnText}>跌幅榜</Text>
            </Pressable>
            <Pressable style={styles.quickBtn}>
              <Ionicons name="sparkles" size={16} color="#FFD700" />
              <Text style={styles.quickBtnText}>新币</Text>
            </Pressable>
          </View>
        </View>

        {/* ========== 技术分析板块 ========== */}
        <View style={styles.techSection}>
          {/* 板块标题 */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleWrap}>
              <Text style={styles.sectionLabel}>技术分析</Text>
              <View style={styles.liveIndicator}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>实时监控</Text>
              </View>
            </View>
            <View style={styles.headerRight}>
              <Text style={styles.techCountText}>{filteredTechScenarios.length}个指标</Text>
              <Link href="/analysis" asChild>
                <Pressable style={styles.moreBtn}>
                  <Text style={styles.moreBtnText}>全部</Text>
                  <Ionicons name="chevron-forward" size={14} color="#00F0FF" />
                </Pressable>
              </Link>
            </View>
          </View>

          {/* 筛选和排序 */}
          <View style={styles.techFilterRow}>
            {/* 信号筛选标签 */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.techFilterScroll}>
              {TECH_FILTER_TAGS.map(tag => (
                <Pressable
                  key={tag.id}
                  style={[styles.techFilterTag, techFilter === tag.id && styles.techFilterTagActive]}
                  onPress={() => setTechFilter(tag.id)}
                >
                  <Text style={[styles.techFilterTagText, techFilter === tag.id && styles.techFilterTagTextActive]}>
                    {tag.title}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
            
            {/* 排序按钮 */}
            <TouchableOpacity 
              style={styles.sortBtn}
              onPress={() => setShowSortMenu(!showSortMenu)}
            >
              <Ionicons name="swap-vertical" size={16} color="#6B7280" />
              <Text style={styles.sortBtnText}>排序</Text>
            </TouchableOpacity>
          </View>

          {/* 排序菜单 */}
          {showSortMenu && (
            <View style={styles.sortMenu}>
              {TECH_SORT_OPTIONS.map(opt => (
                <Pressable
                  key={opt.id}
                  style={[styles.sortMenuItem, techSort === opt.id && styles.sortMenuItemActive]}
                  onPress={() => {
                    setTechSort(opt.id);
                    setShowSortMenu(false);
                  }}
                >
                  <Text style={[styles.sortMenuText, techSort === opt.id && styles.sortMenuTextActive]}>
                    {opt.title}
                  </Text>
                  {techSort === opt.id && (
                    <Ionicons name="checkmark" size={16} color="#00F0FF" />
                  )}
                </Pressable>
              ))}
            </View>
          )}

          {/* 技术指标列表 */}
          <View style={styles.techGrid}>
            {filteredTechScenarios.map(s => (
              <TechCard 
                key={s.id} 
                scenario={s} 
                onPress={() => {}} 
              />
            ))}
          </View>

          {/* 统计概览 */}
          <View style={[styles.techSummary, updateFlash && styles.techSummaryFlash]}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{techStats.bullishCount}</Text>
              <Text style={styles.summaryLabel}>做多信号</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: '#FF4444' }]}>{techStats.bearishCount}</Text>
              <Text style={styles.summaryLabel}>做空信号</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{techStats.avgWinRate}%</Text>
              <Text style={styles.summaryLabel}>平均胜率</Text>
            </View>
          </View>
          
          {/* 实时更新状态 */}
          <View style={styles.updateStatus}>
            <View style={styles.updateLeft}>
              <View style={styles.updateDot} />
              <Text style={styles.updateText}>实时监控中</Text>
            </View>
            {lastUpdate && (
              <Text style={styles.lastUpdateText}>
                更新: {lastUpdate.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </Text>
            )}
          </View>
        </View>

        {/* ========== 热门推荐板块 ========== */}
        <View style={styles.featuredSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleWrap}>
              <Text style={styles.sectionLabel}>热门推荐</Text>
              <View style={styles.liveIndicator}>
                <View style={[styles.liveDot, featuredFlash && styles.liveDotFlash]} />
                <Text style={styles.liveText}>实时</Text>
              </View>
            </View>
            <View style={styles.headerRight}>
              <View style={styles.refreshInfo}>
                <Ionicons name="sync-outline" size={12} color="#00F0FF" />
                <Text style={styles.refreshText}>5s</Text>
              </View>
              {featuredLastUpdate && (
                <Text style={styles.updateTimeText}>
                  {featuredLastUpdate.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </Text>
              )}
            </View>
          </View>
          
          {/* 技术分析统计概览 */}
          {featuredData.length > 0 && (
            <View style={styles.techOverview}>
              <View style={styles.techOverviewItem}>
                <Ionicons name="trending-up" size={14} color="#00FF88" />
                <Text style={styles.techOverviewText}>
                  {featuredData.reduce((sum: number, cat: any) => sum + (cat.stats?.bullishTokens || 0), 0)} 个做多信号
                </Text>
              </View>
              <View style={styles.techOverviewItem}>
                <Ionicons name="star" size={14} color="#FFD700" />
                <Text style={styles.techOverviewText}>
                  Top: {featuredData.slice(0, 3).map((c: any) => c.name).join(' > ') || '暂无'}
                </Text>
              </View>
            </View>
          )}
          
          {/* 赛道筛选标签 */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.tagScroll}
            contentContainerStyle={styles.tagContent}
          >
            {FEATURED_TAGS.map(tag => (
              <Pressable
                key={tag.id}
                style={[
                  styles.tag,
                  selectedTag === tag.id && styles.tagActive
                ]}
                onPress={() => setSelectedTag(tag.id)}
              >
                <Text style={[
                  styles.tagText,
                  selectedTag === tag.id && styles.tagTextActive
                ]}>
                  {tag.title}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
          
          {featuredLoading ? (
            <View style={styles.loadingWrap}>
              <Text style={styles.loading}>加载中...</Text>
            </View>
          ) : (
            featuredData.map((cat: any) => {
              const categoryInfo = CATEGORIES.find(c => c.id === cat.id) || { color: '#00F0FF', icon: 'pricetag' };
              return (
                <Pressable 
                  key={cat.id} 
                  style={[styles.featuredCard, featuredFlash && styles.featuredCardFlash]}
                >
                  <CategorySection 
                    category={{ 
                      title: cat.name,
                      desc: cat.desc,
                      icon: categoryInfo.icon,
                      color: cat.color,
                      tokens: cat.tokens,
                      // 传递技术分析信号
                      techStats: cat.stats,
                    }} 
                    onPress={() => router.push('/screener/' + cat.id)}
                    onTokenPress={(token) => router.push('/screener/' + cat.id + '?token=' + encodeURIComponent(JSON.stringify(token)))}
                  />
                </Pressable>
              );
            })
          )}
        </View>

        {/* ========== 热门赛道板块 ========== */}
        <View style={styles.catSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>热门赛道</Text>
            <View style={styles.headerRight}>
              {categoryLoading ? (
                <Text style={styles.techCountText}>加载中...</Text>
              ) : (
                <View style={styles.liveIndicator}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>实时</Text>
                </View>
              )}
            </View>
            <Link href="/categories" asChild>
              <Pressable style={styles.moreBtn}>
                <Text style={styles.moreBtnText}>更多</Text>
                <Ionicons name="chevron-forward" size={14} color="#00F0FF" />
              </Pressable>
            </Link>
          </View>
          
          {categoryLoading ? (
            <View style={{ flex: 1, padding: 40, alignItems: 'center' }}>
              <Text style={{ color: '#6B7280', fontSize: 14 }}>加载中...</Text>
            </View>
          ) : (
            <>
              {/* 热门赛道详情列表 */}
              {categoryData.map((scenario: any) => (
                <HotScenarioCard 
                  key={scenario.id} 
                  scenario={scenario} 
                  flash={categoryFlash}
                />
              ))}

              {/* 今日涨幅榜 & 跌幅榜 */}
              <View style={styles.billboardContainer}>
                {/* 今日涨幅榜 */}
                <View style={styles.billboardSection}>
                  <View style={styles.billboardHeader}>
                    <View style={[styles.billboardBadge, { backgroundColor: '#00FF8833' }]}>
                      <Ionicons name="trending-up" size={12} color="#00FF88" />
                      <Text style={[styles.billboardBadgeText, { color: '#00FF88' }]}>今日涨幅榜</Text>
                    </View>
                    <View style={styles.liveIndicator}>
                      <View style={[styles.liveDot, categoryFlash && styles.liveDotFlash]} />
                      <Text style={styles.liveText}>实时</Text>
                    </View>
                  </View>
                  {categoryData[0]?.globalGainers?.slice(0, 10).map((token: any, idx: number) => (
                    <View key={token.symbol + '-gain'} style={styles.billboardRow}>
                      <Text style={styles.billboardRank}>{idx + 1}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.billboardSymbol}>{token.symbol}</Text>
                        <Text style={styles.billboardName}>{token.name}</Text>
                      </View>
                      <Text style={styles.billboardPrice}>${token.price.toFixed(4)}</Text>
                      <Text style={styles.billboardChangeGreen}>+{token.change.toFixed(2)}%</Text>
                    </View>
                  )) || <Text style={{ color: '#6B7280', fontSize: 12, textAlign: 'center', paddingVertical: 10 }}>暂无数据</Text>}
                </View>

                {/* 今日跌幅榜 */}
                <View style={styles.billboardSection}>
                  <View style={styles.billboardHeader}>
                    <View style={[styles.billboardBadge, { backgroundColor: '#FF444433' }]}>
                      <Ionicons name="trending-down" size={12} color="#FF4444" />
                      <Text style={[styles.billboardBadgeText, { color: '#FF4444' }]}>今日跌幅榜</Text>
                    </View>
                    <View style={styles.liveIndicator}>
                      <View style={[styles.liveDot, categoryFlash && styles.liveDotFlash]} />
                      <Text style={styles.liveText}>实时</Text>
                    </View>
                  </View>
                  {categoryData[0]?.globalLosers?.slice(0, 10).map((token: any, idx: number) => (
                    <View key={token.symbol + '-loss'} style={styles.billboardRow}>
                      <Text style={styles.billboardRank}>{idx + 1}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.billboardSymbol}>{token.symbol}</Text>
                        <Text style={styles.billboardName}>{token.name}</Text>
                      </View>
                      <Text style={styles.billboardPrice}>${token.price.toFixed(4)}</Text>
                      <Text style={styles.billboardChangeRed}>{token.change.toFixed(2)}%</Text>
                    </View>
                  )) || <Text style={{ color: '#6B7280', fontSize: 12, textAlign: 'center', paddingVertical: 10 }}>暂无数据</Text>}
                </View>
              </View>
              
              {/* 资讯快讯 */}
              <View style={styles.billboardSection}>
                <View style={styles.billboardHeader}>
                  <View style={[styles.billboardBadge, { backgroundColor: '#00F0FF22' }]}>
                    <Ionicons name="newspaper" size={12} color="#00F0FF" />
                    <Text style={[styles.billboardBadgeText, { color: '#00F0FF' }]}>资讯快讯</Text>
                  </View>
                  <TouchableOpacity onPress={() => router.push('/news')}>
                    <Text style={{ color: '#00F0FF', fontSize: 12 }}>更多 {'>'}</Text>
                  </TouchableOpacity>
                </View>
                {[
                  { title: 'BTC 突破 70000 USDT，创历史新高', time: '2分钟前', tag: '热点' },
                  { title: 'DeFi 锁仓量突破 2000 亿美元', time: '15分钟前', tag: '行业' },
                  { title: '以太坊 Gas 费降至近期最低', time: '30分钟前', tag: '数据' },
                  { title: 'Meme 币热潮持续，PEPE 领涨', time: '1小时前', tag: '热门' },
                ].map((news: any, idx: number) => (
                  <TouchableOpacity 
                    key={idx}
                    style={styles.newsItem}
                    onPress={() => router.push('/news')}
                  >
                    <View style={styles.newsContent}>
                      <Text style={styles.newsTitle} numberOfLines={2}>{news.title}</Text>
                      <View style={styles.newsMeta}>
                        <Text style={styles.newsTag}>{news.tag}</Text>
                        <Text style={styles.newsTime}>{news.time}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
          
          {/* 实时更新状态 */}
          {categoryLastUpdate && (
            <View style={styles.updateStatus}>
              <View style={styles.updateLeft}>
                <View style={styles.updateDot} />
                <Text style={styles.updateText}>实时监控中</Text>
              </View>
              <Text style={styles.lastUpdateText}>
                更新: {categoryLastUpdate.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </Text>
            </View>
          )}
        </View>

        {/* 底部间距 */}
        <View style={styles.bottomGap} />
      </ScrollView>

      {/* 代币兑换弹窗 */}
      <SwapModal
        visible={swapModalVisible}
        token={selectedSwapToken}
        onClose={() => {
          setSwapModalVisible(false);
          setSelectedSwapToken(null);
        }}
      />

    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F' },
  
  // Header
  header: { padding: 16, paddingTop: 60, backgroundColor: '#0A0A0F' },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  logo: { fontSize: 28, fontWeight: '900', color: '#00F0FF', letterSpacing: 2 },
  sub: { fontSize: 13, color: '#6B7280', marginTop: 4 },
  headerActions: { flexDirection: 'row', gap: 12 },
  headerBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#1A1A24', justifyContent: 'center', alignItems: 'center' },
  notifDot: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF4444' },
  
  // 快捷操作
  quickActions: { flexDirection: 'row', gap: 8, marginTop: 16 },
  quickBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#1A1A24', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
  quickBtnText: { fontSize: 13, color: '#FFF', fontWeight: '500' },
  
  // 通用
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#1F1F2E' },
  sectionTitleWrap: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sectionLabel: { fontSize: 18, fontWeight: '700', color: '#FFF' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  techCountText: { fontSize: 12, color: '#6B7280' },
  moreBtn: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#00F0FF15', borderRadius: 16 },
  moreBtnText: { fontSize: 13, color: '#00F0FF', fontWeight: '600' },
  // 资讯快讯
  newsItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1A1A24' },
  newsContent: { gap: 4 },
  newsTitle: { fontSize: 14, color: '#FFF', fontWeight: '500', lineHeight: 20 },
  newsMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  newsTag: { fontSize: 10, color: '#00F0FF', backgroundColor: '#00F0FF15', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  newsTime: { fontSize: 11, color: '#6B7280' },
  
  bottomGap: { height: 100 },
  
  // ========== 技术分析板块 ==========
  techSection: { padding: 16 },
  liveIndicator: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#00FF88' },
  liveDotFlash: { backgroundColor: '#00F0FF' },
  liveText: { fontSize: 11, color: '#6B7280' },
  
  // 筛选和排序
  techFilterRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  techFilterScroll: { flex: 1 },
  techFilterTag: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, backgroundColor: '#1A1A24', marginRight: 8 },
  techFilterTagActive: { backgroundColor: '#00F0FF20', borderWidth: 1, borderColor: '#00F0FF40' },
  techFilterTagText: { fontSize: 12, color: '#9CA3AF' },
  techFilterTagTextActive: { color: '#00F0FF', fontWeight: '600' },
  sortBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#1A1A24', borderRadius: 16 },
  sortBtnText: { fontSize: 12, color: '#6B7280' },
  
  // 排序菜单
  sortMenu: { backgroundColor: '#1A1A24', borderRadius: 12, padding: 8, marginBottom: 12, borderWidth: 1, borderColor: '#2D2D3A' },
  sortMenuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8 },
  sortMenuItemActive: { backgroundColor: '#00F0FF15' },
  sortMenuText: { fontSize: 13, color: '#9CA3AF' },
  sortMenuTextActive: { color: '#00F0FF', fontWeight: '600' },
  
  // 技术指标卡片
  techGrid: { gap: 10 },
  techCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#12121A',
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  techLeft: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  techIconWrap: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  techContent: { flex: 1 },
  techTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  techTitle: { fontSize: 15, fontWeight: '700', color: '#FFF' },
  periodBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  periodText: { fontSize: 10, fontWeight: '600' },
  techDesc: { fontSize: 12, color: '#6B7280', marginBottom: 6 },
  techStats: { flexDirection: 'row', gap: 12 },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText: { fontSize: 11, color: '#6B7280' },
  techRight: { alignItems: 'center', marginLeft: 12 },
  signalBadgeLarge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, marginBottom: 6 },
  signalTextLarge: { fontSize: 13, fontWeight: '700' },
  directionIcon: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#1A1A24', justifyContent: 'center', alignItems: 'center' },
  
  // 统计概览
  techSummary: { flexDirection: 'row', backgroundColor: '#12121A', borderRadius: 12, padding: 16, marginTop: 16, borderWidth: 1, borderColor: '#1F2937' },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryValue: { fontSize: 22, fontWeight: '800', color: '#FFF', marginBottom: 4 },
  summaryLabel: { fontSize: 11, color: '#6B7280' },
  summaryDivider: { width: 1, backgroundColor: '#2D2D3A' },
  
  // 热门精选
  featuredSection: { padding: 16 },
  refreshInfo: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  refreshText: { fontSize: 12, color: '#6B7280' },
  tagScroll: { marginBottom: 12 },
  tagContent: { gap: 8, paddingRight: 16 },
  tag: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, backgroundColor: '#1A1A24' },
  tagActive: { backgroundColor: '#00F0FF20', borderWidth: 1, borderColor: '#00F0FF40' },
  tagText: { fontSize: 13, color: '#9CA3AF' },
  tagTextActive: { color: '#00F0FF', fontWeight: '600' },
  loadingWrap: { padding: 40, alignItems: 'center' },
  loading: { color: '#6B7280', fontSize: 14 },
  
  // 赛道区块
  categorySection: { backgroundColor: '#12121A', borderRadius: 16, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#1F2937' },
  categoryHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  iconBox: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  categoryTitleWrap: { flex: 1, marginLeft: 10 },
  categoryTitle: { fontSize: 15, fontWeight: '600', color: '#FFF' },
  categoryDesc: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  categoryArrow: { width: 28, height: 28, borderRadius: 8, backgroundColor: '#1A1A24', justifyContent: 'center', alignItems: 'center' },
  tokenList: { gap: 6 },
  miniTokenRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1A1A24', padding: 10, borderRadius: 10 },
  miniTokenLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  miniRank: { fontSize: 12, color: '#6B7280', width: 16 },
  miniSymbol: { fontSize: 14, fontWeight: '600', color: '#FFF' },
  miniTokenRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  miniPrice: { fontSize: 13, fontWeight: '600', color: '#FFF' },
  miniChange: { fontSize: 12, fontWeight: '600', minWidth: 50, textAlign: 'right' },
  
  // 交易按钮行
  tradeBtnRow: { flexDirection: 'row', gap: 6 },
  tradeActionBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, minWidth: 44, alignItems: 'center' },
  buyActionBtn: { backgroundColor: '#00FF8820' },
  sellActionBtn: { backgroundColor: '#FF444420' },
  tradeActionBtnText: { fontSize: 11, fontWeight: '700', color: '#FFF' },
  
  // 技术分析信号样式
  techSignalStats: { flexDirection: 'row', gap: 8, marginBottom: 10, flexWrap: 'wrap' },
  techStatBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#1A1A24', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  techStatText: { fontSize: 11, color: '#9CA3AF' },
  techSignalTag: { marginLeft: 4 },
  techSignalLabel: { fontSize: 9, fontWeight: '600' },
  noSignal: { padding: 12, alignItems: 'center' },
  noSignalText: { fontSize: 12, color: '#6B7280' },
  
  // 技术概览
  techOverview: { flexDirection: 'row', gap: 12, marginBottom: 12, flexWrap: 'wrap' },
  techOverviewItem: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#12121A', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#1F2937' },
  techOverviewText: { fontSize: 12, color: '#9CA3AF' },
  
  // 赛道分类
  catSection: { padding: 16 },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  catCard: {
    width: '31%',
    backgroundColor: '#12121A',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1F2937',
    padding: 14,
    marginBottom: 10,
    alignItems: 'center',
  },
  catCardFlash: {
    borderColor: '#00F0FF',
    borderWidth: 1,
  },
  // 排名标签
  rankTag: {
    position: 'absolute',
    top: -4,
    right: -4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    zIndex: 1,
  },
  rankText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#0A0A0F',
  },
  // 热度标签
  hotBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#FF444420',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  hotText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#FF4444',
  },
  catIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  catTitle: { fontSize: 13, fontWeight: '600', color: '#FFF', marginBottom: 2 },
  catCount: { fontSize: 11, color: '#6B7280' },
  catChange: { fontSize: 12, fontWeight: '600' },
  
  // 热门赛道详情卡片
  hotScenarioCard: {
    backgroundColor: '#12121A',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1F2937',
    padding: 16,
    marginBottom: 12,
  },
  hotScenarioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hotScenarioInfo: {
    flex: 1,
    marginLeft: 12,
  },
  hotScenarioName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  hotScenarioDesc: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  hotScenarioRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rankBadge: {
    backgroundColor: '#00FF8820',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  rankBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00FF88',
  },
  billboardContainer: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 12,
  },
  billboardSection: {
    flex: 1,
  },
  billboardHeader: {
    marginBottom: 8,
  },
  billboardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  billboardBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  billboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    gap: 8,
  },
  billboardRank: {
    width: 16,
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
  },
  billboardSymbol: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
  },
  billboardName: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 1,
  },
  billboardPrice: {
    fontSize: 10,
    color: '#A0A0B0',
    marginRight: 4,
  },
  billboardChangeGreen: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00FF88',
  },
  billboardChangeRed: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FF4444',
  },
  
  // 实时更新效果
  techSummaryFlash: {
    borderColor: '#00F0FF',
    borderWidth: 1,
  },
  updateStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingHorizontal: 4,
  },
  updateLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  updateDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00FF88',
  },
  updateText: {
    fontSize: 11,
    color: '#6B7280',
  },
  lastUpdateText: {
    fontSize: 11,
    color: '#6B7280',
  },

  // 热门精选实时更新
  updateTimeText: {
    fontSize: 11,
    color: '#00F0FF',
    marginLeft: 8,
  },
  featuredCard: {
    marginBottom: 0,
  },
  featuredCardFlash: {
    borderColor: '#00F0FF40',
    borderWidth: 1,
    borderRadius: 16,
  },
});
