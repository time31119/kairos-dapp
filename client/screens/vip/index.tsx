/**
 * 会员页面 - KAIROS DAPP
 * 包含：一键跟单、我的实盘、会员速递
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, RefreshControl } from 'react-native';
import { Screen } from '@/components/Screen';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useWeb3 } from '@/contexts/Web3Context';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9091';

// 交易员数据
const TRADERS = [
  {
    id: '1',
    name: '币神张三',
    avatar: '👨‍💼',
    winRate: 82,
    returns: 127.5,
    followers: 2847,
    badge: '认证交易员',
    color: '#FFD700',
  },
  {
    id: '2',
    name: '量化女王李四',
    avatar: '👩‍💻',
    winRate: 76,
    returns: 89.2,
    followers: 1523,
    badge: '量化专家',
    color: '#FF69B4',
  },
  {
    id: '3',
    name: '合约之王王五',
    avatar: '👨‍🚀',
    winRate: 68,
    returns: 156.8,
    followers: 3421,
    badge: '高收益',
    color: '#00FF88',
  },
];

// 我的实盘数据
const MOCK_POSITIONS = [
  { symbol: 'BTC', side: '多', amount: 0.5, pnl: 1250, pnlRate: 2.5 },
  { symbol: 'ETH', side: '空', amount: 2.0, pnl: -320, pnlRate: -1.2 },
];

// 会员速递数据
const VIP_NEWS = [
  { id: 1, title: 'BTC 异动预警', desc: '大额转账 5000 BTC', time: '2分钟前', type: 'alert' },
  { id: 2, title: '机构建仓信号', desc: '某鲸鱼买入 2000 ETH', time: '5分钟前', type: 'signal' },
  { id: 3, title: 'DeFi 锁仓量创新高', desc: '总锁仓突破 500亿美元', time: '10分钟前', type: 'info' },
];

// 交易员卡片
function TraderCard({ trader }: { trader: any }) {
  return (
    <Pressable style={[styles.traderCard, { borderColor: trader.color }]}>
      <View style={styles.traderHeader}>
        <Text style={styles.traderAvatar}>{trader.avatar}</Text>
        <View style={styles.traderInfo}>
          <Text style={styles.traderName}>{trader.name}</Text>
          <View style={[styles.badge, { backgroundColor: trader.color + '20' }]}>
            <Text style={[styles.badgeText, { color: trader.color }]}>{trader.badge}</Text>
          </View>
        </View>
      </View>
      <View style={styles.traderStats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{trader.winRate}%</Text>
          <Text style={styles.statLabel}>胜率</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#00FF88' }]}>{trader.returns}%</Text>
          <Text style={styles.statLabel}>收益率</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{trader.followers}</Text>
          <Text style={styles.statLabel}>跟单人数</Text>
        </View>
      </View>
      <Pressable style={[styles.followBtn, { backgroundColor: trader.color }]}>
        <Text style={styles.followBtnText}>一键跟单</Text>
      </Pressable>
    </Pressable>
  );
}

// 我的持仓
function PositionRow({ position }: { position: any }) {
  const isProfit = position.pnl >= 0;
  return (
    <View style={styles.positionRow}>
      <View style={styles.posLeft}>
        <Text style={styles.posSymbol}>{position.symbol}</Text>
        <Text style={[styles.posSide, { color: position.side === '多' ? '#00FF88' : '#FF4444' }]}>
          {position.side}
        </Text>
      </View>
      <View style={styles.posRight}>
        <Text style={styles.posAmount}>{position.amount}</Text>
        <Text style={[styles.posPnl, { color: isProfit ? '#00FF88' : '#FF4444' }]}>
          {isProfit ? '+' : ''}{position.pnl} ({isProfit ? '+' : ''}{position.pnlRate}%)
        </Text>
      </View>
    </View>
  );
}

// 会员速递
function VipNewsRow({ item }: { item: any }) {
  const typeIcon = item.type === 'alert' ? '🔴' : item.type === 'signal' ? '🟡' : '🔵';
  return (
    <View style={styles.newsRow}>
      <Text style={styles.newsIcon}>{typeIcon}</Text>
      <View style={styles.newsContent}>
        <Text style={styles.newsTitle}>{item.title}</Text>
        <Text style={styles.newsDesc}>{item.desc}</Text>
      </View>
      <Text style={styles.newsTime}>{item.time}</Text>
    </View>
  );
}

export default function VipScreen() {
  const { wallet } = useWeb3();
  const [activeTab, setActiveTab] = useState<'follow' | 'position' | 'news'>('follow');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
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
          <Text style={styles.logo}>💎 会员中心</Text>
          {wallet.isConnected && (
            <View style={styles.walletBadge}>
              <Text style={styles.walletText}>
                {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}
              </Text>
            </View>
          )}
        </View>

        {/* Tab 切换 */}
        <View style={styles.tabBar}>
          {[
            { key: 'follow', title: '一键跟单', icon: 'people-outline' },
            { key: 'position', title: '我的实盘', icon: 'wallet-outline' },
            { key: 'news', title: '会员速递', icon: 'newspaper-outline' },
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
                <Link href="/copytrading">
                  <Text style={styles.moreLink}>更多</Text>
                </Link>
              </View>
              {TRADERS.map(trader => (
                <TraderCard key={trader.id} trader={trader} />
              ))}
            </View>
          )}

          {/* 我的实盘 */}
          {activeTab === 'position' && (
            <View>
              <View style={styles.summaryCard}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>2</Text>
                  <Text style={styles.summaryLabel}>持仓数</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>5</Text>
                  <Text style={styles.summaryLabel}>订单数</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryValue, { color: '#00FF88' }]}>+930</Text>
                  <Text style={styles.summaryLabel}>总收益(USDT)</Text>
                </View>
              </View>

              <Text style={styles.sectionTitle}>📋 当前持仓</Text>
              {MOCK_POSITIONS.map((pos, i) => (
                <PositionRow key={i} position={pos} />
              ))}

              <Pressable style={styles.historyBtn}>
                <Text style={styles.historyBtnText}>查看全部历史</Text>
              </Pressable>
            </View>
          )}

          {/* 会员速递 */}
          {activeTab === 'news' && (
            <View>
              <View style={styles.vipBanner}>
                <Text style={styles.vipTitle}>尊贵的 VIP 会员</Text>
                <Text style={styles.vipDesc}>第一时间获取机构级异动情报</Text>
              </View>
              {VIP_NEWS.map(item => (
                <VipNewsRow key={item.id} item={item} />
              ))}
              <Link href="/notification">
                <Pressable style={styles.moreNewsBtn}>
                  <Text style={styles.moreNewsBtnText}>查看更多情报</Text>
                </Pressable>
              </Link>
            </View>
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 60 },
  logo: { fontSize: 24, fontWeight: '700', color: '#FFFFFF' },
  walletBadge: { backgroundColor: '#1A1A24', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#00F0FF' },
  walletText: { color: '#00F0FF', fontSize: 12, fontWeight: '600' },
  tabBar: { flexDirection: 'row', marginHorizontal: 16, backgroundColor: '#12121A', borderRadius: 12, padding: 4, marginBottom: 16 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 8 },
  tabActive: { backgroundColor: '#1A1A24' },
  tabText: { fontSize: 13, color: '#6B7280', marginLeft: 6 },
  tabTextActive: { color: '#00F0FF', fontWeight: '600' },
  content: { padding: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#FFFFFF', marginBottom: 12 },
  moreLink: { fontSize: 12, color: '#00F0FF' },
  // 交易员卡片
  traderCard: { backgroundColor: '#12121A', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1 },
  traderHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  traderAvatar: { fontSize: 36, marginRight: 12 },
  traderInfo: { flex: 1 },
  traderName: { fontSize: 16, fontWeight: '700', color: '#FFFFFF', marginBottom: 4 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start' },
  badgeText: { fontSize: 10, fontWeight: '600' },
  traderStats: { flexDirection: 'row', marginBottom: 12 },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  statLabel: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  followBtn: { paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  followBtnText: { color: '#000', fontSize: 14, fontWeight: '700' },
  // 持仓
  summaryCard: { flexDirection: 'row', backgroundColor: '#12121A', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#1F2937' },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryValue: { fontSize: 22, fontWeight: '700', color: '#FFFFFF' },
  summaryLabel: { fontSize: 11, color: '#6B7280', marginTop: 4 },
  positionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#12121A', borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#1F2937' },
  posLeft: { flexDirection: 'row', alignItems: 'center' },
  posSymbol: { fontSize: 16, fontWeight: '700', color: '#FFFFFF', marginRight: 8 },
  posSide: { fontSize: 12, fontWeight: '600' },
  posRight: { alignItems: 'flex-end' },
  posAmount: { fontSize: 14, color: '#9CA3AF' },
  posPnl: { fontSize: 14, fontWeight: '600', marginTop: 2 },
  historyBtn: { backgroundColor: '#1A1A24', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 8, borderWidth: 1, borderColor: '#374151' },
  historyBtnText: { color: '#00F0FF', fontSize: 14, fontWeight: '600' },
  // 会员速递
  vipBanner: { backgroundColor: 'linear-gradient(135deg, #1A1A24 0%, #2D2D3A 100%)', borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#FFD700' },
  vipTitle: { fontSize: 18, fontWeight: '700', color: '#FFD700', marginBottom: 4 },
  vipDesc: { fontSize: 13, color: '#9CA3AF' },
  newsRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#12121A', borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#1F2937' },
  newsIcon: { fontSize: 24, marginRight: 12 },
  newsContent: { flex: 1 },
  newsTitle: { fontSize: 14, fontWeight: '600', color: '#FFFFFF', marginBottom: 2 },
  newsDesc: { fontSize: 12, color: '#6B7280' },
  newsTime: { fontSize: 10, color: '#6B7280' },
  moreNewsBtn: { backgroundColor: '#FFD70020', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 8, borderWidth: 1, borderColor: '#FFD700' },
  moreNewsBtnText: { color: '#FFD700', fontSize: 14, fontWeight: '600' },
});
