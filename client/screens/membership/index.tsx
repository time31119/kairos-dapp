import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { useSafeRouter } from '@/hooks/useSafeRouter';

// BSC USDT 收款地址
const RECEIVE_ADDRESS = '0x769ecB24694F56d75d6eaaD5F634d99eF12c407d';
// BSC USDT 合约地址 (BEP20)
const USDT_CONTRACT = '0x55d398326f99059fF775485246999027B3197955';

// VIP 套餐 - 三版本：白银、黄金、钻石
const PLANS = [
  {
    id: 'silver',
    name: '白银版',
    tier: 'silver',
    badge: '基础版',
    recommended: false,
    monthlyPrice: 99,
    features: [
      { name: '机构跟投-实时信号', desc: '追踪专业机构最新建仓动向' },
      { name: '热门代币行情', desc: '实时查看主流币种价格走势' },
      { name: '基础智能分析', desc: 'AI驱动的市场趋势分析' },
      { name: '代币详情查看', desc: '深度了解代币基本面数据' },
    ],
  },
  {
    id: 'gold',
    name: '黄金版',
    tier: 'gold',
    badge: 'PRO推荐',
    recommended: true,
    monthlyPrice: 199,
    features: [
      { name: '机构跟投-实时信号', desc: '追踪专业机构最新建仓动向' },
      { name: '热门代币行情', desc: '实时查看主流币种价格走势' },
      { name: '高级智能分析', desc: '深度AI模型，多维度市场预测' },
      { name: '一键跟单功能', desc: '自动跟随优质交易员操作' },
      { name: '聪明钱追踪', desc: '发现聪明钱流向，抢先布局' },
      { name: '风险预警', desc: '实时监控异常波动，及时提醒' },
    ],
  },
  {
    id: 'diamond',
    name: '钻石版',
    tier: 'diamond',
    badge: '企业级',
    recommended: false,
    monthlyPrice: 299,
    features: [
      { name: '机构跟投-实时+机构', desc: '机构实时信号+机构持仓分析' },
      { name: '热门代币行情', desc: '实时查看主流币种价格走势' },
      { name: '高级智能分析', desc: '深度AI模型，多维度市场预测' },
      { name: '一键跟单功能', desc: '自动跟随优质交易员操作' },
      { name: '聪明钱追踪', desc: '发现聪明钱流向，抢先布局' },
      { name: '风险预警', desc: '实时监控异常波动，及时提醒' },
      { name: '机构布局追踪', desc: '深度追踪大机构完整布局' },
      { name: 'VIP专属客服', desc: '7x24小时一对一专属服务' },
    ],
  },
];

// 用户评价数据
const TESTIMONIALS = [
  { name: '王先生', role: '合约交易者', text: '跟单功能太好用了，每月稳定收益提升30%', avatar: '👨' },
  { name: '李女士', role: '现货投资者', text: '机构信号准确率很高，帮助我抓住了几次大行情', avatar: '👩' },
  { name: '张先生', role: '机构分析师', text: '智能分析功能帮我节省了大量研究时间', avatar: '🧑‍💼' },
];

// 统计数据
const STATS = [
  { value: '50,000+', label: '活跃用户' },
  { value: '92%', label: '信号准确率' },
  { value: '365天', label: '稳定运行' },
];

// 钱包类型
type WalletType = 'tp' | 'okx' | 'binance';

// 钱包信息
const WALLETS: { id: WalletType; name: string; icon: string; deeplink: string }[] = [
  { id: 'tp', name: 'TokenPocket', icon: '💰', deeplink: 'tokenpocket://' },
  { id: 'okx', name: 'OKX Wallet', icon: '🌐', deeplink: 'okx://' },
  { id: 'binance', name: 'Binance Web3', icon: '🟡', deeplink: 'bnbwallet://' },
];

// 计算USDT金额
function calculateAmount(amount: number): string {
  const weiAmount = BigInt(Math.round(amount * 1e18));
  return weiAmount.toString();
}

// 构建TP Wallet DeepLink
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

// 构建OKX Wallet DeepLink - BSC链USDT转账
function buildOKXDeepLink(toAddress: string, amount: number): string {
  const params = new URLSearchParams({
    to: toAddress,
    value: amount.toString(),
    token: USDT_CONTRACT,
    chainId: '56', // BSC chainId
  });
  return `okxwallet://wallet/send?${params.toString()}`;
}

