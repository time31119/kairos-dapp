/**
 * 首页 - 场景选择
 * KAIROS 行情筛选器
 */

import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Platform, RefreshControl, Modal, TouchableWithoutFeedback } from 'react-native';
import { Screen } from '@/components/Screen';
import { Link } from 'expo-router';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { Ionicons } from '@expo/vector-icons';

type IconName = 'trending-up-outline' | 'stats-chart-outline' | 'flame-outline' | 'arrow-down-outline';

interface Scenario {
  id: string;
  title: string;
  description: string;
  direction: 'up' | 'down';
  timeframe: string;
  icon: IconName;
  filters: string;
}

const scenarios: Scenario[] = [
  {
    id: '1h_up',
    title: '1小时上涨动能',
    description: '寻找短期爆发标的',
    direction: 'up',
    timeframe: '1H',
    icon: 'trending-up-outline',
    filters: 'RSI 50-70 | ADX>25 | 成交量>1.5x | MFI>60'
  },
  {
    id: '4h_up',
    title: '4小时上涨动能',
    description: '波段趋势延续',
    direction: 'up',
    timeframe: '4H',
    icon: 'stats-chart-outline',
    filters: 'EMA多头排列 | MACD零轴上方 | ADX>25 | +DI>-DI'
  },
  {
    id: '1h_down',
    title: '1小时下跌动能',
    description: '做空短期弱势',
    direction: 'down',
    timeframe: '1H',
    icon: 'flame-outline',
    filters: '低于VWAP | RSI 30-50 | 下跌放量'
  },
  {
    id: '4h_down',
    title: '4小时下跌动能',
    description: '趋势性破位标的',
    direction: 'down',
    timeframe: '4H',
    icon: 'arrow-down-outline',
    filters: '跌破EMA50 | EMA空头 | MACD零轴下方 | ATR扩张'
  }
];

function ScenarioCard({ scenario }: { scenario: Scenario }) {
  const router = useSafeRouter();
  const isUp = scenario.direction === 'up';
  
  const borderColor = isUp ? '#00F0FF' : '#BF00FF';
  const glowColor = isUp ? 'rgba(0, 240, 255, 0.15)' : 'rgba(191, 0, 255, 0.15)';
  const arrowColor = isUp ? '#00F0FF' : '#BF00FF';
  
  return (
    <Link
      href={`/screener/${scenario.id}`}
      asChild
    >
      <Pressable
        style={({ pressed }) => [
          styles.scenarioCard,
          {
            borderColor,
            backgroundColor: pressed ? '#1A1A24' : '#12121A',
            shadowColor: borderColor,
            shadowOpacity: pressed ? 0.4 : 0.2,
          }
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.iconContainer, { backgroundColor: glowColor }]}>
            <Ionicons 
              name={scenario.icon} 
              size={24} 
              color={borderColor} 
            />
          </View>
          <View style={styles.titleContainer}>
            <View style={styles.titleRow}>
              <Text style={[styles.arrowIcon, { color: arrowColor }]}>
                {isUp ? '↑' : '↓'}
              </Text>
              <Text style={styles.title}>{scenario.title}</Text>
            </View>
            <Text style={styles.timeframe}>{scenario.timeframe}</Text>
          </View>
        </View>
        
        <Text style={styles.description}>{scenario.description}</Text>
        
        <View style={styles.filtersContainer}>
          <Text style={styles.filtersLabel}>筛选条件</Text>
          <Text style={styles.filters}>{scenario.filters}</Text>
        </View>
        
        <View style={[styles.gradientLine, { backgroundColor: borderColor }]} />
      </Pressable>
    </Link>
  );
}

// VIP 功能数据
interface VipFeature {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  route: string;
}

const vipFeatures: VipFeature[] = [
  {
    id: 'radar',
    title: '异动雷达',
    subtitle: '15分钟内成交量突增',
    icon: 'flame',
    route: '/vip/radar'
  },
  {
    id: 'institutional',
    title: '机构动向',
    subtitle: '大户建仓信号预警',
    icon: 'trending-up',
    route: '/vip/institutional'
  },
  {
    id: 'multi-cycle',
    title: '跨周期共振',
    subtitle: '多周期强势信号',
    icon: 'layers',
    route: '/vip/multi-cycle'
  },
  {
    id: 'precision',
    title: '精准狙击',
    subtitle: '多指标买卖点',
    icon: 'target',
    route: '/vip/precision'
  }
];

