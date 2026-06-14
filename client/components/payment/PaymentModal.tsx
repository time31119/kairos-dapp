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
import * as Clipboard from 'expo-clipboard';
import { useSubscription } from '@/contexts/SubscriptionContext';

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
  const { activateSubscription } = useSubscription();
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

  // 重置状态
  useEffect(() => {
    if (!visible) {
      setOrderCreated(false);
      setOrderInfo(null);
      setSelectedMethod('USDT_TRC20');
      setIsCreatingOrder(false);
      setTimeLeft('');
    }
  }, [visible]);

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
                Alert.alert(
                  '开通成功', 
                  `恭喜！您已成功开通${plan.name}（${billingLabel}）会员`,
                  [{ text: '确定', onPress: () => { onSuccess(); onClose(); } }]
                );
              } else {
                Alert.alert('开通失败', result.message || '请联系客服');
              }
            } catch (error) {
              Alert.alert('错误', '网络请求失败');
            } finally {
              setIsCreatingOrder(false);
            }
          }
        }
      ]
    );
  };

  const selectedMethodData = PAYMENT_METHODS.find(m => m.id === selectedMethod);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerIcon}>
              <Ionicons name="wallet-outline" size={28} color="#00F0FF" />
            </View>
            <Text style={styles.headerTitle}>完成支付</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={24} color="#888" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {/* 订单摘要 */}
            <View style={styles.summaryBox}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>会员套餐</Text>
                <Text style={[styles.summaryValue, { color: plan?.color || '#00F0FF' }]}>
                  {plan?.name || ''} ({billingLabel})
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>应付金额</Text>
                <Text style={styles.summaryPrice}>${price} USDT</Text>
              </View>
            </View>

            {/* 支付方式选择 */}
            <Text style={styles.sectionTitle}>选择支付方式</Text>
            <View style={styles.methodsContainer}>
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

            {/* 收款信息 */}
            {orderCreated && orderInfo ? (
              <View style={styles.paymentInfo}>
                <Text style={styles.sectionTitle}>请向以下地址转账</Text>
                
                <View style={[styles.addressBox, { borderColor: selectedMethodData?.color || '#00F0FF' }]}>
                  <View style={styles.addressHeader}>
                    <View style={[styles.methodIcon, { backgroundColor: (selectedMethodData?.color || '#00F0FF') + '20' }]}>
                      <Ionicons 
                        name={(selectedMethodData?.icon as any) || 'help-circle'} 
                        size={20} 
                        color={selectedMethodData?.color || '#00F0FF'} 
                      />
                    </View>
                    <View style={styles.methodInfoText}>
                      <Text style={styles.methodInfoName}>
                        {selectedMethodData?.name}
                      </Text>
                      <Text style={styles.methodInfoNetwork}>
                        网络: {selectedMethodData?.network}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.methodStats}>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>预计确认</Text>
                      <Text style={styles.statValue}>
                        {selectedMethodData?.avgConfirmTime}
                      </Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>最低确认数</Text>
                      <Text style={styles.statValue}>
                        {selectedMethodData?.minConfirmations}
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
                  <TouchableOpacity 
                    style={styles.addressCopyBtn}
                    onPress={() => copyToClipboard(orderInfo?.paymentAddress || '', '收款地址')}
                  >
                    <Text style={styles.addressText} numberOfLines={1}>
                      {orderInfo?.paymentAddress}
                    </Text>
                    <Ionicons name="copy-outline" size={16} color="#00F0FF" />
                  </TouchableOpacity>
                </View>

                {/* 转账指南 */}
                <View style={styles.guideBox}>
                  <Text style={styles.guideTitle}>转账指南</Text>
                  <Text style={styles.guideText}>1. 复制上方收款地址到钱包</Text>
                  <Text style={styles.guideText}>2. 粘贴到转账地址栏</Text>
                  <Text style={styles.guideText}>3. 确认网络为 TRON (TRC20)</Text>
                  <Text style={styles.guideText}>4. 金额填写: <Text style={{ color: '#26A17B', fontWeight: '600' }}>${orderInfo?.price} USDT</Text></Text>
                  <Text style={styles.guideText}>5. 建议多转 1-2 USDT 防止矿工费扣除</Text>
                  <Text style={styles.guideText}>6. 转账完成后等待 1-3 分钟确认</Text>
                  <Text style={styles.guideText}>7. 确认后点击下方按钮完成开通</Text>
                </View>

                {/* 风险提示 */}
                <View style={styles.warningBox}>
                  <Ionicons name="warning-outline" size={18} color="#FF6B6B" />
                  <Text style={styles.warningText}>
                    请确保使用 {selectedMethodData?.name} 网络转账，使用其他网络将导致资金无法找回！
                  </Text>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.createOrderBtn, { opacity: loading ? 0.6 : 1 }]}
                onPress={handleCreateOrder}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text style={styles.createOrderBtnText}>生成收款地址</Text>
                )}
              </TouchableOpacity>
            )}
          </ScrollView>

          {/* Footer */}
          {orderCreated && (
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.confirmBtn, { opacity: isCreatingOrder ? 0.6 : 1 }]}
                onPress={handleConfirmPayment}
                disabled={isCreatingOrder}
              >
                {isCreatingOrder ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text style={styles.confirmBtnText}>我已转账，确认开通</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#121212',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '95%',
    minHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    marginLeft: 12,
  },
  closeBtn: {
    padding: 8,
  },
  modalBody: {
    padding: 20,
  },
  summaryBox: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 6,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#888',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  summaryPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: '#26A17B',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 12,
  },
  methodsContainer: {
    marginBottom: 20,
  },
  methodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#333',
  },
  methodItemSelected: {
    borderColor: '#00F0FF',
  },
  methodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  methodIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  methodName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
  },
  methodDesc: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  paymentInfo: {
    marginTop: 10,
  },
  addressBox: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  methodInfoText: {
    marginLeft: 12,
  },
  methodInfoName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
  },
  methodInfoNetwork: {
    fontSize: 12,
    color: '#888',
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
    fontSize: 12,
    color: '#888',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
    marginTop: 4,
  },
  timerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 166, 35, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  timerText: {
    fontSize: 14,
    color: '#888',
    marginLeft: 8,
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  orderLabel: {
    fontSize: 14,
    color: '#888',
  },
  orderValue: {
    fontSize: 14,
    color: '#FFF',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  addressCopyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: 200,
  },
  addressText: {
    fontSize: 12,
    color: '#00F0FF',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    maxWidth: 170,
  },
  guideBox: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  guideTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 12,
  },
  guideText: {
    fontSize: 13,
    color: '#888',
    marginVertical: 4,
    lineHeight: 20,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    color: '#FF6B6B',
    marginLeft: 8,
    lineHeight: 18,
  },
  createOrderBtn: {
    backgroundColor: '#00F0FF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  createOrderBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  modalFooter: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    borderTopWidth: 1,
    borderTopColor: '#222',
  },
  confirmBtn: {
    backgroundColor: '#26A17B',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  confirmBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
});
