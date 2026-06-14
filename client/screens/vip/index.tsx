import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { Screen } from '@/components/Screen';

const EXPO_PUBLIC_BACKEND_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9091';

// 套餐数据
const PLANS = [
  {
    id: 'basic',
    name: '基础版',
    price: 99,
    period: '月',
    features: ['6大赛道', '30条筛选', '每日推送'],
    color: '#8B8B9A',
    recommended: false,
  },
  {
    id: 'pro',
    name: '专业版',
    price: 199,
    period: '月',
    features: ['全部赛道', '无限筛选', '实时推送', '基础跟单'],
    color: '#00F0FF',
    recommended: true,
  },
  {
    id: 'vip',
    name: '尊享版',
    price: 299,
    period: '月',
    features: ['高级分析', '智能跟单', '完整API'],
    color: '#FFD700',
    recommended: false,
  },
];

// 权益数据
const BENEFITS = [
  { icon: 'trending-up', text: '实时行情' },
  { icon: 'filter', text: '智能筛选' },
  { icon: 'copy', text: '跟单交易' },
  { icon: 'headset', text: '专属客服' },
];

export default function VipScreen() {
  const router = useSafeRouter();
  const [activeTab, setActiveTab] = useState<'traders' | 'portfolio' | 'subscribe'>('traders');
  const [traders, setTraders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTrader, setSelectedTrader] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // 获取交易员数据
  const fetchTraders = useCallback(async () => {
    try {
      const res = await fetch(`${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/copytrading/traders`);
      const data = await res.json();
      if (data.data) {
        setTraders(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch traders:', err);
    }
  }, []);

  useEffect(() => {
    fetchTraders();
  }, [fetchTraders]);

  // 刷新
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTraders();
    setRefreshing(false);
  };

  // 跟单
  const handleFollow = (trader: any) => {
    setSelectedTrader(trader);
    setShowModal(true);
  };

  // 渲染一键跟单Tab
  const renderTradersTab = () => (
    <View style={styles.tabContent}>
      {traders.slice(0, 5).map((trader, index) => (
        <View key={trader.id || index} style={styles.traderCard}>
          {/* 头部：排名 + 头像 + 名称 */}
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
            <TouchableOpacity style={styles.followBtn} onPress={() => handleFollow(trader)}>
              <Text style={styles.followBtnText}>一键跟单</Text>
            </TouchableOpacity>
          </View>

          {/* 数据网格 */}
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
              <Text style={styles.dataValue}>{trader.followers?.toLocaleString()}</Text>
              <Text style={styles.dataLabel}>跟单人数</Text>
            </View>
          </View>
        </View>
      ))}
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

  // 渲染会员订阅Tab
  const renderSubscribeTab = () => (
    <ScrollView 
      style={styles.subscribeContainer}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.subscribeContent}
    >
      {/* 升级引导 */}
      <View style={styles.subscribeHeader}>
        <Text style={styles.subscribeTitle}>会员订阅</Text>
        <Text style={styles.subscribeDesc}>解锁全部高级功能</Text>
      </View>

      {/* 套餐列表 */}
      {PLANS.map((plan) => (
        <View key={plan.id} style={[
          styles.planCard,
          plan.recommended && styles.planCardHighlight
        ]}>
          {plan.recommended && (
            <View style={styles.recommendedBadge}>
              <Text style={styles.recommendedText}>推荐</Text>
            </View>
          )}
          
          <View style={styles.planHeader}>
            <Text style={styles.planName}>{plan.name}</Text>
            <View style={styles.planPriceRow}>
              <Text style={[styles.planPrice, { color: plan.color }]}>${plan.price}</Text>
              <Text style={styles.planPeriod}>/{plan.period}</Text>
            </View>
          </View>

          <View style={styles.planFeatures}>
            {plan.features.map((feature, idx) => (
              <View key={idx} style={styles.featureRow}>
                <View style={[styles.featureDot, { backgroundColor: plan.color }]} />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity 
            style={[styles.planBtn, { backgroundColor: plan.recommended ? plan.color : '#2A2A3A' }]}
          >
            <Text style={[styles.planBtnText, { color: plan.recommended ? '#0A0A0F' : '#8B8B9A' }]}>
              立即订阅
            </Text>
          </TouchableOpacity>
        </View>
      ))}

      {/* 权益保障 */}
      <View style={styles.benefitsSection}>
        <Text style={styles.benefitsTitle}>会员权益</Text>
        <View style={styles.benefitsGrid}>
          {BENEFITS.map((benefit, idx) => (
            <View key={idx} style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={24} color="#00F0FF" />
              <Text style={styles.benefitText}>{benefit.text}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 支付方式 */}
      <View style={styles.paymentSection}>
        <Text style={styles.paymentTitle}>支付方式</Text>
        <View style={styles.paymentMethods}>
          <TouchableOpacity style={styles.paymentBtn}>
            <Text style={styles.paymentBtnText}>USDT</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.paymentBtn}>
            <Text style={styles.paymentBtnText}>ETH</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.paymentBtn}>
            <Text style={styles.paymentBtnText}>银行卡</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 安全保障 */}
      <View style={styles.guaranteeSection}>
        <Ionicons name="shield-checkmark" size={16} color="#00FF88" />
        <Text style={styles.guaranteeText}>7天无理由退款 · 安全加密支付</Text>
      </View>
    </ScrollView>
  );

  // 跟单确认弹窗
  const renderFollowModal = () => {
    if (!showModal || !selectedTrader) return null;

    return (
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={styles.modalBackdrop} onPress={() => setShowModal(false)} />
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>确认跟单</Text>
          
          <View style={styles.modalTraderInfo}>
            <Text style={styles.modalTraderName}>{selectedTrader.name}</Text>
            <Text style={styles.modalTraderPlatform}>{selectedTrader.platform}</Text>
          </View>

          <View style={styles.modalStats}>
            <View style={styles.modalStatItem}>
              <Text style={styles.modalStatValue}>+{selectedTrader.returns?.toFixed(1)}%</Text>
              <Text style={styles.modalStatLabel}>累计收益</Text>
            </View>
            <View style={styles.modalStatItem}>
              <Text style={styles.modalStatValue}>{selectedTrader.winRate?.toFixed(1)}%</Text>
              <Text style={styles.modalStatLabel}>胜率</Text>
            </View>
          </View>

          <View style={styles.modalWarning}>
            <Ionicons name="warning" size={18} color="#FFD700" />
            <Text style={styles.modalWarningText}>跟单有风险，投资需谨慎</Text>
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowModal(false)}>
              <Text style={styles.modalCancelText}>取消</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalConfirmBtn} onPress={() => setShowModal(false)}>
              <Text style={styles.modalConfirmText}>确认跟单</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <Screen>
      {/* 顶部导航 */}
      <View style={styles.topNav}>
        <TouchableOpacity 
          style={[styles.topNavItem, activeTab === 'traders' && styles.topNavItemActive]}
          onPress={() => setActiveTab('traders')}
        >
          <Ionicons name="people" size={20} color={activeTab === 'traders' ? '#00F0FF' : '#8B8B9A'} />
          <Text style={[styles.topNavText, activeTab === 'traders' && styles.topNavTextActive]}>一键跟单</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.topNavItem, activeTab === 'portfolio' && styles.topNavItemActive]}
          onPress={() => setActiveTab('portfolio')}
        >
          <Ionicons name="bar-chart" size={20} color={activeTab === 'portfolio' ? '#00F0FF' : '#8B8B9A'} />
          <Text style={[styles.topNavText, activeTab === 'portfolio' && styles.topNavTextActive]}>我的实盘</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.topNavItem, activeTab === 'subscribe' && styles.topNavItemActive]}
          onPress={() => setActiveTab('subscribe')}
        >
          <Ionicons name="diamond" size={20} color={activeTab === 'subscribe' ? '#00F0FF' : '#8B8B9A'} />
          <Text style={[styles.topNavText, activeTab === 'subscribe' && styles.topNavTextActive]}>会员订阅</Text>
        </TouchableOpacity>
      </View>

      {/* 内容区 */}
      {activeTab === 'traders' && renderTradersTab()}
      {activeTab === 'portfolio' && renderPortfolioTab()}
      {activeTab === 'subscribe' && renderSubscribeTab()}

      {/* 跟单弹窗 */}
      {renderFollowModal()}
    </Screen>
  );
}

