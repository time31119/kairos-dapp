import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Screen } from '@/components/Screen';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { Ionicons } from '@expo/vector-icons';
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

        {/* Subscribe Section */}
        <View style={styles.subscribeSection}>
          <Text style={styles.sectionTitle}>会员订阅</Text>
          <Text style={styles.sectionSubtitle}>选择适合您的方案</Text>

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
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: '#0A0A0F',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#A0A0B0',
    marginTop: 4,
  },
  subscribeSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#8B8B9A',
    marginBottom: 16,
  },
  planCard: {
    backgroundColor: '#13131A',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1F1F2E',
  },
  planCardRecommended: {
    borderColor: '#00F0FF',
    borderWidth: 2,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  planName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  planSubtitle: {
    fontSize: 13,
    color: '#8B8B9A',
    marginTop: 2,
  },
  recommendedBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recommendedText: {
    fontSize: 12,
    fontWeight: '600',
  },
  planPrice: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  priceCurrency: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B8B9A',
  },
  priceAmount: {
    fontSize: 32,
    fontWeight: '700',
    marginLeft: 2,
  },
  pricePeriod: {
    fontSize: 14,
    color: '#8B8B9A',
    marginLeft: 4,
  },
  planFeatures: {
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#E0E0E0',
    marginLeft: 8,
  },
  planButton: {
    backgroundColor: '#1F1F2E',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  planButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
