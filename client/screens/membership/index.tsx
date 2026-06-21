import React, { useState } from 'react';
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
    yearlyPrice: 990,
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
    yearlyPrice: 1990,
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
    yearlyPrice: 2990,
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

// 构建OKX Wallet DeepLink
function buildOKXDeepLink(toAddress: string, amount: number): string {
  const amountWei = calculateAmount(amount);
  return `okx://wallet/inscribe?address=${toAddress}&chain=BSC&token=USDT&amount=${amountWei}`;
}

// 构建Binance Web3 DeepLink
function buildBinanceDeepLink(): string {
  return `bnbwallet://swap?inputCurrency=BNB&outputCurrency=${USDT_CONTRACT}`;
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
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<typeof PLANS[0] | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [showWalletList, setShowWalletList] = useState(false);

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'silver': return '#C0C0C0';
      case 'gold': return '#FFD700';
      case 'diamond': return '#00D4FF';
      default: return '#888';
    }
  };

  const getPrice = (plan: typeof PLANS[0]) => {
    return billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
  };

  const getSavings = (plan: typeof PLANS[0]) => {
    const yearlyTotal = plan.monthlyPrice * 12;
    const savings = yearlyTotal - plan.yearlyPrice;
    return Math.round((savings / yearlyTotal) * 100);
  };

  const handleSelectPlan = (plan: typeof PLANS[0]) => {
    setSelectedPlan(plan);
    setModalVisible(true);
  };

  const handlePayment = async (wallet: typeof WALLETS[0]) => {
    if (!selectedPlan) return;
    
    const price = getPrice(selectedPlan);
    const amountWei = calculateAmount(price);
    
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
        deepLink = buildOKXDeepLink(RECEIVE_ADDRESS, price);
        break;
      case 'binance':
        deepLink = buildBinanceDeepLink();
        break;
    }
    
    tryIframeDeepLink(deepLink);
    
    Alert.alert(
      '订单已创建',
      `请向以下地址转账 ${price} USDT (BEP20)\n\n${RECEIVE_ADDRESS}\n\n转账完成后，系统将自动开通VIP权限。`,
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
          
          {/* 统计数据 */}
          <View className="flex-row justify-around mt-6 py-4 px-2 rounded-2xl" style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
            {STATS.map((stat, index) => (
              <View key={index} className="items-center">
                <Text className="text-lg font-bold" style={{ color: '#FFD700' }}>{stat.value}</Text>
                <Text className="text-xs text-gray-500 mt-1">{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 计费周期切换 */}
        <View className="px-4 pb-4">
          <View className="flex-row rounded-xl p-1" style={{ backgroundColor: '#1A1A1A' }}>
            <TouchableOpacity
              className="flex-1 py-3 rounded-lg items-center"
              style={{ backgroundColor: billingCycle === 'monthly' ? '#2A2A2A' : 'transparent' }}
              onPress={() => setBillingCycle('monthly')}
            >
              <Text className={`font-medium ${billingCycle === 'monthly' ? 'text-white' : 'text-gray-500'}`}>
                月付
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 py-3 rounded-lg items-center flex-row justify-center"
              style={{ backgroundColor: billingCycle === 'yearly' ? '#2A2A2A' : 'transparent' }}
              onPress={() => setBillingCycle('yearly')}
            >
              <Text className={`font-medium ${billingCycle === 'yearly' ? 'text-white' : 'text-gray-500'}`}>
                年付
              </Text>
              <View className="ml-2 px-2 py-0.5 rounded-full" style={{ backgroundColor: '#00D4FF20' }}>
                <Text className="text-xs" style={{ color: '#00D4FF' }}>省17%</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* 套餐列表 */}
        <View className="px-4 pb-4">
          {PLANS.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              className="rounded-2xl p-4 mb-3 border-2"
              style={{ 
                backgroundColor: '#0A0A0F',
                borderColor: selectedPlan?.id === plan.id ? getTierColor(plan.tier) : '#1F1F1F',
              }}
              onPress={() => handleSelectPlan(plan)}
            >
              {/* 推荐标签 */}
              {plan.recommended && (
                <View className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full" style={{ backgroundColor: '#FFD700' }}>
                  <Text className="text-xs font-bold text-black">⭐ 推荐</Text>
                </View>
              )}
              
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
                  <Text className="text-2xl font-bold text-white">${getPrice(plan)}</Text>
                  <Text className="text-sm text-gray-400 ml-1">/{billingCycle === 'yearly' ? '年' : '月'}</Text>
                </View>
              </View>

              {/* 年付节省提示 */}
              {billingCycle === 'yearly' && (
                <View className="mb-3 flex-row items-center">
                  <Ionicons name="pricetag" size={14} color="#00D4FF" />
                  <Text className="text-xs text-[#00D4FF] ml-1">年付省 ${plan.monthlyPrice * 12 - plan.yearlyPrice} (相当于 {getSavings(plan)}% 折扣)</Text>
                </View>
              )}
              
              {/* 功能列表 */}
              <View className="space-y-2">
                {plan.features.map((feature, index) => (
                  <View key={index} className="flex-row items-start">
                    <Ionicons name="checkmark-circle" size={14} color={getTierColor(plan.tier)} style={{ marginTop: 2 }} />
                    <View className="ml-2 flex-1">
                      <Text className="text-sm text-white">{feature.name}</Text>
                      <Text className="text-xs text-gray-500">{feature.desc}</Text>
                    </View>
                  </View>
                ))}
              </View>
              
              {/* 选择按钮 */}
              <TouchableOpacity
                className="mt-4 rounded-xl py-3 items-center"
                style={{ backgroundColor: getTierColor(plan.tier) }}
                onPress={() => handleSelectPlan(plan)}
              >
                <Text className="text-sm font-semibold text-black">立即开通</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>

        {/* 用户评价 */}
        <View className="px-4 pb-4">
          <Text className="text-base font-semibold text-white mb-3">用户真实评价</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-4 px-4">
            {TESTIMONIALS.map((item, index) => (
              <View
                key={index}
                className="w-64 mr-3 p-4 rounded-xl border"
                style={{ backgroundColor: '#0A0A0F', borderColor: '#1F1F1F' }}
              >
                <View className="flex-row items-center mb-2">
                  <Text className="text-2xl mr-2">{item.avatar}</Text>
                  <View>
                    <Text className="text-sm font-medium text-white">{item.name}</Text>
                    <Text className="text-xs text-gray-500">{item.role}</Text>
                  </View>
                </View>
                <Text className="text-sm text-gray-300 leading-5">"{item.text}"</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* 信任保障 */}
        <View className="px-4 pb-6">
          <View className="p-4 rounded-2xl" style={{ backgroundColor: 'rgba(0,212,255,0.05)', borderWidth: 1, borderColor: 'rgba(0,212,255,0.2)' }}>
            <View className="flex-row items-center mb-3">
              <Ionicons name="shield-checkmark" size={24} color="#00D4FF" />
              <Text className="text-base font-semibold text-white ml-2">信任保障</Text>
            </View>
            <View className="space-y-2">
              <View className="flex-row items-center">
                <Ionicons name="checkmark-circle" size={16} color="#00D4FF" />
                <Text className="text-sm text-gray-300 ml-2">7天无理由退款</Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="checkmark-circle" size={16} color="#00D4FF" />
                <Text className="text-sm text-gray-300 ml-2">支付安全 (USDT链上转账)</Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="checkmark-circle" size={16} color="#00D4FF" />
                <Text className="text-sm text-gray-300 ml-2">24小时自动到账</Text>
              </View>
            </View>
          </View>
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
                  <View className="flex-row items-center">
                    <View className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: getTierColor(selectedPlan.tier) }} />
                    <Text className="text-white font-medium">{selectedPlan.name}</Text>
                  </View>
                  <Text className="text-lg font-bold" style={{ color: getTierColor(selectedPlan.tier) }}>
                    ${getPrice(selectedPlan)}/{billingCycle === 'yearly' ? '年' : '月'}
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
                <Text className="text-2xl font-bold text-white">{getPrice(selectedPlan)} USDT</Text>
                <Text className="text-xs text-gray-500 mt-1">
                  {billingCycle === 'yearly' ? `相当于每月 ${selectedPlan.monthlyPrice} USDT，省 ${getSavings(selectedPlan)}%` : '按月计费'}
                </Text>
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
