import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { router } from 'expo-router';
import { useSafeRouter } from '@/hooks/useSafeRouter';

// BSC USDT 收款地址
const RECEIVE_ADDRESS = '0x769ecB24694F56d75d6eaaD5F634d99eF12c407d';
// BSC USDT 合约地址 (BEP20)
const USDT_CONTRACT = '0x55d398326f99059fF775485246999027B3197955';

// VIP 套餐 - 三版本：白银、黄金、钻石
// 价格：99/199/299，仅月付
const PLANS = [
  // 白银版
  { id: 'silver_monthly', name: '白银版', price: 99, period: '月', tier: 'silver', badge: '基础', features: ['机构跟投-实时信号', '热门代币行情', '基础智能分析', '代币详情查看'] },
  // 黄金版
  { id: 'gold_monthly', name: '黄金版', price: 199, period: '月', tier: 'gold', badge: 'PRO', features: ['机构跟投-实时信号', '热门代币行情', '高级智能分析', '跟单功能', '聪明钱追踪', '风险预警'] },
  // 钻石版
  { id: 'diamond_monthly', name: '钻石版', price: 299, period: '月', tier: 'diamond', badge: 'ENTERPRISE', features: ['机构跟投-实时+机构', '热门代币行情', '高级智能分析', '跟单功能', '聪明钱追踪', '风险预警', '机构布局追踪', 'VIP专属客服'] },
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
        to: USDT_CONTRACT,
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

// 构建 USDT 转账数据
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
    if (Platform.OS === 'web') {
      if (walletType === 'tp') {
        return !!(window as any).ethereum?.isTokenPocket;
      }
      const response = await fetch(schemes[walletType]);
      return response.type === 'opaque';
    }
    return false;
  } catch {
    return false;
  }
}

