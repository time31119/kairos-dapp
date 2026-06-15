/**
 * 交易员详情页面
 * 使用现有的 TraderDetailModal 组件
 */
import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Screen } from '@/components/Screen';
import { useSafeSearchParams, useSafeRouter } from '@/hooks/useSafeRouter';
import TraderDetailModal from '@/components/payment/TraderDetailModal';

const API_BASE = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || ''

interface Trader {
  id: string;
  platform: string;
  name: string;
  avatar?: string;
  avatarUrl?: string;
  country?: string;
  winRate: number;
  returns: number;
  followers: number;
  totalTrades: number;
  avgProfit: number;
  specialties: string[];
  strategies: string[];
  riskLevel: string;
  verified: boolean;
  blueTick: boolean;
  lastTradeTime?: string;
  todayPnl?: string;
  weeklyPnL?: string;
  maxDrawdown?: string;
  sharpeRatio?: string;
}

export default function TraderDetailScreen() {
  const { id } = useSafeSearchParams<{ id: string }>();
  const router = useSafeRouter();
  const [trader, setTrader] = useState<Trader | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (id) {
      fetchTrader();
    }
  }, [id]);

  const fetchTrader = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/v1/copytrading/traders/${id}`);
      if (response.ok) {
        const data = await response.json();
        setTrader(data.data);
      }
    } catch (error) {
      console.log('Failed to fetch trader');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    router.back();
  };

  const handleFollow = async (traderId: string, amount: number): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/copytrading/follow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ traderId, amount }),
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  };

  if (loading) {
    return (
      <Screen safeArea>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A0A0F' }}>
          <ActivityIndicator size="large" color="#00F0FF" />
        </View>
        <TraderDetailModal
          visible={false}
          trader={null}
          onClose={handleClose}
          onFollow={handleFollow}
        />
      </Screen>
    );
  }

  return (
    <Screen safeArea>
      <View style={{ flex: 1, backgroundColor: '#0A0A0F' }}>
        {/* 隐藏的 Modal，实际显示由 native 端处理 */}
        <TraderDetailModal
          visible={true}
          trader={trader}
          onClose={handleClose}
          onFollow={handleFollow}
        />
      </View>
    </Screen>
  );
}
