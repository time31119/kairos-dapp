import React, { useState, useEffect } from 'react';
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

    {/* 功能对比 */}
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>功能对比</Text>
      <View style={styles.compareTable}>
        <View style={styles.compareHeader}>
          <Text style={[styles.compareCell, styles.compareCellTitle]}>功能</Text>
          <Text style={[styles.compareCell, styles.compareCellCenter]}>基础版</Text>
          <Text style={[styles.compareCell, styles.compareCellCenter]}>专业版</Text>
          <Text style={[styles.compareCell, styles.compareCellCenter]}>尊享版</Text>
        </View>
        {[
          { name: '行情赛道', basic: '6大', pro: '全部', vip: '全部' },
          { name: '筛选条件', basic: '30条', pro: '无限', vip: '无限' },
          { name: '资讯推送', basic: '每日', pro: '实时', vip: '实时' },
          { name: '技术分析', basic: '❌', pro: '✅', vip: '✅' },
          { name: '基础跟单', basic: '❌', pro: '✅', vip: '✅' },
          { name: '智能跟单', basic: '❌', pro: '❌', vip: '✅' },
          { name: '完整API', basic: '❌', pro: '❌', vip: '✅' },
        ].map((row, idx) => (
          <View key={idx} style={[styles.compareRow, idx % 2 === 1 && { backgroundColor: '#14141A' }]}>
            <Text style={[styles.compareCell, styles.compareCellTitle]}>{row.name}</Text>
            <Text style={[styles.compareCell, styles.compareCellCenter]}>{row.basic}</Text>
            <Text style={[styles.compareCell, styles.compareCellCenter]}>{row.pro}</Text>
            <Text style={[styles.compareCell, styles.compareCellCenter]}>{row.vip}</Text>
          </View>
        ))}
      </View>
    </View>

    {/* 常见问题 */}
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>常见问题</Text>
      {[
        { q: '订阅后可以退款吗？', a: '订阅服务不支持退款，请在购买前充分了解产品功能。' },
        { q: '如何取消订阅？', a: '可以在设置中随时取消订阅，取消后当前周期内仍可使用。' },
        { q: '支持哪些支付方式？', a: '支持TP钱包支付（TRC20/TRC20/ERC20）。' },
        { q: '套餐可以升级吗？', a: '可以随时升级到更高级别，按差价补齐即可。' },
        { q: '邀请奖励如何发放？', a: '好友订阅成功后，奖励自动发放到您的TP钱包。' },
      ].map((item, idx) => (
        <View key={idx} style={styles.faqItem}>
          <Text style={styles.faqQuestion}>Q: {item.q}</Text>
          <Text style={styles.faqAnswer}>A: {item.a}</Text>
        </View>
      ))}
    </View>
  );
}

// 邀请奖励Tab
function ReferralTab() {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    referralLink: 'https://kairos.app/inv/kai_',
    referralCode: 'kai_9x7m2k',
    thisMonthReward: 0,
    pendingReward: 0,
    totalReferrals: 0,
  });
  const [records, setRecords] = useState<any[]>([]);

  // 获取邀请数据
  const fetchData = async () => {
    try {
      setLoading(true);
      const API_BASE = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || '';
      
      // 获取统计数据
      const statsRes = await fetch(`${API_BASE}/api/v1/referral/info?userId=default_user`);
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        if (statsData.data) {
          setStats(prev => ({ 
            ...prev, 
            thisMonthReward: statsData.data.directReward + statsData.data.monthlySupportReward,
            totalReferrals: statsData.data.totalReferrals 
          }));
        }
      }
      
      // 获取推荐记录
      const recordsRes = await fetch(`${API_BASE}/api/v1/referral/records`);
      if (recordsRes.ok) {
        const recordsData = await recordsRes.json();
        setRecords(recordsData.records || []);
      }
    } catch (error) {
      console.error('Failed to fetch referral data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCopy = async () => {
    const fullLink = `${stats.referralLink}${stats.referralCode}`;
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const referralLink = `${stats.referralLink}${stats.referralCode}`;

  return (
    <View style={styles.tabContent}>
      {/* 推荐入口 */}
      <View style={styles.referralCard}>
        <Text style={styles.referralTitle}>把 KAIROS 分享给朋友</Text>
        <Text style={styles.referralDesc}>你和他都受益</Text>

        <View style={styles.linkContainer}>
          <View style={styles.linkBox}>
            <Text style={styles.linkText} numberOfLines={1}>
              {referralLink}
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
  // 功能对比
  comparisonSection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  comparisonHeader: {
    backgroundColor: '#0A0A0F',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  comparisonTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  comparisonSubtitle: {
    fontSize: 12,
    color: '#8B8B9A',
  },
  comparisonTable: {
    backgroundColor: '#13131A',
    borderRadius: 12,
    overflow: 'hidden',
  },
  comparisonRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F2E',
  },
  comparisonFeature: {
    flex: 1,
    padding: 12,
  },
  comparisonFeatureText: {
    fontSize: 12,
    color: '#8B8B9A',
  },
  comparisonCell: {
    width: 80,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  comparisonCheck: {
    fontSize: 16,
  },
  // 常见问题
  faqSection: {
    marginTop: 24,
    paddingHorizontal: 16,
    marginBottom: 100,
  },
  faqHeader: {
    flexDirection: 'row',
    backgroundColor: '#0A0A0F',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  faqItem: {
    backgroundColor: '#13131A',
    borderRadius: 12,
    marginBottom: 8,
    overflow: 'hidden',
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  faqQuestionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  faqAnswerText: {
    fontSize: 13,
    color: '#8B8B9A',
    lineHeight: 20,
  },
});
