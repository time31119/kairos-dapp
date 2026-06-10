import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
} from 'react-native';
import { Screen } from '@/components/Screen';
import { useSafeRouter } from '@/hooks/useSafeRouter';

// Mock membership plans
const MEMBERSHIP_PLANS = [
  {
    id: 'monthly',
    name: '月度会员',
    duration: '1个月',
    price: 99,
    originalPrice: 199,
    features: [
      '解锁全部会员速递功能',
      '实时异动雷达推送',
      '机构动向监控',
      '高级技术指标',
      '_priority: 1',
    ],
    color: '#22D3EE',
    badge: '推荐',
  },
  {
    id: 'quarterly',
    name: '季度会员',
    duration: '3个月',
    price: 268,
    originalPrice: 568,
    features: [
      '解锁全部会员速递功能',
      '实时异动雷达推送',
      '机构动向监控',
      '高级技术指标',
      'VIP专属客服',
      '_priority: 2',
    ],
    color: '#FFD700',
    badge: '超值',
    popular: true,
  },
  {
    id: 'yearly',
    name: '年度会员',
    duration: '12个月',
    price: 888,
    originalPrice: 1999,
    features: [
      '解锁全部会员速递功能',
      '实时异动雷达推送',
      '机构动向监控',
      '高级技术指标',
      'VIP专属客服',
      '优先体验新功能',
      '_priority: 3',
    ],
    color: '#A855F7',
    badge: '最优',
  },
];

