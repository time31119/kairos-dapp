import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { useSafeRouter, useSafeSearchParams } from '@/hooks/useSafeRouter';
import { Screen } from '@/components/Screen';
import { Ionicons } from '@expo/vector-icons';
import { useWeb3 } from '@/contexts/Web3Context';
import { VIP_PLANS } from '@/utils/vipPlans';

const EXPO_PUBLIC_BACKEND_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'https://api.example.com';

interface Props {
  initialPlanId?: string;
}

export default function MembershipPage({ initialPlanId = 'professional' }: Props) {
  const router = useSafeRouter();
  const wallet = useWeb3();
  const params = useSafeSearchParams<{ plan?: string }>();
  
  // Get plan from route params, fallback to initialPlanId prop or default to 'professional'
  const planId = params.plan || initialPlanId || 'professional';
  const initialPlan = VIP_PLANS.find((p) => p.id === planId) || VIP_PLANS.find((p) => p.id === 'professional') || VIP_PLANS[0];
  
  const [selectedPlan, setSelectedPlan] = useState(initialPlan);
  const [selectedBillingCycle, setSelectedBillingCycle] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderId, setOrderId] = useState<string>('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const currentPrice = selectedPlan.price[selectedBillingCycle];

  // Handle connect TP Wallet
  const handleConnectTPWallet = async () => {
    try {
      await wallet.connect('trust');
    } catch (error) {
      Alert.alert('连接失败', '请确保已安装 TP 钱包');
    }
  };

  // Combined: Create order and initiate payment
  const handleCreateOrderAndPay = async () => {
    if (!wallet.wallet.isConnected || !wallet.wallet.address) {
      Alert.alert('提示', '请先连接钱包');
      return;
    }

    setIsProcessing(true);
    try {
      // Create order first
      const response = await fetch(`${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/subscription/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: selectedPlan.id,
          billingCycle: selectedBillingCycle,
          paymentMethod: 'tp_wallet',
          walletAddress: wallet.wallet.address,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setOrderId(data.orderId);
        // Now trigger payment
        await handleOpenTPWallet(data.orderId);
      } else {
        Alert.alert('创建订单失败', data.message || '请稍后重试');
      }
    } catch (error) {
      Alert.alert('网络错误', '请检查网络连接');
    } finally {
      setIsProcessing(false);
    }
  };

  // Create order
  const handleCreateOrder = async () => {
    if (!wallet.wallet.isConnected || !wallet.wallet.address) {
      Alert.alert('提示', '请先连接钱包');
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch(`${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/subscription/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: selectedPlan.id,
          billingCycle: selectedBillingCycle,
          paymentMethod: 'tp_wallet',
          walletAddress: wallet.wallet.address,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setOrderId(data.orderId);
        setShowPaymentModal(true);
      } else {
        Alert.alert('创建订单失败', data.message || '请稍后重试');
      }
    } catch (error) {
      Alert.alert('网络错误', '请检查网络连接');
    } finally {
      setIsProcessing(false);
    }
  };

  // Confirm payment
  const confirmPayment = async (orderId: string, walletAddress: string) => {
    setIsProcessing(true);
    try {
      const response = await fetch(`${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/subscription/callback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          walletAddress,
          txHash: 'manual_confirm_' + Date.now(),
        }),
      });

      const data = await response.json();
      if (data.success) {
        Alert.alert('支付成功', '您的会员已开通，有效期至 ' + data.expireDate, [
          { text: '确定', onPress: () => router.back() },
        ]);
      } else {
        Alert.alert('确认失败', '请稍后重试或联系客服');
      }
    } catch (error) {
      Alert.alert('网络错误', '请检查网络连接');
    } finally {
      setIsProcessing(false);
    }
  };

  // Open TP Wallet for payment using Web3
  const handleOpenTPWallet = async (orderIdToUse?: string) => {
    if (!wallet.wallet.isConnected || !wallet.wallet.address) {
      Alert.alert('提示', '请先连接钱包');
      return;
    }

    const amount = currentPrice;
    const bnbAddress = '0x769ecB24694F56d75d6eaaD5F634d99eF12c407d';
    const currentOrderId = orderIdToUse || orderId;
    
    // Check if in TP Wallet browser
    const isTPWallet = !!(window as any).trustwallet || (window as any).isTrust;
    
    if (isTPWallet && (window as any).trustwallet) {
      try {
        // Use TP Wallet's Web3 provider
        const provider = (window as any).trustwallet;
        
        // Request TRON account
        const result = await provider.request({
          method: 'tron_requestAccounts',
        });
        
        if (result && (result.address || result.code === 200)) {
          // Show payment info and guide user
          Alert.alert(
            'TP 钱包支付',
            `请在 TP 钱包中完成以下操作：\n\n发送 ${amount} USDT (BNB Chain BEP20) 到\n\n地址: ${bnbAddress}\n\n备注/Order ID: ${currentOrderId}\n\n转账完成后，点击确认支付`,
            [
              { text: '取消' },
              { 
                text: '已完成转账', 
                onPress: () => confirmPayment(currentOrderId, wallet.wallet.address || '') 
              }
            ]
          );
        }
      } catch (error) {
        console.log('TP Wallet Web3 error:', error);
        // Fallback to manual copy
        Alert.alert(
          '收款地址',
          `USDT BNB Chain (BEP20)\n${bnbAddress}\n\n金额: ${amount} USDT\n\n备注: ${currentOrderId}\n\n请复制地址到 TP 钱包转账`,
          [
            { text: '确定' }
          ]
        );
      }
    } else {
      // Fallback for other browsers - show copy address
      Alert.alert(
        '收款地址',
        `USDT BNB Chain (BEP20)\n${bnbAddress}\n\n金额: ${amount} USDT\n\n备注: ${currentOrderId}\n\n请复制地址到 TP 钱包转账`,
        [
          { text: '确定' }
        ]
      );
    }
  };

  return (
    <Screen>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>订阅支付</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Order Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <View style={[styles.planTag, { backgroundColor: selectedPlan.color + '20' }]}>
              <Text style={[styles.planTagText, { color: selectedPlan.color }]}>
                {selectedPlan.name}
              </Text>
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.priceCurrency}>$</Text>
              <Text style={styles.summaryPrice}>{currentPrice}</Text>
              <Text style={styles.priceUnit}>/{selectedBillingCycle === 'monthly' ? '月' : selectedBillingCycle === 'quarterly' ? '季' : '年'}</Text>
            </View>
          </View>
          
          <View style={styles.summaryDetails}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>订阅时长</Text>
              <Text style={styles.summaryValue}>
                {selectedBillingCycle === 'monthly' ? '1个月' : 
                 selectedBillingCycle === 'quarterly' ? '3个月' : '12个月'}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>支付方式</Text>
              <Text style={[styles.summaryValue, { color: '#00E5CC' }]}>USDT</Text>
            </View>
          </View>
        </View>

        {/* Billing Cycle */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>选择周期</Text>
          <View style={styles.cycleContainer}>
            {(['monthly', 'quarterly', 'yearly'] as const).map((cycle) => {
              const isSelected = selectedBillingCycle === cycle;
              const price = selectedPlan.price[cycle];
              const discount = cycle === 'quarterly' ? '省15%' : cycle === 'yearly' ? '省25%' : '';
              
              return (
                <TouchableOpacity
                  key={cycle}
                  style={[
                    styles.cycleCard,
                    isSelected && { borderColor: '#00E5CC', borderWidth: 2, backgroundColor: '#00E5CC10' }
                  ]}
                  onPress={() => setSelectedBillingCycle(cycle)}
                >
                  <Text style={[styles.cycleText, isSelected && { color: '#00E5CC', fontWeight: '600' }]}>
                    {cycle === 'monthly' ? '月付' : cycle === 'quarterly' ? '季付' : '年付'}
                  </Text>
                  <Text style={[styles.cyclePrice, isSelected && { color: '#FFFFFF' }]}>${price}</Text>
                  {discount ? (
                    <View style={[styles.discountBadge, { backgroundColor: '#00E5CC' }]}>
                      <Text style={styles.discountText}>{discount}</Text>
                    </View>
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Features Preview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>套餐权益</Text>
          <View style={styles.featuresCard}>
            {selectedPlan.features.slice(0, 4).map((feature, index) => (
              <View key={index} style={styles.featureRow}>
                <Ionicons
                  name={feature.enabled ? 'checkmark-circle' : 'close-circle'}
                  size={18}
                  color={feature.enabled ? '#00E5CC' : '#4A4A5A'}
                />
                <Text style={styles.featureText}>{feature.text}</Text>
              </View>
            ))}
            <Text style={styles.moreFeatures}>等{selectedPlan.features.length}项权益...</Text>
          </View>
        </View>

        {/* Payment Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>收款信息</Text>
          <View style={styles.addressCard}>
            <View style={styles.addressRow}>
              <Text style={styles.addressLabel}>币种</Text>
              <Text style={[styles.addressValue, { color: '#00E5CC' }]}>USDT (TRC20)</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.addressRow}>
              <Text style={styles.addressLabel}>地址</Text>
              <Text style={styles.addressValue} numberOfLines={1}>
                TSV8UGKBeXrj26PUiBUhhLunfzVSmvyqWq
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.addressRow}>
              <Text style={styles.addressLabel}>金额</Text>
              <Text style={[styles.addressValue, { color: '#00E5CC', fontWeight: '700' }]}>
                ≈ ${currentPrice} USDT
              </Text>
            </View>
          </View>
        </View>

        {/* Wallet Connection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>钱包</Text>
          <TouchableOpacity 
            style={[styles.walletCard, wallet.wallet.isConnected && styles.walletCardConnected]}
            onPress={wallet.wallet.isConnected ? undefined : handleConnectTPWallet}
          >
            <View style={[styles.walletIcon, wallet.wallet.isConnected && styles.walletIconConnected]}>
              <Ionicons name="wallet" size={22} color={wallet.wallet.isConnected ? '#0A0A0F' : '#00E5CC'} />
            </View>
            <View style={styles.walletInfo}>
              <Text style={styles.walletName}>TP 钱包</Text>
              {wallet.wallet.isConnected && wallet.wallet.address ? (
                <Text style={styles.walletAddress}>
                  {wallet.wallet.address.slice(0, 8)}...{wallet.wallet.address.slice(-6)}
                </Text>
              ) : (
                <Text style={styles.walletHint}>点击连接钱包</Text>
              )}
            </View>
            {wallet.wallet.isConnected ? (
              <View style={[styles.connectedBadge, { backgroundColor: '#00E5CC' }]}>
                <Ionicons name="checkmark" size={14} color="#0A0A0F" />
              </View>
            ) : wallet.wallet.isConnecting ? (
              <ActivityIndicator size="small" color="#888888" />
            ) : (
              <Ionicons name="chevron-forward" size={20} color="#666666" />
            )}
          </TouchableOpacity>
        </View>

        {/* Terms */}
        <Text style={styles.termsText}>
          支付即表示同意《会员服务协议》和《自动续费协议》
        </Text>

        {/* Pay Button */}
        <TouchableOpacity
          style={[
            styles.payButton,
            { backgroundColor: wallet.wallet.isConnected ? '#00E5CC' : '#333333' }
          ]}
          onPress={wallet.wallet.isConnected ? handleCreateOrderAndPay : handleConnectTPWallet}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="#0A0A0F" size="small" />
          ) : (
            <View style={styles.payButtonContent}>
              <Ionicons name="paper-plane" size={18} color={wallet.wallet.isConnected ? '#0A0A0F' : '#FFFFFF'} />
              <Text style={[styles.payButtonText, { color: wallet.wallet.isConnected ? '#0A0A0F' : '#FFFFFF' }]}>
                {wallet.wallet.isConnected ? '打开 TP 钱包支付' : '连接 TP 钱包'}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Bottom Spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#0A0A0F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  summaryCard: {
    backgroundColor: '#16161F',
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#252530',
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  planTag: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  planTagText: {
    fontSize: 14,
    fontWeight: '600',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceCurrency: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 2,
  },
  summaryPrice: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  priceUnit: {
    fontSize: 14,
    color: '#888888',
    marginLeft: 4,
  },
  summaryDetails: {
    gap: 14,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#888888',
  },
  summaryValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#252530',
    marginVertical: 4,
  },
  cycleContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  cycleCard: {
    flex: 1,
    backgroundColor: '#16161F',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#252530',
  },
  cycleText: {
    fontSize: 14,
    color: '#888888',
    marginBottom: 8,
  },
  cyclePrice: {
    fontSize: 18,
    fontWeight: '600',
    color: '#CCCCCC',
  },
  discountBadge: {
    marginTop: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  discountText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0A0A0F',
  },
  featuresCard: {
    backgroundColor: '#16161F',
    borderRadius: 16,
    padding: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  featureText: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  moreFeatures: {
    fontSize: 12,
    color: '#555555',
    marginTop: 8,
    textAlign: 'center',
  },
  addressCard: {
    backgroundColor: '#16161F',
    borderRadius: 16,
    padding: 16,
  },
  addressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  addressLabel: {
    fontSize: 14,
    color: '#888888',
  },
  addressValue: {
    fontSize: 13,
    color: '#FFFFFF',
    maxWidth: '55%',
  },
  walletCard: {
    backgroundColor: '#16161F',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#252530',
  },
  walletCardConnected: {
    borderColor: '#00E5CC',
    backgroundColor: '#00E5CC08',
  },
  walletIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#00E5CC15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  walletIconConnected: {
    backgroundColor: '#00E5CC',
  },
  walletInfo: {
    flex: 1,
    marginLeft: 14,
  },
  walletName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  walletAddress: {
    fontSize: 12,
    color: '#888888',
    marginTop: 4,
    fontFamily: 'monospace',
  },
  walletHint: {
    fontSize: 12,
    color: '#555555',
    marginTop: 4,
  },
  connectedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  termsText: {
    fontSize: 11,
    color: '#444444',
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 18,
  },
  payButton: {
    marginTop: 16,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  payButtonText: {
    fontSize: 17,
    fontWeight: '700',
  },
});
