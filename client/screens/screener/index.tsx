/**
 * 筛选结果页面 - 代币列表
 * KAIROS 行情筛选器
 */

import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Image, 
  Pressable, 
  ActivityIndicator,
  RefreshControl,
  Platform 
} from 'react-native';
import { Screen } from '@/components/Screen';
import { useSafeRouter, useSafeSearchParams } from '@/hooks/useSafeRouter';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Types
interface Indicators {
  rsi: number | null;
  adx: number | null;
  plusDI: number | null;
  minusDI: number | null;
  macd: {
    value: number;
    signal: number;
    histogram: number;
  } | null;
  ema20: number | null;
  ema50: number | null;
  ema200: number | null;
  mfi: number | null;
  obv: number;
  atr: number | null;
  volumeRatio: number;
  vwap: number | null;
}

interface ScreenedToken {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_24h: number;
  market_cap: number;
  volume_24h: number;
  indicators: Indicators;
  score: number;
  matchReasons: string[];
}

interface ApiResponse {
  success: boolean;
  scenario: string;
  title: {
    direction: string;
    timeframe: string;
    description: string;
  };
  description: string;
  count: number;
  data: ScreenedToken[];
  error?: string;
  message?: string;
}

const scenarioTitles: Record<string, { direction: string; timeframe: string; description: string }> = {
  '1h_up': { direction: 'up', timeframe: '1H', description: '1小时上涨动能' },
  '4h_up': { direction: 'up', timeframe: '4H', description: '4小时上涨动能' },
  '1h_down': { direction: 'down', timeframe: '1H', description: '1小时下跌动能' },
  '4h_down': { direction: 'down', timeframe: '4H', description: '4小时下跌动能' },
};

// Indicator Badge Component
function IndicatorBadge({ 
  label, 
  value, 
  unit = '',
  isPositive = false,
  isNegative = false 
}: { 
  label: string; 
  value: number | null; 
  unit?: string;
  isPositive?: boolean;
  isNegative?: boolean;
}) {
  if (value === null) return null;
  
  let textColor = '#FFFFFF';
  if (isPositive) textColor = '#00F0FF';
  if (isNegative) textColor = '#BF00FF';
  
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeLabel}>{label}</Text>
      <Text style={[styles.badgeValue, { color: textColor }]}>
        {typeof value === 'number' ? value.toFixed(1) : value}{unit}
      </Text>
    </View>
  );
}

