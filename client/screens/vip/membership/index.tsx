import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { Screen } from '@/components/Screen';
import { router } from 'expo-router';
import { useWeb3 } from '@/contexts/Web3Context';

const PLANS = [
  {
    id: 'monthly',
    name: '月度会员',
    price: '99',
    originalPrice: '199',
    period: '月',
    features: [
      '会员速递全部功能',
      '实时行情推送',
      '一对一客服支持',
      '专属交易策略',
    ],
    popular: false,
  },
  {
    id: 'yearly',
    name: '年度会员',
    price: '699',
    originalPrice: '1999',
    period: '年',
    features: [
      '月度会员全部功能',
      '赠送 3 个月',
      '优先体验新功能',
      '专属会员社群',
    ],
    popular: true,
  },
  {
    id: 'lifetime',
    name: '终身会员',
    price: '2999',
    originalPrice: '9999',
    period: '永久',
    features: [
      '年度会员全部功能',
      '永久有效',
      '无限次使用',
      '专属客服 1V1',
    ],
    popular: false,
  },
];

export default function MembershipScreen() {
  const { address } = useWeb3();
  const [selectedPlan, setSelectedPlan] = useState('yearly');
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('wallet');

  const currentPlan = PLANS.find(p => p.id === selectedPlan)!;

  const handlePayment = () => {
    setShowPayment(true);
  };

  const confirmPayment = async () => {
    // Simulate payment
    await new Promise(resolve => setTimeout(resolve, 1500));
    setShowPayment(false);
    alert('支付成功！您已成为尊贵的VIP会员');
    router.back();
  };

  return (
    <Screen>
      <ScrollView 
        className="flex-1"
        style={{ backgroundColor: '#0A0A0F' }}
        contentContainerStyle={{ padding: 16 }}
      >
        {/* Header */}
        <View className="items-center mb-6">
          <View 
            className="w-16 h-16 rounded-full items-center justify-center mb-3"
            style={{ backgroundColor: '#1A1A22', borderWidth: 2, borderColor: '#FFD700' }}
          >
            <Text className="text-2xl">👑</Text>
          </View>
          <Text className="text-xl font-bold" style={{ color: '#FFFFFF' }}>
            开通 VIP 会员
          </Text>
          <Text className="text-sm mt-1" style={{ color: '#6B7280' }}>
            解锁全部高级功能
          </Text>
        </View>

        {/* Plans */}
        {PLANS.map(plan => (
          <TouchableOpacity
            key={plan.id}
            className="rounded-2xl p-4 mb-3"
            style={{
              backgroundColor: '#0A0A0F',
              borderWidth: 2,
              borderColor: selectedPlan === plan.id ? '#FFD700' : '#1F1F2E',
              shadowColor: selectedPlan === plan.id ? '#FFD700' : 'transparent',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: selectedPlan === plan.id ? 0.3 : 0,
              shadowRadius: 8,
            }}
            onPress={() => setSelectedPlan(plan.id)}
          >
            {plan.popular && (
              <View 
                className="absolute -top-3 right-4 px-3 py-1 rounded-full"
                style={{ backgroundColor: '#FFD700' }}
              >
                <Text className="text-xs font-bold" style={{ color: '#0A0A0F' }}>
                  推荐
                </Text>
              </View>
            )}
            
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-base font-bold" style={{ color: '#FFFFFF' }}>
                {plan.name}
              </Text>
              <View className="flex-row items-center">
                <Text className="text-2xl font-bold" style={{ color: '#FFD700' }}>
                  ${plan.price}
                </Text>
                <Text className="text-sm ml-1" style={{ color: '#6B7280' }}>
                  /{plan.period}
                </Text>
              </View>
            </View>
            
            <Text className="text-xs mb-3" style={{ color: '#6B7280' }}>
              原价 ${plan.originalPrice}
            </Text>
            
            {plan.features.map((feature, index) => (
              <View key={index} className="flex-row items-center mb-1">
                <Text className="text-sm mr-2" style={{ color: '#00FF88' }}>✓</Text>
                <Text className="text-sm" style={{ color: '#9CA3AF' }}>{feature}</Text>
              </View>
            ))}
          </TouchableOpacity>
        ))}

        {/* Payment Button */}
        <TouchableOpacity
          className="rounded-2xl py-4 items-center mt-4"
          style={{
            backgroundColor: '#FFD700',
            shadowColor: '#FFD700',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
          }}
          onPress={handlePayment}
        >
          <Text className="text-lg font-bold" style={{ color: '#0A0A0F' }}>
            立即开通 ${currentPlan.price}/{currentPlan.period}
          </Text>
        </TouchableOpacity>

        {/* Wallet Address */}
        {address && (
          <Text className="text-center text-xs mt-4" style={{ color: '#6B7280' }}>
            当前钱包: {address.slice(0, 6)}...{address.slice(-4)}
          </Text>
        )}
      </ScrollView>

      {/* Payment Modal */}
      <Modal visible={showPayment} transparent animationType="slide">
        <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <View 
            className="rounded-t-3xl p-6"
            style={{ backgroundColor: '#0A0A0F' }}
          >
            <View className="w-12 h-1 rounded-full mx-auto mb-4" style={{ backgroundColor: '#1F1F2E' }} />
            
            <Text className="text-lg font-bold text-center mb-6" style={{ color: '#FFFFFF' }}>
              选择支付方式
            </Text>

            {/* Payment Methods */}
            {[
              { id: 'wallet', name: '钱包支付', icon: '💳', desc: '使用当前钱包' },
              { id: 'usdt', name: 'USDT 支付', icon: '🪙', desc: 'TRC20 网络' },
            ].map(method => (
              <TouchableOpacity
                key={method.id}
                className="flex-row items-center p-4 rounded-xl mb-3"
                style={{
                  backgroundColor: paymentMethod === method.id ? '#1A1A22' : '#0A0A0F',
                  borderWidth: 1,
                  borderColor: paymentMethod === method.id ? '#FFD700' : '#1F1F2E',
                }}
                onPress={() => setPaymentMethod(method.id)}
              >
                <Text className="text-2xl mr-3">{method.icon}</Text>
                <View className="flex-1">
                  <Text className="text-base font-bold" style={{ color: '#FFFFFF' }}>
                    {method.name}
                  </Text>
                  <Text className="text-xs" style={{ color: '#6B7280' }}>
                    {method.desc}
                  </Text>
                </View>
                {paymentMethod === method.id && (
                  <Text className="text-lg" style={{ color: '#FFD700' }}>✓</Text>
                )}
              </TouchableOpacity>
            ))}

            {/* Amount */}
            <View 
              className="rounded-xl p-4 my-4"
              style={{ backgroundColor: '#1A1A22' }}
            >
              <View className="flex-row justify-between">
                <Text style={{ color: '#6B7280' }}>商品</Text>
                <Text style={{ color: '#FFFFFF' }}>{currentPlan.name}</Text>
              </View>
              <View className="flex-row justify-between mt-2">
                <Text style={{ color: '#6B7280' }}>金额</Text>
                <Text className="font-bold" style={{ color: '#FFD700' }}>
                  ${currentPlan.price} USDT
                </Text>
              </View>
            </View>

            {/* Confirm */}
            <TouchableOpacity
              className="rounded-2xl py-4 items-center"
              style={{ backgroundColor: '#FFD700' }}
              onPress={confirmPayment}
            >
              <Text className="text-lg font-bold" style={{ color: '#0A0A0F' }}>
                确认支付 ${currentPlan.price}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="py-3 items-center mt-2"
              onPress={() => setShowPayment(false)}
            >
              <Text style={{ color: '#6B7280' }}>取消</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}
