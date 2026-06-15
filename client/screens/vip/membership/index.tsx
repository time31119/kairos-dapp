import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Screen } from '@/components/Screen';
import { useSafeRouter, useSafeSearchParams } from '@/hooks/useSafeRouter';
import { EXPO_PUBLIC_BACKEND_BASE_URL } from '@/utils/api';

const API_BASE = EXPO_PUBLIC_BACKEND_BASE_URL || '';

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  period: string;
  isPopular?: boolean;
  features: PlanFeature[];
}

const plans: Plan[] = [
  {
    id: 'basic',
    name: '基础版',
    subtitle: '适合初学者',
    price: 9.9,
    period: '月',
    features: [
      { text: '实时行情追踪', included: true },
      { text: '基础技术指标', included: true },
      { text: '5个自选币种', included: true },
      { text: '高级图表工具', included: false },
      { text: '交易信号推送', included: false },
      { text: 'VIP社群', included: false },
    ],
  },
  {
    id: 'pro',
    name: '专业版',
    subtitle: '适合专业交易者',
    price: 29.9,
    period: '月',
    isPopular: true,
    features: [
      { text: '实时行情追踪', included: true },
      { text: '高级技术指标', included: true },
      { text: '50个自选币种', included: true },
      { text: '高级图表工具', included: true },
      { text: '交易信号推送', included: true },
      { text: 'VIP社群', included: false },
    ],
  },
  {
    id: 'enterprise',
    name: '旗舰版',
    subtitle: '机构级服务',
    price: 99.9,
    period: '月',
    features: [
      { text: '实时行情追踪', included: true },
      { text: '全技术指标库', included: true },
      { text: '无限自选币种', included: true },
      { text: '专业图表工具', included: true },
      { text: '实时信号推送', included: true },
      { text: 'VIP社群', included: true },
    ],
  },
];

export default function MembershipScreen() {
  const router = useSafeRouter();
  const params = useSafeSearchParams<{ planId?: string }>();
  const planId = params.planId || 'pro';
  const selectedPlan = plans.find((p) => p.id === planId) || plans[1];

  const [selectedPayment, setSelectedPayment] = useState<string>('tp_wallet');
  const [isProcessing, setIsProcessing] = useState(false);

  const paymentMethods = [
    { id: 'tp_wallet', name: 'TP 钱包', icon: '💳' },
    { id: 'crypto', name: '加密货币', icon: '₿' },
  ];

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch(`${API_BASE}/api/v1/vip/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: selectedPlan.id,
          paymentMethod: selectedPayment,
        }),
      });

      if (response.ok) {
        Alert.alert('支付成功', `您已成功订阅${selectedPlan.name}`, [
          { text: '确定', onPress: () => router.back() },
        ]);
      } else {
        throw new Error('Payment failed');
      }
    } catch (error) {
      Alert.alert('支付失败', '请稍后重试');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Screen>
      {/* Header */}
      <View className="bg-[#002FA7] pt-12 pb-6 px-4">
        <View className="flex-row items-center mb-4">
          <TouchableOpacity onPress={() => router.back()} className="p-2">
            <Text className="text-white text-xl">←</Text>
          </TouchableOpacity>
          <Text className="text-white text-lg font-bold flex-1 text-center">支付详情</Text>
          <View className="w-10" />
        </View>
        <Text className="text-white text-sm text-center opacity-80">
          {selectedPlan.name} · {selectedPlan.subtitle}
        </Text>
      </View>

      <View className="flex-1 bg-gray-50">
        {/* Plan Summary */}
        <View className="bg-white mx-4 mt-4 rounded-2xl p-4">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-gray-600 text-sm">订阅方案</Text>
              <Text className="text-gray-900 text-lg font-bold">{selectedPlan.name}</Text>
            </View>
            <View className="items-end">
              <Text className="text-[#002FA7] text-2xl font-bold">${selectedPlan.price}</Text>
              <Text className="text-gray-400 text-xs">/{selectedPlan.period}</Text>
            </View>
          </View>
        </View>

        {/* Features */}
        <View className="bg-white mx-4 mt-3 rounded-2xl p-4">
          <Text className="text-gray-900 font-bold mb-3">包含功能</Text>
          {selectedPlan.features.map((feature, index) => (
            <View key={index} className="flex-row items-center mb-2">
              <Text className="text-lg mr-3">{feature.included ? '✓' : '✗'}</Text>
              <Text className={`text-sm ${feature.included ? 'text-gray-700' : 'text-gray-400'}`}>
                {feature.text}
              </Text>
            </View>
          ))}
        </View>

        {/* Payment Methods */}
        <View className="bg-white mx-4 mt-3 rounded-2xl p-4">
          <Text className="text-gray-900 font-bold mb-3">支付方式</Text>
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              onPress={() => setSelectedPayment(method.id)}
              className={`flex-row items-center p-3 rounded-xl mb-2 ${
                selectedPayment === method.id ? 'bg-blue-50 border-2 border-[#002FA7]' : 'bg-gray-50'
              }`}
            >
              <Text className="text-2xl mr-3">{method.icon}</Text>
              <View className="flex-1">
                <Text className="text-gray-900 font-medium">{method.name}</Text>
              </View>
              <View
                className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                  selectedPayment === method.id ? 'border-[#002FA7] bg-[#002FA7]' : 'border-gray-300'
                }`}
              >
                {selectedPayment === method.id && <Text className="text-white text-xs">✓</Text>}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Amount */}
        <View className="bg-white mx-4 mt-3 rounded-2xl p-4">
          <View className="flex-row justify-between items-center">
            <Text className="text-gray-600">支付金额</Text>
            <Text className="text-[#002FA7] text-2xl font-bold">${selectedPlan.price}</Text>
          </View>
        </View>

        {/* Pay Button */}
        <View className="p-4 mt-auto">
          <TouchableOpacity
            onPress={handlePayment}
            disabled={isProcessing}
            className="bg-[#002FA7] py-4 rounded-2xl items-center"
          >
            <Text className="text-white font-bold text-lg">
              {isProcessing ? '处理中...' : `立即支付 $${selectedPlan.price}`}
            </Text>
          </TouchableOpacity>
          <Text className="text-gray-400 text-xs text-center mt-3">
            点击支付即表示您同意相关服务条款
          </Text>
        </View>
      </View>
    </Screen>
  );
}