// OKX Wallet Web3转账
async function okxWalletWeb3Transfer(toAddress: string, amountWei: string): Promise<boolean> {
  try {
    if (typeof window === 'undefined' || !(window as any).okxwallet) {
      return false;
    }
    const accounts = await (window as any).okxwallet.request({ method: 'eth_requestAccounts' });
    if (!accounts || accounts.length === 0) return false;
    
    const txHash = await (window as any).okxwallet.request({
      method: 'eth_sendTransaction',
      params: [{
        from: accounts[0],
        to: USDT_CONTRACT,
        value: '0x0',
        data: buildUSDTTransferData(toAddress, amountWei),
        gas: '0x50000',
      }],
    });
    console.log('[OKX] Transaction sent:', txHash);
    return true;
  } catch (error) {
    console.log('[OKX] Web3 transfer failed:', error);
    return false;
  }
}

// Binance Web3 转账
async function handleBinanceWeb3(toAddress: string, amount: string, amountWei: string): Promise<boolean> {
  try {
    if (typeof window === 'undefined' || !(window as any).BinanceChain) {
      return false;
    }
    const accounts = await (window as any).BinanceChain.request({ method: 'eth_requestAccounts' });
    if (!accounts || accounts.length === 0) return false;
    
    const txHash = await (window as any).BinanceChain.request({
      method: 'eth_sendTransaction',
      params: [{
        from: accounts[0],
        to: USDT_CONTRACT,
        value: '0x0',
        data: buildUSDTTransferData(toAddress, amountWei),
        gas: '0x50000',
      }],
    });
    console.log('[Binance] Transaction sent:', txHash);
    return true;
  } catch (error) {
    console.log('[Binance] Web3 transfer failed:', error);
    return false;
  }
}

