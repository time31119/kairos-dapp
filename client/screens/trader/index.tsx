import { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from '@/hooks/useSafeRouter';
import Screen from '@/components/Screen';
import { Ionicons } from '@expo/vector-icons';

interface TraderStats {
  winRate: string;
  totalTrades: number;
  avgProfit: number;
  maxDrawdown: string;
  sharpeRatio: string;
  todayPnl: string;
  weeklyPnL: string;
}

interface Trader {
  id: string;
  platform: string;
  name: string;
  avatar: string;
  avatarUrl?: string;
  country: string;
  winRate: number;
  returns: number;
  followers: number;
  totalTrades: number;
  avgProfit: number;
  specialties: string[];
  strategies: string[];
  riskLevel: string;
  verified: boolean;
  blueTick: boolean;
  lastTradeTime: string;
  todayPnl: string;
  weeklyPnL: string;
  maxDrawdown: string;
  sharpeRatio: string;
}

export default function TraderDetailScreen() {
  const router = useRouter();
  const [trader, setTrader] = useState<Trader | null>(null);
  const [loading, setLoading] = useState(true);
  const [followingLoading, setFollowingLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  const API_BASE = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || '';
  const traderId = 'bin_001';

  const fetchTraderDetail = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/v1/copytrading/traders/${traderId}`);
      if (response.ok) {
        const data = await response.json();
        setTrader(data.trader || data);
      }
    } catch (error) {
      console.error('Failed to fetch trader:', error);
    } finally {
      setLoading(false);
    }
  }, [API_BASE, traderId]);

  const checkFollowStatus = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/copytrading/following`);
      if (response.ok) {
        const data = await response.json();
        const following = data.following || [];
        setIsFollowing(following.some((t: Trader) => t.id === traderId));
      }
    } catch (error) {
      console.error('Failed to check follow status:', error);
    }
  }, [API_BASE, traderId]);

  useEffect(() => {
    fetchTraderDetail();
    checkFollowStatus();
  }, [fetchTraderDetail, checkFollowStatus]);

  const handleFollow = async () => {
    if (!trader) return;
    
    setFollowingLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/v1/copytrading/follow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ traderId: trader.id }),
      });
      
      if (response.ok) {
        setIsFollowing(true);
        Alert.alert('成功', `已成功跟单 ${trader.name}`);
      } else {
        Alert.alert('失败', '跟单失败，请重试');
      }
    } catch (error) {
      Alert.alert('错误', '网络错误，请重试');
    } finally {
      setFollowingLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case '低风险': return '#10B981';
      case '中风险': return '#F59E0B';
      case '高风险': return '#EF4444';
      default: return '#6B7280';
    }
  };

  if (loading) {
    return (
      <Screen>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      </Screen>
    );
  }

  if (!trader) {
    return (
      <Screen>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>未找到交易员信息</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>返回</Text>
          </TouchableOpacity>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBack}>
            <Ionicons name="chevron-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>交易员详情</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Trader Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{trader.name.charAt(0)}</Text>
              </View>
              {trader.verified && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                </View>
              )}
            </View>
            <View style={styles.profileInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.traderName}>{trader.name}</Text>
                {trader.blueTick && (
                  <Ionicons name="checkmark-circle" size={16} color="#3B82F6" style={{ marginLeft: 4 }} />
                )}
              </View>
              <Text style={styles.platformText}>{trader.platform}</Text>
              <View style={styles.riskBadge}>
                <View style={[styles.riskDot, { backgroundColor: getRiskColor(trader.riskLevel) }]} />
                <Text style={styles.riskText}>{trader.riskLevel}</Text>
              </View>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{trader.winRate}%</Text>
              <Text style={styles.statLabel}>胜率</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#10B981' }]}>{trader.returns > 0 ? '+' : ''}{trader.returns}%</Text>
              <Text style={styles.statLabel}>累计收益</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{trader.followers}</Text>
              <Text style={styles.statLabel}>跟单人数</Text>
            </View>
          </View>
        </View>

        {/* Performance Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>业绩表现</Text>
          <View style={styles.performanceCard}>
            <View style={styles.perfRow}>
              <View style={styles.perfItem}>
                <Text style={styles.perfLabel}>今日收益</Text>
                <Text style={styles.perfValueGreen}>{trader.todayPnl || '+0.00%'}</Text>
              </View>
              <View style={styles.perfItem}>
                <Text style={styles.perfLabel}>本周收益</Text>
                <Text style={styles.perfValueGreen}>{trader.weeklyPnL || '+0.00%'}</Text>
              </View>
            </View>
            <View style={styles.perfDivider} />
            <View style={styles.perfRow}>
              <View style={styles.perfItem}>
                <Text style={styles.perfLabel}>最大回撤</Text>
                <Text style={[styles.perfValue, { color: '#EF4444' }]}>{trader.maxDrawdown || '0.00%'}</Text>
              </View>
              <View style={styles.perfItem}>
                <Text style={styles.perfLabel}>夏普比率</Text>
                <Text style={styles.perfValue}>{trader.sharpeRatio || '0.00'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Detailed Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>详细统计</Text>
          <View style={styles.statsCard}>
            <View style={styles.statsGrid}>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>总交易次数</Text>
                <Text style={styles.gridValue}>{trader.totalTrades}</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>平均收益</Text>
                <Text style={styles.gridValue}>{trader.avgProfit}%</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>最近交易</Text>
                <Text style={styles.gridValue}>{trader.lastTradeTime || '刚刚'}</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>擅长领域</Text>
                <Text style={styles.gridValue}>{trader.specialties?.slice(0, 2).join(', ') || '-'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Strategies */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>交易策略</Text>
          <View style={styles.strategiesContainer}>
            {trader.strategies?.map((strategy, index) => (
              <View key={index} style={styles.strategyTag}>
                <Text style={styles.strategyText}>{strategy}</Text>
              </View>
            )) || (
              <Text style={styles.noDataText}>暂无策略信息</Text>
            )}
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Follow Button */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomInfo}>
          <Text style={styles.followersText}>{trader.followers} 人在跟单</Text>
        </View>
        <TouchableOpacity
          style={[styles.followButton, isFollowing && styles.followingButton]}
          onPress={handleFollow}
          disabled={followingLoading || isFollowing}
        >
          {followingLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.followButtonText}>
              {isFollowing ? '已跟单' : '立即跟单'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  headerBack: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  profileCard: {
    margin: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  traderName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  platformText: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  riskBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  riskDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  riskText: {
    fontSize: 12,
    color: '#6B7280',
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  performanceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  perfRow: {
    flexDirection: 'row',
  },
  perfItem: {
    flex: 1,
  },
  perfLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  perfValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 4,
  },
  perfValueGreen: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
    marginTop: 4,
  },
  perfDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridItem: {
    width: '50%',
    marginBottom: 12,
  },
  gridLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  gridValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1F2937',
    marginTop: 4,
  },
  strategiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  strategyTag: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  strategyText: {
    fontSize: 13,
    color: '#4F46E5',
  },
  noDataText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 24,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  bottomInfo: {
    flex: 1,
  },
  followersText: {
    fontSize: 13,
    color: '#6B7280',
  },
  followButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    minWidth: 140,
    alignItems: 'center',
  },
  followingButton: {
    backgroundColor: '#10B981',
  },
  followButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
