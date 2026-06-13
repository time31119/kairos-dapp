/**
 * 付费订阅页面
 * 会员权益、订阅周期、支付方式
 */

import { Screen } from '@/components/Screen';
import { Stack } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons, FontAwesome6 } from '@expo/vector-icons';
import { useState } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';

const colors = {
  background: '#0A0A0F',
  card: '#12121A',
  cardAlt: '#1A1A24',
  neonCyan: '#00F0FF',
  neonPurple: '#BF00FF',
  neonGreen: '#00FF88',
  neonYellow: '#FFD700',
  neonRed: '#FF4444',
  text: '#FFFFFF',
  textSecondary: '#8A8A9A',
  muted: '#4A4A5A',
  border: '#2A2A3A',
};

// 会员等级配置
const VIP_LEVELS = [
  {
    id: 'basic',
    name: '基础版',
    subtitle: '新手入门',
    color: '#8B9DC3',
    icon: 'leaf-outline',
    price: { month: 39.9, quarter: 99.9, year: 359.9 },
    features: [
      { text: '6大赛道行情', enabled: true },
      { text: '30条筛选条件', enabled: true },
      { text: '每日资讯推送', enabled: true },
      { text: '技术分析工具', enabled: false },
      { text: '跟单功能', enabled: false },
      { text: 'API接口访问', enabled: false },
    ],
    tag: null,
  },
  {
    id: 'pro',
    name: '专业版',
    subtitle: '交易必备',
    color: '#00F0FF',
    icon: 'trending-up-outline',
    price: { month: 69.9, quarter: 179.9, year: 629.9 },
    features: [
      { text: '全部赛道行情', enabled: true },
      { text: '无限筛选条件', enabled: true },
      { text: '实时行情推送', enabled: true },
      { text: '技术分析工具', enabled: true },
      { text: '基础跟单功能', enabled: true },
      { text: 'API接口访问', enabled: false },
    ],
    tag: '推荐',
  },
  {
    id: 'vip',
    name: '尊享版',
    subtitle: '机构级服务',
    color: '#FFD700',
    icon: 'diamond-outline',
    price: { month: 199.9, quarter: 539.9, year: 1799.9 },
    features: [
      { text: '全部赛道行情', enabled: true },
      { text: '无限筛选条件', enabled: true },
      { text: '实时行情推送', enabled: true },
      { text: '高级技术分析', enabled: true },
      { text: '智能跟单功能', enabled: true },
      { text: '完整API接口', enabled: true },
    ],
    tag: '最佳价值',
  },
];

// 支付方式
const PAYMENT_METHODS = [
  { id: 'usdt', name: 'USDT', icon: 'logo-usd', color: '#26A17B' },
  { id: 'eth', name: 'ETH', icon: 'logo-ethereum', color: '#627EEA' },
  { id: 'card', name: '信用卡', icon: 'card-outline', color: '#FF6B6B' },
];

type BillingCycle = 'month' | 'quarter' | 'year';

