/**
 * 会员中心 - KAIROS DAPP
 * 包含：一键跟单、我的实盘、会员速递
 * 实时连接全球顶尖交易员
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, RefreshControl, Modal, Alert, Image, Dimensions, Animated } from 'react-native';
import { Screen } from '@/components/Screen';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { Ionicons } from '@expo/vector-icons';
import { useWeb3 } from '@/contexts/Web3Context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const API_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9091';

// ==================== 顶部 Banner 组件 ====================
function HeaderBanner({ stats }: { stats: any }) {
  return (
    <View style={styles.banner}>
      <View style={styles.bannerGradient}>
        <View style={styles.bannerContent}>
          <View style={styles.bannerLeft}>
            <View style={styles.bannerIcon}>
              <Ionicons name="diamond" size={28} color="#FFD700" />
            </View>
            <View>
              <Text style={styles.bannerTitle}>VIP 会员中心</Text>
              <Text style={styles.bannerSubtitle}>全球顶尖交易员 · 实时跟单</Text>
            </View>
          </View>
          <View style={styles.bannerStats}>
            <View style={styles.bannerStat}>
              <Text style={styles.bannerStatValue}>{stats.totalTraders || 0}</Text>
              <Text style={styles.bannerStatLabel}>顶尖交易员</Text>
            </View>
            <View style={styles.bannerStatDivider} />
            <View style={styles.bannerStat}>
              <Text style={styles.bannerStatValue}>{stats.avgWinRate || 0}%</Text>
              <Text style={styles.bannerStatLabel}>平均胜率</Text>
            </View>
          </View>
        </View>
        <View style={styles.bannerLive}>
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
          <Text style={styles.bannerUpdate}>30秒自动刷新</Text>
        </View>
      </View>
    </View>
  );
}

// ==================== 交易员卡片组件 ====================
function TraderCard({ trader, index, onFollow }: { trader: any; index: number; onFollow: (t: any) => void }) {
  const [scaleAnim] = useState(new Animated.Value(1));
  const avatarUrl = trader.avatarUrl || `https://api.dicebear.com/7.x/avataaars/png?seed=${trader.id}`;
  
  // 排名样式
  const getRankStyle = () => {
    if (index === 0) return { bg: '#FFD70020', color: '#FFD700', border: '#FFD700' };
    if (index === 1) return { bg: '#C0C0C020', color: '#C0C0C0', border: '#C0C0C0' };
    if (index === 2) return { bg: '#CD7F3220', color: '#CD7F32', border: '#CD7F32' };
    return { bg: '#1F1F2E', color: '#666', border: 'transparent' };
  };
  const rankStyle = getRankStyle();

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.98, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
  };

  // 胜率颜色
  const getWinRateColor = () => {
    if (trader.winRate >= 85) return '#00FF88';
    if (trader.winRate >= 70) return '#00F0FF';
    if (trader.winRate >= 50) return '#FFD700';
    return '#FF6B6B';
  };

  return (
    <Animated.View style={[styles.traderCard, { transform: [{ scale: scaleAnim }] }]}>
      <Pressable 
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => onFollow(trader)}
      >
        {/* 顶部排名和平台 */}
        <View style={styles.traderTop}>
          <View style={[styles.rankBadge, { backgroundColor: rankStyle.bg, borderColor: rankStyle.border }]}>
            <Text style={[styles.rankText, { color: rankStyle.color }]}>
              {index < 3 ? ['🥇', '🥈', '🥉'][index] : `#${index + 1}`}
            </Text>
          </View>
          <View style={styles.platformBadge}>
            <Ionicons name="cube" size={12} color="#00F0FF" />
            <Text style={styles.platformText}>{trader.platform}</Text>
          </View>
          {trader.verified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={14} color="#00F0FF" />
            </View>
          )}
        </View>

        {/* 用户信息 */}
        <View style={styles.traderMain}>
          <View style={styles.avatarWrapper}>
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            <View style={styles.onlineIndicator} />
          </View>
          <View style={styles.traderInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.traderName}>{trader.name}</Text>
              <Text style={styles.countryFlag}>{trader.country || '🌍'}</Text>
            </View>
            <Text style={styles.traderId}>ID: {trader.id}</Text>
          </View>
          <View style={[styles.winRateBox, { borderColor: getWinRateColor() }]}>
            <Text style={[styles.winRateValue, { color: getWinRateColor() }]}>
              {trader.winRate.toFixed(1)}%
            </Text>
            <Text style={styles.winRateLabel}>胜率</Text>
          </View>
        </View>

        {/* 核心数据 */}
        <View style={styles.traderStats}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: trader.returns > 0 ? '#00FF88' : '#FF6B6B' }]}>
              {trader.returns > 0 ? '+' : ''}{trader.returns.toFixed(1)}%
            </Text>
            <Text style={styles.statLabel}>累计收益</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{trader.followers.toLocaleString()}</Text>
            <Text style={styles.statLabel}>跟单人数</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{trader.totalTrades}</Text>
            <Text style={styles.statLabel}>累计交易</Text>
          </View>
        </View>

        {/* 收益概览 */}
        <View style={styles.pnlBox}>
          <View style={styles.pnlItem}>
            <Text style={styles.pnlLabel}>今日收益</Text>
            <Text style={[styles.pnlValue, { color: parseFloat(trader.todayPnl) > 0 ? '#00FF88' : '#FF6B6B' }]}>
              {parseFloat(trader.todayPnl) > 0 ? '+' : ''}{trader.todayPnl}%
            </Text>
          </View>
          <View style={styles.pnlDivider} />
          <View style={styles.pnlItem}>
            <Text style={styles.pnlLabel}>本周收益</Text>
            <Text style={[styles.pnlValue, { color: parseFloat(trader.weeklyPnL) > 0 ? '#00FF88' : '#FF6B6B' }]}>
              {parseFloat(trader.weeklyPnL) > 0 ? '+' : ''}{trader.weeklyPnL}%
            </Text>
          </View>
          <View style={styles.pnlDivider} />
          <View style={styles.pnlItem}>
            <Text style={styles.pnlLabel}>夏普比率</Text>
            <Text style={styles.pnlValue}>{trader.sharpeRatio}</Text>
          </View>
        </View>

        {/* 擅长领域 */}
        <View style={styles.specialtiesBox}>
          {trader.specialties?.slice(0, 4).map((s: string, i: number) => (
            <View key={i} style={styles.specialtyTag}>
              <Text style={styles.specialtyText}>{s}</Text>
            </View>
          ))}
        </View>

        {/* 跟单按钮 */}
        <Pressable style={styles.followButton} onPress={() => onFollow(trader)}>
          <Ionicons name="person-add" size={18} color="#0A0A0F" />
          <Text style={styles.followButtonText}>一键跟单</Text>
        </Pressable>
      </Pressable>
    </Animated.View>
  );
}

