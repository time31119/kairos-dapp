/**
 * 首页 - KAIROS DAPP
 * 优化版：整合为统一的板块结构
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Screen } from '@/components/Screen';
import { Ionicons } from '@expo/vector-icons';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import TradeModal from '@/components/payment/TradeModal';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9091';

// 热门赛道配置
const HOT_CATEGORIES = [
  { id: 'defi', title: 'DeFi', icon: 'trending-up', color: '#00F0FF' },
  { id: 'meme', title: 'Meme', icon: 'chatbubbles', color: '#FFD700' },
  { id: 'ai', title: 'AI', icon: 'hardware-chip', color: '#FF69B4' },
  { id: 'layer2', title: 'Layer2', icon: 'layers', color: '#FF6B6B' },
];

// 快捷入口 - 使用已存在的路由
const QUICK_ACTIONS = [
  { id: 'featured', title: '热门', icon: 'flame', color: '#FF6B6B', href: '/screener/featured' },
  { id: 'gainer', title: '涨幅榜', icon: 'trending-up', color: '#00FF88', href: '/screener/topgainers' },
  { id: 'loser', title: '跌幅榜', icon: 'trending-down', color: '#FF4444', href: '/screener/toplosers' },
  { id: 'analysis', title: '技术分析', icon: 'analytics', color: '#9370DB', href: '/analysis' },
];

// 辅助函数
function formatPrice(price: number): string {
  if (price >= 1000) return price.toFixed(0);
  if (price >= 1) return price.toFixed(2);
  if (price >= 0.01) return price.toFixed(3);
  return price.toFixed(4);
}

// 热门赛道卡片组件
function HotTrackCard({ 
  track, 
  tokens, 
  stats,
  onTradeToken,
  onPressMore
}: { 
  track: any; 
  tokens: any[];
  stats: any;
  onTradeToken: (token: any, mode: 'buy' | 'sell') => void;
  onPressMore: () => void;
}) {
  return (
    <View style={styles.trackCard}>
      {/* 赛道头部 */}
      <View style={styles.trackHeader}>
        <View style={[styles.trackIcon, { backgroundColor: track.color + '20' }]}>
          <Ionicons name={track.icon} size={18} color={track.color} />
        </View>
        <View style={styles.trackInfo}>
          <Text style={styles.trackTitle}>{track.title}</Text>
          {stats && (
            <View style={styles.trackStats}>
              <Text style={styles.trackStatText}>
                {stats.bullishTokens || 0} 个做多信号
              </Text>
              <Text style={styles.trackStatDivider}>·</Text>
              <Text style={[styles.trackStatText, { color: '#FFD700' }]}>
                {stats.avgWinRate || 0}% 胜率
              </Text>
            </View>
          )}
        </View>
        <TouchableOpacity style={styles.trackMore} onPress={onPressMore}>
          <Text style={styles.trackMoreText}>更多</Text>
          <Ionicons name="chevron-forward" size={14} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* 代币列表 */}
      <View style={styles.tokenList}>
        {tokens?.slice(0, 4).map((t: any, idx: number) => (
          <View key={t.symbol} style={styles.tokenRow}>
            <Text style={styles.tokenRank}>{idx + 1}</Text>
            <Text style={styles.tokenSymbol}>{t.symbol}</Text>
            <View style={styles.tokenPriceInfo}>
              <Text style={styles.tokenPrice}>${formatPrice(t.price)}</Text>
              <Text style={[styles.tokenChange, { color: t.change >= 0 ? '#00FF88' : '#FF4444' }]}>
                {t.change >= 0 ? '+' : ''}{t.change?.toFixed(1)}%
              </Text>
            </View>
            <View style={styles.tokenActions}>
              <TouchableOpacity 
                style={styles.buyBtn} 
                onPress={() => onTradeToken(t, 'buy')}
              >
                <Text style={styles.buyBtnText}>买</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.sellBtn}
                onPress={() => onTradeToken(t, 'sell')}
              >
                <Text style={styles.sellBtnText}>卖</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

// 涨幅榜组件
function GainersBoard({ tokens, title, color }: { tokens: any[]; title: string; color: string }) {
  return (
    <View style={styles.boardCard}>
      <View style={[styles.boardHeader, { borderLeftColor: color }]}>
        <Ionicons name="trending-up" size={14} color={color} />
        <Text style={[styles.boardTitle, { color }]}>{title}</Text>
      </View>
      {tokens?.slice(0, 5).map((t: any, idx: number) => (
        <View key={t.symbol} style={styles.boardRow}>
          <Text style={styles.boardRank}>{idx + 1}</Text>
          <Text style={styles.boardSymbol}>{t.symbol}</Text>
          <Text style={[styles.boardChange, { color }]}>
            +{t.change?.toFixed(1)}%
          </Text>
        </View>
      )) || (
        <Text style={styles.noData}>暂无数据</Text>
      )}
    </View>
  );
}

// 跌幅榜组件
function LosersBoard({ tokens, title, color }: { tokens: any[]; title: string; color: string }) {
  return (
    <View style={styles.boardCard}>
      <View style={[styles.boardHeader, { borderLeftColor: color }]}>
        <Ionicons name="trending-down" size={14} color={color} />
        <Text style={[styles.boardTitle, { color }]}>{title}</Text>
      </View>
      {tokens?.slice(0, 5).map((t: any, idx: number) => (
        <View key={t.symbol} style={styles.boardRow}>
          <Text style={styles.boardRank}>{idx + 1}</Text>
          <Text style={styles.boardSymbol}>{t.symbol}</Text>
          <Text style={[styles.boardChange, { color }]}>
            {t.change?.toFixed(1)}%
          </Text>
        </View>
      )) || (
        <Text style={styles.noData}>暂无数据</Text>
      )}
    </View>
  );
}

export default function HomeScreen() {
  const router = useSafeRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // 数据状态
  const [globalGainers, setGlobalGainers] = useState<any[]>([]);
  const [globalLosers, setGlobalLosers] = useState<any[]>([]);
  const [trackData, setTrackData] = useState<Record<string, { tokens: any[]; stats: any }>>({});

  // 交易功能
  const [tradeModalVisible, setTradeModalVisible] = useState(false);
  const [selectedTradeToken, setSelectedTradeToken] = useState<any>(null);
  const [tradeMode, setTradeMode] = useState<'buy' | 'sell'>('buy');

  const handleTradeToken = useCallback((token: any, mode: 'buy' | 'sell') => {
    setSelectedTradeToken(token);
    setTradeMode(mode);
    setTradeModalVisible(true);
  }, []);

  // 获取全球行情数据
  const fetchGlobalData = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/screener/scenarios/realtime`);
      const result = await response.json();
      if (result.success && result.data) {
        const data = result.data[0] || {};
        setGlobalGainers(data.globalGainers || []);
        setGlobalLosers(data.globalLosers || []);
        
        // 提取各赛道数据
        const tracks: Record<string, { tokens: any[]; stats: any }> = {};
        result.data.forEach((scenario: any) => {
          if (HOT_CATEGORIES.find(c => c.id === scenario.id)) {
            tracks[scenario.id] = {
              tokens: scenario.tokens || [],
              stats: scenario.stats || {},
            };
          }
        });
        setTrackData(tracks);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch global data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // 初始加载
  useEffect(() => {
    fetchGlobalData();
  }, [fetchGlobalData]);

  // 5秒自动刷新
  useEffect(() => {
    const interval = setInterval(fetchGlobalData, 5000);
    return () => clearInterval(interval);
  }, [fetchGlobalData]);

  // 下拉刷新
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchGlobalData();
  }, [fetchGlobalData]);

  return (
    <Screen>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#00F0FF"
          />
        }
      >
        {/* ========== Header ========== */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.logo}>KAIROS</Text>
              <Text style={styles.sub}>加密货币行情筛选</Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.headerBtn}>
                <Ionicons name="search" size={22} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerBtn}>
                <Ionicons name="notifications-outline" size={22} color="#FFF" />
                <View style={styles.notifDot} />
              </TouchableOpacity>
            </View>
          </View>

          {/* 快捷入口 */}
          <View style={styles.quickGrid}>
            {QUICK_ACTIONS.map(action => (
              <Pressable 
                key={action.id}
                style={[styles.quickCard, { borderColor: action.color + '40' }]}
                onPress={() => router.push(action.href)}
              >
                <View style={[styles.quickIcon, { backgroundColor: action.color + '20' }]}>
                  <Ionicons name={action.icon as any} size={18} color={action.color} />
                </View>
                <Text style={styles.quickText}>{action.title}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* ========== 全球行情总览 ========== */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>全球行情</Text>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>实时</Text>
            </View>
          </View>
          
          <View style={styles.boardsRow}>
            <GainersBoard 
              tokens={globalGainers} 
              title="涨幅榜" 
              color="#00FF88" 
            />
            <LosersBoard 
              tokens={globalLosers} 
              title="跌幅榜" 
              color="#FF4444" 
            />
          </View>
        </View>

        {/* ========== 热门推荐 ========== */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>热门推荐</Text>
            <Text style={styles.sectionSubtitle}>即时买卖</Text>
          </View>
          
          <View style={styles.hotTokensGrid}>
            {(globalGainers.slice(0, 6)).map((token: any) => (
              <View key={token.symbol} style={styles.hotTokenCard}>
                <View style={styles.hotTokenHeader}>
                  <View style={styles.hotTokenIcon}>
                    <Text style={styles.hotTokenIconText}>
                      {token.symbol?.slice(0, 2) || '??'}
                    </Text>
                  </View>
                  <View style={styles.hotTokenInfo}>
                    <Text style={styles.hotTokenSymbol}>{token.symbol}</Text>
                    <Text style={styles.hotTokenName} numberOfLines={1}>
                      {token.name || token.symbol}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.hotTokenPrice}>
                  <Text style={styles.hotTokenPriceText}>
                    ${token.price > 1 ? token.price.toFixed(2) : token.price.toFixed(6)}
                  </Text>
                  <Text style={[styles.hotTokenChange, { color: token.change24h >= 0 ? '#00FF88' : '#FF4444' }]}>
                    {token.change24h >= 0 ? '+' : ''}{token.change24h?.toFixed(2)}%
                  </Text>
                </View>
                
                <View style={styles.hotTokenActions}>
                  <TouchableOpacity 
                    style={[styles.hotTokenBtn, styles.buyBtn]}
                    onPress={() => handleTradeToken(token, 'buy')}
                  >
                    <Text style={styles.buyBtnText}>买入</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.hotTokenBtn, styles.sellBtn]}
                    onPress={() => handleTradeToken(token, 'sell')}
                  >
                    <Text style={styles.sellBtnText}>卖出</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* ========== 热门赛道精选 ========== */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>热门赛道</Text>
            <TouchableOpacity style={styles.moreBtn} onPress={() => router.push('/categories')}>
              <Text style={styles.moreBtnText}>全部赛道</Text>
              <Ionicons name="chevron-forward" size={14} color="#00F0FF" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingWrap}>
              <Text style={styles.loadingText}>加载中...</Text>
            </View>
          ) : (
            <View style={styles.tracksList}>
              {HOT_CATEGORIES.map(track => (
                <HotTrackCard
                  key={track.id}
                  track={track}
                  tokens={trackData[track.id]?.tokens || []}
                  stats={trackData[track.id]?.stats}
                  onTradeToken={handleTradeToken}
                  onPressMore={() => router.push('/screener/' + track.id)}
                />
              ))}
            </View>
          )}
        </View>

        {/* ========== 底部间距 ========== */}
        <View style={styles.bottomGap} />
      </ScrollView>

      {/* 交易弹窗 */}
      <TradeModal
        visible={tradeModalVisible}
        token={selectedTradeToken}
        mode={tradeMode}
        onClose={() => {
          setTradeModalVisible(false);
          setSelectedTradeToken(null);
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F' },

  // Header
  header: {
    padding: 16,
    paddingTop: 60,
    backgroundColor: '#0A0A0F',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  logo: {
    fontSize: 28,
    fontWeight: '900',
    color: '#00F0FF',
    letterSpacing: 2,
  },
  sub: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#12121A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF4444',
  },

  // 快捷入口
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickCard: {
    width: '47%',
    backgroundColor: '#12121A',
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  quickIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },

  // Section 通用
  section: {
    padding: 16,
    paddingTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#12121A',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00FF88',
  },
  liveText: {
    fontSize: 11,
    color: '#00FF88',
    fontWeight: '600',
  },
  moreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  moreBtnText: {
    fontSize: 13,
    color: '#00F0FF',
    fontWeight: '500',
  },

  // 涨跌榜
  boardsRow: {
    flexDirection: 'row',
    gap: 12,
  },

  // 热门推荐
  hotTokensGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  hotTokenCard: {
    width: '47%',
    backgroundColor: '#12121A',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1F1F2E',
  },
  hotTokenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  hotTokenIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1F1F2E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hotTokenIconText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00F0FF',
  },
  hotTokenInfo: {
    flex: 1,
  },
  hotTokenSymbol: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
  },
  hotTokenName: {
    fontSize: 11,
    color: '#6B7280',
  },
  hotTokenPrice: {
    marginBottom: 10,
  },
  hotTokenPriceText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  hotTokenChange: {
    fontSize: 12,
    fontWeight: '600',
  },
  hotTokenActions: {
    flexDirection: 'row',
    gap: 8,
  },
  hotTokenBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  buyBtn: {
    backgroundColor: '#00FF88',
  },
  buyBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0A0A0F',
  },
  sellBtn: {
    backgroundColor: '#FF4444',
  },
  sellBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFF',
  },

  boardCard: {
    flex: 1,
    backgroundColor: '#12121A',
    borderRadius: 12,
    padding: 12,
  },
  boardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderLeftWidth: 3,
    paddingLeft: 8,
    marginBottom: 12,
  },
  boardTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  boardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  boardRank: {
    width: 18,
    fontSize: 11,
    color: '#6B7280',
  },
  boardSymbol: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
  },
  boardChange: {
    fontSize: 12,
    fontWeight: '700',
  },
  noData: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    paddingVertical: 20,
  },

  // 热门赛道卡片
  tracksList: {
    gap: 12,
  },
  trackCard: {
    backgroundColor: '#12121A',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  trackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  trackIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackInfo: {
    flex: 1,
    marginLeft: 10,
  },
  trackTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
  },
  trackStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  trackStatText: {
    fontSize: 11,
    color: '#00FF88',
  },
  trackStatDivider: {
    fontSize: 11,
    color: '#6B7280',
    marginHorizontal: 4,
  },
  trackMore: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trackMoreText: {
    fontSize: 12,
    color: '#6B7280',
  },

  // 代币行
  tokenList: {
    gap: 4,
  },
  tokenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A24',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  tokenRank: {
    width: 18,
    fontSize: 11,
    color: '#6B7280',
  },
  tokenSymbol: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#FFF',
  },
  tokenPriceInfo: {
    alignItems: 'flex-end',
    marginRight: 10,
  },
  tokenPrice: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
  },
  tokenChange: {
    fontSize: 11,
    fontWeight: '600',
  },
  tokenActions: {
    flexDirection: 'row',
    gap: 6,
  },
  buyBtn: {
    backgroundColor: '#00FF8820',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
  },
  buyBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00FF88',
  },
  sellBtn: {
    backgroundColor: '#FF444420',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
  },
  sellBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF4444',
  },

  // 加载状态
  loadingWrap: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    color: '#6B7280',
    fontSize: 14,
  },

  // 底部间距
  bottomGap: {
    height: 100,
  },
});
