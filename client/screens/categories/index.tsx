import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
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
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/screener/scenarios/realtime`);
      const data = await res.json();
      if (data.success) {
        setScenarios(data.data);
        setGlobalGainers(data.globalGainers || []);
        setGlobalLosers(data.globalLosers || []);
        setLastUpdate(new Date());
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

  return (
    <Screen>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>热门赛道</Text>
        <View style={styles.headerRight}>
          {!loading && (
            <View style={styles.liveDot} />
          )}
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
            {/* 全局涨跌幅排行榜 */}
            <View style={styles.billboardSection}>
              {/* 涨幅榜 */}
              <View style={styles.billboardCard}>
                <View style={[styles.billboardHeader, { backgroundColor: '#00FF8815' }]}>
                  <View style={styles.billboardHeaderLeft}>
                    <Ionicons name="trending-up" size={18} color="#00FF88" />
                    <Text style={[styles.billboardTitle, { color: '#00FF88' }]}>全球涨幅榜</Text>
                  </View>
                  <Text style={styles.billboardCount}>TOP 10</Text>
                </View>
                <View style={styles.billboardList}>
                  {globalGainers.map((token, idx) => (
                    <View key={token.symbol + '-g'} style={styles.billboardRow}>
                      <View style={styles.billboardLeft}>
                        <View style={[
                          styles.rankCircle, 
                          idx === 0 && styles.rankCircleGold,
                          idx === 1 && styles.rankCircleSilver,
                          idx === 2 && styles.rankCircleBronze,
                        ]}>
                          <Text style={[
                            styles.rankText, 
                            idx === 0 && styles.rankTextGold,
                            idx === 1 && styles.rankTextSilver,
                            idx === 2 && styles.rankTextBronze,
                          ]}>{idx + 1}</Text>
                        </View>
                        <View style={styles.billboardInfo}>
                          <Text style={styles.billboardSymbol}>{token.symbol}</Text>
                          <Text style={styles.billboardScenario}>{token.scenarioName}</Text>
                        </View>
                      </View>
                      <View style={styles.billboardRight}>
                        <Text style={styles.billboardPrice}>${formatPrice(token.price)}</Text>
                        <View style={styles.changeTagGreen}>
                          <Text style={styles.changeTagText}>+{token.change.toFixed(1)}%</Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              </View>

              {/* 跌幅榜 */}
              <View style={styles.billboardCard}>
                <View style={[styles.billboardHeader, { backgroundColor: '#FF444415' }]}>
                  <View style={styles.billboardHeaderLeft}>
                    <Ionicons name="trending-down" size={18} color="#FF4444" />
                    <Text style={[styles.billboardTitle, { color: '#FF4444' }]}>全球跌幅榜</Text>
                  </View>
                  <Text style={styles.billboardCount}>TOP 10</Text>
                </View>
                <View style={styles.billboardList}>
                  {globalLosers.map((token, idx) => (
                    <View key={token.symbol + '-l'} style={styles.billboardRow}>
                      <View style={styles.billboardLeft}>
                        <View style={[
                          styles.rankCircle, 
                          idx === 0 && styles.rankCircleGold,
                          idx === 1 && styles.rankCircleSilver,
                          idx === 2 && styles.rankCircleBronze,
                        ]}>
                          <Text style={[
                            styles.rankText, 
                            idx === 0 && styles.rankTextGold,
                            idx === 1 && styles.rankTextSilver,
                            idx === 2 && styles.rankTextBronze,
                          ]}>{idx + 1}</Text>
                        </View>
                        <View style={styles.billboardInfo}>
                          <Text style={styles.billboardSymbol}>{token.symbol}</Text>
                          <Text style={styles.billboardScenario}>{token.scenarioName}</Text>
                        </View>
                      </View>
                      <View style={styles.billboardRight}>
                        <Text style={styles.billboardPrice}>${formatPrice(token.price)}</Text>
                        <View style={styles.changeTagRed}>
                          <Text style={styles.changeTagTextRed}>{token.change.toFixed(1)}%</Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            {/* 热门赛道列表 */}
            <Text style={styles.sectionTitle}>热门赛道</Text>
            {scenarios.map((scenario) => (
              <Pressable 
                key={scenario.id} 
                style={[styles.scenarioCard, expandedId === scenario.id && styles.scenarioCardExpanded]}
                onPress={() => setExpandedId(expandedId === scenario.id ? null : scenario.id)}
              >
                {/* 赛道头部 */}
                <View style={styles.scenarioHeader}>
                  <View style={[styles.iconContainer, { backgroundColor: (scenario.color || '#00F0FF') + '20' }]}>
                    <Ionicons name={getIconName(scenario.id)} size={24} color={scenario.color || '#00F0FF'} />
                  </View>
                  <View style={styles.scenarioInfo}>
                    <View style={styles.scenarioTitleRow}>
                      <Text style={styles.scenarioName}>{scenario.name}</Text>
                      {scenario.top10Rank && (
                        <View style={styles.rankBadge}>
                          <Text style={styles.rankBadgeText}>#{scenario.top10Rank}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.scenarioDesc}>{scenario.description}</Text>
                  </View>
                  <Ionicons 
                    name={expandedId === scenario.id ? 'chevron-up' : 'chevron-down'} 
                    size={20} 
                    color="#6B7280" 
                  />
                </View>

                {/* 展开详情 */}
                {expandedId === scenario.id && (
                  <View style={styles.detailContainer}>
                    {/* 涨幅榜 */}
                    <View style={styles.detailSection}>
                      <View style={[styles.detailBadge, { backgroundColor: '#00FF8820' }]}>
                        <Ionicons name="trending-up" size={12} color="#00FF88" />
                        <Text style={[styles.detailBadgeText, { color: '#00FF88' }]}>涨幅榜 TOP10</Text>
                      </View>
                      {scenario.gainers?.map((token: any, idx: number) => (
                        <View key={token.symbol + '-sg'} style={styles.tokenRow}>
                          <Text style={styles.tokenRank}>{idx + 1}</Text>
                          <Text style={styles.tokenSymbol}>{token.symbol}</Text>
                          <Text style={styles.tokenPrice}>${formatPrice(token.price)}</Text>
                          <Text style={styles.tokenChangeGreen}>+{token.change.toFixed(2)}%</Text>
                        </View>
                      ))}
                    </View>

                    {/* 跌幅榜 */}
                    <View style={styles.detailSection}>
                      <View style={[styles.detailBadge, { backgroundColor: '#FF444420' }]}>
                        <Ionicons name="trending-down" size={12} color="#FF4444" />
                        <Text style={[styles.detailBadgeText, { color: '#FF4444' }]}>跌幅榜 TOP10</Text>
                      </View>
                      {scenario.losers?.map((token: any, idx: number) => (
                        <View key={token.symbol + '-sl'} style={styles.tokenRow}>
                          <Text style={styles.tokenRank}>{idx + 1}</Text>
                          <Text style={styles.tokenSymbol}>{token.symbol}</Text>
                          <Text style={styles.tokenPrice}>${formatPrice(token.price)}</Text>
                          <Text style={styles.tokenChangeRed}>{token.change.toFixed(2)}%</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </Pressable>
            ))}

            {/* 实时更新状态 */}
            {lastUpdate && (
              <View style={styles.updateStatus}>
                <View style={styles.updateDot} />
                <Text style={styles.updateText}>
                  最后更新: {lastUpdate.toLocaleTimeString('zh-CN')}
                </Text>
              </View>
            )}
          </>
        )}

        {/* 底部间距 */}
        <View style={styles.bottomGap} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: '#12121A',
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F2E',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerRight: {
    width: 40,
    alignItems: 'center',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00FF88',
  },
  loadingContainer: {
    padding: 60,
    alignItems: 'center',
  },
  loadingText: {
    color: '#6B7280',
    marginTop: 12,
    fontSize: 14,
  },
  
  // 排行榜样式
  billboardSection: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 12,
  },
  billboardCard: {
    flex: 1,
    backgroundColor: '#0F0F18',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1A1A28',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  billboardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A28',
  },
  billboardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  billboardTitle: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  billboardCount: {
    fontSize: 10,
    color: '#4B5563',
    fontWeight: '700',
    backgroundColor: '#1A1A28',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  billboardList: {
    paddingVertical: 6,
  },
  billboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#0A0A12',
  },
  billboardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  rankCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#151520',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#252535',
  },
  rankCircleGold: {
    backgroundColor: '#FFD70030',
    borderColor: '#FFD700',
  },
  rankCircleSilver: {
    backgroundColor: '#C0C0C030',
    borderColor: '#C0C0C0',
  },
  rankCircleBronze: {
    backgroundColor: '#CD7F3230',
    borderColor: '#CD7F32',
  },
  rankText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
  },
  rankTextGold: {
    color: '#FFD700',
  },
  rankTextSilver: {
    color: '#C0C0C0',
  },
  rankTextBronze: {
    color: '#CD7F32',
  },
  billboardInfo: {
    flex: 1,
  },
  billboardSymbol: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  billboardScenario: {
    fontSize: 10,
    color: '#4B5563',
    marginTop: 2,
  },
  billboardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  billboardPrice: {
    fontSize: 10,
    color: '#4B5563',
    fontWeight: '500',
  },
  changeTagGreen: {
    backgroundColor: '#00FF8825',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    minWidth: 68,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#00FF8830',
  },
  changeTagRed: {
    backgroundColor: '#FF444425',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    minWidth: 68,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF444430',
  },
  changeTagText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#00FF88',
    letterSpacing: 0.3,
  },
  changeTagTextRed: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FF4444',
    letterSpacing: 0.3,
  },
  
  // 赛道列表样式
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  scenarioCard: {
    backgroundColor: '#13131A',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1F1F2E',
  },
  scenarioCardExpanded: {
    borderColor: '#00F0FF40',
  },
  scenarioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scenarioInfo: {
    flex: 1,
    marginLeft: 12,
  },
  scenarioTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scenarioName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scenarioDesc: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  rankBadge: {
    backgroundColor: '#00FF8820',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  rankBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#00FF88',
  },
  
  // 展开详情样式
  detailContainer: {
    marginTop: 16,
    gap: 12,
  },
  detailSection: {
    backgroundColor: '#0A0A0F',
    borderRadius: 12,
    padding: 12,
  },
  detailBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  detailBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  tokenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  tokenRank: {
    width: 20,
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  tokenSymbol: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  tokenPrice: {
    fontSize: 11,
    color: '#6B7280',
    marginRight: 12,
  },
  tokenChangeGreen: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00FF88',
    width: 70,
    textAlign: 'right',
  },
  tokenChangeRed: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FF4444',
    width: 70,
    textAlign: 'right',
  },
  
  // 更新状态
  updateStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 6,
  },
  updateDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00FF88',
  },
  updateText: {
    fontSize: 12,
    color: '#6B7280',
  },
  bottomGap: {
    height: 40,
  },
});
