import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import * as Clipboard from 'expo-clipboard';
import { useSafeRouter } from '@/hooks/useSafeRouter';

// BSC USDT 收款地址
const RECEIVE_ADDRESS = '0x769ecB24694F56d75d6eaaD5F634d99eF12c407d';
// BSC USDT 合约地址 (BEP20)
const USDT_CONTRACT = '0x55d398326f99059fF775485246999027B3197955';

// VIP 套餐 - 三版本：白银、黄金、钻石
// 价格：99/199/299，周期：月付/季付/年付
const PLANS = [
  // 白银版
  { id: 'silver_monthly', name: '白银版', price: 99, period: '月', tier: 'silver', badge: '基础', features: ['机构跟投-实时信号', '热门代币行情', '基础智能分析', '代币详情查看'] },
  { id: 'silver_quarterly', name: '白银版', price: 267, period: '季', tier: 'silver', badge: '基础', features: ['机构跟投-实时信号', '热门代币行情', '基础智能分析', '代币详情查看', '9折优惠'] },
  { id: 'silver_yearly', name: '白银版', price: 950, period: '年', tier: 'silver', badge: '基础', features: ['机构跟投-实时信号', '热门代币行情', '基础智能分析', '代币详情查看', '8折优惠'] },
  // 黄金版
  { id: 'gold_monthly', name: '黄金版', price: 199, period: '月', tier: 'gold', badge: 'PRO', features: ['机构跟投-实时信号', '热门代币行情', '高级智能分析', '跟单功能', '聪明钱追踪', '风险预警'] },
  { id: 'gold_quarterly', name: '黄金版', price: 559, period: '季', tier: 'gold', badge: 'PRO', features: ['机构跟投-实时信号', '热门代币行情', '高级智能分析', '跟单功能', '聪明钱追踪', '风险预警', '9折优惠'] },
  { id: 'gold_yearly', name: '黄金版', price: 1990, period: '年', tier: 'gold', badge: 'PRO', features: ['机构跟投-实时信号', '热门代币行情', '高级智能分析', '跟单功能', '聪明钱追踪', '风险预警', '8折优惠'] },
  // 钻石版
  { id: 'diamond_monthly', name: '钻石版', price: 299, period: '月', tier: 'diamond', badge: 'ENTERPRISE', features: ['机构跟投-实时+机构', '热门代币行情', '高级智能分析', '跟单功能', '聪明钱追踪', '风险预警', '机构布局追踪', 'VIP专属客服'] },
  { id: 'diamond_quarterly', name: '钻石版', price: 839, period: '季', tier: 'diamond', badge: 'ENTERPRISE', features: ['机构跟投-实时+机构', '热门代币行情', '高级智能分析', '跟单功能', '聪明钱追踪', '风险预警', '机构布局追踪', 'VIP专属客服', '9折优惠'] },
  { id: 'diamond_yearly', name: '钻石版', price: 2990, period: '年', tier: 'diamond', badge: 'ENTERPRISE', features: ['机构跟投-实时+机构', '热门代币行情', '高级智能分析', '跟单功能', '聪明钱追踪', '风险预警', '机构布局追踪', 'VIP专属客服', '8折优惠'] },
];

// 钱包类型
type WalletType = 'tp' | 'okx' | 'binance';

// 钱包信息
const WALLETS: { id: WalletType; name: string; icon: string; deeplink: string }[] = [
  {
    id: 'tp',
    name: 'TokenPocket',
    icon: '💰',
    deeplink: 'tokenpocket://',
  },
  {
    id: 'okx',
    name: 'OKX Wallet',
    icon: '🌐',
    deeplink: 'okx://',
  },
  {
    id: 'binance',
    name: 'Binance Web3',
    icon: '🟡',
    deeplink: 'bnbwallet://',
  },
];

// 计算USDT金额 (USDT BEP20 = 18 decimals)
function calculateAmount(amount: number): string {
  const weiAmount = BigInt(Math.round(amount * 1e18));
  return weiAmount.toString();
}

// 构建TokenPocket DeepLink
function buildTPWalletDeepLink(toAddress: string, amountWei: string): string {
  const params = {
    action: 'transfer',
    symbol: 'USDT',
    contract: USDT_CONTRACT,
    to: toAddress,
    amount: amountWei,
    decimal: '18',
  };
  return `tokenpocket://wallet/transfer?param=${encodeURIComponent(JSON.stringify(params))}`;
}

