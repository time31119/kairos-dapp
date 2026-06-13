/**
 * 关注页面 - 自选代币管理 (DAPP版)
 * KAIROS 行情筛选器
 */

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
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
  Alert,
} from 'react-native';
import { Screen } from '@/components/Screen';
import { Ionicons } from '@expo/vector-icons';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useWeb3 } from '@/contexts/Web3Context';

const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9091';
const WATCHLIST_KEY = 'watchlist';
const RECENT_KEY = 'recent_coins';
const ALERTS_KEY = 'price_alerts';

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
  if (!price) return '$0.00';
  if (price >= 1000) {
    return '$' + price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  } else if (price >= 1) {
    return '$' + price.toFixed(2);
  } else {
    return '$' + price.toFixed(6);
  }
}

// 格式化市值
function formatMarketCap(value: number): string {
  if (!value) return '$0';
  if (value >= 1e12) return '$' + (value / 1e12).toFixed(2) + 'T';
  if (value >= 1e9) return '$' + (value / 1e9).toFixed(2) + 'B';
  if (value >= 1e6) return '$' + (value / 1e6).toFixed(2) + 'M';
  return '$' + value.toFixed(2);
}

// 格式化钱包地址
function formatAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

type SortType = 'addTime' | 'price' | 'change' | 'marketCap';
type SortOrder = 'asc' | 'desc';

interface PriceAlert {
  coinId: string;
  symbol: string;
  targetPrice: number;
  direction: 'above' | 'below';
  enabled: boolean;
}