export default function Membership() {
  const { wallet } = useWeb3();
  const [selectedPlan, setSelectedPlan] = useState<string>('pro');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('year');
  const [paymentMethod, setPaymentMethod] = useState<string>('usdt');
  const [showPayment, setShowPayment] = useState(false);

  const currentPlan = VIP_LEVELS.find(p => p.id === selectedPlan)!;
  const currentPrice = currentPlan.price[billingCycle];
  
  // 计算节省比例
  const getDiscount = () => {
    if (billingCycle === 'year') return '省40%';
    if (billingCycle === 'quarter') return '省20%';
    return null;
  };

  const handleSubscribe = () => {
    if (!wallet?.isConnected) {
      alert('请先连接钱包');
      return;
    }
    setShowPayment(true);
  };

  const confirmPayment = () => {
    alert(`正在发起${currentPlan.name}订阅支付...\n支付方式: ${paymentMethod.toUpperCase()}\n金额: $${currentPrice}`);
    setShowPayment(false);
  };

  return (
    <Screen>
      <Stack.Screen
        options={{
          title: '付费订阅',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.neonCyan,
        }}
      />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* 头部介绍 */}
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Ionicons name="diamond" size={28} color={colors.neonCyan} />
          </View>
          <Text style={styles.headerTitle}>解锁高级功能</Text>
          <Text style={styles.headerDesc}>专业级行情分析 + 智能跟单 + API接口</Text>
        </View>

        {/* 订阅周期切换 */}
        <View style={styles.billingContainer}>
          <View style={styles.billingTabs}>
            {(['month', 'quarter', 'year'] as BillingCycle[]).map(cycle => (
              <TouchableOpacity
                key={cycle}
                style={[
                  styles.billingTab,
                  billingCycle === cycle && styles.billingTabActive
                ]}
                onPress={() => setBillingCycle(cycle)}
              >
                <Text style={[
                  styles.billingTabText,
                  billingCycle === cycle && styles.billingTabTextActive
                ]}>
                  {cycle === 'month' ? '月付' : cycle === 'quarter' ? '季付' : '年付'}
                </Text>
                {getDiscount() && cycle === 'year' && (
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>省40%</Text>
                  </View>
                )}
                {cycle === 'quarter' && (
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>省20%</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 会员等级选择 */}
        <View style={styles.plansContainer}>
          {VIP_LEVELS.map(plan => (
            <TouchableOpacity
              key={plan.id}
              style={[
                styles.planCard,
                selectedPlan === plan.id && styles.planCardSelected,
                { borderColor: selectedPlan === plan.id ? plan.color : colors.border }
              ]}
              onPress={() => setSelectedPlan(plan.id)}
            >
              {plan.tag && (
                <View style={[styles.planTag, { backgroundColor: plan.color }]}>
                  <Text style={styles.planTagText}>{plan.tag}</Text>
                </View>
              )}
              
              <View style={styles.planHeader}>
                <View style={[styles.planIcon, { backgroundColor: plan.color + '20' }]}>
                  <Ionicons name={plan.icon as any} size={24} color={plan.color} />
                </View>
                <View>
                  <Text style={[styles.planName, { color: plan.color }]}>{plan.name}</Text>
                  <Text style={styles.planSubtitle}>{plan.subtitle}</Text>
                </View>
              </View>

              <View style={styles.planPrice}>
                <Text style={styles.priceSymbol}>$</Text>
                <Text style={styles.priceValue}>{currentPrice}</Text>
                <Text style={styles.priceUnit}>/{billingCycle === 'month' ? '月' : billingCycle === 'quarter' ? '季' : '年'}</Text>
              </View>

              <View style={styles.planFeatures}>
                {plan.features.map((feature, idx) => (
                  <View key={idx} style={styles.featureRow}>
                    <Ionicons 
                      name={feature.enabled ? 'checkmark-circle' : 'close-circle'} 
                      size={16} 
                      color={feature.enabled ? colors.neonGreen : colors.muted} 
                    />
                    <Text style={[
                      styles.featureText,
                      !feature.enabled && styles.featureDisabled
                    ]}>
                      {feature.text}
                    </Text>
                  </View>
                ))}
              </View>

              {selectedPlan === plan.id && (
                <View style={[styles.selectedIndicator, { backgroundColor: plan.color }]}>
                  <Ionicons name="checkmark" size={16} color={colors.background} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* 支付方式 */}
        <View style={styles.paymentSection}>
          <Text style={styles.sectionTitle}>支付方式</Text>
          <View style={styles.paymentMethods}>
            {PAYMENT_METHODS.map(method => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.paymentMethod,
                  paymentMethod === method.id && styles.paymentMethodActive
                ]}
                onPress={() => setPaymentMethod(method.id)}
              >
                <Ionicons name={method.icon as any} size={24} color={method.color} />
                <Text style={styles.paymentMethodName}>{method.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 订阅按钮 */}
        <TouchableOpacity 
          style={[styles.subscribeButton, { borderColor: currentPlan.color }]}
          onPress={handleSubscribe}
        >
          <View style={[styles.buttonGlow, { backgroundColor: currentPlan.color + '30' }]} />
          <Text style={styles.subscribeButtonText}>
            {wallet?.isConnected ? `订阅 ${currentPlan.name}` : '连接钱包后订阅'}
          </Text>
          <View style={styles.priceTag}>
            <Text style={styles.priceTagText}>${currentPrice}</Text>
          </View>
        </TouchableOpacity>

        {/* 服务条款 */}
        <View style={styles.terms}>
          <Text style={styles.termsText}>
            订阅即表示同意<Text style={styles.termsLink}>《服务条款》</Text>和<Text style={styles.termsLink}>《隐私政策》</Text>
          </Text>
          <Text style={styles.termsText}>支持 7 天无理由退款</Text>
        </View>

        {/* 功能对比表 */}
        <View style={styles.compareSection}>
          <Text style={styles.sectionTitle}>功能对比</Text>
          <View style={styles.compareTable}>
            <View style={styles.compareHeader}>
              <Text style={[styles.compareCell, styles.compareFeature]}>功能</Text>
              <Text style={[styles.compareCell, styles.compareCellCenter]}>基础版</Text>
              <Text style={[styles.compareCell, styles.compareCellCenter]}>专业版</Text>
              <Text style={[styles.compareCell, styles.compareCellCenter]}>尊享版</Text>
            </View>
            {[
              ['赛道覆盖', '6大赛道', '全部赛道', '全部赛道'],
              ['筛选条件', '30条', '无限', '无限'],
              ['行情推送', '每日', '实时', '实时+预警'],
              ['技术分析', '—', '基础工具', '高级工具'],
              ['跟单功能', '—', '基础跟单', '智能跟单'],
              ['API接口', '—', '—', '完整开放'],
            ].map((row, idx) => (
              <View key={idx} style={styles.compareRow}>
                <Text style={[styles.compareCell, styles.compareFeature]}>{row[0]}</Text>
                <Text style={[styles.compareCell, styles.compareCellCenter]}>{row[1]}</Text>
                <Text style={[styles.compareCell, styles.compareCellCenter]}>{row[2]}</Text>
                <Text style={[styles.compareCell, styles.compareCellCenter]}>{row[3]}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.footer} />
      </ScrollView>

      {/* 支付确认弹窗 */}
      {showPayment && (
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>确认订阅</Text>
              <TouchableOpacity onPress={() => setShowPayment(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalContent}>
              <View style={[styles.modalPlanIcon, { backgroundColor: currentPlan.color + '20' }]}>
                <Ionicons name={currentPlan.icon as any} size={32} color={currentPlan.color} />
              </View>
              <Text style={styles.modalPlanName}>{currentPlan.name}</Text>
              <Text style={styles.modalPrice}>${currentPrice}</Text>
              <Text style={styles.modalCycle}>
                {billingCycle === 'month' ? '月付' : billingCycle === 'quarter' ? '季付' : '年付'}
              </Text>
            </View>

            <View style={styles.modalPayment}>
              <Text style={styles.modalPaymentLabel}>支付方式</Text>
              <View style={styles.modalPaymentInfo}>
                <Ionicons name={PAYMENT_METHODS.find(m => m.id === paymentMethod)?.icon as any} size={20} color={PAYMENT_METHODS.find(m => m.id === paymentMethod)?.color} />
                <Text style={styles.modalPaymentMethod}>{paymentMethod.toUpperCase()}</Text>
              </View>
            </View>

            <View style={styles.modalInfo}>
              <View style={styles.modalInfoRow}>
                <Text style={styles.modalInfoLabel}>钱包地址</Text>
                <Text style={styles.modalInfoValue}>
                  {wallet?.address ? `${wallet.address.slice(0,6)}...${wallet.address.slice(-4)}` : '未连接'}
                </Text>
              </View>
              <View style={styles.modalInfoRow}>
                <Text style={styles.modalInfoLabel}>订阅周期</Text>
                <Text style={styles.modalInfoValue}>
                  {billingCycle === 'month' ? '1个月' : billingCycle === 'quarter' ? '3个月' : '12个月'}
                </Text>
              </View>
              <View style={styles.modalInfoRow}>
                <Text style={styles.modalInfoLabel}>自动续费</Text>
                <Text style={styles.modalInfoValue}>到期前3天自动扣款</Text>
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.confirmButton, { backgroundColor: currentPlan.color }]}
              onPress={confirmPayment}
            >
              <Text style={styles.confirmButtonText}>确认支付</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  
  // 头部
  header: { alignItems: 'center', paddingVertical: 24, paddingHorizontal: 20 },
  headerIcon: { 
    width: 60, height: 60, borderRadius: 30, 
    backgroundColor: colors.neonCyan + '20', 
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: 8 },
  headerDesc: { fontSize: 14, color: colors.textSecondary },

  // 周期切换
  billingContainer: { paddingHorizontal: 20, marginBottom: 20 },
  billingTabs: { 
    flexDirection: 'row', 
    backgroundColor: colors.card, 
    borderRadius: 12, 
    padding: 4 
  },
  billingTab: { 
    flex: 1, 
    paddingVertical: 12, 
    alignItems: 'center', 
    borderRadius: 10,
    position: 'relative',
  },
  billingTabActive: { backgroundColor: colors.neonCyan + '20' },
  billingTabText: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
  billingTabTextActive: { color: colors.neonCyan },
  discountBadge: { 
    position: 'absolute', top: -8, right: -8,
    backgroundColor: colors.neonGreen,
    paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: 8,
  },
  discountText: { fontSize: 10, fontWeight: '700', color: colors.background },

  // 会员卡片
  plansContainer: { paddingHorizontal: 20, gap: 12 },
  planCard: { 
    backgroundColor: colors.card, 
    borderRadius: 16, 
    padding: 16, 
    borderWidth: 2,
    position: 'relative',
  },
  planCardSelected: { backgroundColor: colors.cardAlt },
  planTag: {
    position: 'absolute', top: -10, right: 16,
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 10,
  },
  planTagText: { fontSize: 10, fontWeight: '700', color: colors.background },
  planHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  planIcon: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  planName: { fontSize: 18, fontWeight: '800' },
  planSubtitle: { fontSize: 12, color: colors.textSecondary },
  planPrice: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 12 },
  priceSymbol: { fontSize: 16, color: colors.textSecondary },
  priceValue: { fontSize: 32, fontWeight: '800', color: colors.text },
  priceUnit: { fontSize: 14, color: colors.textSecondary, marginLeft: 4 },
  planFeatures: { gap: 8 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  featureText: { fontSize: 13, color: colors.text },
  featureDisabled: { color: colors.muted, textDecorationLine: 'line-through' },
  selectedIndicator: {
    position: 'absolute', top: 16, left: 16,
    width: 24, height: 24, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },

  // 支付方式
  paymentSection: { paddingHorizontal: 20, marginTop: 24, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 12 },
  paymentMethods: { flexDirection: 'row', gap: 12 },
  paymentMethod: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  paymentMethodActive: { borderColor: colors.neonCyan, backgroundColor: colors.neonCyan + '10' },
  paymentMethodName: { fontSize: 13, fontWeight: '600', color: colors.text, marginTop: 8 },

  // 订阅按钮
  subscribeButton: {
    marginHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 14,
    borderWidth: 2,
    position: 'relative',
    overflow: 'hidden',
  },
  buttonGlow: { position: 'absolute', inset: 0, borderRadius: 12 },
  subscribeButtonText: { fontSize: 16, fontWeight: '700', color: colors.text, zIndex: 1 },
  priceTag: {
    position: 'absolute', right: 16,
    backgroundColor: colors.neonGreen + '20',
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 8,
    zIndex: 1,
  },
  priceTagText: { fontSize: 13, fontWeight: '700', color: colors.neonGreen },

  // 服务条款
  terms: { alignItems: 'center', paddingHorizontal: 20, marginTop: 16, gap: 4 },
  termsText: { fontSize: 11, color: colors.textSecondary, textAlign: 'center' },
  termsLink: { color: colors.neonCyan },

  // 功能对比
  compareSection: { paddingHorizontal: 20, marginTop: 24 },
  compareTable: { backgroundColor: colors.card, borderRadius: 12, overflow: 'hidden' },
  compareHeader: { flexDirection: 'row', backgroundColor: colors.cardAlt, paddingVertical: 12 },
  compareRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.border, paddingVertical: 10 },
  compareCell: { flex: 1, fontSize: 11, color: colors.text, paddingHorizontal: 8 },
  compareFeature: { flex: 1.5, color: colors.textSecondary },
  compareCellCenter: { textAlign: 'center' },

  // 底部
  footer: { height: 40 },

  // 弹窗
  modalOverlay: {
    position: 'absolute', inset: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modal: { backgroundColor: colors.card, borderRadius: 20, padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  modalContent: { alignItems: 'center', marginBottom: 20 },
  modalPlanIcon: { width: 64, height: 64, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  modalPlanName: { fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 8 },
  modalPrice: { fontSize: 36, fontWeight: '800', color: colors.neonGreen },
  modalCycle: { fontSize: 14, color: colors.textSecondary },
  modalPayment: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderTopWidth: 1, borderTopColor: colors.border },
  modalPaymentLabel: { fontSize: 14, color: colors.textSecondary },
  modalPaymentInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  modalPaymentMethod: { fontSize: 14, fontWeight: '600', color: colors.text },
  modalInfo: { marginTop: 16, gap: 8 },
  modalInfoRow: { flexDirection: 'row', justifyContent: 'space-between' },
  modalInfoLabel: { fontSize: 13, color: colors.textSecondary },
  modalInfoValue: { fontSize: 13, color: colors.text },
  confirmButton: { marginTop: 20, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  confirmButtonText: { fontSize: 16, fontWeight: '700', color: colors.background },
});
