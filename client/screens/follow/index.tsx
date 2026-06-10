/**
 * 关注页面 - 自选代币管理
 * KAIROS 行情筛选器
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  FlatList,
  TextInput,
  Modal,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Screen } from '@/components/Screen';
import { Ionicons } from '@expo/vector-icons';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9091';
const WATCHLIST_KEY = 'watchlist';

// API 请求函数
async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}/api/v1${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });
  
  const data = await response.json();
  if (data.code !== 0) {
    throw new Error(data.message || '请求失败');
  }
  return data.data;
}

// 获取代币列表
async function fetchTokens() {
  try {
    const data = await apiRequest<any[]>('/tokens');
    return data;
  } catch {
    return [];
  }
}

// 格式化价格
function formatPrice(price: number): string {
  if (price >= 1000) {
    return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  } else if (price >= 1) {
    return price.toFixed(2);
  } else {
    return price.toFixed(4);
  }
}

// 格式化市值
function formatMarketCap(value: number): string {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  return `$${value.toFixed(2)}`;
}

type SortType = 'addTime' | 'price' | 'change' | 'marketCap';
type SortOrder = 'asc' | 'desc';

export default function FollowScreen() {
  const router = useSafeRouter();
  const [followedCoins, setFollowedCoins] = useState<string[]>([]);
  const [allCoins, setAllCoins] = useState<any[]>([]);
  const [sortType, setSortType] = useState<SortType>('addTime');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'follow' | 'recent'>('follow');

  // 加载数据
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // 从本地存储加载自选列表
      const stored = await AsyncStorage.getItem(WATCHLIST_KEY);
      if (stored) {
        setFollowedCoins(JSON.parse(stored));
      } else {
        // 默认自选
        setFollowedCoins(['bitcoin', 'ethereum']);
      }

      // 获取代币列表
      const tokens = await fetchTokens();
      setAllCoins(tokens);
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 保存自选列表到本地
  const saveWatchlist = async (list: string[]) => {
    try {
      await AsyncStorage.setItem(WATCHLIST_KEY, JSON.stringify(list));
    } catch (error) {
      console.error('保存失败:', error);
    }
  };

  // 获取自选代币数据
  const getFollowedCoinsData = useCallback(() => {
    const coins = allCoins.filter(coin => followedCoins.includes(coin.id));
    
    coins.sort((a, b) => {
      let comparison = 0;
      switch (sortType) {
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'change':
          comparison = a.change24h - b.change24h;
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
  }, [allCoins, followedCoins, sortType, sortOrder]);

  const followedCoinsData = getFollowedCoinsData();

  // 最近浏览 (从 allCoins 随机取)
  const recentCoins = allCoins.slice(0, 5);

  // 移除自选
  const handleRemoveFollow = (coinId: string) => {
    const newList = followedCoins.filter(id => id !== coinId);
    setFollowedCoins(newList);
    saveWatchlist(newList);
  };

  // 添加自选
  const handleAddFollow = (coinId: string) => {
    if (!followedCoins.includes(coinId)) {
      const newList = [...followedCoins, coinId];
      setFollowedCoins(newList);
      saveWatchlist(newList);
    }
    setShowAddModal(false);
    setSearchQuery('');
  };

  // 下拉刷新
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  // 切换排序
  const toggleSort = (type: SortType) => {
    if (sortType === type) {
      setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
    } else {
      setSortType(type);
      setSortOrder('desc');
    }
  };

  // 搜索过滤
  const filteredCoins = searchQuery
    ? allCoins.filter(coin =>
        coin.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        coin.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allCoins;

  const renderCoinItem = ({ item, index }: { item: any; index: number }) => {
    const isFollowed = followedCoins.includes(item.id);
    
    return (
      <TouchableOpacity
        style={styles.coinItem}
        onPress={() => router.push('/coin', { id: item.id })}
        activeOpacity={0.7}
      >
        <View style={styles.coinLeft}>
          <Text style={styles.rankText}>{index + 1}</Text>
          <View style={styles.coinIcon}>
            <Text style={styles.coinIconText}>{item.symbol?.slice(0, 2)}</Text>
          </View>
          <View style={styles.coinInfo}>
            <View style={styles.coinNameRow}>
              <Text style={styles.coinSymbol}>{item.symbol}</Text>
              {isFollowed && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>自选</Text>
                </View>
              )}
            </View>
            <Text style={styles.coinName}>{item.name}</Text>
          </View>
        </View>
        
        <View style={styles.coinRight}>
          <Text style={styles.coinPrice}>${formatPrice(item.price)}</Text>
          <View style={styles.changeRow}>
            <Text style={[styles.coinChange, { color: (item.change24h || 0) >= 0 ? '#00F0FF' : '#BF00FF' }]}>
              {(item.change24h || 0) >= 0 ? '+' : ''}{(item.change24h || 0).toFixed(2)}%
            </Text>
            <Ionicons
              name={(item.change24h || 0) >= 0 ? 'trending-up' : 'trending-down'}
              size={14}
              color={(item.change24h || 0) >= 0 ? '#00F0FF' : '#BF00FF'}
            />
          </View>
        </View>
        
        <TouchableOpacity
          style={[styles.addButton, isFollowed && styles.addButtonFollowed]}
          onPress={() => isFollowed ? handleRemoveFollow(item.id) : handleAddFollow(item.id)}
        >
          <Ionicons
            name={isFollowed ? 'checkmark' : 'add'}
            size={18}
            color={isFollowed ? '#666' : '#0A0A0F'}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={styles.headerSection}>
      {/* Tab Switcher */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'follow' && styles.tabActive]}
          onPress={() => setActiveTab('follow')}
        >
          <Text style={[styles.tabText, activeTab === 'follow' && styles.tabTextActive]}>
            自选 ({followedCoins.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'recent' && styles.tabActive]}
          onPress={() => setActiveTab('recent')}
        >
          <Text style={[styles.tabText, activeTab === 'recent' && styles.tabTextActive]}>
            最近浏览
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Sort Options */}
      {activeTab === 'follow' && followedCoins.length > 0 && (
        <View style={styles.sortContainer}>
          <Text style={styles.sortLabel}>排序:</Text>
          {[
            { key: 'addTime' as SortType, label: '添加时间' },
            { key: 'price' as SortType, label: '价格' },
            { key: 'change' as SortType, label: '涨跌幅' },
            { key: 'marketCap' as SortType, label: '市值' },
          ].map(option => (
            <TouchableOpacity
              key={option.key}
              style={[styles.sortButton, sortType === option.key && styles.sortButtonActive]}
              onPress={() => toggleSort(option.key)}
            >
              <Text style={[styles.sortButtonText, sortType === option.key && styles.sortButtonTextActive]}>
                {option.label} {sortType === option.key && (sortOrder === 'desc' ? '↓' : '↑')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIcon}>
        <Ionicons name="bookmark-outline" size={40} color="#374151" />
      </View>
      <Text style={styles.emptyTitle}>
        {activeTab === 'follow' ? '暂无自选代币' : '暂无浏览记录'}
      </Text>
      <Text style={styles.emptyDesc}>
        {activeTab === 'follow'
          ? '从行情筛选中添加感兴趣的代币\n以便快速查看'
          : '浏览过的代币将显示在这里'}
      </Text>
      {activeTab === 'follow' && (
        <TouchableOpacity
          style={styles.addButtonLarge}
          onPress={() => setShowAddModal(true)}
        >
          <Text style={styles.addButtonLargeText}>添加自选</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return (
      <Screen>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00F0FF" />
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      {/* Header */}
      <View style={styles.pageHeader}>
        <View>
          <Text style={styles.pageTitle}>我的关注</Text>
          <Text style={styles.pageSubtitle}>自选代币列表</Text>
        </View>
        <TouchableOpacity
          style={styles.headerAddButton}
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons name="add" size={24} color="#0A0A0F" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <FlatList
        data={activeTab === 'follow' ? followedCoinsData : recentCoins}
        keyExtractor={(item) => item.id}
        renderItem={renderCoinItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#00F0FF"
            colors={['#00F0FF']}
          />
        }
        contentContainerStyle={followedCoinsData.length === 0 ? styles.emptyList : styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Add Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>添加自选</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#666" />
              <TextInput
                style={styles.searchInput}
                placeholder="搜索代币..."
                placeholderTextColor="#666"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <FlatList
              data={filteredCoins}
              keyExtractor={(item) => item.id}
              renderItem={({ item, index }) => renderCoinItem({ item, index })}
              style={styles.modalList}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0A0F',
  },
  loadingText: {
    color: '#666',
    marginTop: 12,
  },
  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  pageSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  headerAddButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#00F0FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  emptyList: {
    flex: 1,
  },
  headerSection: {
    marginBottom: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1F',
    borderRadius: 12,
    padding: 4,
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#00F0FF',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#0A0A0F',
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sortLabel: {
    fontSize: 12,
    color: '#666',
  },
  sortButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#1A1A1F',
  },
  sortButtonActive: {
    backgroundColor: 'rgba(0, 240, 255, 0.2)',
    borderWidth: 1,
    borderColor: '#00F0FF',
  },
  sortButtonText: {
    fontSize: 12,
    color: '#666',
  },
  sortButtonTextActive: {
    color: '#00F0FF',
  },
  coinItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1F',
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
  },
  coinLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rankText: {
    fontSize: 12,
    color: '#666',
    width: 20,
    textAlign: 'center',
  },
  coinIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2A2A2F',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  coinIconText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
  },
  coinInfo: {
    flex: 1,
  },
  coinNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  coinSymbol: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  badge: {
    backgroundColor: 'rgba(0, 240, 255, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    color: '#00F0FF',
    fontWeight: '500',
  },
  coinName: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  coinRight: {
    alignItems: 'flex-end',
    marginRight: 12,
  },
  coinPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  coinChange: {
    fontSize: 12,
    fontWeight: '500',
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#00F0FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonFollowed: {
    backgroundColor: '#2A2A2F',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 60,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1A1A1F',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  addButtonLarge: {
    backgroundColor: '#00F0FF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  addButtonLargeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0A0A0F',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1A1A1F',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A2F',
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#FFFFFF',
  },
  modalList: {
    maxHeight: 400,
  },
});
