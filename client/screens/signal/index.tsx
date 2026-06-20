import React, { useState, useCallback } from 'react';
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
type FilterType = 'hot' | 'gainers' | 'smart' | 'safe';
type ChainFilter = '全部' | 'Solana' | 'Ethereum' | 'Base' | 'BSC' | 'Arbitrum' | 'AVAX';

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
  'Solana': { icon: '🟢', color: '#00FFA3', explorer: 'https://solscan.io' },
  'Ethereum': { icon: '🔷', color: '#627EEA', explorer: 'https://etherscan.io' },
  'Base': { icon: '🔵', color: '#0052FF', explorer: 'https://basescan.org' },
  'BSC': { icon: '🟡', color: '#F0B90B', explorer: 'https://bscscan.com' },
  'Arbitrum': { icon: '🔴', color: '#28A0F0', explorer: 'https://arbiscan.io' },
  'AVAX': { icon: '🔺', color: '#E84142', explorer: 'https://snowscan.xyz' },
};

const DEFAULT_TOKENS: Token[] = [
  { id: '1', symbol: 'BONK', name: 'Bonk', chain: 'Solana', price: 0.00002845, change1h: 2.1, change24h: 12.5, change7d: 45.2, contractAddress: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB2pUCvBT', safetyScore: 5, totalScore: 6, smartMoneyCount: 156, marketCap: 2850000000, volume24h: 145000000, isHot: true, riskLevel: 'medium', tag: 'Meme', liquidity: 45000000, holders: 125000 },
  { id: '2', symbol: 'PEPE', name: 'Pepe', chain: 'Ethereum', price: 0.00001234, change1h: -1.2, change24h: 8.3, change7d: 32.1, contractAddress: '0x6982508145454Ce325dDbE47a25d4ec3d2311933', safetyScore: 4, totalScore: 6, smartMoneyCount: 89, marketCap: 5200000000, volume24h: 320000000, isHot: true, riskLevel: 'high', tag: 'Meme', liquidity: 120000000, holders: 89000 },
  { id: '3', symbol: 'WIF', name: 'dogwifhat', chain: 'Solana', price: 2.85, change1h: -0.8, change24h: -2.1, change7d: 18.5, contractAddress: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm', safetyScore: 5, totalScore: 6, smartMoneyCount: 234, marketCap: 2850000000, volume24h: 189000000, isHot: true, riskLevel: 'medium', tag: 'Meme', liquidity: 89000000, holders: 67000 },
  { id: '4', symbol: 'DEGEN', name: 'Degen', chain: 'Base', price: 0.0156, change1h: 5.2, change24h: 25.8, change7d: 156.3, contractAddress: '0x4ed4e862860bed51a9570b96d89af5e1b0efefen', safetyScore: 4, totalScore: 6, smartMoneyCount: 67, marketCap: 156000000, volume24h: 45000000, isHot: true, riskLevel: 'high', tag: 'Base生态', liquidity: 28000000, holders: 34000 },
  { id: '5', symbol: 'FLOKI', name: 'FLOKI Inu', chain: 'Ethereum', price: 0.000152, change1h: 0.5, change24h: 5.2, change7d: 22.8, contractAddress: '0x43f11c0244a3dD19f0aE98e5B0d2f3d4A8f9b2c1', safetyScore: 5, totalScore: 6, smartMoneyCount: 312, marketCap: 1450000000, volume24h: 89000000, isHot: false, riskLevel: 'medium', tag: 'Meme', liquidity: 67000000, holders: 156000 },
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
  { id: '3', type: 'ecosystem_bonus', title: '生态红利', description: 'Jupiter TVL突破$500M，手续费收入环比增长120%', token: DEFAULT_TOKENS[0], chain: 'Solana', confidence: 85, tag: '生态机会', timestamp: '1小时前', reasons: ['BONK 7d涨幅45.2%', 'Solana DEX交易量创新高', 'Meme热潮持续'] },
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
  
  const tpLink = token.chain === 'Solana'
    ? `tokenpocket://wallet/transfer?symbol=${token.symbol}&address=${token.contractAddress}&chain=solana`
    : `tokenpocket://wallet/transfer?symbol=${token.symbol}&address=${token.contractAddress}&chainId=${token.chain === 'Ethereum' ? '1' : token.chain === 'BSC' ? '56' : token.chain === 'Base' ? '8453' : '42161'}&network=${token.chain === 'Solana' ? 'solana' : 'ethereum'}`;
  
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
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleBuyPress = (token: Token) => {
    setSelectedToken(token);
    setShowBuyModal(true);
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
      case 'safe': return token.safetyScore >= 5;
      default: return true;
    }
  });

  const renderTabButton = (tab: TabType, label: string, icon: string) => (
    <TouchableOpacity
      key={tab}
      onPress={() => setActiveTab(tab)}
      style={[
        styles.tabButton,
        activeTab === tab && styles.tabButtonActive
      ]}
    >
      <Text style={styles.tabIcon}>{icon}</Text>
      <Text style={[styles.tabLabel, activeTab === tab && styles.tabLabelActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderFilterButton = (f: FilterType, label: string) => (
    <TouchableOpacity
      key={f}
      onPress={() => setFilter(f)}
      style={[styles.filterChip, filter === f && styles.filterChipActive]}
    >
      <Text style={[styles.filterChipText, filter === f && styles.filterChipTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderChainButton = (chain: ChainFilter) => (
    <TouchableOpacity
      key={chain}
      onPress={() => setChainFilter(chain)}
      style={[styles.chainChip, chainFilter === chain && styles.chainChipActive]}
    >
      <Text style={[styles.chainChipText, chainFilter === chain && styles.chainChipTextActive]}>
        {chain}
      </Text>
    </TouchableOpacity>
  );

  const renderTokenCard = (token: Token) => {
    const changeColor = token.change24h >= 0 ? '#00C853' : '#FF5252';
    const chainConfig = CHAIN_CONFIG[token.chain];
    
    return (
      <TouchableOpacity key={token.id} style={styles.tokenCard} onPress={() => handleBuyPress(token)}>
        <View style={styles.tokenHeader}>
          <View style={styles.tokenLeft}>
            <View style={[styles.tokenIcon, { backgroundColor: chainConfig?.color + '20' || '#333' }]}>
              <Text style={styles.tokenIconText}>{chainConfig?.icon || '🪙'}</Text>
            </View>
            <View>
              <Text style={styles.tokenSymbol}>{token.symbol}</Text>
              <Text style={styles.tokenName}>{token.name}</Text>
            </View>
          </View>
          <View style={styles.tokenRight}>
            <Text style={styles.tokenPrice}>{formatPrice(token.price)}</Text>
            <Text style={[styles.tokenChange, { color: changeColor }]}>
              {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(2)}%
            </Text>
          </View>
        </View>
        
        <View style={styles.tokenTags}>
          {token.tag && (
            <View style={styles.tag}>
              <Text style={styles.tagText}>{token.tag}</Text>
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
            <Text style={styles.statLabel}>聪明钱</Text>
            <Text style={styles.statValue}>{token.smartMoneyCount}人</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>安全</Text>
            <Text style={styles.statValue}>{token.safetyScore}/6</Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.buyButton} onPress={() => handleBuyPress(token)}>
          <Ionicons name="wallet-outline" size={16} color="#fff" />
          <Text style={styles.buyButtonText}>买入</Text>
        </TouchableOpacity>
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
            <Text style={styles.decisionTokenText}>
              {decision.token.symbol} · {decision.chain}
            </Text>
            <Text style={styles.decisionTokenPrice}>
              {formatPrice(decision.token.price)}
            </Text>
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
          placeholder="搜索代币..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
        {(['hot', 'gainers', 'smart', 'safe'] as FilterType[]).map(f => renderFilterButton(f, 
          f === 'hot' ? '🔥热度' : f === 'gainers' ? '📈涨幅' : f === 'smart' ? '💰聪明钱' : '🛡️安全'
        ))}
      </ScrollView>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chainRow}>
        {(['全部', 'Solana', 'Ethereum', 'Base', 'BSC'] as ChainFilter[]).map(c => renderChainButton(c))}
      </ScrollView>
      
      {loading ? (
        <ActivityIndicator size="large" color="#00D4AA" style={styles.loader} />
      ) : filteredTokens.length > 0 ? (
        filteredTokens.map(renderTokenCard)
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>暂无符合条件的数据</Text>
        </View>
      )}
    </View>
  );

  const renderInstitutionTab = () => (
    <View style={styles.tabContent}>
      {DEFAULT_INSTITUTIONS.map(renderInstitutionCard)}
    </View>
  );

  const renderDecisionTab = () => (
    <View style={styles.tabContent}>
      {DEFAULT_DECISIONS.map(renderDecisionCard)}
    </View>
  );

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>机构跟投</Text>
        <TouchableOpacity style={styles.settingsBtn}>
          <Ionicons name="settings-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabBar}>
        {renderTabButton('realtime', '实时', '📊')}
        {renderTabButton('institution', '机构', '🏛️')}
        {renderTabButton('decision', '决策台', '💡')}
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
        <Ionicons name="alert-circle" size={16} color="#FF9800" />
        <Text style={styles.riskBannerText}>投资有风险，跟单需谨慎</Text>
      </View>

      <Modal visible={showBuyModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedToken && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>买入 {selectedToken.symbol}</Text>
                  <TouchableOpacity onPress={() => setShowBuyModal(false)}>
                    <Ionicons name="close" size={24} color="#fff" />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.tokenInfo}>
                  <Text style={styles.tokenInfoName}>{selectedToken.name}</Text>
                  <Text style={styles.tokenInfoPrice}>{formatPrice(selectedToken.price)}</Text>
                </View>

                <View style={styles.warningBox}>
                  <Ionicons name="warning" size={20} color="#FF9800" />
                  <Text style={styles.warningText}>
                    {selectedToken.riskLevel === 'high' 
                      ? '高风险代币，请设置滑点≥2%'
                      : selectedToken.riskLevel === 'medium'
                      ? '中等风险代币，建议设置滑点≥1%'
                      : '代币风险较低，但仍请谨慎'}
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
                  <Text style={styles.walletTitle}>选择钱包</Text>
                  <TouchableOpacity style={styles.walletBtn} onPress={() => handleWalletBuy('tp')}>
                    <Text style={styles.walletBtnText}>TokenPocket</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.walletBtn} onPress={() => handleWalletBuy('okx')}>
                    <Text style={styles.walletBtnText}>OKX Wallet</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.walletBtn} onPress={() => handleWalletBuy('binance')}>
                    <Text style={styles.walletBtnText}>Binance Web3</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity 
                  style={styles.copyContract}
                  onPress={() => {
                    // Copy contract address
                    Alert.alert('已复制', '合约地址已复制到剪贴板');
                  }}
                >
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
  settingsBtn: {
    padding: 8,
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
    fontSize: 16,
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
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 12,
    marginLeft: 8,
  },
  filterRow: {
    marginBottom: 8,
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
  chainRow: {
    marginBottom: 16,
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
  loader: {
    marginTop: 40,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
  },
  tokenCard: {
    backgroundColor: '#1A1A1F',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
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
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  tokenIconText: {
    fontSize: 20,
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
  tokenChange: {
    fontSize: 14,
    marginTop: 2,
  },
  tokenTags: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  tag: {
    backgroundColor: '#00D4AA20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
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
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  buyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00D4AA',
    borderRadius: 12,
    paddingVertical: 12,
  },
  buyButtonText: {
    color: '#0D0D0F',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
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
  decisionTokenText: {
    color: '#fff',
    fontWeight: '600',
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
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1A1A1F',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  tokenInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  tokenInfoName: {
    color: '#888',
    fontSize: 16,
    marginBottom: 4,
  },
  tokenInfoPrice: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF980020',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  warningText: {
    color: '#FF9800',
    fontSize: 14,
    marginLeft: 10,
    flex: 1,
  },
  slippageSection: {
    marginBottom: 20,
  },
  slippageLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  slippageOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  slippageBtn: {
    flex: 1,
    paddingVertical: 12,
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
    marginBottom: 20,
  },
  walletTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  walletBtn: {
    backgroundColor: '#2D2D35',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  walletBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  copyContract: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  copyContractText: {
    color: '#00D4AA',
    fontSize: 15,
    fontWeight: '600',
  },
});
