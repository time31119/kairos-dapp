import React from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { VIP_PLANS } from '@/utils/vipPlans';

export default function VipScreen() {
  const router = useSafeRouter();

  return (
    <Screen>
      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>会员中心</Text>
          <Text style={styles.headerSubtitle}>解锁高级会员权益</Text>
        </View>

        {/* Subscribe Content */}
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
    </Screen>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 60,
  },
  header: {
    paddingHorizontal: 4,
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#A0A0B0',
    marginTop: 4,
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
    fontWeight: '600' as const,
  },
  planPrice: {
    flexDirection: 'row' as const,
    alignItems: 'baseline' as const,
    marginBottom: 12,
  },
  priceCurrency: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  priceAmount: {
    fontSize: 32,
    fontWeight: '700' as const,
  },
  pricePeriod: {
    fontSize: 14,
    color: '#8B8B9A',
    marginLeft: 4,
  },
  planFeatures: {
    marginBottom: 12,
  },
  featureItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 6,
    gap: 8,
  },
  featureText: {
    fontSize: 13,
    color: '#8B8B9A',
  },
  planButton: {
    backgroundColor: '#1F1F2E',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center' as const,
  },
  planButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600' as const,
  },
};
