import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Screen } from '@/components/Screen';
import { useSafeRouter, useSafeSearchParams } from '@/hooks/useSafeRouter';
import { Ionicons } from '@expo/vector-icons';
import { useWeb3 } from '@/contexts/Web3Context';
import { apiRequest } from '@/utils/api';

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
  warning: '#FFB800',
  error: '#FF4444',
};

// 预设的行情筛选场景
const SCENARIOS = {
  'defi': { name: 'DeFi 潜力币', icon: 'leaf', color: '#00FF88' },
  'meme': { name: 'Meme 币', icon: 'chatbubble', color: '#FFD700' },
  'ai': { name: 'AI 赛道', icon: 'hardware-chip', color: '#00F0FF' },
  'gaming': { name: 'GameFi', icon: 'game-controller', color: '#BF00FF' },
  'infrastructure': { name: '基础设施', icon: 'server', color: '#4A90D9' },
  'layer2': { name: 'Layer2', icon: 'layers', color: '#F472B6' },
};

// 默认代币数据（备用）
const MOCK_TOKENS = [
  { symbol: 'UNI', name: 'Uniswap', price: 12.45, change: 5.2, volume: 234567890, marketCap: 7456789000 },
  { symbol: 'AAVE', name: 'Aave', price: 156.78, change: -2.3, volume: 123456789, marketCap: 2345678000 },
  { symbol: 'CRV', name: 'Curve', price: 0.89, change: 8.7, volume: 98765432, marketCap: 890123000 },
  { symbol: 'MKR', name: 'Maker', price: 1456.32, change: 1.8, volume: 45678901, marketCap: 1345672000 },
  { symbol: 'SNX', name: 'Synthetix', price: 3.45, change: -1.2, volume: 34567890, marketCap: 1234567000 },
  { symbol: 'COMP', name: 'Compound', price: 89.12, change: 3.4, volume: 56789012, marketCap: 7890123000 },
  { symbol: 'SUSHI', name: 'SushiSwap', price: 1.23, change: -4.5, volume: 23456789, marketCap: 345678000 },
  { symbol: 'BAL', name: 'Balancer', price: 4.56, change: 6.7, volume: 12345678, marketCap: 567890000 },
];

