/**
 * 首页 - KAIROS DAPP
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, RefreshControl } from 'react-native';
import { Screen } from '@/components/Screen';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9091';

const SCENARIOS = [
  { id: 'defi', title: 'DeFi潜力币', icon: 'swap-horizontal', color: '#00F0FF' },
  { id: 'meme', title: 'Meme币', icon: 'happy-outline', color: '#FFD700' },
  { id: 'ai', title: 'AI赛道', icon: 'bulb-outline', color: '#FF69B4' },
  { id: 'gaming', title: 'GameFi', icon: 'game-controller-outline', color: '#00FF7F' },
  { id: 'infrastructure', title: '基础设施', icon: 'construct-outline', color: '#9370DB' },
  { id: 'layer2', title: 'Layer2', icon: 'layers-outline', color: '#FF6B6B' },
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
          <Text style={{ color: '#00F0FF', fontSize: 12 }}>更多 &gt;</Text>
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

function GridItem({ scenario }: { scenario: any }) {
  return (
    <Pressable style={styles.gridItem}>
      <Link href={'/screener/' + scenario.id} style={styles.gridLink}>
        <View style={[styles.gridIcon, { backgroundColor: scenario.color + '20' }]}>
          <Ionicons name={scenario.icon} size={24} color={scenario.color} />
        </View>
        <Text style={styles.gridText}>{scenario.title}</Text>
      </Link>
    </Pressable>
  );
}

export default function HomeScreen() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(API_URL + '/api/v1/screener/featured')
      .then(r => r.json())
      .then(r => { if (r.success) setData(r.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <Screen>
      <ScrollView style={styles.container} refreshControl={
        <RefreshControl refreshing={loading} onRefresh={() => setLoading(true)} tintColor="#00F0FF" />
      }>
        <View style={styles.header}>
          <Text style={styles.logo}>KAIROS</Text>
          <Text style={styles.sub}>加密货币行情筛选</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>🔥 热门精选</Text>
          </View>
          {loading ? <Text style={styles.loading}>加载中...</Text> : null}
          {data.map(cat => (
            <CategorySection key={cat.scenario} category={{ ...cat.config, tokens: cat.tokens }} />
          ))}
        </View>

        <View style={styles.grid}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>📂 赛道分类</Text>
          </View>
          <View style={styles.gridBox}>
            {SCENARIOS.map(s => (
              <GridItem key={s.id} scenario={s} />
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
  content: { padding: 16 },
  titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 18, fontWeight: '700', color: '#FFF' },
  loading: { color: '#6B7280', textAlign: 'center', padding: 20 },
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
  grid: { padding: 16 },
  gridBox: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  gridItem: { width: '31%', aspectRatio: 1 },
  gridLink: { flex: 1, backgroundColor: '#12121A', borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#1F2937' },
  gridIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  gridText: { fontSize: 11, fontWeight: '600', color: '#FFF', textAlign: 'center' },
});
