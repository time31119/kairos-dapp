/**
 * VIP 开通状态页
 * 显示当前订阅状态、到期时间
 */
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Link } from 'expo-router';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9091';

interface SubscriptionInfo {
  hasActive: boolean;
  subscription: {
    id: string;
    tier: string;
    tierName: string;
    status: string;
    price: number;
    activated_at: string;
    expire_at: string;
    created_at: string;
  } | null;
  tier: string | null;
  status: string | null;
  expireAt: string | null;
  activatedAt: string | null;
}

const TIER_NAMES: Record<string, string> = {
  silver: '白银版',
  gold: '黄金版',
  diamond: '钻石版',
};

const TIER_COLORS: Record<string, string> = {
  silver: '#9CA3AF',
  gold: '#F59E0B',
  diamond: '#06B6D4',
};

export default function VipStatusScreen() {
  const router = useSafeRouter();
  const [loading, setLoading] = useState(true);
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 获取钱包地址
  const getWalletAddress = async () => {
    try {
      return await AsyncStorage.getItem('wallet_address') || 
             await AsyncStorage.getItem('invite_code') || '';
    } catch {
      return '';
    }
  };

  // 获取订阅状态
  const fetchSubscriptionStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const walletAddress = await getWalletAddress();
      const response = await fetch(`${API_BASE}/api/v1/subscription/current`, {
        headers: {
          'x-wallet-address': walletAddress,
        },
      });
      
      const result = await response.json();
      
      if (result.success) {
        setSubscriptionInfo(result.data);
      } else {
        setError(result.message || '获取订阅状态失败');
      }
    } catch (err: any) {
      setError('网络错误，请稍后重试');
      console.error('获取订阅状态失败:', err);
    }
    
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchSubscriptionStatus();
    }, [fetchSubscriptionStatus])
  );

  // 格式化日期
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 计算剩余天数
  const getRemainingDays = (expireAt: string | null) => {
    if (!expireAt) return 0;
    const now = new Date();
    const expire = new Date(expireAt);
    const diffTime = expire.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  // 前往订阅管理
  const handleManageSubscription = () => {
    router.push('/subscription-manage');
  };

  // 前往订阅
  const handleSubscribe = () => {
    router.push('/membership');
  };

  if (loading) {
    return (
      <Screen>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F59E0B" />
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchSubscriptionStatus}>
            <Text style={styles.retryButtonText}>重试</Text>
          </TouchableOpacity>
        </View>
      </Screen>
    );
  }

  const isActive = subscriptionInfo?.hasActive;
  const subscription = subscriptionInfo?.subscription;
  const tier = subscription?.tier || subscriptionInfo?.tier;
  const tierName = TIER_NAMES[tier || ''] || (subscription?.tierName || '未订阅');
  const tierColor = TIER_COLORS[tier || ''] || '#9CA3AF';
  const remainingDays = getRemainingDays(subscription?.expire_at || subscriptionInfo?.expireAt);

  return (
    <Screen>
      <ScrollView style={styles.container}>
        {/* 头部 */}
        <View style={styles.header}>
          <Link href="/membership" style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </Link>
          <Text style={styles.headerTitle}>VIP 状态</Text>
          <View style={styles.headerRight} />
        </View>

        {/* VIP 状态卡片 */}
        <View style={[styles.vipCard, { borderColor: isActive ? tierColor : '#374151' }]}>
          <View style={styles.vipHeader}>
            <View style={[styles.vipBadge, { backgroundColor: tierColor }]}>
              <Text style={styles.vipBadgeText}>
                {isActive ? 'VIP' : 'FREE'}
              </Text>
            </View>
            <Text style={[styles.vipTier, { color: tierColor }]}>
              {tierName}
            </Text>
          </View>

          {isActive ? (
            <>
              <View style={styles.statusInfo}>
                <View style={styles.statusItem}>
                  <Text style={styles.statusLabel}>订阅状态</Text>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusBadgeText}>已开通</Text>
                  </View>
                </View>
                
                <View style={styles.statusItem}>
                  <Text style={styles.statusLabel}>剩余天数</Text>
                  <Text style={styles.remainingDays}>{remainingDays} 天</Text>
                </View>
              </View>

              <View style={styles.dateInfo}>
                <View style={styles.dateRow}>
                  <Text style={styles.dateLabel}>开通时间</Text>
                  <Text style={styles.dateValue}>
                    {formatDate(subscription?.activated_at || subscriptionInfo?.activatedAt)}
                  </Text>
                </View>
                <View style={styles.dateRow}>
                  <Text style={styles.dateLabel}>到期时间</Text>
                  <Text style={styles.dateValueHighlight}>
                    {formatDate(subscription?.expire_at || subscriptionInfo?.expireAt)}
                  </Text>
                </View>
              </View>
            </>
          ) : (
            <View style={styles.noVipContainer}>
              <Text style={styles.noVipText}>您还没有开通VIP会员</Text>
              <Text style={styles.noVipHint}>开通后即可享受专属特权</Text>
            </View>
          )}
        </View>

        {/* 权益列表 */}
        {isActive && (
          <View style={styles.benefitsCard}>
            <Text style={styles.cardTitle}>我的权益</Text>
            
            {tier === 'silver' && (
              <>
                <BenefitItem text="机构跟投-实时信号" icon="📊" />
                <BenefitItem text="热门代币行情" icon="📈" />
                <BenefitItem text="基础智能分析" icon="🤖" />
                <BenefitItem text="代币详情查看" icon="🔍" />
              </>
            )}
            
            {tier === 'gold' && (
              <>
                <BenefitItem text="机构跟投-实时信号" icon="📊" />
                <BenefitItem text="热门代币行情" icon="📈" />
                <BenefitItem text="高级智能分析" icon="🤖" />
                <BenefitItem text="跟单功能" icon="👥" />
                <BenefitItem text="风险预警" icon="⚠️" />
                <BenefitItem text="聪明钱追踪" icon="💰" />
              </>
            )}
            
            {tier === 'diamond' && (
              <>
                <BenefitItem text="机构跟投-实时+机构" icon="📊" />
                <BenefitItem text="热门代币行情" icon="📈" />
                <BenefitItem text="高级智能分析" icon="🤖" />
                <BenefitItem text="跟单功能" icon="👥" />
                <BenefitItem text="聪明钱追踪" icon="💰" />
                <BenefitItem text="风险预警" icon="⚠️" />
                <BenefitItem text="机构布局追踪" icon="🏛️" />
                <BenefitItem text="VIP专属客服" icon="🎧" />
              </>
            )}
          </View>
        )}

        {/* 操作按钮 */}
        <View style={styles.actionContainer}>
          {isActive ? (
            <>
              <TouchableOpacity 
                style={styles.primaryButton} 
                onPress={handleManageSubscription}
              >
                <Text style={styles.primaryButtonText}>订阅管理</Text>
              </TouchableOpacity>
              
              {remainingDays <= 7 && (
                <TouchableOpacity 
                  style={styles.renewButton} 
                  onPress={handleSubscribe}
                >
                  <Text style={styles.renewButtonText}>立即续费</Text>
                </TouchableOpacity>
              )}
            </>
          ) : (
            <>
              <TouchableOpacity 
                style={styles.primaryButton} 
                onPress={handleSubscribe}
              >
                <Text style={styles.primaryButtonText}>开通VIP</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* 订单记录入口 */}
        <Link href="/order-history" style={styles.orderLink}>
          <Text style={styles.orderLinkText}>查看订单记录 →</Text>
        </Link>
      </ScrollView>
    </Screen>
  );
}

// 权益项组件
function BenefitItem({ text, icon }: { text: string; icon: string }) {
  return (
    <View style={styles.benefitItem}>
      <Text style={styles.benefitIcon}>{icon}</Text>
      <Text style={styles.benefitText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111827',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#9CA3AF',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111827',
    padding: 20,
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerRight: {
    width: 40,
  },
  vipCard: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 2,
  },
  vipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  vipBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 12,
  },
  vipBadgeText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  vipTier: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statusInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statusItem: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  statusBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusBadgeText: {
    color: '#22C55E',
    fontSize: 12,
    fontWeight: '600',
  },
  remainingDays: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F59E0B',
  },
  dateInfo: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 16,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  dateLabel: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  dateValue: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  dateValueHighlight: {
    fontSize: 14,
    color: '#F59E0B',
    fontWeight: '600',
  },
  noVipContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noVipText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
    marginBottom: 8,
  },
  noVipHint: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  benefitsCard: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  benefitIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  benefitText: {
    fontSize: 14,
    color: '#E5E7EB',
  },
  actionContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: '#F59E0B',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  renewButton: {
    backgroundColor: '#22C55E',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  renewButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  orderLink: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  orderLinkText: {
    fontSize: 14,
    color: '#3B82F6',
  },
});
