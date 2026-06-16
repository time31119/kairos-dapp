import { useState, useEffect } from 'react';
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
import { useWeb3 } from '@/contexts/Web3Context';
import { VIP_PLANS } from '@/utils/vipPlans';
import { formatAddress } from '@/services/metamask';

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      isTrust?: boolean;
      isTokenPocket?: boolean;
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on?: (event: string, callback: (...args: any[]) => void) => void;
      removeListener?: (event: string, callback: (...args: any[]) => void) => void;
    };
  }
}

const WALLET_INFO_KEY = 'wallet_info';
const WALLET_TYPE_KEY = 'wallet_type';

const EXPO_PUBLIC_BACKEND_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'https://api.example.com';

interface Props {
  initialPlanId?: string;
}

interface WalletInfo {
  address: string;
  chain: string;
  connectedAt: number;
}

export default function MembershipPage({ initialPlanId = 'professional' }: Props) {
  const router = useSafeRouter();
  const wallet = useWeb3();
  const params = useSafeSearchParams<{ plan?: string }>();
  
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  
  const planId = params.plan || initialPlanId || 'professional';
  const initialPlan = VIP_PLANS.find((p) => p.id === planId) || VIP_PLANS.find((p) => p.id === 'professional') || VIP_PLANS[0];
  
  const [selectedPlan, setSelectedPlan] = useState(initialPlan);
  const [selectedBillingCycle, setSelectedBillingCycle] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderId, setOrderId] = useState<string>('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const currentPrice = selectedPlan.price[selectedBillingCycle];

  useEffect(() => {
    const initWalletState = async () => {
      try {
        const infoStr = await AsyncStorage.getItem(WALLET_INFO_KEY);
        if (infoStr) {
          const info: WalletInfo = JSON.parse(infoStr);
          if (info.address && /^0x[a-fA-F0-9]{40}$/.test(info.address)) {
            setWalletAddress(info.address);
            setWalletConnected(true);
          }
        }
      } catch (e) {
        console.error('Failed to init wallet state:', e);
      }
    };
    initWalletState();
  }, []);

  // Debug: track if button was rendered
  const [buttonPressCount, setButtonPressCount] = useState(0);

  const handleConnectTPWallet = async () => {
    setButtonPressCount(prev => prev + 1);
    Alert.alert('Debug', 'Button clicked! Count: ' + (buttonPressCount + 1));
    
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        const isTrust = !!window.ethereum.isTrust || 
                        window.navigator.userAgent.toLowerCase().includes('trust');
        
        console.log('Detected wallet type:', isTrust ? 'Trust Wallet' : 'Other');
        
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        
        if (accounts && accounts.length > 0) {
          const address = accounts[0];
          console.log('Wallet connected with address:', address);
          
          if (/^0x[a-fA-F0-9]{40}$/.test(address)) {
            const walletInfo: WalletInfo = {
              address,
              chain: 'bsc',
              connectedAt: Date.now(),
            };
            await AsyncStorage.setItem(WALLET_INFO_KEY, JSON.stringify(walletInfo));
            await AsyncStorage.setItem(WALLET_TYPE_KEY, 'trust');
            
            setWalletAddress(address);
            setWalletConnected(true);
            
            if (wallet.refreshWalletState) {
              await wallet.refreshWalletState();
            }
          } else {
            throw new Error('Invalid address returned');
          }
        } else {
          throw new Error('No accounts returned');
        }
      } else {
        Alert.alert('Tips', 'Please open this page in TP Wallet browser');
      }
    } catch (error: any) {
      console.error('Connect error:', error);
      if (error.code === 4001) {
        Alert.alert('Cancelled', 'Wallet connection was rejected');
      } else {
        Alert.alert('Connection Failed', error.message || 'Please try again');
      }
    }
  };

  const handlePayment = async () => {
    if (!walletConnected || !walletAddress) {
      Alert.alert('Tips', 'Please connect wallet first');
      return;
    }
    
    try {
      setIsProcessing(true);
      
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
        setShowPaymentModal(true);
      } else {
        Alert.alert('Order Failed', data.message || 'Please try again');
      }
    } catch (error) {
      console.error('Create order error:', error);
      Alert.alert('Network Error', 'Please check your connection');
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

  const isConnected = walletConnected && walletAddress;
  const displayAddress = walletAddress ? formatAddress(walletAddress) : '';

  return (
    <Screen safeAreaStyle={{ backgroundColor: '#0A0A0F' }}>
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
                <Text style={styles.connectedText}>TP Wallet Connected</Text>
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
              style={styles.connectButton}
              onPress={handleConnectTPWallet}
            >
              <Ionicons name="wallet-outline" size={24} color="#0A0A0F" />
              <Text style={styles.connectButtonText}>Connect TP Wallet</Text>
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
