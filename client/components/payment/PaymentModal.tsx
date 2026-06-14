import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  StyleSheet,
  ActivityIndicator,
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
    description: '推荐 · 手续费低 · 秒级确认',
    color: '#26A17B',
    network: 'TRON (TRC20)',
    minConfirmations: 1,
    avgConfirmTime: '1-3 分钟'
  },
  { 
    id: 'ETH', 
    name: 'ETH (ERC20)', 
    icon: 'logo-ethereum',
    description: '以太坊网络转账',
    color: '#627EEA',
    network: 'Ethereum (ERC20)',
    minConfirmations: 12,
    avgConfirmTime: '5-15 分钟'
  },
  { 
    id: 'BNB', 
    name: 'BNB (BEP20)', 
    icon: 'diamond-outline',
    description: 'BNB Smart Chain 转账',
    color: '#F3BA2F',
    network: 'BNB Smart Chain (BEP20)',
    minConfirmations: 15,
    avgConfirmTime: '3-5 分钟'
  },
  { 
    id: 'CREDIT_CARD', 
    name: '信用卡/借记卡', 
    icon: 'card-outline',
    description: 'Visa / Mastercard / Amex',
    color: '#F5A623',
    network: '银行卡',
    minConfirmations: 0,
    avgConfirmTime: '即时到账'
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
    // 模拟支付确认
    Alert.alert(
      '支付确认',
      '请确认已完成转账操作，等待区块链确认后点击确认。',
      [
        { text: '取消', style: 'cancel' },
        { 
          text: '已转账，确认', 
          onPress: () => {
            onSuccess();
            setOrderCreated(false);
            setOrderInfo(null);
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

                {/* Order Details */}
                <View style={styles.orderRow}>
                  <Text style={styles.orderLabel}>订单号</Text>
                  <Text style={styles.orderValue}>{orderInfo?.orderId}</Text>
                </View>
                <View style={styles.orderRow}>
                  <Text style={styles.orderLabel}>应付金额</Text>
                  <Text style={[styles.orderValue, { color: '#26A17B', fontSize: 20, fontWeight: '700' }]}>
                    ${orderInfo?.price} USDT
                  </Text>
                </View>
                <View style={styles.orderRow}>
                  <Text style={styles.orderLabel}>收款地址</Text>
                </View>
                <View style={styles.addressBox}>
                  <Text style={styles.addressText} selectable>
                    {orderInfo?.paymentAddress}
                  </Text>
                  <TouchableOpacity 
                    style={styles.copyButton}
                    onPress={() => {
                      // 复制地址功能
                      Alert.alert('已复制', '收款地址已复制到剪贴板');
                    }}
                  >
                    <Ionicons name="copy-outline" size={16} color="#00F0FF" />
                  </TouchableOpacity>
                </View>
                
                {/* Transfer Instructions */}
                <View style={styles.instructionBox}>
                  <View style={styles.instructionHeader}>
                    <Ionicons name="information-circle" size={18} color="#00F0FF" />
                    <Text style={styles.instructionTitle}>转账说明</Text>
                  </View>
                  {selectedMethod === 'USDT_TRC20' && (
                    <View style={styles.instructionList}>
                      <Text style={styles.instructionItem}>1. 请使用 TRON (TRC20) 网络转账</Text>
                      <Text style={styles.instructionItem}>2. 转账金额必须 ≥ ${orderInfo?.price} USDT</Text>
                      <Text style={styles.instructionItem}>3. 建议多转 1-2 USDT 防止矿工费扣除</Text>
                      <Text style={styles.instructionItem}>4. 转账完成后等待 1-3 分钟区块确认</Text>
                      <Text style={styles.instructionItem}>5. 确认后会员权益自动到账</Text>
                    </View>
                  )}
                  {selectedMethod === 'ETH' && (
                    <View style={styles.instructionList}>
                      <Text style={styles.instructionItem}>1. 请使用 Ethereum (ERC20) 网络转账</Text>
                      <Text style={styles.instructionItem}>2. 转账金额必须 ≥ ${orderInfo?.price} USDT 等值 ETH</Text>
                      <Text style={styles.instructionItem}>3. 建议多转 0.005 ETH 防止矿工费扣除</Text>
                      <Text style={styles.instructionItem}>4. ERC20 网络确认较慢，请耐心等待</Text>
                      <Text style={styles.instructionItem}>5. 确认后会员权益自动到账</Text>
                    </View>
                  )}
                  {selectedMethod === 'CREDIT_CARD' && (
                    <View style={styles.instructionList}>
                      <Text style={styles.instructionItem}>1. 信用卡支付由第三方支付处理</Text>
                      <Text style={styles.instructionItem}>2. 支付成功后即时到账</Text>
                      <Text style={styles.instructionItem}>3. 支持 Visa / Mastercard / American Express</Text>
                      <Text style={styles.instructionItem}>4. 支付限额: 单笔 $50-$10,000</Text>
                    </View>
                  )}
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
                onPress={() => {
                  onSuccess();
                  handleClose();
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
    borderLeftColor: '#00F0FF',
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