export default function MembershipScreen() {
  const router = useSafeRouter();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
    setShowPaymentModal(true);
  };

  const handlePayment = () => {
    // Simulate payment
    setPaymentSuccess(true);
    setTimeout(() => {
      setShowPaymentModal(false);
      setPaymentSuccess(false);
      setSelectedPlan(null);
    }, 2000);
  };

  const selectedPlanData = MEMBERSHIP_PLANS.find(p => p.id === selectedPlan);

  return (
    <Screen>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← 返回</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>开通会员</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>解锁 KAIROS 全部高级功能</Text>
          <Text style={styles.heroSubtitle}>
            让每一次交易决策都有数据支撑
          </Text>
        </View>

        {/* Benefits Preview */}
        <View style={styles.benefitsPreview}>
          <View style={styles.benefitRow}>
            <Text style={styles.benefitIcon}>✓</Text>
            <Text style={styles.benefitText}>会员专属筛选场景</Text>
          </View>
          <View style={styles.benefitRow}>
            <Text style={styles.benefitIcon}>✓</Text>
            <Text style={styles.benefitText}>实时异动雷达推送</Text>
          </View>
          <View style={styles.benefitRow}>
            <Text style={styles.benefitIcon}>✓</Text>
            <Text style={styles.benefitText}>机构动向深度追踪</Text>
          </View>
          <View style={styles.benefitRow}>
            <Text style={styles.benefitIcon}>✓</Text>
            <Text style={styles.benefitText}>多指标共振信号</Text>
          </View>
        </View>

        {/* Plans */}
        <Text style={styles.sectionTitle}>选择套餐</Text>
        {MEMBERSHIP_PLANS.map((plan) => (
          <TouchableOpacity
            key={plan.id}
            style={[
              styles.planCard,
              plan.popular && styles.planCardPopular,
            ]}
            onPress={() => handleSelectPlan(plan.id)}
          >
            {plan.badge && (
              <View style={[styles.badge, { backgroundColor: plan.color }]}>
                <Text style={styles.badgeText}>{plan.badge}</Text>
              </View>
            )}

            <View style={styles.planHeader}>
              <View>
                <Text style={styles.planName}>{plan.name}</Text>
                <Text style={styles.planDuration}>{plan.duration}</Text>
              </View>
              <View style={styles.priceContainer}>
                <Text style={[styles.price, { color: plan.color }]}>
                  ¥{plan.price}
                </Text>
                <Text style={styles.originalPrice}>
                  ¥{plan.originalPrice}
                </Text>
              </View>
            </View>

            <View style={styles.featuresList}>
              {plan.features.slice(0, 4).map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <Text style={[styles.featureIcon, { color: plan.color }]}>
                    •
                  </Text>
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.selectButton, { backgroundColor: plan.color }]}
            >
              <Text style={styles.selectButtonText}>立即开通</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}

        {/* FAQ */}
        <Text style={styles.sectionTitle}>常见问题</Text>
        <View style={styles.faqContainer}>
          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>Q: 会员可以退款吗？</Text>
            <Text style={styles.faqAnswer}>
              A: 会员开通后7天内如需退款，请联系客服。
            </Text>
          </View>
          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>Q: 到期后会自动续费吗？</Text>
            <Text style={styles.faqAnswer}>
              A: 会员到期前3天会发送提醒，不会自动扣费。
            </Text>
          </View>
          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>Q: 可以同时登录多个设备吗？</Text>
            <Text style={styles.faqAnswer}>
              A: 一个账号最多同时登录3个设备。
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            开通即表示同意《会员服务协议》和《隐私政策》
          </Text>
        </View>
      </ScrollView>

      {/* Payment Modal */}
      <Modal
        visible={showPaymentModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {paymentSuccess ? (
              <View style={styles.successContainer}>
                <Text style={styles.successIcon}>✓</Text>
                <Text style={styles.successTitle}>支付成功</Text>
                <Text style={styles.successText}>
                  欢迎成为 KAIROS 会员！
                </Text>
              </View>
            ) : (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>确认支付</Text>
                  <TouchableOpacity
                    onPress={() => setShowPaymentModal(false)}
                  >
                    <Text style={styles.closeButton}>✕</Text>
                  </TouchableOpacity>
                </View>

                {selectedPlanData && (
                  <>
                    <View style={styles.orderInfo}>
                      <Text style={styles.orderLabel}>套餐</Text>
                      <Text style={styles.orderValue}>
                        {selectedPlanData.name}
                      </Text>
                    </View>
                    <View style={styles.orderInfo}>
                      <Text style={styles.orderLabel}>时长</Text>
                      <Text style={styles.orderValue}>
                        {selectedPlanData.duration}
                      </Text>
                    </View>
                    <View style={[styles.orderInfo, styles.totalRow]}>
                      <Text style={styles.totalLabel}>应付金额</Text>
                      <Text
                        style={[
                          styles.totalValue,
                          { color: selectedPlanData.color },
                        ]}
                      >
                        ¥{selectedPlanData.price}
                      </Text>
                    </View>

                    <Text style={styles.paymentTitle}>选择支付方式</Text>
                    <View style={styles.paymentMethods}>
                      <TouchableOpacity style={styles.paymentMethod}>
                        <Text style={styles.paymentIcon}>💳</Text>
                        <Text style={styles.paymentText}>银行卡</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.paymentMethod}>
                        <Text style={styles.paymentIcon}>💰</Text>
                        <Text style={styles.paymentText}>支付宝</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.paymentMethod}>
                        <Text style={styles.paymentIcon}>💬</Text>
                        <Text style={styles.paymentText}>微信</Text>
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.confirmButton,
                        { backgroundColor: selectedPlanData.color },
                      ]}
                      onPress={handlePayment}
                    >
                      <Text style={styles.confirmButtonText}>
                        确认支付 ¥{selectedPlanData.price}
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backButton: {
    padding: 8,
  },
  backText: {
    color: '#00F0FF',
    fontSize: 16,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 50,
  },
  container: {
    flex: 1,
  },
  heroSection: {
    padding: 24,
    alignItems: 'center',
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  heroSubtitle: {
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  benefitsPreview: {
    backgroundColor: 'rgba(0,240,255,0.05)',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,240,255,0.2)',
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  benefitIcon: {
    color: '#00F0FF',
    fontSize: 16,
    marginRight: 10,
  },
  benefitText: {
    color: '#E5E7EB',
    fontSize: 14,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
  },
  planCard: {
    backgroundColor: '#1A1A2E',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  planCardPopular: {
    borderColor: '#FFD700',
    borderWidth: 2,
  },
  badge: {
    position: 'absolute',
    top: -10,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeText: {
    color: '#0A0A0F',
    fontSize: 12,
    fontWeight: 'bold',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  planName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  planDuration: {
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: 4,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  originalPrice: {
    color: '#6B7280',
    fontSize: 14,
    textDecorationLine: 'line-through',
  },
  featuresList: {
    marginTop: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  featureIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  featureText: {
    color: '#D1D5DB',
    fontSize: 13,
  },
  selectButton: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectButtonText: {
    color: '#0A0A0F',
    fontSize: 16,
    fontWeight: '600',
  },
  faqContainer: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  faqItem: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  faqQuestion: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  faqAnswer: {
    color: '#9CA3AF',
    fontSize: 13,
    marginTop: 8,
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    color: '#6B7280',
    fontSize: 12,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1A1A2E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    color: '#9CA3AF',
    fontSize: 24,
    padding: 4,
  },
  orderInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  orderLabel: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  orderValue: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  totalRow: {
    borderBottomWidth: 0,
    marginTop: 8,
  },
  totalLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  paymentTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 20,
    marginBottom: 12,
  },
  paymentMethods: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  paymentMethod: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  paymentIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  paymentText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  confirmButton: {
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#0A0A0F',
    fontSize: 16,
    fontWeight: '600',
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  successIcon: {
    fontSize: 60,
    color: '#00FF88',
    marginBottom: 16,
  },
  successTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  successText: {
    color: '#9CA3AF',
    fontSize: 16,
  },
});
