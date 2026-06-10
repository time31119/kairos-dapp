import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { Screen } from '@/components/Screen';
import { Link } from 'expo-router';
import { Ionicons, FontAwesome6, MaterialCommunityIcons, Feather } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// 异动雷达数据
const radarAlerts = [
  { id: '1', symbol: 'PEPE', name: 'Pepe', change: 45.2, volume24h: '2.3亿', reason: '成交量激增 500%', time: '5分钟前', level: 'high' as const },
  { id: '2', symbol: 'WIF', name: 'dogwifhat', change: 28.7, volume24h: '8900万', reason: '大额转账', time: '12分钟前', level: 'high' as const },
  { id: '3', symbol: 'SATS', name: 'SATS', change: 18.4, volume24h: '4500万', reason: '社交热度飙升', time: '18分钟前', level: 'medium' as const },
  { id: '4', symbol: 'ORDI', name: 'ORDI', change: 15.2, volume24h: '3200万', reason: '技术突破', time: '25分钟前', level: 'medium' as const },
  { id: '5', symbol: 'RATS', name: 'RATS', change: 32.1, volume24h: '5600万', reason: '概念炒作', time: '32分钟前', level: 'high' as const },
];

// 机构动向数据
const institutionData = [
  { id: '1', symbol: 'BTC', name: 'Bitcoin', action: '增持', amount: '5000枚', value: '3.2亿', wallets: 12, change: 2.3, trend: 'up' as const },
  { id: '2', symbol: 'ETH', name: 'Ethereum', action: '建仓', amount: '8万枚', value: '2.1亿', wallets: 8, change: 1.8, trend: 'up' as const },
  { id: '3', symbol: 'SOL', name: 'Solana', action: '加仓', amount: '50万枚', value: '8000万', wallets: 6, change: -0.5, trend: 'down' as const },
  { id: '4', symbol: 'ARB', name: 'Arbitrum', action: '观望', amount: '0枚', value: '0', wallets: 3, change: 0.2, trend: 'neutral' as const },
];

// 跨周期共振数据
const crossCycleData = [
  { id: '1', symbol: 'BTC', name: 'Bitcoin', h1: true, h4: true, d1: true, cycle: 4, score: 95, change: 3.2 },
  { id: '2', symbol: 'ETH', name: 'Ethereum', h1: true, h4: true, d1: false, cycle: 3, score: 78, change: 2.8 },
  { id: '3', symbol: 'SOL', name: 'Solana', h1: false, h4: true, d1: true, cycle: 3, score: 72, change: -1.2 },
  { id: '4', symbol: 'BNB', name: 'BNB', h1: true, h4: false, d1: true, cycle: 3, score: 68, change: 1.5 },
  { id: '5', symbol: 'AVAX', name: 'Avalanche', h1: false, h4: false, d1: true, cycle: 2, score: 55, change: 4.2 },
];

// 精准狙击数据
const sniperData = [
  { id: '1', symbol: 'PEPE', name: 'Pepe', type: '做多', entry: 0.00001234, target: 0.00001500, stop: 0.00001000, risk: '低', profit: 24.5, signal: 'MACD金叉+放量突破' },
  { id: '2', symbol: 'WIF', name: 'dogwifhat', type: '做多', entry: 2.85, target: 3.50, stop: 2.50, risk: '中', profit: 22.8, signal: 'RSI超买+机构买入' },
  { id: '3', symbol: 'SATS', name: 'SATS', type: '做多', entry: 0.000342, target: 0.000420, stop: 0.000280, risk: '高', profit: 22.8, signal: '趋势线突破' },
  { id: '4', symbol: 'ORDI', name: 'ORDI', type: '做空', entry: 42.5, target: 35.0, stop: 48.0, risk: '中', profit: 17.6, signal: '顶背离+阻力位' },
];

const levelColors: Record<string, string> = {
  high: '#FF4757',
  medium: '#FFA502',
  low: '#2ED573',
};

const trendIcons: Record<string, React.ReactNode> = {
  up: <Ionicons name="trending-up" size={16} color="#00FF88" />,
  down: <Ionicons name="trending-down" size={16} color="#FF4757" />,
  neutral: <Ionicons name="remove" size={16} color="#888" />,
};

