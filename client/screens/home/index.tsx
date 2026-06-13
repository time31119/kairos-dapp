/**
 * 首页 - KAIROS DAPP
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, RefreshControl } from 'react-native';
import { Screen } from '@/components/Screen';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9091';

// 赛道分类
const CATEGORIES = [
  { id: 'defi', title: 'DeFi', icon: 'swap-horizontal', color: '#00F0FF' },
  { id: 'meme', title: 'Meme', icon: 'happy-outline', color: '#FFD700' },
  { id: 'ai', title: 'AI', icon: 'bulb-outline', color: '#FF69B4' },
  { id: 'gaming', title: 'GameFi', icon: 'game-controller-outline', color: '#00FF7F' },
  { id: 'infrastructure', title: '基础设施', icon: 'construct-outline', color: '#9370DB' },
  { id: 'layer2', title: 'Layer2', icon: 'layers-outline', color: '#FF6B6B' },
];

// 技术分析场景 - 完善版本
const TECHNICAL_SCENARIOS = [
  { id: '1h_up', title: '1H上涨', icon: 'trending-up', color: '#00F0FF', desc: '短期爆发', signal: '强多', signalColor: '#00FF88' },
  { id: '4h_up', title: '4H上涨', icon: 'trending-up', color: '#00FF88', desc: '波段延续', signal: '看多', signalColor: '#00FF88' },
  { id: 'macd', title: 'MACD金叉', icon: 'sync', color: '#9370DB', desc: '趋势转折', signal: '买入', signalColor: '#00FF88' },
  { id: '1h_down', title: '1H下跌', icon: 'trending-down', color: '#FF4444', desc: '做空机会', signal: '看空', signalColor: '#FF4444' },
  { id: 'rsi', title: 'RSI超卖', icon: 'speedometer', color: '#FFA500', desc: '超卖反弹', signal: '关注', signalColor: '#FFA500' },
  { id: 'volume', title: '成交量异动', icon: 'pulse', color: '#FF69B4', desc: '资金涌入', signal: '放量', signalColor: '#FF69B4' },
  { id: 'bollinger', title: '布林下轨', icon: 'radio-button-on', color: '#00CED1', desc: '支撑反弹', signal: '回踩', signalColor: '#00CED1' },
  { id: 'golden', title: '均线金叉', icon: 'git-merge', color: '#FFD700', desc: '多头发散', signal: '多头', signalColor: '#00FF88' },
];

function TokenRow({ token, rank }: { token: any; rank: number }) {
  const isUp = token.change >= 0;
  return (
    <View style={styles.tokenRow}>
      <Text style={styles.rank}>#{rank}</Text>
      <View style={styles.tokenInfo}>
        <Text style={styles.symbol}>{token.symbol}</Text>
        <Text style={styles.name}>{token.name}</Text>
      </View>
      <View style={styles.priceInfo}>
        <Text style={styles.price}>${token.price < 1 ? token.price.toFixed(4) : token.price.toFixed(2)}</Text>
        <Text style={[styles.change, { color: isUp ? '#00FF88' : '#FF4444' }]}>
          {isUp ? '+' : ''}{token.change.toFixed(1)}%
        </Text>
      </View>
    </View>
  );
}

function CategorySection({ category }: { category: any }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={[styles.iconBox, { backgroundColor: category.color + '20' }]}>
          <Ionicons name={category.icon} size={16} color={category.color} />
        </View>
        <Text style={styles.sectionTitle}>{category.title}</Text>
        <Link href={'/screener/' + category.id} style={styles.more}>
          <Text style={{ color: '#00F0FF', fontSize: 12 }}>更多</Text>
        </Link>
      </View>
      <View style={styles.tokenList}>
        {category.tokens.map((t: any, i: number) => (
          <TokenRow key={t.symbol} token={t} rank={i + 1} />
        ))}
      </View>
    </View>
  );
}

function TechCard({ scenario }: { scenario: any }) {
  return (
    <Pressable 
      style={[styles.techCard, { borderColor: scenario.color + '40' }]}
      onPress={() => {}}
    >
      <View style={[styles.techIconWrap, { backgroundColor: scenario.color + '15' }]}>
        <Ionicons name={scenario.icon} size={18} color={scenario.color} />
      </View>
      <Text style={styles.techTitle}>{scenario.title}</Text>
      <Text style={styles.techDesc}>{scenario.desc}</Text>
      <View style={[styles.signalBadge, { backgroundColor: scenario.signalColor + '20' }]}>
        <Text style={[styles.signalText, { color: scenario.signalColor }]}>{scenario.signal}</Text>
      </View>
    </Pressable>
  );
}

function CategoryCard({ cat }: { cat: any }) {
  return (
    <Pressable style={[styles.catCard, { borderColor: cat.color }]}>
      <View style={[styles.catIcon, { backgroundColor: cat.color + '20' }]}>
        <Ionicons name={cat.icon} size={20} color={cat.color} />
      </View>
      <Text style={styles.catTitle}>{cat.title}</Text>
    </Pressable>
  );
}

export default function HomeScreen() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    fetch(API_URL + '/api/v1/screener/featured')
      .then(r => r.json())
      .then(r => { if (r.success) setData(r.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Screen>
      <ScrollView style={styles.container} refreshControl={
        <RefreshControl refreshing={loading} onRefresh={fetchData} tintColor="#00F0FF" />
      }>
        <View style={styles.header}>
          <Text style={styles.logo}>KAIROS</Text>
          <Text style={styles.sub}>加密货币行情筛选</Text>
        </View>

        {/* 技术分析场景 */}
        <View style={styles.techSection}>
          <View style={styles.techHeader}>
            <Text style={styles.sectionLabel}>技术分析</Text>
            <View style={styles.techStats}>
              <Text style={styles.statsText}>实时监控</Text>
              <View style={styles.liveDot} />
            </View>
          </View>
          <View style={styles.techGrid}>
            {TECHNICAL_SCENARIOS.map(s => (
              <TechCard key={s.id} scenario={s} />
            ))}
          </View>
          <Pressable style={styles.techMore}>
            <Text style={styles.techMoreText}>查看全部技术指标</Text>
            <Ionicons name="chevron-forward" size={16} color="#00F0FF" />
          </Pressable>
        </View>

        {/* 热门精选 */}
        <View style={styles.featuredSection}>
          <Text style={styles.sectionLabel}>热门精选</Text>
          {loading ? <Text style={styles.loading}>加载中...</Text> : null}
          {data.map(cat => (
            <CategorySection key={cat.scenario} category={{ ...cat.config, tokens: cat.tokens }} />
          ))}
        </View>

        {/* 赛道分类 */}
        <View style={styles.catSection}>
          <Text style={styles.sectionLabel}>赛道分类</Text>
          <View style={styles.catGrid}>
            {CATEGORIES.map(c => (
              <CategoryCard key={c.id} cat={c} />
            ))}
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F' },
  header: { padding: 20, paddingTop: 60 },
  logo: { fontSize: 28, fontWeight: '900', color: '#00F0FF', letterSpacing: 2 },
  sub: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  sectionLabel: { fontSize: 16, fontWeight: '700', color: '#FFF', marginBottom: 12 },
  loading: { color: '#6B7280', textAlign: 'center', padding: 20 },
  
  // 技术分析
  techSection: { padding: 16 },
  techHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  techStats: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statsText: { fontSize: 12, color: '#6B7280' },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#00FF88' },
  techGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  techCard: {
    width: '48%',
    backgroundColor: '#12121A',
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  techIconWrap: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  techTitle: { fontSize: 13, fontWeight: '600', color: '#FFF', marginBottom: 2 },
  techDesc: { fontSize: 11, color: '#6B7280', marginBottom: 8 },
  signalBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  signalText: { fontSize: 10, fontWeight: '700' },
  techMore: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 8, paddingVertical: 10 },
  techMoreText: { fontSize: 13, color: '#00F0FF' },
  
  // 热门精选
  featuredSection: { padding: 16 },
  section: { marginBottom: 20, backgroundColor: '#12121A', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#1F2937' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  iconBox: { width: 28, height: 28, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: '#FFF', marginLeft: 8, flex: 1 },
  more: { padding: 4 },
  tokenList: { gap: 8 },
  tokenRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A24', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#374151' },
  rank: { width: 28, fontSize: 12, fontWeight: '700', color: '#9CA3AF' },
  tokenInfo: { flex: 1 },
  symbol: { fontSize: 15, fontWeight: '700', color: '#FFF' },
  name: { fontSize: 12, color: '#6B7280' },
  priceInfo: { alignItems: 'flex-end' },
  price: { fontSize: 14, fontWeight: '600', color: '#FFF' },
  change: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  
  // 赛道分类
  catSection: { padding: 16 },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  catCard: {
    width: '31%',
    aspectRatio: 1,
    backgroundColor: '#12121A',
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  catIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  catTitle: { fontSize: 12, fontWeight: '600', color: '#FFF' },
});