// Token Card Component
function TokenCard({ token, direction, index }: { token: ScreenedToken; direction: string; index: number }) {
  const router = useSafeRouter();
  const isUp = direction === 'up';
  const priceColor = token.price_change_24h >= 0 ? '#00F0FF' : '#BF00FF';
  const pricePrefix = token.price_change_24h >= 0 ? '+' : '';
  
  const handlePress = () => {
    router.push('/coin', { id: token.id });
  };
  
  const formatPrice = (price: number) => {
    if (price >= 1000) return `$${price.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
    if (price >= 1) return `$${price.toFixed(2)}`;
    return `$${price.toFixed(4)}`;
  };
  
  const formatMarketCap = (cap: number) => {
    if (cap >= 1e12) return `$${(cap / 1e12).toFixed(1)}T`;
    if (cap >= 1e9) return `$${(cap / 1e9).toFixed(1)}B`;
    if (cap >= 1e6) return `$${(cap / 1e6).toFixed(1)}M`;
    return `$${cap.toFixed(0)}`;
  };
  
  return (
    <Pressable onPress={handlePress} style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}>
    <View style={[
      styles.tokenCard,
      { borderLeftColor: isUp ? '#00F0FF' : '#BF00FF' }
    ]}>
      {/* Header */}
      <View style={styles.tokenHeader}>
        <View style={styles.tokenInfo}>
          <Image source={{ uri: token.image }} style={styles.tokenImage} />
          <View>
            <Text style={styles.tokenSymbol}>{token.symbol}</Text>
            <Text style={styles.tokenName} numberOfLines={1}>{token.name}</Text>
          </View>
        </View>
        
        <View style={styles.priceInfo}>
          <Text style={styles.price}>{formatPrice(token.current_price)}</Text>
          <Text style={[styles.priceChange, { color: priceColor }]}>
            {pricePrefix}{token.price_change_24h.toFixed(2)}%
          </Text>
        </View>
      </View>
      
      {/* Match Reasons */}
      <View style={styles.reasonsContainer}>
        {token.matchReasons.map((reason, i) => (
          <View key={i} style={styles.reasonChip}>
            <Text style={styles.reasonText}>{reason}</Text>
          </View>
        ))}
      </View>
      
      {/* Indicators */}
      <View style={styles.indicatorsContainer}>
        <IndicatorBadge 
          label="RSI" 
          value={token.indicators.rsi}
          isPositive={token.indicators.rsi !== null && token.indicators.rsi > 60}
          isNegative={token.indicators.rsi !== null && token.indicators.rsi < 40}
        />
        <IndicatorBadge 
          label="ADX" 
          value={token.indicators.adx}
          isPositive={token.indicators.adx !== null && token.indicators.adx > 25}
        />
        <IndicatorBadge 
          label="量比" 
          value={token.indicators.volumeRatio}
          unit="x"
          isPositive={token.indicators.volumeRatio > 1.5}
          isNegative={token.indicators.volumeRatio < 0.8}
        />
        <IndicatorBadge 
          label="MFI" 
          value={token.indicators.mfi}
          isPositive={token.indicators.mfi !== null && token.indicators.mfi > 60}
          isNegative={token.indicators.mfi !== null && token.indicators.mfi < 40}
        />
      </View>
      
      {/* Footer */}
      <View style={styles.tokenFooter}>
        <Text style={styles.marketCap}>市值: {formatMarketCap(token.market_cap)}</Text>
        <Text style={styles.rank}>#{index + 1}</Text>
      </View>
    </View>
    </Pressable>
  );
}

// Loading Skeleton
function LoadingSkeleton() {
  return (
    <View style={styles.skeletonContainer}>
      {[1, 2, 3, 4, 5].map((i) => (
        <View key={i} style={styles.skeletonCard}>
          <View style={styles.skeletonHeader}>
            <View style={styles.skeletonImage} />
            <View style={styles.skeletonText} />
          </View>
          <View style={styles.skeletonBadge} />
          <View style={styles.skeletonIndicators} />
        </View>
      ))}
    </View>
  );
}

export default function ScreenerScreen() {
  const router = useSafeRouter();
  const { scenario: scenarioParam } = useSafeSearchParams<{ scenario: string }>();
  const scenarioId = scenarioParam || '1h_up';
  
  const [data, setData] = useState<ScreenedToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  const scenario = scenarioTitles[scenarioId] || scenarioTitles['1h_up'];
  const isUp = scenario.direction === 'up';
  
  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/screener/${scenarioId}?limit=20`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result: ApiResponse = await response.json();
      
      if (result.success) {
        setData(result.data);
        setLastUpdated(new Date());
      } else {
        throw new Error(result.error || 'Failed to fetch data');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [scenarioId]);
  
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );
  
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);
  
  const renderItem = ({ item, index }: { item: ScreenedToken; index: number }) => (
    <TokenCard token={item} direction={scenario.direction} index={index} />
  );
  
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="bar-chart-outline" size={48} color="#6B7280" style={styles.emptyIcon} />
      <Text style={styles.emptyTitle}>暂无数据</Text>
      <Text style={styles.emptyText}>
        {error || '当前筛选条件没有找到符合条件的代币'}
      </Text>
    </View>
  );
  
  return (
    <Screen>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backIcon}>←</Text>
          </Pressable>
          
          <View style={styles.headerCenter}>
            <View style={styles.titleRow}>
              <Text style={[styles.arrowIcon, { color: isUp ? '#00F0FF' : '#BF00FF' }]}>
                {isUp ? '↑' : '↓'}
              </Text>
              <Text style={styles.title}>{scenario.description}</Text>
            </View>
            {lastUpdated && (
              <Text style={styles.lastUpdated}>
                更新于 {lastUpdated.toLocaleTimeString()}
              </Text>
            )}
          </View>
          
          <Pressable style={styles.refreshButton} onPress={onRefresh}>
            <Ionicons name="refresh" size={20} color="#FFFFFF" />
          </Pressable>
        </View>
        
        {/* Filters Info */}
        <View style={styles.filtersInfo}>
          <Text style={styles.filtersText}>
            {scenarioId === '1h_up' && 'RSI 50-70 | ADX>25 | 成交量>1.5x | MFI>60'}
            {scenarioId === '4h_up' && 'EMA多头排列 | MACD零轴上方 | ADX>25 | +DI>-DI'}
            {scenarioId === '1h_down' && '低于VWAP | RSI 30-50 | 下跌放量'}
            {scenarioId === '4h_down' && '跌破EMA50 | EMA空头 | MACD零轴下方 | ATR扩张'}
          </Text>
        </View>
        
        {/* Content */}
        {loading ? (
          <LoadingSkeleton />
        ) : (
          <FlatList
            data={data}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderEmpty}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#00F0FF"
                colors={['#00F0FF']}
              />
            }
          />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F2E',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#12121A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  arrowIcon: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  lastUpdated: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 2,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#12121A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Filters Info
  filtersInfo: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#12121A',
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F2E',
  },
  filtersText: {
    fontSize: 10,
    color: '#6B7280',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  
  // List
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  
  // Token Card
  tokenCard: {
    backgroundColor: '#12121A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderWidth: 1,
    borderColor: '#1F1F2E',
  },
  tokenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tokenInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  tokenImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#1F1F2E',
  },
  tokenSymbol: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  tokenName: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    maxWidth: 120,
  },
  priceInfo: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  priceChange: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  
  // Reasons
  reasonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  reasonChip: {
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.2)',
  },
  reasonText: {
    fontSize: 10,
    color: '#00F0FF',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  
  // Indicators
  indicatorsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  badge: {
    alignItems: 'center',
    flex: 1,
  },
  badgeLabel: {
    fontSize: 9,
    color: '#6B7280',
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  badgeValue: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  
  // Footer
  tokenFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  marketCap: {
    fontSize: 11,
    color: '#6B7280',
  },
  rank: {
    fontSize: 11,
    color: '#FFD700',
    fontWeight: '600',
  },
  
  // Empty
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  
  // Loading Skeleton
  skeletonContainer: {
    padding: 16,
  },
  skeletonCard: {
    backgroundColor: '#12121A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1F1F2E',
  },
  skeletonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  skeletonImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1F1F2E',
    marginRight: 12,
  },
  skeletonText: {
    width: 100,
    height: 20,
    backgroundColor: '#1F1F2E',
    borderRadius: 4,
  },
  skeletonBadge: {
    width: '60%',
    height: 24,
    backgroundColor: '#1F1F2E',
    borderRadius: 6,
    marginBottom: 12,
  },
  skeletonIndicators: {
    height: 40,
    backgroundColor: '#1F1F2E',
    borderRadius: 10,
  },
});
