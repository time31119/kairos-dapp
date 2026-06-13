'use client';

/**
 * 关注页面 - DAPP 版本
 * 支持钱包连接和 Web3 身份
 * 暗黑科技风格全面优化
 */
import { Screen } from '@/components/Screen';
import { Text, View, TouchableOpacity, FlatList, TextInput, Modal, Alert, RefreshControl } from 'react-native';
import { Ionicons, FontAwesome6 } from '@expo/vector-icons';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { useWeb3 } from '@/contexts/Web3Context';
import { useState, useEffect, useCallback } from 'react';

interface Coin {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  image: string;
}

interface PriceAlert {
  id: string;
  symbol: string;
  targetPrice: number;
  direction: 'above' | 'below';
  triggered: boolean;
}

const MOCK_COINS: Coin[] = [
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', price: 67245.89, change24h: 2.34, volume24h: 28500000000, marketCap: 1320000000000, image: '₿' },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', price: 3456.78, change24h: 1.56, volume24h: 15200000000, marketCap: 415000000000, image: 'Ξ' },
  { id: 'solana', symbol: 'SOL', name: 'Solana', price: 178.45, change24h: 5.67, volume24h: 3200000000, marketCap: 78000000000, image: '◎' },
  { id: 'binancecoin', symbol: 'BNB', name: 'BNB', price: 598.32, change24h: -0.89, volume24h: 1800000000, marketCap: 89000000000, image: '🔶' },
  { id: 'ripple', symbol: 'XRP', name: 'XRP', price: 0.5234, change24h: 3.21, volume24h: 2100000000, marketCap: 28000000000, image: '✕' },
  { id: 'cardano', symbol: 'ADA', name: 'Cardano', price: 0.4567, change24h: -1.23, volume24h: 450000000, marketCap: 16000000000, image: '₳' },
  { id: 'avalanche', symbol: 'AVAX', name: 'Avalanche', price: 35.67, change24h: 4.56, volume24h: 520000000, marketCap: 13500000000, image: '▲' },
  { id: 'chainlink', symbol: 'LINK', name: 'Chainlink', price: 14.23, change24h: 2.89, volume24h: 380000000, marketCap: 8500000000, image: '⬡' },
];

type TabType = 'watchlist' | 'recent' | 'alerts';
type SortType = 'time' | 'price' | 'change' | 'marketCap';