export default function VipIndexScreen() {
  const [activeTab, setActiveTab] = useState<'radar' | 'institution' | 'crosscycle' | 'sniper'>('radar');

  const renderRadarTab = () => (
    <View>
      <View style={styles.tabHeader}>
        <Ionicons name="pulse" size={20} color="#00F0FF" />
        <Text style={styles.tabTitle}>异动雷达</Text>
        <Text style={styles.tabSubtitle}>实时监控成交量突变</Text>
      </View>
      {radarAlerts.map((alert) => (
        <TouchableOpacity key={alert.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.coinInfo}>
              <View style={[styles.coinIcon, { backgroundColor: levelColors[alert.level] + '20' }]}>
                <Ionicons name="flame" size={20} color={levelColors[alert.level]} />
              </View>
              <View>
                <Text style={styles.symbol}>{alert.symbol}</Text>
                <Text style={styles.name}>{alert.name}</Text>
              </View>
            </View>
            <View style={styles.changeContainer}>
              <Text style={styles.changeValue}>+{alert.change}%</Text>
              <View style={[styles.levelBadge, { backgroundColor: levelColors[alert.level] + '20' }]}>
                <Text style={[styles.levelText, { color: levelColors[alert.level] }]}>
                  {alert.level === 'high' ? '强烈' : '中等'}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.cardBody}>
            <View style={styles.statRow}>
              <Ionicons name="bar-chart" size={14} color="#00F0FF" />
              <Text style={styles.statLabel}>24h成交量</Text>
              <Text style={styles.statValue}>{alert.volume24h}</Text>
            </View>
            <View style={styles.statRow}>
              <Ionicons name="alert-circle" size={14} color="#FFD700" />
              <Text style={styles.statLabel}>异动原因</Text>
              <Text style={styles.statValue}>{alert.reason}</Text>
            </View>
            <Text style={styles.time}>{alert.time}</Text>
          </View>
          <View style={styles.cardFooter}>
            <TouchableOpacity style={styles.detailBtn}>
              <Text style={styles.detailBtnText}>查看详情</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.alertBtn}>
              <Ionicons name="notifications-outline" size={18} color="#FFD700" />
              <Text style={styles.alertBtnText}>设置提醒</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderInstitutionTab = () => (
    <View>
      <View style={styles.tabHeader}>
        <FontAwesome6 name="building-columns" size={20} color="#00F0FF" />
        <Text style={styles.tabTitle}>机构动向</Text>
        <Text style={styles.tabSubtitle}>追踪大钱包资金流向</Text>
      </View>
      {institutionData.map((item) => (
        <TouchableOpacity key={item.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.coinInfo}>
              <View style={[styles.coinIcon, { backgroundColor: '#00F0FF20' }]}>
                <FontAwesome6 name="bitcoin" size={20} color="#00F0FF" />
              </View>
              <View>
                <Text style={styles.symbol}>{item.symbol}</Text>
                <Text style={styles.name}>{item.name}</Text>
              </View>
            </View>
            <View style={styles.changeContainer}>
              <View style={[styles.actionBadge, { 
                backgroundColor: item.action === '增持' || item.action === '建仓' || item.action === '加仓' 
                  ? '#00FF8820' : '#FF475720' 
              }]}>
                <Text style={[styles.actionText, { 
                  color: item.action === '增持' || item.action === '建仓' || item.action === '加仓' 
                    ? '#00FF88' : '#FF4757' 
                }]}>
                  {item.action}
                </Text>
              </View>
              {trendIcons[item.trend]}
            </View>
          </View>
          <View style={styles.cardBody}>
            <View style={styles.institutionStats}>
              <View style={styles.institutionStat}>
                <Text style={styles.institutionValue}>{item.amount}</Text>
                <Text style={styles.institutionLabel}>数量</Text>
              </View>
              <View style={styles.institutionStat}>
                <Text style={styles.institutionValue}>${item.value}</Text>
                <Text style={styles.institutionLabel}>市值</Text>
              </View>
              <View style={styles.institutionStat}>
                <Text style={styles.institutionValue}>{item.wallets}</Text>
                <Text style={styles.institutionLabel}>钱包数</Text>
              </View>
            </View>
          </View>
          <View style={styles.cardFooter}>
            <TouchableOpacity style={styles.followBtn}>
              <Ionicons name="add-circle-outline" size={18} color="#00F0FF" />
              <Text style={styles.followBtnText}>关注钱包</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.historyBtn}>
              <Ionicons name="time-outline" size={16} color="#888" />
              <Text style={styles.historyBtnText}>操作历史</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderCrossCycleTab = () => (
    <View>
      <View style={styles.tabHeader}>
        <MaterialCommunityIcons name="chart-timeline-variant" size={20} color="#00F0FF" />
        <Text style={styles.tabTitle}>跨周期共振</Text>
        <Text style={styles.tabSubtitle}>多周期均线系统共振信号</Text>
      </View>
      <View style={styles.cycleLegend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#00FF88' }]} />
          <Text style={styles.legendText}>1H</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#00F0FF' }]} />
          <Text style={styles.legendText}>4H</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#FFD700' }]} />
          <Text style={styles.legendText}>1D</Text>
        </View>
      </View>
      {crossCycleData.map((item) => (
        <TouchableOpacity key={item.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.coinInfo}>
              <View style={[styles.coinIcon, { backgroundColor: '#00F0FF20' }]}>
                <Ionicons name="git-pull-request" size={20} color="#00F0FF" />
              </View>
              <View>
                <Text style={styles.symbol}>{item.symbol}</Text>
                <Text style={styles.name}>{item.name}</Text>
              </View>
            </View>
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreValue}>{item.score}</Text>
              <Text style={styles.scoreLabel}>共振分</Text>
            </View>
          </View>
          <View style={styles.cardBody}>
            <View style={styles.cycleIndicators}>
              <View style={[styles.cycleBox, item.h1 ? styles.cycleActive : styles.cycleInactive]}>
                <Text style={[styles.cycleText, item.h1 && styles.cycleTextActive]}>1H</Text>
                {item.h1 && <Ionicons name="checkmark-circle" size={12} color="#00FF88" />}
              </View>
              <View style={[styles.cycleBox, item.h4 ? styles.cycleActive : styles.cycleInactive]}>
                <Text style={[styles.cycleText, item.h4 && styles.cycleTextActive]}>4H</Text>
                {item.h4 && <Ionicons name="checkmark-circle" size={12} color="#00F0FF" />}
              </View>
              <View style={[styles.cycleBox, item.d1 ? styles.cycleActive : styles.cycleInactive]}>
                <Text style={[styles.cycleText, item.d1 && styles.cycleTextActive]}>1D</Text>
                {item.d1 && <Ionicons name="checkmark-circle" size={12} color="#FFD700" />}
              </View>
              <View style={styles.cycleCount}>
                <Text style={styles.cycleCountValue}>{item.cycle}</Text>
                <Text style={styles.cycleCountLabel}>周期共振</Text>
              </View>
            </View>
            <View style={styles.changeRow}>
              <Text style={styles.changeLabel}>24h涨跌</Text>
              <Text style={[styles.changeValueSmall, { color: item.change >= 0 ? '#00FF88' : '#FF4757' }]}>
                {item.change >= 0 ? '+' : ''}{item.change}%
              </Text>
            </View>
          </View>
          <View style={styles.cardFooter}>
            <TouchableOpacity style={styles.signalBtn}>
              <Ionicons name="flash" size={18} color="#FFD700" />
              <Text style={styles.signalBtnText}>查看信号详情</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderSniperTab = () => (
    <View>
      <View style={styles.tabHeader}>
        <Feather name="crosshair" size={20} color="#00F0FF" />
        <Text style={styles.tabTitle}>精准狙击</Text>
        <Text style={styles.tabSubtitle}>多指标共振精确入场点</Text>
      </View>
      <View style={styles.sniperLegend}>
        <View style={[styles.legendItem, { backgroundColor: '#00FF8820' }]}>
          <Text style={[styles.legendText, { color: '#00FF88' }]}>做多信号</Text>
        </View>
        <View style={[styles.legendItem, { backgroundColor: '#FF475720' }]}>
          <Text style={[styles.legendText, { color: '#FF4757' }]}>做空信号</Text>
        </View>
      </View>
      {sniperData.map((item) => (
        <TouchableOpacity key={item.id} style={styles.sniperCard}>
          <View style={styles.sniperHeader}>
            <View style={styles.coinInfo}>
              <View style={[styles.coinIcon, { backgroundColor: item.type === '做多' ? '#00FF8820' : '#FF475720' }]}>
                <Feather name="target" size={20} color={item.type === '做多' ? '#00FF88' : '#FF4757'} />
              </View>
              <View>
                <View style={styles.symbolRow}>
                  <Text style={styles.symbol}>{item.symbol}</Text>
                  <View style={[styles.typeBadge, { backgroundColor: item.type === '做多' ? '#00FF8820' : '#FF475720' }]}>
                    <Text style={[styles.typeText, { color: item.type === '做多' ? '#00FF88' : '#FF4757' }]}>
                      {item.type}
                    </Text>
                  </View>
                </View>
                <Text style={styles.name}>{item.name}</Text>
              </View>
            </View>
            <View style={[styles.profitBadge, { backgroundColor: '#00FF8820' }]}>
              <Text style={styles.profitValue}>+{item.profit}%</Text>
              <Text style={styles.profitLabel}>预期收益</Text>
            </View>
          </View>
          <View style={styles.sniperLevels}>
            <View style={styles.levelItem}>
              <Text style={styles.levelLabel}>入场价</Text>
              <Text style={styles.levelValue}>{item.entry.toFixed(6)}</Text>
            </View>
            <View style={styles.levelItem}>
              <Text style={styles.levelLabel}>目标价</Text>
              <Text style={[styles.levelValue, { color: '#00FF88' }]}>{item.target.toFixed(6)}</Text>
            </View>
            <View style={styles.levelItem}>
              <Text style={styles.levelLabel}>止损价</Text>
              <Text style={[styles.levelValue, { color: '#FF4757' }]}>{item.stop.toFixed(6)}</Text>
            </View>
            <View style={[styles.levelItem, { backgroundColor: item.risk === '低' ? '#00FF8820' : item.risk === '中' ? '#FFD70020' : '#FF475720' }]}>
              <Text style={styles.levelLabel}>风险</Text>
              <Text style={[styles.levelValue, { color: item.risk === '低' ? '#00FF88' : item.risk === '中' ? '#FFD700' : '#FF4757' }]}>
                {item.risk}
              </Text>
            </View>
          </View>
          <View style={styles.signalBox}>
            <Text style={styles.signalLabel}>信号依据</Text>
            <Text style={styles.signalText}>{item.signal}</Text>
          </View>
          <View style={styles.cardFooter}>
            <TouchableOpacity style={[styles.sniperBtn, { backgroundColor: '#00FF8820' }]}>
              <Ionicons name="checkmark-circle" size={18} color="#00FF88" />
              <Text style={[styles.sniperBtnText, { color: '#00FF88' }]}>确认跟单</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.detailBtnSmall}>
              <Text style={styles.detailBtnTextSmall}>详情</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.vipIcon}>
            <FontAwesome6 name="crown" size={18} color="#FFD700" />
          </View>
          <View>
            <Text style={styles.title}>会员速递</Text>
            <Text style={styles.subtitle}>VIP专属选币策略</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.vipButton}>
          <Text style={styles.vipButtonText}>开通会员</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'radar' && styles.tabActive]}
          onPress={() => setActiveTab('radar')}
        >
          <Ionicons name="pulse" size={18} color={activeTab === 'radar' ? '#00F0FF' : '#666'} />
          <Text style={[styles.tabText, activeTab === 'radar' && styles.tabTextActive]}>异动</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'institution' && styles.tabActive]}
          onPress={() => setActiveTab('institution')}
        >
          <FontAwesome6 name="building-columns" size={16} color={activeTab === 'institution' ? '#00F0FF' : '#666'} />
          <Text style={[styles.tabText, activeTab === 'institution' && styles.tabTextActive]}>机构</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'crosscycle' && styles.tabActive]}
          onPress={() => setActiveTab('crosscycle')}
        >
          <MaterialCommunityIcons name="chart-timeline-variant" size={18} color={activeTab === 'crosscycle' ? '#00F0FF' : '#666'} />
          <Text style={[styles.tabText, activeTab === 'crosscycle' && styles.tabTextActive]}>共振</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'sniper' && styles.tabActive]}
          onPress={() => setActiveTab('sniper')}
        >
          <Feather name="crosshair" size={18} color={activeTab === 'sniper' ? '#00F0FF' : '#666'} />
          <Text style={[styles.tabText, activeTab === 'sniper' && styles.tabTextActive]}>狙击</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'radar' && renderRadarTab()}
        {activeTab === 'institution' && renderInstitutionTab()}
        {activeTab === 'crosscycle' && renderCrossCycleTab()}
        {activeTab === 'sniper' && renderSniperTab()}
        <View style={styles.bottomPadding} />
      </ScrollView>

      <View style={styles.vipBanner}>
        <FontAwesome6 name="crown" size={16} color="#FFD700" />
        <Text style={styles.vipBannerText}>解锁全部会员功能，获取实时推送</Text>
        <TouchableOpacity style={styles.vipBannerBtn}>
          <Text style={styles.vipBannerBtnText}>立即开通</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a2e',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vipIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFD70020',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  subtitle: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  vipButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  vipButtonText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 13,
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a2e',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#00F0FF10',
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
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  tabHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  tabTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  tabSubtitle: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  card: {
    backgroundColor: '#12121a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#00F0FF20',
  },
  sniperCard: {
    backgroundColor: '#12121a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FFD70020',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sniperHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  coinInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  symbol: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  symbolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  changeContainer: {
    alignItems: 'flex-end',
  },
  changeValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00FF88',
  },
  changeValueSmall: {
    fontSize: 14,
    fontWeight: '600',
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  levelText: {
    fontSize: 10,
    fontWeight: '600',
  },
  actionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  scoreLabel: {
    fontSize: 10,
    color: '#888',
  },
  cardBody: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#1a1a2e',
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  statLabel: {
    fontSize: 13,
    color: '#888',
    flex: 1,
  },
  statValue: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '500',
  },
  time: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#1a1a2e',
    gap: 12,
  },
  detailBtn: {
    flex: 1,
    backgroundColor: '#00F0FF20',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  detailBtnSmall: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  detailBtnText: {
    color: '#00F0FF',
    fontSize: 13,
    fontWeight: '500',
  },
  detailBtnTextSmall: {
    color: '#888',
    fontSize: 13,
    fontWeight: '500',
  },
  alertBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFD70040',
    gap: 6,
  },
  alertBtnText: {
    color: '#FFD700',
    fontSize: 13,
  },
  followBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#00F0FF20',
    gap: 6,
  },
  followBtnText: {
    color: '#00F0FF',
    fontSize: 13,
    fontWeight: '500',
  },
  historyBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    gap: 6,
  },
  historyBtnText: {
    color: '#888',
    fontSize: 13,
  },
  institutionStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  institutionStat: {
    alignItems: 'center',
  },
  institutionValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  institutionLabel: {
    fontSize: 11,
    color: '#888',
    marginTop: 4,
  },
  cycleLegend: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: '#888',
  },
  cycleIndicators: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cycleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  cycleActive: {
    backgroundColor: '#00F0FF20',
    borderWidth: 1,
    borderColor: '#00F0FF',
  },
  cycleInactive: {
    backgroundColor: '#1a1a2e',
    borderWidth: 1,
    borderColor: '#333',
  },
  cycleText: {
    fontSize: 12,
    color: '#666',
  },
  cycleTextActive: {
    color: '#00F0FF',
    fontWeight: '600',
  },
  cycleCount: {
    marginLeft: 8,
    alignItems: 'center',
  },
  cycleCountValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  cycleCountLabel: {
    fontSize: 10,
    color: '#888',
  },
  changeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  changeLabel: {
    fontSize: 12,
    color: '#888',
  },
  signalBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#FFD70020',
    gap: 6,
  },
  signalBtnText: {
    color: '#FFD700',
    fontSize: 13,
    fontWeight: '500',
  },
  sniperLegend: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  profitBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  profitValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00FF88',
  },
  profitLabel: {
    fontSize: 10,
    color: '#888',
    marginTop: 2,
  },
  sniperLevels: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  levelItem: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  levelLabel: {
    fontSize: 10,
    color: '#888',
    marginBottom: 4,
  },
  levelValue: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  signalBox: {
    backgroundColor: '#1a1a2e',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  signalLabel: {
    fontSize: 11,
    color: '#888',
    marginBottom: 4,
  },
  signalText: {
    fontSize: 12,
    color: '#FFD700',
    fontWeight: '500',
  },
  sniperBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  sniperBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 100,
  },
  vipBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFD70010',
    borderTopWidth: 1,
    borderTopColor: '#FFD70030',
    gap: 12,
  },
  vipBannerText: {
    flex: 1,
    fontSize: 12,
    color: '#888',
  },
  vipBannerBtn: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  vipBannerBtnText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 12,
  },
});
