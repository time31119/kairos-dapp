/**
 * 会员页面 - KAIROS DAPP
 * 包含：一键跟单、我的实盘、付费订阅
 * 实时连接全球顶尖交易员
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, RefreshControl, Modal, Alert, Image, FlatList } from 'react-native';
import { Screen } from '@/components/Screen';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { Ionicons } from '@expo/vector-icons';
import { useWeb3 } from '@/contexts/Web3Context';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9091';

// ==================== 明星交易员列表组件 ====================
function TraderCard({ trader, onFollow }: { trader: any; onFollow: (t: any) => void }) {
  const avatarUrl = trader.avatarUrl || `https://api.dicebear.com/7.x/avataaars/png?seed=${trader.id}`;
  
  return (
    <View style={styles.traderCard}>
      <View style={styles.traderHeader}>
        <View style={styles.traderLeft}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            {trader.verified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={14} color="#00F0FF" />
              </View>
            )}
            {trader.blueTick && (
              <View style={styles.blueTickBadge}>
                <Ionicons name="checkmark" size={10} color="#FFF" />
              </View>
            )}
          </View>
          <View style={styles.traderInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.traderName}>{trader.name}</Text>
              <Text style={styles.country}>{trader.country}</Text>
            </View>
            <View style={styles.platformRow}>
              <View style={styles.platformBadge}>
                <Text style={styles.platformText}>{trader.platform}</Text>
              </View>
              <Text style={styles.riskLevel}>风险: {trader.riskLevel}</Text>
            </View>
          </View>
        </View>
        <View style={styles.traderRight}>
          <View style={[styles.winRateBadge, trader.winRate >= 85 && styles.winRateHigh]}>
            <Text style={styles.winRateValue}>{trader.winRate.toFixed(1)}%</Text>
            <Text style={styles.winRateLabel}>胜率</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.traderStats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{trader.returns.toFixed(1)}%</Text>
          <Text style={styles.statLabel}>累计收益</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{trader.followers.toLocaleString()}</Text>
          <Text style={styles.statLabel}>跟单人数</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{trader.totalTrades.toLocaleString()}</Text>
          <Text style={styles.statLabel}>累计交易</Text>
        </View>
      </View>
      
      <View style={styles.specialtiesRow}>
        {trader.specialties?.map((s: string, i: number) => (
          <View key={i} style={styles.specialtyTag}>
            <Text style={styles.specialtyText}>{s}</Text>
          </View>
        ))}
      </View>
      
      <View style={styles.pnlRow}>
        <View style={styles.pnlItem}>
          <Text style={styles.pnlLabel}>今日收益</Text>
          <Text style={[styles.pnlValue, parseFloat(trader.todayPnl) > 0 ? styles.pnlPositive : styles.pnlNegative]}>
            {parseFloat(trader.todayPnl) > 0 ? '+' : ''}{trader.todayPnl}%
          </Text>
        </View>
        <View style={styles.pnlItem}>
          <Text style={styles.pnlLabel}>本周收益</Text>
          <Text style={[styles.pnlValue, parseFloat(trader.weeklyPnL) > 0 ? styles.pnlPositive : styles.pnlNegative]}>
            {parseFloat(trader.weeklyPnL) > 0 ? '+' : ''}{trader.weeklyPnL}%
          </Text>
        </View>
        <View style={styles.pnlItem}>
          <Text style={styles.pnlLabel}>夏普比率</Text>
          <Text style={styles.pnlValue}>{trader.sharpeRatio}</Text>
        </View>
      </View>
      
      <Pressable style={styles.followButton} onPress={() => onFollow(trader)}>
        <Ionicons name="person-add" size={18} color="#0A0A0F" />
        <Text style={styles.followButtonText}>一键跟单</Text>
      </Pressable>
    </View>
  );
}

// ==================== 主组件 ====================
export default function VipScreen() {
  const router = useSafeRouter();
  const { isConnected, connect } = useWeb3();
  const [activeTab, setActiveTab] = useState<'follow' | 'portfolio' | 'news'>('follow');
  const [refreshing, setRefreshing] = useState(false);
  const [traders, setTraders] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [followModal, setFollowModal] = useState(false);
  const [selectedTrader, setSelectedTrader] = useState<any>(null);

  // 获取交易员数据
  const fetchTraders = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/v1/copytrading/traders?sort=returns&limit=10`);
      const data = await res.json();
      if (data.success) {
        setTraders(data.data);
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch traders:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTraders();
    // 30秒刷新一次
    const interval = setInterval(fetchTraders, 30000);
    return () => clearInterval(interval);
  }, [fetchTraders]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTraders();
    setRefreshing(false);
  };

  const handleFollow = (trader: any) => {
    if (!isConnected) {
      Alert.alert('提示', '请先连接钱包', [
        { text: '取消', style: 'cancel' },
        { text: '连接钱包', onPress: connect },
      ]);
      return;
    }
    setSelectedTrader(trader);
    setFollowModal(true);
  };

  const confirmFollow = async () => {
    if (!selectedTrader) return;
    try {
      const res = await fetch(`${API_URL}/api/v1/copytrading/follow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ traderId: selectedTrader.id }),
      });
      const data = await res.json();
      if (data.success) {
        Alert.alert('成功', `已成功跟单 ${selectedTrader.name}`);
      }
    } catch (err) {
      Alert.alert('错误', '跟单失败，请重试');
    }
    setFollowModal(false);
    setSelectedTrader(null);
  };

  return (
    <Screen>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>会员中心</Text>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.statsBadge}>
            <Text style={styles.statsBadgeText}>全球 {traders.length} 位顶尖交易员</Text>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        <Pressable
          style={[styles.tab, activeTab === 'follow' && styles.tabActive]}
          onPress={() => setActiveTab('follow')}
        >
          <Ionicons name="people" size={20} color={activeTab === 'follow' ? '#00F0FF' : '#666'} />
          <Text style={[styles.tabText, activeTab === 'follow' && styles.tabTextActive]}>一键跟单</Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'portfolio' && styles.tabActive]}
          onPress={() => setActiveTab('portfolio')}
        >
          <Ionicons name="wallet" size={20} color={activeTab === 'portfolio' ? '#00F0FF' : '#666'} />
          <Text style={[styles.tabText, activeTab === 'portfolio' && styles.tabTextActive]}>我的实盘</Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'news' && styles.tabActive]}
          onPress={() => setActiveTab('news')}
        >
          <Ionicons name="notifications" size={20} color={activeTab === 'news' ? '#00F0FF' : '#666'} />
          <Text style={[styles.tabText, activeTab === 'news' && styles.tabTextActive]}>会员速递</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00F0FF" />}
      >
        {/* ===== 一键跟单 ===== */}
        {activeTab === 'follow' && (
          <View style={styles.tabContent}>
            {/* 统计概览 */}
            <View style={styles.overviewSection}>
              <View style={styles.overviewCard}>
                <View style={styles.overviewItem}>
                  <Text style={styles.overviewValue}>{stats.totalTraders || 0}</Text>
                  <Text style={styles.overviewLabel}>交易员总数</Text>
                </View>
                <View style={styles.overviewDivider} />
                <View style={styles.overviewItem}>
                  <Text style={styles.overviewValue}>{stats.avgWinRate || 0}%</Text>
                  <Text style={styles.overviewLabel}>平均胜率</Text>
                </View>
                <View style={styles.overviewDivider} />
                <View style={styles.overviewItem}>
                  <Text style={styles.overviewValue}>{stats.avgReturns || 0}%</Text>
                  <Text style={styles.overviewLabel}>平均收益</Text>
                </View>
              </View>
            </View>

            {/* 交易员列表 */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🌟 全球顶尖交易员</Text>
              <Text style={styles.sectionSubtitle}>实时连接 · 30秒自动刷新</Text>
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>加载中...</Text>
              </View>
            ) : (
              traders.map(trader => (
                <TraderCard key={trader.id} trader={trader} onFollow={handleFollow} />
              ))
            )}
          </View>
        )}

        {/* ===== 我的实盘 ===== */}
        {activeTab === 'portfolio' && (
          <View style={styles.tabContent}>
            <View style={styles.portfolioSection}>
              <Text style={styles.portfolioTitle}>📊 我的实盘</Text>
              <Text style={styles.portfolioSubtitle}>暂无跟单记录</Text>
              <View style={styles.portfolioPlaceholder}>
                <Ionicons name="wallet-outline" size={48} color="#333" />
                <Text style={styles.placeholderText}>连接钱包后查看您的跟单实盘</Text>
                <Pressable style={styles.connectButton} onPress={connect}>
                  <Text style={styles.connectButtonText}>连接钱包</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}

        {/* ===== 会员速递 ===== */}
        {activeTab === 'news' && (
          <View style={styles.tabContent}>
            <Pressable style={styles.upgradeBanner} onPress={() => router.push('/vip/membership')}>
              <View style={styles.upgradeLeft}>
                <Ionicons name="diamond" size={24} color="#FFD700" />
                <View style={styles.upgradeText}>
                  <Text style={styles.upgradeTitle}>升级尊享版</Text>
                  <Text style={styles.upgradeSubtitle}>解锁全部交易员 · 实时推送</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#FFD700" />
            </Pressable>
            <View style={styles.newsSection}>
              <Text style={styles.newsTitle}>📰 会员专属资讯</Text>
              <Text style={styles.newsSubtitle}>暂无资讯订阅</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* 跟单确认弹窗 */}
      <Modal visible={followModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>确认跟单</Text>
              <Pressable onPress={() => setFollowModal(false)}>
                <Ionicons name="close" size={24} color="#999" />
              </Pressable>
            </View>
            
            {selectedTrader && (
              <View style={styles.modalBody}>
                <View style={styles.modalTraderInfo}>
                  <Text style={styles.modalTraderName}>{selectedTrader.name}</Text>
                  <Text style={styles.modalTraderPlatform}>{selectedTrader.platform}</Text>
                </View>
                
                <View style={styles.modalStats}>
                  <View style={styles.modalStatItem}>
                    <Text style={styles.modalStatValue}>{selectedTrader.winRate.toFixed(1)}%</Text>
                    <Text style={styles.modalStatLabel}>胜率</Text>
                  </View>
                  <View style={styles.modalStatItem}>
                    <Text style={styles.modalStatValue}>{selectedTrader.returns.toFixed(1)}%</Text>
                    <Text style={styles.modalStatLabel}>累计收益</Text>
                  </View>
                  <View style={styles.modalStatItem}>
                    <Text style={styles.modalStatValue}>{selectedTrader.followers.toLocaleString()}</Text>
                    <Text style={styles.modalStatLabel}>跟单人数</Text>
                  </View>
                </View>
                
                <View style={styles.modalRisk}>
                  <Ionicons name="warning" size={18} color="#FF6B6B" />
                  <Text style={styles.modalRiskText}>风险提示：跟单有风险，投资需谨慎</Text>
                </View>
                
                <View style={styles.modalButtons}>
                  <Pressable style={styles.modalCancelBtn} onPress={() => setFollowModal(false)}>
                    <Text style={styles.modalCancelText}>取消</Text>
                  </Pressable>
                  <Pressable style={styles.modalConfirmBtn} onPress={confirmFollow}>
                    <Text style={styles.modalConfirmText}>确认跟单</Text>
                  </Pressable>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F2E',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF3B3010',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF3B30',
    marginRight: 4,
  },
  liveText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FF3B30',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsBadge: {
    backgroundColor: '#00F0FF15',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statsBadgeText: {
    fontSize: 12,
    color: '#00F0FF',
  },
  // Tab Bar
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F2E',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#00F0FF',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  tabTextActive: {
    color: '#00F0FF',
    fontWeight: '600',
  },
  // Content
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
  },
  // Overview
  overviewSection: {
    marginBottom: 20,
  },
  overviewCard: {
    backgroundColor: '#13131A',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  overviewItem: {
    flex: 1,
    alignItems: 'center',
  },
  overviewValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#00F0FF',
  },
  overviewLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  overviewDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#1F1F2E',
  },
  // Section Header
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    color: '#666',
  },
  // Trader Card
  traderCard: {
    backgroundColor: '#13131A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1F1F2E',
  },
  traderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  traderLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#1F1F2E',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#0A0A0F',
    borderRadius: 7,
  },
  blueTickBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#00F0FF',
    borderRadius: 5,
    padding: 1,
  },
  traderInfo: {
    marginLeft: 12,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  traderName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  country: {
    fontSize: 14,
    marginLeft: 4,
  },
  platformRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  platformBadge: {
    backgroundColor: '#00F0FF20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  platformText: {
    fontSize: 11,
    color: '#00F0FF',
  },
  riskLevel: {
    fontSize: 11,
    color: '#666',
    marginLeft: 8,
  },
  traderRight: {},
  winRateBadge: {
    backgroundColor: '#1F1F2E',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  winRateHigh: {
    backgroundColor: '#00FF8820',
    borderWidth: 1,
    borderColor: '#00FF88',
  },
  winRateValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00F0FF',
  },
  winRateLabel: {
    fontSize: 10,
    color: '#666',
  },
  // Trader Stats
  traderStats: {
    flexDirection: 'row',
    backgroundColor: '#0A0A0F',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#1F1F2E',
  },
  // Specialties
  specialtiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  specialtyTag: {
    backgroundColor: '#1F1F2E',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  specialtyText: {
    fontSize: 12,
    color: '#999',
  },
  // PnL Row
  pnlRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  pnlItem: {
    flex: 1,
  },
  pnlLabel: {
    fontSize: 11,
    color: '#666',
  },
  pnlValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
  },
  pnlPositive: {
    color: '#00FF88',
  },
  pnlNegative: {
    color: '#FF4444',
  },
  // Follow Button
  followButton: {
    backgroundColor: '#00F0FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
  },
  followButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0A0A0F',
    marginLeft: 6,
  },
  // Portfolio
  portfolioSection: {
    alignItems: 'center',
    padding: 40,
  },
  portfolioTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
  },
  portfolioSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  portfolioPlaceholder: {
    alignItems: 'center',
    marginTop: 30,
  },
  placeholderText: {
    fontSize: 14,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  connectButton: {
    backgroundColor: '#00F0FF',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 20,
  },
  connectButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0A0A0F',
  },
  // News
  upgradeBanner: {
    backgroundColor: '#FFD70015',
    borderWidth: 1,
    borderColor: '#FFD70040',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  upgradeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  upgradeText: {
    marginLeft: 12,
  },
  upgradeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFD700',
  },
  upgradeSubtitle: {
    fontSize: 12,
    color: '#FFD70080',
    marginTop: 2,
  },
  newsSection: {
    alignItems: 'center',
    padding: 40,
  },
  newsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  newsSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#13131A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
  },
  modalBody: {},
  modalTraderInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTraderName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  modalTraderPlatform: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  modalStats: {
    flexDirection: 'row',
    backgroundColor: '#0A0A0F',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  modalStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  modalStatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#00F0FF',
  },
  modalStatLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  modalRisk: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B6B15',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  modalRiskText: {
    fontSize: 12,
    color: '#FF6B6B',
    marginLeft: 8,
  },
  modalButtons: {
    flexDirection: 'row',
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333',
    marginRight: 10,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#999',
  },
  modalConfirmBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#00F0FF',
    alignItems: 'center',
  },
  modalConfirmText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0A0A0F',
  },
});
