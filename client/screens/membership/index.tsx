import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Screen } from '@/components/Screen';
import { useSafeRouter } from '@/hooks/useSafeRouter';

// 复制函数 - 使用expo-clipboard
const copyToClipboard = async (text: string, onSuccess?: () => void, onFail?: () => void): Promise<boolean> => {
  try {
    await Clipboard.setStringAsync(text);
    onSuccess?.();
    return true;
  } catch (e) {
    console.error('Copy failed:', e);
    onFail?.();
    return false;
  }
};

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

// 统计数据
const STATS = [
  { value: '10,000+', label: 'VIP会员' },
  { value: '95%', label: '准确率' },
  { value: '24/7', label: '客服支持' },
];

// 钱包类型 - 移除TP/OKX/Binance，仅保留USDT转账支付
type WalletType = 'tp' | 'okx' | 'binance';

// 钱包信息 - 暂时保留类型定义但不使用

// 计算USDT金额 (精度6位)
function calculateAmount(amount: number): string {
  const usdtAmount = Math.round(amount * 1e6);
  return usdtAmount.toString();
}
    
export default function MembershipScreen() {
  const router = useSafeRouter();
  const [selectedPlan, setSelectedPlan] = useState<typeof PLANS[0] | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [showWalletList, setShowWalletList] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [userWalletAddress, setUserWalletAddress] = useState('');
  const [copyToast, setCopyToast] = useState<string | null>(null);

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
    const initInviteCode = async () => {
      try {
        // 获取用户ID (统一使用AsyncStorage)
        const userId = (await AsyncStorage.getItem('user_id')) || '';
        
        // 如果有userId，优先从后端获取邀请码
        if (userId) {
          try {
            const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/referral/info?userId=${userId}`);
            const data = await response.json();
            if (data.success && data.data.inviteCode) {
              setInviteCode(data.data.inviteCode);
              await AsyncStorage.setItem('invite_code', data.data.inviteCode);
              return;
            }
          } catch (e) {
            console.log('Failed to fetch invite code from backend');
          }
        }
        
        // 后端没有邀请码，使用本地保存的
        const walletAddr = (await AsyncStorage.getItem('wallet_address')) || '';
        setUserWalletAddress(walletAddr);
        const savedCode = await AsyncStorage.getItem('invite_code');
        if (savedCode) {
          setInviteCode(savedCode);
          return;
        }
        
        // 生成新的固定邀请码
        const newCode = generateFixedInviteCode(walletAddr || Date.now().toString());
        setInviteCode(newCode);
        await AsyncStorage.setItem('invite_code', newCode);
      } catch (error) {
        console.log('Error initializing invite code:', error);
      }
    };
    
    initInviteCode();
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

  // 复制邀请码
  const handleCopyCode = async () => {
    try {
      copyToClipboard(inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.log('Copy failed:', error);
    }
  };

  // 复制邀请链接
  const handleCopyInviteLink = async () => {
    const link = `https://kairosdapp.com/membership?invite=${inviteCode}`;
    try {
      copyToClipboard(link);
      Alert.alert('成功', '邀请链接已复制');
    } catch (error) {
      console.log('Copy failed:', error);
    }
  };

  const inviteLink = inviteCode ? `https://kairosdapp.com/membership?invite=${inviteCode}` : '';

  const API_BASE = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9091';

  const handlePayment = async () => {
    if (!selectedPlan) return;
    
    const price = selectedPlan.monthlyPrice;
    
    // 直接显示USDT转账支付弹窗
    setUsdtPaymentVisible(true);
  };

  return (
    <Screen style={{ backgroundColor: '#111827' }}>
      {/* 顶部导航 */}
      <View className="flex-row items-center px-4 py-4" style={{ backgroundColor: '#1F2937' }}>
        <TouchableOpacity onPress={() => {
          if (Platform.OS === 'web' && typeof window !== 'undefined' && window.history.length > 1) {
            window.history.back();
          } else {
            router.back();
          }
        }} className="p-2 -ml-2">
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
                  onPress={handleCopyCode}
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
                  onPress={handleCopyInviteLink}
                >
                  <Text className="text-sm font-medium text-black">分享</Text>
                </TouchableOpacity>
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

      {/* Toast 提示 */}
      {copyToast && (
        <View className="absolute bottom-24 left-4 right-4 p-4 rounded-xl items-center" style={{ backgroundColor: 'rgba(0,0,0,0.9)' }}>
          <Text className="text-white text-base">{copyToast}</Text>
        </View>
      )}

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
              
              {/* USDT转账 - 直接显示收款地址 */}
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
                  <Text className="text-sm text-gray-500">点击查看收款地址</Text>
                </View>
                <Ionicons name="chevron-forward" size={22} color="#6B7280" />
              </TouchableOpacity>
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
              <View className="flex-row items-center justify-between">
                <Text 
                  className="text-xs text-gray-200 font-mono flex-1" 
                  selectable={true}
                  numberOfLines={2}
                  style={{ lineHeight: 18 }}
                >
                  {RECEIVE_ADDRESS}
                </Text>
                <Text className="text-xs text-gray-500 ml-2">长按复制</Text>
              </View>
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
                await copyToClipboard(
                  RECEIVE_ADDRESS,
                  () => setCopyToast('地址已复制到剪贴板'),
                  () => setCopyToast('复制失败，请长按地址手动复制')
                );
                setTimeout(() => setCopyToast(null), 3000);
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
