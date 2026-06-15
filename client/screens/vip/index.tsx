import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { VIP_PLANS } from '@/utils/vipPlans';

// 邀请奖励数据
const REFERRAL_REWARDS = {
  link: 'https://kairos.app/inv/kai_',
  code: 'kai_9x7m2k',
  thisMonth: 0,
  pendingReward: 0,
};

const REFERRAL_RULES = [
  { yourPlan: '基础版', reward: '15%', desc: '好友订阅任意套餐' },
  { yourPlan: '专业版', reward: '20%', desc: '好友订阅任意套餐' },
  { yourPlan: '尊享版', reward: '25%', desc: '好友订阅任意套餐' },
];

export default function VipScreen() {
  const router = useSafeRouter();
  const [activeTab, setActiveTab] = useState<'subscribe' | 'referral'>('subscribe');

  return (
    <Screen>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>会员中心</Text>
        <Text style={styles.headerSubtitle}>解锁高级会员权益</Text>
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'subscribe' && styles.tabActive]}
          onPress={() => setActiveTab('subscribe')}
        >
          <Ionicons
            name={activeTab === 'subscribe' ? 'card' : 'card-outline'}
            size={20}
            color={activeTab === 'subscribe' ? '#00F0FF' : '#8B8B9A'}
          />
          <Text style={[styles.tabText, activeTab === 'subscribe' && styles.tabTextActive]}>
            订阅套餐
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'referral' && styles.tabActive]}
          onPress={() => setActiveTab('referral')}
        >
          <Ionicons
            name={activeTab === 'referral' ? 'gift' : 'gift-outline'}
            size={20}
            color={activeTab === 'referral' ? '#00F0FF' : '#8B8B9A'}
          />
          <Text style={[styles.tabText, activeTab === 'referral' && styles.tabTextActive]}>
            邀请奖励
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {activeTab === 'subscribe' ? (
          <SubscribeTab />
        ) : (
          <ReferralTab />
        )}
      </ScrollView>
    </Screen>
  );
}

// 订阅套餐Tab
function SubscribeTab() {
  const router = useSafeRouter();

  return (
    <View style={styles.tabContent}>
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
          onPress={() => router.push('/vip/membership', { plan: plan.id })}
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
  );
}