// ==================== Tab 切换指示器 ====================
function TabIndicator({ tabs, activeTab, onTabChange }: { tabs: any[]; activeTab: string; onTabChange: (tab: string) => void }) {
  return (
    <View style={styles.tabBar}>
      {tabs.map(tab => (
        <Pressable
          key={tab.key}
          style={[styles.tab, activeTab === tab.key && styles.tabActive]}
          onPress={() => onTabChange(tab.key)}
        >
          <View style={styles.tabIconWrapper}>
            <Ionicons 
              name={tab.icon as any} 
              size={20} 
              color={activeTab === tab.key ? '#00F0FF' : '#666'} 
            />
            {tab.badge && <View style={styles.tabBadge}><Text style={styles.tabBadgeText}>{tab.badge}</Text></View>}
          </View>
          <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
            {tab.label}
          </Text>
          {activeTab === tab.key && <View style={styles.tabIndicator} />}
        </Pressable>
      ))}
    </View>
  );
}

// ==================== 统计卡片组件 ====================
function StatsCard({ title, items }: { title: string; items: { label: string; value: string; color?: string }[] }) {
  return (
    <View style={styles.statsCard}>
      <Text style={styles.statsCardTitle}>{title}</Text>
      <View style={styles.statsCardContent}>
        {items.map((item, index) => (
          <View key={index} style={styles.statsCardItem}>
            <Text style={[styles.statsCardValue, item.color ? { color: item.color } : null]}>
              {item.value}
            </Text>
            <Text style={styles.statsCardLabel}>{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ==================== 会员速递卡片 ====================
function NewsCard({ item, onPress }: { item: any; onPress: () => void }) {
  const getTypeStyle = () => {
    switch (item.type) {
      case 'warning': return { bg: '#FF3B3020', color: '#FF3B30', icon: 'warning' };
      case 'signal': return { bg: '#FFD70020', color: '#FFD700', icon: 'trending-up' };
      default: return { bg: '#00F0FF20', color: '#00F0FF', icon: 'information-circle' };
    }
  };
  const typeStyle = getTypeStyle();

  return (
    <Pressable style={styles.newsCard} onPress={onPress}>
      <View style={[styles.newsTypeBadge, { backgroundColor: typeStyle.bg }]}>
        <Ionicons name={typeStyle.icon as any} size={14} color={typeStyle.color} />
        <Text style={[styles.newsTypeText, { color: typeStyle.color }]}>{item.typeLabel}</Text>
      </View>
      <Text style={styles.newsTitle} numberOfLines={2}>{item.title}</Text>
      <Text style={styles.newsSummary} numberOfLines={2}>{item.summary}</Text>
      <View style={styles.newsFooter}>
        <Text style={styles.newsTime}>{item.time}</Text>
        <View style={styles.newsSource}>
          <Ionicons name="newspaper" size={12} color="#666" />
          <Text style={styles.newsSourceText}>{item.source}</Text>
        </View>
      </View>
    </Pressable>
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

  const tabs = [
    { key: 'follow', label: '一键跟单', icon: 'people' },
    { key: 'portfolio', label: '我的实盘', icon: 'wallet' },
    { key: 'news', label: '会员速递', icon: 'notifications', badge: 'NEW' },
  ];

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
    Alert.alert('成功', `已成功跟单 ${selectedTrader.name}`);
    setFollowModal(false);
    setSelectedTrader(null);
  };

  return (
    <Screen>
      {/* 顶部 Banner */}
      <HeaderBanner stats={stats} />

      {/* Tab 切换 */}
      <TabIndicator tabs={tabs} activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab as any)} />

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00F0FF" />}
        showsVerticalScrollIndicator={false}
      >
        {/* ===== 一键跟单 ===== */}
        {activeTab === 'follow' && (
          <View style={styles.tabContent}>
            {/* 提示语 */}
            <View style={styles.tipBox}>
              <Ionicons name="bulb" size={16} color="#FFD700" />
              <Text style={styles.tipText}>选择心仪的交易员，一键复制其交易策略</Text>
            </View>

            {/* 交易员列表 */}
            {loading ? (
              <View style={styles.loadingContainer}>
                <View style={styles.loadingSpinner} />
                <Text style={styles.loadingText}>加载全球交易员数据...</Text>
              </View>
            ) : (
              traders.map((trader, index) => (
                <TraderCard key={trader.id} trader={trader} index={index} onFollow={handleFollow} />
              ))
            )}
          </View>
        )}

        {/* ===== 我的实盘 ===== */}
        {activeTab === 'portfolio' && (
          <View style={styles.tabContent}>
            {isConnected ? (
              <>
                {/* 收益概览 */}
                <StatsCard 
                  title="收益概览" 
                  items={[
                    { label: '持仓数', value: '0', color: '#FFF' },
                    { label: '订单数', value: '0', color: '#FFF' },
                    { label: '总收益', value: '$0.00', color: '#00FF88' },
                    { label: '收益率', value: '0%', color: '#00FF88' },
                  ]}
                />

                {/* 空状态 */}
                <View style={styles.emptyState}>
                  <Ionicons name="file-tray-stats-outline" size={64} color="#333" />
                  <Text style={styles.emptyTitle}>暂无跟单记录</Text>
                  <Text style={styles.emptyText}>在"一键跟单"中选择心仪的交易员开始跟单</Text>
                  <Pressable style={styles.emptyButton} onPress={() => setActiveTab('follow')}>
                    <Text style={styles.emptyButtonText}>去选择交易员</Text>
                  </Pressable>
                </View>
              </>
            ) : (
              <View style={styles.connectState}>
                <Ionicons name="wallet-outline" size={64} color="#333" />
                <Text style={styles.connectTitle}>连接钱包</Text>
                <Text style={styles.connectText}>连接钱包后查看您的跟单实盘数据</Text>
                <Pressable style={styles.connectButton} onPress={connect}>
                  <Ionicons name="link" size={18} color="#0A0A0F" />
                  <Text style={styles.connectButtonText}>连接钱包</Text>
                </Pressable>
              </View>
            )}
          </View>
        )}

        {/* ===== 会员速递 ===== */}
        {activeTab === 'news' && (
          <View style={styles.tabContent}>
            {/* 升级 Banner */}
            <Pressable style={styles.upgradeBanner} onPress={() => router.push('/vip/membership')}>
              <View style={styles.upgradeLeft}>
                <View style={styles.upgradeIconBox}>
                  <Ionicons name="diamond" size={24} color="#FFD700" />
                </View>
                <View style={styles.upgradeText}>
                  <Text style={styles.upgradeTitle}>升级尊享版</Text>
                  <Text style={styles.upgradeSubtitle}>解锁全部交易员 · 实时推送</Text>
                </View>
              </View>
              <View style={styles.upgradeArrow}>
                <Ionicons name="chevron-forward" size={24} color="#FFD700" />
              </View>
            </Pressable>

            {/* 资讯列表 */}
            <View style={styles.newsHeader}>
              <Ionicons name="newspaper" size={18} color="#FFF" />
              <Text style={styles.newsHeaderTitle}>会员专属资讯</Text>
              <View style={styles.newsBadge}>
                <Text style={styles.newsBadgeText}>实时推送</Text>
              </View>
            </View>

            {/* 资讯卡片 */}
            {[
              { type: 'warning', typeLabel: '预警', title: 'BTC 巨鲸地址异动，疑似砸盘前兆', summary: '据链上数据显示，某个持有超过10000 BTC的地址刚刚进行了大额转账...', time: '2分钟前', source: '链上捕手' },
              { type: 'signal', typeLabel: '信号', title: 'ETH 突破关键阻力位，多头信号确认', summary: '以太坊价格成功突破2800美元阻力位，技术指标显示做多信号...', time: '5分钟前', source: '技术分析' },
              { type: 'info', typeLabel: '快讯', title: '币安将上线 AUD 新合约交易对', summary: '币安公告显示将于明日上线 AUD/USDT 永续合约...', time: '10分钟前', source: '币安' },
            ].map((item, index) => (
              <NewsCard key={index} item={item} onPress={() => {}} />
            ))}
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* 跟单确认弹窗 */}
      <Modal visible={followModal} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setFollowModal(false)}>
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>确认跟单</Text>
              <Pressable onPress={() => setFollowModal(false)}>
                <Ionicons name="close-circle" size={28} color="#666" />
              </Pressable>
            </View>
            
            {selectedTrader && (
              <View style={styles.modalBody}>
                {/* 交易员信息 */}
                <View style={styles.modalTraderSection}>
                  <Image 
                    source={{ uri: selectedTrader.avatarUrl }} 
                    style={styles.modalAvatar} 
                  />
                  <View style={styles.modalTraderInfo}>
                    <Text style={styles.modalTraderName}>{selectedTrader.name}</Text>
                    <View style={styles.modalPlatformBadge}>
                      <Ionicons name="cube" size={12} color="#00F0FF" />
                      <Text style={styles.modalPlatformText}>{selectedTrader.platform}</Text>
                    </View>
                  </View>
                </View>

                {/* 核心数据 */}
                <View style={styles.modalStatsGrid}>
                  <View style={styles.modalStatBox}>
                    <Text style={[styles.modalStatValue, { color: '#00FF88' }]}>
                      {selectedTrader.returns > 0 ? '+' : ''}{selectedTrader.returns.toFixed(1)}%
                    </Text>
                    <Text style={styles.modalStatLabel}>累计收益</Text>
                  </View>
                  <View style={styles.modalStatBox}>
                    <Text style={[styles.modalStatValue, { color: '#00F0FF' }]}>
                      {selectedTrader.winRate.toFixed(1)}%
                    </Text>
                    <Text style={styles.modalStatLabel}>胜率</Text>
                  </View>
                  <View style={styles.modalStatBox}>
                    <Text style={styles.modalStatValue}>
                      {selectedTrader.followers.toLocaleString()}
                    </Text>
                    <Text style={styles.modalStatLabel}>跟单人数</Text>
                  </View>
                </View>

                {/* 风险提示 */}
                <View style={styles.riskWarning}>
                  <Ionicons name="warning" size={20} color="#FF6B6B" />
                  <View style={styles.riskTextBox}>
                    <Text style={styles.riskTitle}>风险提示</Text>
                    <Text style={styles.riskText}>跟单有风险，投资需谨慎。请根据自身风险承受能力选择合适的交易员。</Text>
                  </View>
                </View>

                {/* 操作按钮 */}
                <View style={styles.modalButtons}>
                  <Pressable style={styles.modalCancelBtn} onPress={() => setFollowModal(false)}>
                    <Text style={styles.modalCancelText}>取消</Text>
                  </Pressable>
                  <Pressable style={styles.modalConfirmBtn} onPress={confirmFollow}>
                    <Ionicons name="checkmark" size={18} color="#0A0A0F" />
                    <Text style={styles.modalConfirmText}>确认跟单</Text>
                  </Pressable>
                </View>
              </View>
            )}
          </View>
        </Pressable>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  // Banner
  banner: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  bannerGradient: {
    backgroundColor: '#0A0A0F',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1F1F2E',
    overflow: 'hidden',
  },
  bannerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  bannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFD70020',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  bannerSubtitle: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  bannerStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerStat: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  bannerStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#00F0FF',
  },
  bannerStatLabel: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  bannerStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#1F1F2E',
  },
  bannerLive: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FF3B3015',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
    marginRight: 6,
  },
  liveText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF3B30',
  },
  bannerUpdate: {
    fontSize: 11,
    color: '#666',
  },
  // Tab Bar
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#0A0A0F',
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F2E',
    paddingBottom: 0,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    position: 'relative',
  },
  tabIconWrapper: {
    position: 'relative',
  },
  tabBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: '#FF3B30',
    borderRadius: 6,
    paddingHorizontal: 4,
    minWidth: 16,
  },
  tabBadgeText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#FFF',
    textAlign: 'center',
  },
  tabActive: {
    backgroundColor: '#00F0FF08',
  },
  tabText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  tabTextActive: {
    color: '#00F0FF',
    fontWeight: '600',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '25%',
    right: '25%',
    height: 2,
    backgroundColor: '#00F0FF',
    borderRadius: 1,
  },
  // Content
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
  },
  bottomPadding: {
    height: 40,
  },
  // Tip
  tipBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD70015',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#FFD700',
  },
  tipText: {
    fontSize: 13,
    color: '#FFD700',
    marginLeft: 8,
    flex: 1,
  },
  // Loading
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingSpinner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#1F1F2E',
    borderTopColor: '#00F0FF',
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    marginTop: 16,
  },
  // Trader Card
  traderCard: {
    backgroundColor: '#13131A',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1F1F2E',
    overflow: 'hidden',
  },
  traderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  rankBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  rankText: {
    fontSize: 14,
    fontWeight: '700',
  },
  platformBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00F0FF15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  platformText: {
    fontSize: 11,
    color: '#00F0FF',
    marginLeft: 4,
  },
  verifiedBadge: {
    marginLeft: 6,
  },
  traderMain: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1F1F2E',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#00FF88',
    borderWidth: 2,
    borderColor: '#13131A',
  },
  traderInfo: {
    flex: 1,
    marginLeft: 12,
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
  countryFlag: {
    fontSize: 14,
    marginLeft: 6,
  },
  traderId: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  winRateBox: {
    alignItems: 'center',
    backgroundColor: '#0A0A0F',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  winRateValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  winRateLabel: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  traderStats: {
    flexDirection: 'row',
    backgroundColor: '#0A0A0F',
    marginHorizontal: 16,
    borderRadius: 10,
    padding: 12,
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
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#1F1F2E',
  },
  pnlBox: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: '#0A0A0F',
    borderRadius: 10,
    padding: 10,
  },
  pnlItem: {
    flex: 1,
    alignItems: 'center',
  },
  pnlLabel: {
    fontSize: 10,
    color: '#666',
  },
  pnlValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFF',
    marginTop: 2,
  },
  pnlDivider: {
    width: 1,
    backgroundColor: '#1F1F2E',
  },
  specialtiesBox: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 6,
  },
  specialtyTag: {
    backgroundColor: '#1F1F2E',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  specialtyText: {
    fontSize: 11,
    color: '#888',
  },
  followButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00F0FF',
    marginHorizontal: 16,
    marginVertical: 16,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  followButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0A0A0F',
  },
  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 13,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  emptyButton: {
    backgroundColor: '#00F0FF',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 20,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0A0A0F',
  },
  // Connect State
  connectState: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  connectTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    marginTop: 16,
  },
  connectText: {
    fontSize: 13,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00F0FF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 24,
    gap: 8,
  },
  connectButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0A0A0F',
  },
  // Upgrade Banner
  upgradeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD70015',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FFD70030',
    marginBottom: 20,
  },
  upgradeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  upgradeIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFD70020',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  upgradeText: {
    flex: 1,
  },
  upgradeTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFD700',
  },
  upgradeSubtitle: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  upgradeArrow: {
    marginLeft: 8,
  },
  // News
  newsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  newsHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
    marginLeft: 8,
    flex: 1,
  },
  newsBadge: {
    backgroundColor: '#00F0FF20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  newsBadgeText: {
    fontSize: 10,
    color: '#00F0FF',
    fontWeight: '600',
  },
  newsCard: {
    backgroundColor: '#13131A',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1F1F2E',
  },
  newsTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
  },
  newsTypeText: {
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },
  newsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
    lineHeight: 20,
  },
  newsSummary: {
    fontSize: 12,
    color: '#888',
    marginTop: 6,
    lineHeight: 18,
  },
  newsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  newsTime: {
    fontSize: 11,
    color: '#666',
  },
  newsSource: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  newsSourceText: {
    fontSize: 11,
    color: '#666',
    marginLeft: 4,
  },
  // Stats Card
  statsCard: {
    backgroundColor: '#13131A',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1F1F2E',
  },
  statsCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 14,
  },
  statsCardContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statsCardItem: {
    width: '25%',
    alignItems: 'center',
    marginBottom: 10,
  },
  statsCardValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  statsCardLabel: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#13131A',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1F1F2E',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F2E',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  modalBody: {
    padding: 16,
  },
  modalTraderSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1F1F2E',
  },
  modalTraderInfo: {
    marginLeft: 14,
    flex: 1,
  },
  modalTraderName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  modalPlatformBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00F0FF15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  modalPlatformText: {
    fontSize: 11,
    color: '#00F0FF',
    marginLeft: 4,
  },
  modalStatsGrid: {
    flexDirection: 'row',
    backgroundColor: '#0A0A0F',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  modalStatBox: {
    flex: 1,
    alignItems: 'center',
  },
  modalStatValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  modalStatLabel: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
  },
  riskWarning: {
    flexDirection: 'row',
    backgroundColor: '#FF6B6B15',
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
  },
  riskTextBox: {
    flex: 1,
    marginLeft: 10,
  },
  riskTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FF6B6B',
  },
  riskText: {
    fontSize: 11,
    color: '#888',
    marginTop: 2,
    lineHeight: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#1F1F2E',
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
  },
  modalConfirmBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#00F0FF',
    gap: 6,
  },
  modalConfirmText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0A0A0F',
  },
});
