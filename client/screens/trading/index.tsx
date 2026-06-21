import { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { Screen } from '@/components/Screen';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { Ionicons } from '@expo/vector-icons';
import { apiRequest } from '@/utils/api';

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
  type: 'limit' | 'market' | 'stop';
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

// 默认数据
const defaultAccountStats: AccountStats = {
  totalProfit: 4582.34,
  totalLoss: -1587.56,
  winRate: 68.5,
  maxDrawdown: -892.45,
  totalTrades: 156,
  profitableTrades: 107,
  avgProfit: 42.82,
  avgLoss: -14.83,
};

const defaultPositions: Position[] = [
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

const defaultOrders: Order[] = [
  { id: '1', symbol: 'BNB', side: 'long', type: 'limit', price: 320, amount: 5, filled: 0, status: 'pending', time: '2024-01-16 10:30' },
  { id: '2', symbol: 'AVAX', side: 'short', type: 'limit', price: 38.5, amount: 50, filled: 25, status: 'partial', time: '2024-01-16 09:15' },
  { id: '3', symbol: 'LINK', side: 'long', type: 'stop', price: 0, triggerPrice: 18.5, amount: 100, filled: 0, status: 'pending', time: '2024-01-16 08:00' },
];

const defaultTrades: Trade[] = [
  { id: '1', symbol: 'BTC', side: 'long', price: 66500, amount: 0.5, pnl: 793.45, fee: 33.25, closeReason: 'manual', time: '2024-01-15 14:30', status: 'completed' },
  { id: '2', symbol: 'ETH', side: 'long', price: 3450, amount: 2, pnl: 310, fee: 6.9, closeReason: 'manual', time: '2024-01-15 16:45', status: 'completed' },
  { id: '3', symbol: 'SOL', side: 'short', price: 112, amount: 100, pnl: 280, fee: 11.2, closeReason: 'tp', time: '2024-01-14 09:20', status: 'completed' },
  { id: '4', symbol: 'BNB', side: 'long', price: 312, amount: 5, pnl: -85, fee: 1.56, closeReason: 'sl', time: '2024-01-13 11:00', status: 'completed' },
  { id: '5', symbol: 'DOGE', side: 'short', price: 0.082, amount: 10000, pnl: 156.8, fee: 0.82, closeReason: 'tp', time: '2024-01-12 15:30', status: 'completed' },
  { id: '6', symbol: 'ADA', side: 'long', price: 0.58, amount: 1000, pnl: -42.5, fee: 0.58, closeReason: 'manual', time: '2024-01-11 10:15', status: 'completed' },
];

export default function TradingScreen() {
  const router = useSafeRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'positions' | 'orders' | 'history'>('overview');

  // 数据状态
  const [accountStats, setAccountStats] = useState<AccountStats>(defaultAccountStats);
  const [positions, setPositions] = useState<Position[]>(defaultPositions);
  const [orders, setOrders] = useState<Order[]>(defaultOrders);
  const [trades, setTrades] = useState<Trade[]>(defaultTrades);

  // 获取账户统计
  const fetchAccountStats = async () => {
    const result = await apiRequest<AccountStats>('/trading/stats');
    if (result.success && result.data) {
      setAccountStats(result.data);
    }
  };

  // 获取持仓
  // 获取持仓 - 对接真实币安API数据
  const fetchPositions = async () => {
    // 如果有TP钱包地址，从币安API获取真实持仓
    const walletAddress = (globalThis as any).walletAddress;
    if (walletAddress) {
      const result = await apiRequest<{ 
        positions?: Position[]; 
        has_api?: boolean;
      }>('/positions/my', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet_address: walletAddress }),
      });
      
      if (result.success && result.data) {
        if (result.data.positions) {
          setPositions(result.data.positions);
        } else if (Array.isArray(result.data)) {
          setPositions(result.data as Position[]);
        }
      }
    } else {
      // 无钱包地址，显示默认数据提示用户绑定
      const result = await apiRequest<{ positions?: Position[] }>('/trading/positions');
      if (result.success && result.data) {
        if (result.data.positions) {
          setPositions(result.data.positions);
        } else if (Array.isArray(result.data)) {
          setPositions(result.data as Position[]);
        }
      }
    }
  };

  // 获取订单
  const fetchOrders = async () => {
    const result = await apiRequest<{ orders?: Order[] }>('/trading/orders');
    if (result.success && result.data) {
      if (result.data.orders) {
        setOrders(result.data.orders);
      } else if (Array.isArray(result.data)) {
        setOrders(result.data as Order[]);
      }
    }
  };

  // 获取历史交易
  const fetchTrades = async () => {
    const result = await apiRequest<{ history?: Trade[] }>('/trading/history');
    if (result.success && result.data) {
      if (result.data.history) {
        setTrades(result.data.history);
      } else if (Array.isArray(result.data)) {
        setTrades(result.data as Trade[]);
      }
    }
  };

  // 交易操作弹窗状态
  const [tradeModalVisible, setTradeModalVisible] = useState(false);
  const [tradeAction, setTradeAction] = useState<'open' | 'close' | null>(null);
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT');
  const [amount, setAmount] = useState('');
  const [leverage, setLeverage] = useState(10);
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [positionType, setPositionType] = useState<'long' | 'short'>('long');
  const [limitPrice, setLimitPrice] = useState('');

  // 交易操作处理函数
  const handleOpenPosition = (symbol: string) => {
    setSelectedSymbol(symbol);
    setTradeAction('open');
    setTradeModalVisible(true);
  };

  const handleClosePosition = (symbol: string) => {
    setSelectedSymbol(symbol);
    setTradeAction('close');
    setTradeModalVisible(true);
  };

  const handleAnalyze = () => {
    router.push('/analysis');
  };

  const confirmTrade = async () => {
    const walletAddress = (globalThis as any).walletAddress;
    if (!walletAddress) {
      Alert.alert('提示', '请先连接钱包');
      return;
    }
    
    try {
      const payload: any = {
        symbol: selectedSymbol,
        type: tradeAction === 'open' ? (positionType === 'long' ? 'open_long' : 'open_short') : (positionType === 'long' ? 'close_long' : 'close_short'),
        amount: parseFloat(amount),
        leverage,
        wallet_address: walletAddress,
      };
      
      if (orderType === 'limit' && limitPrice) {
        payload.price = parseFloat(limitPrice);
      }
      
      const result = await apiRequest<{ success: boolean; message?: string }>(
        '/trading/order',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
      
      if (result.success) {
        Alert.alert('成功', tradeAction === 'open' ? '开仓成功' : '平仓成功');
        setTradeModalVisible(false);
        loadData();
      } else {
        Alert.alert('失败', (result as any)?.message || result?.data?.message || '交易失败');
      }
    } catch (error) {
      Alert.alert('错误', '交易请求失败');
    }
  };

  // 加载所有数据
  const loadData = async () => {
    setLoading(true);
    await Promise.all([
      fetchAccountStats(),
      fetchPositions(),
      fetchOrders(),
      fetchTrades(),
    ]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalPnl = positions.reduce((sum, p) => sum + p.pnl, 0);
  const totalMargin = positions.reduce((sum, p) => sum + p.margin, 0);
  const netProfit = accountStats.totalProfit + accountStats.totalLoss;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
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
        <TouchableOpacity style={styles.quickActionBtn} onPress={() => handleOpenPosition('BTC')}>
          <Ionicons name="add-circle-outline" size={24} color="#00F0FF" />
          <Text style={styles.quickActionText}>开仓</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickActionBtn} onPress={() => handleClosePosition('BTC')}>
          <Ionicons name="swap-horizontal-outline" size={24} color="#00F0FF" />
          <Text style={styles.quickActionText}>平多</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickActionBtn} onPress={() => handleClosePosition('BTC')}>
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
          <TouchableOpacity style={[styles.actionBtn, styles.tpBtn]} onPress={() => handleOpenPosition(position.symbol)}>
            <Text style={styles.tpBtnText}>+止盈</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.slBtn]} onPress={() => handleOpenPosition(position.symbol)}>
            <Text style={styles.slBtnText}>+止损</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.closeBtn]} onPress={() => handleClosePosition(position.symbol)}>
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
            <Text style={styles.tradeLabel}>入场价</Text>
            <Text style={styles.tradeValue}>${trade.price.toLocaleString()}</Text>
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
            <Text style={[styles.tradePnl, { color: pnlColor }]}>
              {isProfit ? '+' : ''}{trade.pnl.toFixed(2)} U
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Screen>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>我的跟单</Text>
          <View style={styles.headerPlaceholder} />
        </View>
        <View style={styles.headerTabs}>
          {[
            { key: 'overview', label: '账户' },
            { key: 'positions', label: '持仓' },
            { key: 'orders', label: '订单' },
            { key: 'history', label: '历史' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.headerTab, activeTab === tab.key && styles.headerTabActive]}
              onPress={() => setActiveTab(tab.key as any)}
            >
              <Text style={[styles.headerTabText, activeTab === tab.key && styles.headerTabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Loading */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00F0FF" />
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00F0FF" />
          }
        >
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'positions' && (
            <View style={styles.listContainer}>
              {positions.length > 0 ? (
                positions.map(renderPosition)
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="cube-outline" size={48} color="#333" />
                  <Text style={styles.emptyText}>暂无持仓</Text>
                </View>
              )}
            </View>
          )}
          {activeTab === 'orders' && (
            <View style={styles.listContainer}>
              {orders.length > 0 ? (
                orders.map(renderOrder)
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="document-text-outline" size={48} color="#333" />
                  <Text style={styles.emptyText}>暂无订单</Text>
                </View>
              )}
            </View>
          )}
          {activeTab === 'history' && (
            <View style={styles.listContainer}>
              {trades.length > 0 ? (
                trades.map(renderTrade)
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="time-outline" size={48} color="#333" />
                  <Text style={styles.emptyText}>暂无历史记录</Text>
                </View>
              )}
            </View>
          )}
          <View style={{ height: 100 }} />
        </ScrollView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: 'rgba(10, 10, 15, 0.95)',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 240, 255, 0.2)',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerPlaceholder: {
    width: 40,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    flex: 1,
    textAlign: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTabs: {
    flexDirection: 'row',
  },
  headerTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  headerTabActive: {
    borderBottomColor: '#00F0FF',
  },
  headerTabText: {
    color: '#666',
    fontSize: 14,
  },
  headerTabTextActive: {
    color: '#00F0FF',
    fontWeight: '600',
  },
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0A0F',
  },
  loadingText: {
    color: '#666',
    marginTop: 12,
  },
  listContainer: {
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: '#666',
    fontSize: 14,
    marginTop: 12,
  },
  overviewContainer: {
    padding: 16,
  },
  profitCard: {
    backgroundColor: 'rgba(10, 10, 15, 0.95)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.3)',
    padding: 20,
    marginBottom: 16,
  },
  profitHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profitLabel: {
    color: '#666',
    fontSize: 12,
    marginBottom: 4,
  },
  profitValue: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  profitStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  profitStat: {
    alignItems: 'center',
  },
  profitStatLabel: {
    color: '#666',
    fontSize: 11,
    marginBottom: 4,
  },
  profitStatValue: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  metricsCard: {
    backgroundColor: 'rgba(10, 10, 15, 0.95)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.3)',
    padding: 20,
    marginBottom: 16,
  },
  metricsTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  metricItem: {
    width: '50%',
    alignItems: 'center',
    paddingVertical: 8,
  },
  metricValue: {
    color: '#00F0FF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  metricLabel: {
    color: '#666',
    fontSize: 11,
    marginTop: 4,
  },
  avgCard: {
    backgroundColor: 'rgba(10, 10, 15, 0.95)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.3)',
    padding: 16,
    flexDirection: 'row',
    marginBottom: 16,
  },
  avgItem: {
    flex: 1,
    alignItems: 'center',
  },
  avgLabel: {
    color: '#666',
    fontSize: 11,
    marginBottom: 4,
  },
  avgValue: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  avgDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 8,
  },
  quickActions: {
    flexDirection: 'row',
    backgroundColor: 'rgba(10, 10, 15, 0.95)',
    borderRadius: 16,
    padding: 16,
  },
  quickActionBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  quickActionText: {
    color: '#FFF',
    fontSize: 12,
    marginTop: 6,
  },
  positionCard: {
    backgroundColor: 'rgba(10, 10, 15, 0.95)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.3)',
    padding: 16,
    marginBottom: 12,
  },
  positionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  positionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sideBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  sideText: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  symbolText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  nameText: {
    color: '#666',
    fontSize: 12,
  },
  positionRight: {
    alignItems: 'flex-end',
  },
  leverageTag: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  leverageText: {
    color: '#FFD700',
    fontSize: 11,
    fontWeight: 'bold',
  },
  amountText: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
  },
  positionPrices: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  priceItem: {
    alignItems: 'center',
  },
  priceLabel: {
    color: '#666',
    fontSize: 11,
    marginBottom: 4,
  },
  priceValue: {
    color: '#FFF',
    fontSize: 13,
  },
  positionLevels: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 24,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  levelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  levelLabel: {
    color: '#666',
    fontSize: 12,
  },
  levelValue: {
    fontSize: 13,
    fontWeight: '500',
  },
  positionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  pnlContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  pnlValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  pnlPercent: {
    fontSize: 14,
  },
  marginText: {
    color: '#666',
    fontSize: 12,
  },
  positionActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  actionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  tpBtn: {
    backgroundColor: 'rgba(0, 255, 136, 0.2)',
  },
  tpBtnText: {
    color: '#00FF88',
    fontSize: 12,
  },
  slBtn: {
    backgroundColor: 'rgba(255, 51, 102, 0.2)',
  },
  slBtnText: {
    color: '#FF3366',
    fontSize: 12,
  },
  closeBtn: {
    backgroundColor: 'rgba(0, 240, 255, 0.2)',
  },
  closeBtnText: {
    color: '#00F0FF',
    fontSize: 12,
  },
  orderCard: {
    backgroundColor: 'rgba(10, 10, 15, 0.95)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    padding: 16,
    marginBottom: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  orderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderSymbol: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  orderType: {
    color: '#666',
    fontSize: 12,
    marginTop: 2,
  },
  orderStatus: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  orderStatusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  orderItem: {
    alignItems: 'center',
  },
  orderLabel: {
    color: '#666',
    fontSize: 11,
    marginBottom: 4,
  },
  orderValue: {
    color: '#FFF',
    fontSize: 13,
  },
  orderTime: {
    color: '#666',
    fontSize: 12,
  },
  orderActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  orderBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  cancelBtn: {
    backgroundColor: 'rgba(255, 51, 102, 0.2)',
  },
  cancelBtnText: {
    color: '#FF3366',
    fontSize: 12,
  },
  modifyBtn: {
    backgroundColor: 'rgba(0, 240, 255, 0.2)',
  },
  modifyBtnText: {
    color: '#00F0FF',
    fontSize: 12,
  },
  tradeCard: {
    backgroundColor: 'rgba(10, 10, 15, 0.95)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.3)',
    padding: 16,
    marginBottom: 12,
  },
  tradeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  tradeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tradeSymbol: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  tradeRight: {
    alignItems: 'flex-end',
  },
  tradeTime: {
    color: '#666',
    fontSize: 12,
    marginBottom: 4,
  },
  closeReasonTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  closeReasonText: {
    fontSize: 11,
    fontWeight: '500',
  },
  tradeDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  tradeItem: {
    alignItems: 'center',
  },
  tradeLabel: {
    color: '#666',
    fontSize: 11,
    marginBottom: 4,
  },
  tradeValue: {
    color: '#FFF',
    fontSize: 13,
  },
  tradePnl: {
    fontSize: 15,
    fontWeight: 'bold',
  },
});
