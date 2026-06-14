import { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { useSafeRouter } from '@/hooks/useSafeRouter';

const ROUTER = useSafeRouter();

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F' },
  
  // 简化头部
  header: {
    backgroundColor: '#13131A',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F2E',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  statValue: {
    color: '#00F0FF',
    fontSize: 16,
    fontWeight: '600',
  },
  statLabel: {
    color: '#8B8B9A',
    fontSize: 13,
    marginLeft: 6,
  },
  liveTag: {
    backgroundColor: '#FF3B3020',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginLeft: 'auto',
  },
  liveText: {
    color: '#FF3B30',
    fontSize: 11,
    fontWeight: '600',
  },
  
  // Tab导航
  tabNav: {
    flexDirection: 'row',
    backgroundColor: '#13131A',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F2E',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  tabIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '500',
  },
  
  // 内容区
  content: {
    flex: 1,
  },
  
  // 交易员卡片 - 简洁版
  traderCard: {
    backgroundColor: '#13131A',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1F1F2E',
  },
  traderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#00F0FF20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#00F0FF',
    fontSize: 18,
    fontWeight: '700',
  },
  traderInfo: {
    marginLeft: 12,
    flex: 1,
  },
  traderName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  platformTag: {
    backgroundColor: '#00F0FF15',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  platformText: {
    color: '#00F0FF',
    fontSize: 11,
    fontWeight: '500',
  },
  rankBadge: {
    backgroundColor: '#FFD700',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    color: '#0A0A0F',
    fontSize: 13,
    fontWeight: '700',
  },
  
  // 核心数据 - 简洁网格
  statsGrid: {
    flexDirection: 'row',
    marginTop: 16,
    backgroundColor: '#0A0A0F',
    borderRadius: 8,
    padding: 12,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statBoxValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  statBoxLabel: {
    fontSize: 11,
    color: '#8B8B9A',
    marginTop: 4,
  },
  
  // 标签
  tagsRow: {
    flexDirection: 'row',
    marginTop: 12,
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: '#1F1F2E',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  tagText: {
    color: '#8B8B9A',
    fontSize: 12,
  },
  
  // 跟单按钮
  followBtn: {
    backgroundColor: '#00F0FF',
    marginTop: 14,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  followBtnText: {
    color: '#0A0A0F',
    fontSize: 15,
    fontWeight: '600',
  },
  
  // 实盘Tab
  summaryCard: {
    backgroundColor: '#13131A',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1F1F2E',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryValue: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  summaryLabel: {
    color: '#8B8B9A',
    fontSize: 12,
    marginTop: 4,
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    marginBottom: 12,
  },
  emptyText: {
    color: '#8B8B9A',
    fontSize: 14,
  },
  
  // 速递Tab
  newsCard: {
    backgroundColor: '#13131A',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1F1F2E',
  },
  newsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  newsType: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  newsTypeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  newsTime: {
    color: '#8B8B9A',
    fontSize: 12,
    marginLeft: 'auto',
  },
  newsTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  newsDesc: {
    color: '#8B8B9A',
    fontSize: 13,
    marginTop: 6,
    lineHeight: 18,
  },
  
  // 弹窗
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    backgroundColor: '#13131A',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#00F0FF40',
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  modalStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 12,
  },
  modalStat: {
    alignItems: 'center',
  },
  modalStatValue: {
    color: '#00F0FF',
    fontSize: 18,
    fontWeight: '700',
  },
  modalStatLabel: {
    color: '#8B8B9A',
    fontSize: 12,
    marginTop: 4,
  },
  warningBox: {
    backgroundColor: '#FFD70015',
    borderWidth: 1,
    borderColor: '#FFD70040',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  warningText: {
    color: '#FFD700',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  modalBtns: {
    flexDirection: 'row',
    gap: 12,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: '#1F1F2E',
  },
  confirmBtn: {
    backgroundColor: '#00F0FF',
  },
  cancelBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  confirmBtnText: {
    color: '#0A0A0F',
    fontSize: 15,
    fontWeight: '600',
  },
  
  // 刷新
  refreshControl: {
    tintColor: '#00F0FF',
  },
});

export default function VipScreen() {
  const [activeTab, setActiveTab] = useState<'follow' | 'positions' | 'news'>('follow');
  const [traders, setTraders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTrader, setSelectedTrader] = useState<any>(null);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  const fetchTraders = useCallback(async () => {
    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/copytrading/traders`);
      const data = await res.json();
      if (data.success && data.data) {
        setTraders(data.data);
        setLastUpdate(new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }));
      }
    } catch (e) {
      console.error('Failed to fetch traders:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (activeTab === 'follow') {
        fetchTraders();
      }
    }, [activeTab, fetchTraders])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchTraders();
  };

  const handleFollow = (trader: any) => {
    setSelectedTrader(trader);
    setModalVisible(true);
  };

  const confirmFollow = () => {
    setModalVisible(false);
    alert(`已成功跟单 ${selectedTrader.name}！`);
  };

  const renderFollowTab = () => (
    <ScrollView
      style={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00F0FF" />}
    >
      {loading ? (
        <View style={{ alignItems: 'center', paddingTop: 40 }}>
          <ActivityIndicator size="large" color="#00F0FF" />
        </View>
      ) : (
        traders.slice(0, 6).map((trader, idx) => (
          <View key={trader.id || idx} style={styles.traderCard}>
            <View style={styles.traderHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{trader.name?.charAt(0) || 'T'}</Text>
              </View>
              <View style={styles.traderInfo}>
                <Text style={styles.traderName}>{trader.name}</Text>
                <View style={styles.platformTag}>
                  <Text style={styles.platformText}>{trader.platform}</Text>
                </View>
              </View>
              <View style={styles.rankBadge}>
                <Text style={styles.rankText}>{idx + 1}</Text>
              </View>
            </View>
            
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={[styles.statBoxValue, { color: '#00FF88' }]}>{trader.winRate?.toFixed(1)}%</Text>
                <Text style={styles.statBoxLabel}>胜率</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statBoxValue, { color: '#00F0FF' }]}>+{trader.returns?.toFixed(1)}%</Text>
                <Text style={styles.statBoxLabel}>累计收益</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statBoxValue, { color: '#FFD700' }]}>{(trader.followers || 0).toLocaleString()}</Text>
                <Text style={styles.statBoxLabel}>跟单人数</Text>
              </View>
            </View>
            
            <View style={styles.tagsRow}>
              {(trader.specialties || []).slice(0, 3).map((tag: string, i: number) => (
                <View key={i} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
            
            <TouchableOpacity style={styles.followBtn} onPress={() => handleFollow(trader)}>
              <Text style={styles.followBtnText}>一键跟单</Text>
            </TouchableOpacity>
          </View>
        ))
      )}
      <View style={{ height: 20 }} />
    </ScrollView>
  );

  const renderPositionsTab = () => (
    <View style={styles.content}>
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>0</Text>
            <Text style={styles.summaryLabel}>持仓数</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>0</Text>
            <Text style={styles.summaryLabel}>订单数</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: '#00FF88' }]}>+0.00%</Text>
            <Text style={styles.summaryLabel}>收益率</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.emptyBox}>
        <Ionicons name="wallet-outline" size={48} color="#8B8B9A" style={styles.emptyIcon} />
        <Text style={styles.emptyText}>暂无跟单记录</Text>
        <Text style={{ color: '#8B8B9A', fontSize: 13, marginTop: 8 }}>
          连接钱包后开始跟单交易
        </Text>
      </View>
    </View>
  );

  const renderNewsTab = () => (
    <ScrollView style={styles.content}>
      {[
        { type: '预警', color: '#FF3B30', bg: '#FF3B3015', title: 'BTC 15分钟涨幅超5%，注意回调风险', time: '2分钟前', desc: '根据技术分析，BTC已突破关键阻力位，短期可能出现回调。建议设置止盈位。' },
        { type: '信号', color: '#FFD700', bg: '#FFD70015', title: 'ETH 均线金叉形成，看涨信号', time: '5分钟前', desc: 'ETH 4小时图显示MA5上穿MA20，形成金叉。建议关注$3,800阻力位。' },
        { type: '快讯', color: '#00F0FF', bg: '#00F0FF15', title: '币安将于今日上线新币MINA', time: '10分钟前', desc: '币安创新区将上线Mina Protocol，支持USDT交易对。' },
        { type: '信号', color: '#FFD700', bg: '#FFD70015', title: 'AI板块持续强势，FET领涨', time: '15分钟前', desc: 'AI赛道继续保持强势，FET 24小时涨幅达22%。建议关注AGIX和RNDR。' },
        { type: '快讯', color: '#00F0FF', bg: '#00F0FF15', title: '以太坊Gas费创月内新低', time: '30分钟前', desc: '以太坊网络Gas费降至12 Gwei，为近一个月最低水平。' },
      ].map((news, idx) => (
        <View key={idx} style={styles.newsCard}>
          <View style={styles.newsHeader}>
            <View style={[styles.newsType, { backgroundColor: news.bg }]}>
              <Text style={[styles.newsTypeText, { color: news.color }]}>{news.type}</Text>
            </View>
            <Text style={styles.newsTime}>{news.time}</Text>
          </View>
          <Text style={styles.newsTitle}>{news.title}</Text>
          <Text style={styles.newsDesc}>{news.desc}</Text>
        </View>
      ))}
      <View style={{ height: 20 }} />
    </ScrollView>
  );

  return (
    <Screen>
      <View style={styles.container}>
        {/* 头部 */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>VIP会员中心</Text>
          <View style={styles.headerStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{traders.length || 10}</Text>
              <Text style={styles.statLabel}>顶尖交易员</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>81.2%</Text>
              <Text style={styles.statLabel}>平均胜率</Text>
            </View>
            <View style={styles.liveTag}>
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          </View>
        </View>

        {/* Tab导航 */}
        <View style={styles.tabNav}>
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setActiveTab('follow')}
          >
            <View style={[styles.tabIcon, { backgroundColor: activeTab === 'follow' ? '#00F0FF20' : 'transparent' }]}>
              <Ionicons name="people" size={22} color={activeTab === 'follow' ? '#00F0FF' : '#8B8B9A'} />
            </View>
            <Text style={[styles.tabText, { color: activeTab === 'follow' ? '#00F0FF' : '#8B8B9A' }]}>
              一键跟单
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setActiveTab('positions')}
          >
            <View style={[styles.tabIcon, { backgroundColor: activeTab === 'positions' ? '#00F0FF20' : 'transparent' }]}>
              <Ionicons name="wallet" size={22} color={activeTab === 'positions' ? '#00F0FF' : '#8B8B9A'} />
            </View>
            <Text style={[styles.tabText, { color: activeTab === 'positions' ? '#00F0FF' : '#8B8B9A' }]}>
              我的实盘
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setActiveTab('news')}
          >
            <View style={[styles.tabIcon, { backgroundColor: activeTab === 'news' ? '#00F0FF20' : 'transparent' }]}>
              <Ionicons name="newspaper" size={22} color={activeTab === 'news' ? '#00F0FF' : '#8B8B9A'} />
            </View>
            <Text style={[styles.tabText, { color: activeTab === 'news' ? '#00F0FF' : '#8B8B9A' }]}>
              会员速递
            </Text>
          </TouchableOpacity>
        </View>

        {/* 内容 */}
        {activeTab === 'follow' && renderFollowTab()}
        {activeTab === 'positions' && renderPositionsTab()}
        {activeTab === 'news' && renderNewsTab()}

        {/* 跟单确认弹窗 */}
        <Modal visible={modalVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>确认跟单</Text>
              
              <View style={styles.modalInfo}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{selectedTrader?.name?.charAt(0) || 'T'}</Text>
                </View>
                <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600', marginTop: 8 }}>
                  {selectedTrader?.name}
                </Text>
              </View>
              
              <View style={styles.modalStats}>
                <View style={styles.modalStat}>
                  <Text style={styles.modalStatValue}>{selectedTrader?.winRate?.toFixed(1)}%</Text>
                  <Text style={styles.modalStatLabel}>胜率</Text>
                </View>
                <View style={styles.modalStat}>
                  <Text style={styles.modalStatValue}>+{selectedTrader?.returns?.toFixed(1)}%</Text>
                  <Text style={styles.modalStatLabel}>累计收益</Text>
                </View>
                <View style={styles.modalStat}>
                  <Text style={styles.modalStatValue}>{(selectedTrader?.followers || 0).toLocaleString()}</Text>
                  <Text style={styles.modalStatLabel}>跟单人数</Text>
                </View>
              </View>
              
              <View style={styles.warningBox}>
                <Text style={styles.warningText}>
                  跟单交易存在风险，请确保您了解相关风险后再进行操作
                </Text>
              </View>
              
              <View style={styles.modalBtns}>
                <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setModalVisible(false)}>
                  <Text style={styles.cancelBtnText}>取消</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtn, styles.confirmBtn]} onPress={confirmFollow}>
                  <Text style={styles.confirmBtnText}>确认跟单</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </Screen>
  );
}
