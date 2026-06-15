import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Screen } from '@/components/Screen';
import { useRouter as useExpoRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { VIP_PLANS } from '@/utils/vipPlans';

const API_BASE = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || '';

export default function MembershipScreen() {
  const router = useExpoRouter();
  const params = useLocalSearchParams<{ plan?: string }>();
  const planId = params.plan || 'professional';
  const selectedPlan = VIP_PLANS.find((p) => p.id === planId) || VIP_PLANS[1];

  const [selectedBillingCycle, setSelectedBillingCycle] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [isProcessing, setIsProcessing] = useState(false);

  const currentPrice = selectedPlan.price[selectedBillingCycle];

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch(`${API_BASE}/api/v1/vip/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: selectedPlan.id,
          billingCycle: selectedBillingCycle,
          paymentMethod: 'tp_wallet',
        }),
      });

      if (response.ok) {
        Alert.alert('支付成功', `您已成功订阅${selectedPlan.name}`, [
          { text: '确定', onPress: () => router.back() },
        ]);
      } else {
        throw new Error('Payment failed');
      }
    } catch (error) {
      Alert.alert('支付失败', '请稍后重试');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Screen>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>支付详情</Text>
        <View className="w-10" />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Plan Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>订阅方案</Text>
          <View style={styles.planCard}>
            <View style={styles.planInfo}>
              <View style={[styles.planBadge, { backgroundColor: selectedPlan.color + '20' }]}>
                <Text style={[styles.planBadgeText, { color: selectedPlan.color }]}>
                  {selectedPlan.name}
                </Text>
              </View>
              <Text style={styles.planSubtitle}>{selectedPlan.subtitle}</Text>
            </View>
            <View style={styles.planPriceInfo}>
              <Text style={[styles.planPrice, { color: selectedPlan.color }]}>
                ${currentPrice}
              </Text>
              <Text style={styles.planPeriod}>
                /{selectedBillingCycle === 'monthly' ? '月' : selectedBillingCycle === 'quarterly' ? '季' : '年'}
              </Text>
            </View>
          </View>
        </View>

        {/* Billing Cycle */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>订阅周期</Text>
          <View style={styles.cycleContainer}>
            {(['monthly', 'quarterly', 'yearly'] as const).map((cycle) => {
              const isSelected = selectedBillingCycle === cycle;
              const price = selectedPlan.price[cycle];
              const discount = cycle === 'quarterly' ? '省15%' : cycle === 'yearly' ? '省25%' : '';
              
              return (
                <TouchableOpacity
                  key={cycle}
                  style={[styles.cycleCard, isSelected && styles.cycleCardSelected]}
                  onPress={() => setSelectedBillingCycle(cycle)}
                >
                  <Text style={[styles.cycleText, isSelected && styles.cycleTextSelected]}>
                    {cycle === 'monthly' ? '月付' : cycle === 'quarterly' ? '季付' : '年付'}
                  </Text>
                  <Text style={[styles.cyclePrice, isSelected && styles.cyclePriceSelected]}>
                    ${price}
                  </Text>
                  {discount ? (
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountText}>{discount}</Text>
                    </View>
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>包含功能</Text>
          <View style={styles.featuresCard}>
            {selectedPlan.features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <Ionicons
                  name={feature.enabled ? 'checkmark-circle' : 'close-circle'}
                  size={20}
                  color={feature.enabled ? selectedPlan.color : '#4A4A5A'}
                />
                <Text style={[
                  styles.featureText,
                  !feature.enabled && styles.featureTextDisabled
                ]}>
                  {feature.text}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>支付方式</Text>
          <View style={styles.paymentCard}>
            <View style={styles.paymentItem}>
              <Text style={styles.paymentIcon}>💳</Text>
              <Text style={styles.paymentName}>TP 钱包</Text>
              <View style={styles.checkmark}>
                <Ionicons name="checkmark" size={14} color="#FFFFFF" />
              </View>
            </View>
          </View>
        </View>

        {/* Summary */}
        <View style={styles.section}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{selectedPlan.name}</Text>
              <Text style={styles.summaryValue}>${currentPrice}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryTotal}>应付金额</Text>
              <Text style={[styles.summaryTotalValue, { color: selectedPlan.color }]}>
                ${currentPrice}
              </Text>
            </View>
          </View>
        </View>

        {/* Terms */}
        <Text style={styles.termsText}>
          点击立即订阅即表示您同意《会员服务协议》和《自动续费协议》
        </Text>

        {/* Pay Button */}
        <TouchableOpacity
          style={[styles.payButton, { backgroundColor: selectedPlan.color }]}
          onPress={handlePayment}
          disabled={isProcessing}
        >
          <Text style={styles.payButtonText}>
            {isProcessing ? '处理中...' : `立即支付 $${currentPrice}`}
          </Text>
        </TouchableOpacity>

        {/* Bottom Spacing */}
        <View style={{ height: 50 }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#0A0A0F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingTop: 50,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
    paddingHorizontal: 16,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  planCard: {
    backgroundColor: '#13131A',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planInfo: {
    flex: 1,
  },
  planBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  planBadgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  planSubtitle: {
    fontSize: 13,
    color: '#8B8B9A',
    marginTop: 8,
  },
  planPriceInfo: {
    alignItems: 'flex-end',
  },
  planPrice: {
    fontSize: 28,
    fontWeight: '700',
  },
  planPeriod: {
    fontSize: 14,
    color: '#8B8B9A',
  },
  cycleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cycleCard: {
    flex: 1,
    backgroundColor: '#13131A',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1F1F2E',
  },
  cycleCardSelected: {
    borderColor: '#00F0FF',
    borderWidth: 2,
    backgroundColor: '#00F0FF15',
  },
  cycleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8B8B9A',
    marginBottom: 8,
  },
  cycleTextSelected: {
    color: '#FFFFFF',
  },
  cyclePrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#8B8B9A',
  },
  cyclePriceSelected: {
    color: '#00F0FF',
  },
  discountBadge: {
    backgroundColor: '#FF6B6B20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 8,
  },
  discountText: {
    fontSize: 10,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  featuresCard: {
    backgroundColor: '#13131A',
    borderRadius: 16,
    padding: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 15,
    color: '#E0E0E0',
    marginLeft: 12,
  },
  featureTextDisabled: {
    color: '#4A4A5A',
    textDecorationLine: 'line-through',
  },
  paymentCard: {
    backgroundColor: '#13131A',
    borderRadius: 16,
    padding: 16,
  },
  paymentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00F0FF15',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#00F0FF',
  },
  paymentIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  paymentName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  checkmark: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#00F0FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryCard: {
    backgroundColor: '#13131A',
    borderRadius: 16,
    padding: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 15,
    color: '#8B8B9A',
  },
  summaryValue: {
    fontSize: 15,
    color: '#FFFFFF',
  },
  divider: {
    height: 1,
    backgroundColor: '#1F1F2E',
    marginVertical: 12,
  },
  summaryTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  summaryTotalValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  termsText: {
    fontSize: 12,
    color: '#6B6B7B',
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
    lineHeight: 18,
  },
  payButton: {
    marginTop: 24,
    marginHorizontal: 16,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  payButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0A0A0F',
  },
});
