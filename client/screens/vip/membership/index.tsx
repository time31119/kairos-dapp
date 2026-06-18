import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeRouter, useSafeSearchParams } from '@/hooks/useSafeRouter';
import { Screen } from '@/components/Screen';
import { Ionicons } from '@expo/vector-icons';
import { VIP_PLANS } from '@/utils/vipPlans';
import { formatAddress } from '@/services/metamask';

declare global {
  interface Window {
    trustwallet?: any;
    tokenpocket?: any;
    ethereum?: any;
    BinanceChain?: any;
  }
}

const WALLET_ADDRESS_KEY = 'wallet_address';
const WALLET_TYPE_KEY = 'wallet_type';
const WALLET_INFO_KEY = 'wallet_info'; // 与"我的"页面保持一致

const EXPO_PUBLIC_BACKEND_BASE_URL = 'http://44.207.237.253:9091';

// Web环境使用 localStorage，RN环境使用 AsyncStorage
const webStorage = {
  getItem: async (key: string): Promise<string | null> => {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(key);
    }
    return AsyncStorage.getItem(key);
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(key, value);
    } else {
      await AsyncStorage.setItem(key, value);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(key);
    } else {
      await AsyncStorage.removeItem(key);
    }
  },
};

// 获取以太坊提供者 - 支持 TP Wallet、MetaMask 等多种钱包
const getEthereumProvider = () => {
  if (typeof window === 'undefined') return null;
  
  try {
    const provider = (window as any);
    
    // 检查 TP Wallet (trustwallet)
    if (provider.trustwallet) {
      console.log('[VIP] Using Trust Wallet provider');
      return provider;
    }
    
    // 检查 standard ethereum provider - 添加安全检查
    if (provider.ethereum && typeof provider.ethereum.request === 'function') {
      console.log('[VIP] Using Ethereum provider:', provider.ethereum.isMetaMask ? 'MetaMask' : provider.ethereum.isTrust ? 'Trust Wallet' : 'Unknown');
      return provider;
    }
  } catch (e) {
    // 忽略 TP Wallet 内部错误
    console.log('[VIP] Wallet detection error (ignored):', e);
  }
  
  return null;
};