// 邀请奖励Tab
function ReferralTab() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    // 使用原生复制功能
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <View style={styles.tabContent}>
      {/* 推荐入口 */}
      <View style={styles.referralCard}>
        <Text style={styles.referralTitle}>把 KAIROS 分享给朋友</Text>
        <Text style={styles.referralDesc}>你和他都受益</Text>

        <View style={styles.linkContainer}>
          <View style={styles.linkBox}>
            <Text style={styles.linkText} numberOfLines={1}>
              {REFERRAL_REWARDS.link}{REFERRAL_REWARDS.code}
            </Text>
          </View>
          <TouchableOpacity style={styles.copyButton} onPress={handleCopy}>
            <Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={18} color="#00F0FF" />
            <Text style={styles.copyText}>{copied ? '已复制' : '复制'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inviteCodeContainer}>
          <Text style={styles.inviteCodeLabel}>邀请码</Text>
          <Text style={styles.inviteCode}>{REFERRAL_REWARDS.code}</Text>
        </View>
      </View>

      {/* 我的奖励 */}
      <View style={styles.rewardCard}>
        <Text style={styles.rewardTitle}>我的奖励</Text>

        <View style={styles.rewardRow}>
          <View style={styles.rewardItem}>
            <Text style={styles.rewardValue}>$0.00</Text>
            <Text style={styles.rewardLabel}>本月直接奖励</Text>
          </View>
          <View style={styles.rewardDivider} />
          <View style={styles.rewardItem}>
            <Text style={styles.rewardValue}>$0.00</Text>
            <Text style={styles.rewardLabel}>推广支持奖励</Text>
          </View>
        </View>

        <Text style={styles.rewardHint}>奖励自动到账TP钱包，无门槛</Text>
      </View>

      {/* 奖励规则 */}
      <View style={styles.rulesCard}>
        <Text style={styles.rulesTitle}>邀请奖励规则</Text>
        <Text style={styles.rulesSubtitle}>把 KAIROS 推荐给真正需要的人</Text>

        <View style={styles.rulesTable}>
          <View style={styles.rulesHeader}>
            <Text style={[styles.rulesCell, styles.rulesCellFlex]}>你的套餐</Text>
            <Text style={[styles.rulesCell, styles.rulesCellCenter]}>奖励比例</Text>
            <Text style={[styles.rulesCell, styles.rulesCellRight]}>条件</Text>
          </View>
          {REFERRAL_RULES.map((rule, i) => (
            <View key={i} style={styles.rulesRow}>
              <Text style={[styles.rulesCell, styles.rulesCellFlex]}>{rule.yourPlan}</Text>
              <Text style={[styles.rulesCell, styles.rulesCellCenter, { color: '#00F0FF' }]}>
                {rule.reward}
              </Text>
              <Text style={[styles.rulesCell, styles.rulesCellRight]}>{rule.desc}</Text>
            </View>
          ))}
        </View>

        <View style={styles.rulesNote}>
          <Ionicons name="information-circle-outline" size={16} color="#8B8B9A" />
          <Text style={styles.rulesNoteText}>
            好友订阅成功，当月奖励自动发放到TP钱包
          </Text>
        </View>
      </View>

      {/* 推荐记录 */}
      <View style={styles.recordsCard}>
        <Text style={styles.recordsTitle}>推荐记录</Text>
        <Text style={styles.recordsEmpty}>暂无推荐记录</Text>
        <Text style={styles.recordsHint}>分享你的邀请链接，开始赚取奖励</Text>
      </View>
    </View>
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
    paddingBottom: 12,
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
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#13131A',
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  tabActive: {
    backgroundColor: '#1F1F2E',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B8B9A',
  },
  tabTextActive: {
    color: '#00F0FF',
  },
  tabContent: {
    padding: 16,
  },
  subscribeHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  subscribeTitle: {
    fontSize: 24,
    fontWeight: '700',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  planName: {
    fontSize: 18,
    fontWeight: '600',
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
    fontWeight: '600',
  },
  planPrice: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  priceCurrency: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
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
  // 邀请奖励样式
  referralCard: {
    backgroundColor: '#13131A',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1F1F2E',
  },
  referralTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  referralDesc: {
    fontSize: 14,
    color: '#00F0FF',
    textAlign: 'center',
    marginTop: 4,
  },
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    gap: 10,
  },
  linkBox: {
    flex: 1,
    backgroundColor: '#0A0A0F',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  linkText: {
    fontSize: 13,
    color: '#A0A0B0',
    fontFamily: 'monospace',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00F0FF20',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  copyText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#00F0FF',
  },
  inviteCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 8,
  },
  inviteCodeLabel: {
    fontSize: 13,
    color: '#8B8B9A',
  },
  inviteCode: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'monospace',
  },
  rewardCard: {
    backgroundColor: '#13131A',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1F1F2E',
  },
  rewardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rewardItem: {
    flex: 1,
    alignItems: 'center',
  },
  rewardDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#1F1F2E',
  },
  rewardValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#00F0FF',
  },
  rewardLabel: {
    fontSize: 12,
    color: '#8B8B9A',
    marginTop: 4,
  },
  rewardHint: {
    fontSize: 12,
    color: '#6B6B7A',
    textAlign: 'center',
    marginTop: 16,
  },
  rulesCard: {
    backgroundColor: '#13131A',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1F1F2E',
  },
  rulesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  rulesSubtitle: {
    fontSize: 12,
    color: '#8B8B9A',
    marginTop: 4,
    marginBottom: 16,
  },
  rulesTable: {
    backgroundColor: '#0A0A0F',
    borderRadius: 10,
    overflow: 'hidden',
  },
  rulesHeader: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#1F1F2E',
  },
  rulesRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: '#1F1F2E',
  },
  rulesCell: {
    fontSize: 13,
    color: '#E0E0E0',
  },
  rulesCellFlex: {
    flex: 1,
  },
  rulesCellCenter: {
    textAlign: 'center',
    width: 70,
  },
  rulesCellRight: {
    textAlign: 'right',
    width: 90,
  },
  rulesNote: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 6,
  },
  rulesNoteText: {
    fontSize: 12,
    color: '#8B8B9A',
    flex: 1,
  },
  recordsCard: {
    backgroundColor: '#13131A',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1F1F2E',
    alignItems: 'center',
  },
  recordsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  recordsEmpty: {
    fontSize: 14,
    color: '#6B6B7A',
  },
  recordsHint: {
    fontSize: 12,
    color: '#8B8B9A',
    marginTop: 8,
  },
});