export default function ScreenerScenario() {
  const { scenario } = useSafeSearchParams<{ scenario: string }>();
  const router = useSafeRouter();
  const { wallet } = useWeb3();
  
  const scenarioKey = (scenario as string || 'defi') as keyof typeof SCENARIOS;
  const scenarioInfo = SCENARIOS[scenarioKey] || SCENARIOS.defi;
  
  const [tokens, setTokens] = useState(MOCK_TOKENS);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'price' | 'change' | 'volume' | 'marketCap'>('volume');
  const [filter, setFilter] = useState<'all' | 'gainers' | 'losers'>('all');

  // 从 API 获取代币数据
  useEffect(() => {
    const fetchTokens = async () => {
      setLoading(true);
      try {
        const result = await apiRequest<{ tokens?: any[]; data?: any }>(`/screener/${scenarioKey}`);
        if (result.success && result.data) {
          const tokenData = result.data.tokens || (result.data.data?.tokens) || [];
          if (tokenData.length > 0) {
            setTokens(tokenData);
          }
        }
      } catch (error) {
        console.log('Failed to fetch tokens, using mock data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTokens();
  }, [scenarioKey]);

  // 过滤和排序
  const filteredTokens = tokens
    .filter(t => {
      if (filter === 'gainers') return t.change > 0;
      if (filter === 'losers') return t.change < 0;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price': return b.price - a.price;
        case 'change': return b.change - a.change;
        case 'volume': return b.volume - a.volume;
        case 'marketCap': return b.marketCap - a.marketCap;
        default: return 0;
      }
    });

  const formatNumber = (num: number) => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  return (
    <Screen style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={[styles.scenarioBadge, { borderColor: scenarioInfo.color }]}>
          <Ionicons name={scenarioInfo.icon as any} size={20} color={scenarioInfo.color} />
          <Text style={[styles.scenarioName, { color: scenarioInfo.color }]}>{scenarioInfo.name}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {(['all', 'gainers', 'losers'] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterTab, filter === f && styles.filterTabActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === 'all' ? '全部' : f === 'gainers' ? '涨' : '跌'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Sort Options */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sortContainer}>
        {(['volume', 'price', 'change', 'marketCap'] as const).map((s) => (
          <TouchableOpacity
            key={s}
            style={[styles.sortChip, sortBy === s && styles.sortChipActive]}
            onPress={() => setSortBy(s)}
          >
            <Text style={[styles.sortText, sortBy === s && styles.sortTextActive]}>
              {s === 'volume' ? '成交量' : s === 'price' ? '价格' : s === 'change' ? '涨跌幅' : '市值'}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Token List */}
      <ScrollView style={styles.tokenList}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.neonCyan} />
            <Text style={styles.loadingText}>加载中...</Text>
          </View>
        ) : filteredTokens.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>暂无数据</Text>
          </View>
        ) : (
          filteredTokens.map((token, index) => (
            <TouchableOpacity
              key={token.symbol}
              style={styles.tokenCard}
              onPress={() => router.push(`/coin/[symbol]?symbol=${token.symbol.toLowerCase()}`)}
            >
              <View style={styles.tokenLeft}>
                <View style={[styles.tokenIcon, { backgroundColor: scenarioInfo.color + '20' }]}>
                  <Text style={[styles.tokenSymbol, { color: scenarioInfo.color }]}>
                    {token.symbol.charAt(0)}
                  </Text>
                </View>
                <View>
                  <Text style={styles.tokenSymbol}>{token.symbol}</Text>
                  <Text style={styles.tokenName}>{token.name}</Text>
                </View>
              </View>
              
              <View style={styles.tokenRight}>
                <Text style={styles.tokenPrice}>${token.price.toFixed(token.price < 1 ? 4 : 2)}</Text>
                <Text style={[
                  styles.tokenChange,
                  { color: token.change >= 0 ? colors.success : colors.error }
                ]}>
                  {token.change >= 0 ? '+' : ''}{token.change.toFixed(2)}%
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Wallet Required Banner */}
      {!wallet.isConnected && (
        <View style={styles.walletBanner}>
          <Ionicons name="wallet-outline" size={24} color={colors.neonCyan} />
          <Text style={styles.walletBannerText}>连接钱包查看完整行情和交易功能</Text>
          <TouchableOpacity
            style={styles.walletBannerButton}
            onPress={() => router.push('/auth')}
          >
            <Text style={styles.walletBannerButtonText}>连接钱包</Text>
          </TouchableOpacity>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scenarioBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  scenarioName: {
    fontSize: 16,
    fontWeight: '600',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 12,
  },
  filterTab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.card,
  },
  filterTabActive: {
    backgroundColor: colors.neonCyan + '20',
    borderWidth: 1,
    borderColor: colors.neonCyan,
  },
  filterText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  filterTextActive: {
    color: colors.neonCyan,
  },
  sortContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
    maxHeight: 40,
  },
  sortChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.card,
    marginRight: 8,
  },
  sortChipActive: {
    backgroundColor: colors.neonPurple + '20',
    borderWidth: 1,
    borderColor: colors.neonPurple,
  },
  sortText: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  sortTextActive: {
    color: colors.neonPurple,
  },
  tokenList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  tokenCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  tokenLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tokenIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tokenSymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  tokenName: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  tokenRight: {
    alignItems: 'flex-end',
  },
  tokenPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  tokenChange: {
    fontSize: 13,
    fontWeight: '500',
  },
  walletBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    padding: 16,
    gap: 12,
  },
  walletBannerText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: 14,
  },
  walletBannerButton: {
    backgroundColor: colors.neonCyan,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  walletBannerButtonText: {
    color: colors.background,
    fontWeight: '600',
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
});
