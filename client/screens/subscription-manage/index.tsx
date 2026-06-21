/**
 * 订阅管理页
 * 取消续费、升级套餐等
 */
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Screen } from '@/components/Screen';
import { Link, useFocusEffect } from 'expo-router';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9091';

interface SubscriptionInfo {
  hasActive: boolean;
  subscription: {
    id: string;
    tier: string;
    status: string;
    price: number;
    activated_at: string;
    expire_at: string;
  } | null;
}

const TIERS = [
  { id: 'silver', name: '白银版', price: 99, color: '#9CA3AF' },
  { id: 'gold', name: '黄金版', price: 199, color: '#F59E0B' },
  { id: 'diamond', name: '钻石版', price: 299, color: '#06B6D4' },
];

export default function SubscriptionManageScreen() {
  const router = useSafeRouter();
  const [loading, setLoading] = useState(true);
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
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
    try {
      setError(null);
      const walletAddress = await getWalletAddress();
      
      if (!walletAddress) {
        setError('请先连接钱包');
        setLoading(false);
        return;
      }

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
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  // 计算剩余天数
  const getRemainingDays = (expireAt: string | null | undefined) => {
    if (!expireAt) return 0;
    const now = new Date();
    const expire = new Date(expireAt);
    const diffTime = expire.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // 取消订阅
  const handleCancelSubscription = () => {
    if (!subscriptionInfo?.subscription?.id) return;
    
    Alert.alert(
      '确认取消订阅',
      '取消订阅后，您的VIP将在到期日后失效，确定要取消吗？',
      [
        { text: '暂不取消', style: 'cancel' },
        {
          text: '确认取消',
          style: 'destructive',
          onPress: async () => {
            try {
              setActionLoading(true);
              const response = await fetch(`${API_BASE}/api/v1/subscription/cancel`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  orderId: subscriptionInfo.subscription!.id,
                }),
              });
              
              const result = await response.json();
              
              if (result.success) {
                Alert.alert('成功', '订阅已取消');
                fetchSubscriptionStatus();
              } else {
                Alert.alert('失败', result.message || '取消订阅失败');
              }
            } catch (err) {
              Alert.alert('错误', '网络错误，请稍后重试');
            }
            
            setActionLoading(false);
          },
        },
      ]
    );
  };

  // 升级订阅
  const handleUpgrade = (targetTier: string) => {
    if (!subscriptionInfo?.subscription?.id) return;
    
    const currentTier = TIERS.find(t => t.id === subscriptionInfo.subscription?.tier);
    const target = TIERS.find(t => t.id === targetTier);
    
    if (!currentTier || !target) return;
    
    if (TIERS.indexOf(target) <= TIERS.indexOf(currentTier)) {
      Alert.alert('提示', '请选择更高级别的套餐');
      return;
    }
    
    const priceDiff = target.price - currentTier.price;
    
    Alert.alert(
      '确认升级',
      `从 ${currentTier.name} 升级到 ${target.name}\n需支付差价 $${priceDiff}`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确认升级',
          onPress: async () => {
            try {
              setActionLoading(true);
              const response = await fetch(`${API_BASE}/api/v1/subscription/upgrade`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  orderId: subscriptionInfo.subscription!.id,
                  newTier: targetTier,
                }),
              });
              
              const result = await response.json();
              
              if (result.success) {
                Alert.alert('成功', '升级成功！');
                fetchSubscriptionStatus();
              } else {
                Alert.alert('失败', result.message || '升级失败');
              }
            } catch (err) {
              Alert.alert('错误', '网络错误，请稍后重试');
            }
            
            setActionLoading(false);
          },
        },
      ]
    );
  };

  // 续费
  const handleRenew = () => {
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

  const subscription = subscriptionInfo?.subscription;
  const isActive = subscriptionInfo?.hasActive;
  const currentTier = TIERS.find(t => t.id === subscription?.tier);
  const remainingDays = getRemainingDays(subscription?.expire_at);

  return (
    <Screen>
      <ScrollView style={styles.container}>
        {/* 头部 */}
        <View style={styles.header}>
          <Link href="/vip-status" style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </Link>
          <Text style={styles.headerTitle}>订阅管理</Text>
          <View style={styles.headerRight} />
        </View>

        {/* 当前订阅状态 */}
        <View style={styles.currentCard}>
          <Text style={styles.cardTitle}>当前订阅</Text>
          
          {isActive && subscription ? (
            <>
              <View style={styles.currentInfo}>
                <View style={[styles.tierBadge, { backgroundColor: currentTier?.color || '#9CA3AF' }]}>
                  <Text style={styles.tierBadgeText}>{currentTier?.name}</Text>
                </View>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>生效中</Text>
                </View>
              </View>
              
              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>订阅价格</Text>
                  <Text style={styles.infoValue}>${subscription.price}/月</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>剩余天数</Text>
                  <Text style={styles.remainingValue}>{remainingDays} 天</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>到期时间</Text>
                  <Text style={styles.infoValue}>{formatDate(subscription.expire_at)}</Text>
                </View>
              </View>
            </>
          ) : (
            <View style={styles.noSubContainer}>
              <Text style={styles.noSubText}>暂无订阅</Text>
            </View>
          )}
        </View>

        {/* 升级选项 */}
        {isActive && (
          <View style={styles.upgradeCard}>
            <Text style={styles.cardTitle}>升级套餐</Text>
            <Text style={styles.upgradeHint}>选择更高级别的套餐，享受更多权益</Text>
            
            {TIERS.filter(tier => {
              const currentIndex = TIERS.findIndex(t => t.id === subscription?.tier);
              const tierIndex = TIERS.indexOf(tier);
              return tierIndex > currentIndex;
            }).map((tier) => (
              <TouchableOpacity
                key={tier.id}
                style={styles.upgradeOption}
                onPress={() => handleUpgrade(tier.id)}
                disabled={actionLoading}
              >
                <View style={styles.upgradeInfo}>
                  <View style={[styles.tierDot, { backgroundColor: tier.color }]} />
                  <Text style={styles.upgradeName}>{tier.name}</Text>
                  <Text style={styles.upgradePrice}>${tier.price}/月</Text>
                </View>
                <View style={styles.upgradeAction}>
                  <Text style={styles.upgradeActionText}>
                    升级 +${tier.price - (currentTier?.price || 0)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
            
            {TIERS.filter(tier => {
              const currentIndex = TIERS.findIndex(t => t.id === subscription?.tier);
              return TIERS.indexOf(tier) <= currentIndex;
            }).length === TIERS.length && (
              <View style={styles.maxTierContainer}>
                <Text style={styles.maxTierText}>您已开通最高级别套餐</Text>
              </View>
            )}
          </View>
        )}

        {/* 续费选项 */}
        {isActive && (
          <View style={styles.renewCard}>
            <Text style={styles.cardTitle}>续费</Text>
            <TouchableOpacity
              style={styles.renewButton}
              onPress={handleRenew}
              disabled={actionLoading}
            >
              <Text style={styles.renewButtonText}>立即续费</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 取消订阅 */}
        {isActive && (
          <View style={styles.cancelCard}>
            <Text style={styles.cardTitle}>取消订阅</Text>
            <Text style={styles.cancelHint}>
              取消订阅后，您的VIP将在到期日后自动失效
            </Text>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancelSubscription}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <ActivityIndicator size="small" color="#EF4444" />
              ) : (
                <Text style={styles.cancelButtonText}>取消订阅</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* 无订阅时显示开通入口 */}
        {!isActive && (
          <View style={styles.subscribeCard}>
            <TouchableOpacity
              style={styles.subscribeButton}
              onPress={() => router.push('/membership')}
            >
              <Text style={styles.subscribeButtonText}>开通VIP会员</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </Screen>
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
  currentCard: {
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
  currentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  tierBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 12,
  },
  tierBadgeText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  statusBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#22C55E',
    fontSize: 12,
    fontWeight: '600',
  },
  infoGrid: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 16,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  infoValue: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  remainingValue: {
    fontSize: 16,
    color: '#F59E0B',
    fontWeight: 'bold',
  },
  noSubContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noSubText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  upgradeCard: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  upgradeHint: {
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 16,
  },
  upgradeOption: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  upgradeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tierDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  upgradeName: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  upgradePrice: {
    fontSize: 14,
    color: '#9CA3AF',
    marginLeft: 12,
  },
  upgradeAction: {
    backgroundColor: '#22C55E',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  upgradeActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  maxTierContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  maxTierText: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  renewCard: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  renewButton: {
    backgroundColor: '#F59E0B',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  renewButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelCard: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  cancelHint: {
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 16,
    lineHeight: 20,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '500',
  },
  subscribeCard: {
    paddingHorizontal: 16,
  },
  subscribeButton: {
    backgroundColor: '#F59E0B',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  subscribeButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomSpacer: {
    height: 40,
  },
});
