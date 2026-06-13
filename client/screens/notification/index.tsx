'use client';

import { useState, useCallback, useEffect } from 'react';
import { Screen } from '@/components/Screen';
import { Text, View, StyleSheet, TouchableOpacity, FlatList, RefreshControl, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { apiRequest } from '@/utils/api';

interface Notification {
  id: string;
  icon: string;
  iconColor: string;
  title: string;
  content: string;
  time: string;
  isRead: boolean;
  type: 'alert' | 'trade' | 'system' | 'news';
}

const FILTERS = [
  { key: 'all', label: '全部' },
  { key: 'alert', label: '行情' },
  { key: 'trade', label: '交易' },
  { key: 'news', label: '快讯' },
  { key: 'system', label: '系统' },
];

// 默认通知数据
const defaultNotifications: Notification[] = [
  {
    id: '1',
    icon: 'trending-up',
    iconColor: '#00FF88',
    title: 'BTC突破关键阻力位',
    content: 'BTC/USDT 已突破 $68,000 关键阻力位，当前上涨动能强劲，建议关注。',
    time: '刚刚',
    isRead: false,
    type: 'alert',
  },
  {
    id: '2',
    icon: 'person-add',
    iconColor: '#00F0FF',
    title: '新交易员推荐',
    content: '交易员"量化小王"近30日收益率达89.3%，胜率76%，值得关注。',
    time: '10分钟前',
    isRead: false,
    type: 'trade',
  },
  {
    id: '3',
    icon: 'checkmark-circle',
    iconColor: '#10B981',
    title: '跟单成功',
    content: '您已成功跟随交易员"币神张三"，跟单比例30%。',
    time: '30分钟前',
    isRead: true,
    type: 'trade',
  },
  {
    id: '4',
    icon: 'alert-circle',
    iconColor: '#FF3366',
    title: '止损触发提醒',
    content: '您的 SOL/USDT 多头仓位已触及止损线，已自动平仓。亏损 -$85.00',
    time: '1小时前',
    isRead: true,
    type: 'trade',
  },
  {
    id: '5',
    icon: 'newspaper',
    iconColor: '#8B5CF6',
    title: '市场快讯',
    content: '美联储宣布维持利率不变，加密市场整体上涨，BTC 突破新高。',
    time: '2小时前',
    isRead: true,
    type: 'news',
  },
  {
    id: '6',
    icon: 'settings',
    iconColor: '#6B7280',
    title: '系统更新通知',
    content: 'KAIROS v1.0.0 已发布，优化了行情筛选算法，新增跨周期共振功能。',
    time: '1天前',
    isRead: true,
    type: 'system',
  },
];

// 根据类型获取图标
const getIconByType = (type: string): { icon: string; color: string } => {
  switch (type) {
    case 'alert':
      return { icon: 'trending-up', color: '#00FF88' };
    case 'trade':
      return { icon: 'swap-horizontal', color: '#00F0FF' };
    case 'news':
      return { icon: 'newspaper', color: '#8B5CF6' };
    case 'system':
      return { icon: 'settings', color: '#6B7280' };
    default:
      return { icon: 'notifications', color: '#6B7280' };
  }
};

export default function NotificationScreen() {
  const router = useSafeRouter();
  const [activeFilter, setActiveFilter] = useState('all');
  const [notifications, setNotifications] = useState<Notification[]>(defaultNotifications);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 获取通知列表
  const fetchNotifications = useCallback(async () => {
    const result = await apiRequest<{ notifications?: any[]; [key: string]: any }>('/notifications');
    if (result.success && result.data) {
      // 转换后端数据格式
      let data = result.data;
      if (result.data.notifications) {
        data = result.data.notifications;
      }
      if (Array.isArray(data)) {
        const mapped = data.map((item: any) => {
          const iconInfo = getIconByType(item.type || item.category || 'system');
          return {
            id: item.id,
            icon: item.icon || iconInfo.icon,
            iconColor: item.iconColor || iconInfo.color,
            title: item.title,
            content: item.content || item.message || item.description || '',
            time: item.time || item.createdAt || item.timestamp || '',
            isRead: item.isRead || item.read || false,
            type: item.type || item.category || 'system',
          };
        });
        setNotifications(mapped);
      }
    }
  }, []);

  // 加载数据
  const loadData = async () => {
    setLoading(true);
    await fetchNotifications();
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // 下拉刷新
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  }, [fetchNotifications]);

  // 标记全部已读
  const handleMarkAllRead = async () => {
    // 调用 API 标记全部已读
    await apiRequest('/notifications/read-all', { method: 'POST' });
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  // 标记单条已读
  const handleMarkRead = async (id: string) => {
    await apiRequest(`/notifications/${id}/read`, { method: 'POST' });
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    ));
  };

  const filteredNotifications = activeFilter === 'all'
    ? notifications
    : notifications.filter(n => n.type === activeFilter);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      className="flex-row px-5 py-4 bg-gray-900 mx-4 mb-3 rounded-2xl border border-gray-800"
      style={!item.isRead ? { borderLeftWidth: 3, borderLeftColor: '#00F0FF' } : undefined}
      onPress={() => handleMarkRead(item.id)}
    >
      <View
        className="w-10 h-10 rounded-xl items-center justify-center"
        style={{ backgroundColor: `${item.iconColor}20` }}
      >
        <Ionicons name={item.icon as any} size={20} color={item.iconColor} />
      </View>
      <View className="flex-1 ml-3">
        <View className="flex-row items-center justify-between mb-1">
          <Text className="text-sm text-white font-semibold">{item.title}</Text>
          {!item.isRead && (
            <View className="w-2 h-2 rounded-full bg-cyan-400" />
          )}
        </View>
        <Text className="text-xs text-gray-400 leading-5 mb-1" numberOfLines={2}>{item.content}</Text>
        <Text className="text-xs text-gray-500">{item.time}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <Screen>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-3 pb-4">
        <Text className="text-2xl font-bold text-white">消息通知</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={handleMarkAllRead} className="px-3 py-1 rounded-full bg-gray-800">
            <Text className="text-xs text-cyan-400">全部已读</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      <View className="px-4 mb-4">
        <View className="flex-row bg-gray-900 rounded-xl p-1">
          {FILTERS.map(filter => (
            <TouchableOpacity
              key={filter.key}
              onPress={() => setActiveFilter(filter.key)}
              className="flex-1 py-2 rounded-lg items-center"
              style={activeFilter === filter.key ? { backgroundColor: '#00F0FF20' } : undefined}
            >
              <Text
                className="text-xs font-semibold"
                style={activeFilter === filter.key ? { color: '#00F0FF' } : { color: '#6B7280' }}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Loading State */}
      {loading && !refreshing ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#00F0FF" />
          <Text className="text-gray-500 mt-3">加载中...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredNotifications}
          renderItem={renderNotification}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#00F0FF"
            />
          }
          ListEmptyComponent={
            <View className="items-center py-16">
              <Ionicons name="notifications-off-outline" size={48} color="#374151" />
              <Text className="text-sm text-gray-500 mt-3">暂无消息</Text>
            </View>
          }
        />
      )}
    </Screen>
  );
}
