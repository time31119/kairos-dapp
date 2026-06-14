import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { Link } from 'expo-router';

const EXPO_PUBLIC_BACKEND_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9091';

// 赛道定义
const CATEGORIES = [
  { id: 'defi', name: 'DeFi', desc: '去中心化金融', icon: 'trending-up', color: '#00F0FF' },
  { id: 'meme', name: 'Meme', desc: '模因代币', icon: 'chatbubbles', color: '#FF6B6B' },
  { id: 'ai', name: 'AI', desc: '人工智能', icon: 'cpu', color: '#A855F7' },
  { id: 'gaming', name: 'GameFi', desc: '链游', icon: 'game-controller', color: '#22C55E' },
  { id: 'infrastructure', name: '基础设施', desc: '基础设施', icon: 'server', color: '#F59E0B' },
  { id: 'layer2', name: 'Layer2', desc: '二层网络', icon: 'layers', color: '#EC4899' },
];

export default function CategoriesScreen() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch(`${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/screener/scenarios/realtime`);
      const data = await res.json();
      if (data.categories) {
        setCategories(data.categories);
        setLastUpdate(new Date());
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    const interval = setInterval(fetchCategories, 5000);
    return () => clearInterval(interval);
  }, [fetchCategories]);

  const getIconName = (icon: string): keyof typeof Ionicons.glyphMap => {
    const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
      defi: 'trending-up',
      meme: 'chatbubbles',
      ai: 'cpu',
      gaming: 'game-controller',
      infrastructure: 'server',
      layer2: 'layers',
      DeFi: 'trending-up',
      Meme: 'chatbubbles',
      AI: 'cpu',
      GameFi: 'game-controller',
      Infrastructure: 'server',
      Layer2: 'layers',
    };
    return iconMap[icon] || 'ellipse';
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Link href="/" asChild>
          <Pressable style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </Pressable>
        </Link>
        <Text style={styles.headerTitle}>赛道分类</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00F0FF" />
            <Text style={styles.loadingText}>加载中...</Text>
          </View>
        ) : (
          <>
            <View style={styles.grid}>
              {CATEGORIES.map((cat) => {
                const catData = categories.find(c => c.id === cat.id) || {};
                return (
                  <Pressable
                    key={cat.id}
                    style={styles.categoryCard}
                    onPress={() => {
                      // 跳转到筛选页面
                    }}
                  >
                    <View style={[styles.iconContainer, { backgroundColor: cat.color + '20' }]}>
                      <Ionicons name={getIconName(cat.icon)} size={28} color={cat.color} />
                    </View>
                    <Text style={styles.categoryName}>{cat.name}</Text>
                    <Text style={styles.categoryDesc}>{cat.desc}</Text>
                    <View style={styles.statsRow}>
                      <Text style={styles.statsText}>{catData.tokenCount || 0} 代币</Text>
                      <Text style={[
                        styles.changeText,
                        (catData.stats?.avgChange || 0) >= 0 ? styles.positive : styles.negative
                      ]}>
                        {(catData.stats?.avgChange || 0) >= 0 ? '+' : ''}{catData.stats?.avgChange || 0}%
                      </Text>
                    </View>
                    <View style={styles.detailStats}>
                      <View style={styles.detailItem}>
                        <View style={[styles.dot, { backgroundColor: '#00FF88' }]} />
                        <Text style={styles.detailText}>{(catData.stats?.bullishCount || 0)} 涨</Text>
                      </View>
                      <View style={styles.detailItem}>
                        <View style={[styles.dot, { backgroundColor: '#FF4444' }]} />
                        <Text style={styles.detailText}>{(catData.stats?.bearishCount || 0)} 跌</Text>
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </View>

            {/* 实时更新状态 */}
            {lastUpdate && (
              <View style={styles.updateStatus}>
                <View style={styles.updateDot} />
                <Text style={styles.updateText}>
                  最后更新: {lastUpdate.toLocaleTimeString('zh-CN')}
                </Text>
              </View>
            )}
          </>
        )}

        {/* 底部间距 */}
        <View style={styles.bottomGap} />
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F2E',
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerRight: {
    width: 40,
  },
  loadingContainer: {
    padding: 60,
    alignItems: 'center',
  },
  loadingText: {
    color: '#6B7280',
    marginTop: 12,
    fontSize: 14,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 12,
  },
  categoryCard: {
    width: '47%',
    backgroundColor: '#13131A',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1F1F2E',
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  categoryDesc: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statsText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  changeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  positive: {
    color: '#00FF88',
  },
  negative: {
    color: '#FF4444',
  },
  detailStats: {
    flexDirection: 'row',
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  detailText: {
    fontSize: 11,
    color: '#6B7280',
  },
  updateStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    gap: 6,
  },
  updateDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00FF88',
  },
  updateText: {
    fontSize: 12,
    color: '#6B7280',
  },
  bottomGap: {
    height: 40,
  },
});
