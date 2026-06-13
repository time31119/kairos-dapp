/**
 * 首页 - KAIROS DAPP
 * 热门精选 + 场景选择
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, RefreshControl, Image } from 'react-native';
import { Screen } from '@/components/Screen';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const EXPO_PUBLIC_BACKEND_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9091';

// 场景配置
const SCENARIOS = [
  { id: 'defi', title: 'DeFi 潜力币', description: '去中心化金融', icon: 'swap-horizontal', color: '#00F0FF' },
  { id: 'meme', title: 'Meme 币', description: '社区驱动代币', icon: 'happy-outline', color: '#FFD700' },
  { id: 'ai', title: 'AI 赛道', description: '人工智能代币', icon: 'bulb-outline', color: '#FF69B4' },
  { id: 'gaming', title: 'GameFi', description: '游戏金融', icon: 'game-controller-outline', color: '#00FF7F' },
  { id: 'infrastructure', title: '基础设施', description: '底层协议', icon: 'construct-outline', color: '#9370DB' },
  { id: 'layer2', title: 'Layer2', description: '扩容方案', icon: 'layers-outline', color: '#FF6B6B' },
];

// 热门精选代币卡片
function FeaturedTokenCard({ token, rank }: { token: any; rank: number }) {
  const isUp = token.change >= 0;
  return (
    <Pressable style={styles.featuredTokenCard}>
      <View style={styles.tokenRank}>
        <Text style={styles.rankText}>#{rank}</Text>
      </View>
      <View style={styles.tokenInfo}>
        <Text style={styles.tokenSymbol}>{token.symbol}</Text>
        <Text style={styles.tokenName}>{token.name}</Text>
      </View>
      <View style={styles.tokenPrice}>
        <Text style={styles.priceText}>${token.price < 0.01 ? token.price.toFixed(6) : token.price.toFixed(2)}</Text>
        <Text style={[styles.changeText, { color: isUp ? '#00FF88' : '#FF4444' }]}>
          {isUp ? '+' : ''}{token.change.toFixed(1)}%
        </Text>
      </View>
    </Pressable>
  );
}

// 赛道分组
function FeaturedSection({ scenario, data }: { scenario: any; data: any }) {
  return (
    <View style={styles.featuredSection}>
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionIcon, { backgroundColor: scenario.color + '20' }]}>
          <Ionicons name={scenario.icon} size={16} color={scenario.color} />
        </View>
        <Text style={styles.sectionTitle}>{scenario.name}</Text>
        <Link href={`/screener/${scenario.id}`}>
          <Text style={styles.moreText}>更多 {'>'}</Text>
        </Link>
      </View>
      <View style={styles.tokenList}>
        {data.tokens.map((token: any, index: number) => (
          <FeaturedTokenCard key={token.symbol} token={token} rank={index + 1} />
        ))}
      </View>
    </View>
  );
}

// 场景卡片
function ScenarioCard({ scenario }: { scenario: any }) {
  return (
    <Link href={`/screener/${scenario.id}`} asChild>
      <Pressable style={[styles.scenarioCard, { borderColor: scenario.color }]}>
        <View style={[styles.scenarioIcon, { backgroundColor: scenario.color + '20' }]}>
          <Ionicons name={scenario.icon} size={24} color={scenario.color} />
        </View>
        <Text style={styles.scenarioCardTitle}>{scenario.title}</Text>
      </Pressable>
    </Link>
  );
}

export default function HomeScreen() {
  const [featuredData, setFeaturedData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFeatured = async () => {
    try {
      const response = await fetch(`${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/screener/featured`);
      const result = await response.json();
      if (result.success) {
        setFeaturedData(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch featured:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFeatured();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchFeatured();
  }, []);

  return (
    <Screen>
      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00F0FF" />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>KAIROS</Text>
            <Text style={styles.subtitle}>加密货币行情筛选</Text>
          </View>
          <Link href="/notification">
            <Ionicons name="notifications-outline" size={24} color="#FFFFFF" />
          </Link>
        </View>

        {/* 热门精选 */}
        <View style={styles.featuredContainer}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="flame" size={20} color="#FF6B6B" />
            <Text style={styles.featuredTitle}>热门精选</Text>
          </View>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>加载中...</Text>
            </View>
          ) : (
            featuredData.map((section) => (
              <FeaturedSection
                key={section.scenario}
                scenario={section.config}
                data={section}
              />
            ))
          )}
        </View>

        {/* 赛道分类 */}
        <View style={styles.scenarioContainer}>
          <Text style={styles.scenarioCardTitle}>赛道分类</Text>
          <View style={styles.scenarioGrid}>
            {SCENARIOS.map((scenario) => (
              <ScenarioCard key={scenario.id} scenario={scenario} />
            ))}
          </View>
        </View>
      </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '900',
    color: '#00F0FF',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  // Featured Section
  featuredContainer: {
    padding: 16,
    backgroundColor: '#12121A',
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    color: '#6B7280',
    fontSize: 14,
  },
  featuredSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
    flex: 1,
  },
  moreText: {
    fontSize: 12,
    color: '#00F0FF',
  },
  tokenList: {
    gap: 8,
  },
  featuredTokenCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A24',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  tokenRank: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#2D2D3A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9CA3AF',
  },
  tokenInfo: {
    flex: 1,
  },
  tokenSymbol: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  tokenName: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  tokenPrice: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  changeText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  // Scenario Section
  scenarioContainer: {
    padding: 16,
    marginTop: 20,
  },
  scenarioTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  scenarioGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  scenarioCard: {
    width: '31%',
    aspectRatio: 1,
    backgroundColor: '#12121A',
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  scenarioIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  scenarioCardTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});
