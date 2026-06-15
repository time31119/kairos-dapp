import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';

const API_BASE = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || ''

interface Trader {
  id: string;
  platform: string;
  name: string;
  avatar?: string;
  avatarUrl?: string;
  country?: string;
  winRate: number;
  returns: number;
  followers: number;
  totalTrades: number;
  avgProfit: number;
  specialties: string[];
  strategies: string[];
  riskLevel: string;
  verified: boolean;
  blueTick: boolean;
  lastTradeTime?: string;
  todayPnl?: string;
  weeklyPnL?: string;
  maxDrawdown?: string;
  sharpeRatio?: string;
}

interface FollowingPosition {
  id: string;
  traderId: string;
  traderName: string;
  traderAvatar?: string;
  traderPlatform: string;
  amount: number;
  pnl: number;
  pnlRate: number;
  status: 'active' | 'closed';
  startTime: string;
}

const RISK_COLORS: Record<string, string> = {
  '低': '#00FF88',
  '中': '#FFB800',
  '高': '#FF6B6B',
  '极高': '#FF0055',
};

export default function CopytradingScreen() {
  const [activeTab, setActiveTab] = useState<'traders' | 'portfolio'>('traders');
  const [traders, setTraders] = useState<Trader[]>([]);
  const [portfolio, setPortfolio] = useState<FollowingPosition[]>([]);
  const [topTraders, setTopTraders] = useState<Trader[]>([]);
  const [traderLiveData, setTraderLiveData] = useState<Record<string, {
    todayPnl: string;
    todayPnlRate: string;
    lastTradeTime: string;
    status: 'open' | 'closed';
    currentPosition?: { symbol: string; side: 'long' | 'short'; entryPrice: number; markPrice: number; pnl: number; pnlRate: number; };
  }>>({});
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<'returns' | 'winRate' | 'followers'>('returns');
  const [searchQuery, setSearchQuery] = useState('');

  // 获取交易员数据
  const fetchTraders = useCallback(async () => {
    setLoading(true);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(`${API_BASE}/api/v1/copytrading/traders?sort=${sortBy}&limit=20`, {
        signal: controller.signal,
      });
      clearTimeout(timeout);
      
      if (response.ok) {
        const data = await response.json();
        setTraders(data.data || []);
      }
    } catch (error) {
      console.log('获取交易员失败');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [sortBy]);

  // 获取我的实盘数据
  const fetchPortfolio = useCallback(async () => {
    // 模拟我的实盘数据
    setPortfolio([
      {
        id: 'pos_001',
        traderId: 'bin_001',
        traderName: 'CryptoAlpha Pro',
        traderPlatform: 'Binance',
        amount: 100,
        pnl: 23.5,
        pnlRate: 2.35,
        status: 'active',
        startTime: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
      {
        id: 'pos_002',
        traderId: 'bin_002',
        traderName: 'WhaleHunter',
        traderPlatform: 'Binance',
        amount: 200,
        pnl: -5.2,
        pnlRate: -0.52,
        status: 'active',
        startTime: new Date(Date.now() - 86400000 * 7).toISOString(),
      },
    ]);
  }, []);

  // 获取顶尖交易员实时数据
  const fetchTopTradersLiveData = useCallback(async () => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      
      // 获取前10名顶尖交易员
      const response = await fetch(`${API_BASE}/api/v1/copytrading/traders?sort=returns&limit=10`, {
        signal: controller.signal,
      });
      clearTimeout(timeout);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setTopTraders(data.data);
          
          // 生成模拟实时数据
          const liveData: Record<string, any> = {};
          data.data.forEach((trader: any) => {
            const isProfitable = Math.random() > 0.3;
            const pnlValue = isProfitable 
              ? (Math.random() * 500 + 10).toFixed(2)
              : (-Math.random() * 200 - 5).toFixed(2);
            const pnlRate = isProfitable
              ? (Math.random() * 5 + 0.5).toFixed(2)
              : (-Math.random() * 3 - 0.5).toFixed(2);
            
            liveData[trader.id] = {
              todayPnl: pnlValue,
              todayPnlRate: pnlRate,
              lastTradeTime: trader.lastTradeTime || new Date().toISOString(),
              status: Math.random() > 0.2 ? 'open' : 'closed',
              currentPosition: Math.random() > 0.3 ? {
                symbol: ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'PEPE/USDT'][Math.floor(Math.random() * 4)],
                side: Math.random() > 0.5 ? 'long' : 'short',
                entryPrice: (50000 + Math.random() * 5000).toFixed(2),
                markPrice: (50000 + Math.random() * 5000).toFixed(2),
                pnl: pnlValue,
                pnlRate: pnlRate,
              } : undefined,
            };
          });
          setTraderLiveData(liveData);
        }
      }
    } catch (error) {
      console.log('获取实时数据失败');
    }
  }, []);

  // 初始加载
  useEffect(() => {
    fetchTraders();
  }, [fetchTraders]);

  // Tab 切换时加载数据
  useEffect(() => {
    if (activeTab === 'traders' && traders.length === 0) {
      fetchTraders();
    } else if (activeTab === 'portfolio') {
      fetchPortfolio();
      fetchTopTradersLiveData();
    }
  }, [activeTab]);

  // 实时数据轮询 (每5秒更新一次)
  useEffect(() => {
    if (activeTab !== 'portfolio') return;
    
    const interval = setInterval(() => {
      fetchTopTradersLiveData();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [activeTab, fetchTopTradersLiveData]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (activeTab === 'traders') {
      await fetchTraders();
    } else if (activeTab === 'portfolio') {
      await fetchPortfolio();
    }
  };

  // 跟单操作
  const handleFollow = async (traderId: string, amount: number): Promise<boolean> => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(`${API_BASE}/api/v1/copytrading/follow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({ traderId, amount }),
      });
      clearTimeout(timeout);
      
      if (response.ok) {
        // 添加到我的实盘
        const trader = traders.find(t => t.id === traderId);
        if (trader) {
          const newPosition: FollowingPosition = {
            id: `pos_${Date.now()}`,
            traderId,
            traderName: trader.name,
            traderPlatform: trader.platform,
            amount,
            pnl: 0,
            pnlRate: 0,
            status: 'active',
            startTime: new Date().toISOString(),
          };
          setPortfolio(prev => [newPosition, ...prev]);
        }
        return true;
      }
      return false;
    } catch (error) {
      console.log('跟单失败');
      return false;
    }
  };

  // 取消跟单
  const handleUnfollow = async (positionId: string) => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(`${API_BASE}/api/v1/copytrading/unfollow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({ traderId: portfolio.find(p => p.id === positionId)?.traderId }),
      });
      clearTimeout(timeout);
      
      if (response.ok) {
        setPortfolio(prev => prev.filter(p => p.id !== positionId));
      }
    } catch (error) {
      console.log('取消跟单失败');
    }
  };

  // 筛选交易员
  const filteredTraders = traders.filter(trader => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      trader.name.toLowerCase().includes(query) ||
      trader.platform.toLowerCase().includes(query) ||
      trader.specialties?.some(s => s.toLowerCase().includes(query))
    );
  });

  // 渲染一键跟单Tab
  const renderTradersTab = () => (
    <View style={styles.tabContent}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#8B8B9A" />
        <TextInput
          style={styles.searchInput}
          placeholder="搜索交易员或币种..."
          placeholderTextColor="#8B8B9A"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#8B8B9A" />
          </TouchableOpacity>
        )}
      </View>

      {/* Sort Options */}
      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>排序:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { key: 'returns', label: '累计收益' },
            { key: 'winRate', label: '胜率' },
            { key: 'followers', label: '跟单人数' },
          ].map(option => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.sortBtn,
                sortBy === option.key && styles.sortBtnActive
              ]}
              onPress={() => setSortBy(option.key as any)}
            >
              <Text style={[
                styles.sortBtnText,
                sortBy === option.key && styles.sortBtnTextActive
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Traders List */}
      {loading && traders.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00F0FF" />
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      ) : (
        <ScrollView
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
          {filteredTraders.map((trader, index) => (
            <TouchableOpacity
              key={trader.id || index}
              style={styles.traderCard}
              activeOpacity={0.8}
            >
              <View style={styles.traderHeader}>
                <View style={styles.traderLeft}>
                  <View style={[styles.rankBadge, { 
                    backgroundColor: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : '#3A3A4A' 
                  }]}>
                    <Text style={styles.rankText}>{index + 1}</Text>
                  </View>
                  
                  {/* Avatar */}
                  {trader.avatarUrl ? (
                    <Image source={{ uri: trader.avatarUrl }} style={styles.avatar} />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Text style={styles.avatarText}>{trader.name.charAt(0)}</Text>
                    </View>
                  )}
                  
                  <View style={styles.traderInfo}>
                    <View style={styles.nameRow}>
                      <Text style={styles.traderName} numberOfLines={1}>{trader.name}</Text>
                      {trader.blueTick && (
                        <Ionicons name="checkmark-circle" size={14} color="#00F0FF" />
                      )}
                    </View>
                    <View style={styles.metaRow}>
                      <Text style={styles.traderPlatform}>{trader.country} {trader.platform}</Text>
                      <View style={[
                        styles.riskBadge,
                        { backgroundColor: (RISK_COLORS[trader.riskLevel] || '#8B8B9A') + '20' }
                      ]}>
                        <Text style={[
                          styles.riskText,
                          { color: RISK_COLORS[trader.riskLevel] || '#8B8B9A' }
                        ]}>
                          {trader.riskLevel}风险
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
                
                <TouchableOpacity
                  style={styles.followBtn}
                  onPress={() => handleFollow(trader.id, 100)}
                >
                  <Ionicons name="git-network-outline" size={14} color="#0A0A0F" />
                  <Text style={styles.followBtnText}>跟单</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.dataGrid}>
                <View style={styles.dataItem}>
                  <Text style={styles.dataValue}>+{trader.returns?.toFixed(1)}%</Text>
                  <Text style={styles.dataLabel}>累计收益</Text>
                </View>
                <View style={styles.dataDivider} />
                <View style={styles.dataItem}>
                  <Text style={[styles.dataValue, { color: '#00FF88' }]}>{trader.winRate?.toFixed(1)}%</Text>
                  <Text style={styles.dataLabel}>胜率</Text>
                </View>
                <View style={styles.dataDivider} />
                <View style={styles.dataItem}>
                  <Text style={styles.dataValue}>{(trader.followers / 1000).toFixed(1)}k</Text>
                  <Text style={styles.dataLabel}>跟单人数</Text>
                </View>
                <View style={styles.dataDivider} />
                <View style={styles.dataItem}>
                  <Text style={styles.dataValue}>{(trader.todayPnl || '0')} %</Text>
                  <Text style={styles.dataLabel}>今日收益</Text>
                </View>
              </View>

              {/* Specialties */}
              <View style={styles.specialtiesRow}>
                {trader.specialties?.slice(0, 4).map((tag, i) => (
                  <View key={i} style={styles.specialtyTag}>
                    <Text style={styles.specialtyText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          ))}
          <View style={styles.bottomPadding} />
        </ScrollView>
      )}
    </View>
  );

  // 渲染我的实盘Tab
  const renderPortfolioTab = () => (
    <View style={styles.tabContent}>
      {/* 顶尖交易员实时数据 - 始终显示 */}
      <View style={styles.liveTradersSection}>
        <View style={styles.liveTradersHeader}>
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>实时同步</Text>
          </View>
          <Text style={styles.liveTradersTitle}>顶尖交易员实时数据</Text>
        </View>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.liveTradersScroll}
        >
          {topTraders.length > 0 ? (
            topTraders.slice(0, 10).map((trader, index) => {
              const liveInfo = traderLiveData[trader.id] || {};
              const isProfitable = parseFloat(liveInfo.todayPnl || '0') >= 0;
              
              return (
                <TouchableOpacity 
                  key={trader.id} 
                  style={styles.liveTraderCard}
                  onPress={() => handleFollow(trader.id, 100)}
                >
                  <View style={styles.liveTraderRank}>
                    <Text style={styles.liveRankText}>#{index + 1}</Text>
                  </View>
                  <View style={styles.liveTraderAvatar}>
                    <Text style={styles.liveAvatarText}>{trader.name.charAt(0)}</Text>
                  </View>
                  <Text style={styles.liveTraderName} numberOfLines={1}>{trader.name}</Text>
                  <Text style={styles.liveTraderPlatform}>{trader.platform}</Text>
                  <View style={[
                    styles.livePnlBadge,
                    { backgroundColor: isProfitable ? '#00FF8820' : '#FF444420' }
                  ]}>
                    <Text style={[
                      styles.livePnlText,
                      { color: isProfitable ? '#00FF88' : '#FF4444' }
                    ]}>
                      {isProfitable ? '+' : ''}{liveInfo.todayPnl || '0'}%
                    </Text>
                  </View>
                  {liveInfo.currentPosition && (
                    <View style={styles.livePositionBadge}>
                      <Text style={styles.livePositionText}>
                        {liveInfo.currentPosition.side === 'long' ? '多' : '空'}
                      </Text>
                    </View>
                  )}
                  <TouchableOpacity 
                    style={styles.liveFollowBtn}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleFollow(trader.id, 100);
                    }}
                  >
                    <Ionicons name="add" size={14} color="#0A0A0F" />
                    <Text style={styles.liveFollowBtnText}>跟单</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={styles.loadingLiveTraders}>
              <Text style={styles.loadingText}>加载中...</Text>
            </View>
          )}
        </ScrollView>
        
        {/* 实时数据指标 */}
        {topTraders.length > 0 && (
          <View style={styles.liveStatsRow}>
            <View style={styles.liveStatItem}>
              <Text style={styles.liveStatLabel}>交易员总数</Text>
              <Text style={styles.liveStatValue}>{topTraders.length}</Text>
            </View>
            <View style={styles.liveStatItem}>
              <Text style={styles.liveStatLabel}>盈利中</Text>
              <Text style={[styles.liveStatValue, { color: '#00FF88' }]}>
                {Object.values(traderLiveData).filter(l => parseFloat(l.todayPnl || '0') >= 0).length}
              </Text>
            </View>
            <View style={styles.liveStatItem}>
              <Text style={styles.liveStatLabel}>亏损中</Text>
              <Text style={[styles.liveStatValue, { color: '#FF4444' }]}>
                {Object.values(traderLiveData).filter(l => parseFloat(l.todayPnl || '0') < 0).length}
              </Text>
            </View>
            <View style={styles.liveStatItem}>
              <Text style={styles.liveStatLabel}>更新于</Text>
              <Text style={styles.liveStatValue}>刚刚</Text>
            </View>
          </View>
        )}
      </View>

      {/* 我的跟单记录 */}
      <View style={styles.myPortfolioSection}>
        <Text style={styles.sectionTitle}>我的跟单</Text>
        {portfolio.length === 0 ? (
          <View style={styles.emptyPortfolio}>
            <Ionicons name="wallet-outline" size={48} color="#3A3A4A" />
            <Text style={[styles.emptyTitle, { marginTop: 16}]}>暂无跟单记录</Text>
            <Text style={styles.emptyDesc}>从上方选择交易员开始跟单</Text>
          </View>
        ) : (
          <>
            {/* 跟单汇总 */}
            <View style={styles.portfolioSummary}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>跟单总数</Text>
                <Text style={styles.summaryValue}>{portfolio.length}</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>跟单总额</Text>
                <Text style={styles.summaryValue}>
                  ${portfolio.reduce((sum, p) => sum + p.amount, 0)}
                </Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>总收益</Text>
                <Text style={[
                  styles.summaryValue,
                  { color: portfolio.reduce((sum, p) => sum + p.pnl, 0) >= 0 ? '#00FF88' : '#FF4444' }
                ]}>
                  {portfolio.reduce((sum, p) => sum + p.pnl, 0) >= 0 ? '+' : ''}
                  ${portfolio.reduce((sum, p) => sum + p.pnl, 0).toFixed(2)}
                </Text>
              </View>
            </View>

            {/* 跟单列表 */}
            {portfolio.map((position) => (
              <View key={position.id} style={styles.positionCard}>
                <View style={styles.positionHeader}>
                  <View style={styles.positionTrader}>
                    <View style={styles.positionAvatar}>
                      <Text style={styles.positionAvatarText}>
                        {position.traderName.charAt(0)}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.positionName}>{position.traderName}</Text>
                      <Text style={styles.positionPlatform}>{position.traderPlatform}</Text>
                    </View>
                  </View>
                  <View style={[
                    styles.positionStatus,
                    { backgroundColor: position.status === 'active' ? '#00FF8820' : '#FF444420' }
                  ]}>
                    <Text style={[
                      styles.positionStatusText,
                      { color: position.status === 'active' ? '#00FF88' : '#FF4444' }
                    ]}>
                      {position.status === 'active' ? '跟单中' : '已平仓'}
                    </Text>
                  </View>
                </View>

                <View style={styles.positionStats}>
                  <View style={styles.positionStat}>
                    <Text style={styles.positionStatLabel}>跟单金额</Text>
                    <Text style={styles.positionStatValue}>${position.amount}</Text>
                  </View>
                  <View style={styles.positionStat}>
                    <Text style={styles.positionStatLabel}>跟单时长</Text>
                    <Text style={styles.positionStatValue}>
                      {Math.floor((Date.now() - new Date(position.startTime).getTime()) / 86400000)}天
                    </Text>
                  </View>
                  <View style={styles.positionStat}>
                    <Text style={styles.positionStatLabel}>收益</Text>
                    <Text style={[
                      styles.positionStatValue,
                      { color: position.pnl >= 0 ? '#00FF88' : '#FF4444' }
                    ]}>
                      {position.pnl >= 0 ? '+' : ''}{position.pnlRate.toFixed(2)}%
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.unfollowBtn}
                  onPress={() => handleUnfollow(position.id)}
                >
                  <Ionicons name="close-circle-outline" size={16} color="#FF4444" />
                  <Text style={styles.unfollowBtnText}>取消跟单</Text>
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}
      </View>
      <View style={styles.bottomPadding} />
    </View>
  );

  return (
    <Screen>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
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
          <Text style={styles.headerTitle}>一键跟单</Text>
          <Text style={styles.headerSubtitle}>
            {activeTab === 'traders' && `${traders.length} 位顶尖交易员`}
            {activeTab === 'portfolio' && '我的跟单实盘'}
          </Text>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabNav}>
          <TouchableOpacity 
            style={[styles.tabItem, activeTab === 'traders' && styles.tabItemActive]}
            onPress={() => setActiveTab('traders')}
          >
            <Ionicons 
              name="git-network" 
              size={20} 
              color={activeTab === 'traders' ? '#00F0FF' : '#8B8B9A'} 
            />
            <Text style={[styles.tabText, activeTab === 'traders' && styles.tabTextActive]}>
              一键跟单
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabItem, activeTab === 'portfolio' && styles.tabItemActive]}
            onPress={() => setActiveTab('portfolio')}
          >
            <Ionicons 
              name="bar-chart" 
              size={20} 
              color={activeTab === 'portfolio' ? '#00F0FF' : '#8B8B9A'} 
            />
            <Text style={[styles.tabText, activeTab === 'portfolio' && styles.tabTextActive]}>
              我的实盘
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content - scrolls with the page */}
        <View style={styles.contentContainer}>
          {activeTab === 'traders' && renderTradersTab()}
          {activeTab === 'portfolio' && renderPortfolioTab()}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: '#0A0A0F',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#A0A0B0',
    marginTop: 4,
  },
  tabNav: {
    flexDirection: 'row' as const,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F2E',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center' as const,
    paddingVertical: 8,
    borderRadius: 8,
  },
  tabItemActive: {
    backgroundColor: '#00F0FF15',
  },
  tabText: {
    fontSize: 12,
    color: '#8B8B9A',
    marginTop: 4,
  },
  tabTextActive: {
    color: '#00F0FF',
  },
  contentContainer: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  loadingText: {
    color: '#8B8B9A',
    fontSize: 14,
    marginTop: 12,
  },
  searchContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: '#13131A',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 14,
    color: '#FFFFFF',
  },
  sortContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 12,
  },
  sortLabel: {
    fontSize: 12,
    color: '#8B8B9A',
    marginRight: 8,
  },
  sortBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#13131A',
    borderRadius: 16,
    marginRight: 8,
  },
  sortBtnActive: {
    backgroundColor: '#00F0FF',
  },
  sortBtnText: {
    fontSize: 12,
    color: '#8B8B9A',
  },
  sortBtnTextActive: {
    color: '#0A0A0F',
  },
  traderCard: {
    backgroundColor: '#13131A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1F1F2E',
  },
  traderHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 12,
  },
  traderLeft: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    flex: 1,
  },
  rankBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginRight: 8,
  },
  rankText: {
    color: '#0A0A0F',
    fontSize: 11,
    fontWeight: '700' as const,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 10,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1F1F2E',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginRight: 10,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#00F0FF',
  },
  traderInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
  },
  traderName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600' as const,
  },
  metaRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginTop: 2,
    gap: 8,
  },
  traderPlatform: {
    color: '#8B8B9A',
    fontSize: 12,
  },
  riskBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  riskText: {
    fontSize: 10,
    fontWeight: '600' as const,
  },
  followBtn: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: '#00F0FF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  followBtnText: {
    color: '#0A0A0F',
    fontSize: 13,
    fontWeight: '600' as const,
  },
  dataGrid: {
    flexDirection: 'row' as const,
    backgroundColor: '#0A0A0F',
    borderRadius: 12,
    padding: 12,
  },
  dataItem: {
    flex: 1,
    alignItems: 'center' as const,
  },
  dataValue: {
    color: '#00F0FF',
    fontSize: 15,
    fontWeight: '700' as const,
  },
  dataLabel: {
    color: '#8B8B9A',
    fontSize: 10,
    marginTop: 2,
  },
  dataDivider: {
    width: 1,
    backgroundColor: '#1F1F2E',
    marginHorizontal: 4,
  },
  specialtiesRow: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    marginTop: 12,
    gap: 6,
  },
  specialtyTag: {
    backgroundColor: '#1F1F2E',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  specialtyText: {
    color: '#8B8B9A',
    fontSize: 11,
  },
  bottomPadding: {
    height: 20,
  },
  portfolioSummary: {
    flexDirection: 'row' as const,
    backgroundColor: '#13131A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center' as const,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#8B8B9A',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginTop: 4,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: '#1F1F2E',
  },
  positionCard: {
    backgroundColor: '#13131A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  positionHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 12,
  },
  positionTrader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  positionAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1F1F2E',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginRight: 10,
  },
  positionAvatarText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#00F0FF',
  },
  positionName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  positionPlatform: {
    fontSize: 12,
    color: '#8B8B9A',
    marginTop: 2,
  },
  positionStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  positionStatusText: {
    fontSize: 11,
    fontWeight: '600' as const,
  },
  positionStats: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    marginBottom: 12,
  },
  positionStat: {
    flex: 1,
    alignItems: 'center' as const,
  },
  positionStatLabel: {
    fontSize: 11,
    color: '#8B8B9A',
  },
  positionStatValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    marginTop: 2,
  },
  unfollowBtn: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#1F1F2E',
    gap: 4,
  },
  unfollowBtnText: {
    color: '#FF4444',
    fontSize: 13,
  },
  // 顶尖交易员实时数据样式
  liveTradersSection: {
    marginBottom: 24,
  },
  liveTradersHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 12,
  },
  liveIndicator: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: '#00FF8820',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 10,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00FF88',
    marginRight: 4,
  },
  liveText: {
    color: '#00FF88',
    fontSize: 10,
    fontWeight: '600' as const,
  },
  liveTradersTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  liveTradersScroll: {
    paddingRight: 16,
  },
  liveTraderCard: {
    width: 100,
    backgroundColor: '#13131A',
    borderRadius: 12,
    padding: 12,
    marginRight: 10,
    alignItems: 'center' as const,
    borderWidth: 1,
    borderColor: '#1F1F2E',
  },
  liveTraderRank: {
    position: 'absolute' as const,
    top: 8,
    left: 8,
  },
  liveRankText: {
    fontSize: 10,
    color: '#FFD700',
    fontWeight: '700' as const,
  },
  liveTraderAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#00F0FF20',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginTop: 4,
  },
  liveAvatarText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#00F0FF',
  },
  liveTraderName: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    marginTop: 8,
    width: '100%',
    textAlign: 'center' as const,
  },
  liveTraderPlatform: {
    fontSize: 9,
    color: '#8B8B9A',
    marginTop: 2,
  },
  livePnlBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 6,
  },
  livePnlText: {
    fontSize: 11,
    fontWeight: '700' as const,
  },
  livePositionBadge: {
    backgroundColor: '#00F0FF20',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  livePositionText: {
    fontSize: 10,
    color: '#00F0FF',
    fontWeight: '600' as const,
  },
  liveFollowBtn: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: '#00F0FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 8,
    gap: 2,
  },
  liveFollowBtnText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: '#0A0A0F',
  },
  loadingLiveTraders: {
    width: 200,
    alignItems: 'center' as const,
    padding: 20,
  },
  liveStatsRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    backgroundColor: '#13131A',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  liveStatItem: {
    alignItems: 'center' as const,
  },
  liveStatLabel: {
    fontSize: 10,
    color: '#8B8B9A',
  },
  liveStatValue: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginTop: 2,
  },
  myPortfolioSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  emptyPortfolio: {
    alignItems: 'center' as const,
    padding: 32,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600' as const,
  },
  emptyDesc: {
    color: '#8B8B9A',
    fontSize: 14,
    marginTop: 8,
  },
};
