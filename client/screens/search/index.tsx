import { Screen } from '@/components/Screen';
import { View, Text, StyleSheet, TextInput, FlatList, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { Link } from 'expo-router';
import { useState } from 'react';

const popularCoins = [
  { id: '1', symbol: 'BTC', name: 'Bitcoin', price: 67823.45, change: 2.34 },
  { id: '2', symbol: 'ETH', name: 'Ethereum', price: 3456.78, change: 1.56 },
  { id: '3', symbol: 'SOL', name: 'Solana', price: 178.92, change: 5.67 },
  { id: '4', symbol: 'BNB', name: 'BNB', price: 412.35, change: -0.89 },
  { id: '5', symbol: 'XRP', name: 'Ripple', price: 0.5234, change: 3.21 },
  { id: '6', symbol: 'ADA', name: 'Cardano', price: 0.4567, change: -1.23 },
  { id: '7', symbol: 'DOGE', name: 'Dogecoin', price: 0.1234, change: 8.45 },
  { id: '8', symbol: 'DOT', name: 'Polkadot', price: 7.89, change: 2.11 },
];

// 搜索历史数据
const searchHistory = ['BTC', 'ETH', 'SOL', 'BNB', 'DOGE', 'XRP'];

// 热门关键词
const hotKeywords = ['BTC突破68000', 'ETH升级', 'SOL生态', 'DeFi新项目', 'NFT市场', 'RWA叙事'];

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useSafeRouter();

  const filteredCoins = searchQuery
    ? popularCoins.filter(
        coin =>
          coin.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          coin.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <Screen>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Link href="/" asChild>
            <Pressable style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#00F0FF" />
            </Pressable>
          </Link>
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
            autoFocus
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#64748B" />
            </Pressable>
          )}
        </View>

        {/* Search Results */}
        {searchQuery.length > 0 ? (
          <FlatList
            data={filteredCoins}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <Link href="/coin/btc-bitcoin" asChild>
                <Pressable style={styles.resultItem}>
                  <View style={styles.resultLeft}>
                    <View style={styles.coinIcon}>
                      <Text style={styles.coinIconText}>{item.symbol.charAt(0)}</Text>
                    </View>
                    <View>
                      <Text style={styles.coinSymbol}>{item.symbol}</Text>
                      <Text style={styles.coinName}>{item.name}</Text>
                    </View>
                  </View>
                  <View style={styles.resultRight}>
                    <Text style={styles.coinPrice}>${item.price.toLocaleString()}</Text>
                    <Text
                      style={[
                        styles.coinChange,
                        { color: item.change >= 0 ? '#00FF88' : '#FF3366' },
                      ]}
                    >
                      {item.change >= 0 ? '+' : ''}
                      {item.change}%
                    </Text>
                  </View>
                </Pressable>
              </Link>
            )}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="search-outline" size={48} color="#334155" />
                <Text style={styles.emptyText}>未找到相关结果</Text>
              </View>
            }
          />
        ) : (
          <View style={styles.suggestionsContainer}>
            {/* Search History */}
            {searchHistory.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>🕒 搜索历史</Text>
                  <Pressable onPress={() => {}}>
                    <Text style={styles.clearText}>清除</Text>
                  </Pressable>
                </View>
                <View style={styles.keywordsContainer}>
                  {searchHistory.map((keyword, index) => (
                    <Pressable
                      key={index}
                      style={styles.historyTag}
                      onPress={() => setSearchQuery(keyword)}
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
              <Text style={styles.sectionTitle}>🔥 热门搜索</Text>
              <View style={styles.keywordsContainer}>
                {hotKeywords.map((keyword, index) => (
                  <Pressable
                    key={index}
                    style={styles.keywordTag}
                    onPress={() => setSearchQuery(keyword)}
                  >
                    <Text style={styles.keywordText}>{keyword}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Popular Coins */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>💰 热门代币</Text>
              {popularCoins.slice(0, 5).map(coin => (
                <Link key={coin.id} href="/coin/btc-bitcoin" asChild>
                  <Pressable style={styles.popularItem}>
                    <View style={styles.popularLeft}>
                      <View style={[styles.coinIcon, { backgroundColor: 'rgba(0, 240, 255, 0.2)' }]}>
                        <Text style={[styles.coinIconText, { color: '#00F0FF' }]}>
                          {coin.symbol.charAt(0)}
                        </Text>
                      </View>
                      <View>
                        <Text style={styles.popularSymbol}>{coin.symbol}</Text>
                        <Text style={styles.popularName}>{coin.name}</Text>
                      </View>
                    </View>
                    <View style={styles.popularRight}>
                      <Text style={styles.popularPrice}>
                        ${coin.price.toLocaleString()}
                      </Text>
                      <Text
                        style={[
                          styles.popularChange,
                          { color: coin.change >= 0 ? '#00FF88' : '#FF3366' },
                        ]}
                      >
                        {coin.change >= 0 ? '+' : ''}
                        {coin.change}%
                      </Text>
                    </View>
                  </Pressable>
                </Link>
              ))}
            </View>
          </View>
        )}
      </View>
    </Screen>
  );
}

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
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 12,
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
    marginRight: 8,
    marginBottom: 8,
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
  },
  popularPrice: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  popularChange: {
    fontSize: 12,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A24',
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
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  coinIconText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFD700',
  },
  coinSymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  coinName: {
    fontSize: 12,
    color: '#64748B',
  },
  coinPrice: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  coinChange: {
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748B',
  },
});
