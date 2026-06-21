/**
 * 订单记录页
 * 历史订阅订单列表
 */
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Screen } from '@/components/Screen';
import { Link } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9091';

interface Order {
  id: string;
  tier: string;
  tierName?: string;
  price: number;
  status: string;
  payment_method: string;
  tx_hash: string | null;
  activated_at: string | null;
  expire_at: string | null;
  cancelled_at: string | null;
  created_at: string;
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

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  active: { label: '已开通', color: '#22C55E' },
  expired: { label: '已过期', color: '#EF4444' },
  cancelled: { label: '已取消', color: '#6B7280' },
  pending: { label: '待支付', color: '#F59E0B' },
};

export default function OrderHistoryScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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

  // 获取订单列表
  const fetchOrders = useCallback(async () => {
    try {
      setError(null);
      const walletAddress = await getWalletAddress();
      
      if (!walletAddress) {
        setError('请先连接钱包');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE}/api/v1/subscription/orders`, {
        headers: {
          'x-wallet-address': walletAddress,
        },
      });
      
      const result = await response.json();
      
      if (result.success) {
        const ordersWithNames = (result.data || []).map((order: Order) => ({
          ...order,
          tierName: TIER_NAMES[order.tier] || order.tier,
        }));
        setOrders(ordersWithNames);
      } else {
        setError(result.message || '获取订单失败');
      }
    } catch (err: any) {
      setError('网络错误，请稍后重试');
      console.error('获取订单失败:', err);
    }
    
    setLoading(false);
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [fetchOrders])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  // 格式化日期
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 渲染订单项
  const renderOrderItem = ({ item }: { item: Order }) => {
    const statusConfig = STATUS_CONFIG[item.status] || { label: item.status, color: '#9CA3AF' };
    const tierColor = TIER_COLORS[item.tier] || '#9CA3AF';

    return (
      <View style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <View style={[styles.tierBadge, { backgroundColor: tierColor }]}>
            <Text style={styles.tierBadgeText}>
              {TIER_NAMES[item.tier] || item.tier}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.color + '20' }]}>
            <Text style={[styles.statusBadgeText, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
          </View>
        </View>

        <View style={styles.orderInfo}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>订单编号</Text>
            <Text style={styles.infoValue} numberOfLines={1}>{item.id}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>支付金额</Text>
            <Text style={styles.priceValue}>${item.price}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>支付方式</Text>
            <Text style={styles.infoValue}>{item.payment_method || 'USDT'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>创建时间</Text>
            <Text style={styles.infoValue}>{formatDate(item.created_at)}</Text>
          </View>
          {item.activated_at && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>开通时间</Text>
              <Text style={styles.infoValue}>{formatDate(item.activated_at)}</Text>
            </View>
          )}
          {item.expire_at && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>到期时间</Text>
              <Text style={styles.infoValue}>{formatDate(item.expire_at)}</Text>
            </View>
          )}
          {item.tx_hash && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>交易哈希</Text>
              <Text style={styles.txHash} numberOfLines={1}>{item.tx_hash}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  // 空状态
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📋</Text>
      <Text style={styles.emptyText}>暂无订单记录</Text>
      <Text style={styles.emptyHint}>开通VIP后即可查看订单</Text>
      <Link href="/membership" style={styles.subscribeButton}>
        <Text style={styles.subscribeButtonText}>立即订阅</Text>
      </Link>
    </View>
  );

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
          <TouchableOpacity style={styles.retryButton} onPress={fetchOrders}>
            <Text style={styles.retryButtonText}>重试</Text>
          </TouchableOpacity>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.container}>
        {/* 头部 */}
        <View style={styles.header}>
          <Link href="/vip-status" style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </Link>
          <Text style={styles.headerTitle}>订单记录</Text>
          <View style={styles.headerRight} />
        </View>

        {/* 订单列表 */}
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={renderOrderItem}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={orders.length === 0 ? styles.emptyList : styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#F59E0B"
              colors={['#F59E0B']}
            />
          }
        />
      </View>
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
  listContent: {
    padding: 16,
  },
  emptyList: {
    flex: 1,
  },
  orderCard: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tierBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tierBadgeText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderInfo: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  infoValue: {
    fontSize: 13,
    color: '#FFFFFF',
    maxWidth: 180,
  },
  priceValue: {
    fontSize: 16,
    color: '#F59E0B',
    fontWeight: 'bold',
  },
  txHash: {
    fontSize: 12,
    color: '#3B82F6',
    maxWidth: 180,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '500',
    marginBottom: 8,
  },
  emptyHint: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 24,
  },
  subscribeButton: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  subscribeButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