export default function FollowScreen() {
  const router = useSafeRouter();
  const { wallet } = useWeb3();
  const [activeTab, setActiveTab] = useState<TabType>('watchlist');
  const [watchlist, setWatchlist] = useState<Coin[]>([]);
  const [recentCoins, setRecentCoins] = useState<Coin[]>([]);
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [sortBy, setSortBy] = useState<SortType>('time');
  const [refreshing, setRefreshing] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState<Coin | null>(null);
  const [alertPrice, setAlertPrice] = useState('');

  useEffect(() => {
    loadData();
  }, [wallet.address]);

  const loadData = () => {
    const savedWatchlist = watchlist.length > 0 ? watchlist : MOCK_COINS.slice(0, 5);
    setWatchlist(savedWatchlist);
    setRecentCoins(MOCK_COINS.slice(3, 7));
    setAlerts([
      { id: '1', symbol: 'BTC', targetPrice: 70000, direction: 'above', triggered: false },
      { id: '2', symbol: 'ETH', targetPrice: 3000, direction: 'below', triggered: true },
    ]);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setWatchlist(prev => prev.map(coin => ({
      ...coin,
      price: coin.price * (1 + (Math.random() - 0.5) * 0.02),
      change24h: coin.change24h + (Math.random() - 0.5) * 0.5,
    })));
    setRefreshing(false);
  }, []);

  const handleCoinPress = (coin: Coin) => {
    router.push('/coin', { id: coin.id, symbol: coin.symbol });
  };

  const handleFollow = (coin: Coin) => {
    if (watchlist.find(c => c.id === coin.id)) {
      setWatchlist(prev => prev.filter(c => c.id !== coin.id));
    } else {
      setWatchlist(prev => [...prev, coin]);
    }
  };

  const handleSetAlert = () => {
    if (!selectedCoin || !alertPrice) return;
    
    const price = parseFloat(alertPrice);
    if (isNaN(price)) {
      Alert.alert('错误', '请输入有效的价格');
      return;
    }

    const direction = price > selectedCoin.price ? 'above' : 'below';
    
    setAlerts(prev => [...prev, {
      id: Date.now().toString(),
      symbol: selectedCoin.symbol,
      targetPrice: price,
      direction,
      triggered: false,
    }]);
    
    setShowAlertModal(false);
    setAlertPrice('');
    setSelectedCoin(null);
    Alert.alert('成功', `已设置 ${selectedCoin.symbol} 价格提醒`);
  };

  const handleDeleteAlert = (alertId: string) => {
    Alert.alert('删除提醒', '确定要删除这个价格提醒吗？', [
      { text: '取消', style: 'cancel' },
      { text: '删除', style: 'destructive', onPress: () => {
        setAlerts(prev => prev.filter(a => a.id !== alertId));
      }},
    ]);
  };

  const clearAll = () => {
    Alert.alert('清空自选', '确定要清空所有自选吗？', [
      { text: '取消', style: 'cancel' },
      { text: '清空', style: 'destructive', onPress: () => setWatchlist([]) },
    ]);
  };

  const getSortedCoins = (coins: Coin[]) => {
    const sorted = [...coins];
    switch (sortBy) {
      case 'price':
        return sorted.sort((a, b) => b.price - a.price);
      case 'change':
        return sorted.sort((a, b) => b.change24h - a.change24h);
      case 'marketCap':
        return sorted.sort((a, b) => b.marketCap - a.marketCap);
      default:
        return sorted;
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 1000) return `$${price.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
    if (price >= 1) return `$${price.toFixed(2)}`;
    return `$${price.toFixed(4)}`;
  };

  const renderCoinItem = ({ item }: { item: Coin }) => {
    const isWatched = watchlist.find(c => c.id === item.id);
    return (
      <TouchableOpacity
        onPress={() => handleCoinPress(item)}
        style={{
          backgroundColor: '#0A0A0F',
          borderRadius: 12,
          padding: 14,
          marginBottom: 10,
          borderWidth: 1,
          borderColor: isWatched ? '#00F0FF' : '#1F1F2E',
          shadowColor: isWatched ? '#00F0FF' : 'transparent',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: isWatched ? 0.2 : 0,
          shadowRadius: 10,
        }}
      >
        <View className="flex-row items-center">
          <View 
            className="w-11 h-11 rounded-full items-center justify-center"
            style={{ 
              backgroundColor: '#1A1A22',
              borderWidth: 1.5,
              borderColor: item.change24h >= 0 ? '#00FF88' : '#EF4444',
            }}
          >
            <Text className="text-base font-bold" style={{ color: item.change24h >= 0 ? '#00FF88' : '#EF4444' }}>
              {item.image}
            </Text>
          </View>
          
          <View className="flex-1 ml-3">
            <View className="flex-row items-center gap-2">
              <Text className="text-sm font-semibold" style={{ color: '#FFFFFF' }}>{item.symbol}</Text>
              {isWatched && <View className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#00F0FF' }} />}
            </View>
            <Text className="text-xs mt-0.5" style={{ color: '#6B7280' }}>{item.name}</Text>
          </View>
          
          <View className="items-end mr-3">
            <Text className="text-sm font-semibold" style={{ color: '#FFFFFF' }}>{formatPrice(item.price)}</Text>
            <View 
              className="px-2 py-0.5 rounded mt-1"
              style={{ backgroundColor: item.change24h >= 0 ? 'rgba(0, 255, 136, 0.15)' : 'rgba(239, 68, 68, 0.15)' }}
            >
              <Text className="text-xs font-medium" style={{ color: item.change24h >= 0 ? '#00FF88' : '#EF4444' }}>
                {item.change24h >= 0 ? '+' : ''}{item.change24h.toFixed(2)}%
              </Text>
            </View>
          </View>
          
          <View className="flex-row items-center gap-2">
            <TouchableOpacity
              onPress={() => {
                setSelectedCoin(item);
                setAlertPrice(item.price.toString());
                setShowAlertModal(true);
              }}
              className="w-9 h-9 rounded-lg items-center justify-center"
              style={{ backgroundColor: '#1A1A22', borderWidth: 1, borderColor: '#FFD700' }}
            >
              <Ionicons name="notifications-outline" size={16} color="#FFD700" />
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => handleFollow(item)}
              className="w-9 h-9 rounded-lg items-center justify-center"
              style={{ 
                backgroundColor: isWatched ? 'rgba(0, 240, 255, 0.15)' : '#1A1A22',
                borderWidth: 1,
                borderColor: isWatched ? '#00F0FF' : '#1F1F2E',
              }}
            >
              <Ionicons 
                name={isWatched ? "star" : "star-outline"} 
                size={16} 
                color={isWatched ? '#00F0FF' : '#6B7280'} 
              />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderAlertItem = ({ item }: { item: PriceAlert }) => (
    <View
      style={{
        backgroundColor: '#0A0A0F',
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: item.triggered ? '#EF4444' : '#1F1F2E',
        shadowColor: item.triggered ? '#EF4444' : 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: item.triggered ? 0.2 : 0,
        shadowRadius: 10,
      }}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <View 
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ 
              backgroundColor: item.triggered ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 215, 0, 0.15)',
              borderWidth: 1,
              borderColor: item.triggered ? '#EF4444' : '#FFD700',
            }}
          >
            <Ionicons 
              name={item.triggered ? "alert-circle" : "notifications"} 
              size={18} 
              color={item.triggered ? '#EF4444' : '#FFD700'} 
            />
          </View>
          
          <View>
            <View className="flex-row items-center gap-2">
              <Text className="text-sm font-semibold" style={{ color: '#FFFFFF' }}>{item.symbol}</Text>
              {item.triggered && (
                <View className="px-2 py-0.5 rounded" style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)' }}>
                  <Text className="text-xs font-medium" style={{ color: '#EF4444' }}>已触发</Text>
                </View>
              )}
            </View>
            <Text className="text-xs mt-0.5" style={{ color: '#6B7280' }}>
              {item.direction === 'above' ? '高于' : '低于'} {formatPrice(item.targetPrice)}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity
          onPress={() => handleDeleteAlert(item.id)}
          className="w-8 h-8 rounded-lg items-center justify-center"
          style={{ backgroundColor: '#1A1A22' }}
        >
          <Ionicons name="trash-outline" size={16} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = (type: TabType) => {
    const configs = {
      watchlist: {
        icon: 'star-outline',
        title: '暂无自选',
        desc: '点击行情页的⭐添加自选',
        color: '#FFD700',
      },
      recent: {
        icon: 'time-outline',
        title: '暂无最近浏览',
        desc: '浏览代币详情后会显示在这里',
        color: '#6B7280',
      },
      alerts: {
        icon: 'notifications-outline',
        title: '暂无价格提醒',
        desc: '点击🔔设置价格提醒',
        color: '#00F0FF',
      },
    };
    const config = configs[type];
    
    return (
      <View className="items-center py-16">
        <View 
          className="w-20 h-20 rounded-full items-center justify-center mb-4"
          style={{ backgroundColor: '#1A1A22', borderWidth: 1, borderColor: '#1F1F2E' }}
        >
          <Ionicons name={config.icon as any} size={36} color={config.color} />
        </View>
        <Text className="text-base font-semibold" style={{ color: '#FFFFFF' }}>{config.title}</Text>
        <Text className="text-sm mt-1" style={{ color: '#6B7280' }}>{config.desc}</Text>
      </View>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'watchlist':
        return watchlist.length > 0 ? (
          <FlatList
            data={getSortedCoins(watchlist)}
            renderItem={renderCoinItem}
            keyExtractor={item => item.id}
            contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#00F0FF"
              />
            }
          />
        ) : renderEmptyState('watchlist');
      
      case 'recent':
        return recentCoins.length > 0 ? (
          <FlatList
            data={recentCoins}
            renderItem={renderCoinItem}
            keyExtractor={item => item.id}
            contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
          />
        ) : renderEmptyState('recent');
      
      case 'alerts':
        return alerts.length > 0 ? (
          <FlatList
            data={alerts}
            renderItem={renderAlertItem}
            keyExtractor={item => item.id}
            contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
          />
        ) : renderEmptyState('alerts');
    }
  };

  const renderAlertModalContent = () => (
    <View className="w-full rounded-2xl p-5" style={{ backgroundColor: '#0A0A0F', borderWidth: 1, borderColor: '#1F1F2E' }}>
      <View className="flex-row items-center justify-between mb-5">
        <Text className="text-lg font-semibold" style={{ color: '#FFFFFF' }}>设置价格提醒</Text>
        <TouchableOpacity onPress={() => setShowAlertModal(false)}>
          <Ionicons name="close" size={24} color="#6B7280" />
        </TouchableOpacity>
      </View>
      
      {selectedCoin && (
        <View className="flex-row items-center gap-3 mb-5 p-3 rounded-xl" style={{ backgroundColor: '#1A1A22' }}>
          <View 
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ 
              backgroundColor: '#0A0A0F',
              borderWidth: 1.5,
              borderColor: selectedCoin.change24h >= 0 ? '#00FF88' : '#EF4444',
            }}
          >
            <Text style={{ color: selectedCoin.change24h >= 0 ? '#00FF88' : '#EF4444' }}>
              {selectedCoin.image}
            </Text>
          </View>
          <View>
            <Text className="text-sm font-semibold" style={{ color: '#FFFFFF' }}>{selectedCoin.symbol}</Text>
            <Text className="text-xs" style={{ color: '#6B7280' }}>{formatPrice(selectedCoin.price)}</Text>
          </View>
        </View>
      )}
      
      <Text className="text-sm mb-2" style={{ color: '#6B7280' }}>目标价格 (USD)</Text>
      <View 
        className="flex-row items-center rounded-xl px-4 mb-4"
        style={{ backgroundColor: '#1A1A22', borderWidth: 1, borderColor: '#1F1F2E' }}
      >
        <Text className="text-lg" style={{ color: '#6B7280' }}>$</Text>
        <TextInput
          value={alertPrice}
          onChangeText={setAlertPrice}
          placeholder="0.00"
          placeholderTextColor="#6B7280"
          keyboardType="decimal-pad"
          className="flex-1 py-3 ml-2 text-base"
          style={{ color: '#FFFFFF' }}
        />
      </View>
      
      <Text className="text-sm mb-2" style={{ color: '#6B7280' }}>快捷设置</Text>
      <View className="flex-row flex-wrap gap-2 mb-5">
        {[5, -5, 10, -10].map(pct => (
          <TouchableOpacity
            key={pct}
            onPress={() => {
              if (selectedCoin) {
                const newPrice = selectedCoin.price * (1 + pct / 100);
                setAlertPrice(newPrice.toFixed(selectedCoin.price < 1 ? 4 : 2));
              }
            }}
            className="px-4 py-2 rounded-lg"
            style={{ 
              backgroundColor: pct > 0 ? 'rgba(0, 255, 136, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              borderWidth: 1,
              borderColor: pct > 0 ? '#00FF88' : '#EF4444',
            }}
          >
            <Text className="text-sm font-medium" style={{ color: pct > 0 ? '#00FF88' : '#EF4444' }}>
              {pct > 0 ? '+' : ''}{pct}%
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <TouchableOpacity
        onPress={handleSetAlert}
        className="py-3.5 rounded-xl items-center"
        style={{
          backgroundColor: '#00F0FF',
          shadowColor: '#00F0FF',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.4,
          shadowRadius: 12,
        }}
      >
        <Text className="text-sm font-bold" style={{ color: '#0A0A0F' }}>确认设置</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Screen>
      <View className="px-5 pt-3 pb-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-bold" style={{ color: '#FFFFFF' }}>自选</Text>
          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              onPress={() => setShowSearch(!showSearch)}
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: '#1A1A22', borderWidth: 1, borderColor: '#1F1F2E' }}
            >
              <Ionicons name="search" size={20} color="#6B7280" />
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => {
                const sortOptions: SortType[] = ['time', 'price', 'change', 'marketCap'];
                const sortLabels: Record<SortType, string> = { time: '时间', price: '价格', change: '涨跌', marketCap: '市值' };
                Alert.alert(
                  '排序方式',
                  undefined,
                  sortOptions.map(opt => ({
                    text: sortLabels[opt] + (sortBy === opt ? ' ✓' : ''),
                    onPress: () => setSortBy(opt),
                  }))
                );
              }}
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: '#1A1A22', borderWidth: 1, borderColor: '#1F1F2E' }}
            >
              <Ionicons name="swap-vertical" size={20} color="#6B7280" />
            </TouchableOpacity>
            
            {activeTab === 'watchlist' && watchlist.length > 0 && (
              <TouchableOpacity
                onPress={clearAll}
                className="w-10 h-10 rounded-full items-center justify-center"
                style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', borderWidth: 1, borderColor: '#EF4444' }}
              >
                <Ionicons name="trash-outline" size={20} color="#EF4444" />
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        {showSearch && (
          <View className="mt-3">
            <View 
              className="flex-row items-center rounded-xl px-4"
              style={{ backgroundColor: '#1A1A22', borderWidth: 1, borderColor: '#1F1F2E' }}
            >
              <Ionicons name="search" size={18} color="#6B7280" />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="搜索代币..."
                placeholderTextColor="#6B7280"
                className="flex-1 py-3 ml-3 text-sm"
                style={{ color: '#FFFFFF' }}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={18} color="#6B7280" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </View>

      <View className="px-5 mb-4">
        <View 
          className="flex-row rounded-xl p-1"
          style={{ backgroundColor: '#0A0A0F', borderWidth: 1, borderColor: '#1F1F2E' }}
        >
          {[
            { key: 'watchlist', label: '自选', icon: 'star' },
            { key: 'recent', label: '最近', icon: 'time' },
            { key: 'alerts', label: '提醒', icon: 'notifications' },
          ].map(tab => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key as TabType)}
              className="flex-1 py-2.5 rounded-lg items-center flex-row justify-center gap-1.5"
              style={{
                backgroundColor: activeTab === tab.key ? '#00F0FF' : 'transparent',
              }}
            >
              <Ionicons 
                name={activeTab === tab.key ? tab.icon : `${tab.icon}-outline` as any} 
                size={16} 
                color={activeTab === tab.key ? '#0A0A0F' : '#6B7280'} 
              />
              <Text 
                className="text-sm font-medium"
                style={{ color: activeTab === tab.key ? '#0A0A0F' : '#6B7280' }}
              >
                {tab.label}
              </Text>
              {tab.key === 'alerts' && alerts.length > 0 && (
                <View className="w-4 h-4 rounded-full items-center justify-center" style={{ backgroundColor: '#EF4444' }}>
                  <Text className="text-xs font-bold" style={{ color: '#FFFFFF', fontSize: 10 }}>{alerts.length}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {renderContent()}

      <Modal
        visible={showAlertModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAlertModal(false)}
      >
        <TouchableOpacity 
          activeOpacity={1}
          onPress={() => setShowAlertModal(false)}
          className="flex-1 justify-center items-center px-6"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
        >
          {renderAlertModalContent()}
        </TouchableOpacity>
      </Modal>
    </Screen>
  );
}
