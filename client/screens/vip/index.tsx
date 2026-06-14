import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { VIP_PLANS } from '@/utils/vipPlans';

const API_BASE = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9091';

export default function VipScreen() {
  const [activeTab, setActiveTab] = useState<'traders' | 'portfolio' | 'subscribe'>('traders');
  const [traders, setTraders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const router = useSafeRouter();

  // 获取交易员数据
  const fetchTraders = useCallback(async () => {
    setLoading(true);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(`${API_BASE}/api/v1/copytrading/traders`, {
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
  }, []);

  // 初始加载
  React.useEffect(() => {
    fetchTraders();
  }, [fetchTraders]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTraders();
  };

  // Tab 切换时自动加载数据
  React.useEffect(() => {
    if (activeTab === 'traders' && traders.length === 0) {
      fetchTraders();
    }
  }, [activeTab]);

  // 渲染一键跟单Tab
  const renderTradersTab = () => (
    <View style={styles.tabContent}>
      {loading && traders.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00F0FF" />
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      ) : (
        <>
          {traders.slice(0, 5).map((trader, index) => (
            <View key={trader.id || index} style={styles.traderCard}>
              <View style={styles.traderHeader}>
                <View style={styles.traderLeft}>
                  <View style={[styles.rankBadge, { 
                    backgroundColor: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : '#3A3A4A' 
                  }]}>
                    <Text style={styles.rankText}>{index + 1}</Text>
                  </View>
                  <View style={styles.traderInfo}>
                    <Text style={styles.traderName}>{trader.name}</Text>
                    <Text style={styles.traderPlatform}>{trader.platform}</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.followBtn} onPress={() => router.push('/vip/membership')}>
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
              </View>
            </View>
          ))}
        </>
      )}
    </View>
  );

  // 渲染我的实盘Tab
  const renderPortfolioTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.emptyState}>
        <Ionicons name="wallet-outline" size={64} color="#3A3A4A" />
        <Text style={styles.emptyTitle}>暂无跟单记录</Text>
        <Text style={styles.emptyDesc}>从上方选择交易员开始跟单</Text>
      </View>
    </View>
  );

  // 渲染会员订阅Tab - 使用共享配置
  const renderSubscribeTab = () => (
    <ScrollView 
      style={styles.subscribeContainer}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.subscribeContent}
    >
      <View style={styles.subscribeHeader}>
        <Text style={styles.subscribeTitle}>会员订阅</Text>
        <Text style={styles.subscribeSubtitle}>解锁全部高级功能</Text>
      </View>

      {VIP_PLANS.map((plan) => (
        <TouchableOpacity 
          key={plan.id} 
          style={[
            styles.planCard,
            plan.recommended && styles.planCardRecommended
          ]}
          onPress={() => router.push(`/vip/membership?plan=${plan.id}`)}
        >
          <View style={styles.planHeader}>
            <View>
              <Text style={styles.planName}>{plan.name}</Text>
              <Text style={styles.planSubtitle}>{plan.subtitle}</Text>
            </View>
            {plan.recommended && (
              <View style={[styles.recommendedBadge, { backgroundColor: plan.color + '20' }]}>
                <Text style={[styles.recommendedText, { color: plan.color }]}>推荐</Text>
              </View>
            )}
          </View>
          <View style={styles.planPrice}>
            <Text style={styles.priceCurrency}>$</Text>
            <Text style={[styles.priceAmount, { color: plan.color }]}>{plan.price.monthly}</Text>
            <Text style={styles.pricePeriod}>/月</Text>
          </View>
          <View style={styles.planFeatures}>
            {plan.features.filter(f => f.enabled).map((feature, i) => (
              <View key={i} style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={16} color={plan.color} />
                <Text style={styles.featureText}>{feature.text}</Text>
              </View>
            ))}
          </View>
          <View style={[styles.planButton, plan.recommended && { backgroundColor: plan.color }]}>
            <Text style={[styles.planButtonText, plan.recommended && { color: '#0A0A0F' }]}>
              查看详情
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  return (
    <Screen>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>会员中心</Text>
          <Text style={styles.headerSubtitle}>
            {activeTab === 'traders' && `${traders.length} 位顶尖交易员`}
            {activeTab === 'portfolio' && '我的跟单实盘'}
            {activeTab === 'subscribe' && '解锁高级会员权益'}
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
          <TouchableOpacity 
            style={[styles.tabItem, activeTab === 'subscribe' && styles.tabItemActive]}
            onPress={() => setActiveTab('subscribe')}
          >
            <Ionicons 
              name="diamond" 
              size={20} 
              color={activeTab === 'subscribe' ? '#00F0FF' : '#8B8B9A'} 
            />
            <Text style={[styles.tabText, activeTab === 'subscribe' && styles.tabTextActive]}>
              会员订阅
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === 'traders' && renderTradersTab()}
        {activeTab === 'portfolio' && renderPortfolioTab()}
        {activeTab === 'subscribe' && renderSubscribeTab()}
      </View>
    </Screen>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  header: {
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
    color: '#8B8B9A',
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
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  rankText: {
    color: '#0A0A0F',
    fontSize: 14,
    fontWeight: '700' as const,
  },
  traderInfo: {
    marginLeft: 12,
    flex: 1,
  },
  traderName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600' as const,
  },
  traderPlatform: {
    color: '#8B8B9A',
    fontSize: 12,
    marginTop: 2,
  },
  followBtn: {
    backgroundColor: '#00F0FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
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
    fontSize: 18,
    fontWeight: '700' as const,
  },
  dataLabel: {
    color: '#8B8B9A',
    fontSize: 11,
    marginTop: 4,
  },
  dataDivider: {
    width: 1,
    backgroundColor: '#1F1F2E',
    marginHorizontal: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600' as const,
    marginTop: 16,
  },
  emptyDesc: {
    color: '#8B8B9A',
    fontSize: 14,
    marginTop: 8,
  },
  subscribeContainer: {
    flex: 1,
  },
  subscribeContent: {
    padding: 16,
    paddingBottom: 60,
  },
  subscribeHeader: {
    alignItems: 'center' as const,
    marginBottom: 24,
  },
  subscribeTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  subscribeSubtitle: {
    fontSize: 14,
    color: '#8B8B9A',
    marginTop: 4,
  },
  planCard: {
    backgroundColor: '#13131A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1F1F2E',
  },
  planCardRecommended: {
    borderColor: '#00F0FF',
    borderWidth: 2,
  },
  planHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'flex-start' as const,
    marginBottom: 8,
  },
  planName: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  planSubtitle: {
    fontSize: 12,
    color: '#8B8B9A',
    marginTop: 2,
  },
  recommendedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  recommendedText: {
    fontSize: 11,
    fontWeight: '700' as const,
  },
  planPrice: {
    flexDirection: 'row' as const,
    alignItems: 'baseline' as const,
    marginBottom: 10,
  },
  priceCurrency: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '600' as const,
  },
  priceAmount: {
    fontSize: 36,
    fontWeight: '700' as const,
  },
  pricePeriod: {
    fontSize: 14,
    color: '#8B8B9A',
    marginLeft: 4,
  },
  planFeatures: {
    marginBottom: 10,
  },
  featureItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 4,
  },
  featureText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 8,
  },
  planButton: {
    backgroundColor: '#1F1F2E',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center' as const,
  },
  planButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600' as const,
  },
};