// 构建Binance Web3 DeepLink (USDT转账)
function buildBinanceDeepLink(toAddress: string, amount: string): string {
  // Binance Web3 钱包 USDT 转账 DeepLink
  return `bnbswapwallet://wallet/send?address=${toAddress}&asset=USDT&amount=${amount}&chain=BSC`;
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

// TP 钱包 Web3 Provider 转账
async function tpWalletWeb3Transfer(toAddress: string, amount: string): Promise<boolean> {
  try {
    const tpProvider = (window as any).ethereum;
    if (!tpProvider || tpProvider.isTokenPocket !== true) {
      return false;
    }
    const accounts = await tpProvider.request({ method: 'eth_requestAccounts' });
    if (!accounts || accounts.length === 0) return false;
    const txHash = await tpProvider.request({
      method: 'eth_sendTransaction',
      params: [{
        from: accounts[0],
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

export default function MembershipScreen() {
  const router = useSafeRouter();
  const [selectedPlan, setSelectedPlan] = useState<typeof PLANS[0] | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [showWalletList, setShowWalletList] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [copied, setCopied] = useState(false);

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'silver': return '#9CA3AF';
      case 'gold': return '#F59E0B';
      case 'diamond': return '#06B6D4';
      default: return '#9CA3AF';
    }
  };

  const handleSelectPlan = (plan: typeof PLANS[0]) => {
    setSelectedPlan(plan);
    setModalVisible(true);
  };

  // 初始化邀请码
  useEffect(() => {
    // 优先从 localStorage 获取已保存的邀请码
    if (typeof window !== 'undefined') {
      // 获取用户标识符（优先使用钱包地址，否则使用已保存的邀请码）
      const walletAddress = localStorage.getItem('wallet_address') || '';
      const savedCode = localStorage.getItem('invite_code');
      
      // 优先使用钱包地址生成固定邀请码
      if (walletAddress) {
        const code = generateFixedInviteCode(walletAddress);
        setInviteCode(code);
        localStorage.setItem('invite_code', code);
      } else if (savedCode) {
        // 使用已保存的邀请码
        setInviteCode(savedCode);
      } else {
        // 生成新的邀请码（首次访问）
        const newCode = generateFixedInviteCode(Date.now().toString());
        setInviteCode(newCode);
        localStorage.setItem('invite_code', newCode);
      }
    }
  }, []);

  // 生成固定邀请码（基于用户标识符，确保每次相同）
  function generateFixedInviteCode(identifier: string): string {
    // 使用用户标识符生成固定的邀请码
    let hash = 0;
    for (let i = 0; i < identifier.length; i++) {
      const char = identifier.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'KAI-';
    // 使用hash值确保同一用户生成相同邀请码
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.abs(hash) % chars.length);
      hash = ((hash << 5) - hash) + i;
    }
    return code;
  }

  // 复制邀请码和链接
  const handleCopyInviteCode = async () => {
    const link = `https://kairosdapp.com/membership?invite=${inviteCode}`;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(link);
      } else {
        // 降级方案
        const textarea = document.createElement('textarea');
        textarea.value = link;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.log('Copy failed:', error);
    }
  };

  const inviteLink = inviteCode ? `https://kairosdapp.com/membership?invite=${inviteCode}` : '';

  const API_BASE = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9091';

  const handlePayment = async (wallet: typeof WALLETS[0]) => {
    if (!selectedPlan) return;
    
    const price = selectedPlan.monthlyPrice;
    const amountWei = calculateAmount(price);
    const localOrderId = `ORD-${Date.now()}`;
    
    // 创建订单
    try {
      const orderResponse = await fetch(`${API_BASE}/api/v1/subscription/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier: selectedPlan.tier,
          walletAddress: walletAddress,
          amount: price,
        }),
      });
      
      const orderResult = await orderResponse.json();
      
      if (orderResult.success && orderResult.data?.orderId) {
        // 使用服务端返回的订单ID
      }
    } catch (error) {
      console.log('订单创建请求失败，使用本地订单ID');
    }
    
    // 处理各钱包支付
    let deepLink = '';
    
    // 优先尝试Web3转账（Web端）
    let web3Success = false;
    if (Platform.OS === 'web') {
      if (wallet.id === 'tp' && (window as any).ethereum) {
        web3Success = await tpWalletWeb3Transfer(RECEIVE_ADDRESS, amountWei);
      } else if (wallet.id === 'okx' && (window as any).okxwallet) {
        web3Success = await okxWalletWeb3Transfer(RECEIVE_ADDRESS, amountWei);
      } else if (wallet.id === 'binance' && (window as any).BinanceChain) {
        web3Success = await handleBinanceWeb3(RECEIVE_ADDRESS, price, amountWei);
      }
      
      if (web3Success) {
        Alert.alert('交易已发送', '请在钱包中确认交易，转账完成后系统将自动开通VIP。', [
          { text: '查看支付状态', onPress: () => router.push(`/payment-confirm?orderId=${localOrderId}&walletAddress=${RECEIVE_ADDRESS}&amount=${price}&tier=${selectedPlan.name}`) },
        ]);
        setModalVisible(false);
        return;
      }
    }
    
    // Web3失败或非Web端，使用DeepLink唤起钱包
    switch (wallet.id) {
      case 'tp':
        deepLink = buildTPWalletDeepLink(RECEIVE_ADDRESS, amountWei);
        break;
      case 'okx':
        deepLink = buildOKXDeepLink(RECEIVE_ADDRESS, price);
        break;
      case 'binance':
        deepLink = buildBinanceDeepLink(RECEIVE_ADDRESS, price);
        break;
    }
    
    if (deepLink) {
      tryIframeDeepLink(deepLink);
    }
    
    Alert.alert(
      '订单已创建',
      `请向以下地址转账 ${price} USDT (BEP20)\n\n${RECEIVE_ADDRESS}\n\n转账完成后，系统将自动开通VIP权限。`,
      [
        { text: '查看支付状态', onPress: () => router.push(`/payment-confirm?orderId=${localOrderId}&walletAddress=${RECEIVE_ADDRESS}&amount=${price}&tier=${selectedPlan.name}`) },
        { text: '复制地址', onPress: () => {
          try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
              navigator.clipboard.writeText(RECEIVE_ADDRESS);
            } else {
              const textarea = document.createElement('textarea');
              textarea.value = RECEIVE_ADDRESS;
              textarea.style.position = 'fixed';
              textarea.style.opacity = '0';
              document.body.appendChild(textarea);
              textarea.select();
              document.execCommand('copy');
              document.body.removeChild(textarea);
            }
            Alert.alert('复制成功', '收款地址已复制到剪贴板');
          } catch (error) {
            console.log('Copy failed:', error);
            Alert.alert('复制失败', '请手动复制地址: ' + RECEIVE_ADDRESS);
          }
        }},
      ]
    );
    
    setShowWalletList(false);
  };

  return (
    <Screen style={{ backgroundColor: '#111827' }}>
      {/* 顶部导航 */}
      <View className="flex-row items-center px-4 py-4" style={{ backgroundColor: '#1F2937' }}>
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <Ionicons name="chevron-back" size={26} color="#F9FAFB" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-white flex-1 text-center pr-10">会员订阅</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} style={{ backgroundColor: '#111827' }}>
        {/* 头部信息 */}
        <View className="px-5 pt-6 pb-5">
          <View className="items-center mb-4">
            <View className="w-20 h-20 rounded-full items-center justify-center mb-4" style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)' }}>
              <Ionicons name="diamond" size={40} color="#F59E0B" />
            </View>
            <Text className="text-2xl font-bold text-white">开通VIP会员</Text>
            <Text className="text-base text-gray-400 mt-2">尊享专属特权，抢占市场先机</Text>
          </View>
          
          {/* 统计数据 */}
          <View className="flex-row justify-around mt-6 py-5 px-3 rounded-2xl" style={{ backgroundColor: '#1F2937' }}>
            {STATS.map((stat, index) => (
              <View key={index} className="items-center">
                <Text className="text-xl font-bold" style={{ color: '#F59E0B' }}>{stat.value}</Text>
                <Text className="text-sm text-gray-400 mt-1">{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 套餐列表标题 */}
        <View className="px-5 pb-3">
          <Text className="text-lg font-bold text-white">选择套餐</Text>
          <Text className="text-sm text-gray-500 mt-1">解锁更多高级功能</Text>
        </View>

        {/* 套餐列表 */}
        <View className="px-5 pb-5">
          {PLANS.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              className="rounded-2xl p-5 mb-4 border-2"
              style={{ 
                backgroundColor: '#1F2937',
                borderColor: selectedPlan?.id === plan.id ? getTierColor(plan.tier) : '#374151',
                borderWidth: selectedPlan?.id === plan.id ? 2 : 1,
              }}
              onPress={() => handleSelectPlan(plan)}
            >
              {/* 推荐标签 */}
              {plan.recommended && (
                <View className="absolute -top-3 left-4 px-3 py-1 rounded-full" style={{ backgroundColor: '#F59E0B' }}>
                  <Text className="text-xs font-bold text-black">⭐ 推荐</Text>
                </View>
              )}
              
              {/* 套餐头部 */}
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center">
                  <Text className="text-xl font-bold" style={{ color: getTierColor(plan.tier) }}>
                    {plan.name}
                  </Text>
                  <View 
                    className="ml-3 px-3 py-1 rounded-full"
                    style={{ backgroundColor: `${getTierColor(plan.tier)}20` }}
                  >
                    <Text className="text-sm font-medium" style={{ color: getTierColor(plan.tier) }}>
                      {plan.badge}
                    </Text>
                  </View>
                </View>
                <View className="flex-row items-baseline">
                  <Text className="text-3xl font-bold text-white">${plan.monthlyPrice}</Text>
                  <Text className="text-base text-gray-400 ml-1">/月</Text>
                </View>
              </View>
              
              {/* 分隔线 */}
              <View className="h-px mb-4" style={{ backgroundColor: '#374151' }} />
              
              {/* 功能列表 */}
              <View className="space-y-3">
                {plan.features.map((feature, index) => (
                  <View key={index} className="flex-row items-start">
                    <View className="w-6 h-6 rounded-full items-center justify-center mt-0.5" style={{ backgroundColor: `${getTierColor(plan.tier)}20` }}>
                      <Ionicons name="checkmark" size={14} color={getTierColor(plan.tier)} />
                    </View>
                    <View className="ml-3 flex-1">
                      <Text className="text-base font-medium text-gray-100">{feature.name}</Text>
                      <Text className="text-sm text-gray-500 mt-0.5">{feature.desc}</Text>
                    </View>
                  </View>
                ))}
              </View>
              
              {/* 选择按钮 */}
              <TouchableOpacity
                className="mt-5 rounded-xl py-4 items-center"
                style={{ backgroundColor: getTierColor(plan.tier) }}
                onPress={() => handleSelectPlan(plan)}
              >
                <Text className="text-base font-bold text-black">立即开通</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>

        {/* 邀请奖励 */}
        <View className="px-5 pb-5">
          <Text className="text-lg font-bold text-white mb-4">邀请奖励</Text>
          <View className="p-5 rounded-2xl border" style={{ backgroundColor: '#1F2937', borderColor: '#374151' }}>
            <View className="flex-row items-center mb-4">
              <View className="w-12 h-12 rounded-full items-center justify-center mr-4" style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)' }}>
                <Ionicons name="gift" size={24} color="#F59E0B" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-white">邀请好友获得奖励</Text>
                <Text className="text-sm text-gray-400">每成功邀请一位，最高获得25%返佣</Text>
              </View>
            </View>
            
            {/* 奖励规则 */}
            <View className="space-y-3 mb-5">
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-full items-center justify-center mr-3" style={{ backgroundColor: '#374151' }}>
                  <Text className="text-sm font-bold text-white">1</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-sm text-gray-300">白银版返佣</Text>
                  <Text className="text-base font-bold text-white">$15/人</Text>
                </View>
              </View>
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-full items-center justify-center mr-3" style={{ backgroundColor: '#374151' }}>
                  <Text className="text-sm font-bold text-white">2</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-sm text-gray-300">黄金版返佣</Text>
                  <Text className="text-base font-bold text-yellow-500">$30/人</Text>
                </View>
              </View>
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-full items-center justify-center mr-3" style={{ backgroundColor: '#374151' }}>
                  <Text className="text-sm font-bold text-white">3</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-sm text-gray-300">钻石版返佣</Text>
                  <Text className="text-base font-bold text-cyan-400">$50/人</Text>
                </View>
              </View>
            </View>
            
            {/* 我的邀请码 */}
            <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: '#111827' }}>
              <Text className="text-sm text-gray-400 mb-2">我的邀请码</Text>
              <View className="flex-row items-center justify-between">
                <Text className="text-xl font-bold text-white tracking-widest" id="inviteCodeDisplay">
                  {inviteCode || '加载中...'}
                </Text>
                <TouchableOpacity
                  className="px-4 py-2 rounded-lg"
                  style={{ backgroundColor: '#F59E0B' }}
                  onPress={handleCopyInviteCode}
                >
                  <Text className="text-sm font-medium text-black">
                    {copied ? '已复制' : '复制'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {/* 邀请链接 */}
            <View className="p-4 rounded-xl" style={{ backgroundColor: '#111827' }}>
              <Text className="text-sm text-gray-400 mb-2">邀请链接</Text>
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-gray-300 flex-1" numberOfLines={1}>
                  {inviteLink || 'kairosdapp.com/membership?invite=...'}
                </Text>
                <TouchableOpacity
                  className="px-4 py-2 rounded-lg ml-3"
                  style={{ backgroundColor: '#06B6D4' }}
                  onPress={handleCopyInviteCode}
                >
                  <Text className="text-sm font-medium text-black">分享</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* 用户评价 */}
        <View className="px-5 pb-5">
          <Text className="text-lg font-bold text-white mb-4">用户真实评价</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-5 px-5">
            {TESTIMONIALS.map((item, index) => (
              <View
                key={index}
                className="w-72 mr-3 p-5 rounded-2xl border"
                style={{ backgroundColor: '#1F2937', borderColor: '#374151' }}
              >
                <View className="flex-row items-center mb-3">
                  <Text className="text-3xl mr-3">{item.avatar}</Text>
                  <View>
                    <Text className="text-base font-semibold text-gray-100">{item.name}</Text>
                    <Text className="text-sm text-gray-500">{item.role}</Text>
                  </View>
                </View>
                <Text className="text-base text-gray-300 leading-6">"{item.text}"</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* 信任保障 */}
        <View className="px-5 pb-6">
          <View className="p-5 rounded-2xl border" style={{ backgroundColor: '#1F2937', borderColor: '#374151' }}>
            <View className="flex-row items-center mb-4">
              <View className="w-10 h-10 rounded-full items-center justify-center" style={{ backgroundColor: 'rgba(6, 182, 212, 0.15)' }}>
                <Ionicons name="shield-checkmark" size={22} color="#06B6D4" />
              </View>
              <Text className="text-lg font-bold text-white ml-3">信任保障</Text>
            </View>
            <View className="space-y-3">
              <View className="flex-row items-center">
                <Ionicons name="checkmark-circle" size={18} color="#06B6D4" />
                <Text className="text-base text-gray-300 ml-3">7天无理由退款</Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="checkmark-circle" size={18} color="#06B6D4" />
                <Text className="text-base text-gray-300 ml-3">支付安全 (USDT链上转账)</Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="checkmark-circle" size={18} color="#06B6D4" />
                <Text className="text-base text-gray-300 ml-3">24小时自动到账</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 底部说明 */}
        <View className="px-5 pb-10">
          <Text className="text-sm text-gray-500 text-center">
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
        <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <View className="rounded-t-3xl p-6" style={{ backgroundColor: '#1F2937' }}>
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-bold text-white">选择支付钱包</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close-circle" size={30} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            {selectedPlan && (
              <View className="mb-5 p-4 rounded-xl" style={{ backgroundColor: '#111827' }}>
                <Text className="text-sm text-gray-400 mb-2">订单详情</Text>
                <View className="flex-row justify-between items-center mt-2">
                  <View className="flex-row items-center">
                    <View className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: getTierColor(selectedPlan.tier) }} />
                    <Text className="text-lg font-semibold text-white">{selectedPlan.name}</Text>
                  </View>
                  <Text className="text-xl font-bold" style={{ color: getTierColor(selectedPlan.tier) }}>
                    ${selectedPlan.monthlyPrice}/月
                  </Text>
                </View>
              </View>
            )}
            
            <View className="mb-5">
              <Text className="text-base font-medium text-gray-400 mb-3">推荐方式</Text>
              
              {/* USDT转账 */}
              <TouchableOpacity
                className="flex-row items-center p-4 rounded-xl mb-3 border"
                style={{ backgroundColor: '#111827', borderColor: '#374151' }}
                onPress={() => setShowWalletList(true)}
              >
                <View className="w-12 h-12 rounded-full items-center justify-center" style={{ backgroundColor: '#059669' }}>
                  <Text className="text-white font-bold text-lg">₮</Text>
                </View>
                <View className="ml-4 flex-1">
                  <Text className="text-lg font-medium text-white">USDT 转账支付</Text>
                  <Text className="text-sm text-gray-500">使用TRC20/ERC20转账</Text>
                </View>
                <Ionicons name="chevron-forward" size={22} color="#6B7280" />
              </TouchableOpacity>
              
              {/* 钱包选项 */}
              {WALLETS.map((wallet) => (
                <TouchableOpacity
                  key={wallet.id}
                  className="flex-row items-center p-4 rounded-xl mb-2 border"
                  style={{ backgroundColor: '#111827', borderColor: '#374151' }}
                  onPress={() => handlePayment(wallet)}
                >
                  <Text className="text-3xl mr-4">{wallet.icon}</Text>
                  <View className="flex-1">
                    <Text className="text-lg font-medium text-white">{wallet.name}</Text>
                    <Text className="text-sm text-gray-500">点击唤起钱包支付</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
            
            <TouchableOpacity
              className="py-4 rounded-xl items-center"
              style={{ backgroundColor: '#374151' }}
              onPress={() => setModalVisible(false)}
            >
              <Text className="text-base text-gray-300">取消</Text>
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
        <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <View className="rounded-t-3xl p-6" style={{ backgroundColor: '#1F2937' }}>
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-bold text-white">USDT 收款地址</Text>
              <TouchableOpacity onPress={() => setShowWalletList(false)}>
                <Ionicons name="close-circle" size={30} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: '#111827' }}>
              <Text className="text-sm text-gray-400 mb-2">收款地址 (BSC)</Text>
              <Text className="text-sm text-gray-200 break-all font-mono leading-relaxed">{RECEIVE_ADDRESS}</Text>
            </View>
            
            {selectedPlan && (
              <View className="p-4 rounded-xl mb-5" style={{ backgroundColor: '#111827' }}>
                <Text className="text-sm text-gray-400 mb-1">支付金额</Text>
                <Text className="text-3xl font-bold text-white">{selectedPlan.monthlyPrice} USDT</Text>
                <Text className="text-sm text-gray-500 mt-1">按月计费</Text>
              </View>
            )}
            
            <TouchableOpacity
              className="py-4 rounded-xl items-center mb-3"
              style={{ backgroundColor: '#059669' }}
              onPress={async () => {
                try {
                  if (navigator.clipboard && navigator.clipboard.writeText) {
                    await navigator.clipboard.writeText(RECEIVE_ADDRESS);
                  } else {
                    const textarea = document.createElement('textarea');
                    textarea.value = RECEIVE_ADDRESS;
                    textarea.style.position = 'fixed';
                    textarea.style.opacity = '0';
                    document.body.appendChild(textarea);
                    textarea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textarea);
                  }
                  Alert.alert('复制成功', '收款地址已复制到剪贴板');
                } catch (error) {
                  console.log('Copy failed:', error);
                  Alert.alert('复制失败', '请手动复制地址: ' + RECEIVE_ADDRESS);
                }
              }}
            >
              <Text className="text-lg font-bold text-white">复制收款地址</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              className="py-4 rounded-xl items-center"
              style={{ backgroundColor: '#374151' }}
              onPress={() => setShowWalletList(false)}
            >
              <Text className="text-base text-gray-300">取消</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}