export default function MembershipPage() {
  const router = useSafeRouter();
  const params = useSafeSearchParams<{ plan?: string }>();
  
  const [walletStatus, setWalletStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [walletAddress, setWalletAddress] = useState('');
  const [walletType, setWalletType] = useState<'trust' | 'metamask' | 'bsc' | null>(null);
  
  const planId = params.plan || 'professional';
  const initialPlan = VIP_PLANS.find((p) => p.id === planId) || VIP_PLANS.find((p) => p.id === 'professional') || VIP_PLANS[0];
  
  const [selectedPlan, setSelectedPlan] = useState(initialPlan);
  const [selectedBillingCycle, setSelectedBillingCycle] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderId, setOrderId] = useState<string>('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const currentPrice = selectedPlan.price[selectedBillingCycle];

  // 恢复钱包连接状态 - 同时检查 window.ethereum 和本地存储
  useEffect(() => {
    const restoreWallet = async () => {
      console.log('[VIP] Starting wallet restore...');
      
      // 1. 检查 window.ethereum
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          console.log('[VIP] eth_accounts result:', accounts);
          if (accounts && accounts.length > 0 && /^0x[a-fA-F0-9]{40}$/.test(accounts[0])) {
            const address = accounts[0];
            setWalletAddress(address);
            setWalletStatus('connected');
            setWalletType('trust');
            console.log('[VIP] Wallet restored from eth_accounts:', address);
            return;
          }
        } catch (e: any) {
          console.log('[VIP] eth_accounts failed:', e?.message);
        }
      }
        
      // 2. 检查 localStorage
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const stored = localStorage.getItem('wallet_info');
          console.log('[VIP] localStorage wallet_info:', stored ? 'found' : 'not found');
          if (stored) {
            const info = JSON.parse(stored);
            if (info?.address && /^0x[a-fA-F0-9]{40}$/.test(info.address)) {
              setWalletAddress(info.address);
              setWalletStatus('connected');
              setWalletType(info.type || 'trust');
              console.log('[VIP] Wallet restored from localStorage:', info.address);
              return;
            }
          }
        }
      } catch (e) {
        console.log('[VIP] localStorage check failed');
      }
      
      console.log('[VIP] No wallet found');
    };
    
    restoreWallet();

    // 监听钱包账户变化事件
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccountsChanged = async (accounts: string[]) => {
        console.log('[VIP] accountsChanged:', accounts);
        if (accounts && accounts.length > 0 && /^0x[a-fA-F0-9]{40}$/.test(accounts[0])) {
          const address = accounts[0];
          setWalletAddress(address);
          setWalletStatus('connected');
          setWalletType('trust');
          try {
            if (window.localStorage) {
              localStorage.setItem('wallet_info', JSON.stringify({ address, type: 'trust' }));
            }
          } catch (e) {}
        } else {
          setWalletAddress('');
          setWalletStatus('disconnected');
          try {
            if (window.localStorage) {
              localStorage.removeItem('wallet_info');
            }
          } catch (e) {}
        }
      };

      window.ethereum.on?.('accountsChanged', handleAccountsChanged);
      window.ethereum.on?.('connect', () => console.log('[VIP] Wallet connected event'));

      return () => {
        window.ethereum.removeListener?.('accountsChanged', handleAccountsChanged);
      };
    }
  }, []);

  // 连接钱包 - 和"我的"页面完全相同的逻辑
  const handleConnectWallet = async () => {
    try {
      setWalletStatus('connecting');

      const provider = getEthereumProvider();

      if (provider) {
        const accounts = await provider.ethereum.request({
          method: 'eth_requestAccounts',
        });

        if (accounts && accounts.length > 0 && /^0x[a-fA-F0-9]{40}$/.test(accounts[0])) {
          const address = accounts[0];
          setWalletAddress(address);
          setWalletStatus('connected');

          // 检测钱包类型
          let detectedType: 'trust' | 'metamask' | 'bsc' = 'metamask';
          if (provider.trustwallet || window.trustwallet || provider.ethereum?.isTokenPocket || provider.ethereum?.isTrust || (window as any).tokenpocket) {
            detectedType = 'trust';
          } else if (provider.BinanceChain?.bsc) {
            detectedType = 'bsc';
          }
          setWalletType(detectedType);

          // 保存到本地存储 - 同时保存 wallet_info 和旧格式 (Web用localStorage, RN用AsyncStorage)
          const walletInfo = {
            address,
            chain: 'bsc',
            connectedAt: Date.now(),
          };
          await webStorage.setItem(WALLET_INFO_KEY, JSON.stringify(walletInfo));
          await webStorage.setItem(WALLET_ADDRESS_KEY, address);
          await webStorage.setItem(WALLET_TYPE_KEY, detectedType);
        } else {
          throw new Error('Invalid address returned');
        }
      } else {
        Alert.alert('Tips', 'Please open this page in TP Wallet browser');
        setWalletStatus('disconnected');
      }
    } catch (error: any) {
      console.error('Connect wallet error:', error);
      if (error.code === 4001) {
        Alert.alert('Cancelled', 'Wallet connection was rejected');
      } else {
        Alert.alert('Connection Failed', error.message || 'Please try again');
      }
      setWalletStatus('disconnected');
    }
  };

  const handlePayment = async () => {
    if (walletStatus !== 'connected' || !walletAddress) {
      Alert.alert('Tips', 'Please connect wallet first');
      return;
    }
    
    try {
      setIsProcessing(true);
      
      // 创建订单
      const response = await fetch(EXPO_PUBLIC_BACKEND_BASE_URL + '/api/v1/subscription/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: selectedPlan.id,
          billingCycle: selectedBillingCycle,
          walletAddress: walletAddress,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.orderId) {
        setOrderId(data.orderId);
        
        // 获取 provider
        const provider = getEthereumProvider();
        
        if (provider && provider.ethereum) {
          try {
            // USDT (BEP20) 合约地址 - BSC链上USDT精度是18位
            const USDT_CONTRACT = '0x55d398326f99059fF775485246999027B3197955';
            // 收款地址
            const RECEIVE_ADDRESS = '0x769ecB24694F56d75d6eaaD5F634d99eF12c407d';
            // 金额（USDT BEP20 有 18 位小数）
            const amount = currentPrice;
            // 使用字符串方式避免浮点数精度问题
            const amountStr = amount.toString().split('.')[0] + '.' + amount.toString().split('.')[1]?.padEnd(18, '0') || '';
            const amountInSmallestUnit = amountStr.replace('.', '').padEnd(19, '0');
            
            // 构建 USDT transfer 函数调用
            const transferData = '0xa9059cbb' + 
              RECEIVE_ADDRESS.slice(2).padStart(64, '0') + 
              BigInt(amountInSmallestUnit).toString(16).padStart(64, '0');
            
            // 请求 TP Wallet 转账 (BSC chain: 0x38)
            const txHash = await provider.ethereum.request({
              method: 'eth_sendTransaction',
              params: [{
                from: walletAddress,
                to: USDT_CONTRACT,
                value: '0x0',
                data: transferData,
                chainId: '0x38',
              }],
            });
            
            console.log('Transaction hash:', txHash);
            setShowPaymentModal(true);
          } catch (txError: any) {
            console.error('[VIP] Transaction error:', txError);
            Alert.alert('Transaction Error', txError.message || 'Transaction failed');
            // 显示手动转账界面
            setShowPaymentModal(true);
          }
        } else {
          // 没有 provider，显示手动转账界面
          setShowPaymentModal(true);
        }
      } else {
        console.error('Order failed:', data.message);
      }
    } catch (error: any) {
      console.error('Create order error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyAddress = async () => {
    await Clipboard.setStringAsync('0x769ecB24694F56d75d6eaaD5F634d99eF12c407d');
    Alert.alert('Copied', 'Address copied to clipboard');
  };

  const handleCopyAmount = async () => {
    await Clipboard.setStringAsync(currentPrice.toString());
    Alert.alert('Copied', 'Amount copied to clipboard');
  };

  const handleConfirmPayment = async () => {
    if (!orderId) return;
    
    try {
      setIsProcessing(true);
      
      const response = await fetch(EXPO_PUBLIC_BACKEND_BASE_URL + '/api/v1/subscription/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          walletAddress: walletAddress,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setShowPaymentModal(false);
        Alert.alert(
          'Success', 
          'You have upgraded to ' + selectedPlan.name + '!',
          [{ text: 'OK', onPress: () => router.push('/') }]
        );
      } else {
        Alert.alert('Confirmation Failed', data.message || 'Please try again');
      }
    } catch (error) {
      console.error('Confirm payment error:', error);
      Alert.alert('Network Error', 'Please check your connection');
    } finally {
      setIsProcessing(false);
    }
  };

  const isConnected = walletStatus === 'connected' && walletAddress;
  const displayAddress = walletAddress ? formatAddress(walletAddress) : '';
  const walletTypeText = walletType === 'trust' ? 'TP Wallet' : walletType === 'bsc' ? 'BSC Wallet' : 'Wallet';

  // 组件首次渲染时立即检查钱包状态
  const checkWalletNow = async () => {
    try {
      // 检查 window.ethereum
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts && accounts.length > 0 && /^0x[a-fA-F0-9]{40}$/.test(accounts[0])) {
            setWalletAddress(accounts[0]);
            setWalletStatus('connected');
          }
        } catch (e) {}
      }
      // 检查 localStorage
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const info = localStorage.getItem('wallet_info');
          if (info) {
            const parsed = JSON.parse(info);
            if (parsed?.address && /^0x[a-fA-F0-9]{40}$/.test(parsed.address)) {
              setWalletAddress(parsed.address);
              setWalletStatus('connected');
            }
          }
        }
      } catch (e) {}
    } catch (e) {}
  };
  checkWalletNow();

  const handleBack = () => {
    // 在 TP Wallet 等内置浏览器中，优先使用 router.back()
    try {
      // 先尝试 router.back()，如果失败或没有历史记录会跳转到首页
      if (typeof window !== 'undefined' && window.history.length > 1) {
        window.history.back();
      } else {
        router.back();
      }
    } catch (e) {
      // 最后兜底：跳转到首页
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }
  };

  return (
    <Screen safeAreaStyle={{ backgroundColor: '#0A0A0F' }}>
      <View style={styles.headerBar}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBack}
        >
          <Ionicons name="arrow-back" size={24} color="#00F0FF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>VIP Membership</Text>
        <View style={styles.headerRight} />
      </View>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.heroHeader}>
          <Text style={styles.heroTitle}>Upgrade Membership</Text>
          <Text style={styles.heroSubtitle}>Unlock all KAIROS features</Text>
        </View>

        <View style={styles.selectedPlanCard}>
          <View style={styles.planHeader}>
            <View style={styles.planBadge}>
              <Text style={styles.planBadgeText}>Selected</Text>
            </View>
          </View>
          <Text style={styles.planName}>{selectedPlan.name}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceCurrency}>$</Text>
            <Text style={styles.priceAmount}>{currentPrice}</Text>
            <Text style={styles.pricePeriod}>/{selectedBillingCycle === 'monthly' ? 'mo' : selectedBillingCycle === 'quarterly' ? 'qtr' : 'yr'}</Text>
          </View>
        </View>

        <View style={styles.featuresCard}>
          <Text style={styles.featuresTitle}>Features</Text>
          {selectedPlan.features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#00F0FF" style={styles.featureIcon} />
              <Text style={styles.featureText}>{feature.text}</Text>
            </View>
          ))}
        </View>

        <View style={styles.walletSection}>
          {isConnected ? (
            <View style={styles.connectedCard}>
              <View style={styles.connectedInfo}>
                <View style={styles.connectedDot} />
                <Text style={styles.connectedText}>{walletTypeText} Connected</Text>
              </View>
              <Text style={styles.walletAddress}>{displayAddress}</Text>
              <TouchableOpacity 
                style={styles.payButton}
                onPress={handlePayment}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <ActivityIndicator color="#0A0A0F" />
                ) : (
                  <Text style={styles.payButtonText}>Pay Now</Text>
                )}
              </TouchableOpacity>
              
            </View>
          ) : (
            <TouchableOpacity 
              style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#00F0FF', paddingVertical: 16, borderRadius: 12, gap: 10 }}
              onPress={handleConnectWallet}
            >
              {walletStatus === 'connecting' ? (
                <ActivityIndicator color="#0A0A0F" />
              ) : (
                <>
                  <Ionicons name="wallet-outline" size={24} color="#0A0A0F" />
                  <Text style={styles.connectButtonText}>
                    {walletStatus === 'connected' ? 'Proceed to Pay' : 'Connect TP Wallet'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.plansSection}>
          <Text style={styles.plansTitle}>Select Plan</Text>
          <View style={styles.plansList}>
            {VIP_PLANS.map((plan) => (
              <TouchableOpacity
                key={plan.id}
                style={[
                  styles.planCard,
                  selectedPlan.id === plan.id && styles.planCardSelected,
                ]}
                onPress={() => setSelectedPlan(plan)}
              >
                <Text style={[
                  styles.planCardName,
                  selectedPlan.id === plan.id && styles.planCardNameSelected,
                ]}>
                  {plan.name}
                </Text>
                <View style={styles.planCardPrice}>
                  <Text style={styles.planCardPriceAmount}>${plan.price.monthly}</Text>
                  <Text style={styles.planCardPricePeriod}>/mo</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.billingSection}>
          <Text style={styles.billingTitle}>Billing Cycle</Text>
          <View style={styles.billingOptions}>
            {(['monthly', 'quarterly', 'yearly'] as const).map((cycle) => {
              const discount = cycle === 'quarterly' ? '-10%' : cycle === 'yearly' ? '-20%' : '';
              return (
                <TouchableOpacity
                  key={cycle}
                  style={[
                    styles.billingOption,
                    selectedBillingCycle === cycle && styles.billingOptionSelected,
                  ]}
                  onPress={() => setSelectedBillingCycle(cycle)}
                >
                  <Text style={[
                    styles.billingOptionText,
                    selectedBillingCycle === cycle && styles.billingOptionTextSelected,
                  ]}>
                    {cycle === 'monthly' ? 'Monthly' : cycle === 'quarterly' ? 'Quarterly' : 'Yearly'}
                  </Text>
                  {discount ? <Text style={styles.discountBadge}>{discount}</Text> : null}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Questions? Contact support</Text>
        </View>
      </ScrollView>

      <Modal visible={showPaymentModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Complete Payment</Text>
              <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
                <Ionicons name="close" size={24} color="#4B5563" />
              </TouchableOpacity>
            </View>

            <View style={styles.paymentInfo}>
              <Text style={styles.paymentLabel}>Order ID</Text>
              <Text style={styles.paymentValue}>{orderId}</Text>
            </View>

            <View style={styles.paymentInfo}>
              <Text style={styles.paymentLabel}>Receiving Address (BSC)</Text>
              <TouchableOpacity onPress={handleCopyAddress}>
                <Text style={styles.paymentValue}>0x769ecB24694F56d75d6eaaD5F634d99eF12c407d</Text>
                <Text style={styles.copyHint}>Tap to copy</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.paymentInfo}>
              <Text style={styles.paymentLabel}>Amount (USDT)</Text>
              <TouchableOpacity onPress={handleCopyAmount}>
                <Text style={styles.paymentValueLarge}>{currentPrice} USDT</Text>
                <Text style={styles.copyHint}>Tap to copy</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.networkBadge}>
              <Ionicons name="globe-outline" size={16} color="#00F0FF" />
              <Text style={styles.networkText}>BSC (BNB Chain)</Text>
            </View>

            <Text style={styles.paymentNote}>
              Transfer {currentPrice} USDT to the address above using TP Wallet
            </Text>

            <TouchableOpacity 
              style={styles.confirmButton}
              onPress={handleConfirmPayment}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator color="#0A0A0F" />
              ) : (
                <Text style={styles.confirmButtonText}>Confirm Payment</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F' },
  headerBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#0A0A0F' },
  backButton: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#FFFFFF' },
  headerRight: { width: 44 },
  heroHeader: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 },
  heroTitle: { fontSize: 28, fontWeight: '700', color: '#FFFFFF', marginBottom: 8 },
  heroSubtitle: { fontSize: 15, color: '#9CA3AF' },
  selectedPlanCard: { marginHorizontal: 20, marginBottom: 20, padding: 20, backgroundColor: '#1F1F2E', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(0, 240, 255, 0.2)' },
  planHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  planBadge: { paddingHorizontal: 10, paddingVertical: 4, backgroundColor: 'rgba(0, 240, 255, 0.1)', borderRadius: 4 },
  planBadgeText: { fontSize: 12, color: '#00F0FF' },
  planName: { fontSize: 20, fontWeight: '600', color: '#FFFFFF', marginBottom: 8 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 4 },
  priceCurrency: { fontSize: 18, color: '#9CA3AF', marginRight: 2 },
  priceAmount: { fontSize: 36, fontWeight: '700', color: '#FFFFFF' },
  pricePeriod: { fontSize: 14, color: '#9CA3AF' },
  featuresCard: { marginHorizontal: 20, marginBottom: 20, padding: 20, backgroundColor: '#1F1F2E', borderRadius: 16 },
  featuresTitle: { fontSize: 16, fontWeight: '600', color: '#FFFFFF', marginBottom: 16 },
  featureItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  featureIcon: { marginRight: 12 },
  featureText: { fontSize: 14, color: '#D1D5DB', flex: 1 },
  walletSection: { marginHorizontal: 20, marginBottom: 24 },
  connectButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#00F0FF', paddingVertical: 16, borderRadius: 12, gap: 10 },
  connectButtonDisabled: { backgroundColor: '#6B7280' },
  connectButtonText: { fontSize: 16, fontWeight: '600', color: '#0A0A0F' },
  connectedCard: { backgroundColor: '#1F1F2E', borderRadius: 12, padding: 16 },
  connectedInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  connectedDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981', marginRight: 8 },
  connectedText: { fontSize: 14, color: '#10B981' },
  walletAddress: { fontSize: 14, color: '#9CA3AF', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', marginBottom: 12 },
  payButton: { backgroundColor: '#00F0FF', paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  payButtonText: { fontSize: 16, fontWeight: '600', color: '#0A0A0F' },
  plansSection: { marginBottom: 24 },
  plansTitle: { fontSize: 16, fontWeight: '600', color: '#FFFFFF', marginBottom: 12, paddingHorizontal: 20 },
  plansList: { paddingHorizontal: 20, gap: 12 },
  planCard: { backgroundColor: '#1F1F2E', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: 'transparent' },
  planCardSelected: { borderColor: '#00F0FF' },
  planCardName: { fontSize: 16, fontWeight: '600', color: '#FFFFFF', marginBottom: 8 },
  planCardNameSelected: { color: '#00F0FF' },
  planCardPrice: { flexDirection: 'row', alignItems: 'baseline' },
  planCardPriceAmount: { fontSize: 24, fontWeight: '700', color: '#FFFFFF' },
  planCardPricePeriod: { fontSize: 14, color: '#9CA3AF' },
  billingSection: { paddingHorizontal: 20, marginBottom: 40 },
  billingTitle: { fontSize: 16, fontWeight: '600', color: '#FFFFFF', marginBottom: 12 },
  billingOptions: { flexDirection: 'row', gap: 12 },
  billingOption: { flex: 1, paddingVertical: 12, paddingHorizontal: 16, backgroundColor: '#1F1F2E', borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: 'transparent' },
  billingOptionSelected: { borderColor: '#00F0FF', backgroundColor: 'rgba(0, 240, 255, 0.1)' },
  billingOptionText: { fontSize: 14, color: '#9CA3AF' },
  billingOptionTextSelected: { color: '#00F0FF', fontWeight: '600' },
  discountBadge: { fontSize: 10, color: '#F43F5E', marginTop: 4 },
  footer: { paddingHorizontal: 20, paddingBottom: 40, alignItems: 'center' },
  footerText: { fontSize: 13, color: '#6B7280' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.8)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#1F1F2E', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#FFFFFF' },
  paymentInfo: { marginBottom: 20 },
  paymentLabel: { fontSize: 14, color: '#9CA3AF', marginBottom: 8 },
  paymentValue: { fontSize: 16, color: '#FFFFFF', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  paymentValueLarge: { fontSize: 24, fontWeight: '700', color: '#00F0FF' },
  copyHint: { fontSize: 12, color: '#00F0FF', marginTop: 4 },
  networkBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0, 240, 255, 0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, alignSelf: 'flex-start', marginBottom: 16 },
  networkText: { fontSize: 13, color: '#00F0FF', marginLeft: 6 },
  paymentNote: { fontSize: 14, color: '#9CA3AF', marginBottom: 24, lineHeight: 20 },
  confirmButton: { backgroundColor: '#00F0FF', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  confirmButtonText: { fontSize: 16, fontWeight: '600', color: '#0A0A0F' },
});
