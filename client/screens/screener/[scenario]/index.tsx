import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Screen } from '@/components/Screen';
import { useSafeRouter, useSafeSearchParams } from '@/hooks/useSafeRouter';
import { Ionicons } from '@expo/vector-icons';

export default function ScreenerScenarioScreen() {
  const router = useSafeRouter();
  const { scenario } = useSafeSearchParams<{ scenario: string }>();
  
  const titleMap: Record<string, string> = {
    'featured': '热门代币',
    'topgainers': '涨幅榜',
    'toplosers': '跌幅榜',
    'defi': 'DeFi',
    'meme': 'Meme',
    'ai': 'AI',
    'layer2': 'Layer2',
  };

  return (
    <Screen>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.title}>{titleMap[scenario || ''] || '行情筛选'}</Text>
        <View style={styles.placeholder} />
      </View>
      
      <FlatList
        data={[]}
        keyExtractor={(item: any) => item.symbol}
        renderItem={() => null}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="search-outline" size={48} color="#6B7280" />
            <Text style={styles.emptyText}>暂无数据</Text>
          </View>
        }
        contentContainerStyle={styles.list}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 60,
    backgroundColor: '#0A0A0F',
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F2E',
  },
  backBtn: { padding: 4 },
  title: { fontSize: 18, fontWeight: '600', color: '#FFF' },
  placeholder: { width: 32 },
  list: { flex: 1, padding: 16 },
  empty: { alignItems: 'center', justifyContent: 'center', paddingTop: 100 },
  emptyText: { color: '#6B7280', fontSize: 16, marginTop: 12 },
});
