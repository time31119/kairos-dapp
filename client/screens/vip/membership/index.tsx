import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import * as Clipboard from 'expo-clipboard';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { getApiBase } from '@/utils/apiConfig';

// BSC USDT 收款地址
const RECEIVE_ADDRESS = '0x769ecB24694F56d75d6eaaD5F634d99eF12c407d'
// BSC USDT 合约地址 (BEP20)
const USDT_CONTRACT = '0x55d398326f99059fF775485246999027B3197955'

// VIP 套餐
const PLANS = [
  { id: 'basic', name: 'Basic', price: 9.9, period: '月', features: ['基础K线分析', '5个交易对监控', '邮件通知'] },
  { id: 'standard', name: 'Standard', price: 29.9, period: '月', features: ['完整K线分析', '20个交易对监控', '实时推送', '优先客服'] },
  { id: 'premium', name: 'Premium', price: 99, period: '月', features: ['专业K线分析', '无限交易对', 'API接口', '专属客服', '优先体验'] },
  { id: 'yearly', name: '年度VIP', price: 999, period: '年', features: ['全部Premium功能', '2个月免费', '专属客服'] },
]

// TP Wallet provider类型
declare global {
  interface Window {
   ethereum?: {
      isTrust?: boolean;
      isMetaMask?: boolean;
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on?: (event: string, callback: any) => void;
      removeListener?: (event: string, callback: any) => void;
    };
    BinanceChain?: {
      bsc?: boolean;
      request: (args: { method: string; params?: any[] }) => Promise<any>;
    };
    trustwallet?: any;
  }
}

// 获取TP Wallet provider
function getTPWalletProvider() {
  if (typeof window === 'undefined') return null;
  
  // 优先使用 ethereum provider (TP Wallet通用接口)
  if (window.ethereum) {
    console.log('[PAY] Using window.ethereum provider');
    return window.ethereum;
  }
  
  // 备用 BinanceChain
  if (window.BinanceChain) {
    console.log('[PAY] Using BinanceChain provider');
    return window.BinanceChain;
  }
  
  return null;
}

// 计算USDT金额 (USDT BEP20 = 18 decimals)
function calculateAmount(amount: number): string {
  // USDT BEP20 有 18 位小数精度
  // 99 USDT = 99 * 10^18 = 99000000000000000000
  const weiAmount = BigInt(Math.round(amount * 1e18));
  return weiAmount.toString();
}

// 构建USDT transfer数据
function buildTransferData(toAddress: string, amountInWei: string): string {
  const method = '0xa9059cbb';
  const paddedTo = toAddress.slice(2).padStart(64, '0');
  // 直接将字符串转为十六进制并填充64位
  const amountHex = BigInt(amountInWei).toString(16).padStart(64, '0');
  return method + paddedTo + amountHex;
}

