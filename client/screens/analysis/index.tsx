import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { Link } from 'expo-router';

const EXPO_PUBLIC_BACKEND_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9091';

export default function AnalysisScreen() {
  const [analysisData, setAnalysisData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [filterSignal, setFilterSignal] = useState<string>('all');

  const fetchAnalysis = useCallback(async () => {
    try {
      const res = await fetch(`${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/screener/analysis/realtime`);
      const data = await res.json();
      if (data.success && data.data) {
        setAnalysisData(data.data);
        setLastUpdate(new Date());
      }
    } catch (err) {
      console.error('Failed to fetch analysis:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalysis();
    const interval = setInterval(fetchAnalysis, 5000);
    return () => clearInterval(interval);
  }, [fetchAnalysis]);

  const getSignalColor = (signal: string) => {
    if (signal.includes('多') || signal.includes('买') || signal.includes('回') || signal.includes('放')) return '#00FF88';
    if (signal.includes('空') || signal.includes('警')) return '#FF4444';
    return '#FFD700';
  };

  const getSignalLabel = (signal: string) => signal;

  const getDirectionIcon = (direction: string, icon: string) => {
    // 优先使用 API 返回的 icon 字段
    const iconMap: Record<string, string> = {
      'trending-up': 'trending-up',
      'trending-down': 'trending-down',
      'stats-chart': 'stats-chart',
      'pulse': 'pulse',
      'bar-chart': 'bar-chart',
      'git-network': 'git-network',
      'bulb': 'bulb',
      'speedometer': 'speedometer',
      'resize': 'resize',
      'ellipse': 'ellipse',
    };
    return (iconMap[icon] || iconMap[direction] || 'ellipse') as any;
  };

  const filteredData = analysisData.filter(item => {
    if (filterSignal === 'all') return true;
    if (filterSignal === 'bullish') return item.signal.includes('多') || item.signal.includes('买') || item.signal.includes('回') || item.signal.includes('放');
    if (filterSignal === 'bearish') return item.signal.includes('空') || item.signal.includes('警');
    if (filterSignal === 'neutral') return item.signal.includes('观') || item.signal.includes('整');
    return true;
  });

  const bullishCount = analysisData.filter(item => item.signal.includes('多') || item.signal.includes('买') || item.signal.includes('回') || item.signal.includes('放')).length;
  const bearishCount = analysisData.filter(item => item.signal.includes('空') || item.signal.includes('警')).length;
  const neutralCount = analysisData.filter(item => item.signal.includes('观') || item.signal.includes('整')).length;
  const avgWinRate = analysisData.length > 0 
    ? Math.round(analysisData.reduce((sum, item) => sum + (item.winRate || 0), 0) / analysisData.length)
    : 0;

  return (
    <Screen>
      <View style={styles.header}>
        <Link href="/" asChild>
          <Pressable style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </Pressable>
        </Link>
        <Text style={styles.headerTitle}>技术分析</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* 统计概览 */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <View style={[styles.statDot, { backgroundColor: '#00FF88' }]} />
            <Text style={styles.statValue}>{bullishCount}</Text>
            <Text style={styles.statLabel}>做多</Text>
          </View>
          <View style={styles.statItem}>
            <View style={[styles.statDot, { backgroundColor: '#FF4444' }]} />
            <Text style={styles.statValue}>{bearishCount}</Text>
            <Text style={styles.statLabel}>做空</Text>
          </View>
          <View style={styles.statItem}>
            <View style={[styles.statDot, { backgroundColor: '#FFD700' }]} />
            <Text style={styles.statValue}>{neutralCount}</Text>
            <Text style={styles.statLabel}>观望</Text>
          </View>
          <View style={styles.statItem}>
            <View style={[styles.statDot, { backgroundColor: '#00F0FF' }]} />
            <Text style={styles.statValue}>{avgWinRate}%</Text>
            <Text style={styles.statLabel}>平均胜率</Text>
          </View>
        </View>

        {/* 筛选标签 */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
          {[
            { key: 'all', label: '全部', color: '#00F0FF' },
            { key: 'bullish', label: '做多信号', color: '#00FF88' },
            { key: 'bearish', label: '做空信号', color: '#FF4444' },
            { key: 'neutral', label: '观望信号', color: '#FFD700' },
          ].map(filter => (
            <Pressable
              key={filter.key}
              style={[
                styles.filterTag,
                filterSignal === filter.key && { backgroundColor: filter.color + '20', borderColor: filter.color }
              ]}
              onPress={() => setFilterSignal(filter.key)}
            >
              <Text style={[
                styles.filterText,
                filterSignal === filter.key && { color: filter.color }
              ]}>
                {filter.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* 技术指标列表 */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>加载中...</Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {filteredData.map((item: any, index: number) => (
              <View key={index} style={styles.analysisCard}>
                <View style={styles.cardHeader}>
                  <View style={[styles.iconContainer, { backgroundColor: getSignalColor(item.signal) + '20' }]}>
                    <Ionicons 
                      name={getDirectionIcon(item.direction, item.icon)} 
                      size={22} 
                      color={getSignalColor(item.signal)} 
                    />
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.cardDesc}>{item.desc}</Text>
                  </View>
                  <View style={[styles.signalBadge, { backgroundColor: getSignalColor(item.signal) + '20' }]}>
                    <Text style={[styles.signalText, { color: getSignalColor(item.signal) }]}>
                      {getSignalLabel(item.signal)}
                    </Text>
                  </View>
                </View>
                <View style={styles.cardFooter}>
                  <View style={styles.footerItem}>
                    <Text style={styles.footerLabel}>时间周期</Text>
                    <Text style={styles.footerValue}>{item.period || '1H'}</Text>
                  </View>
                  <View style={styles.footerItem}>
                    <Text style={styles.footerLabel}>币种数量</Text>
                    <Text style={styles.footerValue}>{item.count || 0}</Text>
                  </View>
                  <View style={styles.footerItem}>
                    <Text style={styles.footerLabel}>胜率</Text>
                    <Text style={[
                      styles.footerValue,
                      (item.winRate || 0) >= 70 && styles.highlightValue
                    ]}>
                      {item.winRate || 0}%
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* 实时更新状态 */}
        {lastUpdate && (
          <View style={styles.updateStatus}>
            <View style={styles.updateDot} />
            <Text style={styles.updateText}>
              最后更新: {lastUpdate.toLocaleTimeString('zh-CN')}
            </Text>
          </View>
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
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F2E',
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
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: '#13131A',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1F1F2E',
  },
  statItem: {
    alignItems: 'center',
  },
  statDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterTag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#13131A',
    borderWidth: 1,
    borderColor: '#1F1F2E',
  },
  filterText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  loadingContainer: {
    padding: 60,
    alignItems: 'center',
  },
  loadingText: {
    color: '#6B7280',
    fontSize: 14,
  },
  listContainer: {
    padding: 16,
    gap: 12,
  },
  analysisCard: {
    backgroundColor: '#13131A',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1F1F2E',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 12,
    color: '#6B7280',
  },
  signalBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  signalText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#1F1F2E',
    paddingTop: 12,
  },
  footerItem: {
    alignItems: 'center',
  },
  footerLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 4,
  },
  footerValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  highlightValue: {
    color: '#FFD700',
  },
  updateStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
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
