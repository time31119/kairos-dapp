import { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useSafeSearchParams } from '@/hooks/useSafeRouter';
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
  const params = useSafeSearchParams<{ traderId?: string }>();
  const traderId = params.traderId;
  
  const [trader, setTrader] = useState<Trader | null>(null);
  const [stats, setStats] = useState<TraderStats | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [followingLoading, setFollowingLoading] = useState(false);

  const API_BASE = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || '';

  const fetchTraderDetail = useCallback(async () => {
    if (!traderId) return;
    
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/v1/copytrading/traders/${traderId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setTrader(data.data);
          setStats({
            winRate: data.data.winRate?.toFixed(1) || '0',
            totalTrades: data.data.totalTrades || 0,
            avgProfit: data.data.avgProfit || 0,
            maxDrawdown: data.data.maxDrawdown || '0',
            sharpeRatio: data.data.sharpeRatio || '0',
            todayPnl: data.data.todayPnl || '0',
            weeklyPnL: data.data.weeklyPnL || '0',
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch trader detail:', error);
    } finally {
      setLoading(false);
    }
  }, [traderId, API_BASE]);

  useEffect(() => {
    fetchTraderDetail();
  }, [fetchTraderDetail]);

  const handleFollow = async () => {
    if (!trader) return;
    
    try {
      setFollowingLoading(true);
      const response = await fetch(`${API_BASE}/api/v1/copytrading/follow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          traderId: trader.id,
          amount: 100,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setIsFollowing(true);
          Alert.alert('跟单成功', `您已成功跟单 ${trader.name}`);
        }
      }
    } catch (error) {
      console.error('Follow failed:', error);
      Alert.alert('跟单失败', '请稍后重试');
    } finally {
      setFollowingLoading(false);
    }
  };

  const handleUnfollow = async () => {
    if (!trader) return;
    
    try {
      setFollowingLoading(true);
      const response = await fetch(`${API_BASE}/api/v1/copytrading/unfollow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          traderId: trader.id,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setIsFollowing(false);
          Alert.alert('取消跟单', `您已取消跟单 ${trader.name}`);
        }
      }
    } catch (error) {
      console.error('Unfollow failed:', error);
    } finally {
      setFollowingLoading(false);
    }
  };

  if (loading) {
    return (
      <Screen contentContainerStyle={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text style={styles.loadingText}>加载中...</Text>
      </Screen>
    );
  }

  if (!trader) {
    return (
      <Screen contentContainerStyle={styles.errorContainer}>
        <Text style={styles.errorText}>交易员不存在</Text>
      </Screen>
    );
  }

  return (
    <Screen contentContainerStyle={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            {trader.avatarUrl ? (
              <View style={styles.avatar}>
                <Text style={styles.avatarInitial}>{trader.name.charAt(0)}</Text>
              </View>
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarInitial}>{trader.name.charAt(0)}</Text>
              </View>
            )}
            {trader.blueTick && (
              <View style={styles.blueTick}>
                <Ionicons name="checkmark-circle" size={16} color="#00D9FF" />
              </View>
            )}
          </View>
          
          <View style={styles.headerInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{trader.name}</Text>
              <Text style={styles.country}>{trader.country}</Text>
            </View>
            <Text style={styles.platform}>{trader.platform}</Text>
            <View style={styles.followerRow}>
              <Ionicons name="people" size={14} color="#8B8B9A" />
              <Text style={styles.followerText}>{trader.followers.toLocaleString()} 跟单者</Text>
            </View>
          </View>
        </View>

        {/* Risk Badge */}
        <View style={styles.riskBadgeContainer}>
          <View style={[styles.riskBadge, 
            trader.riskLevel === '低' && styles.riskLow,
            trader.riskLevel === '中' && styles.riskMedium,
            trader.riskLevel === '高' && styles.riskHigh,
            trader.riskLevel === '极高' && styles.riskVeryHigh
          ]}>
            <Text style={styles.riskText}>风险等级: {trader.riskLevel}</Text>
          </View>
        </View>

        {/* Performance */}
        <View style={styles.performanceCard}>
          <Text style={styles.sectionTitle}>业绩表现</Text>
          <View style={styles.performanceGrid}>
            <View style={styles.performanceItem}>
              <Text style={styles.performanceValue}>+{trader.returns.toFixed(1)}%</Text>
              <Text style={styles.performanceLabel}>累计收益</Text>
            </View>
            <View style={styles.performanceItem}>
              <Text style={styles.performanceValue}>{trader.winRate.toFixed(1)}%</Text>
              <Text style={styles.performanceLabel}>胜率</Text>
            </View>
            <View style={styles.performanceItem}>
              <Text style={[styles.performanceValue, parseFloat(trader.todayPnl) >= 0 ? styles.positive : styles.negative]}>
                {parseFloat(trader.todayPnl) >= 0 ? '+' : ''}{trader.todayPnl}%
              </Text>
              <Text style={styles.performanceLabel}>今日收益</Text>
            </View>
            <View style={styles.performanceItem}>
              <Text style={[styles.performanceValue, parseFloat(trader.weeklyPnL) >= 0 ? styles.positive : styles.negative]}>
                {parseFloat(trader.weeklyPnL) >= 0 ? '+' : ''}{trader.weeklyPnL}%
              </Text>
              <Text style={styles.performanceLabel}>本周收益</Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsCard}>
          <Text style={styles.sectionTitle}>详细数据</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>总交易次数</Text>
              <Text style={styles.statValue}>{trader.totalTrades.toLocaleString()}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>平均收益</Text>
              <Text style={styles.statValue}>${trader.avgProfit.toLocaleString()}</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>最大回撤</Text>
              <Text style={[styles.statValue, styles.negative]}>{trader.maxDrawdown}%</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>夏普比率</Text>
              <Text style={styles.statValue}>{trader.sharpeRatio}</Text>
            </View>
          </View>
        </View>

        {/* Specialties */}
        <View style={styles.specialtiesCard}>
          <Text style={styles.sectionTitle}>擅长领域</Text>
          <View style={styles.tagContainer}>
            {trader.specialties.map((specialty, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{specialty}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Strategies */}
        <View style={styles.strategiesCard}>
          <Text style={styles.sectionTitle}>交易策略</Text>
          <View style={styles.tagContainer}>
            {trader.strategies.map((strategy, index) => (
              <View key={index} style={[styles.tag, styles.strategyTag]}>
                <Text style={[styles.tagText, styles.strategyTagText]}>{strategy}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Last Trade */}
        <View style={styles.lastTradeCard}>
          <View style={styles.lastTradeRow}>
            <Ionicons name="time-outline" size={16} color="#8B8B9A" />
            <Text style={styles.lastTradeText}>
              最后交易: {new Date(trader.lastTradeTime).toLocaleString('zh-CN')}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Follow Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.followButton, isFollowing && styles.followingButton]}
          onPress={isFollowing ? handleUnfollow : handleFollow}
          disabled={followingLoading}
        >
          {followingLoading ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <>
              <Ionicons 
                name={isFollowing ? 'checkmark' : 'add'} 
                size={20} 
                color="#FFF" 
              />
              <Text style={styles.followButtonText}>
                {isFollowing ? '已跟单' : '立即跟单'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0F',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0D0D0F',
  },
  loadingText: {
    color: '#8B8B9A',
    marginTop: 12,
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0D0D0F',
  },
  errorText: {
    color: '#FF4757',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
  },
  blueTick: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#0D0D0F',
    borderRadius: 8,
  },
  headerInfo: {
    marginLeft: 16,
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  country: {
    fontSize: 16,
    marginLeft: 6,
  },
  platform: {
    fontSize: 14,
    color: '#8B8B9A',
    marginTop: 2,
  },
  followerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  followerText: {
    fontSize: 13,
    color: '#8B8B9A',
    marginLeft: 4,
  },
  riskBadgeContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  riskBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#2A2A35',
  },
  riskLow: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
  },
  riskMedium: {
    backgroundColor: 'rgba(250, 204, 21, 0.2)',
  },
  riskHigh: {
    backgroundColor: 'rgba(249, 115, 22, 0.2)',
  },
  riskVeryHigh: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  riskText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  performanceCard: {
    marginHorizontal: 16,
    backgroundColor: '#13131A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  performanceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  performanceItem: {
    width: '50%',
    paddingVertical: 8,
  },
  performanceValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#22C55E',
  },
  performanceLabel: {
    fontSize: 12,
    color: '#8B8B9A',
    marginTop: 4,
  },
  positive: {
    color: '#22C55E',
  },
  negative: {
    color: '#EF4444',
  },
  statsCard: {
    marginHorizontal: 16,
    backgroundColor: '#13131A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#8B8B9A',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  specialtiesCard: {
    marginHorizontal: 16,
    backgroundColor: '#13131A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  tagText: {
    fontSize: 13,
    color: '#A78BFA',
  },
  strategiesCard: {
    marginHorizontal: 16,
    backgroundColor: '#13131A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  strategyTag: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  strategyTagText: {
    color: '#60A5FA',
  },
  lastTradeCard: {
    marginHorizontal: 16,
    backgroundColor: '#13131A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 100,
  },
  lastTradeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastTradeText: {
    fontSize: 13,
    color: '#8B8B9A',
    marginLeft: 6,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#0D0D0F',
    borderTopWidth: 1,
    borderTopColor: '#1F1F2E',
  },
  followButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  followingButton: {
    backgroundColor: '#22C55E',
  },
  followButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