const styles = StyleSheet.create({
  // 顶部导航
  topNav: {
    flexDirection: 'row',
    backgroundColor: '#13131A',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  topNavItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  topNavItemActive: {
    backgroundColor: '#1F1F2E',
  },
  topNavText: {
    fontSize: 13,
    color: '#8B8B9A',
    fontWeight: '500',
  },
  topNavTextActive: {
    color: '#00F0FF',
  },

  // Tab内容
  tabContent: {
    flex: 1,
  },

  // 交易员卡片
  traderCard: {
    backgroundColor: '#13131A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  traderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  traderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0A0A0F',
  },
  traderInfo: {
    flex: 1,
  },
  traderName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  traderPlatform: {
    fontSize: 12,
    color: '#8B8B9A',
    marginTop: 2,
  },
  followBtn: {
    backgroundColor: '#00F0FF20',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00F0FF40',
  },
  followBtnText: {
    fontSize: 12,
    color: '#00F0FF',
    fontWeight: '600',
  },

  // 数据网格
  dataGrid: {
    flexDirection: 'row',
    backgroundColor: '#1A1A28',
    borderRadius: 12,
    padding: 12,
  },
  dataItem: {
    flex: 1,
    alignItems: 'center',
  },
  dataValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFD700',
  },
  dataLabel: {
    fontSize: 11,
    color: '#8B8B9A',
    marginTop: 4,
  },
  dataDivider: {
    width: 1,
    backgroundColor: '#2A2A3A',
    marginHorizontal: 8,
  },

  // 空状态
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
  },
  emptyDesc: {
    fontSize: 14,
    color: '#8B8B9A',
    marginTop: 8,
  },

  // 订阅容器
  subscribeContainer: {
    flex: 1,
  },
  subscribeContent: {
    paddingBottom: 24,
  },

  // 订阅头部
  subscribeHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  subscribeTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  subscribeDesc: {
    fontSize: 14,
    color: '#8B8B9A',
    marginTop: 6,
  },

  // 套餐卡片
  planCard: {
    backgroundColor: '#13131A',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2A2A3A',
  },
  planCardHighlight: {
    borderColor: '#00F0FF40',
    backgroundColor: '#0F1F28',
  },
  recommendedBadge: {
    position: 'absolute',
    top: -10,
    right: 16,
    backgroundColor: '#00F0FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
  },
  recommendedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0A0A0F',
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  planName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  planPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  planPrice: {
    fontSize: 28,
    fontWeight: '800',
  },
  planPeriod: {
    fontSize: 14,
    color: '#8B8B9A',
  },

  // 权益列表
  planFeatures: {
    marginBottom: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 10,
  },
  featureText: {
    fontSize: 14,
    color: '#FFFFFF',
  },

  // 订阅按钮
  planBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  planBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },

  // 权益区域
  benefitsSection: {
    marginTop: 8,
    padding: 20,
    backgroundColor: '#13131A',
    borderRadius: 16,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  benefitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  benefitItem: {
    width: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  benefitText: {
    fontSize: 14,
    color: '#FFFFFF',
  },

  // 支付方式
  paymentSection: {
    marginTop: 16,
    padding: 20,
    backgroundColor: '#13131A',
    borderRadius: 16,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  paymentMethods: {
    flexDirection: 'row',
    gap: 12,
  },
  paymentBtn: {
    flex: 1,
    backgroundColor: '#1A1A28',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A2A3A',
  },
  paymentBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // 保障
  guaranteeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
  },
  guaranteeText: {
    fontSize: 13,
    color: '#8B8B9A',
  },

  // 弹窗
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalContent: {
    backgroundColor: '#1A1A28',
    borderRadius: 20,
    padding: 24,
    width: '85%',
    maxWidth: 340,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalTraderInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTraderName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalTraderPlatform: {
    fontSize: 14,
    color: '#8B8B9A',
    marginTop: 4,
  },
  modalStats: {
    flexDirection: 'row',
    backgroundColor: '#13131A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  modalStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  modalStatValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFD700',
  },
  modalStatLabel: {
    fontSize: 12,
    color: '#8B8B9A',
    marginTop: 4,
  },
  modalWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFD70015',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  modalWarningText: {
    fontSize: 13,
    color: '#FFD700',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: '#2A2A3A',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalConfirmBtn: {
    flex: 1,
    backgroundColor: '#00F0FF',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalConfirmText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0A0A0F',
  },
});
