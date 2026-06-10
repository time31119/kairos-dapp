import { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { useFocusEffect } from 'expo-router';

const { width } = Dimensions.get('window');

// Mock trader data
const TRADER_DATA = {
  id: 'trader_001',
  name: '币神张三',
  avatar: null,
  tags: ['连胜中', '高胜率', '币安认证'],
  bio: '专注现货趋势交易，擅长捕捉主流币阶段性机会，管理资金超500万U',
  followers: 2341,
  totalYield: 127.5,
  winRate: 82,
  totalTrades: 156,
  avgHoldingTime: '3-5天',
  riskLevel: '中风险',
  joinDate: '2024-01',
  recentPerformance: [
    { date: '01-18', action: '做多', pair: 'BTC/USDT', yield: 5.2, status: 'win' },
    { date: '01-15', action: '做多', pair: 'ETH/USDT', yield: 8.7, status: 'win' },
    { date: '01-12', action: '做空', pair: 'SOL/USDT', yield: -2.1, status: 'lose' },
    { date: '01-08', action: '做多', pair: 'BNB/USDT', yield: 12.3, status: 'win' },
    { date: '01-05', action: '做多', pair: 'BTC/USDT', yield: 4.8, status: 'win' },
    { date: '01-02', action: '做空', pair: 'AVAX/USDT', yield: 6.5, status: 'win' },
  ],
  monthlyStats: [
    { month: '1月', yield: 15.2 },
    { month: '2月', yield: 8.7 },
    { month: '3月', yield: -3.2 },
    { month: '4月', yield: 22.5 },
    { month: '5月', yield: 18.3 },
    { month: '6月', yield: 12.1 },
  ],
  assets: 5234000,
  profitSharing: '10%',
};

// Mock historical data for my follow positions
const MY_POSITIONS = [
  {
    id: 'pos_001',
    traderId: 'trader_001',
    traderName: '币神张三',
    pair: 'BTC/USDT',
    entryPrice: 67200,
    currentPrice: 68500,
    pnl: 2.13,
    pnlAmount: 213,
    ratio: 0.3,
    openTime: '01-18 14:30',
    status: 'active',
  },
  {
    id: 'pos_002',
    traderId: 'trader_002',
    traderName: '量化小王',
    pair: 'ETH/USDT',
    entryPrice: 3450,
    currentPrice: 3520,
    pnl: 1.45,
    pnlAmount: 145,
    ratio: 0.5,
    openTime: '01-16 09:15',
    status: 'active',
  },
];

// Mock history data
const HISTORY_DATA = [
  {
    id: 'hist_001',
    traderId: 'trader_001',
    traderName: '币神张三',
    pair: 'BTC/USDT',
    entryPrice: 64200,
    exitPrice: 67800,
    pnl: 5.61,
    pnlAmount: 561,
    closeTime: '01-15 22:00',
    status: 'win',
  },
  {
    id: 'hist_002',
    traderId: 'trader_001',
    traderName: '币神张三',
    pair: 'ETH/USDT',
    entryPrice: 3580,
    exitPrice: 3890,
    pnl: 8.66,
    pnlAmount: 866,
    closeTime: '01-12 18:30',
    status: 'win',
  },
  {
    id: 'hist_003',
    traderId: 'trader_002',
    traderName: '量化小王',
    pair: 'BNB/USDT',
    entryPrice: 420,
    exitPrice: 398,
    pnl: -5.24,
    pnlAmount: -524,
    closeTime: '01-10 15:45',
    status: 'lose',
  },
];

// Reusable Card Component
function NeonCard({ children, style }: { children: React.ReactNode; style?: any }) {
  return (
    <View
      style={[
        {
          backgroundColor: 'rgba(10, 10, 15, 0.9)',
          borderRadius: 16,
          borderWidth: 1,
          borderColor: 'rgba(0, 240, 255, 0.3)',
          padding: 16,
          marginBottom: 12,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

// Stat Item Component
function StatItem({ label, value, color = '#E0E0E0' }: { label: string; value: string; color?: string }) {
  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <Text style={{ color: '#666', fontSize: 11 }}>{label}</Text>
      <Text style={{ color, fontSize: 18, fontWeight: 'bold', marginTop: 4 }}>{value}</Text>
    </View>
  );
}

// Trade Item Component
function TradeItem({
  trade,
}: {
  trade: { date: string; action: string; pair: string; yield: number; status: string };
}) {
  const isWin = trade.status === 'win';
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
      }}
    >
      <View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={{ color: isWin ? '#00FF88' : '#FF4444', fontSize: 13 }}>
            {isWin ? '↑ 做多' : '↓ 做空'}
          </Text>
          <Text style={{ color: '#FFF', fontSize: 14 }}>{trade.pair}</Text>
        </View>
        <Text style={{ color: '#666', fontSize: 11, marginTop: 2 }}>{trade.date}</Text>
      </View>
      <Text style={{ color: isWin ? '#00FF88' : '#FF4444', fontSize: 16, fontWeight: 'bold' }}>
        {isWin ? '+' : ''}{trade.yield.toFixed(1)}%
      </Text>
    </View>
  );
}

// Follow Button Component
function FollowButton({ following, onPress }: { following: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: following ? 'rgba(0, 240, 255, 0.15)' : '#00F0FF',
        borderWidth: 1,
        borderColor: '#00F0FF',
        borderRadius: 20,
        paddingHorizontal: 24,
        paddingVertical: 10,
      }}
    >
      <Text style={{ color: following ? '#00F0FF' : '#000', fontWeight: 'bold', fontSize: 14 }}>
        {following ? '已跟单' : '一键跟单'}
      </Text>
    </TouchableOpacity>
  );
}

