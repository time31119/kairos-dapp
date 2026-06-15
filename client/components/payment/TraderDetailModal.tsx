/**
 * 交易员详情弹窗组件
 * 展示交易员详细信息、历史交易、业绩表现
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const API_BASE = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || ''

interface TraderDetail {
  id: string;
  name: string;
  platform: string;
  avatarUrl?: string;
  country?: string;
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
  lastTradeTime?: string;
  todayPnl?: string;
  weeklyPnL?: string;
  maxDrawdown?: string;
  sharpeRatio?: string;
  recentTrades?: any[];
  performance?: {
    '1d': string;
    '7d': string;
    '30d': string;
    'allTime': string;
  };
}

interface TraderDetailModalProps {
  visible: boolean;
  trader: TraderDetail | null;
  onClose: () => void;
  onFollow: (traderId: string, amount: number) => Promise<boolean>;
}

const RISK_COLORS: Record<string, string> = {
  '低': '#00FF88',
  '中': '#FFB800',
  '高': '#FF6B6B',
  '极高': '#FF0055',
};

export default function TraderDetailModal({
  visible,
  trader,
  onClose,
  onFollow,
}: TraderDetailModalProps) {
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<TraderDetail | null>(null);
  const [followAmount, setFollowAmount] = useState(100);
  const [following, setFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState<'performance' | 'trades'>('performance');

  useEffect(() => {
    if (trader && visible) {
      fetchTraderDetail(trader.id);
    }
  }, [trader, visible]);

  const fetchTraderDetail = async (traderId: string) => {
    setLoading(true);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(`${API_BASE}/api/v1/copytrading/traders/${traderId}`, {
        signal: controller.signal,
      });
      clearTimeout(timeout);
      
      if (response.ok) {
        const data = await response.json();
        setDetail(data.data);
      }
    } catch (error) {
      console.log('获取交易员详情失败');
      // 使用传入的交易员数据
      setDetail(trader);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!detail) return;
    
    try {
      const success = await onFollow(detail.id, followAmount);
      if (success) {
        setFollowing(true);
        Alert.alert('跟单成功', `已成功跟单 ${detail.name}，跟单金额 $${followAmount}`);
      }
    } catch (error) {
      Alert.alert('跟单失败', '请稍后重试');
    }
  };

  if (!trader) return null;

  const displayData = detail || trader;

  const AMOUNT_OPTIONS = [50, 100, 200, 500, 1000];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay as any}>
        <View style={styles.modalContent as any}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>交易员详情</Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#00F0FF" />
              </View>
            ) : (
              <>
                {/* Trader Info */}
                <View style={styles.traderInfo}>
                  <View style={styles.avatarContainer}>
                    {displayData.avatarUrl ? (
                      <Image source={{ uri: displayData.avatarUrl }} style={styles.avatar} />
                    ) : (
                      <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarText}>
                          {displayData.name.charAt(0)}
                        </Text>
                      </View>
                    )}
                    {displayData.blueTick && (
                      <View style={styles.blueTick}>
                        <Ionicons name="checkmark-circle" size={16} color="#00F0FF" />
                      </View>
                    )}
                  </View>
                  <Text style={styles.traderName}>
                    {displayData.name}
                    {displayData.verified && (
                      <Ionicons name="shield-checkmark" size={16} color="#00F0FF" />
                    )}
                  </Text>
                  <Text style={styles.traderMeta}>
                    {displayData.country} {displayData.platform}
                  </Text>
                  
                  {/* Risk Level Badge */}
                  <View style={[
                    styles.riskBadge,
                    { backgroundColor: (RISK_COLORS[displayData.riskLevel] || '#8B8B9A') + '20' }
                  ]}>
                    <Text style={[
                      styles.riskText,
                      { color: RISK_COLORS[displayData.riskLevel] || '#8B8B9A' }
                    ]}>
                      风险等级: {displayData.riskLevel}
                    </Text>
                  </View>
                </View>

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: '#00FF88' }]}>
                      +{displayData.returns?.toFixed(1)}%
                    </Text>
                    <Text style={styles.statLabel}>累计收益</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: '#00F0FF' }]}>
                      {displayData.winRate?.toFixed(1)}%
                    </Text>
                    <Text style={styles.statLabel}>胜率</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                      {(displayData.followers / 1000).toFixed(1)}k
                    </Text>
                    <Text style={styles.statLabel}>跟单人数</Text>
                  </View>
                </View>

                {/* Performance Tabs */}
                <View style={styles.tabNav}>
                  <TouchableOpacity
                    style={[styles.tabItem, activeTab === 'performance' && styles.tabItemActive]}
                    onPress={() => setActiveTab('performance')}
                  >
                    <Text style={[styles.tabText, activeTab === 'performance' && styles.tabTextActive]}>
                      业绩表现
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.tabItem, activeTab === 'trades' && styles.tabItemActive]}
                    onPress={() => setActiveTab('trades')}
                  >
                    <Text style={[styles.tabText, activeTab === 'trades' && styles.tabTextActive]}>
                      历史交易
                    </Text>
                  </TouchableOpacity>
                </View>

                {activeTab === 'performance' ? (
                  <View style={styles.performanceContent as any}>
                    {/* Period Performance */}
                    <View style={styles.periodGrid as any}>
                      <View style={styles.periodItem as any}>
                        <Text style={styles.periodLabel}>今日</Text>
                        <Text style={[
                          styles.periodValue,
                          { color: Number(displayData.todayPnl) >= 0 ? '#00FF88' : '#FF4444' }
                        ]}>
                          {displayData.todayPnl}%
                        </Text>
                      </View>
                      <View style={styles.periodItem as any}>
                        <Text style={styles.periodLabel}>本周</Text>
                        <Text style={styles.periodValue}>+{displayData.weeklyPnL}%</Text>
                      </View>
                      <View style={styles.periodItem as any}>
                        <Text style={styles.periodLabel}>最大回撤</Text>
                        <Text style={[styles.periodValue, { color: '#FF6B6B' }]}>
                          -{displayData.maxDrawdown}%
                        </Text>
                      </View>
                      <View style={styles.periodItem as any}>
                        <Text style={styles.periodLabel}>夏普比率</Text>
                        <Text style={styles.periodValue}>{displayData.sharpeRatio}</Text>
                      </View>
                    </View>

                    {/* All Time Performance */}
                    <View style={styles.performanceCard}>
                      <Text style={styles.performanceTitle}>累计表现</Text>
                      <View style={styles.performanceRow}>
                        <Text style={styles.performanceLabel}>总交易次数</Text>
                        <Text style={styles.performanceValue}>{displayData.totalTrades}</Text>
                      </View>
                      <View style={styles.performanceRow}>
                        <Text style={styles.performanceLabel}>平均收益</Text>
                        <Text style={styles.performanceValue}>${displayData.avgProfit}</Text>
                      </View>
                    </View>

                    {/* Specialties */}
                    <View style={styles.specialtiesSection}>
                      <Text style={styles.sectionTitle}>擅长领域</Text>
                      <View style={styles.tagsContainer}>
                        {displayData.specialties?.map((tag, i) => (
                          <View key={i} style={styles.tag}>
                            <Text style={styles.tagText}>{tag}</Text>
                          </View>
                        ))}
                      </View>
                    </View>

                    {/* Strategies */}
                    <View style={styles.strategiesSection}>
                      <Text style={styles.sectionTitle}>交易策略</Text>
                      <View style={styles.tagsContainer}>
                        {displayData.strategies?.map((strategy, i) => (
                          <View key={i} style={[styles.tag, styles.strategyTag]}>
                            <Ionicons name="trending-up" size={12} color="#00F0FF" />
                            <Text style={[styles.tagText, { color: '#00F0FF' }]}>{strategy}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  </View>
                ) : (
                  <View style={styles.tradesContent}>
                    {displayData.recentTrades?.map((trade: any, index: number) => (
                      <View key={trade.id || index} style={styles.tradeItem}>
                        <View style={styles.tradeLeft}>
                          <View style={[
                            styles.tradeSide,
                            { backgroundColor: trade.side === '做多' ? '#00FF8820' : '#FF444420' }
                          ]}>
                            <Text style={[
                              styles.tradeSideText,
                              { color: trade.side === '做多' ? '#00FF88' : '#FF4444' }
                            ]}>
                              {trade.side}
                            </Text>
                          </View>
                          <View style={styles.tradeInfo}>
                            <Text style={styles.tradeSymbol}>{trade.symbol}</Text>
                            <Text style={styles.tradeTime}>
                              {new Date(trade.closeTime).toLocaleDateString()}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.tradeRight}>
                          <Text style={[
                            styles.tradePnl,
                            { color: Number(trade.pnl) >= 0 ? '#00FF88' : '#FF4444' }
                          ]}>
                            {Number(trade.pnl) >= 0 ? '+' : ''}{trade.pnl} USDT
                          </Text>
                          <Text style={[
                            styles.tradePnlRate,
                            { color: Number(trade.pnlRate) >= 0 ? '#00FF88' : '#FF4444' }
                          ]}>
                            {Number(trade.pnlRate) >= 0 ? '+' : ''}{trade.pnlRate}%
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </>
            )}
          </ScrollView>

          {/* Follow Section */}
          {!loading && (
            <View style={styles.followSection}>
              {/* Amount Selection */}
              <Text style={styles.followTitle}>选择跟单金额</Text>
              <View style={styles.amountOptions}>
                {AMOUNT_OPTIONS.map((amount) => (
                  <TouchableOpacity
                    key={amount}
                    style={[
                      styles.amountBtn,
                      followAmount === amount && styles.amountBtnActive
                    ]}
                    onPress={() => setFollowAmount(amount)}
                  >
                    <Text style={[
                      styles.amountBtnText,
                      followAmount === amount && styles.amountBtnTextActive
                    ]}>
                      ${amount}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Follow Button */}
              <TouchableOpacity
                style={[
                  styles.followBtn,
                  following && styles.followingBtn
                ]}
                onPress={handleFollow}
                disabled={following}
              >
                <Ionicons
                  name={following ? 'checkmark' : 'git-network'}
                  size={20}
                  color={following ? '#00FF88' : '#0A0A0F'}
                />
                <Text style={[
                  styles.followBtnText,
                  following && styles.followingBtnText
                ]}>
                  {following ? '已跟单' : `跟单 $${followAmount}`}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = {
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end' as const,
  },
  modalContent: {
    backgroundColor: '#0A0A0F',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F2E',
  },
  closeBtn: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  placeholder: {
    width: 32,
  },
  scrollContent: {
    maxHeight: 400,
  },
  loadingContainer: {
    padding: 60,
    alignItems: 'center' as const,
  },
  traderInfo: {
    alignItems: 'center' as const,
    paddingVertical: 20,
  },
  avatarContainer: {
    position: 'relative' as const,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#00F0FF',
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1F1F2E',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: '#00F0FF',
  },
  blueTick: {
    position: 'absolute' as const,
    bottom: 0,
    right: 0,
    backgroundColor: '#0A0A0F',
    borderRadius: 8,
  },
  traderName: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginTop: 12,
  },
  traderMeta: {
    fontSize: 14,
    color: '#8B8B9A',
    marginTop: 4,
  },
  riskBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 12,
  },
  riskText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  statsGrid: {
    flexDirection: 'row' as const,
    backgroundColor: '#13131A',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center' as const,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#8B8B9A',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#1F1F2E',
    marginHorizontal: 8,
  },
  tabNav: {
    flexDirection: 'row' as const,
    marginHorizontal: 16,
    backgroundColor: '#13131A',
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center' as const,
    borderRadius: 6,
  },
  tabItemActive: {
    backgroundColor: '#00F0FF',
  },
  tabText: {
    fontSize: 14,
    color: '#8B8B9A',
  },
  tabTextActive: {
    color: '#0A0A0F',
    fontWeight: '600' as const,
  },
  performanceContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  periodGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    marginBottom: 16,
  },
  periodItem: {
    width: '50%',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  periodLabel: {
    fontSize: 12,
    color: '#8B8B9A',
  },
  periodValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#00FF88',
    marginTop: 2,
  },
  performanceCard: {
    backgroundColor: '#13131A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  performanceTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  performanceRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F2E',
  },
  performanceLabel: {
    fontSize: 14,
    color: '#8B8B9A',
  },
  performanceValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  specialtiesSection: {
    marginBottom: 16,
  },
  strategiesSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
  },
  tag: {
    backgroundColor: '#1F1F2E',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  strategyTag: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: '#00F0FF15',
    gap: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  tradesContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  tradeItem: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    backgroundColor: '#13131A',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  tradeLeft: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    flex: 1,
  },
  tradeSide: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tradeSideText: {
    fontSize: 11,
    fontWeight: '600' as const,
  },
  tradeInfo: {
    marginLeft: 12,
  },
  tradeSymbol: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  tradeTime: {
    fontSize: 11,
    color: '#8B8B9A',
    marginTop: 2,
  },
  tradeRight: {
    alignItems: 'flex-end' as const,
  },
  tradePnl: {
    fontSize: 14,
    fontWeight: '700' as const,
  },
  tradePnlRate: {
    fontSize: 12,
    marginTop: 2,
  },
  followSection: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#1F1F2E',
    backgroundColor: '#0A0A0F',
  },
  followTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  amountOptions: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    marginBottom: 16,
  },
  amountBtn: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#13131A',
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center' as const,
    borderWidth: 1,
    borderColor: '#1F1F2E',
  },
  amountBtnActive: {
    backgroundColor: '#00F0FF',
    borderColor: '#00F0FF',
  },
  amountBtnText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  amountBtnTextActive: {
    color: '#0A0A0F',
  },
  followBtn: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: '#00F0FF',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
  },
  followingBtn: {
    backgroundColor: '#00FF8820',
    borderWidth: 1,
    borderColor: '#00FF88',
  },
  followBtnText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#0A0A0F',
  },
  followingBtnText: {
    color: '#00FF88',
  },
};