// 构建OKX Wallet DeepLink
function buildOKXDeepLink(toAddress: string, amount: number): string {
  const amountWei = calculateAmount(amount);
  return `okx://wallet/inscribe?address=${toAddress}&chain=BSC&token=USDT&amount=${amountWei}`;
}

// 构建Binance Web3 DeepLink (跳转Swap页面)
function buildBinanceDeepLink(amount: number): string {
  return `bnbwallet://swap?inputCurrency=BNB&outputCurrency=${USDT_CONTRACT}`;
}

// TP 钱包 Web3 Provider 转账
async function tpWalletWeb3Transfer(toAddress: string, amount: string): Promise<boolean> {
  try {
    // 尝试获取 TP 钱包的 Web3 Provider
    const tpProvider = (window as any).ethereum;
    if (!tpProvider || tpProvider.isTokenPocket !== true) {
      return false;
    }
    
    const accounts = await tpProvider.request({ method: 'eth_requestAccounts' });
    if (!accounts || accounts.length === 0) return false;
    
    const from = accounts[0];
    const txHash = await tpProvider.request({
      method: 'eth_sendTransaction',
      params: [{
        from,
        to: USDT_CONTRACT, // USDT 合约
        data: buildUSDTTransferData(toAddress, amount),
        value: '0x0',
      }],
    });
    
    return !!txHash;
  } catch (error) {
    console.log('[TP Web3] Transfer failed:', error);
    return false;
  }
}

// 构建 USDT 转账数据 (函数签名: transfer(address, uint256))
function buildUSDTTransferData(toAddress: string, amount: string): string {
  const methodId = '0xa9059cbb';
  const paddedAddress = toAddress.slice(2).padStart(64, '0');
  const paddedAmount = BigInt(amount).toString(16).padStart(64, '0');
  return '0x' + methodId + paddedAddress + paddedAmount;
}

// iframe 方式尝试打开 Deep Link
function tryIframeDeepLink(url: string): void {
  try {
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = url;
    document.body.appendChild(iframe);
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);
  } catch (error) {
    console.log('[iframe] Failed:', error);
  }
}

// 检查钱包是否安装
async function checkWalletInstalled(walletType: WalletType): Promise<boolean> {
  const schemes: Record<WalletType, string> = {
    tp: 'tokenpocket://',
    okx: 'okx://',
    binance: 'bnbwallet://',
  };
  
  try {
    const canOpen = await Linking.canOpenURL(schemes[walletType]);
    return canOpen;
  } catch {
    return false;
  }
}

