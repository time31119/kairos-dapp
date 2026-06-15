import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Subscription {
  planId: string;
  billingCycle: string;
  status: string;
  activatedAt: string;
  expiresAt: string;
}

interface SubscriptionContextType {
  subscription: Subscription | null;
  isActive: boolean;
  planName: string;
  refreshSubscription: () => Promise<void>;
  clearSubscription: () => Promise<void>;
  activateSubscription: (planId: string, billingCycle: string) => Promise<{ success: boolean; message: string; data?: any }>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

const API_BASE = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || ''

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  const loadSubscription = async () => {
    try {
      const data = await AsyncStorage.getItem('user_subscription');
      if (data) {
        const parsed = JSON.parse(data);
        // 检查是否过期
        if (new Date(parsed.expiresAt) > new Date()) {
          setSubscription(parsed);
        } else {
          // 已过期，清除
          await AsyncStorage.removeItem('user_subscription');
          setSubscription(null);
        }
      }
    } catch (error) {
      console.error('加载订阅状态失败:', error);
    }
  };

  useEffect(() => {
    loadSubscription();
  }, []);

  const refreshSubscription = async () => {
    await loadSubscription();
  };

  const clearSubscription = async () => {
    await AsyncStorage.removeItem('user_subscription');
    setSubscription(null);
  };

  // 激活订阅
  const activateSubscription = async (planId: string, billingCycle: string): Promise<{ success: boolean; message: string; data?: any }> => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/subscription/activate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, billingCycle })
      });
      const result = await response.json();
      
      if (result.success) {
        // 保存订阅状态
        const subscriptionData: Subscription = {
          planId,
          billingCycle,
          status: 'active',
          activatedAt: new Date().toISOString(),
          expiresAt: result.data.expiresAt
        };
        await AsyncStorage.setItem('user_subscription', JSON.stringify(subscriptionData));
        setSubscription(subscriptionData);
      }
      
      return result;
    } catch (error) {
      return { success: false, message: '网络请求失败' };
    }
  };

  const isActive = !!(subscription?.status === 'active' && 
    subscription?.expiresAt && 
    new Date(subscription.expiresAt) > new Date());

  const planNames: Record<string, string> = {
    basic: '基础版',
    professional: '专业版',
    vip: '尊享版'
  };

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        isActive,
        planName: subscription?.planId ? planNames[subscription.planId] || '会员' : '',
        refreshSubscription,
        clearSubscription,
        activateSubscription
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within SubscriptionProvider');
  }
  return context;
}
