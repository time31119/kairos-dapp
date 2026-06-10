import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { Screen } from '@/components/Screen';
import { useRouter } from 'expo-router';
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
  openTime: string;
}

interface Trade {
  id: string;
  symbol: string;
  side: 'long' | 'short';
  price: number;
  amount: number;
  pnl: number;
  fee: number;
  time: string;
  status: 'completed' | 'partial';
}

export default function TradingScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'positions' | 'orders' | 'history'>('positions');

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

  const trades: Trade[] = [
    { id: '1', symbol: 'BTC', side: 'long', price: 66500, amount: 0.5, pnl: 793.45, fee: 33.25, time: '2024-01-15 14:30', status: 'completed' },
    { id: '2', symbol: 'ETH', side: 'long', price: 3450, amount: 2, pnl: 310, fee: 6.9, time: '2024-01-15 16:45', status: 'completed' },
    { id: '3', symbol: 'SOL', side: 'short', price: 112, amount: 100, pnl: 280, fee: 11.2, time: '2024-01-14 09:20', status: 'completed' },
    { id: '4', symbol: 'BNB', side: 'long', price: 312, amount: 5, pnl: -85, fee: 1.56, time: '2024-01-13 11:00', status: 'completed' },
  ];

  const totalPnl = positions.reduce((sum, p) => sum + p.pnl, 0);
  const totalMargin = positions.reduce((sum, p) => sum + p.margin, 0);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const renderPosition = (position: Position) => {
    const isProfit = position.pnl >= 0;
    const pnlColor = isProfit ? '#00FF88' : '#FF3366';

    return (
      <TouchableOpacity
        key={position.id}
        style={styles.positionCard}
        onPress={() => router.push(`/coin/${position.symbol.toLowerCase()}`)}
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
          <View style={styles.leverageTag}>
            <Text style={styles.leverageText}>{position.leverage}x</Text>
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

        <View style={styles.positionFooter}>
          <View style={styles.pnlContainer}>
            <Text style={[styles.pnlValue, { color: pnlColor }]}>
              {isProfit ? '+' : ''}{position.pnl.toFixed(2)} U
            </Text>
            <Text style={[styles.pnlPercent, { color: pnlColor }]}>
              ({isProfit ? '+' : ''}{position.pnlPercent.toFixed(2)}%)
            </Text>
          </View>
          <View style={styles.positionActions}>
            <TouchableOpacity style={[styles.actionBtn, styles.closeBtn]}>
              <Text style={styles.closeBtnText}>平仓</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderTrade = (trade: Trade) => {
    const isProfit = trade.pnl >= 0;
    const pnlColor = isProfit ? '#00FF88' : '#FF3366';

    return (
      <TouchableOpacity
        key={trade.id}
        style={styles.tradeCard}
        onPress={() => router.push(`/coin/${trade.symbol.toLowerCase()}`)}
      >
        <View style={styles.tradeHeader}>
          <View style={styles.tradeInfo}>
            <View style={[styles.sideBadge, { backgroundColor: trade.side === 'long' ? '#00FF88' : '#FF3366' }]}>
              <Text style={styles.sideText}>{trade.side === 'long' ? '多' : '空'}</Text>
            </View>
            <Text style={styles.tradeSymbol}>{trade.symbol}/USDT</Text>
          </View>
          <Text style={styles.tradeTime}>{trade.time}</Text>
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
            <Text style={styles.backBtn}>← 返回</Text>
          </TouchableOpacity>
          <Text style={styles.title}>我的实盘交易</Text>
          <View style={{ width: 60 }} />
        </View>

        {/* Account Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>总收益</Text>
              <Text style={[styles.summaryValue, { color: totalPnl >= 0 ? '#00FF88' : '#FF3366' }]}>
                {totalPnl >= 0 ? '+' : ''}{totalPnl.toFixed(2)} U
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>保证金</Text>
              <Text style={styles.summaryValue}>{totalMargin.toLocaleString()} U</Text>
            </View>
          </View>
          <View style={styles.summaryStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{positions.length}</Text>
              <Text style={styles.statLabel}>持仓</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>3</Text>
              <Text style={styles.statLabel}>订单</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>4</Text>
              <Text style={styles.statLabel}>历史</Text>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          {(['positions', 'orders', 'history'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tab === 'positions' ? '持仓' : tab === 'orders' ? '订单' : '历史'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Content */}
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
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={48} color="#8B8B9E" style={styles.emptyIcon} />
              <Text style={styles.emptyText}>暂无订单</Text>
              <Text style={styles.emptySubtext}>下单后将显示在这里</Text>
            </View>
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
  backBtn: {
    color: '#00F0FF',
    fontSize: 16,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: '#12121A',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E1E2E',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabel: {
    color: '#8B8B9E',
    fontSize: 12,
    marginBottom: 4,
  },
  summaryValue: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#1E1E2E',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: '#00F0FF',
    fontSize: 18,
    fontWeight: '600',
  },
  statLabel: {
    color: '#8B8B9E',
    fontSize: 12,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#1E1E2E',
  },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 12,
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
    backgroundColor: '#1E1E2E',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  leverageText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '600',
  },
  positionPrices: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#1E1E2E',
    borderBottomWidth: 1,
    borderBottomColor: '#1E1E2E',
    marginBottom: 12,
  },
  priceItem: {
    alignItems: 'center',
  },
  priceLabel: {
    color: '#8B8B9E',
    fontSize: 11,
    marginBottom: 2,
  },
  priceValue: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  positionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pnlContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  pnlValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  pnlPercent: {
    fontSize: 14,
    fontWeight: '600',
  },
  positionActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  closeBtn: {
    backgroundColor: '#FF3366',
  },
  closeBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
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
    gap: 8,
  },
  tradeSymbol: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  tradeTime: {
    color: '#8B8B9E',
    fontSize: 12,
  },
  tradeDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tradeItem: {
    alignItems: 'center',
  },
  tradeLabel: {
    color: '#8B8B9E',
    fontSize: 11,
    marginBottom: 2,
  },
  tradeValue: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#8B8B9E',
    fontSize: 14,
  },
});
