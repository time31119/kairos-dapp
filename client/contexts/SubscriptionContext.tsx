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
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

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

  const isActive = !!(subscription?.status === 'active' && 
    subscription?.expiresAt && 
    new Date(subscription.expiresAt) > new Date());

  const planNames: Record<string, string> = {
    basic: '基础版',
    professional: '专业版',
    premium: '尊享版'
  };

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        isActive,
        planName: subscription?.planId ? planNames[subscription.planId] || '会员' : '',
        refreshSubscription,
        clearSubscription
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
