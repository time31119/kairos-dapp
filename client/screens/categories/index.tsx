import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { useSafeRouter } from '@/hooks/useSafeRouter';

const EXPO_PUBLIC_BACKEND_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9091';

export default function CategoriesScreen() {
  const router = useSafeRouter();
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [globalGainers, setGlobalGainers] = useState<any[]>([]);
  const [globalLosers, setGlobalLosers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/screener/scenarios/realtime`);
      const data = await res.json();
      if (data.success) {
        setScenarios(data.data);
        setGlobalGainers(data.globalGainers || []);
        setGlobalLosers(data.globalLosers || []);
      }
    } catch (err) {
      console.error('Failed to fetch scenarios:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const getIconName = (id: string): keyof typeof Ionicons.glyphMap => {
    const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
      defi: 'trending-up',
      meme: 'chatbubbles',
      ai: 'cpu',
      gaming: 'game-controller',
      infrastructure: 'server',
      layer2: 'layers',
    };
    return iconMap[id] || 'ellipse';
  };

  const formatPrice = (price: number) => {
    if (price >= 1000) return price.toFixed(0);
    if (price >= 1) return price.toFixed(2);
    if (price >= 0.01) return price.toFixed(4);
    return price.toFixed(6);
  };

  const getRankStyle = (idx: number) => {
    if (idx === 0) return { bg: '#FFD700', text: '#000', border: '#FFD700' };
    if (idx === 1) return { bg: '#A8A8A8', text: '#000', border: '#A8A8A8' };
    if (idx === 2) return { bg: '#CD7F32', text: '#FFF', border: '#CD7F32' };
    return { bg: '#1F1F2E', text: '#9CA3AF', border: '#2A2A3A' };
  };

  return (
    <Screen>
      {/* 头部 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>热门赛道</Text>
        <View style={styles.headerRight}>
          {!loading && <View style={styles.liveDot} />}
        </View>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00F0FF" />
            <Text style={styles.loadingText}>加载中...</Text>
          </View>
        ) : (
          <>
            {/* 全球涨跌幅排行榜 - 左右双栏布局 */}
            <View style={styles.billboardWrapper}>
              {/* 涨幅榜 */}
              <View style={styles.billboardHalfCard}>
                <View style={styles.billboardHalfHeader}>
                  <Ionicons name="arrow-up" size={14} color="#00FF88" />
                  <Text style={styles.billboardHalfTitle}>涨幅排行</Text>
                </View>
                <View style={styles.billboardHalfList}>
                  {globalGainers.slice(0, 10).map((token, idx) => {
                    const rankStyle = getRankStyle(idx);
                    return (
                      <View key={token.symbol + '-g'} style={styles.billboardHalfRow}>
                        <View style={[styles.rankBadge, { backgroundColor: rankStyle.bg, borderColor: rankStyle.border }]}>
                          <Text style={[styles.rankBadgeText, { color: rankStyle.text }]}>{idx + 1}</Text>
                        </View>
                        <Text style={styles.tokenSymbol} numberOfLines={1}>{token.symbol}</Text>
                        <Text style={styles.tokenChangeGreen}>+{token.change.toFixed(1)}%</Text>
                      </View>
                    );
                  })}
                </View>
              </View>

              {/* 跌幅榜 */}
              <View style={styles.billboardHalfCard}>
                <View style={styles.billboardHalfHeader}>
                  <Ionicons name="arrow-down" size={14} color="#FF4444" />
                  <Text style={styles.billboardHalfTitle}>跌幅排行</Text>
                </View>
                <View style={styles.billboardHalfList}>
                  {globalLosers.slice(0, 10).map((token, idx) => {
                    const rankStyle = getRankStyle(idx);
                    return (
                      <View key={token.symbol + '-l'} style={styles.billboardHalfRow}>
                        <View style={[styles.rankBadge, { backgroundColor: rankStyle.bg, borderColor: rankStyle.border }]}>
                          <Text style={[styles.rankBadgeText, { color: rankStyle.text }]}>{idx + 1}</Text>
                        </View>
                        <Text style={styles.tokenSymbol} numberOfLines={1}>{token.symbol}</Text>
                        <Text style={styles.tokenChangeRed}>{token.change.toFixed(1)}%</Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            </View>

            {/* 热门赛道列表 */}
            <Text style={styles.sectionTitle}>热门赛道</Text>
            {scenarios.map((scenario) => (
              <TouchableOpacity 
                key={scenario.id} 
                style={[styles.scenarioCard, expandedId === scenario.id && styles.scenarioCardExpanded]}
                onPress={() => setExpandedId(expandedId === scenario.id ? null : scenario.id)}
                activeOpacity={0.7}
              >
                <View style={styles.scenarioMainRow}>
                  <View style={[styles.iconContainer, { backgroundColor: (scenario.color || '#00F0FF') + '20' }]}>
                    <Ionicons name={getIconName(scenario.id)} size={22} color={scenario.color || '#00F0FF'} />
                  </View>
                  <View style={styles.scenarioInfo}>
                    <View style={styles.scenarioTitleRow}>
                      <Text style={styles.scenarioName}>{scenario.name}</Text>
                      {scenario.top10Rank && (
                        <View style={styles.hotBadge}>
                          <Text style={styles.hotBadgeText}>HOT #{scenario.top10Rank}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.scenarioDesc} numberOfLines={1}>{scenario.description}</Text>
                  </View>
                  <Ionicons 
                    name={expandedId === scenario.id ? 'chevron-up' : 'chevron-down'} 
                    size={18} 
                    color="#6B7280" 
                  />
                </View>

                {/* 展开详情 */}
                {expandedId === scenario.id && (
                  <View style={styles.scenarioDetail}>
                    <View style={styles.scenarioStatsRow}>
                      <View style={styles.statItem}>
                        <Text style={styles.statLabel}>涨幅TOP5</Text>
                        <View style={styles.statTokens}>
                          {scenario.gainers?.slice(0, 5).map((t: any) => (
                            <Text key={t.symbol} style={styles.statTokenGreen}>+{t.change.toFixed(1)}% {t.symbol}</Text>
                          ))}
                        </View>
                      </View>
                      <View style={styles.statDivider} />
                      <View style={styles.statItem}>
                        <Text style={styles.statLabel}>跌幅TOP5</Text>
                        <View style={styles.statTokens}>
                          {scenario.losers?.slice(0, 5).map((t: any) => (
                            <Text key={t.symbol} style={styles.statTokenRed}>{t.change.toFixed(1)}% {t.symbol}</Text>
                          ))}
                        </View>
                      </View>
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            ))}
            <View style={styles.bottomPadding} />
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#0A0A0F',
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F2E',
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  headerRight: {
    width: 40,
    alignItems: 'flex-end',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00FF88',
  },
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  
  // 全球排行榜 - 左右双栏
  billboardWrapper: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingTop: 16,
    gap: 10,
  },
  billboardHalfCard: {
    flex: 1,
    backgroundColor: '#12121A',
    borderRadius: 12,
    overflow: 'hidden',
  },
  billboardHalfHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#1A1A26',
    gap: 6,
  },
  billboardHalfTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#E5E7EB',
  },
  billboardHalfList: {
    paddingVertical: 6,
  },
  billboardHalfRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 8,
  },
  rankBadge: {
    width: 22,
    height: 22,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  rankBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  tokenSymbol: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  tokenChangeGreen: {
    fontSize: 12,
    fontWeight: '600',
    color: '#00FF88',
  },
  tokenChangeRed: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF4444',
  },

  // 热门赛道
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 12,
  },
  scenarioCard: {
    backgroundColor: '#12121A',
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 12,
    overflow: 'hidden',
  },
  scenarioCardExpanded: {
    backgroundColor: '#16161F',
  },
  scenarioMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  scenarioInfo: {
    flex: 1,
  },
  scenarioTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  scenarioName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  hotBadge: {
    backgroundColor: '#00F0FF20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  hotBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#00F0FF',
  },
  scenarioDesc: {
    fontSize: 12,
    color: '#6B7280',
  },
  scenarioDetail: {
    borderTopWidth: 1,
    borderTopColor: '#1F1F2E',
    padding: 12,
  },
  scenarioStatsRow: {
    flexDirection: 'row',
  },
  statItem: {
    flex: 1,
    paddingHorizontal: 8,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#1F1F2E',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 6,
  },
  statTokens: {
    gap: 4,
  },
  statTokenGreen: {
    fontSize: 12,
    color: '#00FF88',
  },
  statTokenRed: {
    fontSize: 12,
    color: '#FF4444',
  },
  bottomPadding: {
    height: 40,
  },
});
