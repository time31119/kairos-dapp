import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons, FontAwesome6, MaterialCommunityIcons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { LinearGradient } from 'expo-linear-gradient';
import { getApiBase } from '@/utils/apiConfig';

type TabType = 'realtime' | 'institution' | 'decision';

// 模拟代币数据
const MOCK_TOKENS = [
  {
    id: '1',
    symbol: 'PEPE 2.0',
    name: 'Pepe 2.0',
    chain: 'Solana',
    chainIcon: '🟢',
    price: 0.00001234,
    change24h: 127.5,
    contractAddress: 'So11111111111111111111111111111111111111112',
    safetyScore: 5,
    totalScore: 6,
    smartMoneyCount: 12,
    marketCap: 45,
    volume24h: 2.3,
    isHot: true,
    riskLevel: 'high',
  },
  {
    id: '2',
    symbol: 'VIRTUAL',
    name: 'Virtual Protocol',
    chain: 'Base',
    chainIcon: '🔵',
    price: 0.8923,
    change24h: 43.2,
    contractAddress: '0x0f9699B039eF036B0d2d5CeDa2A2C7C0e2C6b8D3',
    safetyScore: 6,
    totalScore: 6,
    smartMoneyCount: 28,
    marketCap: 890,
    volume24h: 45.2,
    isHot: false,
    riskLevel: 'medium',
    institutionTag: 'A16z领投',
  },
  {
    id: '3',
    symbol: 'FLOKI',
    name: 'FLOKI Inu',
    chain: 'Ethereum',
    chainIcon: '🔷',
    price: 0.0001523,
    change24h: 23.8,
    contractAddress: '0x43f11c0244a3dD19f0aE98e5B0d2f3d4A8f9b2c1',
    safetyScore: 5,
    totalScore: 6,
    smartMoneyCount: 45,
    marketCap: 1450,
    volume24h: 89.5,
    isHot: true,
    riskLevel: 'medium',
  },
  {
    id: '4',
    symbol: 'SUI',
    name: 'Sui',
    chain: 'Sui',
    chainIcon: '🟡',
    price: 1.23,
    change24h: 8.5,
    contractAddress: '0x2::sui::SUI',
    safetyScore: 6,
    totalScore: 6,
    smartMoneyCount: 67,
    marketCap: 2100,
    volume24h: 320,
    isHot: false,
    riskLevel: 'low',
  },
];

// 机构数据
const MOCK_INSTITUTIONS = [
  {
    id: '1',
    name: 'A16z',
    type: 'VC',
    action: '投资',
    target: 'AI Agent 赛道',
    amount: '$1.2B',
    date: '2024-01-15',
    chain: '多链',
  },
  {
    id: '2',
    name: 'Paradigm',
    type: 'VC',
    action: '增持',
    target: 'Base 生态',
    amount: '$500M',
    date: '2024-01-14',
    chain: 'Base',
  },
  {
    id: '3',
    name: 'Binance Labs',
    type: '交易所',
    action: '孵化',
    target: 'DeFi 创新项目',
    amount: '$100M',
    date: '2024-01-13',
    chain: 'BSC',
  },
];

// 决策台数据
const MOCK_DECISIONS = [
  {
    id: '1',
    type: 'institution_sync',
    title: '机构同频',
    description: 'A16z投资AI赛道 + 链上活跃项目出现',
    token: 'VIRTUAL',
    chain: 'Base',
    confidence: 92,
    tag: '高置信度',
  },
  {
    id: '2',
    type: 'smart_money',
    title: '聪明钱共振',
    description: '3个知名地址同时买入同一代币',
    token: 'PEPE 2.0',
    chain: 'Solana',
    confidence: 85,
    tag: '聪明钱信号',
  },
  {
    id: '3',
    type: 'ecosystem_bonus',
    title: '生态红利',
    description: 'Base基金推出激励计划 + 链上TVL增长',
    token: 'DEGEN',
    chain: 'Base',
    confidence: 78,
    tag: '生态机会',
  },
];