export default function MembershipScreen() {
  const router = useSafeRouter();
  const [selectedPlan, setSelectedPlan] = useState(PLANS[2]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  // 连接钱包
  const connectWallet = async () => {
    try {
      const provider = getTPWalletProvider();
      if (!provider) {
        Alert.alert('提示', '请在TP Wallet浏览器中打开此页面');
        return;
      }

      let accounts: string[];
      if (provider.bsc) {
        accounts = await provider.bsc.request({ method: 'eth_requestAccounts' });
      } else {
        accounts = await provider.ethereum!.request({ method: 'eth_requestAccounts' });
      }

      if (accounts && accounts.length > 0) {
        setWalletAddress(accounts[0]);
        console.log('[PAY] Wallet connected:', accounts[0]);
      }
    } catch (error: any) {
      console.error('[PAY] Connect error:', error);
      if (error.code === 4001) {
        Alert.alert('取消', '用户拒绝了连接请求');
      } else {
        Alert.alert('错误', '连接钱包失败');
      }
    }
  };

  // DeepLink 支付 - 直接唤起 TP Wallet App
  const handleDeepLinkPay = async () => {
    if (!selectedPlan) {
      Alert.alert('错误', '请先选择套餐');
      return;
    }

    // 计算正确的金额 (18位精度)
    const amountWei = calculateAmount(selectedPlan.price);
    
    // TP Wallet DeepLink 格式 - 使用正确的参数格式
    const params = {
      action: 'transfer',
      symbol: 'USDT',
      contract: USDT_CONTRACT,
      to: RECEIVE_ADDRESS,
      amount: amountWei,
      decimal: '18',
    };

    // TP Wallet 深度链接格式
    const deepLinkUrl = `tp://wallet/transfer?param=${encodeURIComponent(JSON.stringify(params))}`;
    
    console.log('[PAY] DeepLink URL:', deepLinkUrl);
    console.log('[PAY] Amount (wei):', amountWei);

    // 尝试唤起 TP Wallet
    try {
      window.location.href = deepLinkUrl;
    } catch (error) {
      console.error('[PAY] DeepLink error:', error);
      Alert.alert('错误', '无法唤起TP Wallet');
    }
  };

  // 一键支付
  const handlePay = async () => {
    if (!walletAddress) {
      await connectWallet();
      return;
    }

    setIsProcessing(true);

    try {
      // 直接获取provider进行支付（不依赖后端创建订单）
      const provider = getTPWalletProvider();
      if (!provider) {
        throw new Error('No wallet provider');
      }

      // 计算金额
      const amountSmallest = calculateAmount(selectedPlan.price);
      console.log('[PAY] Amount:', selectedPlan.price, '->', amountSmallest);

      // 构建交易数据
      const transferData = buildTransferData(RECEIVE_ADDRESS, amountSmallest);
      console.log('[PAY] Transfer data:', transferData);

      // 发送交易
      let txHash: string;
      if (provider.bsc) {
        txHash = await provider.bsc.request({
          method: 'eth_sendTransaction',
          params: [{
            from: walletAddress,
            to: USDT_CONTRACT,
            data: transferData,
          }],
        });
      } else {
        txHash = await provider.ethereum!.request({
          method: 'eth_sendTransaction',
          params: [{
            from: walletAddress,
            to: USDT_CONTRACT,
            data: transferData,
          }],
        });
      }

      console.log('[PAY] Transaction hash:', txHash);
      setTxHash(txHash as string);
      setOrderId('tx-' + Date.now());
      setShowPaymentModal(true);

    } catch (error: any) {
      console.error('[PAY] Payment error:', error);
      setIsProcessing(false);
      
      let errorMsg = '支付失败';
      if (error.code === 4001 || error.code === 'ACTION_REJECTED' || error.message?.includes('rejected')) {
        errorMsg = '用户取消了支付';
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      Alert.alert('支付失败', errorMsg);
    }
  };

  // 复制地址
  const handleCopyAddress = async () => {
    await Clipboard.setStringAsync(RECEIVE_ADDRESS);
    Alert.alert('已复制', '收款地址已复制');
  };

  // 复制金额
  const handleCopyAmount = async () => {
    await Clipboard.setStringAsync(selectedPlan.price.toString());
    Alert.alert('已复制', '金额已复制');
  };

  return (
    <Screen>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/')}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>VIP 会员</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.container}>
        {/* Banner */}
        <View style={styles.banner}>
          <Ionicons name="diamond" size={40} color="#FFD700" />
          <Text style={styles.bannerTitle}>KAIROS VIP</Text>
          <Text style={styles.bannerSubtitle}>解锁全部高级功能</Text>
        </View>

        {/* 套餐列表 */}
        <View style={styles.plansContainer}>
          {PLANS.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              style={[
                styles.planCard,
                selectedPlan.id === plan.id && styles.planCardSelected,
              ]}
              onPress={() => setSelectedPlan(plan)}
            >
              <View style={styles.planHeader}>
                <Text style={styles.planName}>{plan.name}</Text>
                {selectedPlan.id === plan.id && (
                  <Ionicons name="checkmark-circle" size={20} color="#00F0FF" />
                )}
              </View>
              <View style={styles.planPrice}>
                <Text style={styles.priceSymbol}>$</Text>
                <Text style={styles.priceValue}>{plan.price}</Text>
                <Text style={styles.pricePeriod}>/{plan.period}</Text>
              </View>
              <View style={styles.features}>
                {plan.features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <Ionicons name="checkmark" size={14} color="#00FF88" />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* 钱包状态 */}
        <View style={styles.walletStatus}>
          <Ionicons name="wallet" size={20} color="#00F0FF" />
          <Text style={styles.walletText}>
            {walletAddress ? `${walletAddress.slice(0,6)}...${walletAddress.slice(-4)}` : '未连接钱包'}
          </Text>
          {!walletAddress && (
            <TouchableOpacity style={styles.connectBtn} onPress={connectWallet}>
              <Text style={styles.connectBtnText}>连接</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 一键购买按钮 - DApp浏览器方式 */}
        <TouchableOpacity
          style={[styles.buyButton, isProcessing && styles.buyButtonDisabled]}
          onPress={handlePay}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color="#0A0A0F" />
              <Text style={styles.buyButtonText}>  支付中...</Text>
            </View>
          ) : (
            <Text style={styles.buyButtonText}>
              {walletAddress ? '一键支付 USDT' : '连接钱包并支付'}
            </Text>
          )}
        </TouchableOpacity>

        {/* DeepLink 方式 - 备选 */}
        <TouchableOpacity
          style={styles.deeplinkButton}
          onPress={() => {
            // TP Wallet DeepLink 格式
            const amount = selectedPlan.price;
            const deeplink = `token-pocket://swap?amount=${amount}&symbol=USDT&contract=0x55d398326f99059fF775485246999027B3197955&decimal=18&to=0x769ecB24694F56d75d6eaaD5F634d99eF12c407d&chain=bsc`;
            // 尝试拉起 TP Wallet
            window.location.href = deeplink;
            Alert.alert('提示', '如果TP Wallet没有自动打开，请在手机浏览器中打开此页面，然后点击上面的按钮。');
          }}
        >
          <Ionicons name="open-outline" size={18} color="#00F0FF" />
          <Text style={styles.deeplinkButtonText}>  备选：浏览器方式支付</Text>
        </TouchableOpacity>

        {/* 支付说明 */}
        <View style={styles.paymentInfo}>
          <View style={styles.infoRow}>
            <Ionicons name="shield-checkmark" size={16} color="#00FF88" />
            <Text style={styles.infoText}>  BSC链 USDT (BEP20) 安全支付</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="time" size={16} color="#FFD700" />
            <Text style={styles.infoText}>  即时到账，自动开通</Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* 支付成功弹窗 */}
      <Modal visible={showPaymentModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={60} color="#00FF88" />
            </View>
            <Text style={styles.successTitle}>支付成功!</Text>
            <Text style={styles.successSubtitle}>
              您已成功开通 {selectedPlan.name} VIP
            </Text>

            {txHash && (
              <View style={styles.txContainer}>
                <Text style={styles.txLabel}>交易哈希</Text>
                <Text style={styles.txHash} numberOfLines={2}>
                  {txHash}
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.doneButton}
              onPress={() => router.replace('/')}
            >
              <Text style={styles.doneButtonText}>完成</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    backgroundColor: '#13131A',
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F2E',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  banner: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#13131A',
    marginBottom: 20,
  },
  bannerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD700',
    marginTop: 12,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
  plansContainer: {
    paddingHorizontal: 16,
  },
  planCard: {
    backgroundColor: '#13131A',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1F1F2E',
    marginBottom: 12,
  },
  planCardSelected: {
    borderColor: '#00F0FF',
    backgroundColor: 'rgba(0, 240, 255, 0.05)',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  planPrice: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 8,
  },
  priceSymbol: {
    fontSize: 16,
    color: '#00F0FF',
  },
  priceValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#00F0FF',
  },
  pricePeriod: {
    fontSize: 14,
    color: '#6B7280',
  },
  features: {
    marginTop: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  featureText: {
    fontSize: 13,
    color: '#9CA3AF',
    marginLeft: 8,
  },
  walletStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#13131A',
    borderRadius: 12,
  },
  walletText: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 10,
  },
  connectBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: '#00F0FF',
    borderRadius: 8,
  },
  connectBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0A0A0F',
  },
  buyButton: {
    backgroundColor: '#00FF88',
    marginHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buyButtonDisabled: {
    opacity: 0.6,
  },
  deeplinkButton: {
    backgroundColor: '#1E88E5',
    marginHorizontal: 16,
    marginTop: 12,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  deeplinkButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0A0A0F',
  },
  paymentInfo: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    backgroundColor: '#13131A',
    borderRadius: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  // 弹窗
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1A1A2E',
    borderRadius: 24,
    padding: 32,
    margin: 24,
    alignItems: 'center',
    width: '85%',
  },
  successIcon: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 20,
  },
  txContainer: {
    width: '100%',
    backgroundColor: '#13131A',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  txLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
  },
  txHash: {
    fontSize: 12,
    color: '#00F0FF',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  doneButton: {
    backgroundColor: '#00F0FF',
    paddingHorizontal: 48,
    paddingVertical: 14,
    borderRadius: 12,
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0A0A0F',
  },
});
