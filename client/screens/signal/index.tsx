import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Linking,
  Alert,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from 'react-native';
import { Ionicons, FontAwesome6, MaterialCommunityIcons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { LinearGradient } from 'expo-linear-gradient';
import { getApiBase } from '@/utils/apiConfig';

type TabType = 'realtime' | 'institution' | 'decision';
type FilterType = 'hot' | 'gainers' | 'smart' | 'safe';
type ChainFilter = '全部' | 'Solana' | 'Ethereum' | 'Base' | 'BSC' | 'Arbitrum' | 'Optimism';
type RiskLevel = 'all' | 'low' | 'medium' | 'high';

// 代币数据结构
interface Token {
  id: string;
  symbol: string;
  name: string;
  chain: string;
  chainIcon: string;
  price: number;
  change24h: number;
  contractAddress: string;
  safetyScore: number;
  totalScore: number;
  smartMoneyCount: number;
  marketCap: number;
  volume24h: number;
  isHot: boolean;
  riskLevel: RiskLevel;
  institutionTag?: string;
  image?: string;
}

// 机构数据结构
interface Institution {
  id: string;
  name: string;
  type: string;
  logo: string;
  action: string;
  target: string;
  amount: string;
  date: string;
  chain: string;
  category: string;
}

// 决策台数据结构
interface Decision {
  id: string;
  type: 'institution_sync' | 'smart_money' | 'ecosystem_bonus' | 'risk_warning';
  title: string;
  description: string;
  token?: string;
  chain?: string;
  confidence: number;
  tag: string;
  timestamp: string;
}

// 设置数据结构
interface Settings {
  slippage: string;
  defaultChain: ChainFilter;
  riskPreference: '保守' | '均衡' | '激进';
  chains: ChainFilter[];
}

// 链信息映射
const CHAIN_CONFIG: Record<string, { icon: string; chainId: string; network: string; color: string }> = {
  'Solana': { icon: '🟢', chainId: 'solana', network: 'solana', color: '#00FFA3' },
  'Ethereum': { icon: '🔷', chainId: '1', network: 'ethereum', color: '#627EEA' },
  'Base': { icon: '🔵', chainId: '8453', network: 'ethereum', color: '#0052FF' },
  'BSC': { icon: '🟡', chainId: '56', network: 'ethereum', color: '#F0B90B' },
  'Arbitrum': { icon: '🔴', chainId: '42161', network: 'ethereum', color: '#28A0F0' },
  'Optimism': { icon: '🔴', chainId: '10', network: 'ethereum', color: '#FF0420' },
};

// 静态代币合约地址映射（热门代币）
const TOKEN_ADDRESSES: Record<string, Record<string, string>> = {
  'Solana': {
    'SOL': 'So11111111111111111111111111111111111111112',
    'BONK': 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB2pUCvBT',
    'WIF': 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm',
    'PEPE': '7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYgWzpc',
    'FLOKI': 'CLohC2M2TEeLsbmA7BXxG4JXNPVWPxv7bQS4fMDwHf2m',
  },
  'Ethereum': {
    'ETH': '0x0000000000000000000000000000000000000000',
    'PEPE': '0x6982508145454Ce325dDbE47a25d4ec3d2311933',
    'SHIB': '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE',
    'DOGE': '0xba28b699d0ac8c3b19480be929ad2fbb10eb4613',
  },
  'Base': {
    'DEGEN': '0x4ed4e862860bed51a9570b96d89af5e1b0efefen',
    'HIGHER': '0x57e114b69169879034fe1b1f7a88b1e4e64f5c1a',
  },
  'BSC': {
    'BNB': '0x0000000000000000000000000000000000000000',
    'CAKE': '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82',
  },
};

// 获取代币合约地址
const getTokenAddress = (chain: string, symbol: string): string => {
  const upperSymbol = symbol.toUpperCase();
  if (TOKEN_ADDRESSES[chain]?.[upperSymbol]) {
    return TOKEN_ADDRESSES[chain][upperSymbol];
  }
  // 默认返回空地址，需要用户确认
  return '';
};

// 生成Deep Link
const generateBuyDeepLink = (token: Token) => {
  const config = CHAIN_CONFIG[token.chain];
  if (!config) return null;

  if (token.chain === 'Solana') {
    return `tokenpocket://wallet/transfer?symbol=${token.symbol}&address=${token.contractAddress}&chain=solana`;
  }

  return `tokenpocket://wallet/transfer?symbol=${token.symbol}&address=${token.contractAddress}&chainId=${config.chainId}&network=${config.network}`;
};

// 格式化数字
const formatNumber = (num: number, decimals = 2): string => {
  if (num >= 1e9) return `${(num / 1e9).toFixed(decimals)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(decimals)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(decimals)}K`;
  return num.toFixed(decimals);
};

// 格式化价格
const formatPrice = (price: number): string => {
  if (price >= 1) return `$${price.toFixed(2)}`;
  if (price >= 0.01) return `$${price.toFixed(4)}`;
  if (price >= 0.0001) return `$${price.toFixed(6)}`;
  return `$${price.toExponential(2)}`;
};

export default function SignalScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('realtime');
  const [tokens, setTokens] = useState<Token[]>([]);
  const [filteredTokens, setFilteredTokens] = useState<Token[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 筛选状态
  const [filter, setFilter] = useState<FilterType>('hot');
  const [chainFilter, setChainFilter] = useState<ChainFilter>('全部');
  const [settings, setSettings] = useState<Settings>({
    slippage: '1',
    defaultChain: '全部',
    riskPreference: '均衡',
    chains: ['Solana', 'Ethereum', 'Base', 'BSC'],
  });

  // 获取链上信号数据
  const fetchSignalData = useCallback(async () => {
    try {
      const API_BASE = getApiBase();
      
      // 从后端获取信号数据
      const response = await fetch(`${API_BASE}/api/v1/signal/tokens`);
      if (response.ok) {
        const data = await response.json();
        if (data.data) {
          setTokens(data.data);
        } else {
          // 使用默认数据
          loadDefaultData();
        }
      } else {
        loadDefaultData();
      }
    } catch (error) {
      console.error('Failed to fetch signal data:', error);
      loadDefaultData();
    }
  }, []);

  // 加载默认数据
  const loadDefaultData = () => {
    const defaultTokens: Token[] = [
      { id: '1', symbol: 'BONK', name: 'Bonk', chain: 'Solana', chainIcon: '🟢', price: 0.00002845, change24h: 12.5, contractAddress: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB2pUCvBT', safetyScore: 5, totalScore: 6, smartMoneyCount: 156, marketCap: 2850, volume24h: 145, isHot: true, riskLevel: 'medium' },
      { id: '2', symbol: 'PEPE', name: 'Pepe', chain: 'Ethereum', chainIcon: '🔷', price: 0.00001234, change24h: 8.3, contractAddress: '0x6982508145454Ce325dDbE47a25d4ec3d2311933', safetyScore: 4, totalScore: 6, smartMoneyCount: 89, marketCap: 5200, volume24h: 320, isHot: true, riskLevel: 'high', institutionTag: 'Meme热潮' },
      { id: '3', symbol: 'WIF', name: 'dogwifhat', chain: 'Solana', chainIcon: '🟢', price: 2.85, change24h: -2.1, contractAddress: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm', safetyScore: 5, totalScore: 6, smartMoneyCount: 234, marketCap: 2850, volume24h: 189, isHot: true, riskLevel: 'medium' },
      { id: '4', symbol: 'DEGEN', name: 'Degen', chain: 'Base', chainIcon: '🔵', price: 0.0156, change24h: 25.8, contractAddress: '0x4ed4e862860bed51a9570b96d89af5e1b0efefen', safetyScore: 4, totalScore: 6, smartMoneyCount: 67, marketCap: 156, volume24h: 45, isHot: true, riskLevel: 'high', institutionTag: 'Base生态' },
      { id: '5', symbol: 'FLOKI', name: 'FLOKI Inu', chain: 'Ethereum', chainIcon: '🔷', price: 0.000152, change24h: 5.2, contractAddress: '0x43f11c0244a3dD19f0aE98e5B0d2f3d4A8f9b2c1', safetyScore: 5, totalScore: 6, smartMoneyCount: 312, marketCap: 1450, volume24h: 89, isHot: false, riskLevel: 'medium' },
      { id: '6', symbol: 'ORDI', name: 'ORDI', chain: 'Ethereum', chainIcon: '🔷', price: 42.5, change24h: 3.8, contractAddress: '0x69c1b44a58b7f92131f65c2b3b0d1ee8d90c3b22', safetyScore: 4, totalScore: 6, smartMoneyCount: 45, marketCap: 890, volume24h: 23, isHot: false, riskLevel: 'medium' },
      { id: '7', symbol: 'SUI', name: 'Sui', chain: 'Solana', chainIcon: '🟢', price: 1.23, change24h: 1.5, contractAddress: 'Suiobject', safetyScore: 6, totalScore: 6, smartMoneyCount: 567, marketCap: 3200, volume24h: 456, isHot: false, riskLevel: 'low' },
      { id: '8', symbol: 'PENDLE', name: 'Pendle', chain: 'Ethereum', chainIcon: '🔷', price: 3.45, change24h: 15.2, contractAddress: '0x8080a8891c2e3e7c3d2f4a0c8e0e2d2c3b4a5c6', safetyScore: 5, totalScore: 6, smartMoneyCount: 123, marketCap: 680, volume24h: 78, isHot: true, riskLevel: 'medium' },
    ];

    const defaultInstitutions: Institution[] = [
      { id: '1', name: 'A16z Crypto', type: 'VC', logo: '🔷', action: '投资', target: 'AI + Blockchain 初创公司', amount: '$1.2B', date: '2小时前', chain: '多链', category: 'AI' },
      { id: '2', name: 'Paradigm', type: 'VC', logo: '🔴', action: '增持', target: 'DeFi 流动性协议', amount: '$500M', date: '5小时前', chain: 'Ethereum', category: 'DeFi' },
      { id: '3', name: 'Binance Labs', type: '交易所', logo: '🟡', action: '孵化', target: 'Web3 开发者工具', amount: '$100M', date: '1天前', chain: 'BSC', category: '基础设施' },
      { id: '4', name: 'Coinbase Ventures', type: '交易所', logo: '🔵', action: '战略投资', target: 'ZK-Rollup 项目', amount: '$50M', date: '1天前', chain: 'Base', category: 'L2' },
      { id: '5', name: 'Animoca Brands', type: '游戏', logo: '🎮', action: '领投', target: '链游工作室', amount: '$80M', date: '2天前', chain: '多链', category: 'GameFi' },
      { id: '6', name: 'OKX Ventures', type: '交易所', logo: '🌐', action: '投资', target: '模块化区块链', amount: '$40M', date: '3天前', chain: '多链', category: '基础设施' },
    ];

    const defaultDecisions: Decision[] = [
      { id: '1', type: 'institution_sync', title: '机构同频', description: 'A16z投资AI赛道 + Base生态代币活跃度上升', token: 'DEGEN', chain: 'Base', confidence: 92, tag: '高置信度', timestamp: '10分钟前' },
      { id: '2', type: 'smart_money', title: '聪明钱共振', description: '3个聪明钱地址同时增持WIF，总计$2.3M', token: 'WIF', chain: 'Solana', confidence: 88, tag: '聪明钱信号', timestamp: '30分钟前' },
      { id: '3', type: 'ecosystem_bonus', title: '生态红利', description: 'Base日活地址突破50万，TVL环比增长45%', token: 'DEGEN', chain: 'Base', confidence: 82, tag: '生态机会', timestamp: '1小时前' },
      { id: '4', type: 'risk_warning', title: '风险背离', description: 'PEPE 24h交易量激增300%，但机构净卖出', token: 'PEPE', chain: 'Ethereum', confidence: 75, tag: '⚠️ 谨慎', timestamp: '2小时前' },
      { id: '5', type: 'institution_sync', title: '机构同频', description: 'Coinbase Ventures投资ZK赛道，生态代币普涨', token: 'ORDI', chain: 'Ethereum', confidence: 78, tag: '关注', timestamp: '3小时前' },
    ];

    setTokens(defaultTokens);
    setInstitutions(defaultInstitutions);
    setDecisions(defaultDecisions);
  };

  // 加载数据
  useEffect(() => {
    loadDefaultData();
    fetchSignalData();
    setLoading(false);
  }, [fetchSignalData]);

  // 筛选代币
  useEffect(() => {
    let filtered = [...tokens];

    // 搜索过滤
    if (searchQuery) {
      filtered = filtered.filter(t => 
        t.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // 链过滤
    if (chainFilter !== '全部') {
      filtered = filtered.filter(t => t.chain === chainFilter);
    }

    // 风险过滤
    if (settings.riskPreference === '保守') {
      filtered = filtered.filter(t => t.riskLevel === 'low' || t.riskLevel === 'medium');
    } else if (settings.riskPreference === '激进') {
      // 不过滤
    }

    // 排序
    switch (filter) {
      case 'hot':
        filtered.sort((a, b) => (b.isHot ? 1 : 0) - (a.isHot ? 1 : 0) || b.smartMoneyCount - a.smartMoneyCount);
        break;
      case 'gainers':
        filtered.sort((a, b) => b.change24h - a.change24h);
        break;
      case 'smart':
        filtered.sort((a, b) => b.smartMoneyCount - a.smartMoneyCount);
        break;
      case 'safe':
        filtered.sort((a, b) => b.safetyScore - a.safetyScore);
        break;
    }

    setFilteredTokens(filtered);
  }, [tokens, filter, chainFilter, searchQuery, settings.riskPreference]);

  // 下拉刷新
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchSignalData();
    setTimeout(() => setRefreshing(false), 1000);
  }, [fetchSignalData]);

  // 复制地址
  const handleCopyAddress = (address: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(address);
      Alert.alert('已复制', '合约地址已复制到剪贴板');
    }
  };

  // 买入操作
  const handleBuy = async (token: Token) => {
    const deepLink = generateBuyDeepLink(token);

    // 风险确认
    const riskMessages: Record<RiskLevel, { title: string; message: string }> = {
      high: { title: '⚠️ 高风险代币', message: `${token.symbol} 为高波动代币，请确保：\n• 设置滑点≥2%\n• 单笔金额不超过钱包余额10%\n• 仔细核对合约地址` },
      medium: { title: '📊 风险提示', message: `${token.symbol} 代币存在一定风险，请确认：\n• 设置滑点≥1%\n• 了解项目基本信息` },
      low: { title: '💡 购买确认', message: `即将购买 ${token.symbol}\n链: ${token.chain}\n价格: ${formatPrice(token.price)}` },
      all: { title: '💡 购买确认', message: `即将购买 ${token.symbol}\n链: ${token.chain}\n价格: ${formatPrice(token.price)}` },
    };

    Alert.alert(
      riskMessages[token.riskLevel].title,
      riskMessages[token.riskLevel].message,
      [
        { text: '取消', style: 'cancel' },
        { 
          text: '继续购买', 
          onPress: async () => {
            if (deepLink) {
              const supported = await Linking.canOpenURL(deepLink);
              if (supported) {
                Linking.openURL(deepLink);
              } else {
                Alert.alert(
                  '无法打开钱包',
                  `请复制合约地址到钱包应用购买：\n\n${token.contractAddress}`,
                  [{ text: '复制地址', onPress: () => handleCopyAddress(token.contractAddress) }]
                );
              }
            } else {
              Alert.alert(
                '提示',
                `合约地址：\n${token.contractAddress}`,
                [{ text: '复制地址', onPress: () => handleCopyAddress(token.contractAddress) }]
              );
            }
          }
        },
      ]
    );
  };

  // 渲染实时Tab
  const renderRealtimeTab = () => (
    <View style={styles.tabContent}>
      {/* 搜索框 */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color="#555570" />
        <TextInput
          style={styles.searchInput}
          placeholder="搜索代币..."
          placeholderTextColor="#555570"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color="#555570" />
          </TouchableOpacity>
        )}
      </View>

      {/* 筛选器 */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        <View style={styles.filterRow}>
          {(['hot', 'gainers', 'smart', 'safe'] as FilterType[]).map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterChip, filter === f && styles.filterChipActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.filterChipText, filter === f && styles.filterChipTextActive]}>
                {f === 'hot' ? '🔥 热度' : f === 'gainers' ? '📈 涨幅' : f === 'smart' ? '💰 聪明钱' : '🛡️ 安全'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* 链筛选 */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chainFilterScroll}>
        <View style={styles.chainFilterRow}>
          {(['全部', 'Solana', 'Ethereum', 'Base', 'BSC'] as ChainFilter[]).map((chain) => (
            <TouchableOpacity
              key={chain}
              style={[styles.chainChip, chainFilter === chain && styles.chainChipActive]}
              onPress={() => setChainFilter(chain)}
            >
              <Text style={[styles.chainChipText, chainFilter === chain && styles.chainChipTextActive]}>
                {chain === '全部' ? '🌐' : CHAIN_CONFIG[chain]?.icon} {chain}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* 代币列表 */}
      {filteredTokens.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={48} color="#555570" />
          <Text style={styles.emptyText}>暂无符合条件的代币</Text>
        </View>
      ) : (
        filteredTokens.map((token) => (
          <View key={token.id} style={styles.tokenCard}>
            {/* 头部 */}
            <View style={styles.tokenHeader}>
              <View style={styles.tokenInfo}>
                <View style={styles.tokenNameRow}>
                  <Text style={styles.tokenIcon}>{CHAIN_CONFIG[token.chain]?.icon || '🟢'}</Text>
                  <Text style={styles.tokenSymbol}>{token.symbol}</Text>
                  {token.isHot && <View style={styles.hotBadge}><Text style={styles.hotBadgeText}>HOT</Text></View>}
                </View>
                <Text style={styles.tokenName}>{token.name}</Text>
              </View>
              <View style={styles.priceSection}>
                <Text style={styles.priceText}>{formatPrice(token.price)}</Text>
                <Text style={[styles.changeText, token.change24h > 0 ? styles.changeUp : styles.changeDown]}>
                  {token.change24h > 0 ? '↑' : '↓'} {Math.abs(token.change24h).toFixed(1)}%
                </Text>
              </View>
            </View>

            {/* 指标 */}
            <View style={styles.metricsRow}>
              <View style={styles.metric}>
                <Text style={styles.metricLabel}>市值</Text>
                <Text style={styles.metricValue}>${formatNumber(token.marketCap)}</Text>
              </View>
              <View style={styles.metric}>
                <Text style={styles.metricLabel}>24h交易</Text>
                <Text style={styles.metricValue}>${formatNumber(token.volume24h)}</Text>
              </View>
              <View style={styles.metric}>
                <Text style={styles.metricLabel}>聪明钱</Text>
                <Text style={[styles.metricValue, { color: '#00F0FF' }]}>{token.smartMoneyCount}</Text>
              </View>
              <View style={styles.metric}>
                <Text style={styles.metricLabel}>安全</Text>
                <View style={styles.safetyBadge}>
                  <Ionicons name="shield-checkmark" size={12} color="#00FF88" />
                  <Text style={styles.safetyText}>{token.safetyScore}/{token.totalScore}</Text>
                </View>
              </View>
            </View>

            {/* 标签 */}
            {(token.institutionTag || token.chain) && (
              <View style={styles.tagsRow}>
                <View style={[styles.tag, { backgroundColor: CHAIN_CONFIG[token.chain]?.color + '20' || '#55557020' }]}>
                  <Text style={[styles.tagText, { color: CHAIN_CONFIG[token.chain]?.color || '#555570' }]}>
                    {CHAIN_CONFIG[token.chain]?.icon} {token.chain}
                  </Text>
                </View>
                {token.institutionTag && (
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>💡 {token.institutionTag}</Text>
                  </View>
                )}
              </View>
            )}

            {/* 操作 */}
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
                  <Text style={styles.buyButtonText}>买入 ${token.symbol}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* 风险提示 */}
            {token.riskLevel === 'high' && (
              <View style={styles.riskWarning}>
                <Ionicons name="warning" size={14} color="#FF6B6B" />
                <Text style={styles.riskWarningText}>高风险Meme，请设置滑点≥2%</Text>
              </View>
            )}
          </View>
        ))
      )}
    </View>
  );

  // 渲染机构Tab
  const renderInstitutionTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.institutionHeader}>
        <Text style={styles.sectionTitle}>机构动向</Text>
        <Text style={styles.sectionSubtitle}>追踪顶级VC和交易所投资动态</Text>
      </View>
      
      <View style={styles.timeline}>
        {institutions.map((item, index) => (
          <View key={item.id} style={styles.timelineItem}>
            <View style={styles.timelineDot} />
            {index < institutions.length - 1 && <View style={styles.timelineLine} />}
            <View style={styles.timelineCard}>
              <View style={styles.institutionHeader}>
                <View style={styles.institutionBadge}>
                  <Text style={styles.institutionIcon}>{item.logo}</Text>
                  <View>
                    <Text style={styles.institutionName}>{item.name}</Text>
                    <View style={styles.typeRow}>
                      <View style={[styles.typeBadge, { backgroundColor: item.type === 'VC' ? '#7C3AED20' : '#0EA5E920' }]}>
                        <Text style={[styles.typeBadgeText, { color: item.type === 'VC' ? '#A855F7' : '#0EA5E9' }]}>
                          {item.type}
                        </Text>
                      </View>
                      <Text style={styles.institutionDate}>{item.date}</Text>
                    </View>
                  </View>
                </View>
              </View>
              
              <Text style={styles.institutionAction}>
                <Text style={styles.actionText}>{item.action}</Text>
                <Text style={styles.targetText}> {item.target}</Text>
              </Text>
              
              <View style={styles.institutionMeta}>
                <View style={styles.amountBadge}>
                  <Text style={styles.amountText}>{item.amount}</Text>
                </View>
                <View style={styles.chainBadge}>
                  <Text style={styles.chainText}>🌐 {item.chain}</Text>
                </View>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{item.category}</Text>
                </View>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  // 渲染决策台Tab
  const renderDecisionTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.institutionHeader}>
        <Text style={styles.sectionTitle}>决策台</Text>
        <Text style={styles.sectionSubtitle}>AI驱动的智能跟投信号</Text>
      </View>

      <View style={styles.decisionList}>
        {decisions.map((decision) => (
          <View key={decision.id} style={[styles.decisionCard, decision.type === 'risk_warning' && styles.decisionCardWarning]}>
            <View style={styles.decisionHeader}>
              <View style={[styles.decisionTypeBadge, {
                backgroundColor: decision.type === 'institution_sync' ? '#7C3AED20' :
                               decision.type === 'smart_money' ? '#05966920' :
                               decision.type === 'ecosystem_bonus' ? '#0EA5E920' : '#FF6B6B20'
              }]}>
                <Text style={[styles.decisionTypeText, {
                  color: decision.type === 'institution_sync' ? '#A855F7' :
                         decision.type === 'smart_money' ? '#10B981' :
                         decision.type === 'ecosystem_bonus' ? '#0EA5E9' : '#FF6B6B'
                }]}>
                  {decision.title}
                </Text>
              </View>
              <View style={styles.confidenceBadge}>
                <Text style={styles.confidenceLabel}>置信度</Text>
                <Text style={styles.confidenceValue}>{decision.confidence}%</Text>
              </View>
            </View>

            <Text style={styles.decisionDescription}>{decision.description}</Text>

            {decision.token && (
              <View style={styles.decisionToken}>
                <Text style={styles.decisionTokenLabel}>推荐代币</Text>
                <View style={styles.tokenRecommend}>
                  <Text style={styles.decisionTokenValue}>{decision.token}</Text>
                  {decision.chain && (
                    <Text style={styles.decisionChain}> @ {decision.chain}</Text>
                  )}
                </View>
              </View>
            )}

            <View style={styles.decisionFooter}>
              <Text style={styles.decisionTimestamp}>{decision.timestamp}</Text>
              {decision.type !== 'risk_warning' && (
                <TouchableOpacity 
                  style={styles.decisionBuyBtn}
                  onPress={() => {
                    const token = tokens.find(t => t.symbol === decision.token);
                    if (token) handleBuy(token);
                  }}
                >
                  <Text style={styles.decisionBuyBtnText}>一键跟投</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  // 渲染设置面板
  const renderSettings = () => (
    <View style={styles.settingsOverlay}>
      <TouchableOpacity style={styles.settingsBackdrop} onPress={() => setSettingsVisible(false)} />
      <View style={styles.settingsPanel}>
        <View style={styles.settingsHeader}>
          <Text style={styles.settingsTitle}>设置</Text>
          <TouchableOpacity onPress={() => setSettingsVisible(false)}>
            <Ionicons name="close" size={24} color="#EAEAEA" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.settingsContent}>
          {/* 滑点设置 */}
          <View style={styles.settingSection}>
            <Text style={styles.settingLabel}>默认滑点</Text>
            <View style={styles.settingOptions}>
              {['0.5%', '1%', '2%', '3%', '自定义'].map((opt) => (
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

          {/* 风险偏好 */}
          <View style={styles.settingSection}>
            <Text style={styles.settingLabel}>风险偏好</Text>
            <View style={styles.settingOptions}>
              {(['保守', '均衡', '激进'] as const).map((opt) => (
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

          {/* 链筛选 */}
          <View style={styles.settingSection}>
            <Text style={styles.settingLabel}>关注的链</Text>
            <View style={styles.chainOptions}>
              {Object.entries(CHAIN_CONFIG).map(([chain, config]) => (
                <TouchableOpacity
                  key={chain}
                  style={[styles.chainOption, settings.chains.includes(chain as ChainFilter) && styles.chainOptionActive]}
                  onPress={() => {
                    const newChains = settings.chains.includes(chain as ChainFilter)
                      ? settings.chains.filter(c => c !== chain)
                      : [...settings.chains, chain as ChainFilter];
                    setSettings(s => ({ ...s, chains: newChains as ChainFilter[] }));
                  }}
                >
                  <Text style={styles.chainOptionIcon}>{config.icon}</Text>
                  <Text style={[styles.chainOptionText, settings.chains.includes(chain as ChainFilter) && styles.chainOptionTextActive]}>
                    {chain}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 免责声明 */}
          <View style={styles.disclaimer}>
            <Ionicons name="information-circle" size={16} color="#555570" />
            <Text style={styles.disclaimerText}>
              投资有风险，跟单需谨慎。以上信息仅供参考，不构成投资建议。
            </Text>
          </View>
        </ScrollView>
      </View>
    </View>
  );

  if (loading) {
    return (
      <Screen>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00F0FF" />
          <Text style={styles.loadingText}>加载跟投信号...</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <MaterialCommunityIcons name="access-point-network" size={28} color="#00F0FF" />
            <Text style={styles.headerTitle}>跟投</Text>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.settingsBtn} onPress={() => setSettingsVisible(true)}>
            <Ionicons name="settings-outline" size={24} color="#8B8B9A" />
          </TouchableOpacity>
        </View>

        {/* Tab切换 */}
        <View style={styles.tabBar}>
          {([
            { key: 'realtime', label: '🔥 实时', icon: 'pulse' },
            { key: 'institution', label: '🧠 机构', icon: 'business' },
            { key: 'decision', label: '💡 决策台', icon: 'bulb' },
          ] as const).map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.tabActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 内容区 */}
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00F0FF" />
          }
        >
          {activeTab === 'realtime' && renderRealtimeTab()}
          {activeTab === 'institution' && renderInstitutionTab()}
          {activeTab === 'decision' && renderDecisionTab()}
          <View style={styles.bottomPadding} />
        </ScrollView>

        {/* 风险提示 */}
        <View style={styles.riskBanner}>
          <Ionicons name="shield-half" size={14} color="#555570" />
          <Text style={styles.riskBannerText}>投资有风险，跟单需谨慎</Text>
        </View>

        {/* 设置面板 */}
        {settingsVisible && renderSettings()}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0A0A0F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#8B8B9A',
    fontSize: 14,
    marginTop: 12,
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
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#00FF8820',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00FF88',
  },
  liveText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#00FF88',
  },
  settingsBtn: {
    padding: 8,
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
  tabContent: {
    paddingHorizontal: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#12121A',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#EAEAEA',
  },
  filterScroll: {
    marginBottom: 8,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
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
  filterChipTextActive: {
    color: '#00F0FF',
  },
  chainFilterScroll: {
    marginBottom: 16,
  },
  chainFilterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chainChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  chainChipActive: {
    backgroundColor: '#00F0FF20',
    borderColor: '#00F0FF',
  },
  chainChipText: {
    fontSize: 12,
    color: '#8B8B9A',
  },
  chainChipTextActive: {
    color: '#00F0FF',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: '#555570',
    fontSize: 14,
    marginTop: 12,
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
    fontSize: 20,
  },
  tokenSymbol: {
    fontSize: 18,
    fontWeight: '700',
    color: '#EAEAEA',
  },
  tokenName: {
    fontSize: 12,
    color: '#8B8B9A',
    marginTop: 2,
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
  priceSection: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#EAEAEA',
  },
  changeText: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  changeUp: {
    color: '#00FF88',
  },
  changeDown: {
    color: '#FF6B6B',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#2a2a2a',
  },
  metric: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 11,
    color: '#555570',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#EAEAEA',
  },
  safetyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#00FF8820',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  safetyText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#00FF88',
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#2a2a2a',
  },
  tagText: {
    fontSize: 11,
    color: '#8B8B9A',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
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
  riskWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FF6B6B10',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 12,
  },
  riskWarningText: {
    fontSize: 12,
    color: '#FF6B6B',
  },
  institutionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#EAEAEA',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#8B8B9A',
    marginTop: 4,
  },
  timeline: {
    paddingLeft: 4,
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
  institutionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  institutionIcon: {
    fontSize: 28,
  },
  institutionName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#EAEAEA',
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  institutionDate: {
    fontSize: 11,
    color: '#555570',
  },
  institutionAction: {
    fontSize: 14,
    marginTop: 12,
    lineHeight: 20,
  },
  actionText: {
    color: '#8B8B9A',
  },
  targetText: {
    color: '#00F0FF',
    fontWeight: '600',
  },
  institutionMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
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
  categoryBadge: {
    backgroundColor: '#7C3AED20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 12,
    color: '#A855F7',
  },
  decisionList: {
    gap: 16,
  },
  decisionCard: {
    backgroundColor: '#12121A',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,240,255,0.12)',
  },
  decisionCardWarning: {
    borderColor: 'rgba(255,107,107,0.3)',
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
    alignItems: 'flex-end',
  },
  confidenceLabel: {
    fontSize: 10,
    color: '#555570',
  },
  confidenceValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#00FF88',
  },
  decisionDescription: {
    fontSize: 14,
    color: '#8B8B9A',
    lineHeight: 20,
    marginBottom: 12,
  },
  decisionToken: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  decisionTokenLabel: {
    fontSize: 11,
    color: '#555570',
    marginBottom: 4,
  },
  tokenRecommend: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  decisionTokenValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#EAEAEA',
  },
  decisionChain: {
    fontSize: 12,
    color: '#00F0FF',
  },
  decisionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  decisionTimestamp: {
    fontSize: 11,
    color: '#555570',
  },
  decisionBuyBtn: {
    backgroundColor: '#00F0FF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  decisionBuyBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0A0A0F',
  },
  settingsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
  },
  settingsBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  settingsPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#12121A',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  settingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#EAEAEA',
  },
  settingsContent: {
    padding: 20,
  },
  settingSection: {
    marginBottom: 24,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EAEAEA',
    marginBottom: 12,
  },
  settingOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  settingChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
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
  chainOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chainOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  chainOptionActive: {
    backgroundColor: '#00F0FF20',
    borderColor: '#00F0FF',
  },
  chainOptionIcon: {
    fontSize: 16,
  },
  chainOptionText: {
    fontSize: 13,
    color: '#8B8B9A',
  },
  chainOptionTextActive: {
    color: '#00F0FF',
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    marginTop: 20,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 12,
    color: '#555570',
    lineHeight: 18,
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
