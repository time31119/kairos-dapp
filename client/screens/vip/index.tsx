/**
 * 会员页面 - KAIROS DAPP
 * 包含：一键跟单、我的实盘、付费订阅
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, RefreshControl, Modal, Alert } from 'react-native';
import { Screen } from '@/components/Screen';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useWeb3 } from '@/contexts/Web3Context';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9091';

// 明星交易员数据
const TRADERS = [
  {
    id: '1',
    name: '币神张三',
    avatar: '👨‍💼',
    winRate: 82,
    returns: 127.5,
    followers: 2847,
    badges: ['认证交易员'],
    color: '#FFD700',
    specialties: ['BTC', 'ETH'],
    totalTrades: 1256,
    avgProfit: 1250,
  },
  {
    id: '2',
    name: '量化女王李四',
    avatar: '👩‍💻',
    winRate: 76,
    returns: 89.2,
    followers: 1523,
    badges: ['量化专家'],
    color: '#FF69B4',
    specialties: ['DeFi', 'Meme'],
    totalTrades: 892,
    avgProfit: 890,
  },
  {
    id: '3',
    name: '合约之王王五',
    avatar: '👨‍🚀',
    winRate: 68,
    returns: 156.8,
    followers: 3421,
    badges: ['高收益'],
    color: '#00FF88',
    specialties: ['合约', '杠杆'],
    totalTrades: 2341,
    avgProfit: 2340,
  },
  {
    id: '4',
    name: '链上猎手',
    avatar: '🎯',
    winRate: 74,
    returns: 95.3,
    followers: 987,
    badges: ['新锐交易员'],
    color: '#00F0FF',
    specialties: ['链上数据', '追踪'],
    totalTrades: 456,
    avgProfit: 450,
  },
  {
    id: '5',
    name: '波段大师',
    avatar: '📊',
    winRate: 71,
    returns: 108.6,
    followers: 2156,
    badges: ['稳定收益'],
    color: '#A855F7',
    specialties: ['波段', '现货'],
    totalTrades: 1879,
    avgProfit: 1875,
  },
];

// 我的实盘数据
const POSITIONS = [
  { symbol: 'BTC', side: '做多', amount: 0.5, entryPrice: 66500, currentPrice: 67850, pnl: 1250, pnlRate: 2.54, leverage: 1 },
  { symbol: 'ETH', side: '做空', amount: 2.0, entryPrice: 3450, currentPrice: 3420, pnl: 320, pnlRate: 1.56, leverage: 2 },
  { symbol: 'SOL', side: '做多', amount: 50, entryPrice: 148, currentPrice: 152, pnl: 180, pnlRate: 2.7, leverage: 1 },
];

const ORDERS = [
  { id: 'ORD001', symbol: 'BTC', side: '做多', amount: 0.5, price: 66500, time: '10:32', status: '持仓中' },
  { id: 'ORD002', symbol: 'ETH', side: '做空', amount: 2.0, price: 3450, time: '10:28', status: '持仓中' },
  { id: 'ORD003', symbol: 'BNB', side: '做多', amount: 10, price: 598, time: '09:45', status: '已平仓', pnl: 85 },
  { id: 'ORD004', symbol: 'SOL', side: '做多', amount: 50, price: 148, time: '09:20', status: '持仓中' },
];

// 会员速递数据
const VIP_NEWS = [
  { id: 1, title: '🚨 BTC 异动预警', desc: '检测到 5000 BTC 大额转账，疑似机构调仓', time: '2分钟前', type: 'alert', level: 'high' },
  { id: 2, title: '📈 机构建仓信号', desc: '某鲸鱼钱包购入 2000 ETH，看多信号增强', time: '5分钟前', type: 'signal', level: 'medium' },
  { id: 3, title: '💰 DeFi 锁仓量创新高', desc: '总锁仓突破 500亿美元，DeFi 赛道持续火热', time: '10分钟前', type: 'info', level: 'low' },
  { id: 4, title: '🔔 Layer2 TVL 暴涨', desc: 'Arbitrum TVL 突破 150亿美元，月增长 45%', time: '15分钟前', type: 'signal', level: 'medium' },
  { id: 5, title: '⚠️ Meme 币风险提示', desc: 'PEPE 等 Meme 币波动加剧，建议谨慎追高', time: '20分钟前', type: 'alert', level: 'high' },
];

// 交易员卡片
function TraderCard({ trader, onFollow }: { trader: any; onFollow: (trader: any) => void }) {
  return (
    <Pressable style={[styles.traderCard, { borderColor: trader.color }]}>
      <View style={styles.traderHeader}>
        <View style={[styles.avatarContainer, { backgroundColor: trader.color + '20' }]}>
          <Text style={styles.traderAvatar}>{trader.avatar}</Text>
        </View>
        <View style={styles.traderInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.traderName}>{trader.name}</Text>
            {trader.badges.map((badge: string, i: number) => (
              <View key={i} style={[styles.badge, { backgroundColor: trader.color + '20' }]}>
                <Text style={[styles.badgeText, { color: trader.color }]}>{badge}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.specialties}>{trader.specialties.join(' · ')}</Text>
        </View>
      </View>
      <View style={styles.traderStats}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: trader.color }]}>{trader.winRate}%</Text>
          <Text style={styles.statLabel}>胜率</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#00FF88' }]}>+{trader.returns}%</Text>
          <Text style={styles.statLabel}>累计收益</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{trader.followers.toLocaleString()}</Text>
          <Text style={styles.statLabel}>跟单人数</Text>
        </View>
      </View>
      <View style={styles.traderFooter}>
        <Text style={styles.tradesCount}>累计 {trader.totalTrades} 笔交易</Text>
        <Pressable style={[styles.followBtn, { backgroundColor: trader.color }]} onPress={() => onFollow(trader)}>
          <Text style={styles.followBtnText}>一键跟单</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

// 我的持仓行
function PositionRow({ position }: { position: any }) {
  const isProfit = position.pnl >= 0;
  return (
    <View style={styles.positionRow}>
      <View style={styles.posLeft}>
        <View style={styles.posSymbolRow}>
          <Text style={styles.posSymbol}>{position.symbol}</Text>
          <View style={[styles.posSideBadge, { backgroundColor: isProfit ? '#00FF8815' : '#FF444415' }]}>
            <Text style={[styles.posSide, { color: isProfit ? '#00FF88' : '#FF4444' }]}>{position.side}</Text>
            <Text style={styles.posLeverage}>{position.leverage}x</Text>
          </View>
        </View>
        <Text style={styles.posPrice}>入场: ${position.entryPrice.toLocaleString()}</Text>
      </View>
      <View style={styles.posRight}>
        <Text style={styles.posCurrentPrice}>${position.currentPrice.toLocaleString()}</Text>
        <View style={[styles.pnlBadge, { backgroundColor: isProfit ? '#00FF8820' : '#FF444420' }]}>
          <Text style={[styles.posPnl, { color: isProfit ? '#00FF88' : '#FF4444' }]}>
            {isProfit ? '+' : ''}{position.pnl} USDT
          </Text>
          <Text style={[styles.posPnlRate, { color: isProfit ? '#00FF88' : '#FF4444' }]}>
            ({isProfit ? '+' : ''}{position.pnlRate}%)
          </Text>
        </View>
      </View>
    </View>
  );
}

// 历史订单行
function OrderRow({ order }: { order: any }) {
  const isProfit = order.pnl >= 0;
  const isClosed = order.status === '已平仓';
  return (
    <View style={[styles.orderRow, isClosed && styles.orderClosed]}>
      <View style={styles.orderLeft}>
        <View style={styles.orderSymbolRow}>
          <Text style={styles.orderSymbol}>{order.symbol}</Text>
          <Text style={[styles.orderSide, { color: order.side === '做多' ? '#00FF88' : '#FF4444' }]}>{order.side}</Text>
        </View>
        <Text style={styles.orderDetails}>{order.amount} @ ${order.price.toLocaleString()}</Text>
      </View>
      <View style={styles.orderRight}>
        <View style={[styles.orderStatusBadge, { backgroundColor: isClosed ? '#A855F720' : '#00F0FF20' }]}>
          <Text style={[styles.orderStatus, { color: isClosed ? '#A855F7' : '#00F0FF' }]}>{order.status}</Text>
        </View>
        <Text style={styles.orderTime}>{order.time}</Text>
        {isClosed && (
          <Text style={[styles.orderPnl, { color: isProfit ? '#00FF88' : '#FF4444' }]}>
            {isProfit ? '+' : ''}{order.pnl} USDT
          </Text>
        )}
      </View>
    </View>
  );
}

// 会员速递行
function VipNewsRow({ item }: { item: any }) {
  const typeConfig: Record<string, { icon: string; bgColor: string; borderColor: string }> = {
    alert: { icon: '🔴', bgColor: '#FF444420', borderColor: '#FF4444' },
    signal: { icon: '🟡', bgColor: '#FFD70020', borderColor: '#FFD700' },
    info: { icon: '🔵', bgColor: '#00F0FF20', borderColor: '#00F0FF' },
  };
  const config = typeConfig[item.type] || typeConfig.info;
  return (
    <View style={[styles.newsRow, { backgroundColor: config.bgColor, borderLeftColor: config.borderColor }]}>
      <View style={styles.newsHeader}>
        <Text style={styles.newsIcon}>{config.icon}</Text>
        <Text style={styles.newsTitle}>{item.title}</Text>
        <Text style={styles.newsTime}>{item.time}</Text>
      </View>
      <Text style={styles.newsDesc}>{item.desc}</Text>
    </View>
  );
}

export default function VipScreen() {
  const { wallet, connect } = useWeb3();
  const [activeTab, setActiveTab] = useState<'follow' | 'position' | 'news'>('follow');
  const [refreshing, setRefreshing] = useState(false);
  const [followModalVisible, setFollowModalVisible] = useState(false);
  const [selectedTrader, setSelectedTrader] = useState<any>(null);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  const handleFollow = (trader: any) => {
    if (!wallet.isConnected) {
      Alert.alert('提示', '请先连接钱包', [
        { text: '取消', style: 'cancel' },
        { text: '连接钱包', onPress: () => connect() },
      ]);
      return;
    }
    setSelectedTrader(trader);
    setFollowModalVisible(true);
  };

  const confirmFollow = () => {
    Alert.alert('跟单成功', `已成功跟随 ${selectedTrader?.name}，您将自动复制该交易员的操作`, [
      { text: '确定', onPress: () => setFollowModalVisible(false) },
    ]);
  };

  return (
    <Screen>
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00F0FF" />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>💎 会员中心</Text>
            <Text style={styles.subtitle}>专业级跟单服务</Text>
          </View>
          {wallet.isConnected ? (
            <View style={styles.walletBadge}>
              <Ionicons name="wallet" size={14} color="#00F0FF" />
              <Text style={styles.walletText}>
                {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}
              </Text>
            </View>
          ) : (
            <Pressable style={styles.connectBtn} onPress={() => connect()}>
              <Text style={styles.connectBtnText}>连接钱包</Text>
            </Pressable>
          )}
        </View>

        {/* Tab 切换 */}
        <View style={styles.tabBar}>
          {[
            { key: 'follow', title: '一键跟单', icon: 'people-outline' },
            { key: 'position', title: '我的实盘', icon: 'wallet-outline' },
            { key: 'news', title: '会员速递', icon: 'flash-outline' },
          ].map(tab => (
            <Pressable
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.tabActive]}
              onPress={() => setActiveTab(tab.key as any)}
            >
              <Ionicons
                name={tab.icon as any}
                size={18}
                color={activeTab === tab.key ? '#00F0FF' : '#6B7280'}
              />
              <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                {tab.title}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* 内容区域 */}
        <View style={styles.content}>
          {/* 一键跟单 */}
          {activeTab === 'follow' && (
            <View>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>🏆 明星交易员</Text>
                <Text style={styles.sectionSubtitle}>精选高胜率交易员，一键复制交易策略</Text>
              </View>
              
              {/* 排名说明 */}
              <View style={styles.rankInfo}>
                <View style={styles.rankItem}>
                  <Ionicons name="trophy" size={16} color="#FFD700" />
                  <Text style={styles.rankText}>按收益率排序</Text>
                </View>
                <View style={styles.rankItem}>
                  <Ionicons name="shield-checkmark" size={16} color="#00FF88" />
                  <Text style={styles.rankText}>认证交易员</Text>
                </View>
              </View>

              {TRADERS.map(trader => (
                <TraderCard key={trader.id} trader={trader} onFollow={handleFollow} />
              ))}
              
              <Link href="/copytrading">
                <Pressable style={styles.moreBtn}>
                  <Text style={styles.moreBtnText}>查看全部交易员 →</Text>
                </Pressable>
              </Link>
            </View>
          )}

          {/* 我的实盘 */}
          {activeTab === 'position' && (
            <View>
              {/* 收益概览 */}
              <View style={styles.summaryCard}>
                <View style={styles.summaryHeader}>
                  <Text style={styles.summaryTitle}>📊 收益概览</Text>
                  <View style={styles.summaryBadge}>
                    <Text style={styles.summaryBadgeText}>实时更新</Text>
                  </View>
                </View>
                <View style={styles.summaryGrid}>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryValue}>3</Text>
                    <Text style={styles.summaryLabel}>持仓数</Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryValue}>4</Text>
                    <Text style={styles.summaryLabel}>总订单</Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={[styles.summaryValue, { color: '#00FF88' }]}>+1,750</Text>
                    <Text style={styles.summaryLabel}>总收益(USDT)</Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={[styles.summaryValue, { color: '#00FF88' }]}>+3.25%</Text>
                    <Text style={styles.summaryLabel}>收益率</Text>
                  </View>
                </View>
              </View>

              {/* 当前持仓 */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>📋 当前持仓</Text>
                <Link href="/copytrading">
                  <Text style={styles.moreLink}>管理</Text>
                </Link>
              </View>
              {POSITIONS.map((pos, i) => (
                <PositionRow key={i} position={pos} />
              ))}

              {/* 历史订单 */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>📜 历史订单</Text>
              </View>
              {ORDERS.map((order, i) => (
                <OrderRow key={i} order={order} />
              ))}

              <Pressable style={styles.historyBtn}>
                <Text style={styles.historyBtnText}>查看全部历史订单 →</Text>
              </Pressable>
            </View>
          )}

          {/* 会员速递 */}
          {activeTab === 'news' && (
            <View>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>📰 会员速递</Text>
                <View style={styles.liveBadge}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>实时推送</Text>
                </View>
              </View>
              
              {VIP_NEWS.map(item => (
                <VipNewsRow key={item.id} item={item} />
              ))}

              <View style={styles.vipBanner}>
                <View style={styles.vipBannerContent}>
                  <Text style={styles.vipBannerTitle}>升级尊享版会员</Text>
                  <Text style={styles.vipBannerDesc}>解锁更多独家资讯、深度分析和预警服务</Text>
                </View>
                <Link href="/vip/membership">
                  <Pressable style={styles.vipBannerBtn}>
                    <Text style={styles.vipBannerBtnText}>立即升级</Text>
                  </Pressable>
                </Link>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* 跟单确认弹窗 */}
      <Modal visible={followModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>确认跟单</Text>
            {selectedTrader && (
              <View style={styles.modalTraderInfo}>
                <Text style={styles.modalTraderAvatar}>{selectedTrader.avatar}</Text>
                <Text style={styles.modalTraderName}>{selectedTrader.name}</Text>
                <View style={[styles.modalBadge, { backgroundColor: selectedTrader.color + '20' }]}>
                  <Text style={[styles.modalBadgeText, { color: selectedTrader.color }]}>
                    {selectedTrader.badges[0]}
                  </Text>
                </View>
              </View>
            )}
            <View style={styles.modalStats}>
              <View style={styles.modalStatItem}>
                <Text style={styles.modalStatValue}>{selectedTrader?.winRate}%</Text>
                <Text style={styles.modalStatLabel}>历史胜率</Text>
              </View>
              <View style={styles.modalStatItem}>
                <Text style={[styles.modalStatValue, { color: '#00FF88' }]}>+{selectedTrader?.returns}%</Text>
                <Text style={styles.modalStatLabel}>累计收益</Text>
              </View>
            </View>
            <Text style={styles.modalNote}>
              跟单后将自动复制该交易员的所有开仓和平仓操作，您需要保持足够的保证金。
            </Text>
            <View style={styles.modalButtons}>
              <Pressable style={styles.modalCancelBtn} onPress={() => setFollowModalVisible(false)}>
                <Text style={styles.modalCancelBtnText}>取消</Text>
              </Pressable>
              <Pressable style={styles.modalConfirmBtn} onPress={confirmFollow}>
                <Text style={styles.modalConfirmBtnText}>确认跟单</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F' },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 20, 
    paddingTop: 60,
    backgroundColor: '#12121A',
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  logo: { fontSize: 24, fontWeight: '700', color: '#FFFFFF' },
  subtitle: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  walletBadge: { 
    flexDirection: 'row', 
    alignItems: 'center',
    backgroundColor: '#1A1A24', 
    paddingHorizontal: 12, 
    paddingVertical: 8, 
    borderRadius: 20, 
    borderWidth: 1, 
    borderColor: '#00F0FF' 
  },
  walletText: { color: '#00F0FF', fontSize: 12, fontWeight: '600', marginLeft: 6 },
  connectBtn: {
    backgroundColor: '#00F0FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  connectBtnText: { color: '#0A0A0F', fontSize: 13, fontWeight: '700' },
  
  tabBar: { flexDirection: 'row', marginHorizontal: 16, backgroundColor: '#12121A', borderRadius: 12, padding: 4, marginBottom: 16, marginTop: 16 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 8 },
  tabActive: { backgroundColor: '#1A1A24' },
  tabText: { fontSize: 13, color: '#6B7280', marginLeft: 6 },
  tabTextActive: { color: '#00F0FF', fontWeight: '600' },
  
  content: { padding: 16, paddingBottom: 100 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  sectionSubtitle: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  moreLink: { fontSize: 14, color: '#00F0FF', fontWeight: '600' },
  
  // 交易员卡片
  rankInfo: { flexDirection: 'row', marginBottom: 16, gap: 16 },
  rankItem: { flexDirection: 'row', alignItems: 'center' },
  rankText: { fontSize: 12, color: '#9CA3AF', marginLeft: 6 },
  traderCard: { backgroundColor: '#12121A', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1 },
  traderHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatarContainer: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  traderAvatar: { fontSize: 28 },
  traderInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
  traderName: { fontSize: 16, fontWeight: '700', color: '#FFFFFF', marginRight: 8 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  badgeText: { fontSize: 10, fontWeight: '600' },
  specialties: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  traderStats: { flexDirection: 'row', marginBottom: 12, backgroundColor: '#0A0A0F', borderRadius: 12, padding: 12 },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  statLabel: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  traderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tradesCount: { fontSize: 12, color: '#6B7280' },
  followBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  followBtnText: { color: '#000', fontSize: 14, fontWeight: '700' },
  moreBtn: { backgroundColor: '#1A1A24', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 8, borderWidth: 1, borderColor: '#374151' },
  moreBtnText: { color: '#00F0FF', fontSize: 14, fontWeight: '600' },
  
  // 持仓
  summaryCard: { backgroundColor: '#12121A', borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#1F2937' },
  summaryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  summaryTitle: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  summaryBadge: { backgroundColor: '#00FF8820', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  summaryBadgeText: { fontSize: 10, color: '#00FF88', fontWeight: '600' },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  summaryItem: { width: '50%', alignItems: 'center', paddingVertical: 12 },
  summaryValue: { fontSize: 24, fontWeight: '700', color: '#FFFFFF' },
  summaryLabel: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  positionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#12121A', borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#1F2937' },
  posLeft: { flex: 1 },
  posSymbolRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  posSymbol: { fontSize: 16, fontWeight: '700', color: '#FFFFFF', marginRight: 8 },
  posSideBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  posSide: { fontSize: 11, fontWeight: '600' },
  posLeverage: { fontSize: 10, color: '#9CA3AF', marginLeft: 4 },
  posPrice: { fontSize: 12, color: '#6B7280' },
  posRight: { alignItems: 'flex-end' },
  posCurrentPrice: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  pnlBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginTop: 4 },
  posPnl: { fontSize: 13, fontWeight: '600' },
  posPnlRate: { fontSize: 11, marginLeft: 4 },
  orderRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#12121A', borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#1F2937' },
  orderClosed: { opacity: 0.7 },
  orderLeft: { flex: 1 },
  orderSymbolRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  orderSymbol: { fontSize: 14, fontWeight: '700', color: '#FFFFFF', marginRight: 8 },
  orderSide: { fontSize: 12, fontWeight: '600' },
  orderDetails: { fontSize: 12, color: '#6B7280' },
  orderRight: { alignItems: 'flex-end' },
  orderStatusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  orderStatus: { fontSize: 11, fontWeight: '600' },
  orderTime: { fontSize: 11, color: '#6B7280', marginTop: 4 },
  orderPnl: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  historyBtn: { backgroundColor: '#1A1A24', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 16, borderWidth: 1, borderColor: '#374151' },
  historyBtnText: { color: '#00F0FF', fontSize: 14, fontWeight: '600' },
  
  // 会员速递
  liveBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FF444420', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FF4444', marginRight: 6 },
  liveText: { fontSize: 11, color: '#FF4444', fontWeight: '600' },
  newsRow: { backgroundColor: '#12121A', borderRadius: 12, padding: 14, marginBottom: 10, borderLeftWidth: 3, borderWidth: 1, borderColor: '#1F2937' },
  newsHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  newsIcon: { fontSize: 14, marginRight: 8 },
  newsTitle: { flex: 1, fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  newsTime: { fontSize: 11, color: '#6B7280' },
  newsDesc: { fontSize: 13, color: '#9CA3AF', lineHeight: 20 },
  vipBanner: { backgroundColor: '#1A1A24', borderRadius: 16, padding: 16, marginTop: 16, borderWidth: 1, borderColor: '#FFD700' },
  vipBannerContent: { marginBottom: 12 },
  vipBannerTitle: { fontSize: 16, fontWeight: '700', color: '#FFD700', marginBottom: 4 },
  vipBannerDesc: { fontSize: 12, color: '#9CA3AF' },
  vipBannerBtn: { backgroundColor: '#FFD700', paddingVertical: 10, borderRadius: 20, alignItems: 'center' },
  vipBannerBtnText: { color: '#0A0A0F', fontSize: 14, fontWeight: '700' },
  
  // 弹窗
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#12121A', borderRadius: 20, padding: 24, width: '100%', borderWidth: 1, borderColor: '#1F2937' },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#FFFFFF', textAlign: 'center', marginBottom: 20 },
  modalTraderInfo: { alignItems: 'center', marginBottom: 20 },
  modalTraderAvatar: { fontSize: 48, marginBottom: 8 },
  modalTraderName: { fontSize: 18, fontWeight: '700', color: '#FFFFFF', marginBottom: 8 },
  modalBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  modalBadgeText: { fontSize: 12, fontWeight: '600' },
  modalStats: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#0A0A0F', borderRadius: 12, padding: 16, marginBottom: 16 },
  modalStatItem: { alignItems: 'center' },
  modalStatValue: { fontSize: 22, fontWeight: '700', color: '#FFFFFF' },
  modalStatLabel: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  modalNote: { fontSize: 12, color: '#9CA3AF', textAlign: 'center', marginBottom: 20, lineHeight: 18 },
  modalButtons: { flexDirection: 'row', gap: 12 },
  modalCancelBtn: { flex: 1, backgroundColor: '#1F2937', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  modalCancelBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  modalConfirmBtn: { flex: 1, backgroundColor: '#00F0FF', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  modalConfirmBtnText: { color: '#0A0A0F', fontSize: 14, fontWeight: '700' },
});
