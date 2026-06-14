/**
 * 付费订阅页面
 * 会员权益、订阅周期、支付方式
 */

import { Screen } from '@/components/Screen';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { useState } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import { VIP_PLANS, PAYMENT_METHODS, BillingCycle } from '@/utils/vipPlans';

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
  const [selectedPlan, setSelectedPlan] = useState<string>('pro');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('year');
  const [paymentMethod, setPaymentMethod] = useState<string>('usdt');
  const [showPayment, setShowPayment] = useState(false);

  const currentPlan = VIP_PLANS.find(p => p.id === selectedPlan)!;
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
      {/* 自定义顶部导航栏 */}
      <View style={styles.customHeader}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#00F0FF" />
          <Text style={styles.backText}>返回</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>会员订阅</Text>
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
                {cycle === 'year' && (
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
              <Text style={[styles.statValue, { color: colors.neonCyan }]}>+2月</Text>
              <Text style={styles.statLabel}>待领取</Text>
            </View>
          </View>

          {/* 邀请链接 */}
          <View style={styles.inviteLinkContainer}>
            <View style={styles.inviteLinkBox}>
              <Text style={styles.inviteLinkText} numberOfLines={1}>
                https://kairos.app/r/0x7a9...f3c2
              </Text>
            </View>
            <TouchableOpacity style={styles.copyButton}>
              <Ionicons name="copy-outline" size={18} color={colors.background} />
              <Text style={styles.copyButtonText}>复制</Text>
            </TouchableOpacity>
          </View>

          {/* 分享按钮 */}
          <View style={styles.shareButtons}>
            <TouchableOpacity style={[styles.shareBtn, { backgroundColor: '#1DA1F2' }]}>
              <Ionicons name="logo-twitter" size={18} color="#FFFFFF" />
              <Text style={styles.shareBtnText}>Twitter</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.shareBtn, { backgroundColor: '#25D366' }]}>
              <Ionicons name="logo-whatsapp" size={18} color="#FFFFFF" />
              <Text style={styles.shareBtnText}>WhatsApp</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.shareBtn, { backgroundColor: colors.card }]}>
              <Ionicons name="link-outline" size={18} color="#FFFFFF" />
              <Text style={styles.shareBtnText}>更多</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 底部安全区 */}
        <View style={{ height: 40 }} />
      </ScrollView>
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
    borderBottomColor: '#1F1F2E',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    color: '#00F0FF',
    fontSize: 16,
    marginLeft: 2,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#00F0FF15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerDesc: {
    fontSize: 14,
    color: '#8A8A9A',
    marginTop: 4,
  },
  billingContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  billingTabs: {
    flexDirection: 'row',
    backgroundColor: '#13131A',
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
    backgroundColor: '#00F0FF20',
  },
  billingTabText: {
    fontSize: 14,
    color: '#8A8A9A',
  },
  billingTabTextActive: {
    color: '#00F0FF',
    fontWeight: '600',
  },
  discountBadge: {
    backgroundColor: '#00FF8820',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 4,
  },
  discountText: {
    fontSize: 10,
    color: '#00FF88',
    fontWeight: '600',
  },
  plansContainer: {
    paddingHorizontal: 16,
  },
  planCard: {
    backgroundColor: '#13131A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#2A2A3A',
  },
  planCardSelected: {
    backgroundColor: '#1A1A24',
  },
  planTag: {
    position: 'absolute',
    top: -8,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  planTagText: {
    fontSize: 11,
    color: '#0A0A0F',
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
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  planName: {
    fontSize: 18,
    fontWeight: '700',
  },
  planSubtitle: {
    fontSize: 12,
    color: '#8A8A9A',
    marginTop: 2,
  },
  planPrice: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  priceSymbol: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  priceValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  priceUnit: {
    fontSize: 14,
    color: '#8A8A9A',
    marginLeft: 2,
  },
  planFeatures: {},
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  featureText: {
    fontSize: 13,
    color: '#FFFFFF',
    marginLeft: 8,
  },
  featureDisabled: {
    color: '#4A4A5A',
  },
  selectedIndicator: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentSection: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  paymentMethods: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  paymentMethod: {
    flex: 1,
    backgroundColor: '#13131A',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  paymentMethodActive: {
    borderColor: '#00F0FF',
  },
  paymentMethodName: {
    fontSize: 12,
    color: '#FFFFFF',
    marginTop: 6,
  },
  subscribeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#13131A',
    borderWidth: 2,
    overflow: 'hidden',
  },
  buttonGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  subscribeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  priceTag: {
    position: 'absolute',
    right: 16,
    backgroundColor: '#00F0FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priceTagText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0A0A0F',
  },
  terms: {
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 16,
  },
  termsText: {
    fontSize: 12,
    color: '#8A8A9A',
    textAlign: 'center',
  },
  termsLink: {
    color: '#00F0FF',
  },
  compareSection: {
    paddingHorizontal: 16,
    marginTop: 32,
  },
  compareTable: {
    backgroundColor: '#13131A',
    borderRadius: 12,
    overflow: 'hidden',
  },
  compareHeader: {
    flexDirection: 'row',
    backgroundColor: '#1A1A24',
    paddingVertical: 12,
  },
  compareRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#2A2A3A',
    paddingVertical: 10,
  },
  compareCell: {
    flex: 1,
    fontSize: 11,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  compareFeature: {
    flex: 1.5,
    textAlign: 'left',
    paddingLeft: 12,
  },
  compareCellCenter: {
    textAlign: 'center',
  },
  referralSection: {
    paddingHorizontal: 16,
    marginTop: 32,
  },
  referralHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  referralTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  referralDesc: {
    fontSize: 14,
    color: '#8A8A9A',
    marginBottom: 16,
  },
  rewardRules: {},
  rewardRule: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#13131A',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  rewardLevel: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFD70020',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rewardLevelText: {
    position: 'absolute',
    bottom: -2,
    fontSize: 10,
    fontWeight: '700',
    color: '#FFD700',
  },
  rewardInfo: {
    marginLeft: 12,
    flex: 1,
  },
  rewardInvited: {
    fontSize: 13,
    color: '#FFFFFF',
  },
  rewardValue: {
    fontSize: 12,
    color: '#00FF88',
    marginTop: 2,
  },
  referralStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#13131A',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 11,
    color: '#8A8A9A',
    marginTop: 4,
  },
  inviteLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  inviteLinkBox: {
    flex: 1,
    backgroundColor: '#13131A',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginRight: 8,
  },
  inviteLinkText: {
    fontSize: 12,
    color: '#00F0FF',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00F0FF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  copyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0A0A0F',
    marginLeft: 4,
  },
  shareButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  shareBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 12,
    marginHorizontal: 4,
  },
  shareBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 6,
  },
});
