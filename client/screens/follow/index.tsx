'use client';

import { useState, useCallback } from 'react';
import {
  Screen,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  TextInput,
  Modal,
  RefreshControl,
} from 'react-native';
import { Ionicons, FontAwesome6 } from '@expo/vector-icons';
import { useSafeRouter } from '@/hooks/useSafeRouter';

// Mock data for available coins
const AVAILABLE_COINS = [
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', price: 67234.56, change: 2.34, marketCap: 1320000000000 },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', price: 3456.78, change: 1.23, marketCap: 415000000000 },
  { id: 'solana', symbol: 'SOL', name: 'Solana', price: 234.56, change: -0.87, marketCap: 105000000000 },
  { id: 'binancecoin', symbol: 'BNB', name: 'BNB', price: 567.89, change: 3.45, marketCap: 89000000000 },
  { id: 'ripple', symbol: 'XRP', name: 'XRP', price: 0.5234, change: 5.67, marketCap: 28000000000 },
  { id: 'cardano', symbol: 'ADA', name: 'Cardano', price: 0.4567, change: -1.23, marketCap: 16000000000 },
  { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin', price: 0.1234, change: 8.92, marketCap: 18000000000 },
  { id: 'polkadot', symbol: 'DOT', name: 'Polkadot', price: 7.89, change: 2.34, marketCap: 10000000000 },
  { id: 'avalanche', symbol: 'AVAX', name: 'Avalanche', price: 35.67, change: -2.15, marketCap: 14000000000 },
  { id: 'chainlink', symbol: 'LINK', name: 'Chainlink', price: 14.56, change: 4.56, marketCap: 8500000000 },
];

type SortType = 'addTime' | 'price' | 'change' | 'marketCap';
type SortOrder = 'asc' | 'desc';

