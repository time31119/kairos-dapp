/**
 * 首页 - KAIROS DAPP
 * 完善版本：增强交互和内容展示
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Screen } from '@/components/Screen';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeRouter } from '@/hooks/useSafeRouter';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9091';

// 赛道分类 - 完整信息
const CATEGORIES = [
  { id: 'defi', title: 'DeFi', icon: 'swap-horizontal', color: '#00F0FF', desc: '去中心化金融', count: 1248 },
  { id: 'meme', title: 'Meme', icon: 'happy-outline', color: '#FFD700', desc: '社区驱动代币', count: 856 },
  { id: 'ai', title: 'AI', icon: 'bulb-outline', color: '#FF69B4', desc: '人工智能+区块链', count: 432 },
  { id: 'gaming', title: 'GameFi', icon: 'game-controller-outline', color: '#00FF7F', desc: '游戏化金融', count: 678 },
  { id: 'infrastructure', title: '基础设施', icon: 'construct-outline', color: '#9370DB', desc: '底层技术设施', count: 523 },
  { id: 'layer2', title: 'Layer2', icon: 'layers-outline', color: '#FF6B6B', desc: '二层扩容方案', count: 312 },
];

// 技术分析场景 - 完整版本
const TECHNICAL_SCENARIOS = [
  { id: '1h_up', title: '1H上涨', icon: 'trending-up', color: '#00F0FF', desc: '短期爆发信号', signal: '强多', signalColor: '#00FF88', count: 23 },
  { id: '4h_up', title: '4H上涨', icon: 'trending-up', color: '#00FF88', desc: '波段延续信号', signal: '看多', signalColor: '#00FF88', count: 18 },
  { id: 'macd', title: 'MACD金叉', icon: 'sync', color: '#9370DB', desc: '趋势转折信号', signal: '买入', signalColor: '#00FF88', count: 31 },
  { id: '1h_down', title: '1H下跌', icon: 'trending-down', color: '#FF4444', desc: '做空机会信号', signal: '看空', signalColor: '#FF4444', count: 15 },
  { id: 'rsi', title: 'RSI超卖', icon: 'speedometer', color: '#FFA500', desc: '超卖反弹信号', signal: '关注', signalColor: '#FFA500', count: 27 },
  { id: 'volume', title: '成交量异动', icon: 'pulse', color: '#FF69B4', desc: '资金涌入信号', signal: '放量', signalColor: '#FF69B4', count: 42 },
  { id: 'bollinger', title: '布林下轨', icon: 'radio-button-on', color: '#00CED1', desc: '支撑反弹信号', signal: '回踩', signalColor: '#00CED1', count: 19 },
  { id: 'golden', title: '均线金叉', icon: 'git-merge', color: '#FFD700', desc: '多头发散信号', signal: '多头', signalColor: '#00FF88', count: 24 },
];

// 热门赛道标签
const FEATURED_TAGS = [
  { id: 'all', title: '全部' },
  { id: 'defi', title: 'DeFi' },
  { id: 'meme', title: 'Meme' },
  { id: 'ai', title: 'AI' },
  { id: 'layer2', title: 'L2' },
];

// 代币行情卡片
function TokenCard({ token, rank }: { token: any; rank: number }) {
  const isUp = token.change >= 0;
  const router = useSafeRouter();
  
  return (
    <Pressable 
      style={styles.tokenCard}
      onPress={() => router.push('/coin', { symbol: token.symbol })}
    >
      <View style={styles.tokenLeft}>
        <Text style={styles.rank}>#{rank}</Text>
        <View style={[styles.tokenIcon, { backgroundColor: getColorForSymbol(token.symbol) + '20' }]}>
          <Text style={[styles.tokenEmoji, { color: getColorForSymbol(token.symbol) }]}>
            {token.symbol.charAt(0)}
          </Text>
        </View>
        <View style={styles.tokenInfo}>
          <Text style={styles.symbol}>{token.symbol}</Text>
          <Text style={styles.name}>{token.name}</Text>
        </View>
      </View>
      <View style={styles.tokenRight}>
        <Text style={styles.price}>${formatPrice(token.price)}</Text>
        <View style={[styles.changeBadge, { backgroundColor: isUp ? '#00FF8820' : '#FF444420' }]}>
          <Ionicons name={isUp ? 'arrow-up' : 'arrow-down'} size={10} color={isUp ? '#00FF88' : '#FF4444'} />
          <Text style={[styles.changeText, { color: isUp ? '#00FF88' : '#FF4444' }]}>
            {Math.abs(token.change).toFixed(1)}%
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

// 赛道区块
function CategorySection({ category, onPress }: { category: any; onPress: () => void }) {
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
      <View style={styles.tokenList}>
        {category.tokens?.slice(0, 3).map((t: any, i: number) => (
          <View key={t.symbol} style={styles.miniTokenRow}>
            <View style={styles.miniTokenLeft}>
              <Text style={styles.miniRank}>{i + 1}</Text>
              <Text style={styles.miniSymbol}>{t.symbol}</Text>
            </View>
            <View style={styles.miniTokenRight}>
              <Text style={styles.miniPrice}>${formatPrice(t.price)}</Text>
              <Text style={[styles.miniChange, { color: t.change >= 0 ? '#00FF88' : '#FF4444' }]}>
                {t.change >= 0 ? '+' : ''}{t.change.toFixed(1)}%
              </Text>
            </View>
          </View>
        ))}
      </View>
    </Pressable>
  );
}

// 技术指标卡片
function TechCard({ scenario, onPress }: { scenario: any; onPress: () => void }) {
  return (
    <Pressable 
      style={[styles.techCard, { borderColor: scenario.color + '40' }]}
      onPress={onPress}
    >
      <View style={[styles.techIconWrap, { backgroundColor: scenario.color + '15' }]}>
        <Ionicons name={scenario.icon} size={18} color={scenario.color} />
      </View>
      <View style={styles.techContent}>
        <Text style={styles.techTitle}>{scenario.title}</Text>
        <Text style={styles.techDesc}>{scenario.desc}</Text>
      </View>
      <View style={styles.techRight}>
        <View style={[styles.signalBadge, { backgroundColor: scenario.signalColor + '20' }]}>
          <Text style={[styles.signalText, { color: scenario.signalColor }]}>{scenario.signal}</Text>
        </View>
        <Text style={styles.techCount}>{scenario.count}个</Text>
      </View>
    </Pressable>
  );
}

// 赛道快捷卡片
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

// 辅助函数
function getColorForSymbol(symbol: string): string {
  const colors = ['#00F0FF', '#FFD700', '#FF69B4', '#00FF7F', '#9370DB', '#FF6B6B'];
  let hash = 0;
  for (let i = 0; i < symbol.length; i++) {
    hash = symbol.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function formatPrice(price: number): string {
  if (price >= 1000) return price.toFixed(0);
  if (price >= 1) return price.toFixed(2);
  if (price >= 0.01) return price.toFixed(3);
  return price.toFixed(4);
}

export default function HomeScreen() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState('all');
  const [countdown, setCountdown] = useState(30);

  const fetchData = () => {
    setLoading(true);
    fetch(API_URL + '/api/v1/screener/featured')
      .then(r => r.json())
      .then(r => { if (r.success) setData(r.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  // 30秒自动刷新
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
  }, []);

  // 过滤数据
  const filteredData = selectedTag === 'all' 
    ? data 
    : data.filter((d: any) => d.scenario === selectedTag);

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
            <Link href="/screener/featured" asChild>
              <Pressable style={styles.quickBtn}>
                <Ionicons name="flame" size={16} color="#FF6B6B" />
                <Text style={styles.quickBtnText}>热门</Text>
              </Pressable>
            </Link>
            <Link href="/screener/gainer" asChild>
              <Pressable style={styles.quickBtn}>
                <Ionicons name="trending-up" size={16} color="#00FF88" />
                <Text style={styles.quickBtnText}>涨幅榜</Text>
              </Pressable>
            </Link>
            <Link href="/screener/loser" asChild>
              <Pressable style={styles.quickBtn}>
                <Ionicons name="trending-down" size={16} color="#FF4444" />
                <Text style={styles.quickBtnText}>跌幅榜</Text>
              </Pressable>
            </Link>
            <Link href="/screener/new" asChild>
              <Pressable style={styles.quickBtn}>
                <Ionicons name="sparkles" size={16} color="#FFD700" />
                <Text style={styles.quickBtnText}>新币</Text>
              </Pressable>
            </Link>
          </View>
        </View>

        {/* 技术分析场景 */}
        <View style={styles.techSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleWrap}>
              <Text style={styles.sectionLabel}>技术分析</Text>
              <View style={styles.liveIndicator}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>实时监控</Text>
              </View>
            </View>
            <Link href="/analysis" asChild>
              <Pressable style={styles.moreBtn}>
                <Text style={styles.moreBtnText}>全部</Text>
                <Ionicons name="chevron-forward" size={14} color="#00F0FF" />
              </Pressable>
            </Link>
          </View>
          <View style={styles.techGrid}>
            {TECHNICAL_SCENARIOS.map(s => (
              <TechCard 
                key={s.id} 
                scenario={s} 
                onPress={() => {}} 
              />
            ))}
          </View>
        </View>

        {/* 热门精选 */}
        <View style={styles.featuredSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>热门精选</Text>
            <View style={styles.refreshInfo}>
              <Ionicons name="refresh-outline" size={12} color="#6B7280" />
              <Text style={styles.refreshText}>{countdown}s</Text>
            </View>
          </View>
          
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
          
          {loading ? (
            <View style={styles.loadingWrap}>
              <Text style={styles.loading}>加载中...</Text>
            </View>
          ) : (
            filteredData.map((cat: any) => (
              <CategorySection 
                key={cat.scenario} 
                category={{ 
                  ...cat.config, 
                  tokens: cat.tokens,
                  color: CATEGORIES.find(c => c.id === cat.scenario)?.color || '#00F0FF',
                  icon: CATEGORIES.find(c => c.id === cat.scenario)?.icon || 'pricetag',
                }} 
                onPress={() => {}}
              />
            ))
          )}
        </View>

        {/* 赛道分类 */}
        <View style={styles.catSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>赛道分类</Text>
            <Link href="/categories" asChild>
              <Pressable style={styles.moreBtn}>
                <Text style={styles.moreBtnText}>更多</Text>
                <Ionicons name="chevron-forward" size={14} color="#00F0FF" />
              </Pressable>
            </Link>
          </View>
          <View style={styles.catGrid}>
            {CATEGORIES.map(c => (
              <CategoryCard 
                key={c.id} 
                cat={c} 
                onPress={() => {}} 
              />
            ))}
          </View>
        </View>

        {/* 底部间距 */}
        <View style={styles.bottomGap} />
      </ScrollView>
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
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitleWrap: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sectionLabel: { fontSize: 17, fontWeight: '700', color: '#FFF' },
  moreBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  moreBtnText: { fontSize: 13, color: '#00F0FF' },
  bottomGap: { height: 100 },
  
  // 技术分析
  techSection: { padding: 16 },
  liveIndicator: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#00FF88' },
  liveText: { fontSize: 11, color: '#6B7280' },
  techGrid: { gap: 10 },
  techCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#12121A',
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  techIconWrap: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  techContent: { flex: 1 },
  techTitle: { fontSize: 14, fontWeight: '600', color: '#FFF', marginBottom: 2 },
  techDesc: { fontSize: 12, color: '#6B7280' },
  techRight: { alignItems: 'flex-end' },
  signalBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginBottom: 4 },
  signalText: { fontSize: 11, fontWeight: '700' },
  techCount: { fontSize: 10, color: '#6B7280' },
  
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
  miniTokenLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  miniRank: { fontSize: 12, color: '#6B7280', width: 16 },
  miniSymbol: { fontSize: 14, fontWeight: '600', color: '#FFF' },
  miniTokenRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  miniPrice: { fontSize: 13, fontWeight: '600', color: '#FFF' },
  miniChange: { fontSize: 12, fontWeight: '600', minWidth: 50, textAlign: 'right' },
  
  // 赛道分类
  catSection: { padding: 16 },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  catCard: {
    width: '31%',
    backgroundColor: '#12121A',
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
    alignItems: 'center',
  },
  catIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  catTitle: { fontSize: 13, fontWeight: '600', color: '#FFF', marginBottom: 2 },
  catCount: { fontSize: 11, color: '#6B7280' },
  
  // 代币卡片
  tokenCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1A1A24', padding: 12, borderRadius: 12, marginBottom: 8 },
  tokenLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  rank: { width: 24, fontSize: 12, fontWeight: '600', color: '#6B7280' },
  tokenIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  tokenEmoji: { fontSize: 16, fontWeight: '700' },
  tokenInfo: { flex: 1 },
  symbol: { fontSize: 14, fontWeight: '700', color: '#FFF' },
  name: { fontSize: 12, color: '#6B7280' },
  tokenRight: { alignItems: 'flex-end' },
  price: { fontSize: 14, fontWeight: '600', color: '#FFF', marginBottom: 4 },
  changeBadge: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingHorizontal: 6, paddingVertical: 3, borderRadius: 4 },
  changeText: { fontSize: 11, fontWeight: '700' },
});
