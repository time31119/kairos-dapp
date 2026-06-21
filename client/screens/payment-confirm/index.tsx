/**
 * 支付确认页面
 * 用户转账后查询链上交易状态
 */
import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  TextInput,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { Link } from 'expo-router';
import { useSafeSearchParams } from '@/hooks/useSafeRouter';

const API_BASE = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9091';

type PaymentStatus = 'pending' | 'confirming' | 'confirmed' | 'failed';

export default function PaymentConfirmScreen() {
  const params = useSafeSearchParams<{ orderId?: string; walletAddress?: string; amount?: string; tier?: string }>();
  const [orderId, setOrderId] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [tier, setTier] = useState('');
  const [status, setStatus] = useState<PaymentStatus>('pending');
  const [txHash, setTxHash] = useState('');
  const [countdown, setCountdown] = useState(300); // 5分钟倒计时
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  // 从URL参数获取数据
  useEffect(() => {
    setOrderId(params.orderId || '');
    setWalletAddress(params.walletAddress || '');
    setAmount(params.amount || '');
    setTier(params.tier || '');
  }, [params.orderId, params.walletAddress, params.amount, params.tier]);

  // 倒计时逻辑
  useEffect(() => {
    if (status === 'pending' || status === 'confirming') {
      countdownRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setStatus('failed');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, [status]);

  // 轮询检查支付状态
  useEffect(() => {
    if (!orderId || status === 'confirmed' || status === 'failed') return;

    // 每10秒检查一次，最多检查30次
    let pollCount = 0;
    const maxPolls = 30;

    const checkPayment = async () => {
      pollCount++;
      setProgress(Math.min((pollCount / maxPolls) * 100, 100));
      
      try {
        const response = await fetch(`${API_BASE}/api/v1/subscription/monitor`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId,
            walletAddress,
            expectedAmount: parseFloat(amount) || 0,
          }),
        });
        
        const result = await response.json();
        
        if (result.success && result.data?.success) {
          setStatus('confirmed');
          if (intervalRef.current) clearInterval(intervalRef.current);
        } else if (pollCount >= maxPolls) {
          setStatus('failed');
          if (intervalRef.current) clearInterval(intervalRef.current);
        } else {
          setStatus('confirming');
        }
      } catch (error) {
        console.error('检查支付状态失败:', error);
        if (pollCount >= maxPolls) {
          setStatus('failed');
          if (intervalRef.current) clearInterval(intervalRef.current);
        }
      }
    };

    // 立即检查一次
    checkPayment();
    
    // 每10秒轮询
    intervalRef.current = setInterval(checkPayment, 10000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [orderId, walletAddress, amount, status]);

  // 手动检查
  const handleManualCheck = async () => {
    if (!orderId) return;
    
    setStatus('confirming');
    setProgress(0);
    
    try {
      const response = await fetch(`${API_BASE}/api/v1/subscription/monitor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          walletAddress,
          expectedAmount: parseFloat(amount) || 0,
        }),
      });
      
      const result = await response.json();
      
      if (result.success && result.data?.success) {
        setStatus('confirmed');
      } else {
        setStatus('pending');
      }
    } catch (error) {
      console.error('检查支付状态失败:', error);
    }
  };

  // 手动确认支付
  const handleManualConfirm = async () => {
    if (!orderId || !txHash) return;
    
    try {
      const response = await fetch(`${API_BASE}/api/v1/subscription/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          txHash,
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setStatus('confirmed');
      } else {
        alert('确认失败: ' + (result.message || '请稍后重试'));
      }
    } catch (error) {
      console.error('确认支付失败:', error);
      alert('网络错误，请稍后重试');
    }
  };

  // 格式化倒计时
  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 获取状态颜色
  const getStatusColor = () => {
    switch (status) {
      case 'confirmed': return '#22C55E';
      case 'failed': return '#EF4444';
      case 'confirming': return '#3B82F6';
      default: return '#F59E0B';
    }
  };

  // 获取状态图标
  const getStatusIcon = () => {
    switch (status) {
      case 'confirmed': return 'checkmark-circle';
      case 'failed': return 'close-circle';
      case 'confirming': return 'time';
      default: return 'hourglass';
    }
  };

  return (
    <Screen style={{ backgroundColor: '#111827' }}>
      {/* 顶部导航 */}
      <View style={styles.header}>
        <Link href="/membership" style={styles.backButton}>
          <Ionicons name="chevron-back" size={26} color="#F9FAFB" />
        </Link>
        <Text style={styles.headerTitle}>支付确认</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* 状态展示 */}
        <View style={styles.statusSection}>
          <View style={[styles.statusIconContainer, { backgroundColor: `${getStatusColor()}20` }]}>
            {status === 'pending' || status === 'confirming' ? (
              <ActivityIndicator size="large" color={getStatusColor()} />
            ) : (
              <Ionicons name={getStatusIcon() as any} size={50} color={getStatusColor()} />
            )}
          </View>
          
          <Text style={[styles.statusTitle, { color: getStatusColor() }]}>
            {status === 'pending' && '等待转账...'}
            {status === 'confirming' && '检测中...'}
            {status === 'confirmed' && '支付成功!'}
            {status === 'failed' && '等待确认'}
          </Text>
          
          <Text style={styles.statusDesc}>
            {status === 'pending' && '请向下方地址完成转账'}
            {status === 'confirming' && `正在检测交易，请稍候 (${formatCountdown(countdown)})`}
            {status === 'confirmed' && 'VIP会员已开通成功'}
            {status === 'failed' && '可手动输入交易哈希确认'}
          </Text>

          {/* 进度条 */}
          {(status === 'pending' || status === 'confirming') && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: getStatusColor() }]} />
              </View>
              <Text style={styles.progressText}>{Math.round(progress)}%</Text>
            </View>
          )}

          {/* 倒计时 */}
          {status !== 'confirmed' && (
            <View style={styles.countdownContainer}>
              <Ionicons name="time-outline" size={18} color="#9CA3AF" />
              <Text style={styles.countdownText}>
                {status === 'failed' ? '超时' : `剩余 ${formatCountdown(countdown)}`}
              </Text>
            </View>
          )}
        </View>

        {/* 订单信息卡片 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>订单信息</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>订单编号</Text>
            <Text style={[styles.infoValue, styles.infoValueMono]} numberOfLines={1}>
              {orderId || 'N/A'}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>订阅方案</Text>
            <Text style={styles.infoValue}>{tier || 'N/A'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>应付金额</Text>
            <Text style={[styles.infoValue, styles.infoValueHighlight]}>
              ${amount || 0} USDT
            </Text>
          </View>
        </View>

        {/* 收款地址卡片 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>收款地址</Text>
          <View style={styles.addressContainer}>
            <Text style={styles.addressText} numberOfLines={3}>
              {walletAddress || 'N/A'}
            </Text>
          </View>
          <Text style={styles.addressHint}>请使用 BSC (BEP20) 网络转账 USDT</Text>
        </View>

        {/* 操作按钮 */}
        <View style={styles.actionContainer}>
          {status !== 'confirmed' && (
            <>
              <TouchableOpacity style={styles.primaryButton} onPress={handleManualCheck}>
                <Ionicons name="refresh" size={20} color="#FFFFFF" />
                <Text style={styles.primaryButtonText}>重新检测</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.secondaryButton} onPress={handleManualConfirm} disabled={!txHash}>
                <Ionicons name="checkmark-done" size={20} color={txHash ? '#F59E0B' : '#6B7280'} />
                <Text style={[styles.secondaryButtonText, !txHash && styles.disabledText]}>
                  确认支付
                </Text>
              </TouchableOpacity>
            </>
          )}

          {status === 'confirmed' && (
            <Link href="/vip-status" style={styles.primaryButton}>
              <Ionicons name="diamond" size={20} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>查看VIP权益</Text>
            </Link>
          )}

          <Link href="/membership" style={styles.linkButton}>
            <Ionicons name="arrow-back" size={18} color="#9CA3AF" />
            <Text style={styles.linkButtonText}>返回会员页面</Text>
          </Link>
        </View>

        {/* 手动输入交易哈希 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>手动确认（可选）</Text>
          <Text style={styles.hintText}>
            如果自动检测超时，您可以手动输入交易哈希(TxHash)确认支付
          </Text>
          
          <TextInput
            style={styles.input}
            placeholder="请输入交易哈希..."
            placeholderTextColor="#6B7280"
            value={txHash}
            onChangeText={setTxHash}
            autoCapitalize="none"
            autoCorrect={false}
          />
          
          <TouchableOpacity
            style={[styles.confirmButton, !txHash && styles.confirmButtonDisabled]}
            onPress={handleManualConfirm}
            disabled={!txHash}
          >
            <Text style={styles.confirmButtonText}>提交确认</Text>
          </TouchableOpacity>
        </View>

        {/* 温馨提示 */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>温馨提示</Text>
          <View style={styles.tipRow}>
            <Ionicons name="checkmark-circle" size={16} color="#22C55E" />
            <Text style={styles.tipText}>转账后请等待区块链确认，通常需要1-5分钟</Text>
          </View>
          <View style={styles.tipRow}>
            <Ionicons name="checkmark-circle" size={16} color="#22C55E" />
            <Text style={styles.tipText}>请确保使用 BSC (BEP20) 网络转账 USDT</Text>
          </View>
          <View style={styles.tipRow}>
            <Ionicons name="checkmark-circle" size={16} color="#22C55E" />
            <Text style={styles.tipText}>如长时间未到账，请检查转账地址是否正确</Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1F2937',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  statusSection: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  statusIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statusDesc: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 16,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    maxWidth: 280,
    marginTop: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#374151',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#9CA3AF',
    width: 45,
    textAlign: 'right',
  },
  countdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  countdownText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#9CA3AF',
  },
  card: {
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
    paddingVertical: 12,
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
  infoValueMono: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12,
    maxWidth: 180,
  },
  infoValueHighlight: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F59E0B',
  },
  addressContainer: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  addressText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    lineHeight: 20,
  },
  addressHint: {
    fontSize: 12,
    color: '#6B7280',
  },
  actionContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F59E0B',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#374151',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F59E0B',
  },
  disabledText: {
    color: '#6B7280',
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  linkButtonText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  hintText: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  input: {
    backgroundColor: '#111827',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#374151',
    marginBottom: 16,
  },
  confirmButton: {
    backgroundColor: '#F59E0B',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#374151',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  tipsCard: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.2)',
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#22C55E',
    marginBottom: 12,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 8,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: '#9CA3AF',
    lineHeight: 18,
  },
});
