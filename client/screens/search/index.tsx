/**
 * 搜索页面
 * KAIROS 行情筛选器
 */

import { useState, useEffect, useCallback } from 'react';
import { Screen } from '@/components/Screen';
import { View, Text, StyleSheet, TextInput, FlatList, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { Link } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9091';

const HISTORY_KEY = 'search_history';
const MAX_HISTORY = 10;

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

// 获取热门搜索
async function fetchHotSearch() {
  try {
    const data = await apiRequest<Array<{ id: string; keyword: string; heat: number }>>('/hot');
    return data.map(item => item.keyword);
  } catch {
    return ['BTC', 'ETH', 'SOL', 'DeFi', 'Meme币', 'RWA'];
  }
}

// 搜索代币
async function searchCoins(query: string) {
  try {
    const data = await apiRequest<{
      tokens: Array<{
        id: string;
        symbol: string;
        name: string;
        price: number;
        change24h: number;
      }>;
    }>(`/search?q=${encodeURIComponent(query)}`);
    return data.tokens;
  } catch {
    return [];
  }
}

export default function SearchScreen() {
  const router = useSafeRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [hotKeywords, setHotKeywords] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // 加载搜索历史和热门关键词
  useEffect(() => {
    loadHistory();
    loadHotKeywords();
  }, []);

  const loadHistory = async () => {
    try {
      const history = await AsyncStorage.getItem(HISTORY_KEY);
      if (history) {
        setSearchHistory(JSON.parse(history));
      }
    } catch (error) {
      console.error('加载搜索历史失败:', error);
    }
  };

  const loadHotKeywords = async () => {
    const keywords = await fetchHotSearch();
    setHotKeywords(keywords);
  };

  // 防抖搜索
  useEffect(() => {
    if (searchQuery.length === 0) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setShowResults(true);
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchCoins(searchQuery);
        setSearchResults(results);
      } catch (error) {
        console.error('搜索失败:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // 添加到搜索历史
  const addToHistory = async (keyword: string) => {
    if (!keyword.trim()) return;
    
    try {
      const history = await AsyncStorage.getItem(HISTORY_KEY);
      let list = history ? JSON.parse(history) : [];
      
      // 去重并放到最前面
      list = [keyword, ...list.filter((item: string) => item !== keyword)].slice(0, MAX_HISTORY);
      
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(list));
      setSearchHistory(list);
    } catch (error) {
      console.error('保存搜索历史失败:', error);
    }
  };

  // 清除搜索历史
  const clearHistory = async () => {
    try {
      await AsyncStorage.removeItem(HISTORY_KEY);
      setSearchHistory([]);
    } catch (error) {
      console.error('清除搜索历史失败:', error);
    }
  };

  // 处理搜索提交
  const handleSearch = () => {
    if (searchQuery.trim()) {
      addToHistory(searchQuery.trim());
    }
  };

  // 处理历史/热门关键词点击
  const handleKeywordPress = (keyword: string) => {
    setSearchQuery(keyword);
    addToHistory(keyword);
  };

  // 处理结果项点击
  const handleResultPress = (item: any) => {
    addToHistory(item.symbol);
    router.push(`/coin/${item.symbol}`);
  };

  const renderSearchResult = ({ item }: { item: any }) => (
    <Pressable style={styles.resultItem} onPress={() => handleResultPress(item)}>
      <View style={styles.resultLeft}>
        <View style={styles.coinIcon}>
          <Text style={styles.coinIconText}>{item.symbol?.charAt(0) || '?'}</Text>
        </View>
        <View>
          <Text style={styles.coinSymbol}>{item.symbol}</Text>
          <Text style={styles.coinName}>{item.name}</Text>
        </View>
      </View>
      <View style={styles.resultRight}>
        <Text style={styles.coinPrice}>${item.price?.toLocaleString() || '—'}</Text>
        <Text
          style={[
            styles.coinChange,
            { color: (item.change24h || 0) >= 0 ? '#00FF88' : '#FF3366' },
          ]}
        >
          {(item.change24h || 0) >= 0 ? '+' : ''}
          {item.change24h?.toFixed(2) || '0.00'}%
        </Text>
      </View>
    </Pressable>
  );

  return (
    <Screen>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#00F0FF" />
          </Pressable>
          <Text style={styles.headerTitle}>搜索</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Search Input */}
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#64748B" />
          <TextInput
            style={styles.searchInput}
            placeholder="搜索代币、交易员、资讯..."
            placeholderTextColor="#64748B"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            autoFocus
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#64748B" />
            </Pressable>
          )}
        </View>

        {/* Search Results */}
        {showResults ? (
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.id || item.symbol}
            renderItem={renderSearchResult}
            ListHeaderComponent={
              isSearching ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>搜索中...</Text>
                </View>
              ) : null
            }
            ListEmptyComponent={
              !isSearching && searchQuery.length > 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="search-outline" size={48} color="#334155" />
                  <Text style={styles.emptyText}>未找到相关结果</Text>
                </View>
              ) : null
            }
            contentContainerStyle={styles.resultsList}
          />
        ) : (
          <View style={styles.suggestionsContainer}>
            {/* Search History */}
            {searchHistory.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>搜索历史</Text>
                  <Pressable onPress={clearHistory}>
                    <Text style={styles.clearText}>清除</Text>
                  </Pressable>
                </View>
                <View style={styles.keywordsContainer}>
                  {searchHistory.map((keyword, index) => (
                    <Pressable
                      key={index}
                      style={styles.historyTag}
                      onPress={() => handleKeywordPress(keyword)}
                    >
                      <Ionicons name="time-outline" size={12} color="#64748B" style={{ marginRight: 4 }} />
                      <Text style={styles.historyText}>{keyword}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {/* Hot Keywords */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>热门搜索</Text>
              <View style={styles.keywordsContainer}>
                {hotKeywords.map((keyword, index) => (
                  <Pressable
                    key={index}
                    style={styles.keywordTag}
                    onPress={() => handleKeywordPress(keyword)}
                  >
                    <Text style={styles.keywordText}>{keyword}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Popular Coins */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>热门代币</Text>
              <PopularCoinsList hotKeywords={hotKeywords} onPress={handleKeywordPress} />
            </View>
          </View>
        )}
      </View>
    </Screen>
  );
}

// 热门代币列表组件
function PopularCoinsList({ hotKeywords, onPress }: { hotKeywords: string[]; onPress: (keyword: string) => void }) {
  const [coins, setCoins] = useState<any[]>([]);

  const loadCoins = useCallback(async () => {
    try {
      const data = await apiRequest<any[]>('/tokens');
      setCoins(data.slice(0, 5));
    } catch {
      // 使用默认数据
    }
  }, []);

  useEffect(() => {
    loadCoins();
  }, [loadCoins]);

  return (
    <View>
      {coins.map((coin) => (
        <Link key={coin.id} href={`/coin/${coin.symbol}`} asChild>
          <Pressable style={styles.popularItem}>
            <View style={styles.popularLeft}>
              <View style={[styles.coinIcon, { backgroundColor: 'rgba(0, 240, 255, 0.2)' }]}>
                <Text style={[styles.coinIconText, { color: '#00F0FF' }]}>
                  {coin.symbol?.charAt(0) || '?'}
                </Text>
              </View>
              <View>
                <Text style={styles.popularSymbol}>{coin.symbol}</Text>
                <Text style={styles.popularName}>{coin.name}</Text>
              </View>
            </View>
            <View style={styles.popularRight}>
              <Text style={styles.popularPrice}>${coin.price?.toLocaleString() || '—'}</Text>
              <Text
                style={[
                  styles.popularChange,
                  { color: (coin.change24h || 0) >= 0 ? '#00FF88' : '#FF3366' },
                ]}
              >
                {(coin.change24h || 0) >= 0 ? '+' : ''}
                {coin.change24h?.toFixed(2) || '0.00'}%
              </Text>
            </View>
          </Pressable>
        </Link>
      ))}
    </View>
  );
}

// API 请求函数
// 注意：apiRequest 在组件外部定义

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerSpacer: {
    width: 40,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A24',
    marginHorizontal: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#FFFFFF',
  },
  suggestionsContainer: {
    flex: 1,
    paddingTop: 16,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
  },
  clearText: {
    fontSize: 13,
    color: '#00F0FF',
  },
  keywordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  historyTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A24',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  historyText: {
    fontSize: 13,
    color: '#94A3B8',
  },
  keywordTag: {
    backgroundColor: '#1A1A24',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  keywordText: {
    fontSize: 14,
    color: '#00F0FF',
  },
  popularItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A24',
  },
  popularLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  popularRight: {
    alignItems: 'flex-end',
  },
  popularSymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  popularName: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  popularPrice: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  popularChange: {
    fontSize: 12,
    marginTop: 2,
  },
  resultsList: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    color: '#64748B',
    fontSize: 14,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#1A1A24',
    borderRadius: 12,
    marginBottom: 8,
  },
  resultLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultRight: {
    alignItems: 'flex-end',
  },
  coinIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 240, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  coinIconText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  coinSymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  coinName: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  coinPrice: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  coinChange: {
    fontSize: 12,
    marginTop: 2,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    color: '#64748B',
    fontSize: 14,
    marginTop: 12,
  },
});