// Page Components
export default function CopyTradingPage() {
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'trader' | 'my' | 'history'>('trader');

  useFocusEffect(
    useCallback(() => {
      // Refresh data on focus
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const renderTraderTab = () => (
    <ScrollView
      style={{ flex: 1 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00F0FF" />
      }
    >
      {/* Header Card */}
      <NeonCard>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: 'rgba(0, 240, 255, 0.2)',
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 2,
              borderColor: '#00F0FF',
            }}
          >
            <Text style={{ fontSize: 28, color: '#00F0FF' }}>神</Text>
          </View>
          <View style={{ marginLeft: 16, flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ color: '#FFF', fontSize: 20, fontWeight: 'bold' }}>
                {TRADER_DATA.name}
              </Text>
              {TRADER_DATA.tags.map((tag) => (
                <View
                  key={tag}
                  style={{
                    backgroundColor:
                      tag === '连胜中' ? 'rgba(0, 255, 136, 0.2)' : 'rgba(0, 240, 255, 0.2)',
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: 10,
                  }}
                >
                  <Text
                    style={{
                      color: tag === '连胜中' ? '#00FF88' : '#00F0FF',
                      fontSize: 10,
                    }}
                  >
                    {tag}
                  </Text>
                </View>
              ))}
            </View>
            <Text style={{ color: '#888', fontSize: 12, marginTop: 4 }}>{TRADER_DATA.bio}</Text>
          </View>
        </View>

        {/* Stats */}
        <View
          style={{
            flexDirection: 'row',
            marginTop: 20,
            paddingTop: 16,
            borderTopWidth: 1,
            borderTopColor: 'rgba(255,255,255,0.1)',
          }}
        >
          <StatItem label="总收益率" value={`+${TRADER_DATA.totalYield}%`} color="#00FF88" />
          <StatItem label="胜率" value={`${TRADER_DATA.winRate}%`} color="#00F0FF" />
          <StatItem label="跟单人数" value={TRADER_DATA.followers.toLocaleString()} />
        </View>

        <View
          style={{
            flexDirection: 'row',
            marginTop: 12,
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: 'rgba(255,255,255,0.1)',
          }}
        >
          <StatItem label="累计交易" value={`${TRADER_DATA.totalTrades}笔`} />
          <StatItem label="平均持仓" value={TRADER_DATA.avgHoldingTime} />
          <StatItem label="风控等级" value={TRADER_DATA.riskLevel} color="#FFD700" />
        </View>
      </NeonCard>

      {/* Quick Action */}
      <NeonCard style={{ borderColor: 'rgba(255, 215, 0, 0.3)' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ color: '#FFF', fontSize: 16, fontWeight: 'bold' }}>立即跟单</Text>
            <Text style={{ color: '#666', fontSize: 12, marginTop: 4 }}>
              跟单比例 10-50%，设置您的跟单参数
            </Text>
          </View>
          <Link href="/copytrading/settings">
            <TouchableOpacity
              style={{
                backgroundColor: '#FFD700',
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 20,
              }}
            >
              <Text style={{ color: '#000', fontWeight: 'bold', fontSize: 14 }}>设置跟单</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </NeonCard>

      {/* Monthly Performance */}
      <NeonCard>
        <Text style={{ color: '#FFF', fontSize: 16, fontWeight: 'bold', marginBottom: 16 }}>
          月度收益
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {TRADER_DATA.monthlyStats.map((stat) => (
            <View key={stat.month} style={{ alignItems: 'center' }}>
              <View
                style={{
                  width: 8,
                  height: 40,
                  backgroundColor:
                    stat.yield >= 0 ? 'rgba(0, 255, 136, 0.3)' : 'rgba(255, 68, 68, 0.3)',
                  borderRadius: 4,
                  marginBottom: 6,
                }}
              />
              <Text style={{ color: '#666', fontSize: 10 }}>{stat.month}</Text>
              <Text
                style={{
                  color: stat.yield >= 0 ? '#00FF88' : '#FF4444',
                  fontSize: 11,
                  fontWeight: 'bold',
                }}
              >
                {stat.yield >= 0 ? '+' : ''}{stat.yield.toFixed(0)}%
              </Text>
            </View>
          ))}
        </View>
      </NeonCard>

      {/* Recent Trades */}
      <NeonCard>
        <Text style={{ color: '#FFF', fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>
          最近交易
        </Text>
        {TRADER_DATA.recentPerformance.map((trade, index) => (
          <TradeItem key={index} trade={trade} />
        ))}
      </NeonCard>

      <View style={{ height: 100 }} />
    </ScrollView>
  );

  const renderMyPositionsTab = () => (
    <ScrollView
      style={{ flex: 1 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00F0FF" />
      }
    >
      <NeonCard style={{ borderColor: 'rgba(0, 255, 136, 0.3)' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ color: '#666', fontSize: 12 }}>总跟单收益</Text>
            <Text style={{ color: '#00FF88', fontSize: 28, fontWeight: 'bold' }}>+358 U</Text>
            <Text style={{ color: '#00FF88', fontSize: 12 }}>+1.89%</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ color: '#666', fontSize: 12 }}>活跃跟单</Text>
            <Text style={{ color: '#FFF', fontSize: 24, fontWeight: 'bold' }}>2</Text>
            <Text style={{ color: '#666', fontSize: 12 }}>交易员</Text>
          </View>
        </View>
      </NeonCard>

      {MY_POSITIONS.map((pos) => (
        <NeonCard key={pos.id}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={{ color: '#FFF', fontSize: 16, fontWeight: 'bold' }}>{pos.pair}</Text>
                <View
                  style={{
                    backgroundColor: 'rgba(0, 240, 255, 0.2)',
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                    borderRadius: 4,
                  }}
                >
                  <Text style={{ color: '#00F0FF', fontSize: 10 }}>×{pos.ratio}</Text>
                </View>
              </View>
              <Text style={{ color: '#666', fontSize: 12, marginTop: 4 }}>
                跟单 {pos.traderName} · 开仓 {pos.openTime}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ color: '#00FF88', fontSize: 18, fontWeight: 'bold' }}>
                +{pos.pnl.toFixed(2)}%
              </Text>
              <Text style={{ color: '#666', fontSize: 12 }}>+{pos.pnlAmount} U</Text>
            </View>
          </View>
          <View
            style={{
              flexDirection: 'row',
              marginTop: 12,
              paddingTop: 12,
              borderTopWidth: 1,
              borderTopColor: 'rgba(255,255,255,0.1)',
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#666', fontSize: 10 }}>入场价</Text>
              <Text style={{ color: '#FFF', fontSize: 13 }}>{pos.entryPrice.toLocaleString()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#666', fontSize: 10 }}>当前价</Text>
              <Text style={{ color: '#FFF', fontSize: 13 }}>{pos.currentPrice.toLocaleString()}</Text>
            </View>
            <TouchableOpacity
              style={{
                backgroundColor: 'rgba(255, 68, 68, 0.2)',
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 6,
              }}
            >
              <Text style={{ color: '#FF4444', fontSize: 12 }}>止损</Text>
            </TouchableOpacity>
          </View>
        </NeonCard>
      ))}

      <View style={{ height: 100 }} />
    </ScrollView>
  );

  const renderHistoryTab = () => (
    <ScrollView
      style={{ flex: 1 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00F0FF" />
      }
    >
      <NeonCard style={{ borderColor: 'rgba(0, 255, 136, 0.3)' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ color: '#666', fontSize: 12 }}>累计跟单收益</Text>
            <Text style={{ color: '#00FF88', fontSize: 24, fontWeight: 'bold' }}>+903 U</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: '#666', fontSize: 12 }}>胜率</Text>
            <Text style={{ color: '#00F0FF', fontSize: 20, fontWeight: 'bold' }}>67%</Text>
          </View>
        </View>
      </NeonCard>

      {HISTORY_DATA.map((item) => (
        <NeonCard key={item.id}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={{ color: '#FFF', fontSize: 15, fontWeight: 'bold' }}>{item.pair}</Text>
                <View
                  style={{
                    backgroundColor:
                      item.status === 'win'
                        ? 'rgba(0, 255, 136, 0.2)'
                        : 'rgba(255, 68, 68, 0.2)',
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                    borderRadius: 4,
                  }}
                >
                  <Text
                    style={{
                      color: item.status === 'win' ? '#00FF88' : '#FF4444',
                      fontSize: 10,
                    }}
                  >
                    {item.status === 'win' ? '盈利' : '亏损'}
                  </Text>
                </View>
              </View>
              <Text style={{ color: '#666', fontSize: 12, marginTop: 4 }}>
                {item.traderName} · 平仓 {item.closeTime}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text
                style={{
                  color: item.status === 'win' ? '#00FF88' : '#FF4444',
                  fontSize: 18,
                  fontWeight: 'bold',
                }}
              >
                {item.status === 'win' ? '+' : ''}{item.pnl.toFixed(2)}%
              </Text>
              <Text
                style={{ color: item.status === 'win' ? '#666' : '#FF4444', fontSize: 12 }}
              >
                {item.status === 'win' ? '+' : ''}{item.pnlAmount} U
              </Text>
            </View>
          </View>
          <View
            style={{
              flexDirection: 'row',
              marginTop: 12,
              paddingTop: 12,
              borderTopWidth: 1,
              borderTopColor: 'rgba(255,255,255,0.1)',
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#666', fontSize: 10 }}>入场价</Text>
              <Text style={{ color: '#FFF', fontSize: 13 }}>{item.entryPrice.toLocaleString()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#666', fontSize: 10 }}>出场价</Text>
              <Text style={{ color: '#FFF', fontSize: 13 }}>{item.exitPrice.toLocaleString()}</Text>
            </View>
          </View>
        </NeonCard>
      ))}

      <View style={{ height: 100 }} />
    </ScrollView>
  );

  return (
    <Screen>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: 'rgba(10, 10, 15, 0.95)',
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(0, 240, 255, 0.2)',
        }}
      >
        <Link href="/">
          <TouchableOpacity style={{ padding: 8, marginRight: 8 }}>
            <Text style={{ color: '#00F0FF', fontSize: 20 }}>←</Text>
          </TouchableOpacity>
        </Link>
        <Text style={{ color: '#FFF', fontSize: 18, fontWeight: 'bold', flex: 1 }}>
          一键跟单
        </Text>
        <TouchableOpacity style={{ padding: 8 }}>
          <Ionicons name="settings-outline" size={22} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Tab Bar */}
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: 'rgba(10, 10, 15, 0.95)',
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(255, 255, 255, 0.1)',
        }}
      >
        {[
          { key: 'trader', label: '交易员' },
          { key: 'my', label: '我的跟单' },
          { key: 'history', label: '跟单记录' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key as any)}
            style={{
              flex: 1,
              paddingVertical: 14,
              alignItems: 'center',
              borderBottomWidth: 2,
              borderBottomColor: activeTab === tab.key ? '#00F0FF' : 'transparent',
            }}
          >
            <Text
              style={{
                color: activeTab === tab.key ? '#00F0FF' : '#666',
                fontSize: 14,
                fontWeight: activeTab === tab.key ? 'bold' : 'normal',
              }}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      {activeTab === 'trader' && renderTraderTab()}
      {activeTab === 'my' && renderMyPositionsTab()}
      {activeTab === 'history' && renderHistoryTab()}
    </Screen>
  );
}
