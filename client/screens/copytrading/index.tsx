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

const API_BASE = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || '';

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

export default function CopyTradingScreen() {
  const [activeTab, setActiveTab] = useState<'traders' | 'portfolio'>('traders');
  const [traders, setTraders] = useState<Trader[]>([]);
  const [portfolio, setPortfolio] = useState<FollowingPosition[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<'returns' | 'winRate' | 'followers'>('returns');
  const [searchQuery, setSearchQuery] = useState('');
  const [traderLiveData, setTraderLiveData] = useState<Record<string, any>>({});

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

  const fetchPortfolio = useCallback(async () => {
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

  const fetchTopTradersLiveData = useCallback(async () => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(`${API_BASE}/api/v1/copytrading/traders?sort=returns&limit=10`, {
        signal: controller.signal,
      });
      clearTimeout(timeout);
      
      if (response.ok) {
        const data = await response.json();
        const liveData: Record<string, any> = {};
        (data.data || []).forEach((trader: Trader) => {
          liveData[trader.id] = {
            todayPnl: trader.todayPnl,
            weeklyPnL: trader.weeklyPnL,
            lastTradeTime: trader.lastTradeTime,
          };
        });
        setTraderLiveData(liveData);
      }
    } catch (error) {
      console.log('获取实时数据失败');
    }
  }, []);

  useEffect(() => {
    fetchTraders();
  }, [fetchTraders]);

  useEffect(() => {
    if (activeTab === 'traders' && traders.length === 0) {
      fetchTraders();
    } else if (activeTab === 'portfolio') {
      fetchPortfolio();
      fetchTopTradersLiveData();
    }
  }, [activeTab]);

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

  const filteredTraders = traders.filter(trader =>
    trader.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trader.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const renderTradersTab = () => (
    <View style={{ padding: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E1E2E', borderRadius: 12, paddingHorizontal: 12, marginBottom: 16 }}>
        <Ionicons name="search" size={20} color="#8B8B9A" />
        <TextInput
          style={{ flex: 1, color: '#FFFFFF', paddingVertical: 12, paddingHorizontal: 8 }}
          placeholder="搜索交易员..."
          placeholderTextColor="#8B8B9A"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
        {[
          { key: 'returns', label: '累计收益' },
          { key: 'winRate', label: '胜率' },
          { key: 'followers', label: '跟单人数' },
        ].map(option => (
          <TouchableOpacity
            key={option.key}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              backgroundColor: sortBy === option.key ? '#00F0FF' : '#2A2A3E',
            }}
            onPress={() => setSortBy(option.key as any)}
          >
            <Text style={{ color: sortBy === option.key ? '#000' : '#8B8B9A', fontSize: 13 }}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading && traders.length === 0 ? (
        <View style={{ alignItems: 'center', paddingVertical: 40 }}>
          <ActivityIndicator size="large" color="#00F0FF" />
          <Text style={{ color: '#8B8B9A', marginTop: 12 }}>加载中...</Text>
        </View>
      ) : (
        filteredTraders.map(trader => (
          <TouchableOpacity
            key={trader.id}
            style={{ backgroundColor: '#1E1E2E', borderRadius: 16, padding: 16, marginBottom: 12 }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#2A2A3E', justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: '#00F0FF', fontSize: 18, fontWeight: 'bold' }}>
                  {trader.name.charAt(0)}
                </Text>
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>{trader.name}</Text>
                  {trader.verified && (
                    <View style={{ backgroundColor: '#00F0FF', borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2, marginLeft: 6 }}>
                      <Text style={{ color: '#000', fontSize: 10, fontWeight: 'bold' }}>认证</Text>
                    </View>
                  )}
                </View>
                <Text style={{ color: '#8B8B9A', fontSize: 12, marginTop: 2 }}>{trader.platform}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ color: '#00FF88', fontSize: 18, fontWeight: 'bold' }}>+{trader.returns.toFixed(1)}%</Text>
                <Text style={{ color: '#8B8B9A', fontSize: 11 }}>累计收益</Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#2A2A3E' }}>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: '#FFFFFF', fontSize: 14 }}>{trader.winRate.toFixed(1)}%</Text>
                <Text style={{ color: '#8B8B9A', fontSize: 11 }}>胜率</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: '#FFFFFF', fontSize: 14 }}>{trader.followers.toLocaleString()}</Text>
                <Text style={{ color: '#8B8B9A', fontSize: 11 }}>跟单人数</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: RISK_COLORS[trader.riskLevel] || '#8B8B9A', fontSize: 14 }}>{trader.riskLevel}</Text>
                <Text style={{ color: '#8B8B9A', fontSize: 11 }}>风险</Text>
              </View>
              <TouchableOpacity style={{ backgroundColor: '#00F0FF', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 6 }}>
                <Text style={{ color: '#000', fontSize: 13, fontWeight: '600' }}>跟单</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))
      )}
    </View>
  );

  const renderPortfolioTab = () => (
    <View style={{ padding: 16 }}>
      {portfolio.length === 0 ? (
        <View style={{ alignItems: 'center', paddingVertical: 60 }}>
          <Ionicons name="wallet-outline" size={64} color="#3A3A4E" />
          <Text style={{ color: '#8B8B9A', fontSize: 16, marginTop: 16 }}>暂无跟单记录</Text>
          <Text style={{ color: '#6B6B7B', fontSize: 13, marginTop: 8 }}>去跟单页面选择交易员开始跟单</Text>
        </View>
      ) : (
        <>
          <View style={{ backgroundColor: '#1E1E2E', borderRadius: 16, padding: 16, marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text style={{ color: '#8B8B9A', fontSize: 12 }}>我的实盘</Text>
                <Text style={{ color: '#FFFFFF', fontSize: 24, fontWeight: 'bold', marginTop: 4 }}>
                  ${portfolio.reduce((sum, p) => sum + p.amount + p.pnl, 0).toFixed(2)}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ color: '#00FF88', fontSize: 16 }}>
                  +${portfolio.reduce((sum, p) => sum + p.pnl, 0).toFixed(2)}
                </Text>
                <Text style={{ color: '#8B8B9A', fontSize: 11 }}>总收益</Text>
              </View>
            </View>
          </View>

          {portfolio.map(pos => (
            <View key={pos.id} style={{ backgroundColor: '#1E1E2E', borderRadius: 16, padding: 16, marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>{pos.traderName}</Text>
                  <Text style={{ color: '#8B8B9A', fontSize: 12, marginTop: 2 }}>{pos.traderPlatform}</Text>
                </View>
                <View style={{ backgroundColor: pos.pnl >= 0 ? '#00FF8815' : '#FF6B6B15', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}>
                  <Text style={{ color: pos.pnl >= 0 ? '#00FF88' : '#FF6B6B', fontWeight: '600' }}>
                    {pos.pnl >= 0 ? '+' : ''}{pos.pnlRate.toFixed(2)}%
                  </Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#2A2A3E' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#8B8B9A', fontSize: 11 }}>跟单金额</Text>
                  <Text style={{ color: '#FFFFFF', fontSize: 14, marginTop: 2 }}>${pos.amount}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#8B8B9A', fontSize: 11 }}>跟单收益</Text>
                  <Text style={{ color: pos.pnl >= 0 ? '#00FF88' : '#FF6B6B', fontSize: 14, marginTop: 2 }}>
                    {pos.pnl >= 0 ? '+' : ''}${pos.pnl.toFixed(2)}
                  </Text>
                </View>
                <TouchableOpacity style={{ backgroundColor: '#FF6B6B20', paddingHorizontal: 16, borderRadius: 8 }}>
                  <Text style={{ color: '#FF6B6B', fontSize: 13 }}>取消跟单</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </>
      )}
    </View>
  );

  return (
    <Screen>
      <View style={{ flex: 1, backgroundColor: '#0D0D15' }}>
        <View style={{ paddingTop: 50, paddingHorizontal: 16, paddingBottom: 16, backgroundColor: '#0D0D15' }}>
          <Text style={{ color: '#FFFFFF', fontSize: 28, fontWeight: 'bold' }}>一键跟单</Text>
          <Text style={{ color: '#8B8B9A', fontSize: 14, marginTop: 4 }}>复制顶尖交易员的策略</Text>
        </View>

        <View style={{ flexDirection: 'row', backgroundColor: '#1E1E2E', marginHorizontal: 16, borderRadius: 12, padding: 4 }}>
          <TouchableOpacity
            style={{ flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: activeTab === 'traders' ? '#00F0FF' : 'transparent' }}
            onPress={() => setActiveTab('traders')}
          >
            <Text style={{ textAlign: 'center', color: activeTab === 'traders' ? '#000' : '#8B8B9A', fontWeight: '600' }}>
              跟单交易员
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: activeTab === 'portfolio' ? '#00F0FF' : 'transparent' }}
            onPress={() => setActiveTab('portfolio')}
          >
            <Text style={{ textAlign: 'center', color: activeTab === 'portfolio' ? '#000' : '#8B8B9A', fontWeight: '600' }}>
              我的实盘
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00F0FF" />
          }
        >
          {activeTab === 'traders' ? renderTradersTab() : renderPortfolioTab()}
        </ScrollView>
      </View>
    </Screen>
  );
}