export default function FollowScreen() {
  const router = useSafeRouter();
  const [followedCoins, setFollowedCoins] = useState<string[]>(['bitcoin', 'ethereum', 'solana']);
  const [sortType, setSortType] = useState<SortType>('addTime');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'follow' | 'recent'>('follow');

  // Get followed coins data with sorting
  const getFollowedCoinsData = useCallback(() => {
    const coins = AVAILABLE_COINS.filter(coin => followedCoins.includes(coin.id));
    
    // Apply sorting
    coins.sort((a, b) => {
      let comparison = 0;
      switch (sortType) {
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'change':
          comparison = a.change - b.change;
          break;
        case 'marketCap':
          comparison = a.marketCap - b.marketCap;
          break;
        default:
          comparison = followedCoins.indexOf(a.id) - followedCoins.indexOf(b.id);
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });
    
    return coins;
  }, [followedCoins, sortType, sortOrder]);

  const followedCoinsData = getFollowedCoinsData();

  // Recent viewed coins (mock)
  const recentCoins = AVAILABLE_COINS.slice(0, 5);

  const handleRemoveFollow = (coinId: string) => {
    setFollowedCoins(prev => prev.filter(id => id !== coinId));
  };

  const handleAddFollow = (coinId: string) => {
    if (!followedCoins.includes(coinId)) {
      setFollowedCoins(prev => [...prev, coinId]);
    }
    setShowAddModal(false);
    setSearchQuery('');
  };

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const toggleSort = (type: SortType) => {
    if (sortType === type) {
      setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
    } else {
      setSortType(type);
      setSortOrder('desc');
    }
  };

  const renderCoinItem = ({ item, index }: { item: typeof AVAILABLE_COINS[0]; index: number }) => {
    const isFollowed = followedCoins.includes(item.id);
    const isRecent = !isFollowed && recentCoins.some(c => c.id === item.id);
    
    return (
      <TouchableOpacity
        key={item.id}
        className="bg-gray-900 rounded-2xl p-4 border border-gray-800 mb-2"
        onPress={() => router.push('/screener/1h_up', { coinId: item.id })}
        activeOpacity={0.7}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3 flex-1">
            {/* Rank */}
            <Text className="text-xs text-gray-600 w-6 text-center">{index + 1}</Text>
            
            {/* Coin Icon */}
            <View className="w-11 h-11 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 items-center justify-center">
              <Text className="text-sm font-bold text-white">
                {item.symbol.slice(0, 2)}
              </Text>
            </View>
            
            {/* Coin Info */}
            <View className="flex-1">
              <View className="flex-row items-center gap-2">
                <Text className="text-base font-bold text-white">{item.symbol}</Text>
                {isFollowed && (
                  <View className="px-1.5 py-0.5 rounded bg-cyan-500/20">
                    <Text className="text-xs text-cyan-400 font-medium">自选</Text>
                  </View>
                )}
              </View>
              <Text className="text-xs text-gray-500 mt-0.5">{item.name}</Text>
            </View>
          </View>
          
          {/* Price Info */}
          <View className="items-end">
            <Text className="text-base font-semibold text-white">
              ${item.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
            <View className="flex-row items-center gap-1 mt-0.5">
              <Text className={`text-sm font-medium ${item.change >= 0 ? 'text-cyan-400' : 'text-purple-400'}`}>
                {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
              </Text>
              <Ionicons
                name={item.change >= 0 ? 'trending-up' : 'trending-down'}
                size={14}
                color={item.change >= 0 ? '#22D3EE' : '#A855F7'}
              />
            </View>
          </View>
          
          {/* Action Button */}
          <View className="ml-3">
            <TouchableOpacity
              className={`px-3 py-1.5 rounded-lg ${isFollowed ? 'bg-gray-800' : 'bg-cyan-500'}`}
              onPress={() => isFollowed ? handleRemoveFollow(item.id) : handleAddFollow(item.id)}
            >
              <Ionicons
                name={isFollowed ? 'checkmark' : 'add'}
                size={18}
                color={isFollowed ? '#9CA3AF' : '#0A0A0F'}
              />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Market Cap */}
        <View className="flex-row items-center gap-2 mt-3 pt-3 border-t border-gray-800">
          <View className="flex-1">
            <Text className="text-xs text-gray-500">市值</Text>
            <Text className="text-sm font-medium text-gray-300">
              ${(item.marketCap / 1e9).toFixed(0)}B
            </Text>
          </View>
          <View className="w-px h-6 bg-gray-800" />
          <View className="flex-1">
            <Text className="text-xs text-gray-500">24h成交量</Text>
            <Text className="text-sm font-medium text-gray-300">
              ${((item.marketCap / 1e9) * 0.15).toFixed(1)}B
            </Text>
          </View>
          <View className="w-px h-6 bg-gray-800" />
          <View className="flex-1 items-end">
            <Text className="text-xs text-gray-500">7d涨跌</Text>
            <Text className={`text-sm font-medium ${item.change >= 0 ? 'text-cyan-400' : 'text-purple-400'}`}>
              {item.change >= 0 ? '+' : ''}{(item.change * 2.5).toFixed(1)}%
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View className="px-5">
      {/* Tab Switcher */}
      <View className="flex-row bg-gray-900 rounded-xl p-1 mb-4">
        <TouchableOpacity
          className={`flex-1 py-2.5 rounded-lg ${activeTab === 'follow' ? 'bg-cyan-500' : ''}`}
          onPress={() => setActiveTab('follow')}
        >
          <Text className={`text-center text-sm font-medium ${activeTab === 'follow' ? 'text-black' : 'text-gray-400'}`}>
            自选 ({followedCoins.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 py-2.5 rounded-lg ${activeTab === 'recent' ? 'bg-cyan-500' : ''}`}
          onPress={() => setActiveTab('recent')}
        >
          <Text className={`text-center text-sm font-medium ${activeTab === 'recent' ? 'text-black' : 'text-gray-400'}`}>
            最近浏览
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Sort Options */}
      {activeTab === 'follow' && (
        <View className="flex-row items-center gap-2 mb-3">
          <Text className="text-xs text-gray-500">排序:</Text>
          {[
            { key: 'addTime' as SortType, label: '添加时间' },
            { key: 'price' as SortType, label: '价格' },
            { key: 'change' as SortType, label: '涨跌幅' },
            { key: 'marketCap' as SortType, label: '市值' },
          ].map(option => (
            <TouchableOpacity
              key={option.key}
              className={`px-2.5 py-1 rounded-lg ${sortType === option.key ? 'bg-cyan-500/20 border border-cyan-500/50' : 'bg-gray-800/50 border border-gray-700'}`}
              onPress={() => toggleSort(option.key)}
            >
              <Text className={`text-xs font-medium ${sortType === option.key ? 'text-cyan-400' : 'text-gray-400'}`}>
                {option.label} {sortType === option.key && (sortOrder === 'desc' ? '↓' : '↑')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  const renderEmpty = () => (
    <View className="flex-1 items-center justify-center px-8">
      <View className="w-20 h-20 rounded-full bg-gray-900 items-center justify-center mb-4">
        <Ionicons name="bookmark-outline" size={40} color="#374151" />
      </View>
      <Text className="text-white text-base font-medium mb-2">
        {activeTab === 'follow' ? '暂无自选代币' : '暂无浏览记录'}
      </Text>
      <Text className="text-gray-500 text-sm text-center mb-6">
        {activeTab === 'follow'
          ? '从行情筛选中添加感兴趣的代币\n以便快速查看'
          : '浏览过的代币将显示在这里'}
      </Text>
      {activeTab === 'follow' && (
        <TouchableOpacity
          className="px-6 py-3 bg-cyan-500 rounded-xl"
          onPress={() => setShowAddModal(true)}
        >
          <Text className="text-black text-sm font-semibold">添加自选</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <Screen>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-3 pb-4">
        <View>
          <Text className="text-xl font-bold text-white">我的关注</Text>
          <Text className="text-xs text-gray-500 mt-1">自选代币列表</Text>
        </View>
        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            className="p-2"
            onPress={() => setShowAddModal(true)}
          >
            <Ionicons name="add-circle" size={26} color="#22D3EE" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      {activeTab === 'follow' ? (
        followedCoins.length > 0 ? (
          <FlatList
            data={followedCoinsData}
            renderItem={renderCoinItem}
            keyExtractor={item => item.id}
            ListHeaderComponent={renderHeader}
            contentContainerStyle="px-5 pb-5"
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor="#22D3EE"
                colors={['#22D3EE']}
              />
            }
          />
        ) : (
          renderEmpty()
        )
      ) : (
        <FlatList
          data={recentCoins}
          renderItem={renderCoinItem}
          keyExtractor={item => `recent-${item.id}`}
          ListHeaderComponent={
            <View className="px-5 mb-4">
              <Text className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                最近浏览 ({recentCoins.length})
              </Text>
            </View>
          }
          contentContainerStyle="px-5 pb-5"
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Add Coin Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View className="flex-1 bg-black/80 justify-end">
          <TouchableOpacity
            className="flex-1"
            activeOpacity={1}
            onPress={() => setShowAddModal(false)}
          />
          <View className="bg-gray-900 rounded-t-3xl p-5 max-h-[80%]">
            {/* Handle */}
            <View className="w-12 h-1 bg-gray-700 rounded-full mx-auto mb-4" />
            
            {/* Header */}
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold text-white">添加自选</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
            
            {/* Search */}
            <View className="flex-row items-center bg-gray-800 rounded-xl px-4 py-3 mb-4">
              <Ionicons name="search" size={20} color="#6B7280" />
              <TextInput
                className="flex-1 ml-3 text-white text-sm"
                placeholder="搜索代币..."
                placeholderTextColor="#6B7280"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
            </View>
            
            {/* Coin List */}
            <FlatList
              data={AVAILABLE_COINS.filter(coin =>
                coin.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
                coin.name.toLowerCase().includes(searchQuery.toLowerCase())
              )}
              renderItem={({ item }) => {
                const isFollowed = followedCoins.includes(item.id);
                return (
                  <TouchableOpacity
                    className="flex-row items-center justify-between py-3 border-b border-gray-800"
                    onPress={() => handleAddFollow(item.id)}
                  >
                    <View className="flex-row items-center gap-3">
                      <View className="w-10 h-10 rounded-full bg-gray-700 items-center justify-center">
                        <Text className="text-xs font-bold text-white">
                          {item.symbol.slice(0, 2)}
                        </Text>
                      </View>
                      <View>
                        <Text className="text-sm font-semibold text-white">{item.symbol}</Text>
                        <Text className="text-xs text-gray-500">{item.name}</Text>
                      </View>
                    </View>
                    <View className="flex-row items-center gap-2">
                      <Text className="text-sm text-gray-400">
                        ${item.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Text>
                      {isFollowed ? (
                        <View className="px-2 py-1 rounded bg-cyan-500/20">
                          <Text className="text-xs text-cyan-400">已添加</Text>
                        </View>
                      ) : (
                        <Ionicons name="add-circle-outline" size={24} color="#22D3EE" />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              }}
              keyExtractor={item => `add-${item.id}`}
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: 400 }}
            />
          </View>
        </View>
      </Modal>
    </Screen>
  );
}