export default function FollowScreen() {
  const router = useSafeRouter();
  const { address, isConnected } = useWeb3();
  const [followedCoins, setFollowedCoins] = useState<string[]>([]);
  const [allCoins, setAllCoins] = useState<any[]>([]);
  const [recentCoins, setRecentCoins] = useState<any[]>([]);
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>([]);
  const [sortType, setSortType] = useState<SortType>('addTime');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'follow' | 'recent' | 'alerts'>('follow');
  const [selectedCoin, setSelectedCoin] = useState<any>(null);
  const autoRefreshRef = useRef<NodeJS.Timeout | null>(null);

  // 加载数据
  useEffect(() => {
    loadData();
    
    // 启动自动刷新 (每30秒)
    autoRefreshRef.current = setInterval(() => {
      refreshPrices();
    }, 30000);
    
    return () => {
      if (autoRefreshRef.current) {
        clearInterval(autoRefreshRef.current);
      }
    };
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // 从本地存储加载自选列表
      const watchlistKey = isConnected && address ? `${WATCHLIST_KEY}_${address}` : WATCHLIST_KEY;
      const stored = await AsyncStorage.getItem(watchlistKey);
      if (stored) {
        setFollowedCoins(JSON.parse(stored));
      } else {
        setFollowedCoins(['bitcoin', 'ethereum', 'binancecoin']);
      }

      // 加载最近浏览
      const recentKey = isConnected && address ? `${RECENT_KEY}_${address}` : RECENT_KEY;
      const recentStored = await AsyncStorage.getItem(recentKey);
      if (recentStored) {
        setRecentCoins(JSON.parse(recentStored));
      }

      // 加载价格提醒
      const alertsKey = isConnected && address ? `${ALERTS_KEY}_${address}` : ALERTS_KEY;
      const alertsStored = await AsyncStorage.getItem(alertsKey);
      if (alertsStored) {
        setPriceAlerts(JSON.parse(alertsStored));
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

  // 刷新价格
  const refreshPrices = async () => {
    try {
      const tokens = await fetchTokens();
      setAllCoins(tokens);
    } catch (error) {
      console.error('刷新价格失败:', error);
    }
  };

  // 保存自选列表
  const saveWatchlist = async (list: string[]) => {
    try {
      const key = isConnected && address ? `${WATCHLIST_KEY}_${address}` : WATCHLIST_KEY;
      await AsyncStorage.setItem(key, JSON.stringify(list));
    } catch (error) {
      console.error('保存失败:', error);
    }
  };

  // 保存最近浏览
  const saveRecentCoins = async (coins: any[]) => {
    try {
      const key = isConnected && address ? `${RECENT_KEY}_${address}` : RECENT_KEY;
      await AsyncStorage.setItem(key, JSON.stringify(coins.slice(0, 20)));
    } catch (error) {
      console.error('保存失败:', error);
    }
  };

  // 保存价格提醒
  const savePriceAlerts = async (alerts: PriceAlert[]) => {
    try {
      const key = isConnected && address ? `${ALERTS_KEY}_${address}` : ALERTS_KEY;
      await AsyncStorage.setItem(key, JSON.stringify(alerts));
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

  // 添加到最近浏览
  const addToRecent = (coin: any) => {
    const newRecent = [coin, ...recentCoins.filter(c => c.id !== coin.id)].slice(0, 20);
    setRecentCoins(newRecent);
    saveRecentCoins(newRecent);
  };

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

  // 添加价格提醒
  const handleAddAlert = (coin: any, targetPrice: number, direction: 'above' | 'below') => {
    const newAlert: PriceAlert = {
      coinId: coin.id,
      symbol: coin.symbol,
      targetPrice,
      direction,
      enabled: true,
    };
    const newAlerts = [...priceAlerts.filter(a => !(a.coinId === coin.id && a.direction === direction)), newAlert];
    setPriceAlerts(newAlerts);
    savePriceAlerts(newAlerts);
    setShowAlertModal(false);
  };

  // 删除价格提醒
  const handleDeleteAlert = (coinId: string, direction: 'above' | 'below') => {
    const newAlerts = priceAlerts.filter(a => !(a.coinId === coinId && a.direction === direction));
    setPriceAlerts(newAlerts);
    savePriceAlerts(newAlerts);
  };

  // 下拉刷新
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [isConnected, address]);

  // 切换排序
  const toggleSort = (type: SortType) => {
    if (sortType === type) {
      setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
    } else {
      setSortType(type);
      setSortOrder('desc');
    }
    setShowSortModal(false);
  };

  // 批量移除
  const handleBatchRemove = () => {
    Alert.alert(
      '批量移除',
      `确定要移除所有 ${followedCoins.length} 个自选吗？`,
      [
        { text: '取消', style: 'cancel' },
        { text: '确定', style: 'destructive', onPress: () => {
          setFollowedCoins([]);
          saveWatchlist([]);
        }},
      ]
    );
  };

  // 搜索过滤
  const filteredCoins = searchQuery
    ? allCoins.filter(coin =>
        coin.symbol?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        coin.name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allCoins;

  // 点击代币
  const handleCoinPress = (coin: any) => {
    addToRecent(coin);
    router.push('/coin', { id: coin.id });
  };

  const renderCoinItem = ({ item, index }: { item: any; index: number }) => {
    const isFollowed = followedCoins.includes(item.id);
    const coinAlert = priceAlerts.find(a => a.coinId === item.id);
    
    return (
      <TouchableOpacity
        style={styles.coinItem}
        onPress={() => handleCoinPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.coinLeft}>
          <Text style={styles.rankText}>{index + 1}</Text>
          <View style={styles.coinIcon}>
            <Text style={styles.coinIconText}>{item.symbol?.slice(0, 2).toUpperCase()}</Text>
          </View>
          <View style={styles.coinInfo}>
            <View style={styles.coinNameRow}>
              <Text style={styles.coinSymbol}>{item.symbol?.toUpperCase()}</Text>
              {isFollowed && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>自选</Text>
                </View>
              )}
              {coinAlert && (
                <View style={[styles.badge, styles.alertBadge]}>
                  <Ionicons name="notifications" size={10} color="#FFD700" />
                </View>
              )}
            </View>
            <Text style={styles.coinName}>{item.name}</Text>
          </View>
        </View>
        
        <View style={styles.coinRight}>
          <Text style={styles.coinPrice}>{formatPrice(item.price)}</Text>
          <View style={styles.changeRow}>
            <Text style={[styles.coinChange, { color: (item.change24h || 0) >= 0 ? '#00F0FF' : '#FF4444' }]}>
              {(item.change24h || 0) >= 0 ? '+' : ''}{(item.change24h || 0).toFixed(2)}%
            </Text>
            <Ionicons
              name={(item.change24h || 0) >= 0 ? 'trending-up' : 'trending-down'}
              size={14}
              color={(item.change24h || 0) >= 0 ? '#00F0FF' : '#FF4444'}
            />
          </View>
        </View>
        
        <View style={styles.coinActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              setSelectedCoin(item);
              setShowAlertModal(true);
            }}
          >
            <Ionicons name="notifications-outline" size={18} color="#FFD700" />
          </TouchableOpacity>
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
        </View>
      </TouchableOpacity>
    );
  };

  // 渲染价格提醒项
  const renderAlertItem = ({ item }: { item: PriceAlert }) => {
    const coin = allCoins.find(c => c.id === item.coinId);
    const currentPrice = coin?.price || 0;
    const isTriggered = item.direction === 'above' ? currentPrice >= item.targetPrice : currentPrice <= item.targetPrice;
    
    return (
      <View style={[styles.alertItem, isTriggered && styles.alertTriggered]}>
        <View style={styles.alertLeft}>
          <Text style={styles.alertSymbol}>{item.symbol?.toUpperCase()}</Text>
          <Text style={styles.alertCondition}>
            价格{item.direction === 'above' ? '高于' : '低于'} {formatPrice(item.targetPrice)}
          </Text>
        </View>
        <View style={styles.alertRight}>
          <Text style={styles.alertCurrent}>当前: {formatPrice(currentPrice)}</Text>
          {isTriggered && (
            <View style={styles.triggeredBadge}>
              <Text style={styles.triggeredText}>已触发</Text>
            </View>
          )}
          <TouchableOpacity onPress={() => handleDeleteAlert(item.coinId, item.direction)}>
            <Ionicons name="trash-outline" size={18} color="#FF4444" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.headerSection}>
      {/* Tab Switcher */}
      <View style={styles.tabContainer}>
        {[
          { key: 'follow' as const, label: '自选', count: followedCoins.length },
          { key: 'recent' as const, label: '最近', count: recentCoins.length },
          { key: 'alerts' as const, label: '提醒', count: priceAlerts.length },
        ].map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
              {tab.label} {tab.count > 0 && `(${tab.count})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {/* Sort Options */}
      {activeTab === 'follow' && followedCoins.length > 0 && (
        <View style={styles.sortBar}>
          <TouchableOpacity style={styles.sortButton} onPress={() => setShowSortModal(true)}>
            <Ionicons name="swap-vertical" size={16} color="#666" />
            <Text style={styles.sortButtonText}>
              {sortType === 'addTime' ? '添加时间' : sortType === 'price' ? '价格' : sortType === 'change' ? '涨跌幅' : '市值'}
            </Text>
            <Text style={styles.sortArrow}>{sortOrder === 'desc' ? '↓' : '↑'}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.batchButton} onPress={handleBatchRemove}>
            <Ionicons name="trash-outline" size={16} color="#FF4444" />
            <Text style={styles.batchButtonText}>清空</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIcon}>
        <Ionicons 
          name={activeTab === 'alerts' ? "notifications-outline" : "bookmark-outline"} 
          size={48} 
          color="#374151" 
        />
      </View>
      <Text style={styles.emptyTitle}>
        {activeTab === 'follow' ? '暂无自选代币' : activeTab === 'recent' ? '暂无浏览记录' : '暂无价格提醒'}
      </Text>
      <Text style={styles.emptyDesc}>
        {activeTab === 'follow' && '从行情筛选中添加感兴趣的代币\n以便快速查看'}
        {activeTab === 'recent' && '浏览过的代币将显示在这里'}
        {activeTab === 'alerts' && '设置价格提醒，\n代币达到目标价格时通知您'}
      </Text>
      {activeTab === 'follow' && (
        <TouchableOpacity
          style={styles.addButtonLarge}
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons name="add" size={20} color="#0A0A0F" />
          <Text style={styles.addButtonLargeText}>添加自选</Text>
        </TouchableOpacity>
      )}
      {activeTab === 'alerts' && (
        <TouchableOpacity
          style={styles.addButtonLarge}
          onPress={() => setActiveTab('follow')}
        >
          <Text style={styles.addButtonLargeText}>去自选设置提醒</Text>
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

  // 获取显示的数据
  const displayData = activeTab === 'follow' 
    ? followedCoinsData 
    : activeTab === 'recent' 
      ? recentCoins 
      : priceAlerts.map(a => allCoins.find(c => c.id === a.coinId)).filter(Boolean);

  return (
    <Screen>
      {/* Header */}
      <View style={styles.pageHeader}>
        <View>
          <Text style={styles.pageTitle}>我的关注</Text>
          <Text style={styles.pageSubtitle}>
            {isConnected && address ? formatAddress(address) : '未连接钱包'} · {followedCoins.length} 个自选
          </Text>
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
        data={activeTab === 'alerts' ? priceAlerts : (activeTab === 'follow' ? followedCoinsData : recentCoins)}
        keyExtractor={(item: any) => item.id || `${item.coinId}_${item.direction}`}
        renderItem={activeTab === 'alerts' ? renderAlertItem : renderCoinItem}
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
        contentContainerStyle={displayData.length === 0 ? styles.emptyList : styles.listContent}
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
              renderItem={renderCoinItem}
              style={styles.modalList}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.searchEmpty}>
                  <Text style={styles.searchEmptyText}>未找到相关代币</Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>

      {/* Price Alert Modal */}
      <Modal
        visible={showAlertModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAlertModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>价格提醒</Text>
              <TouchableOpacity onPress={() => setShowAlertModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {selectedCoin && (
              <View style={styles.alertCoinInfo}>
                <Text style={styles.alertCoinSymbol}>{selectedCoin.symbol?.toUpperCase()}</Text>
                <Text style={styles.alertCoinPrice}>当前价格: {formatPrice(selectedCoin.price)}</Text>
              </View>
            )}

            <View style={styles.alertButtons}>
              <TouchableOpacity
                style={styles.alertButton}
                onPress={() => selectedCoin && handleAddAlert(selectedCoin, selectedCoin.price * 1.05, 'above')}
              >
                <Ionicons name="arrow-up" size={20} color="#00F0FF" />
                <Text style={styles.alertButtonText}>价格高于 +5%</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.alertButton}
                onPress={() => selectedCoin && handleAddAlert(selectedCoin, selectedCoin.price * 0.95, 'below')}
              >
                <Ionicons name="arrow-down" size={20} color="#FF4444" />
                <Text style={styles.alertButtonText}>价格低于 -5%</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.alertButtons}>
              <TouchableOpacity
                style={styles.alertButton}
                onPress={() => selectedCoin && handleAddAlert(selectedCoin, selectedCoin.price * 1.1, 'above')}
              >
                <Ionicons name="arrow-up" size={20} color="#00F0FF" />
                <Text style={styles.alertButtonText}>价格高于 +10%</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.alertButton}
                onPress={() => selectedCoin && handleAddAlert(selectedCoin, selectedCoin.price * 0.9, 'below')}
              >
                <Ionicons name="arrow-down" size={20} color="#FF4444" />
                <Text style={styles.alertButtonText}>价格低于 -10%</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Sort Modal */}
      <Modal
        visible={showSortModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowSortModal(false)}
      >
        <TouchableOpacity 
          style={styles.sortOverlay} 
          activeOpacity={1} 
          onPress={() => setShowSortModal(false)}
        >
          <View style={styles.sortModalContent}>
            <Text style={styles.sortModalTitle}>排序方式</Text>
            {[
              { key: 'addTime' as SortType, label: '添加时间' },
              { key: 'price' as SortType, label: '价格' },
              { key: 'change' as SortType, label: '涨跌幅' },
              { key: 'marketCap' as SortType, label: '市值' },
            ].map(option => (
              <TouchableOpacity
                key={option.key}
                style={[styles.sortOption, sortType === option.key && styles.sortOptionActive]}
                onPress={() => toggleSort(option.key)}
              >
                <Text style={[styles.sortOptionText, sortType === option.key && styles.sortOptionTextActive]}>
                  {option.label}
                </Text>
                {sortType === option.key && (
                  <Ionicons name="checkmark" size={20} color="#00F0FF" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
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
    marginBottom: 12,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 4,
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
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
    fontWeight: '600',
  },
  sortBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  sortButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    marginLeft: 6,
    marginRight: 4,
  },
  sortArrow: {
    color: '#00F0FF',
    fontSize: 14,
  },
  batchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  batchButtonText: {
    color: '#FF4444',
    fontSize: 13,
    marginLeft: 4,
  },
  coinItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  coinLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankText: {
    width: 24,
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  coinIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2A2A3E',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  coinIconText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#00F0FF',
  },
  coinInfo: {
    marginLeft: 12,
  },
  coinNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinSymbol: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  badge: {
    backgroundColor: '#00F0FF20',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6,
  },
  alertBadge: {
    backgroundColor: '#FFD70020',
    paddingHorizontal: 5,
  },
  badgeText: {
    fontSize: 10,
    color: '#00F0FF',
    fontWeight: '600',
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
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  coinChange: {
    fontSize: 12,
    fontWeight: '600',
    marginRight: 4,
  },
  coinActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginRight: 4,
  },
  addButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#00F0FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonFollowed: {
    backgroundColor: '#333',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1A1A2E',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  addButtonLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00F0FF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 24,
  },
  addButtonLargeText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0A0A0F',
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0A0A0F',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    height: 44,
    marginLeft: 10,
    fontSize: 15,
    color: '#FFFFFF',
  },
  modalList: {
    maxHeight: 400,
  },
  searchEmpty: {
    padding: 40,
    alignItems: 'center',
  },
  searchEmptyText: {
    color: '#666',
    fontSize: 14,
  },
  alertCoinInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  alertCoinSymbol: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00F0FF',
  },
  alertCoinPrice: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  alertButtons: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  alertButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A2E',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  alertButtonText: {
    fontSize: 13,
    color: '#FFFFFF',
    marginLeft: 6,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#FFD700',
  },
  alertTriggered: {
    borderLeftColor: '#FF4444',
    backgroundColor: '#FF444420',
  },
  alertLeft: {
    flex: 1,
  },
  alertSymbol: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  alertCondition: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  alertRight: {
    alignItems: 'flex-end',
  },
  alertCurrent: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  triggeredBadge: {
    backgroundColor: '#FF4444',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  triggeredText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  sortOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sortModalContent: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 20,
    width: '80%',
  },
  sortModalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A3E',
  },
  sortOptionActive: {
    backgroundColor: '#00F0FF10',
    marginHorizontal: -12,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  sortOptionText: {
    fontSize: 15,
    color: '#FFFFFF',
  },
  sortOptionTextActive: {
    color: '#00F0FF',
    fontWeight: '600',
  },
});
