import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { VIP_PLANS } from '@/utils/vipPlans';
import { getApiBase } from '@/utils/apiConfig';

// 邀请奖励规则
const REFERRAL_RULES = [
  { yourPlan: '基础版', reward: '15%', desc: '好友订阅任意套餐' },
  { yourPlan: '专业版', reward: '20%', desc: '好友订阅任意套餐' },
  { yourPlan: '尊享版', reward: '25%', desc: '好友订阅任意套餐' },
];

// 常见问题数据
const FAQ_DATA = [
  { q: '订阅后可以退款吗？', a: '订阅服务不支持退款，请在购买前充分了解产品功能。' },
  { q: '如何取消订阅？', a: '可以在设置中随时取消订阅，取消后当前周期内仍可使用。' },
  { q: '支持哪些支付方式？', a: '支持TP钱包支付（TRC20/TRC20/ERC20）。' },
  { q: '套餐可以升级吗？', a: '可以随时升级到更高级别，按差价补齐即可。' },
  { q: '邀请奖励如何发放？', a: '好友订阅成功后，奖励自动发放到您的TP钱包。' },
];

export default function VipScreen() {
  const [activeTab, setActiveTab] = useState<'subscribe' | 'referral'>('subscribe');

  return (
    <Screen>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>会员中心</Text>
              <Text style={styles.headerSubtitle}>解锁高级会员权益</Text>
            </View>
            <View style={styles.headerBadge}>
              <Ionicons name="diamond" size={16} color="#00F0FF" />
              <Text style={styles.headerBadgeText}>KAIROS VIP</Text>
            </View>
          </View>
        </View>

        {/* Tab Bar */}
        <View style={styles.tabBarContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'subscribe' && styles.tabActive]}
          onPress={() => setActiveTab('subscribe')}
        >
          <Ionicons
            name={activeTab === 'subscribe' ? 'card' : 'card-outline'}
            size={18}
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
            size={18}
            color={activeTab === 'referral' ? '#00F0FF' : '#8B8B9A'}
          />
          <Text style={[styles.tabText, activeTab === 'referral' && styles.tabTextActive]}>
            邀请奖励
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
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
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  return (
    <View style={styles.tabContent}>
      {/* VIP Banner */}
      <View style={styles.vipBanner}>
        <View style={styles.vipBannerLeft}>
          <View style={styles.vipIconContainer}>
            <Ionicons name="diamond" size={28} color="#00F0FF" />
          </View>
          <View style={styles.vipBannerText}>
            <Text style={styles.vipBannerTitle}>成为尊享会员</Text>
            <Text style={styles.vipBannerSubtitle}>解锁全部高级功能</Text>
          </View>
        </View>
        <View style={styles.vipBannerRight}>
          <View style={styles.vipPriceTag}>
            <Text style={styles.vipPriceValue}>$99</Text>
            <Text style={styles.vipPriceUnit}>/月</Text>
          </View>
        </View>
      </View>

      {/* 套餐卡片 */}
      <View style={styles.plansContainer}>
        {VIP_PLANS.map((plan) => (
          <TouchableOpacity
            key={plan.id}
            style={[
              styles.planCard,
              plan.recommended && styles.planCardRecommended
            ]}
            onPress={() => router.push('/vip/membership', { plan: plan.id })}
            activeOpacity={0.8}
          >
            {plan.recommended && (
              <View style={[styles.planRecommendBadge, { backgroundColor: plan.color }]}>
                <Text style={styles.planRecommendBadgeText}>推荐</Text>
              </View>
            )}
            
            <View style={styles.planHeader}>
              <View style={[styles.planIconContainer, { backgroundColor: plan.color + '20' }]}>
                <Ionicons 
                  name={plan.id === 'basic' ? 'star-outline' : plan.id === 'professional' ? 'flash' : 'diamond'} 
                  size={24} 
                  color={plan.color} 
                />
              </View>
              <View style={styles.planInfo}>
                <Text style={styles.planName}>{plan.name}</Text>
                <Text style={styles.planSubtitle}>{plan.subtitle}</Text>
              </View>
            </View>

            <View style={styles.planPriceRow}>
              <Text style={styles.planCurrency}>$</Text>
              <Text style={[styles.planPrice, { color: plan.color }]}>{plan.price.monthly}</Text>
              <Text style={styles.planPeriod}>/月</Text>
            </View>

            <View style={styles.planFeatures}>
              {plan.features.filter(f => f.enabled).slice(0, 3).map((feature, i) => (
                <View key={i} style={styles.planFeatureItem}>
                  <Ionicons name="checkmark-circle" size={14} color={plan.color} />
                  <Text style={styles.planFeatureText}>{feature.text}</Text>
                </View>
              ))}
              {plan.features.filter(f => f.enabled).length > 3 && (
                <Text style={styles.planMoreFeatures}>
                  +{plan.features.filter(f => f.enabled).length - 3} 更多权益
                </Text>
              )}
            </View>

            <View style={[styles.planButton, plan.recommended && { backgroundColor: plan.color }]}>
              <Text style={[styles.planButtonText, plan.recommended && { color: '#0A0A0F' }]}>
                立即开通
              </Text>
              <Ionicons name="arrow-forward" size={16} color={plan.recommended ? '#0A0A0F' : '#FFFFFF'} />
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* 功能对比 */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>功能对比</Text>
          <Text style={styles.sectionSubtitle}>选择适合您的套餐</Text>
        </View>
        <View style={styles.comparisonTable}>
          <View style={styles.comparisonHeader}>
            <Text style={styles.comparisonHeaderCell}>功能</Text>
            <Text style={styles.comparisonHeaderCell}>基础版</Text>
            <Text style={styles.comparisonHeaderCell}>专业版</Text>
            <Text style={styles.comparisonHeaderCell}>尊享版</Text>
          </View>
          {[
            { name: '行情赛道', basic: '6大', pro: '全部', vip: '全部', highlight: false },
            { name: '筛选条件', basic: '30条', pro: '无限', vip: '无限', highlight: false },
            { name: '资讯推送', basic: '每日', pro: '实时', vip: '实时', highlight: false },
            { name: '技术分析', basic: '—', pro: '✓', vip: '✓', highlight: true },
            { name: '基础跟单', basic: '—', pro: '✓', vip: '✓', highlight: true },
            { name: '智能跟单', basic: '—', pro: '—', vip: '✓', highlight: true },
            { name: '完整API', basic: '—', pro: '—', vip: '✓', highlight: true },
          ].map((row, idx) => (
            <View 
              key={idx} 
              style={[
                styles.comparisonRow, 
                idx % 2 === 1 && styles.comparisonRowAlt,
                row.highlight && styles.comparisonRowHighlight
              ]}
            >
              <Text style={styles.comparisonCellName}>{row.name}</Text>
              <Text style={[styles.comparisonCell, row.basic === '✓' && styles.comparisonCellCheck]}>{row.basic}</Text>
              <Text style={[styles.comparisonCell, row.pro === '✓' && styles.comparisonCellCheck]}>{row.pro}</Text>
              <Text style={[styles.comparisonCell, row.vip === '✓' && styles.comparisonCellCheck]}>{row.vip}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 常见问题 */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>常见问题</Text>
        </View>
        {FAQ_DATA.map((item, idx) => (
          <TouchableOpacity 
            key={idx} 
            style={styles.faqItem}
            onPress={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
            activeOpacity={0.7}
          >
            <View style={styles.faqQuestion}>
              <Text style={styles.faqQuestionText}>Q: {item.q}</Text>
              <Ionicons 
                name={expandedFaq === idx ? 'chevron-up' : 'chevron-down'} 
                size={18} 
                color="#8B8B9A" 
              />
            </View>
            {expandedFaq === idx && (
              <View style={styles.faqAnswer}>
                <Text style={styles.faqAnswerText}>A: {item.a}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.bottomPadding} />
    </View>
  );
}

// 邀请奖励Tab
function ReferralTab() {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    referralLink: '',
    referralCode: '',
    thisMonthReward: 0,
    pendingReward: 0,
    totalReferrals: 0,
  });
  const [records] = useState<any[]>([]);

  // 生成唯一的邀请码
  const generateInviteCode = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let code = 'kai_';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  // 获取或生成用户邀请码
  const getUserInviteCode = async (): Promise<string> => {
    try {
      // 优先从 AsyncStorage 获取已保存的邀请码
      const saved = await AsyncStorage.getItem('kairos_invite_code');
      if (saved) return saved;
      
      // 生成新的邀请码并保存
      const newCode = generateInviteCode();
      await AsyncStorage.setItem('kairos_invite_code', newCode);
      return newCode;
    } catch (error) {
      // 降级方案：生成临时邀请码
      return generateInviteCode();
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const API_BASE = getApiBase();
      
      // 获取用户唯一标识
      let userId = 'default_user';
      try {
        const storedUserId = await AsyncStorage.getItem('kairos_user_id');
        if (storedUserId) userId = storedUserId;
      } catch (e) {}
      
      // 从后端获取邀请信息
      const statsRes = await fetch(`${API_BASE}/api/v1/referral/info?userId=${userId}`);
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        if (statsData.data && statsData.data.inviteCode) {
          setStats(prev => ({ 
            ...prev, 
            referralCode: statsData.data.inviteCode,
            referralLink: `${getApiBase()}/inv/${statsData.data.inviteCode}`,
            thisMonthReward: statsData.data.directReward + statsData.data.monthlySupportReward,
            totalReferrals: statsData.data.totalReferrals 
          }));
        } else {
          // 后端没有邀请码，使用本地生成的
          const localCode = await getUserInviteCode();
          setStats(prev => ({ 
            ...prev, 
            referralCode: localCode,
            referralLink: `${getApiBase()}/inv/${localCode}`
          }));
        }
      } else {
        const localCode = await getUserInviteCode();
        setStats(prev => ({ 
          ...prev, 
          referralCode: localCode,
          referralLink: `${getApiBase()}/inv/${localCode}`
        }));
      }
    } catch (error) {
      console.error('Failed to fetch referral data:', error);
      // 使用本地生成的邀请码
      const localCode = await getUserInviteCode();
      setStats(prev => ({ 
        ...prev, 
        referralCode: localCode,
        referralLink: `${getApiBase()}/inv/${localCode}`
      }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCopy = async () => {
    try {
      // Web 环境使用 navigator.clipboard
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(referralLink);
      } else {
        // 降级方案：使用 selection API
        const textArea = document.createElement('textarea');
        textArea.value = referralLink;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  const referralLink = `${stats.referralLink}${stats.referralCode}`;

  return (
    <View style={styles.tabContent}>
      {/* 收益概览 */}
      <View style={styles.earningsCard}>
        <View style={styles.earningsHeader}>
          <View>
            <Text style={styles.earningsTitle}>本月收益</Text>
            <View style={styles.earningsValueRow}>
              <Text style={styles.earningsValue}>${stats.thisMonthReward.toFixed(2)}</Text>
              <View style={styles.earningsBadge}>
                <Ionicons name="trending-up" size={12} color="#00FF88" />
                <Text style={styles.earningsBadgeText}>实时更新</Text>
              </View>
            </View>
          </View>
          <View style={styles.earningsIconContainer}>
            <Ionicons name="wallet" size={32} color="#00F0FF" />
          </View>
        </View>
        
        <View style={styles.earningsStats}>
          <View style={styles.earningsStatItem}>
            <Text style={styles.earningsStatValue}>{stats.totalReferrals}</Text>
            <Text style={styles.earningsStatLabel}>成功推荐</Text>
          </View>
          <View style={styles.earningsStatDivider} />
          <View style={styles.earningsStatItem}>
            <Text style={styles.earningsStatValue}>${stats.pendingReward.toFixed(2)}</Text>
            <Text style={styles.earningsStatLabel}>待发放</Text>
          </View>
          <View style={styles.earningsStatDivider} />
          <View style={styles.earningsStatItem}>
            <Text style={styles.earningsStatValue}>25%</Text>
            <Text style={styles.earningsStatLabel}>最高奖励</Text>
          </View>
        </View>
      </View>

      {/* 分享卡片 */}
      <View style={styles.shareCard}>
        <View style={styles.shareHeader}>
          <View style={styles.shareIconContainer}>
            <Ionicons name="share-social" size={24} color="#00F0FF" />
          </View>
          <View>
            <Text style={styles.shareTitle}>邀请好友赚奖励</Text>
            <Text style={styles.shareSubtitle}>好友订阅，最高返25%</Text>
          </View>
        </View>

        <View style={styles.shareLinkContainer}>
          <View style={styles.shareLinkBox}>
            <Text style={styles.shareLinkText} numberOfLines={1}>
              {referralLink}
            </Text>
          </View>
          <TouchableOpacity 
            style={[styles.shareCopyButton, copied && styles.shareCopyButtonDone]} 
            onPress={handleCopy}
          >
            <Ionicons name={copied ? 'checkmark' : 'copy'} size={18} color="#0A0A0F" />
            <Text style={styles.shareCopyText}>{copied ? '已复制' : '复制'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.shareCodeContainer}>
          <Text style={styles.shareCodeLabel}>邀请码</Text>
          <View style={styles.shareCodeBox}>
            <Text style={styles.shareCode}>{stats.referralCode}</Text>
          </View>
        </View>
      </View>

      {/* 奖励规则 */}
      <View style={styles.rulesCard}>
        <Text style={styles.rulesTitle}>奖励规则</Text>
        
        <View style={styles.rulesContainer}>
          {REFERRAL_RULES.map((rule, i) => (
            <View key={i} style={styles.ruleItem}>
              <View style={[styles.ruleBadge, { backgroundColor: i === 0 ? '#4F46E5' : i === 1 ? '#7C3AED' : '#00F0FF' }]}>
                <Text style={styles.ruleBadgeText}>{rule.yourPlan}</Text>
              </View>
              <View style={styles.ruleContent}>
                <Text style={styles.ruleReward}>{rule.reward}</Text>
                <Text style={styles.ruleDesc}>{rule.desc}</Text>
              </View>
              <View style={styles.ruleArrow}>
                <Ionicons name="arrow-forward" size={16} color="#8B8B9A" />
              </View>
            </View>
          ))}
        </View>

        <View style={styles.rulesNote}>
          <Ionicons name="information-circle" size={16} color="#00F0FF" />
          <Text style={styles.rulesNoteText}>
            好友订阅成功，当月奖励自动发放到TP钱包
          </Text>
        </View>
      </View>

      {/* 推荐记录 */}
      <View style={styles.recordsCard}>
        <View style={styles.recordsHeader}>
          <Text style={styles.recordsTitle}>推荐记录</Text>
          <TouchableOpacity>
            <Text style={styles.recordsMore}>查看全部</Text>
          </TouchableOpacity>
        </View>
        
        {records.length === 0 ? (
          <View style={styles.recordsEmpty}>
            <Ionicons name="people-outline" size={48} color="#3F3F5A" />
            <Text style={styles.recordsEmptyText}>暂无推荐记录</Text>
            <Text style={styles.recordsEmptyHint}>分享您的邀请链接开始赚取奖励</Text>
          </View>
        ) : (
          <View style={styles.recordsList}>
            {records.map((record, idx) => (
              <View key={idx} style={styles.recordItem}>
                <View style={styles.recordAvatar}>
                  <Ionicons name="person" size={20} color="#8B8B9A" />
                </View>
                <View style={styles.recordInfo}>
                  <Text style={styles.recordName}>用户 #{idx + 1}</Text>
                  <Text style={styles.recordTime}>刚刚</Text>
                </View>
                <View style={styles.recordReward}>
                  <Text style={styles.recordRewardValue}>+$0.00</Text>
                  <Text style={styles.recordRewardStatus}>待确认</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* 推广小贴士 */}
      <View style={styles.tipsCard}>
        <View style={styles.tipsIconContainer}>
          <Ionicons name="bulb" size={20} color="#FBBF24" />
        </View>
        <View style={styles.tipsContent}>
          <Text style={styles.tipsTitle}>推广小贴士</Text>
          <Text style={styles.tipsText}>分享到社交媒体或社群，邀请真正需要KAIROS的用户，成功率更高哦！</Text>
        </View>
      </View>

      <View style={styles.bottomPadding} />
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
    paddingBottom: 8,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8B8B9A',
    marginTop: 4,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00F0FF15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  headerBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#00F0FF',
  },
  tabBarContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#13131A',
    gap: 8,
  },
  tabActive: {
    backgroundColor: '#00F0FF15',
    borderWidth: 1,
    borderColor: '#00F0FF40',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#8B8B9A',
  },
  tabTextActive: {
    color: '#00F0FF',
  },
  tabContent: {
    padding: 20,
  },
  // VIP Banner
  vipBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#13131A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#00F0FF30',
  },
  vipBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  vipIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#00F0FF15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vipBannerText: {},
  vipBannerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  vipBannerSubtitle: {
    fontSize: 12,
    color: '#8B8B9A',
    marginTop: 2,
  },
  vipBannerRight: {},
  vipPriceTag: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: '#00F0FF15',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  vipPriceValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#00F0FF',
  },
  vipPriceUnit: {
    fontSize: 12,
    color: '#8B8B9A',
  },
  // 套餐卡片
  plansContainer: {
    gap: 16,
  },
  planCard: {
    backgroundColor: '#13131A',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1F1F2E',
  },
  planCardRecommended: {
    borderColor: '#00F0FF',
    borderWidth: 2,
    backgroundColor: '#13131A',
  },
  planRecommendBadge: {
    position: 'absolute',
    top: -10,
    right: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  planRecommendBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0A0A0F',
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  planIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  planSubtitle: {
    fontSize: 12,
    color: '#8B8B9A',
    marginTop: 2,
  },
  planPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  planCurrency: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  planPrice: {
    fontSize: 36,
    fontWeight: '800',
    marginLeft: 2,
  },
  planPeriod: {
    fontSize: 14,
    color: '#8B8B9A',
    marginLeft: 4,
  },
  planFeatures: {
    marginBottom: 16,
  },
  planFeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  planFeatureText: {
    fontSize: 13,
    color: '#E0E0E0',
  },
  planMoreFeatures: {
    fontSize: 12,
    color: '#00F0FF',
    marginTop: 4,
  },
  planButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1F1F2E',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  planButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // 通用Section
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#8B8B9A',
    marginTop: 2,
  },
  // 功能对比
  comparisonTable: {
    backgroundColor: '#13131A',
    borderRadius: 12,
    overflow: 'hidden',
  },
  comparisonHeader: {
    flexDirection: 'row',
    backgroundColor: '#1F1F2E',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  comparisonHeaderCell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  comparisonRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F2E',
  },
  comparisonRowAlt: {
    backgroundColor: '#14141A',
  },
  comparisonRowHighlight: {},
  comparisonCellName: {
    flex: 1,
    fontSize: 12,
    color: '#E0E0E0',
  },
  comparisonCell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    color: '#8B8B9A',
  },
  comparisonCellCheck: {
    color: '#00F0FF',
    fontWeight: '600',
  },
  // 常见问题
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
    fontWeight: '500',
    color: '#FFFFFF',
    marginRight: 8,
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
  bottomPadding: {
    height: 40,
  },
  // 邀请奖励页面样式
  earningsCard: {
    backgroundColor: '#13131A',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#00F0FF30',
  },
  earningsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  earningsTitle: {
    fontSize: 14,
    color: '#8B8B9A',
    marginBottom: 4,
  },
  earningsValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  earningsValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#00F0FF',
  },
  earningsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00FF8815',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  earningsBadgeText: {
    fontSize: 10,
    color: '#00FF88',
  },
  earningsIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#00F0FF15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  earningsStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A0A0F',
    borderRadius: 12,
    padding: 16,
  },
  earningsStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  earningsStatDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#1F1F2E',
  },
  earningsStatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  earningsStatLabel: {
    fontSize: 11,
    color: '#8B8B9A',
    marginTop: 4,
  },
  shareCard: {
    backgroundColor: '#13131A',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1F1F2E',
  },
  shareHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  shareIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#00F0FF15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  shareSubtitle: {
    fontSize: 12,
    color: '#00F0FF',
    marginTop: 2,
  },
  shareLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  shareLinkBox: {
    flex: 1,
    backgroundColor: '#0A0A0F',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  shareLinkText: {
    fontSize: 13,
    color: '#A0A0B0',
  },
  shareCopyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00F0FF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  shareCopyButtonDone: {
    backgroundColor: '#00FF88',
  },
  shareCopyText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0A0A0F',
  },
  shareCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 12,
  },
  shareCodeLabel: {
    fontSize: 13,
    color: '#8B8B9A',
  },
  shareCodeBox: {
    backgroundColor: '#0A0A0F',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  shareCode: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'monospace',
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
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  rulesContainer: {
    gap: 12,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A0A0F',
    borderRadius: 12,
    padding: 14,
    gap: 12,
  },
  ruleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  ruleBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0A0A0F',
  },
  ruleContent: {
    flex: 1,
  },
  ruleReward: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  ruleDesc: {
    fontSize: 11,
    color: '#8B8B9A',
    marginTop: 2,
  },
  ruleArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#13131A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rulesNote: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 6,
    backgroundColor: '#00F0FF10',
    padding: 12,
    borderRadius: 8,
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
  },
  recordsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  recordsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  recordsMore: {
    fontSize: 13,
    color: '#00F0FF',
  },
  recordsEmpty: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  recordsEmptyText: {
    fontSize: 14,
    color: '#6B6B7A',
    marginTop: 12,
  },
  recordsEmptyHint: {
    fontSize: 12,
    color: '#8B8B9A',
    marginTop: 4,
  },
  recordsList: {
    gap: 12,
  },
  recordItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  recordAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1F1F2E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordInfo: {
    flex: 1,
  },
  recordName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  recordTime: {
    fontSize: 12,
    color: '#8B8B9A',
    marginTop: 2,
  },
  recordReward: {
    alignItems: 'flex-end',
  },
  recordRewardValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00F0FF',
  },
  recordRewardStatus: {
    fontSize: 11,
    color: '#8B8B9A',
    marginTop: 2,
  },
  tipsCard: {
    flexDirection: 'row',
    backgroundColor: '#13131A',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#FBBF2420',
  },
  tipsIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FBBF2415',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipsContent: {
    flex: 1,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  tipsText: {
    fontSize: 12,
    color: '#8B8B9A',
    marginTop: 4,
    lineHeight: 18,
  },
});
