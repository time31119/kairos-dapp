import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';

const API_BASE = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9091';

interface PaymentModalProps {
  visible: boolean;
  plan: {
    id: string;
    name: string;
    price: { monthly: number; quarterly: number; yearly: number };
    color: string;
  } | null;
  billingCycle: 'monthly' | 'quarterly' | 'yearly';
  onClose: () => void;
  onSuccess: () => void;
}

// 激活订阅
async function activateSubscription(planId: string, billingCycle: string) {
  try {
    const response = await fetch(`${API_BASE}/api/v1/subscription/activate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'demo-user',
      },
      body: JSON.stringify({ planId, billingCycle }),
    });
    return await response.json();
  } catch (error) {
    console.error('激活订阅失败:', error);
    return { success: false, message: '网络错误' };
  }
}

// 保存订阅状态到本地
async function saveSubscriptionStatus(planId: string, billingCycle: string) {
  try {
    const durationMap: Record<string, number> = {
      monthly: 30,
      quarterly: 90,
      yearly: 365,
    };
    const days = durationMap[billingCycle] || 30;
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
    
    const subscriptionData = {
      planId,
      billingCycle,
      status: 'active',
      activatedAt: new Date().toISOString(),
      expiresAt,
    };
    
    await AsyncStorage.setItem('user_subscription', JSON.stringify(subscriptionData));
    return true;
  } catch (error) {
    console.error('保存订阅状态失败:', error);
    return false;
  }
}

// TODO: 其他支付方式待开通
// const PAYMENT_METHODS_ALL = [
//   { id: 'ETH', name: 'ETH (ERC20)', ... },
//   { id: 'BNB', name: 'BNB (BEP20)', ... },
//   { id: 'CREDIT_CARD', name: '信用卡/借记卡', ... }
// ];

const PAYMENT_METHODS = [
  { 
    id: 'USDT_TRC20', 
    name: 'USDT (TRC20)', 
    icon: 'logo-usd',
    description: 'TRON 网络转账 · 手续费低',
    color: '#26A17B',
    network: 'TRON (TRC20)',
    minConfirmations: 1,
    avgConfirmTime: '1-3 分钟'
  },
  { 
    id: 'USDT_BNB', 
    name: 'USDT (BNB Chain)', 
    icon: 'cube',
    description: 'BNB Smart Chain · 速度快',
    color: '#F3BA2F',
    network: 'BNB Smart Chain (BEP20)',
    minConfirmations: 15,
    avgConfirmTime: '3-5 分钟'
  }
];

export default function PaymentModal({ 
  visible, 
  plan, 
  billingCycle, 
  onClose, 
  onSuccess 
}: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>('USDT_TRC20');
  const [loading, setLoading] = useState(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [orderCreated, setOrderCreated] = useState(false);
  const [orderInfo, setOrderInfo] = useState<{
    orderId: string;
    paymentAddress: string;
    price: number;
  } | null>(null);

  const price = plan?.price[billingCycle] || 0;
  const billingLabel = {
    monthly: '月付',
    quarterly: '季付', 
    yearly: '年付'
  }[billingCycle];

  // 订单有效期（30分钟）
  const [orderExpireTime, setOrderExpireTime] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    if (orderCreated && orderExpireTime > 0) {
      const interval = setInterval(() => {
        const remaining = Math.max(0, orderExpireTime - Date.now());
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        if (remaining <= 0) {
          clearInterval(interval);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [orderCreated, orderExpireTime]);

  const copyToClipboard = async (text: string, label: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert('已复制', `${label}已复制到剪贴板`);
  };

  const API_BASE = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9091';
  
  const handleCreateOrder = async () => {
    if (!plan) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/v1/subscription/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: plan.id,
          billingCycle,
          paymentMethod: selectedMethod
        })
      });
      
      const result = await response.json();
      if (result.success) {
        setOrderInfo({
          orderId: result.data.orderId,
          paymentAddress: result.data.paymentAddress,
          price: result.data.price
        });
        // 设置订单30分钟有效期
        setOrderExpireTime(Date.now() + 30 * 60 * 1000);
        setOrderCreated(true);
      } else {
        Alert.alert('错误', result.message || '创建订单失败');
      }
    } catch (error) {
      Alert.alert('错误', '网络请求失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = () => {
    if (!plan) return;
    
    // 模拟支付确认
    Alert.alert(
      '支付确认',
      '请确认已完成转账操作，等待区块链确认后点击确认。',
      [
        { text: '取消', style: 'cancel' },
        { 
          text: '已转账，确认', 
          onPress: async () => {
            setIsCreatingOrder(true);
            try {
              // 调用激活接口
              const result = await activateSubscription(plan.id, billingCycle);
              if (result.success) {
                // 保存订阅状态到本地
                await saveSubscriptionStatus(plan.id, billingCycle);
                
                const durationMap: Record<string, string> = {
                  monthly: '月',
                  quarterly: '季', 
                  yearly: '年'
                };
                const duration = durationMap[billingCycle] || '月';
                
                Alert.alert(
                  '🎉 开通成功！',
                  `${plan.name} ${duration}会员已开通，${result.message}`,
                  [{ text: '确定', onPress: () => {
                    onSuccess();
                    handleClose();
                  }}]
                );
              } else {
                Alert.alert('开通失败', result.message || '请稍后重试');
              }
            } catch (error) {
              Alert.alert('错误', '网络请求失败，请稍后重试');
            } finally {
              setIsCreatingOrder(false);
            }
          }
        }
      ]
    );
  };

  const handleClose = () => {
    setOrderCreated(false);
    setOrderInfo(null);
    setSelectedMethod('USDT_TRC20');
    onClose();
  };

  if (!plan) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>
              {orderCreated ? '订单信息' : '选择支付方式'}
            </Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Order Summary */}
          <View style={[styles.orderSummary, { borderColor: plan.color + '40' }]}>
            <Text style={[styles.planName, { color: plan.color }]}>
              {plan.name}
            </Text>
            <Text style={styles.billingInfo}>
              {billingLabel} · ${price}
            </Text>
          </View>

          {!orderCreated ? (
            <>
              {/* Payment Methods */}
              <View style={styles.methodsSection}>
                <Text style={styles.sectionTitle}>支付方式</Text>
                {PAYMENT_METHODS.map((method) => (
                  <TouchableOpacity
                    key={method.id}
                    style={[
                      styles.methodItem,
                      selectedMethod === method.id && styles.methodItemSelected,
                      { borderColor: selectedMethod === method.id ? method.color : '#333' }
                    ]}
                    onPress={() => setSelectedMethod(method.id)}
                  >
                    <View style={styles.methodLeft}>
                      <View style={[styles.methodIcon, { backgroundColor: method.color + '20' }]}>
                        <Ionicons 
                          name={method.icon as any} 
                          size={20} 
                          color={method.color} 
                        />
                      </View>
                      <View>
                        <Text style={styles.methodName}>{method.name}</Text>
                        <Text style={styles.methodDesc}>{method.description}</Text>
                      </View>
                    </View>
                    <View style={[
                      styles.radio,
                      selectedMethod === method.id && { borderColor: method.color }
                    ]}>
                      {selectedMethod === method.id && (
                        <View style={[styles.radioInner, { backgroundColor: method.color }]} />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Pay Button */}
              <TouchableOpacity
                style={[styles.payButton, { backgroundColor: plan.color }]}
                onPress={handleCreateOrder}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text style={styles.payButtonText}>确认支付 ${price}</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              {/* Selected Payment Method Info */}
              <View style={styles.orderInfo}>
                <View style={styles.methodInfoCard}>
                  <View style={styles.methodInfoHeader}>
                    <View style={[styles.methodIcon, { backgroundColor: (PAYMENT_METHODS.find(m => m.id === selectedMethod)?.color || '#00F0FF') + '20' }]}>
                      <Ionicons 
                        name={(PAYMENT_METHODS.find(m => m.id === selectedMethod)?.icon as any) || 'help-circle'} 
                        size={20} 
                        color={PAYMENT_METHODS.find(m => m.id === selectedMethod)?.color || '#00F0FF'} 
                      />
                    </View>
                    <View style={styles.methodInfoText}>
                      <Text style={styles.methodInfoName}>
                        {PAYMENT_METHODS.find(m => m.id === selectedMethod)?.name}
                      </Text>
                      <Text style={styles.methodInfoNetwork}>
                        网络: {PAYMENT_METHODS.find(m => m.id === selectedMethod)?.network}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.methodStats}>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>预计确认</Text>
                      <Text style={styles.statValue}>
                        {PAYMENT_METHODS.find(m => m.id === selectedMethod)?.avgConfirmTime}
                      </Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>最低确认数</Text>
                      <Text style={styles.statValue}>
                        {PAYMENT_METHODS.find(m => m.id === selectedMethod)?.minConfirmations}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Order Expire Timer */}
                {timeLeft && (
                  <View style={styles.timerBox}>
                    <Ionicons name="time-outline" size={16} color="#F5A623" />
                    <Text style={styles.timerText}>
                      订单剩余: <Text style={{ color: '#F5A623', fontWeight: '600' }}>{timeLeft}</Text>
                    </Text>
                  </View>
                )}

                {/* Order Details */}
                <View style={styles.orderRow}>
                  <Text style={styles.orderLabel}>订单号</Text>
                  <TouchableOpacity onPress={() => copyToClipboard(orderInfo?.orderId || '', '订单号')}>
                    <Text style={styles.orderValue}>{orderInfo?.orderId}</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.orderRow}>
                  <Text style={styles.orderLabel}>应付金额</Text>
                  <Text style={[styles.orderValue, { color: '#26A17B', fontSize: 20, fontWeight: '700' }]}>
                    ${orderInfo?.price} USDT
                  </Text>
                </View>
                <View style={styles.orderRow}>
                  <Text style={styles.orderLabel}>收款地址 (TRC20)</Text>
                </View>
                <View style={styles.addressBox}>
                  <Text style={styles.addressText} selectable numberOfLines={2}>
                    {orderInfo?.paymentAddress}
                  </Text>
                  <TouchableOpacity 
                    style={styles.copyButton}
                    onPress={() => copyToClipboard(orderInfo?.paymentAddress || '', '收款地址')}
                  >
                    <Ionicons name="copy-outline" size={18} color="#00F0FF" />
                  </TouchableOpacity>
                </View>

                {/* Network Info */}
                <View style={styles.networkInfo}>
                  <View style={styles.networkItem}>
                    <Ionicons name="link" size={14} color="#26A17B" />
                    <Text style={styles.networkText}>网络: TRON (TRC20)</Text>
                  </View>
                  <View style={styles.networkItem}>
                    <Ionicons name="checkmark-circle" size={14} color="#26A17B" />
                    <Text style={styles.networkText}>最低确认: 1 个区块</Text>
                  </View>
                  <View style={styles.networkItem}>
                    <Ionicons name="time" size={14} color="#26A17B" />
                    <Text style={styles.networkText}>预计到账: 1-3 分钟</Text>
                  </View>
                </View>
                
                {/* Transfer Instructions */}
                <View style={styles.instructionBox}>
                  <View style={styles.instructionHeader}>
                    <Ionicons name="shield-checkmark" size={18} color="#26A17B" />
                    <Text style={[styles.instructionTitle, { color: '#26A17B' }]}>USDT 转账指南</Text>
                  </View>
                  <View style={styles.instructionList}>
                    <Text style={styles.instructionItem}>1. 打开钱包 (TrxLink / TokenPocket / 交易所等)</Text>
                    <Text style={styles.instructionItem}>2. 选择 USDT → 转账 → 粘贴收款地址</Text>
                    <Text style={styles.instructionItem}>3. 网络必须选择 <Text style={{ color: '#26A17B', fontWeight: '600' }}>TRON (TRC20)</Text></Text>
                    <Text style={styles.instructionItem}>4. 转账金额: <Text style={{ color: '#26A17B', fontWeight: '600' }}>≥ ${orderInfo?.price} USDT</Text></Text>
                    <Text style={styles.instructionItem}>5. 建议多转 1-2 USDT 防止矿工费扣除</Text>
                    <Text style={styles.instructionItem}>6. 转账完成后等待 1-3 分钟确认</Text>
                    <Text style={styles.instructionItem}>7. 确认后会员权益自动到账</Text>
                  </View>
                </View>

                {/* Warning */}
                <View style={styles.warningBox}>
                  <Ionicons name="warning" size={16} color="#F5A623" />
                  <Text style={styles.warningText}>
                    请勿向其他网络地址转账，错误转账无法找回！
                  </Text>
                </View>
              </View>

              {/* Confirm Button */}
              <TouchableOpacity
                style={[styles.payButton, { backgroundColor: '#26A17B' }]}
                onPress={handleConfirmPayment}
              >
                <Text style={styles.payButtonText}>我已转账，确认支付</Text>
              </TouchableOpacity>

              {/* Simulate Success */}
              <TouchableOpacity
                style={styles.simulateButton}
                onPress={async () => {
                  setIsCreatingOrder(true);
                  try {
                    // 调用激活接口
                    const result = await activateSubscription(plan.id, billingCycle);
                    if (result.success) {
                      // 保存订阅状态到本地
                      await saveSubscriptionStatus(plan.id, billingCycle);
                      Alert.alert(
                        '🎉 开通成功！',
                        `${plan.name} ${result.data?.duration || '月'}会员已开通！`,
                        [{ text: '确定', onPress: () => {
                          onSuccess();
                          handleClose();
                        }}]
                      );
                    } else {
                      Alert.alert('开通失败', result.message || '请稍后重试');
                    }
                  } catch (error) {
                    Alert.alert('错误', '网络请求失败，请稍后重试');
                  } finally {
                    setIsCreatingOrder(false);
                  }
                }}
              >
                <Text style={styles.simulateText}>模拟支付成功（测试用）</Text>
              </TouchableOpacity>
            </>
          )}

          {/* Footer */}
          <View style={styles.footer}>
            <Ionicons name="shield-checkmark" size={16} color="#666" />
            <Text style={styles.footerText}>
              安全加密保护 · 支持 7 天无理由退款
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#121212',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  orderSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  planName: {
    fontSize: 16,
    fontWeight: '600',
  },
  billingInfo: {
    fontSize: 14,
    color: '#888',
  },
  methodsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  methodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
  },
  methodItemSelected: {
    borderWidth: 2,
  },
  methodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  methodIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  methodName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  methodDesc: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  payButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  simulateButton: {
    padding: 12,
    alignItems: 'center',
  },
  simulateText: {
    fontSize: 12,
    color: '#666',
  },
  orderInfo: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  orderLabel: {
    fontSize: 14,
    color: '#666',
  },
  orderValue: {
    fontSize: 14,
    color: '#fff',
  },
  addressBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A0A0F',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    marginBottom: 8,
  },
  addressText: {
    flex: 1,
    fontSize: 12,
    color: '#00F0FF',
    fontFamily: 'monospace',
  },
  copyButton: {
    padding: 4,
  },
  hintText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  // Method Info Card
  methodInfoCard: {
    backgroundColor: '#0D0D0D',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#26A17B40',
  },
  methodInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  methodInfoText: {
    marginLeft: 12,
  },
  methodInfoName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  methodInfoNetwork: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  methodStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
  },
  statValue: {
    fontSize: 14,
    color: '#26A17B',
    fontWeight: '600',
    marginTop: 4,
  },
  // Instruction Box
  instructionBox: {
    backgroundColor: '#0D0D0D',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#26A17B',
  },
  instructionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  instructionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  instructionList: {
    paddingLeft: 4,
  },
  instructionItem: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
    lineHeight: 18,
  },
  // Timer Box
  timerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(245, 166, 35, 0.1)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 166, 35, 0.3)',
  },
  timerText: {
    fontSize: 13,
    color: '#999',
    marginLeft: 8,
  },
  timerValue: {
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  // Network Info
  networkInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(38, 161, 123, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  networkItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  networkText: {
    fontSize: 11,
    color: '#26A17B',
    marginLeft: 4,
  },
  // Warning Box
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 166, 35, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  warningText: {
    fontSize: 12,
    color: '#F5A623',
    marginLeft: 8,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
  },
});
