/**
 * 会员开通页面
 * DAPP 行情筛选器
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Screen } from '@/components/Screen';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9091';

// 会员套餐
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
    ],
    color: '#A855F7',
    badge: '最优',
  },
];

// API 请求函数
async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = await AsyncStorage.getItem('auth_token');
  const response = await fetch(`${API_BASE_URL}/api/v1${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
    ...options,
  });
  
  const data = await response.json();
  
  if (data.code !== 0) {
    throw new Error(data.message || '请求失败');
  }
  
  return data.data;
}

// 获取会员状态
async function getMembershipStatus() {
  try {
    const data = await apiRequest<{
      isVip: boolean;
      vipLevel: string;
      expireDate: string;
      features: string[];
    }>('/membership/status');
    return data;
  } catch {
    return null;
  }
}

// 开通会员
async function createMembership(planId: string, paymentMethod: string) {
  return apiRequest<{
    orderId: string;
    status: string;
  }>('/membership/create', {
    method: 'POST',
    body: JSON.stringify({ planId, paymentMethod }),
  });
}

export default function MembershipScreen() {
  const router = useSafeRouter();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<string>('alipay');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [membershipStatus, setMembershipStatus] = useState<{
    isVip: boolean;
    vipLevel: string;
    expireDate: string;
  } | null>(null);

  useEffect(() => {
    loadMembershipStatus();
  }, []);

  const loadMembershipStatus = async () => {
    const status = await getMembershipStatus();
    if (status) {
      setMembershipStatus(status);
    }
  };

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
    setShowPaymentModal(true);
  };

  const handlePayment = async () => {
    if (!selectedPlan) return;

    setLoading(true);
    try {
      await createMembership(selectedPlan, selectedPayment);
      setPaymentSuccess(true);
      
      // 更新会员状态
      const plan = MEMBERSHIP_PLANS.find(p => p.id === selectedPlan);
      if (plan) {
        const expireDate = new Date();
        if (plan.id === 'monthly') expireDate.setMonth(expireDate.getMonth() + 1);
        else if (plan.id === 'quarterly') expireDate.setMonth(expireDate.getMonth() + 3);
        else expireDate.setFullYear(expireDate.getFullYear() + 1);

        setMembershipStatus({
          isVip: true,
          vipLevel: plan.id,
          expireDate: expireDate.toISOString(),
        });
      }

      setTimeout(() => {
        setShowPaymentModal(false);
        setPaymentSuccess(false);
        setSelectedPlan(null);
        Alert.alert('成功', '会员开通成功！');
      }, 2000);
    } catch (error) {
      Alert.alert('错误', error instanceof Error ? error.message : '支付失败');
    } finally {
      setLoading(false);
    }
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
        {/* 会员状态提示 */}
        {membershipStatus?.isVip && (
          <View style={styles.vipBanner}>
            <Text style={styles.vipBannerText}>
              您已是 {membershipStatus.vipLevel === 'yearly' ? '年度' : membershipStatus.vipLevel === 'quarterly' ? '季度' : '月度'}会员
            </Text>
            <Text style={styles.vipBannerExpire}>
              到期时间：{new Date(membershipStatus.expireDate).toLocaleDateString()}
            </Text>
          </View>
        )}

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>解锁 DAPP 全部高级功能</Text>
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
              membershipStatus?.isVip && styles.planCardDisabled,
            ]}
            onPress={() => handleSelectPlan(plan.id)}
            disabled={membershipStatus?.isVip}
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
              style={[
                styles.selectButton,
                { backgroundColor: plan.color },
                membershipStatus?.isVip && styles.selectButtonDisabled,
              ]}
              disabled={membershipStatus?.isVip}
            >
              <Text style={styles.selectButtonText}>
                {membershipStatus?.isVip ? '已开通' : '立即开通'}
              </Text>
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

        <View style={{ height: 40 }} />
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
                  欢迎成为 DAPP 会员！
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
                      <TouchableOpacity 
                        style={[
                          styles.paymentMethod,
                          selectedPayment === 'bank' && styles.paymentMethodSelected,
                        ]}
                        onPress={() => setSelectedPayment('bank')}
                      >
                        <Text style={styles.paymentIcon}>💳</Text>
                        <Text style={styles.paymentText}>银行卡</Text>
                        {selectedPayment === 'bank' && (
                          <Text style={styles.checkmark}>✓</Text>
                        )}
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[
                          styles.paymentMethod,
                          selectedPayment === 'alipay' && styles.paymentMethodSelected,
                        ]}
                        onPress={() => setSelectedPayment('alipay')}
                      >
                        <Text style={styles.paymentIcon}>💰</Text>
                        <Text style={styles.paymentText}>支付宝</Text>
                        {selectedPayment === 'alipay' && (
                          <Text style={styles.checkmark}>✓</Text>
                        )}
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[
                          styles.paymentMethod,
                          selectedPayment === 'wechat' && styles.paymentMethodSelected,
                        ]}
                        onPress={() => setSelectedPayment('wechat')}
                      >
                        <Text style={styles.paymentIcon}>💬</Text>
                        <Text style={styles.paymentText}>微信</Text>
                        {selectedPayment === 'wechat' && (
                          <Text style={styles.checkmark}>✓</Text>
                        )}
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.confirmButton,
                        { backgroundColor: selectedPlanData.color },
                        loading && styles.confirmButtonDisabled,
                      ]}
                      onPress={handlePayment}
                      disabled={loading}
                    >
                      {loading ? (
                        <ActivityIndicator color="#FFF" />
                      ) : (
                        <Text style={styles.confirmButtonText}>
                          确认支付 ¥{selectedPlanData.price}
                        </Text>
                      )}
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
  vipBanner: {
    margin: 16,
    padding: 16,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  vipBannerText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  vipBannerExpire: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
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
    marginHorizontal: 16,
    padding: 16,
    backgroundColor: '#1A1A1F',
    borderRadius: 12,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  benefitIcon: {
    color: '#00F0FF',
    fontSize: 16,
    marginRight: 12,
  },
  benefitText: {
    color: '#D1D5DB',
    fontSize: 14,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 16,
  },
  planCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#1A1A1F',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  planCardPopular: {
    borderColor: '#FFD700',
    borderWidth: 2,
  },
  planCardDisabled: {
    opacity: 0.6,
  },
  badge: {
    position: 'absolute',
    top: -10,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
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
    marginBottom: 12,
  },
  planName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  planDuration: {
    color: '#9CA3AF',
    fontSize: 12,
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
    color: '#666',
    fontSize: 14,
    textDecorationLine: 'line-through',
    marginTop: 2,
  },
  featuresList: {
    marginBottom: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
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
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectButtonDisabled: {
    backgroundColor: '#444',
  },
  selectButtonText: {
    color: '#0A0A0F',
    fontSize: 16,
    fontWeight: 'bold',
  },
  faqContainer: {
    marginHorizontal: 16,
    padding: 16,
    backgroundColor: '#1A1A1F',
    borderRadius: 12,
  },
  faqItem: {
    marginBottom: 16,
  },
  faqQuestion: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  faqAnswer: {
    color: '#9CA3AF',
    fontSize: 13,
    lineHeight: 20,
  },
  footer: {
    marginTop: 24,
    marginHorizontal: 16,
    alignItems: 'center',
  },
  footerText: {
    color: '#666',
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1A1A1F',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    color: '#666',
    fontSize: 24,
  },
  orderInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
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
    fontSize: 24,
    fontWeight: 'bold',
  },
  paymentTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 16,
  },
  paymentMethods: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  paymentMethod: {
    flex: 1,
    padding: 16,
    backgroundColor: '#2A2A2F',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  paymentMethodSelected: {
    borderColor: '#00F0FF',
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
  },
  paymentIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  paymentText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  checkmark: {
    color: '#00F0FF',
    fontSize: 14,
    marginTop: 4,
  },
  confirmButton: {
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  confirmButtonText: {
    color: '#0A0A0F',
    fontSize: 18,
    fontWeight: 'bold',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  successIcon: {
    fontSize: 64,
    color: '#00F0FF',
    marginBottom: 24,
  },
  successTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  successText: {
    color: '#9CA3AF',
    fontSize: 16,
  },
});