export default function MembershipScreen() {
  const router = useSafeRouter();
  const [selectedPlan, setSelectedPlan] = useState<typeof PLANS[0] | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [showWalletList, setShowWalletList] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');

  const handleSelectPlan = (plan: typeof PLANS[0]) => {
    setSelectedPlan(plan);
    setModalVisible(true);
  };

  const handlePayment = async (wallet: typeof WALLETS[0]) => {
    if (!selectedPlan) return;
    
    const amountWei = calculateAmount(selectedPlan.price);
    
    // 尝试 Web3 转账
    if (wallet.id === 'tp' && Platform.OS === 'web') {
      const success = await tpWalletWeb3Transfer(RECEIVE_ADDRESS, amountWei);
      if (success) {
        Alert.alert('支付成功', '您的VIP订阅已开通，请等待确认。');
        setModalVisible(false);
        setShowWalletList(false);
        return;
      }
    }
    
    // Deep Link 方式
    let deepLink = '';
    switch (wallet.id) {
      case 'tp':
        deepLink = buildTPWalletDeepLink(RECEIVE_ADDRESS, amountWei);
        break;
      case 'okx':
        deepLink = buildOKXDeepLink(RECEIVE_ADDRESS, selectedPlan.price);
        break;
      case 'binance':
        deepLink = buildBinanceDeepLink(selectedPlan.price);
        break;
    }
    
    tryIframeDeepLink(deepLink);
    
    Alert.alert(
      '订单已创建',
      `请向以下地址转账 ${selectedPlan.price} USDT (BEP20)\n\n${RECEIVE_ADDRESS}\n\n转账完成后，系统将自动开通VIP权限。`,
      [
        { text: '取消', style: 'cancel' },
        { 
          text: '复制地址', 
          onPress: async () => {
            await navigator.clipboard.writeText(RECEIVE_ADDRESS);
            Alert.alert('已复制', '收款地址已复制到剪贴板');
          }
        }
      ]
    );
    
    setShowWalletList(false);
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'silver': return '#C0C0C0';
      case 'gold': return '#FFD700';
      case 'diamond': return '#00D4FF';
      default: return '#888';
    }
  };

  return (
    <Screen>
      {/* 顶部导航 */}
      <View className="flex-row items-center px-4 py-3 border-b border-gray-800">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-white flex-1 text-center pr-8">会员订阅</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* 头部信息 */}
        <View className="px-4 pt-6 pb-4">
          <View className="items-center mb-2">
            <View className="w-16 h-16 rounded-full items-center justify-center mb-3" style={{ backgroundColor: 'rgba(255, 215, 0, 0.1)' }}>
              <Ionicons name="diamond" size={32} color="#FFD700" />
            </View>
            <Text className="text-xl font-bold text-white">开通VIP会员</Text>
            <Text className="text-sm text-gray-400 mt-1">尊享专属特权，抢占市场先机</Text>
          </View>
        </View>

        {/* 套餐列表 */}
        <View className="px-4 pb-6">
          {PLANS.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              className="rounded-2xl p-4 mb-3 border"
              style={{ 
                backgroundColor: '#0A0A0F',
                borderColor: selectedPlan?.id === plan.id ? getTierColor(plan.tier) : '#1F1F1F',
                borderWidth: selectedPlan?.id === plan.id ? 2 : 1,
              }}
              onPress={() => handleSelectPlan(plan)}
            >
              {/* 套餐头部 */}
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center">
                  <Text className="text-lg font-bold" style={{ color: getTierColor(plan.tier) }}>
                    {plan.name}
                  </Text>
                  <View 
                    className="ml-2 px-2 py-0.5 rounded"
                    style={{ backgroundColor: `${getTierColor(plan.tier)}20` }}
                  >
                    <Text className="text-xs font-medium" style={{ color: getTierColor(plan.tier) }}>
                      {plan.badge}
                    </Text>
                  </View>
                </View>
                <View className="flex-row items-baseline">
                  <Text className="text-2xl font-bold text-white">${plan.price}</Text>
                  <Text className="text-sm text-gray-400 ml-1">/{plan.period}</Text>
                </View>
              </View>
              
              {/* 功能列表 */}
              <View className="flex-row flex-wrap">
                {plan.features.map((feature, index) => (
                  <View key={index} className="flex-row items-center mr-4 mb-1">
                    <Ionicons name="checkmark-circle" size={14} color={getTierColor(plan.tier)} />
                    <Text className="text-xs text-gray-300 ml-1">{feature}</Text>
                  </View>
                ))}
              </View>
              
              {/* 选择按钮 */}
              <TouchableOpacity
                className="mt-3 rounded-xl py-3 items-center"
                style={{ backgroundColor: getTierColor(plan.tier) }}
                onPress={() => handleSelectPlan(plan)}
              >
                <Text className="text-sm font-semibold text-black">立即开通</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>

        {/* 底部说明 */}
        <View className="px-4 pb-8">
          <Text className="text-xs text-gray-500 text-center">
            支付问题请联系客服 · 订阅费用以USDT结算
          </Text>
        </View>
      </ScrollView>

      {/* 钱包选择弹窗 */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/70">
          <View className="rounded-t-3xl p-6" style={{ backgroundColor: '#0A0A0F' }}>
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-lg font-bold text-white">选择支付钱包</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close-circle" size={28} color="#666" />
              </TouchableOpacity>
            </View>
            
            {selectedPlan && (
              <View className="mb-4 p-3 rounded-xl" style={{ backgroundColor: '#1A1A1A' }}>
                <Text className="text-sm text-gray-400">订单详情</Text>
                <View className="flex-row justify-between items-center mt-2">
                  <Text className="text-white font-medium">{selectedPlan.name}</Text>
                  <Text className="text-lg font-bold" style={{ color: getTierColor(selectedPlan.tier) }}>
                    ${selectedPlan.price}/{selectedPlan.period}
                  </Text>
                </View>
              </View>
            )}
            
            <View className="mb-4">
              <Text className="text-sm text-gray-400 mb-3">推荐方式</Text>
              
              {/* USDT转账 */}
              <TouchableOpacity
                className="flex-row items-center p-4 rounded-xl mb-3 border"
                style={{ backgroundColor: '#1A1A1A', borderColor: '#2A2A2A' }}
                onPress={() => setShowWalletList(true)}
              >
                <View className="w-10 h-10 rounded-full items-center justify-center" style={{ backgroundColor: '#0D9F6E' }}>
                  <Text className="text-white font-bold text-sm">₮</Text>
                </View>
                <View className="ml-3 flex-1">
                  <Text className="text-white font-medium">USDT 转账支付</Text>
                  <Text className="text-xs text-gray-400">使用TRC20/ERC20转账</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </TouchableOpacity>
              
              {/* 钱包选项 */}
              {WALLETS.map((wallet) => (
                <TouchableOpacity
                  key={wallet.id}
                  className="flex-row items-center p-4 rounded-xl mb-2 border"
                  style={{ backgroundColor: '#1A1A1A', borderColor: '#2A2A2A' }}
                  onPress={() => handlePayment(wallet)}
                >
                  <Text className="text-2xl">{wallet.icon}</Text>
                  <View className="ml-3 flex-1">
                    <Text className="text-white font-medium">{wallet.name}</Text>
                    <Text className="text-xs text-gray-400">点击唤起钱包支付</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
            
            <TouchableOpacity
              className="py-4 rounded-xl items-center"
              style={{ backgroundColor: '#1A1A1A' }}
              onPress={() => setModalVisible(false)}
            >
              <Text className="text-gray-400">取消</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* USDT钱包地址弹窗 */}
      <Modal
        visible={showWalletList}
        transparent
        animationType="slide"
        onRequestClose={() => setShowWalletList(false)}
      >
        <View className="flex-1 justify-end bg-black/70">
          <View className="rounded-t-3xl p-6" style={{ backgroundColor: '#0A0A0F' }}>
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-lg font-bold text-white">USDT 收款地址</Text>
              <TouchableOpacity onPress={() => setShowWalletList(false)}>
                <Ionicons name="close-circle" size={28} color="#666" />
              </TouchableOpacity>
            </View>
            
            <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: '#1A1A1A' }}>
              <Text className="text-xs text-gray-400 mb-2">收款地址 (BSC)</Text>
              <Text className="text-sm text-white break-all font-mono">{RECEIVE_ADDRESS}</Text>
            </View>
            
            {selectedPlan && (
              <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: '#1A1A1A' }}>
                <Text className="text-xs text-gray-400 mb-1">支付金额</Text>
                <Text className="text-2xl font-bold text-white">{selectedPlan.price} USDT</Text>
              </View>
            )}
            
            <TouchableOpacity
              className="py-4 rounded-xl items-center mb-3"
              style={{ backgroundColor: '#0D9F6E' }}
              onPress={async () => {
                await navigator.clipboard.writeText(RECEIVE_ADDRESS);
                Alert.alert('已复制', '收款地址已复制到剪贴板');
              }}
            >
              <Text className="text-white font-semibold">复制收款地址</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              className="py-4 rounded-xl items-center"
              style={{ backgroundColor: '#1A1A1A' }}
              onPress={() => setShowWalletList(false)}
            >
              <Text className="text-gray-400">取消</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}
