import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { Screen } from '@/components/Screen';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { Ionicons } from '@expo/vector-icons';

interface Position {
  id: string;
  symbol: string;
  name: string;
  side: 'long' | 'short';
  entryPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
  amount: number;
  leverage: number;
  margin: number;
  liquidationPrice: number;
  stopLoss?: number;
  takeProfit?: number;
  openTime: string;
}

interface Order {
  id: string;
  symbol: string;
  side: 'long' | 'short';
  type: 'limit' | 'market';
  price: number;
  triggerPrice?: number;
  amount: number;
  filled: number;
  status: 'pending' | 'partial' | 'cancelled';
  time: string;
}

interface Trade {
  id: string;
  symbol: string;
  side: 'long' | 'short';
  price: number;
  amount: number;
  pnl: number;
  fee: number;
  closeReason: 'manual' | 'sl' | 'tp' | 'liquidation';
  time: string;
  status: 'completed' | 'partial';
}

interface AccountStats {
  totalProfit: number;
  totalLoss: number;
  winRate: number;
  maxDrawdown: number;
  totalTrades: number;
  profitableTrades: number;
  avgProfit: number;
  avgLoss: number;
}

export default function TradingScreen() {
  const router = useSafeRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'positions' | 'orders' | 'history'>('overview');

  // Mock account statistics
  const accountStats: AccountStats = {
    totalProfit: 4582.34,
    totalLoss: -1587.56,
    winRate: 68.5,
    maxDrawdown: -892.45,
    totalTrades: 156,
    profitableTrades: 107,
    avgProfit: 42.82,
    avgLoss: -14.83,
  };

  // Mock data
  const positions: Position[] = [
    {
      id: '1',
      symbol: 'BTC',
      name: 'Bitcoin',
      side: 'long',
      entryPrice: 66500,
      currentPrice: 67823,
      pnl: 793.45,
      pnlPercent: 1.99,
      amount: 0.5,
      leverage: 5,
      margin: 6650,
      liquidationPrice: 53200,
      stopLoss: 64000,
      takeProfit: 72000,
      openTime: '2024-01-15 14:30',
    },
    {
      id: '2',
      symbol: 'ETH',
      name: 'Ethereum',
      side: 'long',
      entryPrice: 3450,
      currentPrice: 3512,
      pnl: 310,
      pnlPercent: 1.80,
      amount: 2,
      leverage: 3,
      margin: 2300,
      liquidationPrice: 2760,
      openTime: '2024-01-15 16:45',
    },
    {
      id: '3',
      symbol: 'SOL',
      name: 'Solana',
      side: 'short',
      entryPrice: 112,
      currentPrice: 108,
      pnl: 280,
      pnlPercent: 3.57,
      amount: 100,
      leverage: 10,
      margin: 1120,
      liquidationPrice: 123.2,
      openTime: '2024-01-14 09:20',
    },
  ];

  const orders: Order[] = [
    { id: '1', symbol: 'BNB', side: 'long', type: 'limit', price: 320, amount: 5, filled: 0, status: 'pending', time: '2024-01-16 10:30' },
    { id: '2', symbol: 'AVAX', side: 'short', type: 'limit', price: 38.5, amount: 50, filled: 25, status: 'partial', time: '2024-01-16 09:15' },
    { id: '3', symbol: 'LINK', side: 'long', type: 'stop', price: 0, triggerPrice: 18.5, amount: 100, filled: 0, status: 'pending', time: '2024-01-16 08:00' },
  ];

  const trades: Trade[] = [
    { id: '1', symbol: 'BTC', side: 'long', price: 66500, amount: 0.5, pnl: 793.45, fee: 33.25, closeReason: 'manual', time: '2024-01-15 14:30', status: 'completed' },
    { id: '2', symbol: 'ETH', side: 'long', price: 3450, amount: 2, pnl: 310, fee: 6.9, closeReason: 'manual', time: '2024-01-15 16:45', status: 'completed' },
    { id: '3', symbol: 'SOL', side: 'short', price: 112, amount: 100, pnl: 280, fee: 11.2, closeReason: 'tp', time: '2024-01-14 09:20', status: 'completed' },
    { id: '4', symbol: 'BNB', side: 'long', price: 312, amount: 5, pnl: -85, fee: 1.56, closeReason: 'sl', time: '2024-01-13 11:00', status: 'completed' },
    { id: '5', symbol: 'DOGE', side: 'short', price: 0.082, amount: 10000, pnl: 156.8, fee: 0.82, closeReason: 'tp', time: '2024-01-12 15:30', status: 'completed' },
    { id: '6', symbol: 'ADA', side: 'long', price: 0.58, amount: 1000, pnl: -42.5, fee: 0.58, closeReason: 'manual', time: '2024-01-11 10:15', status: 'completed' },
  ];

  const totalPnl = positions.reduce((sum, p) => sum + p.pnl, 0);
  const totalMargin = positions.reduce((sum, p) => sum + p.margin, 0);
  const netProfit = accountStats.totalProfit + accountStats.totalLoss;

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const renderOverview = () => (
    <View style={styles.overviewContainer}>
      {/* Profit Summary */}
      <View style={styles.profitCard}>
        <View style={styles.profitHeader}>
          <Text style={styles.profitLabel}>总净收益</Text>
          <Text style={[styles.profitValue, { color: netProfit >= 0 ? '#00FF88' : '#FF3366' }]}>
            {netProfit >= 0 ? '+' : ''}{netProfit.toFixed(2)} U
          </Text>
        </View>
        <View style={styles.profitStats}>
          <View style={styles.profitStat}>
            <Text style={styles.profitStatLabel}>盈利</Text>
            <Text style={[styles.profitStatValue, { color: '#00FF88' }]}>+{accountStats.totalProfit.toFixed(2)}</Text>
          </View>
          <View style={styles.profitStat}>
            <Text style={styles.profitStatLabel}>亏损</Text>
            <Text style={[styles.profitStatValue, { color: '#FF3366' }]}>{accountStats.totalLoss.toFixed(2)}</Text>
          </View>
          <View style={styles.profitStat}>
            <Text style={styles.profitStatLabel}>保证金</Text>
            <Text style={styles.profitStatValue}>{totalMargin.toLocaleString()}</Text>
          </View>
        </View>
      </View>

      {/* Performance Metrics */}
      <View style={styles.metricsCard}>
        <Text style={styles.metricsTitle}>绩效指标</Text>
        <View style={styles.metricsGrid}>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{accountStats.winRate.toFixed(1)}%</Text>
            <Text style={styles.metricLabel}>胜率</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={[styles.metricValue, { color: '#FF3366' }]}>{accountStats.maxDrawdown.toFixed(2)}</Text>
            <Text style={styles.metricLabel}>最大回撤</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{accountStats.totalTrades}</Text>
            <Text style={styles.metricLabel}>总交易</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{accountStats.profitableTrades}</Text>
            <Text style={styles.metricLabel}>盈利交易</Text>
          </View>
        </View>
      </View>

      {/* Average Stats */}
      <View style={styles.avgCard}>
        <View style={styles.avgItem}>
          <Text style={styles.avgLabel}>平均盈利</Text>
          <Text style={[styles.avgValue, { color: '#00FF88' }]}>+{accountStats.avgProfit.toFixed(2)} U</Text>
        </View>
        <View style={styles.avgDivider} />
        <View style={styles.avgItem}>
          <Text style={styles.avgLabel}>平均亏损</Text>
          <Text style={[styles.avgValue, { color: '#FF3366' }]}>{accountStats.avgLoss.toFixed(2)} U</Text>
        </View>
        <View style={styles.avgDivider} />
        <View style={styles.avgItem}>
          <Text style={styles.avgLabel}>盈亏比</Text>
          <Text style={styles.avgValue}>{(accountStats.avgProfit / Math.abs(accountStats.avgLoss)).toFixed(2)}</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.quickActionBtn}>
          <Ionicons name="add-circle-outline" size={24} color="#00F0FF" />
          <Text style={styles.quickActionText}>开仓</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickActionBtn}>
          <Ionicons name="swap-horizontal-outline" size={24} color="#00F0FF" />
          <Text style={styles.quickActionText}>平多</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickActionBtn}>
          <Ionicons name="swap-horizontal-outline" size={24} color="#FF3366" />
          <Text style={styles.quickActionText}>平空</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickActionBtn}>
          <Ionicons name="analytics-outline" size={24} color="#FFD700" />
          <Text style={styles.quickActionText}>分析</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPosition = (position: Position) => {
    const isProfit = position.pnl >= 0;
    const pnlColor = isProfit ? '#00FF88' : '#FF3366';

    return (
      <TouchableOpacity
        key={position.id}
        style={styles.positionCard}
        onPress={() => router.push('/coin', { id: position.symbol.toLowerCase() })}
      >
        <View style={styles.positionHeader}>
          <View style={styles.positionInfo}>
            <View style={[styles.sideBadge, { backgroundColor: position.side === 'long' ? '#00FF88' : '#FF3366' }]}>
              <Text style={styles.sideText}>{position.side === 'long' ? '多' : '空'}</Text>
            </View>
            <View>
              <Text style={styles.symbolText}>{position.symbol}</Text>
              <Text style={styles.nameText}>{position.name}</Text>
            </View>
          </View>
          <View style={styles.positionRight}>
            <View style={styles.leverageTag}>
              <Text style={styles.leverageText}>{position.leverage}x</Text>
            </View>
            <Text style={styles.amountText}>{position.amount}</Text>
          </View>
        </View>

        <View style={styles.positionPrices}>
          <View style={styles.priceItem}>
            <Text style={styles.priceLabel}>入场价</Text>
            <Text style={styles.priceValue}>${position.entryPrice.toLocaleString()}</Text>
          </View>
          <View style={styles.priceItem}>
            <Text style={styles.priceLabel}>当前价</Text>
            <Text style={styles.priceValue}>${position.currentPrice.toLocaleString()}</Text>
          </View>
          <View style={styles.priceItem}>
            <Text style={styles.priceLabel}>强平价</Text>
            <Text style={[styles.priceValue, { color: '#FF3366' }]}>${position.liquidationPrice.toLocaleString()}</Text>
          </View>
        </View>

        {(position.stopLoss || position.takeProfit) && (
          <View style={styles.positionLevels}>
            {position.stopLoss && (
              <View style={styles.levelItem}>
                <Text style={styles.levelLabel}>止损</Text>
                <Text style={[styles.levelValue, { color: '#FF3366' }]}>${position.stopLoss.toLocaleString()}</Text>
              </View>
            )}
            {position.takeProfit && (
              <View style={styles.levelItem}>
                <Text style={styles.levelLabel}>止盈</Text>
                <Text style={[styles.levelValue, { color: '#00FF88' }]}>${position.takeProfit.toLocaleString()}</Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.positionFooter}>
          <View style={styles.pnlContainer}>
            <Text style={[styles.pnlValue, { color: pnlColor }]}>
              {isProfit ? '+' : ''}{position.pnl.toFixed(2)} U
            </Text>
            <Text style={[styles.pnlPercent, { color: pnlColor }]}>
              ({isProfit ? '+' : ''}{position.pnlPercent.toFixed(2)}%)
            </Text>
          </View>
          <Text style={styles.marginText}>保证金: {position.margin} U</Text>
        </View>

        <View style={styles.positionActions}>
          <TouchableOpacity style={[styles.actionBtn, styles.tpBtn]}>
            <Text style={styles.tpBtnText}>+止盈</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.slBtn]}>
            <Text style={styles.slBtnText}>+止损</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.closeBtn]}>
            <Text style={styles.closeBtnText}>平仓</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderOrder = (order: Order) => {
    const isLong = order.side === 'long';

    return (
      <View key={order.id} style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <View style={styles.orderInfo}>
            <View style={[styles.sideBadge, { backgroundColor: isLong ? '#00FF88' : '#FF3366' }]}>
              <Text style={styles.sideText}>{isLong ? '多' : '空'}</Text>
            </View>
            <View>
              <Text style={styles.orderSymbol}>{order.symbol}/USDT</Text>
              <Text style={styles.orderType}>
                {order.type === 'limit' ? '限价' : order.type === 'stop' ? '止损' : '市价'}
                {order.status === 'partial' && ' (部分成交)'}
              </Text>
            </View>
          </View>
          <View style={[styles.orderStatus, {
            backgroundColor: order.status === 'pending' ? '#1E1E2E' : '#2A2A3E'
          }]}>
            <Text style={[styles.orderStatusText, {
              color: order.status === 'pending' ? '#FFD700' : '#00F0FF'
            }]}>
              {order.status === 'pending' ? '等待中' : order.status === 'partial' ? '部分成交' : '已取消'}
            </Text>
          </View>
        </View>

        <View style={styles.orderDetails}>
          <View style={styles.orderItem}>
            <Text style={styles.orderLabel}>{order.triggerPrice ? '触发价' : '价格'}</Text>
            <Text style={styles.orderValue}>${order.price || order.triggerPrice}</Text>
          </View>
          <View style={styles.orderItem}>
            <Text style={styles.orderLabel}>数量</Text>
            <Text style={styles.orderValue}>{order.amount}</Text>
          </View>
          <View style={styles.orderItem}>
            <Text style={styles.orderLabel}>已成交</Text>
            <Text style={styles.orderValue}>{order.filled}</Text>
          </View>
          <View style={styles.orderItem}>
            <Text style={styles.orderLabel}>时间</Text>
            <Text style={styles.orderTime}>{order.time}</Text>
          </View>
        </View>

        <View style={styles.orderActions}>
          <TouchableOpacity style={[styles.orderBtn, styles.cancelBtn]}>
            <Text style={styles.cancelBtnText}>撤销</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.orderBtn, styles.modifyBtn]}>
            <Text style={styles.modifyBtnText}>修改</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const getCloseReasonText = (reason: Trade['closeReason']) => {
    switch (reason) {
      case 'manual': return '手动平仓';
      case 'sl': return '止损';
      case 'tp': return '止盈';
      case 'liquidation': return '爆仓';
      default: return reason;
    }
  };

  const getCloseReasonColor = (reason: Trade['closeReason']) => {
    switch (reason) {
      case 'manual': return '#00F0FF';
      case 'sl':
      case 'liquidation': return '#FF3366';
      case 'tp': return '#00FF88';
      default: return '#8B8B9E';
    }
  };

  const renderTrade = (trade: Trade) => {
    const isProfit = trade.pnl >= 0;
    const pnlColor = isProfit ? '#00FF88' : '#FF3366';

    return (
      <TouchableOpacity
        key={trade.id}
        style={styles.tradeCard}
        onPress={() => router.push('/coin', { id: trade.symbol.toLowerCase() })}
      >
        <View style={styles.tradeHeader}>
          <View style={styles.tradeInfo}>
            <View style={[styles.sideBadge, { backgroundColor: trade.side === 'long' ? '#00FF88' : '#FF3366' }]}>
              <Text style={styles.sideText}>{trade.side === 'long' ? '多' : '空'}</Text>
            </View>
            <Text style={styles.tradeSymbol}>{trade.symbol}/USDT</Text>
          </View>
          <View style={styles.tradeRight}>
            <Text style={styles.tradeTime}>{trade.time}</Text>
            <View style={[styles.closeReasonTag, { backgroundColor: getCloseReasonColor(trade.closeReason) + '20' }]}>
              <Text style={[styles.closeReasonText, { color: getCloseReasonColor(trade.closeReason) }]}>
                {getCloseReasonText(trade.closeReason)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.tradeDetails}>
          <View style={styles.tradeItem}>
            <Text style={styles.tradeLabel}>成交价</Text>
            <Text style={styles.tradeValue}>${trade.price}</Text>
          </View>
          <View style={styles.tradeItem}>
            <Text style={styles.tradeLabel}>数量</Text>
            <Text style={styles.tradeValue}>{trade.amount}</Text>
          </View>
          <View style={styles.tradeItem}>
            <Text style={styles.tradeLabel}>手续费</Text>
            <Text style={styles.tradeValue}>{trade.fee} U</Text>
          </View>
          <View style={styles.tradeItem}>
            <Text style={styles.tradeLabel}>盈亏</Text>
            <Text style={[styles.tradeValue, { color: pnlColor }]}>
              {isProfit ? '+' : ''}{trade.pnl.toFixed(2)} U
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Screen>
      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00F0FF" />}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#00F0FF" />
          </TouchableOpacity>
          <Text style={styles.title}>我的实盘交易</Text>
          <TouchableOpacity>
            <Ionicons name="settings-outline" size={24} color="#8B8B9E" />
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          {([
            { key: 'overview', label: '总览' },
            { key: 'positions', label: '持仓' },
            { key: 'orders', label: '订单' },
            { key: 'history', label: '历史' },
          ] as const).map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.activeTab]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
                {tab.label}
                {tab.key === 'positions' && positions.length > 0 && `(${positions.length})`}
                {tab.key === 'orders' && orders.length > 0 && `(${orders.length})`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Content */}
        {activeTab === 'overview' && renderOverview()}

        {activeTab === 'positions' && (
          <View style={styles.content}>
            {positions.length > 0 ? (
              positions.map(renderPosition)
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="bar-chart-outline" size={48} color="#8B8B9E" style={styles.emptyIcon} />
                <Text style={styles.emptyText}>暂无持仓</Text>
                <Text style={styles.emptySubtext}>开始交易以积累你的实盘记录</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'orders' && (
          <View style={styles.content}>
            {orders.length > 0 ? (
              orders.map(renderOrder)
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="document-text-outline" size={48} color="#8B8B9E" style={styles.emptyIcon} />
                <Text style={styles.emptyText}>暂无订单</Text>
                <Text style={styles.emptySubtext}>下单后将显示在这里</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'history' && (
          <View style={styles.content}>
            {trades.length > 0 ? (
              trades.map(renderTrade)
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="time-outline" size={48} color="#8B8B9E" style={styles.emptyIcon} />
                <Text style={styles.emptyText}>暂无交易记录</Text>
              </View>
            )}
          </View>
        )}
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
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#12121A',
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: '#00F0FF',
  },
  tabText: {
    color: '#8B8B9E',
    fontSize: 14,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#0A0A0F',
    fontWeight: '600',
  },
  overviewContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  profitCard: {
    backgroundColor: '#12121A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1E1E2E',
  },
  profitHeader: {
    marginBottom: 16,
  },
  profitLabel: {
    color: '#8B8B9E',
    fontSize: 12,
    marginBottom: 4,
  },
  profitValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  profitStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  profitStat: {
    flex: 1,
  },
  profitStatLabel: {
    color: '#8B8B9E',
    fontSize: 11,
    marginBottom: 2,
  },
  profitStatValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  metricsCard: {
    backgroundColor: '#12121A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1E1E2E',
  },
  metricsTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  metricItem: {
    width: '50%',
    paddingVertical: 8,
  },
  metricValue: {
    color: '#00F0FF',
    fontSize: 18,
    fontWeight: '700',
  },
  metricLabel: {
    color: '#8B8B9E',
    fontSize: 12,
    marginTop: 2,
  },
  avgCard: {
    backgroundColor: '#12121A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#1E1E2E',
  },
  avgItem: {
    flex: 1,
    alignItems: 'center',
  },
  avgDivider: {
    width: 1,
    backgroundColor: '#1E1E2E',
    marginHorizontal: 8,
  },
  avgLabel: {
    color: '#8B8B9E',
    fontSize: 11,
    marginBottom: 4,
  },
  avgValue: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  quickActionBtn: {
    flex: 1,
    backgroundColor: '#12121A',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#1E1E2E',
  },
  quickActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginTop: 4,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  positionCard: {
    backgroundColor: '#12121A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1E1E2E',
  },
  positionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  positionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  positionRight: {
    alignItems: 'flex-end',
  },
  sideBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  sideText: {
    color: '#0A0A0F',
    fontSize: 12,
    fontWeight: '700',
  },
  symbolText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  nameText: {
    color: '#8B8B9E',
    fontSize: 12,
  },
  leverageTag: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  leverageText: {
    color: '#0A0A0F',
    fontSize: 11,
    fontWeight: '700',
  },
  amountText: {
    color: '#8B8B9E',
    fontSize: 12,
    marginTop: 4,
  },
  positionPrices: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceItem: {
    flex: 1,
  },
  priceLabel: {
    color: '#8B8B9E',
    fontSize: 11,
    marginBottom: 2,
  },
  priceValue: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500',
  },
  positionLevels: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 20,
    marginBottom: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#1E1E2E',
  },
  levelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  levelLabel: {
    color: '#8B8B9E',
    fontSize: 11,
  },
  levelValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  positionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  pnlContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  pnlValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  pnlPercent: {
    fontSize: 14,
  },
  marginText: {
    color: '#8B8B9E',
    fontSize: 12,
  },
  positionActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  tpBtn: {
    backgroundColor: '#00FF8820',
    borderWidth: 1,
    borderColor: '#00FF88',
  },
  tpBtnText: {
    color: '#00FF88',
    fontSize: 12,
    fontWeight: '600',
  },
  slBtn: {
    backgroundColor: '#FF336620',
    borderWidth: 1,
    borderColor: '#FF3366',
  },
  slBtnText: {
    color: '#FF3366',
    fontSize: 12,
    fontWeight: '600',
  },
  closeBtn: {
    backgroundColor: '#00F0FF',
  },
  closeBtnText: {
    color: '#0A0A0F',
    fontSize: 12,
    fontWeight: '600',
  },
  orderCard: {
    backgroundColor: '#12121A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1E1E2E',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  orderSymbol: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  orderType: {
    color: '#8B8B9E',
    fontSize: 11,
    marginTop: 2,
  },
  orderStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  orderStatusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  orderItem: {
    flex: 1,
  },
  orderLabel: {
    color: '#8B8B9E',
    fontSize: 10,
    marginBottom: 2,
  },
  orderValue: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  orderTime: {
    color: '#8B8B9E',
    fontSize: 11,
  },
  orderActions: {
    flexDirection: 'row',
    gap: 8,
  },
  orderBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: '#FF336620',
    borderWidth: 1,
    borderColor: '#FF3366',
  },
  cancelBtnText: {
    color: '#FF3366',
    fontSize: 12,
    fontWeight: '600',
  },
  modifyBtn: {
    backgroundColor: '#12121A',
    borderWidth: 1,
    borderColor: '#00F0FF',
  },
  modifyBtnText: {
    color: '#00F0FF',
    fontSize: 12,
    fontWeight: '600',
  },
  tradeCard: {
    backgroundColor: '#12121A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1E1E2E',
  },
  tradeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tradeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tradeSymbol: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  tradeRight: {
    alignItems: 'flex-end',
  },
  tradeTime: {
    color: '#8B8B9E',
    fontSize: 11,
    marginBottom: 4,
  },
  closeReasonTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  closeReasonText: {
    fontSize: 10,
    fontWeight: '600',
  },
  tradeDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tradeItem: {
    flex: 1,
  },
  tradeLabel: {
    color: '#8B8B9E',
    fontSize: 10,
    marginBottom: 2,
  },
  tradeValue: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#8B8B9E',
    fontSize: 14,
  },
});