function VipSection() {
  return (
    <View style={styles.vipContainer}>
      {/* Section Header */}
      <View style={styles.vipHeader}>
        <View style={styles.vipTitleRow}>
          <View style={styles.vipCrownContainer}>
            <Ionicons name="medal" size={18} color="#FFD700" />
          </View>
          <Text style={styles.vipTitle}>会员速递</Text>
        </View>
        <Link href="/vip">
          <Text style={styles.vipMore}>全部 →</Text>
        </Link>
      </View>
      
      {/* VIP Feature Grid */}
      <View style={styles.vipGrid}>
        {vipFeatures.map((feature, index) => (
          <Link 
            key={feature.id} 
            href={feature.route}
            asChild
          >
            <Pressable 
              style={({ pressed }) => [
                styles.vipCard,
                {
                  backgroundColor: pressed ? '#1A1A24' : '#12121A',
                  opacity: pressed ? 0.8 : 1,
                }
              ]}
            >
              <View style={styles.vipCardIcon}>
                <Ionicons 
                  name={feature.icon as any} 
                  size={22} 
                  color="#FFD700" 
                />
              </View>
              <Text style={styles.vipCardTitle}>{feature.title}</Text>
              <Text style={styles.vipCardSubtitle}>{feature.subtitle}</Text>
            </Pressable>
          </Link>
        ))}
      </View>
      
      {/* VIP Badge */}
      <View style={styles.vipBadge}>
        <Ionicons name="diamond" size={12} color="#FFD700" />
        <Text style={styles.vipBadgeText}>开通会员解锁全部高级功能</Text>
        <Link href="/vip/membership" asChild>
          <Pressable style={styles.vipButton}>
            <Text style={styles.vipButtonText}>开通</Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}

// 跟单员数据
interface Trader {
  id: string;
  name: string;
  avatar: string;
  yield: number;
  winRate: number;
  followers: number;
  tag: string;
  tagColor: string;
}

const topTraders: Trader[] = [
  {
    id: '1',
    name: '币神张三',
    avatar: 'person',
    yield: 127.5,
    winRate: 82,
    followers: 2341,
    tag: '连胜中',
    tagColor: '#00FF88'
  },
  {
    id: '2',
    name: '量化小王',
    avatar: 'hardware-chip',
    yield: 89.3,
    winRate: 76,
    followers: 1856,
    tag: '稳健',
    tagColor: '#00F0FF'
  },
  {
    id: '3',
    name: '合约女王',
    avatar: 'woman',
    yield: 156.8,
    winRate: 68,
    followers: 3204,
    tag: '高收益',
    tagColor: '#FFD700'
  }
];

// My Positions Mock Data
const myPositions: Array<{ symbol: string; name: string; side: 'long' | 'short'; pnl: number; pnlPercent: number; leverage: number }> = [
  { symbol: 'BTC', name: 'Bitcoin', side: 'long', pnl: 793.45, pnlPercent: 1.99, leverage: 5 },
  { symbol: 'ETH', name: 'Ethereum', side: 'long', pnl: 310, pnlPercent: 1.80, leverage: 3 },
  { symbol: 'SOL', name: 'Solana', side: 'short', pnl: 280, pnlPercent: 3.57, leverage: 10 },
];

function MyTradingSection({ onPositionClick }: { onPositionClick?: (position: { symbol: string; side: 'long' | 'short'; leverage: number; pnl: number; pnlPercent: number }) => void }) {
  const totalPnl = myPositions.reduce((sum, p) => sum + p.pnl, 0);
  const isProfit = totalPnl >= 0;
  
  return (
    <Link href="/trading" asChild>
      <Pressable style={styles.tradingContainer}>
        {/* Section Header */}
        <View style={styles.tradingHeader}>
          <View style={styles.tradingTitleRow}>
            <View style={[styles.tradingIconContainer, { backgroundColor: 'rgba(0, 240, 255, 0.15)' }]}>
              <Ionicons name="analytics" size={18} color="#00F0FF" />
            </View>
            <Text style={styles.tradingTitle}>我的实盘交易</Text>
          </View>
          <View>
            <Text style={styles.tradingMore}>查看全部 →</Text>
          </View>
        </View>
        
        {/* Summary Card */}
        <View style={styles.tradingSummary}>
          <View style={styles.tradingPnlBox}>
            <Text style={styles.tradingPnlLabel}>总收益</Text>
            <Text style={[styles.tradingPnlValue, { color: isProfit ? '#00FF88' : '#FF3366' }]}>
              {isProfit ? '+' : ''}{totalPnl.toFixed(2)} U
            </Text>
          </View>
          <View style={styles.tradingStats}>
            <View style={styles.tradingStat}>
              <Text style={styles.tradingStatValue}>{myPositions.length}</Text>
              <Text style={styles.tradingStatLabel}>持仓</Text>
            </View>
            <View style={styles.tradingStatDivider} />
            <View style={styles.tradingStat}>
              <Text style={styles.tradingStatValue}>3</Text>
              <Text style={styles.tradingStatLabel}>订单</Text>
            </View>
          </View>
        </View>
        
        {/* Position Preview */}
        <View style={styles.positionPreview}>
          {myPositions.slice(0, 2).map((pos) => (
            <Pressable
              key={pos.symbol}
              style={styles.positionItem}
              onPress={() => onPositionClick?.(pos)}
            >
              <View style={styles.positionLeft}>
                <View style={[styles.positionSideBadge, { backgroundColor: pos.side === 'long' ? 'rgba(0, 255, 136, 0.2)' : 'rgba(255, 51, 102, 0.2)' }]}>
                  <Text style={[styles.positionSideText, { color: pos.side === 'long' ? '#00FF88' : '#FF3366' }]}>
                    {pos.side === 'long' ? '多' : '空'}
                  </Text>
                </View>
                <Text style={styles.positionSymbol}>{pos.symbol}</Text>
                <Text style={styles.positionLeverage}>{pos.leverage}x</Text>
              </View>
              <View style={styles.positionRight}>
                <Text style={[styles.positionPnl, { color: pos.pnl >= 0 ? '#00FF88' : '#FF3366' }]}>
                  {pos.pnl >= 0 ? '+' : ''}{pos.pnl.toFixed(2)} U
                </Text>
                <Text style={[styles.positionPnlPercent, { color: pos.pnlPercent >= 0 ? '#00FF88' : '#FF3366' }]}>
                  ({pos.pnlPercent >= 0 ? '+' : ''}{pos.pnlPercent.toFixed(2)}%)
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      </Pressable>
    </Link>
  );
}

function CopyTradingSection() {
  const router = useSafeRouter();

  const handleFollow = (traderId: string, traderName: string, e: any) => {
    e.stopPropagation();
    e.preventDefault();
    router.push('/copytrading/settings', { traderId, traderName });
  };

  return (
    <Pressable style={styles.copyContainer}>
      {/* Section Header */}
      <View style={styles.copyHeader}>
        <View style={styles.copyTitleRow}>
          <View style={styles.copyIconContainer}>
            <Ionicons name="git-network" size={18} color="#00F0FF" />
          </View>
          <Text style={styles.copyTitle}>一键跟单</Text>
          <View style={styles.copyBadge}>
            <Text style={styles.copyBadgeText}>HOT</Text>
          </View>
        </View>
        <View>
          <Text style={styles.copyMore}>更多交易员 →</Text>
        </View>
      </View>
      
      {/* Trader List */}
      <View style={styles.traderList}>
        {topTraders.map((trader, index) => (
          <View 
            key={trader.id} 
            style={[
              styles.traderCard,
              index < topTraders.length - 1 && styles.traderCardBorder
            ]}
          >
            {/* Rank */}
            <View style={styles.traderRank}>
              <Text style={[
                styles.traderRankText,
                index === 0 && styles.traderRankGold
              ]}>
                #{index + 1}
              </Text>
            </View>
            
            {/* Avatar */}
            <View style={styles.traderAvatar}>
              <Ionicons 
                name={trader.avatar as any} 
                size={20} 
                color="#00F0FF" 
              />
            </View>
            
            {/* Info */}
            <View style={styles.traderInfo}>
              <View style={styles.traderNameRow}>
                <Text style={styles.traderName}>{trader.name}</Text>
                <View style={[styles.traderTag, { backgroundColor: `${trader.tagColor}15` }]}>
                  <Text style={[styles.traderTagText, { color: trader.tagColor }]}>
                    {trader.tag}
                  </Text>
                </View>
              </View>
              <View style={styles.traderStats}>
                <Text style={styles.traderFollowers}>
                  <Text style={styles.traderFollowersNum}>{trader.followers.toLocaleString()}</Text> 人跟单
                </Text>
                <Text style={styles.traderDot}>•</Text>
                <Text style={styles.traderWinRate}>
                  <Text style={styles.traderWinRateNum}>{trader.winRate}%</Text> 胜率
                </Text>
              </View>
            </View>
            
            {/* Yield */}
            <View style={styles.traderYield}>
              <Text style={styles.traderYieldValue}>+{trader.yield}%</Text>
              <Text style={styles.traderYieldLabel}>收益率</Text>
            </View>

            {/* Follow Button */}
            <Pressable 
              style={styles.followButton}
              onPress={(e) => handleFollow(trader.id, trader.name, e)}
            >
              <Text style={styles.followButtonText}>跟单</Text>
            </Pressable>
          </View>
        ))}
      </View>
      
      {/* Disclaimer */}
      <View style={styles.copyDisclaimer}>
        <Ionicons name="warning-outline" size={12} color="#6B7280" />
        <Text style={styles.copyDisclaimerText}>跟单有风险，投资需谨慎</Text>
      </View>
    </Pressable>
  );
}

export default function HomeScreen() {
  const [refreshing, setRefreshing] = React.useState(false);
  const [showPositionModal, setShowPositionModal] = React.useState(false);
  const [selectedPosition, setSelectedPosition] = React.useState<{
    symbol: string;
    side: 'long' | 'short';
    leverage: number;
    entryPrice: number;
    currentPrice: number;
    amount: number;
    pnl: number;
    pnlPercent: number;
  } | null>(null);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const handleClosePosition = useCallback(() => {
    setShowPositionModal(false);
    setSelectedPosition(null);
    // Simulate close position
    alert('平仓请求已提交');
  }, []);

  return (
    <Screen>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#00F0FF"
            colors={['#00F0FF']}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.logoContainer}>
              <Ionicons name="flash" size={32} color="#00F0FF" style={styles.logoIcon} />
              <Text style={styles.logoText}>KAIROS</Text>
            </View>
            <Text style={styles.subtitle}>行情筛选器</Text>
          </View>
          {/* Search Icon */}
          <Link href="/search" asChild>
            <Pressable style={styles.notificationButton}>
              <Ionicons name="search" size={24} color="#00F0FF" />
            </Pressable>
          </Link>
          {/* Notification Icon */}
          <Pressable style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color="#00F0FF" />
            <View style={styles.notificationBadge} />
          </Pressable>
        </View>
        
        {/* Search Bar */}
        <Link href="/search" asChild>
          <Pressable style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#64748B" />
            <Text style={styles.searchPlaceholder}>搜索代币、交易员、资讯...</Text>
          </Pressable>
        </Link>
        
        {/* Intro */}
        <View style={styles.introContainer}>
          <Text style={styles.introText}>
            从海量代币中筛选出趋势最明确的标的
          </Text>
          <Text style={styles.introSubtext}>
            基于动量指标、资金流向、跨周期验证
          </Text>
        </View>
        
        {/* VIP Section */}
        <VipSection />
        
        {/* My Trading Section */}
        <MyTradingSection onPositionClick={(pos) => setSelectedPosition({ ...pos, entryPrice: 0, currentPrice: 0, amount: 0 })} />
        
        {/* Copy Trading Section */}
        <CopyTradingSection />
        
        {/* Scenarios */}
        <View style={styles.scenariosContainer}>
          <Text style={styles.sectionTitle}>选择筛选场景</Text>
          
          <View style={styles.scenarioList}>
            {scenarios.map((scenario) => (
              <ScenarioCard key={scenario.id} scenario={scenario} />
            ))}
          </View>
        </View>
        
        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            数据来源：CoinGecko
          </Text>
        </View>
      </ScrollView>

      {/* Position Detail Modal */}
      <Modal
        visible={showPositionModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPositionModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowPositionModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    {selectedPosition?.symbol} {selectedPosition?.side === 'long' ? '多单' : '空单'}
                  </Text>
                  <Pressable onPress={() => setShowPositionModal(false)}>
                    <Ionicons name="close" size={24} color="#8892A0" />
                  </Pressable>
                </View>
                
                {selectedPosition && (
                  <View style={styles.modalBody}>
                    <View style={styles.positionDetailRow}>
                      <Text style={styles.positionDetailLabel}>杠杆</Text>
                      <View style={[styles.leverageBadge, { backgroundColor: '#1A1A2E' }]}>
                        <Text style={[styles.leverageText, { color: '#FFD700' }]}>
                          {selectedPosition.leverage}x
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.positionDetailRow}>
                      <Text style={styles.positionDetailLabel}>入场价</Text>
                      <Text style={styles.positionDetailValue}>
                        ${selectedPosition.entryPrice.toLocaleString()}
                      </Text>
                    </View>
                    
                    <View style={styles.positionDetailRow}>
                      <Text style={styles.positionDetailLabel}>当前价</Text>
                      <Text style={styles.positionDetailValue}>
                        ${selectedPosition.currentPrice.toLocaleString()}
                      </Text>
                    </View>
                    
                    <View style={styles.positionDetailRow}>
                      <Text style={styles.positionDetailLabel}>数量</Text>
                      <Text style={styles.positionDetailValue}>
                        {selectedPosition.amount} USDT
                      </Text>
                    </View>
                    
                    <View style={styles.positionDetailRow}>
                      <Text style={styles.positionDetailLabel}>浮动盈亏</Text>
                      <Text style={[
                        styles.positionDetailValue,
                        { color: selectedPosition.pnl >= 0 ? '#00FF88' : '#FF3366' }
                      ]}>
                        {selectedPosition.pnl >= 0 ? '+' : ''}{selectedPosition.pnl.toFixed(2)} U
                        ({selectedPosition.pnlPercent >= 0 ? '+' : ''}{selectedPosition.pnlPercent.toFixed(2)}%)
                      </Text>
                    </View>
                    
                    <View style={styles.modalActions}>
                      <Pressable style={styles.modalSecondaryButton} onPress={() => setShowPositionModal(false)}>
                        <Text style={styles.modalSecondaryButtonText}>取消</Text>
                      </Pressable>
                      <Pressable style={styles.modalPrimaryButton} onPress={handleClosePosition}>
                        <Text style={styles.modalPrimaryButtonText}>确认平仓</Text>
                      </Pressable>
                    </View>
                  </View>
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingTop: 20,
  },
  headerLeft: {
    alignItems: 'flex-start',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  logoIcon: {
    marginRight: 8,
  },
  logoText: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    letterSpacing: 2,
  },
  // Notification
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#12121A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1F1F2E',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3366',
  },
  
  // Search Bar
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#12121A',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#1F1F2E',
  },
  searchPlaceholder: {
    marginLeft: 10,
    fontSize: 14,
    color: '#64748B',
    flex: 1,
  },
  
  // Intro
  introContainer: {
    backgroundColor: '#12121A',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#1F1F2E',
  },
  introText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  introSubtext: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  
  // Scenarios
  scenariosContainer: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    letterSpacing: 1,
  },
  scenarioList: {
    gap: 16,
  },
  
  // Scenario Card
  scenarioCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    position: 'relative',
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 20,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  arrowIcon: {
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  timeframe: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    marginLeft: 26,
  },
  description: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 12,
    marginLeft: 60,
  },
  filtersContainer: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 10,
    padding: 12,
    marginLeft: 60,
  },
  filtersLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 4,
    letterSpacing: 1,
  },
  filters: {
    fontSize: 11,
    color: '#9CA3AF',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  gradientLine: {
    position: 'absolute',
    bottom: 0,
    left: 20,
    right: 20,
    height: 2,
    borderRadius: 1,
  },
  
  // VIP Section
  vipContainer: {
    backgroundColor: '#12121A',
    borderRadius: 20,
    padding: 16,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)',
  },
  vipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  vipTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vipCrownContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  vipTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFD700',
    letterSpacing: 1,
  },
  vipMore: {
    fontSize: 12,
    color: '#FFD700',
  },
  vipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  vipCard: {
    width: '47%',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.15)',
  },
  vipCardIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  vipCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  vipCardSubtitle: {
    fontSize: 11,
    color: '#6B7280',
  },
  vipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 215, 0, 0.05)',
    borderRadius: 10,
    gap: 6,
  },
  vipBadgeText: {
    fontSize: 11,
    color: '#FFD700',
    letterSpacing: 0.5,
    flex: 1,
  },
  vipButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
  },
  vipButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0A0A0F',
  },
  
  // My Trading Section
  tradingContainer: {
    backgroundColor: '#12121A',
    borderRadius: 20,
    padding: 16,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.15)',
  },
  tradingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  tradingTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tradingIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tradingTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  tradingMore: {
    fontSize: 13,
    color: '#8B8B9E',
  },
  tradingSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0A0A0F',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  tradingPnlBox: {
    flex: 1,
  },
  tradingPnlLabel: {
    fontSize: 12,
    color: '#8B8B9E',
    marginBottom: 4,
  },
  tradingPnlValue: {
    fontSize: 24,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  tradingStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  tradingStat: {
    alignItems: 'center',
  },
  tradingStatValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#00F0FF',
    fontVariant: ['tabular-nums'],
  },
  tradingStatLabel: {
    fontSize: 11,
    color: '#8B8B9E',
    marginTop: 2,
  },
  tradingStatDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#1E1E2E',
  },
  positionPreview: {
    gap: 10,
  },
  positionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0A0A0F',
    borderRadius: 10,
    padding: 12,
  },
  positionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  positionSideBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  positionSideText: {
    fontSize: 11,
    fontWeight: '700',
  },
  positionSymbol: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  positionLeverage: {
    fontSize: 11,
    color: '#FFD700',
    fontWeight: '600',
  },
  positionRight: {
    alignItems: 'flex-end',
  },
  positionPnl: {
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  positionPnlPercent: {
    fontSize: 11,
    fontVariant: ['tabular-nums'],
    marginTop: 1,
  },
  
  // Copy Trading Section
  copyContainer: {
    backgroundColor: '#12121A',
    borderRadius: 20,
    padding: 16,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.15)',
  },
  copyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  copyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  copyIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  copyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00F0FF',
    letterSpacing: 1,
  },
  copyBadge: {
    marginLeft: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: 'rgba(255, 68, 68, 0.15)',
    borderRadius: 6,
  },
  copyBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FF4444',
    letterSpacing: 0.5,
  },
  copyMore: {
    fontSize: 12,
    color: '#00F0FF',
  },
  traderList: {
    gap: 0,
  },
  traderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  traderCardBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  traderRank: {
    width: 28,
    marginRight: 8,
  },
  traderRankText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  traderRankGold: {
    color: '#FFD700',
  },
  traderAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1A1A24',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  traderInfo: {
    flex: 1,
  },
  traderNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  traderName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8,
  },
  traderTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  traderTagText: {
    fontSize: 10,
    fontWeight: '600',
  },
  traderStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  traderFollowers: {
    fontSize: 11,
    color: '#6B7280',
  },
  traderFollowersNum: {
    color: '#9CA3AF',
    fontWeight: '600',
  },
  traderDot: {
    fontSize: 11,
    color: '#4B5563',
    marginHorizontal: 6,
  },
  traderWinRate: {
    fontSize: 11,
    color: '#6B7280',
  },
  traderWinRateNum: {
    color: '#00FF88',
    fontWeight: '600',
  },
  traderYield: {
    alignItems: 'flex-end',
    marginRight: 12,
  },
  traderYieldValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00FF88',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  traderYieldLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 2,
  },
  followButton: {
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.3)',
  },
  followButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#00F0FF',
  },
  copyDisclaimer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    gap: 4,
  },
  copyDisclaimerText: {
    fontSize: 10,
    color: '#6B7280',
  },
  
  // Footer
  footer: {
    alignItems: 'center',
    paddingTop: 20,
  },
  footerText: {
    fontSize: 11,
    color: '#4B5563',
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#1A1A2E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '70%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#4B5563',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalClose: {
    padding: 8,
  },
  modalCloseText: {
    fontSize: 24,
    color: '#6B7280',
  },
  modalSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  modalSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 12,
  },
  modalStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  modalStatLabel: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  modalStatValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  // Position Detail Modal
  modalContent: {
    backgroundColor: '#1A1A2E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingBottom: 32,
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  positionDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A3E',
  },
  positionDetailLabel: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  positionDetailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  leverageBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  leverageText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  positionDetailPnl: {
    fontSize: 18,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  positionDetailPnlPercent: {
    fontSize: 12,
    marginTop: 2,
  },
  // Modal actions
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  modalSecondaryButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalSecondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  modalPrimaryButton: {
    flex: 1,
    backgroundColor: '#FF3366',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalPrimaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalButton: {
    backgroundColor: '#00F0FF',
    paddingVertical: 14,
    borderRadius: 12,
    marginHorizontal: 20,
    alignItems: 'center',
    marginTop: 10,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0A0A0F',
  },
});