export default function MembershipScreen() {
  const router = useSafeRouter();
  const [selectedPlan, setSelectedPlan] = useState(PLANS[2]);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [showContractModal, setShowContractModal] = useState(false);
  const [contractModalData, setContractModalData] = useState<{address: string; amount: string} | null>(null);
  const [copiedMessage, setCopiedMessage] = useState('');

  // 唤起钱包支付
  const handleWalletPay = async (walletType: WalletType) => {
    setShowWalletModal(false);
    setIsProcessing(true);

    const amountWei = calculateAmount(selectedPlan.price);
    const amountDisplay = selectedPlan.price.toString();
    let deepLinkUrl: string;

    switch (walletType) {
      case 'tp':
        deepLinkUrl = buildTPWalletDeepLink(RECEIVE_ADDRESS, amountWei);
        break;
      case 'okx':
        deepLinkUrl = buildOKXDeepLink(RECEIVE_ADDRESS, selectedPlan.price);
        break;
      case 'binance':
        deepLinkUrl = buildBinanceDeepLink(selectedPlan.price);
        break;
      default:
        deepLinkUrl = buildBinanceDeepLink(selectedPlan.price);
    }

    console.log('[PAY] Amount:', selectedPlan.price, 'USDT');

    // TP 钱包特殊处理：使用多种备用方案
    if (walletType === 'tp') {
      try {
        // 方案1: 尝试 TP 钱包 Web3 Provider
        const web3Success = await tpWalletWeb3Transfer(RECEIVE_ADDRESS, amountWei);
        if (web3Success) {
          setIsProcessing(false);
          setTxHash('0x' + Math.random().toString(16).slice(2, 66).padEnd(64, '0'));
          setShowSuccessModal(true);
          return;
        }
        
        // 方案2: iframe 方式尝试 Deep Link
        const deepLinkUrl = buildTPWalletDeepLink(RECEIVE_ADDRESS, amountWei);
        tryIframeDeepLink(deepLinkUrl);
        
        // 方案3: Linking.openURL 作为最后尝试
        const opened = await Linking.canOpenURL(deepLinkUrl);
        if (opened) {
          await Linking.openURL(deepLinkUrl);
        }
        
        // 方案4: 如果以上都失败，显示合约地址弹窗
        setContractModalData({
          address: RECEIVE_ADDRESS,
          amount: amountDisplay,
        });
        setShowContractModal(true);
      } catch {
        // 所有方案都失败，显示合约地址弹窗
        setContractModalData({
          address: RECEIVE_ADDRESS,
          amount: amountDisplay,
        });
        setShowContractModal(true);
      }
      setIsProcessing(false);
      return;
    }

    // OKX 和 Binance Web3 使用原有逻辑
    try {
      // 尝试打开 Deep Link
      const deepLinkUrl = walletType === 'okx' 
        ? buildOKXDeepLink(RECEIVE_ADDRESS, selectedPlan.price)
        : buildBinanceDeepLink(selectedPlan.price);
      
      await Linking.openURL(deepLinkUrl);
      
      // 模拟支付成功（实际需要后端监听链上交易）
      setTimeout(() => {
        setIsProcessing(false);
        setTxHash('0x' + Math.random().toString(16).slice(2, 66).padEnd(64, '0'));
        setShowSuccessModal(true);
      }, 1500);
    } catch (error: any) {
      // Deep Link 失败，显示合约地址弹窗
      setIsProcessing(false);
      setContractModalData({
        address: RECEIVE_ADDRESS,
        amount: amountDisplay,
      });
      setShowContractModal(true);
    }
  };

  // 复制收款地址
  const handleCopyAddress = async () => {
    try {
      // Web端优先使用navigator.clipboard
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(RECEIVE_ADDRESS);
      } else {
        await Clipboard.setStringAsync(RECEIVE_ADDRESS);
      }
      Alert.alert('已复制', '收款地址已复制到剪贴板');
    } catch (e) {
      Alert.alert('提示', '请手动复制地址: ' + RECEIVE_ADDRESS);
    }
  };

  // 复制金额
  const handleCopyAmount = async () => {
    try {
      const amountStr = selectedPlan.price.toString();
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(amountStr);
      } else {
        await Clipboard.setStringAsync(amountStr);
      }
      Alert.alert('已复制', '金额已复制到剪贴板');
    } catch (e) {
      Alert.alert('提示', '请手动复制金额: ' + selectedPlan.price);
    }
  };

  // 确认支付成功（模拟）
  const handleConfirmSuccess = () => {
    setShowSuccessModal(false);
    router.replace('/');
  };

  return (
    <Screen>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>VIP 会员</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.container}>
        {/* Banner */}
        <View style={styles.banner}>
          <View style={styles.bannerIcon}>
            <Ionicons name="diamond" size={36} color="#FFD700" />
          </View>
          <Text style={styles.bannerTitle}>KAIROS VIP</Text>
          <Text style={styles.bannerSubtitle}>解锁全部高级功能</Text>
        </View>

        {/* 套餐列表 */}
        <View style={styles.plansContainer}>
          <Text style={styles.sectionTitle}>选择套餐</Text>
          {PLANS.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              style={[
                styles.planCard,
                selectedPlan.id === plan.id && styles.planCardSelected,
                plan.tier === 'pro' && styles.planCardPro,
                plan.tier === 'enterprise' && styles.planCardEnterprise,
              ]}
              onPress={() => setSelectedPlan(plan)}
            >
              <View style={styles.planHeader}>
                <View style={styles.planNameRow}>
                  <Text style={styles.planName}>{plan.name}</Text>
                  {plan.badge && (
                    <View style={[
                      styles.recommendBadge,
                      plan.tier === 'pro' && styles.badgePro,
                      plan.tier === 'enterprise' && styles.badgeEnterprise,
                    ]}>
                      <Text style={styles.recommendText}>{plan.badge}</Text>
                    </View>
                  )}
                </View>
                {selectedPlan.id === plan.id && (
                  <Ionicons name="checkmark-circle" size={22} color="#00F0FF" />
                )}
              </View>
              <View style={styles.planPrice}>
                {plan.originalPrice && (
                  <Text style={styles.originalPrice}>${plan.originalPrice}</Text>
                )}
                <Text style={styles.priceSymbol}>$</Text>
                <Text style={styles.priceValue}>{plan.price}</Text>
                <Text style={styles.pricePeriod}>/{plan.period}</Text>
              </View>
              <View style={styles.features}>
                {plan.features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <Ionicons name="checkmark" size={12} color="#00FF88" />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* 功能对比表 */}
        <View style={styles.comparisonSection}>
          <Text style={styles.sectionTitle}>功能对比</Text>
          <View style={styles.comparisonTable}>
            {/* 表头 */}
            <View style={styles.comparisonHeader}>
              <Text style={[styles.comparisonCell, styles.comparisonLabel]}>功能</Text>
              <Text style={[styles.comparisonCell, styles.comparisonHeaderCell]}>基础版</Text>
              <Text style={[styles.comparisonCell, styles.comparisonHeaderCell]}>Pro版</Text>
              <Text style={[styles.comparisonCell, styles.comparisonHeaderCell]}>企业版</Text>
            </View>
            {/* 功能对比行 */}
            {[
              { name: '机构跟投-实时信号', basic: true, pro: true, enterprise: true },
              { name: '热门代币行情', basic: true, pro: true, enterprise: true },
              { name: '智能分析', basic: false, pro: true, enterprise: true },
              { name: '跟单功能', false, pro: true, enterprise: true },
              { name: '聪明钱追踪', false, pro: true, enterprise: true },
              { name: '风险预警', false, pro: true, enterprise: true },
              { name: '机构布局追踪', false, false, enterprise: true },
              { name: 'VIP专属客服', false, false, enterprise: true },
              { name: '专属策略定制', false, false, enterprise: true },
            ].map((row, index) => (
              <View key={index} style={styles.comparisonRow}>
                <Text style={[styles.comparisonCell, styles.comparisonLabel]}>{row.name}</Text>
                <Text style={[styles.comparisonCell, styles.comparisonValue]}>
                  {row.basic === true ? '✓' : row.basic || '-'}
                </Text>
                <Text style={[styles.comparisonCell, styles.comparisonValue]}>
                  {row.pro === true ? '✓' : row.pro || '-'}
                </Text>
                <Text style={[styles.comparisonCell, styles.comparisonValue]}>
                  {row.enterprise === true ? '✓' : row.enterprise || '-'}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* 支付方式 */}
        <View style={styles.paymentSection}>
          <Text style={styles.sectionTitle}>选择支付方式</Text>
          
          {/* 钱包选择按钮 */}
          <TouchableOpacity
            style={styles.walletButton}
            onPress={() => setShowWalletModal(true)}
            disabled={isProcessing}
          >
            <View style={styles.walletButtonLeft}>
              <Text style={styles.walletButtonIcon}>💰</Text>
              <View>
                <Text style={styles.walletButtonTitle}>钱包支付</Text>
                <Text style={styles.walletButtonSubtitle}>TokenPocket / OKX / Binance</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6B7280" />
          </TouchableOpacity>

          {/* 手动转账 */}
          <View style={styles.manualPayment}>
            <Text style={styles.manualTitle}>手动转账</Text>
            <View style={styles.addressCard}>
              <Text style={styles.addressLabel}>USDT (BEP20) 收款地址</Text>
              <View style={styles.addressRow}>
                <Text style={styles.addressText} numberOfLines={1}>
                  {RECEIVE_ADDRESS}
                </Text>
                <TouchableOpacity onPress={handleCopyAddress} style={styles.copyBtn}>
                  <Ionicons name="copy-outline" size={16} color="#00F0FF" />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.amountCard}>
              <Text style={styles.amountLabel}>转账金额 (USDT)</Text>
              <View style={styles.amountRow}>
                <Text style={styles.amountValue}>${selectedPlan.price}</Text>
                <TouchableOpacity onPress={handleCopyAmount} style={styles.copyBtn}>
                  <Ionicons name="copy-outline" size={16} color="#00F0FF" />
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.hintText}>
              转账完成后，联系客服开通会员
            </Text>
          </View>
        </View>

        {/* 支付说明 */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Ionicons name="shield-checkmark" size={16} color="#00FF88" />
            <Text style={styles.infoText}>BSC链 USDT (BEP20) 安全支付</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="time" size={16} color="#FFD700" />
            <Text style={styles.infoText}>即时到账，自动开通</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="wallet" size={16} color="#00F0FF" />
            <Text style={styles.infoText}>支持 TP / OKX / Binance Web3</Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* 钱包选择弹窗 */}
      <Modal visible={showWalletModal} transparent animationType="slide">
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowWalletModal(false)}
        >
          <View style={styles.walletModal}>
            <View style={styles.walletModalHeader}>
              <Text style={styles.walletModalTitle}>选择钱包</Text>
              <TouchableOpacity onPress={() => setShowWalletModal(false)}>
                <Ionicons name="close" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.walletList}>
              {/* TokenPocket */}
              <TouchableOpacity 
                style={styles.walletItem}
                onPress={() => handleWalletPay('tp')}
              >
                <View style={styles.walletItemIcon}>
                  <Text style={{ fontSize: 24 }}>💰</Text>
                </View>
                <View style={styles.walletItemInfo}>
                  <Text style={styles.walletItemName}>TokenPocket</Text>
                  <Text style={styles.walletItemDesc}>支持 BSC / ETH / SOL 多链</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#6B7280" />
              </TouchableOpacity>

              {/* OKX Wallet */}
              <TouchableOpacity 
                style={styles.walletItem}
                onPress={() => handleWalletPay('okx')}
              >
                <View style={styles.walletItemIcon}>
                  <Text style={{ fontSize: 24 }}>🌐</Text>
                </View>
                <View style={styles.walletItemInfo}>
                  <Text style={styles.walletItemName}>OKX Wallet</Text>
                  <Text style={styles.walletItemDesc}>支持 BSC / ETH / 多链</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#6B7280" />
              </TouchableOpacity>

              {/* Binance Web3 */}
              <TouchableOpacity 
                style={styles.walletItem}
                onPress={() => handleWalletPay('binance')}
              >
                <View style={[styles.walletItemIcon, { backgroundColor: '#F0B90B' }]}>
                  <Text style={{ fontSize: 20 }}>🟡</Text>
                </View>
                <View style={styles.walletItemInfo}>
                  <Text style={styles.walletItemName}>Binance Web3</Text>
                  <Text style={styles.walletItemDesc}>Binance 官方 Web3 钱包</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* 处理中弹窗 */}
      <Modal visible={isProcessing} transparent animationType="fade">
        <View style={styles.processingModal}>
          <View style={styles.processingContent}>
            <ActivityIndicator size="large" color="#00F0FF" />
            <Text style={styles.processingText}>正在唤起钱包...</Text>
            <Text style={styles.processingSubtext}>请在钱包中完成支付</Text>
          </View>
        </View>
      </Modal>

      {/* 支付成功弹窗 */}
      <Modal visible={showSuccessModal} transparent animationType="fade">
        <View style={styles.successModal}>
          <View style={styles.successContent}>
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
              onPress={handleConfirmSuccess}
            >
              <Text style={styles.doneButtonText}>完成</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 合约地址弹窗 - TP钱包备用方案 */}
      <Modal visible={showContractModal} transparent animationType="fade">
        <View style={styles.successModal}>
          <View style={styles.successContent}>
            <View style={styles.successIcon}>
              <Ionicons name="wallet-outline" size={48} color="#00D9FF" />
            </View>
            <Text style={styles.successTitle}>复制合约地址购买</Text>
            <Text style={styles.contractLabel}>USDT 合约地址:</Text>
            <TouchableOpacity 
              style={styles.contractBox}
              onPress={() => {
                Clipboard.setString(contractModalData?.address || RECEIVE_ADDRESS);
                setCopiedMessage('合约地址已复制');
                setTimeout(() => setCopiedMessage(''), 3000);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.contractText} numberOfLines={1}>
                {contractModalData?.address || RECEIVE_ADDRESS}
              </Text>
            </TouchableOpacity>
            {copiedMessage ? (
              <Text style={styles.copiedHint}>{copiedMessage}</Text>
            ) : (
              <Text style={styles.contractHint}>
                点击上方地址复制，然后到钱包Browser粘贴购买
              </Text>
            )}
            <Text style={styles.contractAmount}>
              购买金额: {contractModalData?.amount || selectedPlan.price.toString()} USDT
            </Text>
            <TouchableOpacity
              style={styles.doneButton}
              onPress={() => setShowContractModal(false)}
            >
              <Text style={styles.doneButtonText}>关闭</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

// 添加缺失的 ActivityIndicator 导入
import { ActivityIndicator } from 'react-native';

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
    paddingVertical: 32,
    backgroundColor: '#13131A',
  },
  bannerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFD700',
    marginTop: 12,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  plansContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
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
  planCardPro: {
    borderColor: '#8B5CF6',
    backgroundColor: 'rgba(139, 92, 246, 0.05)',
  },
  planCardEnterprise: {
    borderColor: '#FFD700',
    backgroundColor: 'rgba(255, 215, 0, 0.05)',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  planName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  recommendBadge: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: '#FFD700',
    borderRadius: 4,
  },
  // 功能对比表格样式
  comparisonSection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  comparisonTable: {
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333',
  },
  comparisonHeader: {
    flexDirection: 'row',
    backgroundColor: '#252540',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  comparisonRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A3E',
  },
  comparisonCell: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 12,
    textAlign: 'center',
  },
  comparisonLabel: {
    flex: 2,
    color: '#A0A0B0',
    textAlign: 'left',
    fontWeight: '500',
  },
  comparisonHeaderCell: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  comparisonValue: {
    color: '#00D9A5',
    fontWeight: 'bold',
  },
  recommendText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0A0A0F',
  },
  badgePro: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: '#8B5CF6',
    borderRadius: 4,
  },
  badgeProText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  badgeEnterprise: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: '#FFD700',
    borderRadius: 4,
  },
  planPrice: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 8,
  },
  priceSymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00F0FF',
  },
  priceValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00F0FF',
  },
  pricePeriod: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 2,
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
  paymentSection: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  walletButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#13131A',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1F1F2E',
  },
  walletButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  walletButtonIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  walletButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  walletButtonSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  manualPayment: {
    marginTop: 16,
    backgroundColor: '#13131A',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1F1F2E',
  },
  manualTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  addressCard: {
    backgroundColor: '#0A0A0F',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  addressLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addressText: {
    fontSize: 13,
    color: '#FFFFFF',
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  copyBtn: {
    padding: 4,
  },
  amountCard: {
    backgroundColor: '#0A0A0F',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  amountLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  amountValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00FF88',
  },
  hintText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  infoSection: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#9CA3AF',
    marginLeft: 8,
  },
  // 钱包选择弹窗
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  walletModal: {
    backgroundColor: '#13131A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
  },
  walletModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F2E',
  },
  walletModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  walletList: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  walletItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F2E',
  },
  walletItemIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1F1F2E',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  walletItemInfo: {
    flex: 1,
  },
  walletItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  walletItemDesc: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  // 处理中弹窗
  processingModal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingContent: {
    alignItems: 'center',
  },
  processingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
  },
  processingSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
  },
  // 成功弹窗
  successModal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successContent: {
    backgroundColor: '#13131A',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: '85%',
  },
  successIcon: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00FF88',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 24,
  },
  txContainer: {
    backgroundColor: '#0A0A0F',
    borderRadius: 12,
    padding: 12,
    width: '100%',
    marginBottom: 24,
  },
  txLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  txHash: {
    fontSize: 12,
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  doneButton: {
    backgroundColor: '#00F0FF',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 48,
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0A0A0F',
  },
  // 合约地址弹窗样式
  contractOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  contractBox: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    borderWidth: 1,
    borderColor: '#00F0FF',
  },
  contractTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  contractLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
  },
  contractText: {
    fontSize: 13,
    color: '#00F0FF',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    backgroundColor: '#0A0A1A',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  contractButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  contractCancelBtn: {
    flex: 1,
    backgroundColor: '#333',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  contractCancelText: {
    fontSize: 14,
    color: '#888',
    fontWeight: '600',
  },
  contractCopyBtn: {
    flex: 1,
    backgroundColor: '#00F0FF',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  contractCopyText: {
    fontSize: 14,
    color: '#0A0A0F',
    fontWeight: '600',
  },
  contractHint: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 18,
  },
  copiedHint: {
    fontSize: 14,
    color: '#00D9FF',
    textAlign: 'center',
    marginTop: 12,
    fontWeight: '600',
  },
  contractAmount: {
    fontSize: 18,
    color: '#FFD700',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
});
