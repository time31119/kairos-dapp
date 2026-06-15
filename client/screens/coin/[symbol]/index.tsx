import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, TextInput } from 'react-native';
import { Screen } from '@/components/Screen';
import { useSafeRouter, useSafeSearchParams } from '@/hooks/useSafeRouter';
import { Ionicons } from '@expo/vector-icons';
import { useWeb3 } from '@/contexts/Web3Context';
import SwapModal from '@/components/payment/SwapModal';

// 暗黑科技风配色
const colors = {
  background: '#0A0A0F',
  card: '#12121A',
  cardBorder: '#1F1F2E',
  neonCyan: '#00F0FF',
  neonPurple: '#BF00FF',
  text: '#FFFFFF',
  textSecondary: '#8E8E9A',
  success: '#00FF88',
  error: '#FF4444',
  warning: '#FFB800',
};

const { width } = Dimensions.get('window');

// 模拟代币数据
const MOCK_TOKEN_INFO: Record<string, any> = {
  eth: { name: 'Ethereum', symbol: 'ETH', price: 3456.78, change: 2.34, marketCap: 415000000000, volume: 15000000000, supply: '120M' },
  btc: { name: 'Bitcoin', symbol: 'BTC', price: 67890.12, change: -1.23, marketCap: 1320000000000, volume: 28000000000, supply: '19.5M' },
  uni: { name: 'Uniswap', symbol: 'UNI', price: 12.45, change: 5.67, marketCap: 7456000000, volume: 234000000, supply: '600M' },
  link: { name: 'Chainlink', symbol: 'LINK', price: 18.92, change: 3.45, marketCap: 8900000000, volume: 567000000, supply: '470M' },
};

// 价格图表数据
const generateChartData = (basePrice: number) => {
  const data = [];
  let price = basePrice * 0.95;
  for (let i = 0; i < 30; i++) {
    price = price * (1 + (Math.random() - 0.48) * 0.02);
    data.push({ price, volume: Math.random() * 1000000 });
  }
  return data;
};