// 生成Deep Link
const generateBuyDeepLink = (token: typeof MOCK_TOKENS[0]) => {
  const chainIdMap: Record<string, string> = {
    'Ethereum': '1',
    'BSC': '56',
    'Base': '8453',
    'Solana': 'solana',
    'Sui': 'sui',
  };

  const networkMap: Record<string, string> = {
    'Ethereum': 'ethereum',
    'BSC': 'ethereum',
    'Base': 'ethereum',
    'Solana': 'solana',
    'Sui': 'sui',
  };

  const chainId = chainIdMap[token.chain] || '1';
  const network = networkMap[token.chain] || 'ethereum';

  // TP钱包 Deep Link 格式
  if (token.chain === 'Solana') {
    return `tokenpocket://wallet/transfer?symbol=${token.symbol}&address=${token.contractAddress}&chain=solana`;
  }

  return `tokenpocket://wallet/transfer?symbol=${token.symbol}&address=${token.contractAddress}&chainId=${chainId}&network=${network}`;
};

export default function SignalScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('realtime');
  const [tokens, setTokens] = useState(MOCK_TOKENS);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [settings, setSettings] = useState({
    slippage: '1',
    defaultChain: '全部',
    riskPreference: '均衡',
  });

  const handleBuy = async (token: typeof MOCK_TOKENS[0]) => {
    try {
      const deepLink = generateBuyDeepLink(token);
      
      // 风险提示
      if (token.riskLevel === 'high') {
        Alert.alert(
          '⚠️ 高风险代币',
          `${token.symbol} 为高风险Meme币，请确保设置滑点≥1%，且单笔金额不超过钱包余额的10%。`,
          [
            { text: '取消', style: 'cancel' },
            { 
              text: '继续买入', 
              onPress: () => Linking.openURL(deepLink)
            },
          ]
        );
      } else {
        const supported = await Linking.canOpenURL(deepLink);
        if (supported) {
          Linking.openURL(deepLink);
        } else {
          // 降级：复制合约地址
          Alert.alert(
            '提示',
            `请复制合约地址到TP钱包进行购买：\n\n${token.contractAddress}`,
            [{ text: '复制地址', onPress: () => {
              if (navigator.clipboard) {
                navigator.clipboard.writeText(token.contractAddress);
              }
            }}]
          );
        }
      }
    } catch (error) {
      console.error('Deep Link error:', error);
      Alert.alert('错误', '无法打开TP钱包，请确保已安装TP钱包');
    }
  };

  const renderRealtimeTab = () => (
    <View style={styles.tabContent}>
      {/* 筛选器 */}
      <View style={styles.filterRow}>
        <TouchableOpacity style={[styles.filterChip, styles.filterChipActive]}>
          <Text style={styles.filterChipText}>🔥 热度</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterChip}>
          <Text style={styles.filterChipText}>📈 涨幅</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterChip}>
          <Text style={styles.filterChipText}>💰 聪明钱</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterChip}>
          <Text style={styles.filterChipText}>🛡️ 安全</Text>
        </TouchableOpacity>
      </View>

      {/* 代币卡片列表 */}
      {tokens.map((token) => (
        <TouchableOpacity key={token.id} style={styles.tokenCard} activeOpacity={0.9}>
          {/* 卡片头部 */}
          <View style={styles.tokenHeader}>
            <View style={styles.tokenInfo}>
              <View style={styles.tokenNameRow}>
                <Text style={styles.tokenIcon}>{token.chainIcon}</Text>
                <Text style={styles.tokenSymbol}>{token.symbol}</Text>
                {token.isHot && (
                  <View style={styles.hotBadge}>
                    <Text style={styles.hotBadgeText}>HOT</Text>
                  </View>
                )}
              </View>
              <View style={styles.tokenMeta}>
                <Text style={styles.tokenChain}>{token.chain}</Text>
                {token.institutionTag && (
                  <View style={[styles.tagBadge, { backgroundColor: '#7C3AED20' }]}>
                    <Text style={[styles.tagBadgeText, { color: '#A855F7' }]}>
                      💡 {token.institutionTag}
                    </Text>
                  </View>
                )}
              </View>
            </View>
            <View style={styles.scoreContainer}>
              <Ionicons name="shield-checkmark" size={16} color="#00FF88" />
              <Text style={styles.scoreText}>{token.safetyScore}/{token.totalScore}</Text>
            </View>
          </View>

          {/* 价格信息 */}
          <View style={styles.priceRow}>
            <View>
              <Text style={styles.priceLabel}>24h</Text>
              <Text style={[styles.priceValue, token.change24h > 0 ? styles.priceUp : styles.priceDown]}>
                {token.change24h > 0 ? '+' : ''}{token.change24h.toFixed(1)}%
              </Text>
            </View>
            <View style={styles.priceDivider} />
            <View>
              <Text style={styles.priceLabel}>市值</Text>
              <Text style={styles.priceValue}>${token.marketCap}M</Text>
            </View>
            <View style={styles.priceDivider} />
            <View>
              <Text style={styles.priceLabel}>聪明钱</Text>
              <Text style={styles.priceValue}>{token.smartMoneyCount}人</Text>
            </View>
          </View>

          {/* 合约地址 */}
          <View style={styles.contractRow}>
            <Text style={styles.contractLabel}>合约</Text>
            <Text style={styles.contractAddress} numberOfLines={1}>
              {token.contractAddress.slice(0, 8)}...{token.contractAddress.slice(-6)}
            </Text>
            <TouchableOpacity 
              style={styles.copyBtn}
              onPress={() => {
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(token.contractAddress);
                }
              }}
            >
              <Ionicons name="copy-outline" size={14} color="#00F0FF" />
            </TouchableOpacity>
          </View>

          {/* 操作按钮 */}
          <View style={styles.actionRow}>
            <TouchableOpacity 
              style={styles.buyButton}
              onPress={() => handleBuy(token)}
            >
              <LinearGradient
                colors={['#00F0FF', '#00C4CC']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buyButtonGradient}
              >
                <Text style={styles.buyButtonText}>买入</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={styles.detailButton}>
              <Text style={styles.detailButtonText}>查看详情</Text>
            </TouchableOpacity>
          </View>

          {/* 风险提示 */}
          {token.riskLevel === 'high' && (
            <View style={styles.riskWarning}>
              <Ionicons name="warning" size={14} color="#FF6B6B" />
              <Text style={styles.riskWarningText}>
                高风险Meme，请设置滑点≥1%
              </Text>
            </View>
          )}

          {/* 推荐时间 */}
          <View style={styles.recommendFooter}>
            <Text style={styles.recommendTime}>推荐时间: 10分钟前</Text>
            <Text style={styles.recommendSource}>来源: Pump.fun</Text>
          </View>
        </TouchableOpacity>
      ))}

      <View style={styles.bottomPadding} />
    </View>
  );

  const renderInstitutionTab = () => (
    <View style={styles.tabContent}>
      {/* 机构列表 */}
      <View style={styles.timeline}>
        {MOCK_INSTITUTIONS.map((item, index) => (
          <View key={item.id} style={styles.timelineItem}>
            <View style={styles.timelineDot} />
            {index < MOCK_INSTITUTIONS.length - 1 && (
              <View style={styles.timelineLine} />
            )}
            <View style={styles.timelineCard}>
              <View style={styles.timelineHeader}>
                <View style={styles.institutionBadge}>
                  <Text style={styles.institutionName}>{item.name}</Text>
                  <View style={styles.typeBadge}>
                    <Text style={styles.typeBadgeText}>{item.type}</Text>
                  </View>
                </View>
                <Text style={styles.timelineDate}>{item.date}</Text>
              </View>
              <Text style={styles.timelineAction}>
                {item.action} <Text style={styles.timelineTarget}>{item.target}</Text>
              </Text>
              <View style={styles.timelineMeta}>
                <View style={styles.amountBadge}>
                  <Text style={styles.amountText}>{item.amount}</Text>
                </View>
                <View style={styles.chainBadge}>
                  <Text style={styles.chainText}>{item.chain}</Text>
                </View>
              </View>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.bottomPadding} />
    </View>
  );

  const renderDecisionTab = () => (
    <View style={styles.tabContent}>
      {/* 决策列表 */}
      {MOCK_DECISIONS.map((decision) => (
        <TouchableOpacity key={decision.id} style={styles.decisionCard} activeOpacity={0.9}>
          <View style={styles.decisionHeader}>
            <View style={[styles.decisionTypeBadge, {
              backgroundColor: decision.type === 'institution_sync' ? '#7C3AED20' :
                              decision.type === 'smart_money' ? '#05966920' : '#0EA5E920'
            }]}>
              <Text style={[styles.decisionTypeText, {
                color: decision.type === 'institution_sync' ? '#A855F7' :
                       decision.type === 'smart_money' ? '#10B981' : '#0EA5E9'
              }]}>
                {decision.title}
              </Text>
            </View>
            <View style={styles.confidenceBadge}>
              <Text style={styles.confidenceText}>{decision.confidence}%</Text>
            </View>
          </View>
          
          <Text style={styles.decisionDescription}>{decision.description}</Text>
          
          <View style={styles.decisionToken}>
            <Text style={styles.decisionTokenLabel}>推荐代币</Text>
            <Text style={styles.decisionTokenValue}>{decision.token}</Text>
            <Text style={styles.decisionChain}>{decision.chain}</Text>
          </View>

          <View style={styles.decisionActions}>
            <TouchableOpacity 
              style={styles.decisionBuyBtn}
              onPress={() => {
                const token = MOCK_TOKENS.find(t => t.symbol === decision.token) || MOCK_TOKENS[0];
                handleBuy(token);
              }}
            >
              <Text style={styles.decisionBuyBtnText}>一键跟投</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      ))}

      <View style={styles.bottomPadding} />
    </View>
  );

  return (
    <Screen>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <MaterialCommunityIcons name="access-point-network" size={28} color="#00F0FF" />
            <Text style={styles.headerTitle}>跟投</Text>
          </View>
          <TouchableOpacity 
            style={styles.settingsBtn}
            onPress={() => setSettingsVisible(!settingsVisible)}
          >
            <Ionicons 
              name={settingsVisible ? 'close' : 'settings-outline'} 
              size={24} 
              color="#8B8B9A" 
            />
          </TouchableOpacity>
        </View>

        {/* 设置面板 */}
        {settingsVisible && (
          <View style={styles.settingsPanel}>
            <Text style={styles.settingsTitle}>设置</Text>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>默认滑点</Text>
              <View style={styles.settingOptions}>
                {['0.5%', '1%', '2%', '自定义'].map(opt => (
                  <TouchableOpacity 
                    key={opt}
                    style={[styles.settingChip, settings.slippage === opt && styles.settingChipActive]}
                    onPress={() => setSettings(s => ({ ...s, slippage: opt }))}
                  >
                    <Text style={[styles.settingChipText, settings.slippage === opt && styles.settingChipTextActive]}>
                      {opt}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>风险偏好</Text>
              <View style={styles.settingOptions}>
                {['保守', '均衡', '激进'].map(opt => (
                  <TouchableOpacity 
                    key={opt}
                    style={[styles.settingChip, settings.riskPreference === opt && styles.settingChipActive]}
                    onPress={() => setSettings(s => ({ ...s, riskPreference: opt }))}
                  >
                    <Text style={[styles.settingChipText, settings.riskPreference === opt && styles.settingChipTextActive]}>
                      {opt}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Tab切换 */}
        <View style={styles.tabBar}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'realtime' && styles.tabActive]}
            onPress={() => setActiveTab('realtime')}
          >
            <Text style={[styles.tabText, activeTab === 'realtime' && styles.tabTextActive]}>
              🔥 实时
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'institution' && styles.tabActive]}
            onPress={() => setActiveTab('institution')}
          >
            <Text style={[styles.tabText, activeTab === 'institution' && styles.tabTextActive]}>
              🧠 机构
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'decision' && styles.tabActive]}
            onPress={() => setActiveTab('decision')}
          >
            <Text style={[styles.tabText, activeTab === 'decision' && styles.tabTextActive]}>
              💡 决策台
            </Text>
          </TouchableOpacity>
        </View>

        {/* 内容区 */}
        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {activeTab === 'realtime' && renderRealtimeTab()}
          {activeTab === 'institution' && renderInstitutionTab()}
          {activeTab === 'decision' && renderDecisionTab()}
        </ScrollView>

        {/* 风险提示 */}
        <View style={styles.riskBanner}>
          <Ionicons name="shield-half" size={16} color="#FF6B6B" />
          <Text style={styles.riskBannerText}>
            投资有风险，跟单需谨慎，本内容仅供参考
          </Text>
        </View>
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#EAEAEA',
  },
  settingsBtn: {
    padding: 8,
  },
  settingsPanel: {
    backgroundColor: '#12121A',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,240,255,0.15)',
  },
  settingsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EAEAEA',
    marginBottom: 16,
  },
  settingItem: {
    marginBottom: 16,
  },
  settingLabel: {
    fontSize: 13,
    color: '#8B8B9A',
    marginBottom: 8,
  },
  settingOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  settingChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  settingChipActive: {
    backgroundColor: '#00F0FF20',
    borderColor: '#00F0FF',
  },
  settingChipText: {
    fontSize: 13,
    color: '#8B8B9A',
  },
  settingChipTextActive: {
    color: '#00F0FF',
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#12121A',
  },
  tabActive: {
    backgroundColor: '#00F0FF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B8B9A',
  },
  tabTextActive: {
    color: '#0A0A0F',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  tabContent: {
    paddingHorizontal: 16,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#12121A',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  filterChipActive: {
    backgroundColor: '#00F0FF20',
    borderColor: '#00F0FF',
  },
  filterChipText: {
    fontSize: 13,
    color: '#8B8B9A',
  },
  tokenCard: {
    backgroundColor: '#12121A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,240,255,0.12)',
  },
  tokenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tokenInfo: {
    flex: 1,
  },
  tokenNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tokenIcon: {
    fontSize: 18,
  },
  tokenSymbol: {
    fontSize: 18,
    fontWeight: '700',
    color: '#EAEAEA',
  },
  hotBadge: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  hotBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFF',
  },
  tokenMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  tokenChain: {
    fontSize: 12,
    color: '#8B8B9A',
  },
  tagBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagBadgeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#00FF8820',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  scoreText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#00FF88',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 11,
    color: '#8B8B9A',
    marginBottom: 2,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#EAEAEA',
  },
  priceUp: {
    color: '#00FF88',
  },
  priceDown: {
    color: '#FF6B6B',
  },
  priceDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#2a2a2a',
    marginHorizontal: 16,
  },
  contractRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
    marginBottom: 12,
  },
  contractLabel: {
    fontSize: 11,
    color: '#8B8B9A',
    marginRight: 8,
  },
  contractAddress: {
    flex: 1,
    fontSize: 12,
    color: '#00F0FF',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  copyBtn: {
    padding: 4,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  buyButton: {
    flex: 1,
  },
  buyButtonGradient: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buyButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0A0A0F',
  },
  detailButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  detailButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#EAEAEA',
  },
  riskWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FF6B6B10',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginBottom: 8,
  },
  riskWarningText: {
    fontSize: 12,
    color: '#FF6B6B',
  },
  recommendFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  recommendTime: {
    fontSize: 11,
    color: '#555570',
  },
  recommendSource: {
    fontSize: 11,
    color: '#555570',
  },
  timeline: {
    paddingLeft: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#00F0FF',
    marginTop: 16,
    marginRight: 16,
    zIndex: 1,
  },
  timelineLine: {
    position: 'absolute',
    left: 13,
    top: 30,
    width: 2,
    height: '100%',
    backgroundColor: 'rgba(0,240,255,0.2)',
  },
  timelineCard: {
    flex: 1,
    backgroundColor: '#12121A',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,240,255,0.12)',
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  institutionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  institutionName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#EAEAEA',
  },
  typeBadge: {
    backgroundColor: '#7C3AED20',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#A855F7',
  },
  timelineDate: {
    fontSize: 11,
    color: '#555570',
  },
  timelineAction: {
    fontSize: 14,
    color: '#8B8B9A',
    marginBottom: 12,
  },
  timelineTarget: {
    color: '#00F0FF',
    fontWeight: '600',
  },
  timelineMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  amountBadge: {
    backgroundColor: '#00FF8820',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  amountText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#00FF88',
  },
  chainBadge: {
    backgroundColor: '#0EA5E920',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  chainText: {
    fontSize: 12,
    color: '#0EA5E9',
  },
  decisionCard: {
    backgroundColor: '#12121A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,240,255,0.12)',
  },
  decisionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  decisionTypeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  decisionTypeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  confidenceBadge: {
    backgroundColor: '#00FF8820',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  confidenceText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#00FF88',
  },
  decisionDescription: {
    fontSize: 14,
    color: '#8B8B9A',
    marginBottom: 16,
    lineHeight: 20,
  },
  decisionToken: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  decisionTokenLabel: {
    fontSize: 12,
    color: '#8B8B9A',
  },
  decisionTokenValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#EAEAEA',
    flex: 1,
  },
  decisionChain: {
    fontSize: 12,
    color: '#00F0FF',
  },
  decisionActions: {
    flexDirection: 'row',
    gap: 12,
  },
  decisionBuyBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#00F0FF',
  },
  decisionBuyBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0A0A0F',
  },
  riskBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    backgroundColor: '#12121A',
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
  },
  riskBannerText: {
    fontSize: 12,
    color: '#555570',
  },
  bottomPadding: {
    height: 100,
  },
});
