/**
 * 支付确认页面
 * 用户转账后查询链上交易状态
 */
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Screen } from '@/components/Screen';
import { useSafeRouter as useSafeRouterHook } from '@/hooks/useSafeRouter';

const useSafeSearchParams = useLocalSearchParams;
const useSafeRouter = useSafeRouterHook;

const API_BASE = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9091';

interface OrderInfo {
  orderId: string;
  walletAddress: string;
  amount: number;
  tier: string;
  tierName: string;
}

type PaymentStatus = 'pending' | 'confirming' | 'confirmed' | 'failed';

export default function PaymentConfirmScreen() {
  const params = useLocalSearchParams<{ orderId?: string; walletAddress?: string; amount?: string; tier?: string }>();
  const router = useSafeRouter();
  const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(null);
  const [status, setStatus] = useState<PaymentStatus>('pending');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [pollingCount, setPollingCount] = useState(0);
  const [isPolling, setIsPolling] = useState(false);

  // 轮询检查支付状态
  const checkPaymentStatus = useCallback(async () => {
    if (!orderInfo?.orderId) return;
    
    setIsPolling(true);
    try {
      const response = await fetch(`${API_BASE}/api/v1/subscription/monitor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: orderInfo.orderId,
          walletAddress: params.walletAddress || orderInfo.walletAddress,
          expectedAmount: parseFloat(params.amount || '0'),
        }),
      });
      
      const result = await response.json();
      
      if (result.success && result.data?.success) {
        setStatus('confirmed');
        setIsPolling(false);
        return;
      }
      
      setPollingCount((prev) => {
        if (prev >= 10) {
          setStatus('failed');
          setIsPolling(false);
          return prev;
        }
        return prev + 1;
      });
    } catch (error) {
      console.error('检查支付状态失败:', error);
      setPollingCount((prev) => {
        if (prev >= 10) {
          setStatus('failed');
          setIsPolling(false);
          return prev;
        }
        return prev + 1;
      });
    }
    
    setIsPolling(false);
  }, [orderInfo, params]);

  // 手动确认支付
  const handleManualConfirm = async () => {
    if (!orderInfo?.orderId) return;
    
    try {
      const response = await fetch(`${API_BASE}/api/v1/subscription/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: orderInfo.orderId,
          txHash: txHash,
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setStatus('confirmed');
      } else {
        alert('确认失败: ' + result.message);
      }
    } catch (error) {
      console.error('确认支付失败:', error);
      alert('网络错误，请稍后重试');
    }
  };

  // 返回会员页面
  const handleBack = () => {
    router.back();
  };

  // 前往VIP状态页
  const handleGoVip = () => {
    router.push('/vip-status');
  };

  // 输入交易哈希
  const handleTxHashChange = (hash: string) => {
    setTxHash(hash);
  };

  return (
    <Screen>
      <ScrollView style={styles.container}>
        {/* 状态图标 */}
        <View style={styles.statusContainer}>
          {status === 'pending' && (
            <View style={styles.statusIconPending}>
              <ActivityIndicator size="large" color="#F59E0B" />
            </View>
          )}
          {status === 'confirming' && (
            <View style={styles.statusIconConfirming}>
              <ActivityIndicator size="large" color="#3B82F6" />
            </View>
          )}
          {status === 'confirmed' && (
            <View style={styles.statusIconConfirmed}>
              <Text style={styles.checkIcon}>✓</Text>
            </View>
          )}
          {status === 'failed' && (
            <View style={styles.statusIconFailed}>
              <Text style={styles.xIcon}>✕</Text>
            </View>
          )}
        </View>

        {/* 状态文字 */}
        <Text style={styles.statusTitle}>
          {status === 'pending' && '等待链上确认...'}
          {status === 'confirming' && '交易确认中...'}
          {status === 'confirmed' && '支付成功!'}
          {status === 'failed' && '支付超时'}
        </Text>

        <Text style={styles.statusDesc}>
          {status === 'pending' && '正在检查区块链交易，请稍候'}
          {status === 'confirming' && '您的交易正在区块链上确认'}
          {status === 'confirmed' && 'VIP会员已开通成功'}
          {status === 'failed' && '未检测到转账，请确认已完成转账'}
        </Text>

        {/* 订单信息 */}
        <View style={styles.orderCard}>
          <Text style={styles.cardTitle}>订单信息</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>订单编号</Text>
            <Text style={styles.infoValue}>{params.orderId || orderInfo?.orderId || 'N/A'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>订阅方案</Text>
            <Text style={styles.infoValue}>{params.tier || orderInfo?.tierName || 'N/A'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>应付金额</Text>
            <Text style={styles.infoValueHighlight}>
              ${params.amount || orderInfo?.amount || 0} USDT
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>收款地址</Text>
            <Text style={styles.infoValueSmall}>
              {params.walletAddress || orderInfo?.walletAddress || 'N/A'}
            </Text>
          </View>
        </View>

        {/* 手动输入交易哈希 */}
        <View style={styles.txCard}>
          <Text style={styles.cardTitle}>手动确认</Text>
          <Text style={styles.txHint}>
            如果自动检测超时，您可以手动输入交易哈希(TxHash)确认支付
          </Text>
          
          <TextInput
            style={styles.txInput}
            placeholder="请输入交易哈希..."
            placeholderTextColor="#6B7280"
            value={txHash || ''}
            onChangeText={handleTxHashChange}
            autoCapitalize="none"
            autoCorrect={false}
          />
          
          <TouchableOpacity
            style={[styles.confirmButton, !txHash && styles.confirmButtonDisabled]}
            onPress={handleManualConfirm}
            disabled={!txHash}
          >
            <Text style={styles.confirmButtonText}>确认支付</Text>
          </TouchableOpacity>
        </View>

        {/* 操作按钮 */}
        <View style={styles.actionContainer}>
          {status === 'confirmed' ? (
            <TouchableOpacity style={styles.primaryButton} onPress={handleGoVip}>
              <Text style={styles.primaryButtonText}>查看VIP权益</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.primaryButton} onPress={checkPaymentStatus}>
              <Text style={styles.primaryButtonText}>重新检查</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity style={styles.secondaryButton} onPress={handleBack}>
            <Text style={styles.secondaryButtonText}>返回</Text>
          </TouchableOpacity>
        </View>

        {/* 提示 */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>温馨提示</Text>
          <Text style={styles.tipsText}>
            • 转账后请等待区块链确认，通常需要1-5分钟{'\n'}
            • 如长时间未到账，请检查转账地址是否正确{'\n'}
            • 如有疑问，请联系客服
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}

// 添加 TextInput 导入
import { TextInput } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  statusContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 16,
  },
  statusIconPending: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusIconConfirming: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusIconConfirmed: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusIconFailed: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIcon: {
    fontSize: 40,
    color: '#22C55E',
  },
  xIcon: {
    fontSize: 40,
    color: '#EF4444',
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  statusDesc: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  orderCard: {
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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  infoLabel: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  infoValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  infoValueHighlight: {
    fontSize: 18,
    color: '#F59E0B',
    fontWeight: 'bold',
  },
  infoValueSmall: {
    fontSize: 12,
    color: '#9CA3AF',
    maxWidth: 200,
  },
  txCard: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  txHint: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  txInput: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 14,
    color: '#FFFFFF',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#374151',
    marginBottom: 12,
  },
  confirmButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#374151',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  actionContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
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
  secondaryButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  secondaryButtonText: {
    color: '#9CA3AF',
    fontSize: 16,
  },
  tipsContainer: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 40,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F59E0B',
    marginBottom: 12,
  },
  tipsText: {
    fontSize: 13,
    color: '#9CA3AF',
    lineHeight: 22,
  },
});