export default function CoinDetail() {
  const router = useSafeRouter();
  const params = useSafeSearchParams<{ symbol?: string }>();
  const { wallet } = useWeb3();

  const symbol = params.symbol?.toLowerCase() || 'eth';
  const tokenInfo = MOCK_TOKEN_INFO[symbol] || MOCK_TOKEN_INFO.eth;
  const chartData = generateChartData(tokenInfo.price);

  const [chartType, setChartType] = useState<'24h' | '7d' | '30d'>('24h');
  const [showTrade, setShowTrade] = useState(false);
  const [swapModalVisible, setSwapModalVisible] = useState(false);
  const [swapAmount, setSwapAmount] = useState('');

  const formatNumber = (num: number) => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    return `$${num.toLocaleString()}`;
  };

  // 计算图表高度
  const maxPrice = Math.max(...chartData.map(d => d.price));
  const minPrice = Math.min(...chartData.map(d => d.price));
  const priceRange = maxPrice - minPrice;

  return (
    <Screen>
      <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{tokenInfo.name}</Text>
          <Text style={styles.headerSubtitle}>{tokenInfo.symbol}</Text>
        </View>
        <TouchableOpacity style={styles.starButton}>
          <Ionicons name={wallet.isConnected ? "star" : "star-outline"} size={24} color={wallet.isConnected ? colors.warning : colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Price Section */}
        <View style={styles.priceSection}>
          <Text style={styles.price}>${tokenInfo.price.toLocaleString()}</Text>
          <Text style={[styles.change, { color: tokenInfo.change >= 0 ? colors.success : colors.error }]}>
            {tokenInfo.change >= 0 ? '+' : ''}{tokenInfo.change.toFixed(2)}%
          </Text>
        </View>

        {/* Chart */}
        <View style={styles.chartContainer}>
          <View style={styles.chartHeader}>
            {(['24h', '7d', '30d'] as const).map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.chartTab, chartType === type && styles.chartTabActive]}
                onPress={() => setChartType(type)}
              >
                <Text style={[styles.chartTabText, chartType === type && styles.chartTabTextActive]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Simple Line Chart */}
          <View style={styles.chart}>
            {chartData.map((point, index) => (
              <View
                key={index}
                style={[
                  styles.chartBar,
                  {
                    height: `${((point.price - minPrice) / priceRange) * 80 + 10}%`,
                    backgroundColor: tokenInfo.change >= 0 ? colors.success + '60' : colors.error + '60',
                  }
                ]}
              />
            ))}
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>市值</Text>
            <Text style={styles.statValue}>{formatNumber(tokenInfo.marketCap)}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>24h交易量</Text>
            <Text style={styles.statValue}>{formatNumber(tokenInfo.volume)}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>流通量</Text>
            <Text style={styles.statValue}>{tokenInfo.supply}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>占总量比例</Text>
            <Text style={styles.statValue}>100%</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.neonCyan + '20', borderColor: colors.neonCyan }]}
            onPress={() => setShowTrade(!showTrade)}
          >
            <Ionicons name="swap-horizontal" size={20} color={colors.neonCyan} />
            <Text style={[styles.actionButtonText, { color: colors.neonCyan }]}>交易</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
          >
            <Ionicons name="heart-outline" size={20} color={colors.text} />
            <Text style={styles.actionButtonText}>收藏</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
          >
            <Ionicons name="share-social-outline" size={20} color={colors.text} />
            <Text style={styles.actionButtonText}>分享</Text>
          </TouchableOpacity>
        </View>

        {/* Trade Panel */}
        {showTrade && (
          <View style={styles.tradePanel}>
            <View style={styles.tradeHeader}>
              <Text style={styles.tradeTitle}>交易</Text>
              {!wallet.isConnected && (
                <TouchableOpacity onPress={() => router.push('/auth')}>
                  <Text style={styles.connectText}>连接钱包</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.tradeInputs}>
              <View style={styles.tradeInputGroup}>
                <Text style={styles.tradeLabel}>支付</Text>
                <TextInput
                  style={styles.tradeTextInput}
                  placeholder="0.00"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="decimal-pad"
                  value={swapAmount}
                  onChangeText={setSwapAmount}
                />
                <Text style={styles.tradeInputSymbol}>USDT</Text>
              </View>

              <View style={styles.tradeArrow}>
                <Ionicons name="arrow-down" size={20} color={colors.neonCyan} />
              </View>

              <View style={styles.tradeInputGroup}>
                <Text style={styles.tradeLabel}>获得</Text>
                <View style={styles.tradeInput}>
                  <Text style={styles.tradeInputValue}>{swapAmount || '0.00'}</Text>
                  <Text style={styles.tradeInputSymbol}>{tokenInfo.symbol}</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.tradeButton, !swapAmount && styles.tradeButtonDisabled]}
              disabled={!swapAmount}
              onPress={() => {
                setSwapModalVisible(true);
              }}
            >
              <Text style={styles.tradeButtonText}>
                {swapAmount ? '兑换' : '请输入数量'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Info Cards */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>基本信息</Text>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>官方网站</Text>
              <TouchableOpacity>
                <Text style={styles.infoLink}>https://{tokenInfo.symbol.toLowerCase()}.org</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>白皮书</Text>
              <TouchableOpacity>
                <Text style={styles.infoLink}>查看白皮书</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>合约地址</Text>
              <View style={styles.contractAddress}>
                <Text style={styles.contractText} numberOfLines={1}>
                  0x1234...5678
                </Text>
                <TouchableOpacity>
                  <Ionicons name="copy-outline" size={16} color={colors.neonCyan} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* About */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>关于 {tokenInfo.name}</Text>
          <View style={styles.aboutCard}>
            <Text style={styles.aboutText}>
              {tokenInfo.name}（{tokenInfo.symbol}）是区块链生态系统中重要的加密货币之一。
              它具有良好的流动性和广泛的应用场景，是数字资产投资组合中不可或缺的组成部分。
            </Text>
          </View>
        </View>

        {/* Bottom padding */}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Swap Modal */}
      <SwapModal
        visible={swapModalVisible}
        onClose={() => setSwapModalVisible(false)}
        initialFromToken={{ symbol: 'USDT', name: 'Tether USD', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', logo: 'https://assets.coingecko.com/coins/images/12559/small/usdt.png' }}
        initialToToken={{ symbol: tokenInfo.symbol, name: tokenInfo.name, address: '', logo: '' }}
        initialAmount={swapAmount}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitleContainer: { alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: colors.text },
  headerSubtitle: { fontSize: 13, color: colors.textSecondary },
  starButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1, paddingHorizontal: 16 },
  priceSection: { alignItems: 'center', marginBottom: 20 },
  price: { fontSize: 36, fontWeight: 'bold', color: colors.text },
  change: { fontSize: 18, fontWeight: '600', marginTop: 4 },
  chartContainer: {
    backgroundColor: colors.card, borderRadius: 20, padding: 16,
    marginBottom: 20, borderWidth: 1, borderColor: colors.cardBorder,
  },
  chartHeader: { flexDirection: 'row', marginBottom: 16 },
  chartTab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, marginRight: 8 },
  chartTabActive: { backgroundColor: colors.neonCyan + '20' },
  chartTabText: { fontSize: 14, color: colors.textSecondary },
  chartTabTextActive: { color: colors.neonCyan, fontWeight: '600' },
  chart: {
    height: 120, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  chartBar: { flex: 1, marginHorizontal: 1, borderRadius: 2 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  statCard: {
    flex: 1, minWidth: '45%', backgroundColor: colors.card, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: colors.cardBorder,
  },
  statLabel: { fontSize: 13, color: colors.textSecondary },
  statValue: { fontSize: 16, fontWeight: '600', color: colors.text, marginTop: 4 },
  actions: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  actionButton: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 14, borderRadius: 12, borderWidth: 1,
  },
  actionButtonText: { fontSize: 14, fontWeight: '500', color: colors.text },
  tradePanel: {
    backgroundColor: colors.card, borderRadius: 20, padding: 20,
    marginBottom: 20, borderWidth: 1, borderColor: colors.cardBorder,
  },
  tradeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  tradeTitle: { fontSize: 18, fontWeight: '600', color: colors.text },
  connectText: { fontSize: 14, color: colors.neonCyan },
  tradeInputs: { marginBottom: 16 },
  tradeInputGroup: { marginBottom: 12 },
  tradeLabel: { fontSize: 13, color: colors.textSecondary, marginBottom: 8 },
  tradeTextInput: {
    backgroundColor: colors.background, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.cardBorder,
    fontSize: 18, color: colors.text,
  },
  tradeInput: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: colors.background, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.cardBorder,
  },
  tradeInputValue: { fontSize: 18, color: colors.text },
  tradeInputSymbol: { fontSize: 16, color: colors.neonCyan },
  tradeArrow: { alignItems: 'center', marginVertical: -8 },
  tradeButton: {
    backgroundColor: colors.neonCyan, borderRadius: 12, padding: 16, alignItems: 'center',
  },
  tradeButtonDisabled: { backgroundColor: colors.cardBorder },
  tradeButtonText: { fontSize: 16, fontWeight: '600', color: colors.background },
  infoSection: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 12 },
  infoCard: {
    backgroundColor: colors.card, borderRadius: 16, overflow: 'hidden',
    borderWidth: 1, borderColor: colors.cardBorder,
  },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, borderBottomWidth: 1, borderBottomColor: colors.cardBorder,
  },
  infoLabel: { fontSize: 14, color: colors.textSecondary },
  infoLink: { fontSize: 14, color: colors.neonCyan },
  contractAddress: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  contractText: { fontSize: 13, color: colors.text, maxWidth: 120 },
  aboutCard: {
    backgroundColor: colors.card, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: colors.cardBorder,
  },
  aboutText: { fontSize: 14, color: colors.textSecondary, lineHeight: 22 },
});
