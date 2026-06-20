import React, { useState, useCallback, useEffect } from 'react';
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
  Modal,
} from 'react-native';
import { Ionicons, FontAwesome6, MaterialCommunityIcons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';

type TabType = 'realtime' | 'institution' | 'decision';
type FilterType = 'hot' | 'gainers' | 'smart' | 'volume';
type ChainFilter = '全部' | 'Solana' | 'Ethereum' | 'Base' | 'BSC';

interface Token {
  id: string;
  symbol: string;
  name: string;
  chain: string;
  price: number;
  change1h: number;
  change24h: number;
  change7d: number;
  contractAddress: string;
  safetyScore: number;
  totalScore: number;
  smartMoneyCount: number;
  marketCap: number;
  volume24h: number;
  isHot: boolean;
  riskLevel: 'low' | 'medium' | 'high';
  tag?: string;
  liquidity?: number;
  holders?: number;
  image?: string;
}

interface Institution {
  id: string;
  name: string;
  type: 'VC' | '交易所' | '项目方';
  logo: string;
  action: string;
  target: string;
  amount: string;
  date: string;
  chain: string;
  category: string;
  description: string;
}

interface Decision {
  id: string;
  type: 'institution_sync' | 'smart_money' | 'ecosystem_bonus' | 'risk_warning';
  title: string;
  description: string;
  token?: Token;
  chain?: string;
  confidence: number;
  tag: string;
  timestamp: string;
  reasons: string[];
}

const CHAIN_CONFIG: Record<string, { icon: string; color: string; explorer: string }> = {
  'Solana': { icon: 'SOL', color: '#00FFA3', explorer: 'https://solscan.io' },
  'Ethereum': { icon: 'ETH', color: '#627EEA', explorer: 'https://etherscan.io' },
  'Base': { icon: 'BASE', color: '#0052FF', explorer: 'https://basescan.org' },
  'BSC': { icon: 'BNB', color: '#F0B90B', explorer: 'https://bscscan.com' },
};

const DEFAULT_TOKENS: Token[] = [
  { id: '1', symbol: 'BONK', name: 'Bonk', chain: 'Solana', price: 0.00002845, change1h: 2.1, change24h: 12.5, change7d: 45.2, contractAddress: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB2pUCvBT', safetyScore: 5, totalScore: 6, smartMoneyCount: 156, marketCap: 2850000000, volume24h: 145000000, isHot: true, riskLevel: 'medium', tag: 'Meme', liquidity: 45000000, holders: 125000 },
  { id: '2', symbol: 'PEPE', name: 'Pepe', chain: 'Ethereum', price: 0.00001234, change1h: -1.2, change24h: 8.3, change7d: 32.1, contractAddress: '0x6982508145454Ce325dDbE47a25d4ec3d2311933', safetyScore: 4, totalScore: 6, smartMoneyCount: 89, marketCap: 5200000000, volume24h: 320000000, isHot: true, riskLevel: 'high', tag: 'Meme', liquidity: 120000000, holders: 89000 },
  { id: '3', symbol: 'WIF', name: 'dogwifhat', chain: 'Solana', price: 2.85, change1h: -0.8, change24h: -2.1, change7d: 18.5, contractAddress: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm', safetyScore: 5, totalScore: 6, smartMoneyCount: 234, marketCap: 2850000000, volume24h: 189000000, isHot: true, riskLevel: 'medium', tag: 'Meme', liquidity: 89000000, holders: 67000 },
  { id: '4', symbol: 'DEGEN', name: 'Degen', chain: 'Base', price: 0.0156, change1h: 5.2, change24h: 25.8, change7d: 156.3, contractAddress: '0x4ed4e862860bed51a9570b96d89af5e1b0efefen', safetyScore: 4, totalScore: 6, smartMoneyCount: 67, marketCap: 156000000, volume24h: 45000000, isHot: true, riskLevel: 'high', tag: 'Base生态', liquidity: 28000000, holders: 34000 },
  { id: '5', symbol: 'FLOKI', name: 'FLOKI', chain: 'Ethereum', price: 0.000152, change1h: 0.5, change24h: 5.2, change7d: 22.8, contractAddress: '0x43f11c0244a3dD19f0aE98e5B0d2f3d4A8f9b2c1', safetyScore: 5, totalScore: 6, smartMoneyCount: 312, marketCap: 1450000000, volume24h: 89000000, isHot: false, riskLevel: 'medium', tag: 'Meme', liquidity: 67000000, holders: 156000 },
  { id: '6', symbol: 'SUI', name: 'Sui', chain: 'Solana', price: 1.23, change1h: 0.3, change24h: 1.5, change7d: 8.9, contractAddress: 'Suiobject', safetyScore: 6, totalScore: 6, smartMoneyCount: 567, marketCap: 3200000000, volume24h: 456000000, isHot: false, riskLevel: 'low', tag: '公链', liquidity: 340000000, holders: 890000 },
  { id: '7', symbol: 'PENDLE', name: 'Pendle', chain: 'Ethereum', price: 3.45, change1h: 2.1, change24h: 15.2, change7d: 45.6, contractAddress: '0x8080a8891c2e3e7c3d2f4a0c8e0e2d2c3b4a5c6', safetyScore: 5, totalScore: 6, smartMoneyCount: 123, marketCap: 680000000, volume24h: 78000000, isHot: true, riskLevel: 'medium', tag: 'DeFi', liquidity: 89000000, holders: 45000 },
  { id: '8', symbol: 'JUP', name: 'Jupiter', chain: 'Solana', price: 0.85, change1h: 3.2, change24h: 18.5, change7d: 62.3, contractAddress: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN', safetyScore: 5, totalScore: 6, smartMoneyCount: 234, marketCap: 1200000000, volume24h: 234000000, isHot: true, riskLevel: 'medium', tag: 'DEX', liquidity: 123000000, holders: 78000 },
];

const DEFAULT_INSTITUTIONS: Institution[] = [
  { id: '1', name: 'A16z Crypto', type: 'VC', logo: '🔷', action: '领投', target: 'AI Agent 平台', amount: '$1.2B', date: '2小时前', chain: '多链', category: 'AI', description: 'AI与区块链结合的创新项目获得顶级VC青睐' },
  { id: '2', name: 'Paradigm', type: 'VC', logo: '🔴', action: '增持', target: 'DeFi 流动性协议', amount: '$500M', date: '5小时前', chain: 'Ethereum', category: 'DeFi', description: '继续看好以太坊DeFi生态发展' },
  { id: '3', name: 'Binance Labs', type: '交易所', logo: '🟡', action: '孵化', target: 'Web3 开发者工具', amount: '$100M', date: '1天前', chain: 'BSC', category: '基础设施', description: '支持开发者生态，降低Web3入门门槛' },
  { id: '4', name: 'Coinbase Ventures', type: '交易所', logo: '🔵', action: '战略投资', target: 'ZK-Rollup 项目', amount: '$50M', date: '1天前', chain: 'Base', category: 'L2', description: 'ZK技术是L2未来的核心技术方向' },
];

const DEFAULT_DECISIONS: Decision[] = [
  { id: '1', type: 'institution_sync', title: '机构同频', description: 'A16z领投AI Agent赛道，Base生态代币活跃度上升', token: DEFAULT_TOKENS[3], chain: 'Base', confidence: 92, tag: '高置信度', timestamp: '10分钟前', reasons: ['A16z投资$1.2B进入AI领域', 'Base日活地址突破50万', 'DEGEN 24h涨幅25.8%'] },
  { id: '2', type: 'smart_money', title: '聪明钱共振', description: '3个聪明钱地址同时增持WIF，总计$2.3M', token: DEFAULT_TOKENS[2], chain: 'Solana', confidence: 88, tag: '聪明钱信号', timestamp: '30分钟前', reasons: ['聪明钱地址数量增加45%', '链上大额转账买入', '持币地址集中度下降'] },
  { id: '3', type: 'ecosystem_bonus', title: '生态红利', description: 'Jupiter TVL突破$500M，手续费收入环比增长120%', token: DEFAULT_TOKENS[7], chain: 'Solana', confidence: 85, tag: '生态机会', timestamp: '1小时前', reasons: ['JUP 7d涨幅62.3%', 'Solana DEX交易量创新高', 'DEX代币热度上升'] },
  { id: '4', type: 'risk_warning', title: '风险背离', description: 'PEPE 24h交易量激增300%，聪明钱净卖出', token: DEFAULT_TOKENS[1], chain: 'Ethereum', confidence: 75, tag: '⚠️ 谨慎', timestamp: '2小时前', reasons: ['机构地址在减持', '合约风险评分下降', 'Meme热潮可能接近尾声'] },
];

const formatNumber = (num: number, decimals = 2): string => {
  if (num >= 1e9) return `${(num / 1e9).toFixed(decimals)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(decimals)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(decimals)}K`;
  return num.toFixed(decimals);
};

const formatPrice = (price: number): string => {
  if (price >= 1000) return `$${price.toFixed(2)}`;
  if (price >= 1) return `$${price.toFixed(2)}`;
  if (price >= 0.01) return `$${price.toFixed(4)}`;
  return `$${price.toFixed(6)}`;
};

const generateBuyLinks = (token: Token) => {
  const explorer = CHAIN_CONFIG[token.chain]?.explorer || '';
  const contractUrl = `${explorer}/token/${token.contractAddress}`;
  
  const chainId = token.chain === 'Solana' ? 'solana' : 
                   token.chain === 'Ethereum' ? '1' : 
                   token.chain === 'BSC' ? '56' : '8453';
  
  const tpLink = `tokenpocket://wallet/transfer?symbol=${token.symbol}&address=${token.contractAddress}&chain=${token.chain === 'Solana' ? 'solana' : 'ethereum'}`;
  const okxLink = `okx://wallet/tokenTransfer?tokenSymbol=${token.symbol}&toAddress=${token.contractAddress}&chain=${token.chain}`;
  const binanceLink = `bnbwallet://swap?inputCurrency=${token.contractAddress}`;
  
  return { tpLink, okxLink, binanceLink, contractUrl };
};

export default function SignalScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('realtime');
  const [filter, setFilter] = useState<FilterType>('hot');
  const [chainFilter, setChainFilter] = useState<ChainFilter>('全部');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [slippage, setSlippage] = useState(1);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const handleBuyPress = (token: Token) => {
    setSelectedToken(token);
    setShowBuyModal(true);
  };

  const handleCopyAddress = (address: string) => {
    if (Platform.OS === 'web') {
      navigator.clipboard.writeText(address);
    }
    Alert.alert('已复制', '合约地址已复制到剪贴板');
  };

  const handleWalletBuy = async (wallet: 'tp' | 'okx' | 'binance') => {
    if (!selectedToken) return;
    
    const { tpLink, okxLink, binanceLink } = generateBuyLinks(selectedToken);
    const links = { tp: tpLink, okx: okxLink, binance: binanceLink };
    const url = links[wallet];
    
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('提示', `请安装${wallet === 'tp' ? 'TokenPocket' : wallet === 'okx' ? 'OKX Wallet' : 'Binance Web3'}钱包`);
      }
    } catch (error) {
      Alert.alert('错误', '无法打开钱包应用');
    }
  };

  const filteredTokens = DEFAULT_TOKENS.filter(token => {
    if (chainFilter !== '全部' && token.chain !== chainFilter) return false;
    if (searchQuery && !token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !token.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    
    switch (filter) {
      case 'hot': return token.isHot;
      case 'gainers': return token.change24h > 0;
      case 'smart': return token.smartMoneyCount > 50;
      case 'volume': return token.volume24h > 100000000;
      default: return true;
    }
  });

  const renderTokenCard = (token: Token, index: number) => {
    const changeColor = token.change24h >= 0 ? '#00C853' : '#FF5252';
    const chainConfig = CHAIN_CONFIG[token.chain];
    const isTop = index < 3;
    
    return (
      <TouchableOpacity key={token.id} style={styles.tokenCard} onPress={() => handleBuyPress(token)}>
        {isTop && (
          <View style={[styles.topBadge, { backgroundColor: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32' }]}>
            <Text style={styles.topBadgeText}>{index + 1}</Text>
          </View>
        )}
        
        <View style={styles.tokenHeader}>
          <View style={styles.tokenLeft}>
            <View style={[styles.tokenIcon, { backgroundColor: chainConfig?.color + '20' || '#333' }]}>
              <Text style={styles.tokenIconText}>{chainConfig?.icon}</Text>
            </View>
            <View>
              <Text style={styles.tokenSymbol}>{token.symbol}</Text>
              <Text style={styles.tokenName}>{token.name}</Text>
            </View>
          </View>
          <View style={styles.tokenRight}>
            <Text style={styles.tokenPrice}>{formatPrice(token.price)}</Text>
            <View style={[styles.changeBadge, { backgroundColor: changeColor + '20' }]}>
              <Text style={[styles.tokenChange, { color: changeColor }]}>
                {token.change24h >= 0 ? '↑' : '↓'} {Math.abs(token.change24h).toFixed(2)}%
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.tokenTags}>
          {token.tag && (
            <View style={styles.tag}>
              <Text style={styles.tagText}>{token.tag}</Text>
            </View>
          )}
          {token.isHot && (
            <View style={[styles.tag, { backgroundColor: '#FF6B6B20' }]}>
              <Text style={[styles.tagText, { color: '#FF6B6B' }]}>🔥 热门</Text>
            </View>
          )}
          <View style={[styles.riskTag, { backgroundColor: token.riskLevel === 'high' ? '#FF525220' : token.riskLevel === 'medium' ? '#FFB30020' : '#00C85320' }]}>
            <Text style={[styles.riskTagText, { color: token.riskLevel === 'high' ? '#FF5252' : token.riskLevel === 'medium' ? '#FFB300' : '#00C853' }]}>
              {token.riskLevel === 'high' ? '高风险' : token.riskLevel === 'medium' ? '中风险' : '低风险'}
            </Text>
          </View>
        </View>
        
        <View style={styles.tokenStats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>市值</Text>
            <Text style={styles.statValue}>${formatNumber(token.marketCap)}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>24h交易</Text>
            <Text style={styles.statValue}>${formatNumber(token.volume24h)}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>聪明钱</Text>
            <Text style={styles.statValue}>{token.smartMoneyCount} 👤</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>安全</Text>
            <Text style={[styles.statValue, { color: token.safetyScore >= 5 ? '#00C853' : '#FFB300' }]}>
              {token.safetyScore}/6
            </Text>
          </View>
        </View>
        
        <View style={styles.contractRow}>
          <Text style={styles.contractLabel}>合约</Text>
          <Text style={styles.contractAddress} numberOfLines={1}>
            {token.contractAddress.slice(0, 8)}...{token.contractAddress.slice(-6)}
          </Text>
          <TouchableOpacity onPress={() => handleCopyAddress(token.contractAddress)}>
            <Ionicons name="copy-outline" size={16} color="#00D4AA" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.cardActions}>
          <TouchableOpacity 
            style={styles.detailBtn}
            onPress={() => handleBuyPress(token)}
          >
            <Text style={styles.detailBtnText}>详情</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.buyButton}
            onPress={() => handleBuyPress(token)}
          >
            <Ionicons name="wallet-outline" size={16} color="#0D0D0F" />
            <Text style={styles.buyButtonText}>买入</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderInstitutionCard = (inst: Institution) => (
    <View key={inst.id} style={styles.institutionCard}>
      <View style={styles.instHeader}>
        <View style={styles.instLogo}>
          <Text style={styles.instLogoText}>{inst.logo}</Text>
        </View>
        <View style={styles.instInfo}>
          <Text style={styles.instName}>{inst.name}</Text>
          <View style={styles.instMeta}>
            <Text style={styles.instAction}>{inst.action}</Text>
            <Text style={styles.instAmount}>{inst.amount}</Text>
          </View>
        </View>
        <View style={styles.instRight}>
          <View style={[styles.chainBadge, { backgroundColor: CHAIN_CONFIG[inst.chain]?.color + '20' || '#333' }]}>
            <Text style={[styles.chainBadgeText, { color: CHAIN_CONFIG[inst.chain]?.color || '#fff' }]}>
              {inst.chain}
            </Text>
          </View>
          <Text style={styles.instDate}>{inst.date}</Text>
        </View>
      </View>
      <Text style={styles.instTarget}>{inst.target}</Text>
      <Text style={styles.instDesc}>{inst.description}</Text>
      <View style={styles.instFooter}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{inst.category}</Text>
        </View>
      </View>
    </View>
  );

  const renderDecisionCard = (decision: Decision) => {
    const bgColor = decision.type === 'risk_warning' ? '#FF525220' : '#00C85320';
    const borderColor = decision.type === 'risk_warning' ? '#FF5252' : '#00C853';
    const tagColor = decision.type === 'risk_warning' ? '#FF5252' : '#00C853';
    
    return (
      <TouchableOpacity 
        key={decision.id} 
        style={[styles.decisionCard, { borderLeftColor: borderColor }]}
        onPress={() => decision.token && handleBuyPress(decision.token)}
      >
        <View style={styles.decisionHeader}>
          <View style={[styles.decisionBadge, { backgroundColor: bgColor }]}>
            <Text style={[styles.decisionTitle, { color: tagColor }]}>{decision.title}</Text>
          </View>
          <View style={styles.confidenceBadge}>
            <Text style={styles.confidenceText}>{decision.confidence}%</Text>
          </View>
        </View>
        <Text style={styles.decisionDesc}>{decision.description}</Text>
        {decision.token && (
          <View style={styles.decisionToken}>
            <View style={styles.decisionTokenLeft}>
              <Text style={styles.decisionTokenSymbol}>{decision.token.symbol}</Text>
              <Text style={styles.decisionTokenChain}>{decision.chain}</Text>
            </View>
            <Text style={styles.decisionTokenPrice}>{formatPrice(decision.token.price)}</Text>
          </View>
        )}
        <View style={styles.reasons}>
          {decision.reasons.slice(0, 2).map((reason, i) => (
            <Text key={i} style={styles.reasonText}>• {reason}</Text>
          ))}
        </View>
        <View style={styles.decisionFooter}>
          <Text style={styles.decisionTime}>{decision.timestamp}</Text>
          {decision.token && (
            <TouchableOpacity 
              style={styles.decisionBuyBtn}
              onPress={() => handleBuyPress(decision.token!)}
            >
              <Text style={styles.decisionBuyText}>跟投</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderRealtimeTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="搜索代币名称或符号..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.filterSection}>
        <Text style={styles.sectionLabel}>筛选</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterRow}>
            {(['hot', 'gainers', 'smart', 'volume'] as FilterType[]).map(f => (
              <TouchableOpacity
                key={f}
                onPress={() => setFilter(f)}
                style={[styles.filterChip, filter === f && styles.filterChipActive]}
              >
                <Text style={[styles.filterChipText, filter === f && styles.filterChipTextActive]}>
                  {f === 'hot' ? '🔥 热门' : f === 'gainers' ? '📈 涨幅' : f === 'smart' ? '💰 聪明钱' : '📊 高交易量'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
      
      <View style={styles.filterSection}>
        <Text style={styles.sectionLabel}>链</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterRow}>
            {(['全部', 'Solana', 'Ethereum', 'Base', 'BSC'] as ChainFilter[]).map(c => (
              <TouchableOpacity
                key={c}
                onPress={() => setChainFilter(c)}
                style={[styles.chainChip, chainFilter === c && styles.chainChipActive]}
              >
                <Text style={[styles.chainChipText, chainFilter === c && styles.chainChipTextActive]}>
                  {c}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
      
      <View style={styles.resultInfo}>
        <Text style={styles.resultText}>
          共找到 {filteredTokens.length} 个代币
        </Text>
        <TouchableOpacity onPress={onRefresh}>
          <Ionicons name="refresh" size={18} color="#00D4AA" />
        </TouchableOpacity>
      </View>
      
      {loading ? (
        <ActivityIndicator size="large" color="#00D4AA" style={styles.loader} />
      ) : filteredTokens.length > 0 ? (
        filteredTokens.map((token, index) => renderTokenCard(token, index))
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={48} color="#333" />
          <Text style={styles.emptyTitle}>暂无符合条件的数据</Text>
          <Text style={styles.emptySubtitle}>尝试调整筛选条件</Text>
        </View>
      )}
    </View>
  );

  const renderInstitutionTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.resultInfo}>
        <Text style={styles.resultText}>机构动向</Text>
      </View>
      {DEFAULT_INSTITUTIONS.map(renderInstitutionCard)}
    </View>
  );

  const renderDecisionTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.resultInfo}>
        <Text style={styles.resultText}>决策信号</Text>
      </View>
      {DEFAULT_DECISIONS.map(renderDecisionCard)}
    </View>
  );

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>机构跟投</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerBtn}>
            <Ionicons name="notifications-outline" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn}>
            <Ionicons name="settings-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tabBar}>
        {[
          { key: 'realtime' as TabType, label: '实时', icon: '📊' },
          { key: 'institution' as TabType, label: '机构', icon: '🏛️' },
          { key: 'decision' as TabType, label: '决策台', icon: '💡' }
        ].map(tab => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            style={[styles.tabButton, activeTab === tab.key && styles.tabButtonActive]}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00D4AA" />}
      >
        {activeTab === 'realtime' && renderRealtimeTab()}
        {activeTab === 'institution' && renderInstitutionTab()}
        {activeTab === 'decision' && renderDecisionTab()}
        
        <View style={styles.bottomSpacer} />
      </ScrollView>

      <View style={styles.riskBanner}>
        <Ionicons name="alert-circle" size={14} color="#FF9800" />
        <Text style={styles.riskBannerText}>投资有风险，跟单需谨慎</Text>
      </View>

      <Modal visible={showBuyModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} onPress={() => setShowBuyModal(false)} />
          <View style={styles.modalContent}>
            {selectedToken && (
              <>
                <View style={styles.modalHeader}>
                  <View style={styles.modalTitleRow}>
                    <View style={[styles.modalIcon, { backgroundColor: CHAIN_CONFIG[selectedToken.chain]?.color + '20' }]}>
                      <Text style={styles.modalIconText}>{CHAIN_CONFIG[selectedToken.chain]?.icon}</Text>
                    </View>
                    <View>
                      <Text style={styles.modalTitle}>{selectedToken.symbol}</Text>
                      <Text style={styles.modalSubtitle}>{selectedToken.name}</Text>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => setShowBuyModal(false)}>
                    <Ionicons name="close" size={24} color="#fff" />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.priceSection}>
                  <Text style={styles.priceLabel}>当前价格</Text>
                  <Text style={styles.priceValue}>{formatPrice(selectedToken.price)}</Text>
                  <View style={[styles.changePill, { backgroundColor: selectedToken.change24h >= 0 ? '#00C85320' : '#FF525220' }]}>
                    <Text style={[styles.changePillText, { color: selectedToken.change24h >= 0 ? '#00C853' : '#FF5252' }]}>
                      24h {selectedToken.change24h >= 0 ? '+' : ''}{selectedToken.change24h.toFixed(2)}%
                    </Text>
                  </View>
                </View>

                <View style={styles.statsGrid}>
                  <View style={styles.statGridItem}>
                    <Text style={styles.statGridLabel}>市值</Text>
                    <Text style={styles.statGridValue}>${formatNumber(selectedToken.marketCap)}</Text>
                  </View>
                  <View style={styles.statGridItem}>
                    <Text style={styles.statGridLabel}>24h交易量</Text>
                    <Text style={styles.statGridValue}>${formatNumber(selectedToken.volume24h)}</Text>
                  </View>
                  <View style={styles.statGridItem}>
                    <Text style={styles.statGridLabel}>聪明钱</Text>
                    <Text style={styles.statGridValue}>{selectedToken.smartMoneyCount} 人</Text>
                  </View>
                  <View style={styles.statGridItem}>
                    <Text style={styles.statGridLabel}>安全评分</Text>
                    <Text style={[styles.statGridValue, { color: selectedToken.safetyScore >= 5 ? '#00C853' : '#FFB300' }]}>
                      {selectedToken.safetyScore}/6
                    </Text>
                  </View>
                </View>

                <View style={[styles.warningBox, { backgroundColor: selectedToken.riskLevel === 'high' ? '#FF525220' : '#FF980020' }]}>
                  <Ionicons name="warning" size={20} color={selectedToken.riskLevel === 'high' ? '#FF5252' : '#FF9800'} />
                  <Text style={[styles.warningText, { color: selectedToken.riskLevel === 'high' ? '#FF5252' : '#FF9800' }]}>
                    {selectedToken.riskLevel === 'high' 
                      ? '⚠️ 高风险代币，请设置滑点≥2%，做好止损准备'
                      : '⚡ 中等风险代币，建议设置滑点≥1%'}
                  </Text>
                </View>

                <View style={styles.slippageSection}>
                  <Text style={styles.slippageLabel}>滑点保护</Text>
                  <View style={styles.slippageOptions}>
                    {[0.5, 1, 2, 3].map(s => (
                      <TouchableOpacity
                        key={s}
                        style={[styles.slippageBtn, slippage === s && styles.slippageBtnActive]}
                        onPress={() => setSlippage(s)}
                      >
                        <Text style={[styles.slippageBtnText, slippage === s && styles.slippageBtnTextActive]}>
                          {s}%
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.walletSection}>
                  <Text style={styles.walletTitle}>选择钱包买入</Text>
                  <View style={styles.walletGrid}>
                    <TouchableOpacity style={styles.walletBtn} onPress={() => handleWalletBuy('tp')}>
                      <Text style={styles.walletEmoji}>💹</Text>
                      <Text style={styles.walletBtnText}>TokenPocket</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.walletBtn} onPress={() => handleWalletBuy('okx')}>
                      <Text style={styles.walletEmoji}>🔴</Text>
                      <Text style={styles.walletBtnText}>OKX Wallet</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.walletBtn} onPress={() => handleWalletBuy('binance')}>
                      <Text style={styles.walletEmoji}>🟡</Text>
                      <Text style={styles.walletBtnText}>Binance</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity 
                  style={styles.copyContract}
                  onPress={() => handleCopyAddress(selectedToken.contractAddress)}
                >
                  <Ionicons name="copy-outline" size={16} color="#00D4AA" />
                  <Text style={styles.copyContractText}>复制合约地址</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'web' ? 16 : 60,
    paddingBottom: 12,
    backgroundColor: '#0D0D0F',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerRight: {
    flexDirection: 'row',
  },
  headerBtn: {
    padding: 8,
    marginLeft: 8,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1F',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  tabButtonActive: {
    backgroundColor: '#00D4AA',
  },
  tabIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  tabLabel: {
    color: '#888',
    fontSize: 14,
    fontWeight: '600',
  },
  tabLabelActive: {
    color: '#0D0D0F',
  },
  content: {
    flex: 1,
    backgroundColor: '#0D0D0F',
  },
  tabContent: {
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1F',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 12,
    marginLeft: 8,
  },
  filterSection: {
    marginBottom: 12,
  },
  sectionLabel: {
    color: '#666',
    fontSize: 12,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  filterRow: {
    flexDirection: 'row',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#1A1A1F',
    borderRadius: 20,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#00D4AA',
  },
  filterChipText: {
    color: '#888',
    fontSize: 14,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#0D0D0F',
  },
  chainChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: '#1A1A1F',
    borderRadius: 16,
    marginRight: 8,
  },
  chainChipActive: {
    backgroundColor: '#2D2D35',
    borderWidth: 1,
    borderColor: '#00D4AA',
  },
  chainChipText: {
    color: '#666',
    fontSize: 12,
  },
  chainChipTextActive: {
    color: '#fff',
  },
  resultInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
  },
  resultText: {
    color: '#888',
    fontSize: 14,
  },
  loader: {
    marginTop: 40,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtitle: {
    color: '#666',
    fontSize: 14,
    marginTop: 8,
  },
  tokenCard: {
    backgroundColor: '#1A1A1F',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    position: 'relative',
  },
  topBadge: {
    position: 'absolute',
    top: -8,
    left: 16,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  topBadgeText: {
    color: '#0D0D0F',
    fontSize: 12,
    fontWeight: 'bold',
  },
  tokenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tokenLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tokenIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  tokenIconText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  tokenSymbol: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  tokenName: {
    color: '#666',
    fontSize: 13,
    marginTop: 2,
  },
  tokenRight: {
    alignItems: 'flex-end',
  },
  tokenPrice: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  changeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 4,
  },
  tokenChange: {
    fontSize: 13,
    fontWeight: '600',
  },
  tokenTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tag: {
    backgroundColor: '#00D4AA20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    color: '#00D4AA',
    fontSize: 12,
    fontWeight: '600',
  },
  riskTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  riskTagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tokenStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#2D2D35',
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    color: '#666',
    fontSize: 11,
    marginBottom: 4,
  },
  statValue: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  contractRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D2D35',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  contractLabel: {
    color: '#666',
    fontSize: 12,
    marginRight: 8,
  },
  contractAddress: {
    color: '#888',
    fontSize: 12,
    flex: 1,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailBtn: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#2D2D35',
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  detailBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  buyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00D4AA',
    borderRadius: 12,
    paddingVertical: 12,
  },
  buyButtonText: {
    color: '#0D0D0F',
    fontSize: 15,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  institutionCard: {
    backgroundColor: '#1A1A1F',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  instHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  instLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2D2D35',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  instLogoText: {
    fontSize: 18,
  },
  instInfo: {
    flex: 1,
  },
  instName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  instMeta: {
    flexDirection: 'row',
    marginTop: 4,
  },
  instAction: {
    color: '#00D4AA',
    fontSize: 13,
    marginRight: 8,
  },
  instAmount: {
    color: '#FFD700',
    fontSize: 13,
    fontWeight: '600',
  },
  instRight: {
    alignItems: 'flex-end',
  },
  chainBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  chainBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  instDate: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
  },
  instTarget: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },
  instDesc: {
    color: '#888',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  instFooter: {
    flexDirection: 'row',
  },
  categoryBadge: {
    backgroundColor: '#2D2D35',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    color: '#888',
    fontSize: 12,
  },
  decisionCard: {
    backgroundColor: '#1A1A1F',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 3,
  },
  decisionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  decisionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  decisionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  confidenceBadge: {
    backgroundColor: '#2D2D35',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  confidenceText: {
    color: '#00D4AA',
    fontSize: 14,
    fontWeight: 'bold',
  },
  decisionDesc: {
    color: '#ccc',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  decisionToken: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2D2D35',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  decisionTokenLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  decisionTokenSymbol: {
    color: '#fff',
    fontWeight: '600',
    marginRight: 8,
  },
  decisionTokenChain: {
    color: '#666',
    fontSize: 12,
  },
  decisionTokenPrice: {
    color: '#00D4AA',
    fontWeight: 'bold',
  },
  reasons: {
    marginBottom: 10,
  },
  reasonText: {
    color: '#888',
    fontSize: 13,
    marginBottom: 4,
  },
  decisionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  decisionTime: {
    color: '#666',
    fontSize: 12,
  },
  decisionBuyBtn: {
    backgroundColor: '#00D4AA',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  decisionBuyText: {
    color: '#0D0D0F',
    fontWeight: 'bold',
  },
  bottomSpacer: {
    height: 20,
  },
  riskBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A1F',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#2D2D35',
  },
  riskBannerText: {
    color: '#FF9800',
    fontSize: 13,
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalContent: {
    backgroundColor: '#1A1A1F',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  modalIconText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  modalSubtitle: {
    color: '#666',
    fontSize: 14,
    marginTop: 2,
  },
  priceSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  priceLabel: {
    color: '#666',
    fontSize: 13,
    marginBottom: 4,
  },
  priceValue: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
  },
  changePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 8,
  },
  changePillText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  statGridItem: {
    width: '50%',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  statGridLabel: {
    color: '#666',
    fontSize: 13,
    marginBottom: 4,
  },
  statGridValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
  },
  warningText: {
    fontSize: 14,
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
  },
  slippageSection: {
    marginBottom: 20,
  },
  slippageLabel: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
  },
  slippageOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  slippageBtn: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: '#2D2D35',
    borderRadius: 10,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  slippageBtnActive: {
    backgroundColor: '#00D4AA',
  },
  slippageBtnText: {
    color: '#888',
    fontSize: 16,
    fontWeight: '600',
  },
  slippageBtnTextActive: {
    color: '#0D0D0F',
  },
  walletSection: {
    marginBottom: 16,
  },
  walletTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
  },
  walletGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  walletBtn: {
    flex: 1,
    backgroundColor: '#2D2D35',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  walletEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  walletBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  copyContract: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  copyContractText: {
    color: '#00D4AA',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
});
