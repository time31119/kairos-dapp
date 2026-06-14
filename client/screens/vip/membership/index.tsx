/**
 * 付费订阅页面
 * 会员权益、订阅周期、支付方式
 */

import { Screen } from '@/components/Screen';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { useSafeRouter, useSafeSearchParams } from '@/hooks/useSafeRouter';
import { useWeb3 } from '@/contexts/Web3Context';
import { VIP_PLANS, PAYMENT_METHODS, BillingCycle } from '@/utils/vipPlans';
import PaymentModal from '@/components/payment/PaymentModal';

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

export default function Membership() {
  const { wallet } = useWeb3();
  const router = useSafeRouter();
  const params = useSafeSearchParams<{ plan?: string }>();
  const [selectedPlan, setSelectedPlan] = useState<string>(params.plan || 'pro');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('yearly');
  const [paymentMethod, setPaymentMethod] = useState<string>('usdt');
  const [showPayment, setShowPayment] = useState(false);

  // 如果URL参数变化，更新选中套餐
  useEffect(() => {
    if (params.plan && VIP_PLANS.find(p => p.id === params.plan)) {
      setSelectedPlan(params.plan);
    }
  }, [params.plan]);

  const currentPlan = VIP_PLANS.find(p => p.id === selectedPlan)!;
  const currentPrice = currentPlan.price[billingCycle];
  
  // 计算节省比例
  const getDiscount = () => {
    if (billingCycle === 'yearly') return '省40%';
    if (billingCycle === 'quarterly') return '省20%';
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
      {/* 自定义顶部导航栏 */}
      <View style={styles.customHeader}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#00F0FF" />
          <Text style={styles.backText}>返回</Text>
        </TouchableOpacity>
        <Text style={styles.pageTitle}>会员订阅</Text>
        <View style={{ width: 60 }} />
      </View>

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
            {(['monthly', 'quarterly', 'yearly'] as BillingCycle[]).map(cycle => (
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
                  {cycle === 'monthly' ? '月付' : cycle === 'quarterly' ? '季付' : '年付'}
                </Text>
                {cycle === 'yearly' && (
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>省40%</Text>
                  </View>
                )}
                {cycle === 'quarterly' && (
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>省20%</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 会员等级选择 - 使用共享配置 */}
        <View style={styles.plansContainer}>
          {VIP_PLANS.map(plan => (
            <TouchableOpacity
              key={plan.id}
              style={[
                styles.planCard,
                selectedPlan === plan.id && styles.planCardSelected,
                { borderColor: selectedPlan === plan.id ? plan.color : colors.border }
              ]}
              onPress={() => setSelectedPlan(plan.id)}
            >
              {plan.recommended && (
                <View style={[styles.planTag, { backgroundColor: plan.color }]}>
                  <Text style={styles.planTagText}>推荐</Text>
                </View>
              )}
              
              <View style={styles.planHeader}>
                <View style={[styles.planIcon, { backgroundColor: plan.color + '20' }]}>
                  <Ionicons 
                    name={plan.id === 'basic' ? 'leaf-outline' : plan.id === 'pro' ? 'trending-up-outline' : 'diamond-outline'} 
                    size={24} 
                    color={plan.color} 
                  />
                </View>
                <View>
                  <Text style={[styles.planName, { color: plan.color }]}>{plan.name}</Text>
                  <Text style={styles.planSubtitle}>{plan.subtitle}</Text>
                </View>
              </View>

              <View style={styles.planPrice}>
                <Text style={styles.priceSymbol}>$</Text>
                <Text style={styles.priceValue}>{plan.price[billingCycle]}</Text>
                <Text style={styles.priceUnit}>/{billingCycle === 'monthly' ? '月' : billingCycle === 'quarterly' ? '季' : '年'}</Text>
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

        {/* 支付方式 - 使用共享配置 */}
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

        {/* 分享激励计划 */}
        <View style={styles.referralSection}>
          <View style={styles.referralHeader}>
            <Ionicons name="gift" size={24} color={colors.neonCyan} />
            <Text style={styles.referralTitle}>分享激励计划</Text>
          </View>
          
          <Text style={styles.referralDesc}>
            邀请好友订阅，双方均可获得奖励
          </Text>

          {/* 奖励规则 */}
          <View style={styles.rewardRules}>
            {[
              { level: '1', invited: '1-5人', reward: '+7天基础版', icon: 'person-add-outline' },
              { level: '2', invited: '6-15人', reward: '+1月专业版', icon: 'trending-up-outline' },
              { level: '3', invited: '16-30人', reward: '+3月专业版', icon: 'diamond-outline' },
              { level: '4', invited: '30+人', reward: '+1年尊享版', icon: 'trophy-outline' },
            ].map((rule, idx) => (
              <View key={idx} style={styles.rewardRule}>
                <View style={styles.rewardLevel}>
                  <Ionicons name={rule.icon as any} size={20} color={colors.neonYellow} />
                  <Text style={styles.rewardLevelText}>{rule.level}</Text>
                </View>
                <View style={styles.rewardInfo}>
                  <Text style={styles.rewardInvited}>邀请 {rule.invited}</Text>
                  <Text style={styles.rewardValue}>{rule.reward}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* 我的邀请统计 */}
          <View style={styles.referralStats}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>已邀请</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: colors.neonGreen }]}>8</Text>
              <Text style={styles.statLabel}>有效邀请</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: colors.neonYellow }]}>+56天</Text>
              <Text style={styles.statLabel}>获得时长</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.shareButton}>
            <Ionicons name="share-social-outline" size={20} color={colors.neonCyan} />
            <Text style={styles.shareButtonText}>分享邀请链接</Text>
          </TouchableOpacity>
        </View>

        {/* 常见问题 */}
        <View style={styles.faqSection}>
          <Text style={styles.sectionTitle}>常见问题</Text>
          {[
            { q: '订阅后可以退款吗？', a: '支持7天内无理由退款，超出期限不予退款。' },
            { q: '如何取消自动续费？', a: '您可以在“我的订阅”中随时取消，自动续费到期后不再扣除。' },
            { q: '支持哪些支付方式？', a: '目前支持USDT (TRC20)和USDT (BNB Chain)支付。' },
            { q: '订阅到期后数据保留吗？', a: '订阅到期后，您的数据会保留7天，续费后可继续使用。' },
          ].map((item, idx) => (
            <View key={idx} style={styles.faqItem}>
              <Text style={styles.faqQuestion}>Q: {item.q}</Text>
              <Text style={styles.faqAnswer}>A: {item.a}</Text>
            </View>
          ))}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* 支付弹窗 */}
      {showPayment && (
        <PaymentModal
          visible={showPayment}
          onClose={() => setShowPayment(false)}
          plan={currentPlan}
          billingCycle={billingCycle}
          onSuccess={() => {
            setShowPayment(false);
          }}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0A0A0F',
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A24',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    color: '#00F0FF',
    fontSize: 16,
    marginLeft: 4,
  },
  pageTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0, 240, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerDesc: {
    color: '#8A8A9A',
    fontSize: 14,
    textAlign: 'center',
  },
  billingContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  billingTabs: {
    flexDirection: 'row',
    backgroundColor: '#12121A',
    borderRadius: 12,
    padding: 4,
  },
  billingTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
  },
  billingTabActive: {
    backgroundColor: '#1A1A24',
  },
  billingTabText: {
    color: '#8A8A9A',
    fontSize: 14,
  },
  billingTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  discountBadge: {
    backgroundColor: '#FF4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 4,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  plansContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  planCard: {
    backgroundColor: '#12121A',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#2A2A3A',
    marginBottom: 12,
  },
  planCardSelected: {
    borderWidth: 2,
  },
  planTag: {
    position: 'absolute',
    top: -8,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  planTagText: {
    color: '#0A0A0F',
    fontSize: 11,
    fontWeight: '700',
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  planIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  planName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  planSubtitle: {
    fontSize: 12,
    color: '#8A8A9A',
  },
  planPrice: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  priceSymbol: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  priceValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  priceUnit: {
    fontSize: 14,
    color: '#8A8A9A',
    marginLeft: 4,
  },
  planFeatures: {
    gap: 8,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 13,
    color: '#8A8A9A',
  },
  featureDisabled: {
    color: '#4A4A5A',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentSection: {
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  paymentMethods: {
    flexDirection: 'row',
    gap: 12,
  },
  paymentMethod: {
    flex: 1,
    backgroundColor: '#12121A',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2A2A3A',
  },
  paymentMethodActive: {
    borderColor: '#00F0FF',
  },
  paymentMethodName: {
    fontSize: 13,
    color: '#FFFFFF',
    marginTop: 8,
  },
  subscribeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    overflow: 'hidden',
    marginBottom: 16,
  },
  buttonGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  subscribeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    zIndex: 1,
  },
  priceTag: {
    backgroundColor: 'rgba(0, 240, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 12,
    zIndex: 1,
  },
  priceTagText: {
    color: '#00F0FF',
    fontSize: 14,
    fontWeight: '700',
  },
  terms: {
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  termsText: {
    fontSize: 11,
    color: '#8A8A9A',
    textAlign: 'center',
    marginBottom: 4,
  },
  termsLink: {
    color: '#00F0FF',
  },
  compareSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  compareTable: {
    backgroundColor: '#12121A',
    borderRadius: 12,
    overflow: 'hidden',
  },
  compareHeader: {
    flexDirection: 'row',
    backgroundColor: '#1A1A24',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  compareRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: '#2A2A3A',
  },
  compareCell: {
    flex: 1,
    fontSize: 11,
    color: '#8A8A9A',
    textAlign: 'center',
  },
  compareFeature: {
    textAlign: 'left',
    fontWeight: '600',
    color: '#FFFFFF',
  },
  compareCellCenter: {
    textAlign: 'center',
  },
  referralSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  referralHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  referralTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  referralDesc: {
    fontSize: 13,
    color: '#8A8A9A',
    marginBottom: 16,
  },
  rewardRules: {
    gap: 12,
  },
  rewardRule: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#12121A',
    borderRadius: 12,
    padding: 12,
  },
  rewardLevel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  rewardLevelText: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 4,
  },
  rewardInfo: {
    flex: 1,
  },
  rewardInvited: {
    fontSize: 12,
    color: '#8A8A9A',
  },
  rewardValue: {
    fontSize: 14,
    color: '#00FF88',
    fontWeight: '600',
  },
  referralStats: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#12121A',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#8A8A9A',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#12121A',
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#00F0FF',
  },
  shareButtonText: {
    color: '#00F0FF',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  faqSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  faqItem: {
    backgroundColor: '#12121A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  faqQuestion: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 13,
    color: '#8A8A9A',
    lineHeight: 18,
  },
  bottomPadding: {
    height: 40,
  },
});
