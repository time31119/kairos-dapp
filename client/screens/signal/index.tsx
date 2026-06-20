import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Platform,
  Linking,
  Alert,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Modal,
  Clipboard,
} from 'react-native';
import { Ionicons, FontAwesome6, MaterialCommunityIcons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type TabType = 'realtime' | 'institution' | 'decision';
type FilterType = 'hot' | 'gainers' | 'smart' | 'safe';
type ChainFilter = '全部' | 'Solana' | 'Ethereum' | 'Base' | 'BSC' | 'Arbitrum' | 'AVAX';

// 代币数据结构
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

// 机构数据结构
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

// 决策台数据结构
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

// 链信息映射
const CHAIN_CONFIG: Record<string, { icon: string; color: string; explorer: string }> = {
  'Solana': { icon: '🟢', color: '#00FFA3', explorer: 'https://solscan.io' },
  'Ethereum': { icon: '🔷', color: '#627EEA', explorer: 'https://etherscan.io' },
  'Base': { icon: '🔵', color: '#0052FF', explorer: 'https://basescan.org' },
  'BSC': { icon: '🟡', color: '#F0B90B', explorer: 'https://bscscan.com' },
  'Arbitrum': { icon: '🔴', color: '#28A0F0', explorer: 'https://arbiscan.io' },
  'AVAX': { icon: '🔺', color: '#E84142', explorer: 'https://snowscan.xyz' },
};

// 默认代币数据
const DEFAULT_TOKENS: Token[] = [
  { id: '1', symbol: 'BONK', name: 'Bonk', chain: 'Solana', price: 0.00002845, change1h: 2.1, change24h: 12.5, change7d: 45.2, contractAddress: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB2pUCvBT', safetyScore: 5, totalScore: 6, smartMoneyCount: 156, marketCap: 2850000000, volume24h: 145000000, isHot: true, riskLevel: 'medium', tag: 'Meme', liquidity: 45000000, holders: 125000 },
  { id: '2', symbol: 'PEPE', name: 'Pepe', chain: 'Ethereum', price: 0.00001234, change1h: -1.2, change24h: 8.3, change7d: 32.1, contractAddress: '0x6982508145454Ce325dDbE47a25d4ec3d2311933', safetyScore: 4, totalScore: 6, smartMoneyCount: 89, marketCap: 5200000000, volume24h: 320000000, isHot: true, riskLevel: 'high', tag: 'Meme', liquidity: 120000000, holders: 89000 },
  { id: '3', symbol: 'WIF', name: 'dogwifhat', chain: 'Solana', price: 2.85, change1h: -0.8, change24h: -2.1, change7d: 18.5, contractAddress: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm', safetyScore: 5, totalScore: 6, smartMoneyCount: 234, marketCap: 2850000000, volume24h: 189000000, isHot: true, riskLevel: 'medium', tag: 'Meme', liquidity: 89000000, holders: 67000 },
  { id: '4', symbol: 'DEGEN', name: 'Degen', chain: 'Base', price: 0.0156, change1h: 5.2, change24h: 25.8, change7d: 156.3, contractAddress: '0x4ed4e862860bed51a9570b96d89af5e1b0efefen', safetyScore: 4, totalScore: 6, smartMoneyCount: 67, marketCap: 156000000, volume24h: 45000000, isHot: true, riskLevel: 'high', tag: 'Base生态', liquidity: 28000000, holders: 34000 },
  { id: '5', symbol: 'FLOKI', name: 'FLOKI Inu', chain: 'Ethereum', price: 0.000152, change1h: 0.5, change24h: 5.2, change7d: 22.8, contractAddress: '0x43f11c0244a3dD19f0aE98e5B0d2f3d4A8f9b2c1', safetyScore: 5, totalScore: 6, smartMoneyCount: 312, marketCap: 1450000000, volume24h: 89000000, isHot: false, riskLevel: 'medium', tag: 'Meme', liquidity: 67000000, holders: 156000 },
  { id: '6', symbol: 'ORDI', name: 'ORDI', chain: 'Ethereum', price: 42.5, change1h: 1.2, change24h: 3.8, change7d: -5.2, contractAddress: '0x69c1b44a58b7f92131f65c2b3b0d1ee8d90c3b22', safetyScore: 4, totalScore: 6, smartMoneyCount: 45, marketCap: 890000000, volume24h: 23000000, isHot: false, riskLevel: 'medium', tag: 'BTC生态', liquidity: 45000000, holders: 23000 },
  { id: '7', symbol: 'SUI', name: 'Sui', chain: 'Solana', price: 1.23, change1h: 0.3, change24h: 1.5, change7d: 8.9, contractAddress: 'Suiobject', safetyScore: 6, totalScore: 6, smartMoneyCount: 567, marketCap: 3200000000, volume24h: 456000000, isHot: false, riskLevel: 'low', tag: '公链', liquidity: 340000000, holders: 890000 },
  { id: '8', symbol: 'PENDLE', name: 'Pendle', chain: 'Ethereum', price: 3.45, change1h: 2.1, change24h: 15.2, change7d: 45.6, contractAddress: '0x8080a8891c2e3e7c3d2f4a0c8e0e2d2c3b4a5c6', safetyScore: 5, totalScore: 6, smartMoneyCount: 123, marketCap: 680000000, volume24h: 78000000, isHot: true, riskLevel: 'medium', tag: 'DeFi', liquidity: 89000000, holders: 45000 },
  { id: '9', symbol: 'JUP', name: 'Jupiter', chain: 'Solana', price: 0.85, change1h: 3.2, change24h: 18.5, change7d: 62.3, contractAddress: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN', safetyScore: 5, totalScore: 6, smartMoneyCount: 234, marketCap: 1200000000, volume24h: 234000000, isHot: true, riskLevel: 'medium', tag: 'DEX', liquidity: 123000000, holders: 78000 },
  { id: '10', symbol: 'ENA', name: 'Ethena', chain: 'Ethereum', price: 0.92, change1h: -0.5, change24h: 2.3, change7d: -8.5, contractAddress: '0x57d114c7ede2e28ad7d60f8cb619e67e4bf5396c', safetyScore: 5, totalScore: 6, smartMoneyCount: 89, marketCap: 890000000, volume24h: 67000000, isHot: false, riskLevel: 'low', tag: '稳定币', liquidity: 234000000, holders: 34000 },
  { id: '11', symbol: 'CAKE', name: 'PancakeSwap', chain: 'BSC', price: 2.35, change1h: 1.8, change24h: 6.5, change7d: 28.3, contractAddress: '0x0E09FaBB73Bd3ade0a17EC321f8BA47f3791f646', safetyScore: 5, totalScore: 6, smartMoneyCount: 145, marketCap: 720000000, volume24h: 89000000, isHot: true, riskLevel: 'low', tag: 'DEX', liquidity: 156000000, holders: 234000 },
];

// 默认机构数据
const DEFAULT_INSTITUTIONS: Institution[] = [
  { id: '1', name: 'A16z Crypto', type: 'VC', logo: '🔷', action: '领投', target: 'AI Agent 平台', amount: '$1.2B', date: '2小时前', chain: '多链', category: 'AI', description: 'AI与区块链结合的创新项目获得顶级VC青睐' },
  { id: '2', name: 'Paradigm', type: 'VC', logo: '🔴', action: '增持', target: 'DeFi 流动性协议', amount: '$500M', date: '5小时前', chain: 'Ethereum', category: 'DeFi', description: '继续看好以太坊DeFi生态发展' },
  { id: '3', name: 'Binance Labs', type: '交易所', logo: '🟡', action: '孵化', target: 'Web3 开发者工具', amount: '$100M', date: '1天前', chain: 'BSC', category: '基础设施', description: '支持开发者生态，降低Web3入门门槛' },
  { id: '4', name: 'Coinbase Ventures', type: '交易所', logo: '🔵', action: '战略投资', target: 'ZK-Rollup 项目', amount: '$50M', date: '1天前', chain: 'Base', category: 'L2', description: 'ZK技术是L2未来的核心技术方向' },
  { id: '5', name: 'Animoca Brands', type: '项目方', logo: '🎮', action: '领投', target: '链游工作室', amount: '$80M', date: '2天前', chain: '多链', category: 'GameFi', description: '区块链游戏将成为下一个增长爆发点' },
  { id: '6', name: 'OKX Ventures', type: '交易所', logo: '🌐', action: '投资', target: '模块化区块链', amount: '$40M', date: '3天前', chain: '多链', category: '基础设施', description: '模块化架构是区块链可扩展性的未来' },
  { id: '7', name: 'Polychain', type: 'VC', logo: '🟣', action: '跟投', target: 'RWA 资产协议', amount: '$30M', date: '3天前', chain: 'Ethereum', category: 'RWA', description: '现实世界资产代币化趋势正在加速' },
];

// 默认决策数据
const DEFAULT_DECISIONS: Decision[] = [
  { id: '1', type: 'institution_sync', title: '机构同频', description: 'A16z领投AI Agent赛道，Base生态代币活跃度上升', token: DEFAULT_TOKENS[3], chain: 'Base', confidence: 92, tag: '高置信度', timestamp: '10分钟前', reasons: ['A16z投资$1.2B进入AI领域', 'Base日活地址突破50万', 'DEGEN 24h涨幅25.8%'] },
  { id: '2', type: 'smart_money', title: '聪明钱共振', description: '3个聪明钱地址同时增持WIF，总计$2.3M', token: DEFAULT_TOKENS[2], chain: 'Solana', confidence: 88, tag: '聪明钱信号', timestamp: '30分钟前', reasons: ['聪明钱地址数量增加45%', '链上大额转账买入', '持币地址集中度下降'] },
  { id: '3', type: 'ecosystem_bonus', title: '生态红利', description: 'Jupiter TVL突破$500M，手续费收入环比增长120%', token: DEFAULT_TOKENS[8], chain: 'Solana', confidence: 85, tag: '生态机会', timestamp: '1小时前', reasons: ['Jupiter 7d涨幅62.3%', 'Solana DEX交易量创新高', 'SUI生态TVL增长85%'] },
  { id: '4', type: 'risk_warning', title: '风险背离', description: 'PEPE 24h交易量激增300%，聪明钱净卖出', token: DEFAULT_TOKENS[1], chain: 'Ethereum', confidence: 75, tag: '⚠️ 谨慎', timestamp: '2小时前', reasons: ['机构地址在减持', '合约风险评分下降', 'Meme热潮可能接近尾声'] },
  { id: '5', type: 'institution_sync', title: '机构同频', description: 'Paradigm增持DeFi协议，流动性有望改善', token: DEFAULT_TOKENS[7], chain: 'Ethereum', confidence: 82, tag: '关注', timestamp: '3小时前', reasons: ['Paradigm投资$500M', 'PENDLE 7d涨幅45.6%', '机构持仓占比提升'] },
];

// 格式化数字
const formatNumber = (num: number, decimals = 2): string => {
  if (num >= 1e9) return `${(num / 1e9).toFixed(decimals)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(decimals)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(decimals)}K`;
  return num.toFixed(decimals);
};

// 格式化价格
const formatPrice = (price: number): string => {
  if (price >= 1000) return `$${price.toFixed(2)}`;
  if (price >= 1) return `$${price.toFixed(2)}`;
  if (price >= 0.01) return `$${price.toFixed(4)}`;
  return `$${price.toFixed(6)}`;
};

// 生成买入链接
const generateBuyLinks = (token: Token) => {
  const explorer = CHAIN_CONFIG[token.chain]?.explorer || '';
  const contractUrl = `${explorer}/token/${token.contractAddress}`;
  
  // 获取链ID
  const chainIdMap: Record<string, string> = {
    'Solana': 'solana',
    'Ethereum': '1',
    'BSC': '56',
    'Base': '8453',
    'Arbitrum': '42161',
    'Polygon': '137',
  };
  const chainId = chainIdMap[token.chain] || '1';
  
  // TP钱包 - 跳转买入页面
  const tpLink = token.chain === 'Solana'
    ? `tokenpocket://wallet/buy?symbol=${token.symbol}&address=${token.contractAddress}&chain=solana`
    : `tokenpocket://wallet/buy?symbol=${token.symbol}&address=${token.contractAddress}&chainId=${chainId}`;
  
  // TP钱包 HTTPS 跳转（备选，用于浏览器环境）
  const tpHttpsLink = `https://tokenpocket.pages.dev/#/swap?inputCurrency=BNB&outputCurrency=${token.contractAddress}`;
  
  // OKX钱包 - 跳转买入页面
  const okxLink = `okx://wallet/inscribe?address=${token.contractAddress}&chain=${token.chain}`;
  
  // Binance Web3钱包 - 跳转Swap页面
  const binanceLink = token.chain === 'BSC' || token.chain === 'Ethereum'
    ? `bnbwallet://swap?inputCurrency=BNB&outputCurrency=${token.contractAddress}`
    : `https://web3.binance.com/en/trade/profile?inputCurrency=${token.contractAddress}`;
  
  return { tpLink, okxLink, binanceLink, contractUrl };
};

export default function SignalScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabType>('realtime');
  const [filter, setFilter] = useState<FilterType>('hot');
  const [chainFilter, setChainFilter] = useState<ChainFilter>('全部');
  const [searchQuery, setSearchQuery] = useState('');
  const [tokens, setTokens] = useState<Token[]>(DEFAULT_TOKENS);
  const [filteredTokens, setFilteredTokens] = useState<Token[]>(DEFAULT_TOKENS);
  const [institutions] = useState<Institution[]>(DEFAULT_INSTITUTIONS);
  const [decisions] = useState<Decision[]>(DEFAULT_DECISIONS);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [buyModalVisible, setBuyModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [slippage, setSlippage] = useState('1%');
  const [webPrompt, setWebPrompt] = useState<string | null>(null);
  const [contractModalVisible, setContractModalVisible] = useState(false);
  const [contractAddressForModal, setContractAddressForModal] = useState('');

  // 辅助函数
  const shortenAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const copyToClipboard = async (text: string) => {
    try {
      if (navigator.clipboard && Clipboard.setString) {
        await Clipboard.setString(text);
        alert('已复制到剪贴板');
      }
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  // 筛选代币
  React.useEffect(() => {
    let filtered = [...tokens];

    if (searchQuery) {
      filtered = filtered.filter(t => 
        t.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (chainFilter !== '全部') {
      filtered = filtered.filter(t => t.chain === chainFilter);
    }

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
  }, [tokens, filter, chainFilter, searchQuery]);

  // 下拉刷新
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // 模拟刷新
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  // 打开详情页
  const handleOpenDetail = (token: Token) => {
    setSelectedToken(token);
    setDetailModalVisible(true);
  };

  // 复制合约链接
  const handlePasteLink = async (token: Token) => {
    const link = `https://dexscreener.com/${token.chain}/${token.contractAddress}`;
    try {
      await Clipboard.setString(link);
      Alert.alert('已复制', '合约链接已复制到剪贴板');
    } catch (e) {
      Alert.alert('提示', '复制失败，请手动复制');
    }
  };

  // 打开买入页面
  const handleOpenBuyPage = (token: Token) => {
    setSelectedToken(token);
    setBuyModalVisible(true);
  };

  // 复制地址
  const handleCopyAddress = (address: string) => {
    if (navigator.clipboard) {
      Clipboard.setString(address);
      Alert.alert('已复制', '合约地址已复制到剪贴板');
    }
  };

  // TP 钱包交易
  const handleTPWalletTrade = async (token: Token, amount: string) => {
    if (typeof window === 'undefined' || !window.trustwallet) {
      Alert.alert('提示', '请先连接 TP 钱包');
      return;
    }

    try {
      // 检查链是否匹配
      const chainIds: Record<string, number> = {
        'Ethereum': 1,
        'BSC': 56,
        'Base': 8453,
        'Arbitrum': 42161,
        'Polygon': 137,
      };
      const targetChainId = chainIds[token.chain];

      if (!targetChainId) {
        Alert.alert('提示', `TP 钱包暂不支持 ${token.chain} 链`);
        return;
      }

      // 切换到目标链
      try {
        await window.trustwallet.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${targetChainId.toString(16)}` }],
        });
      } catch (switchError: any) {
        // 如果链不存在，尝试添加
        if (switchError.code === 4902) {
          Alert.alert('提示', `请先添加 ${token.chain} 网络`);
        }
        return;
      }

      // 构建交易数据 - 使用 ETH/BNB 购买代币
      // 这里需要使用 DEX 合约进行 swap，为了简化示例使用转账交易
      const txParams = {
        to: token.contractAddress, // 代币合约地址
        value: `0x${(parseFloat(amount) * 1e18).toString(16)}`, // 发送的 ETH/BNB 数量
        data: '0xa9059cbb0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000', // 转账 data (需要替换为正确的代币转账 data)
      };

      // 发送交易
      const result = await window.trustwallet.request({
        method: 'eth_sendTransaction',
        params: [txParams],
      });

      Alert.alert('成功', `交易已提交: ${result}`);
    } catch (error: any) {
      console.error('TP 钱包交易失败:', error);
      Alert.alert('交易失败', error.message || '请重试');
    }
  };

  // 打开钱包
  const handleOpenWallet = async (walletType: 'tp' | 'okx' | 'binance' | 'contract') => {
    // 如果没有选择代币，直接返回
    if (!selectedToken) {
      console.log('handleOpenWallet: no selectedToken');
      return;
    }
    
    // 检查合约地址是否存在
    if (!selectedToken.contractAddress) {
      console.log('handleOpenWallet: no contractAddress');
      return;
    }
    
    const links = generateBuyLinks(selectedToken);
    
    // TP 钱包特殊处理 - Web环境下点击TP按钮显示合约地址
    if (walletType === 'tp') {
      // 使用自定义 Modal 显示合约地址
      console.log('handleOpenWallet TP: showing contract modal, address:', selectedToken.contractAddress);
      setContractAddressForModal(selectedToken.contractAddress);
      setContractModalVisible(true);
      return;
    }
    
    if (walletType === 'contract') {
      // 复制合约地址
      setContractAddressForModal(selectedToken.contractAddress);
      setContractModalVisible(true);
      return;
    }

    const url = walletType === 'okx' ? links.okxLink : links.binanceLink;
    
    // Web 环境使用多种方式尝试跳转 Deep Link
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      try {
        // 方式1: 直接设置 location (某些浏览器可能阻止)
        window.location.href = url;
        
        // 方式2: 延迟 100ms 后使用 iframe (作为备选方案)
        setTimeout(() => {
          try {
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = url;
            iframe.id = 'wallet-iframe';
            document.body.appendChild(iframe);
            // 1秒后移除 iframe
            setTimeout(() => {
              const el = document.getElementById('wallet-iframe');
              if (el) document.body.removeChild(el);
            }, 1000);
          } catch (e) {
            console.log('iframe approach failed');
          }
        }, 100);
      } catch (e) {
        console.log('location.href failed');
      }
      return;
    }
    
    // 原生环境使用 Linking
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert('提示', `请安装${walletType === 'okx' ? 'OKX' : 'Binance'}钱包`);
      }
    } catch (e) {
      Alert.alert('错误', '无法打开钱包应用');
    }
  };

  // 渲染代币卡片
  const renderTokenCard = (token: Token, index: number) => (
    <TouchableOpacity 
      key={token.id} 
      style={styles.tokenCard}
      onPress={() => handleOpenBuyPage(token)}
    >
      {/* 第一行：排名 + 代币信息 + 价格 */}
      <View style={styles.tokenRow1}>
        {/* 排名 */}
        <View style={[
          styles.rankBadge,
          index === 0 && styles.rankGold,
          index === 1 && styles.rankSilver,
          index === 2 && styles.rankBronze,
        ]}>
          <Text style={[
            styles.rankText,
            index === 0 && styles.rankGoldText,
            index === 1 && styles.rankSilverText,
            index === 2 && styles.rankBronzeText,
          ]}>
            {index + 1}
          </Text>
        </View>
        
        {/* 代币信息 */}
        <View style={styles.tokenMain}>
          <View style={styles.tokenNameRow}>
            <Text style={[styles.chainIcon, { color: CHAIN_CONFIG[token.chain]?.color }]}>
              {CHAIN_CONFIG[token.chain]?.icon}
            </Text>
            <Text style={styles.tokenSymbol}>{token.symbol}</Text>
            <Text style={styles.tokenName}>{token.name}</Text>
            {token.isHot && (
              <View style={styles.hotBadge}>
                <Text style={styles.hotBadgeText}>HOT</Text>
              </View>
            )}
          </View>
        </View>
        
        {/* 价格和涨幅 */}
        <View style={styles.priceMain}>
          <Text style={styles.priceText}>{formatPrice(token.price)}</Text>
          <Text style={[styles.changeText, token.change24h > 0 ? styles.changeUp : styles.changeDown]}>
            {token.change24h > 0 ? '↑' : '↓'} {Math.abs(token.change24h).toFixed(1)}%
          </Text>
        </View>
      </View>

      {/* 第二行：数据指标 */}
      <View style={styles.metricsRow}>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>市值</Text>
          <Text style={styles.metricValue}>${formatNumber(token.marketCap)}</Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>24h交易</Text>
          <Text style={styles.metricValue}>${formatNumber(token.volume24h)}</Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>聪明钱</Text>
          <Text style={[styles.metricValue, { color: '#00F0FF' }]}>{token.smartMoneyCount}</Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={[styles.metric, styles.metricLast]}>
          <Text style={styles.metricLabel}>安全</Text>
          <View style={styles.safetyBadge}>
            <Ionicons name="shield-checkmark" size={11} color="#00FF88" />
            <Text style={styles.safetyText}>{token.safetyScore}/{token.totalScore}</Text>
          </View>
        </View>
      </View>

      {/* 第三行：标签和操作 */}
      <View style={styles.tokenRow3}>
        {/* 标签 */}
        <View style={styles.tagSection}>
          {token.tag && (
            <View style={[styles.tag, { backgroundColor: CHAIN_CONFIG[token.chain]?.color + '20' }]}>
              <Text style={[styles.tagText, { color: CHAIN_CONFIG[token.chain]?.color }]}>
                {token.tag}
              </Text>
            </View>
          )}
          {token.riskLevel === 'high' && (
            <View style={[styles.tag, { backgroundColor: '#FF6B6B20' }]}>
              <Ionicons name="warning" size={10} color="#FF6B6B" />
              <Text style={[styles.tagText, { color: '#FF6B6B', marginLeft: 3 }]}>高风险</Text>
            </View>
          )}
        </View>
        
        {/* 操作按钮 */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.detailBtn} onPress={() => handleOpenDetail(token)}>
            <Text style={styles.detailBtnText}>详情</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buyBtn} onPress={() => handleOpenBuyPage(token)}>
            <Ionicons name="cart" size={13} color="#0A0A0F" />
            <Text style={styles.buyBtnText}>买入</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.pasteLinkBtn} onPress={() => handlePasteLink(token)}>
            <Ionicons name="link" size={13} color="#00F0FF" />
            <Text style={styles.pasteLinkBtnText}>复制链接</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 合约地址 */}
      <TouchableOpacity style={styles.contractRow} onPress={() => copyToClipboard(token.contractAddress)}>
        <Text style={styles.contractLabel}>合约:</Text>
        <Text style={styles.contractText}>{shortenAddress(token.contractAddress)}</Text>
        <Ionicons name="copy-outline" size={12} color="#00F0FF" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  // 渲染实时Tab
  const renderRealtimeTab = () => (
    <ScrollView 
      style={styles.tabContent}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00F0FF" />}
    >
      {/* 搜索框 */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={16} color="#555570" />
        <TextInput
          style={styles.searchInput}
          placeholder="搜索代币..."
          placeholderTextColor="#555570"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={16} color="#555570" />
          </TouchableOpacity>
        )}
      </View>

      {/* 筛选标签 */}
      <View style={styles.filterRow}>
        {(['hot', 'gainers', 'smart', 'safe'] as FilterType[]).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, filter === f && styles.filterChipActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={styles.filterChipIcon}>
              {f === 'hot' ? '🔥' : f === 'gainers' ? '📈' : f === 'smart' ? '💰' : '🛡️'}
            </Text>
            <Text style={[styles.filterChipText, filter === f && styles.filterChipTextActive]}>
              {f === 'hot' ? '热度' : f === 'gainers' ? '涨幅' : f === 'smart' ? '聪明钱' : '安全'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

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
      <View style={styles.tokenList}>
        {filteredTokens.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={48} color="#555570" />
            <Text style={styles.emptyText}>暂无符合条件的代币</Text>
          </View>
        ) : (
          filteredTokens.map((token, index) => renderTokenCard(token, index))
        )}
      </View>
      <View style={{ height: Math.max(insets.bottom, 20) }} />
    </ScrollView>
  );

  // 渲染机构Tab
  const renderInstitutionTab = () => (
    <ScrollView style={styles.tabContent} refreshControl={
      <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00F0FF" />
    }>
      <View style={styles.sectionHeader}>
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
              
              <Text style={styles.institutionDesc}>{item.description}</Text>
              
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
      <View style={styles.bottomPadding} />
    </ScrollView>
  );

  // 渲染决策台Tab
  const renderDecisionTab = () => (
    <ScrollView style={styles.tabContent} refreshControl={
      <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00F0FF" />
    }>
      <View style={styles.sectionHeader}>
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

            <View style={styles.reasonsList}>
              {decision.reasons.map((reason, idx) => (
                <View key={idx} style={styles.reasonItem}>
                  <Text style={styles.reasonBullet}>•</Text>
                  <Text style={styles.reasonText}>{reason}</Text>
                </View>
              ))}
            </View>

            {decision.token && (
              <TouchableOpacity 
                style={styles.decisionTokenCard}
                onPress={() => handleOpenBuyPage(decision.token!)}
              >
                <View style={styles.decisionTokenInfo}>
                  <Text style={[styles.decisionTokenSymbol, { color: CHAIN_CONFIG[decision.token.chain]?.color }]}>
                    {CHAIN_CONFIG[decision.token.chain]?.icon} {decision.token.symbol}
                  </Text>
                  <Text style={styles.decisionTokenPrice}>{formatPrice(decision.token.price)}</Text>
                </View>
                <View style={styles.decisionTokenChange}>
                  <Text style={[styles.decisionTokenChangeText, decision.token.change24h > 0 ? styles.changeUp : styles.changeDown]}>
                    {decision.token.change24h > 0 ? '↑' : '↓'} {Math.abs(decision.token.change24h).toFixed(1)}%
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            <View style={styles.decisionFooter}>
              <Text style={styles.decisionTimestamp}>{decision.timestamp}</Text>
              {decision.type !== 'risk_warning' && decision.token && (
                <TouchableOpacity 
                  style={styles.decisionBuyBtn}
                  onPress={() => handleOpenBuyPage(decision.token!)}
                >
                  <Text style={styles.decisionBuyBtnText}>一键跟投</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </View>
      <View style={styles.bottomPadding} />
    </ScrollView>
  );

  // 渲染详情Modal
  const renderDetailModal = () => (
    <Modal
      visible={detailModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setDetailModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {selectedToken && (
            <>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setDetailModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#EAEAEA" />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>代币详情</Text>
                <View style={{ width: 24 }} />
              </View>

              <ScrollView style={styles.modalBody}>
                {/* 代币信息卡片 */}
                <View style={styles.detailTokenCard}>
                  <View style={styles.detailTokenRow}>
                    <View style={[styles.detailChainIcon, { backgroundColor: CHAIN_CONFIG[selectedToken.chain]?.color + '20' }]}>
                      <Text style={styles.detailChainIconText}>{CHAIN_CONFIG[selectedToken.chain]?.icon}</Text>
                    </View>
                    <View style={styles.detailTokenInfo}>
                      <Text style={styles.detailTokenSymbol}>{selectedToken.symbol}</Text>
                      <Text style={styles.detailTokenName}>{selectedToken.name}</Text>
                    </View>
                    <View style={styles.detailPriceInfo}>
                      <Text style={styles.detailPrice}>{formatPrice(selectedToken.price)}</Text>
                      <Text style={[styles.detailChange, selectedToken.change24h > 0 ? styles.changeUp : styles.changeDown]}>
                        {selectedToken.change24h > 0 ? '↑' : '↓'} {Math.abs(selectedToken.change24h).toFixed(1)}%
                      </Text>
                    </View>
                  </View>
                </View>

                {/* 核心指标 */}
                <View style={styles.detailMetrics}>
                  <View style={styles.detailMetricItem}>
                    <Text style={styles.detailMetricLabel}>市值</Text>
                    <Text style={styles.detailMetricValue}>${formatNumber(selectedToken.marketCap)}</Text>
                  </View>
                  <View style={styles.detailMetricItem}>
                    <Text style={styles.detailMetricLabel}>24h交易</Text>
                    <Text style={styles.detailMetricValue}>${formatNumber(selectedToken.volume24h)}</Text>
                  </View>
                  <View style={styles.detailMetricItem}>
                    <Text style={styles.detailMetricLabel}>流动性</Text>
                    <Text style={styles.detailMetricValue}>${formatNumber(selectedToken.liquidity || 0)}</Text>
                  </View>
                </View>

                {/* 安全评分 */}
                <View style={styles.detailSafetyCard}>
                  <Text style={styles.detailSectionTitle}>安全评分</Text>
                  <View style={styles.detailSafetyRow}>
                    <View style={styles.detailSafetyScore}>
                      <Text style={styles.detailSafetyNum}>{selectedToken.smartMoneyCount || 0}</Text>
                      <Text style={styles.detailSafetyLabel}>/6</Text>
                    </View>
                    <View style={styles.detailSafetyBar}>
                      <View style={[styles.detailSafetyFill, { width: `${((selectedToken.smartMoneyCount || 0) / 6) * 100}%` }]} />
                    </View>
                  </View>
                  <Text style={styles.detailSafetyDesc}>
                    {selectedToken.smartMoneyCount >= 5 ? '优秀' : selectedToken.smartMoneyCount >= 3 ? '良好' : '一般'}
                  </Text>
                </View>

                {/* 合约地址 */}
                <TouchableOpacity 
                  style={styles.detailContract}
                  onPress={() => {
                    Clipboard.setString(selectedToken.contractAddress);
                    Alert.alert('已复制', '合约地址已复制');
                  }}
                >
                  <Text style={styles.detailContractLabel}>合约地址</Text>
                  <View style={styles.detailContractRow}>
                    <Text style={styles.detailContractAddr} numberOfLines={1}>
                      {selectedToken.contractAddress}
                    </Text>
                    <Ionicons name="copy" size={18} color="#00F0FF" />
                  </View>
                </TouchableOpacity>

                {/* 操作按钮 */}
                <View style={styles.detailActions}>
                  <TouchableOpacity style={styles.detailBuyBtn} onPress={() => {
                    setDetailModalVisible(false);
                    handleOpenBuyPage(selectedToken);
                  }}>
                    <Ionicons name="cart" size={18} color="#0A0A0F" />
                    <Text style={styles.detailBuyBtnText}>去买入</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.detailCopyBtn} onPress={async () => {
                    const link = `https://dexscreener.com/${selectedToken.chain}/${selectedToken.contractAddress}`;
                    await Clipboard.setString(link);
                    Alert.alert('已复制', '链接已复制到剪贴板');
                  }}>
                    <Ionicons name="link" size={18} color="#00F0FF" />
                    <Text style={styles.detailCopyBtnText}>复制链接</Text>
                  </TouchableOpacity>
                </View>

                {/* 免责声明 */}
                <View style={styles.disclaimer}>
                  <Ionicons name="information-circle" size={16} color="#555570" />
                  <Text style={styles.disclaimerText}>
                    投资有风险，跟单需谨慎。以上信息仅供参考，不构成投资建议。
                  </Text>
                </View>
              </ScrollView>
            </>
          )}
        </View>
      </View>
    </Modal>
  );

  // 渲染买入Modal
  const renderBuyModal = () => (
    <Modal
      visible={buyModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setBuyModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {selectedToken && (
            <>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setBuyModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#EAEAEA" />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>买入 {selectedToken.symbol}</Text>
                <View style={{ width: 24 }} />
              </View>

              <ScrollView style={styles.modalBody}>
                {/* 代币信息 */}
                <View style={styles.buyTokenInfo}>
                  <View style={[styles.buyChainIcon, { backgroundColor: CHAIN_CONFIG[selectedToken.chain]?.color + '20' }]}>
                    <Text style={styles.buyChainIconText}>{CHAIN_CONFIG[selectedToken.chain]?.icon}</Text>
                  </View>
                  <View style={styles.buyTokenDetails}>
                    <Text style={styles.buyTokenSymbol}>{selectedToken.symbol}</Text>
                    <Text style={styles.buyTokenName}>{selectedToken.name}</Text>
                  </View>
                  <View style={styles.buyTokenPrice}>
                    <Text style={styles.buyPriceText}>{formatPrice(selectedToken.price)}</Text>
                    <Text style={[styles.buyChangeText, selectedToken.change24h > 0 ? styles.changeUp : styles.changeDown]}>
                      {selectedToken.change24h > 0 ? '↑' : '↓'} {Math.abs(selectedToken.change24h).toFixed(1)}%
                    </Text>
                  </View>
                </View>

                {/* 风险提示 */}
                {selectedToken.riskLevel === 'high' && (
                  <View style={styles.buyRiskAlert}>
                    <Ionicons name="warning" size={20} color="#FF6B6B" />
                    <View style={styles.buyRiskContent}>
                      <Text style={styles.buyRiskTitle}>高风险代币</Text>
                      <Text style={styles.buyRiskText}>
                        • 建议滑点设置 ≥ 2%{'\n'}
                        • 单笔金额不超过钱包10%{'\n'}
                        • 仔细核对合约地址
                      </Text>
                    </View>
                  </View>
                )}

                {/* 市场数据 */}
                <View style={styles.buyStats}>
                  <View style={styles.buyStatItem}>
                    <Text style={styles.buyStatLabel}>市值</Text>
                    <Text style={styles.buyStatValue}>${formatNumber(selectedToken.marketCap)}</Text>
                  </View>
                  <View style={styles.buyStatItem}>
                    <Text style={styles.buyStatLabel}>24h交易</Text>
                    <Text style={styles.buyStatValue}>${formatNumber(selectedToken.volume24h)}</Text>
                  </View>
                  <View style={styles.buyStatItem}>
                    <Text style={styles.buyStatLabel}>流动性</Text>
                    <Text style={styles.buyStatValue}>${formatNumber(selectedToken.liquidity || 0)}</Text>
                  </View>
                </View>

                {/* 合约地址 */}
                <TouchableOpacity 
                  style={styles.contractSection}
                  onPress={() => handleCopyAddress(selectedToken.contractAddress)}
                >
                  <Text style={styles.contractLabel}>合约地址</Text>
                  <View style={styles.contractRow}>
                    <Text style={styles.contractAddress} numberOfLines={1}>
                      {selectedToken.contractAddress}
                    </Text>
                    <Ionicons name="copy" size={18} color="#00F0FF" />
                  </View>
                </TouchableOpacity>

                {/* 选择钱包 */}
                <Text style={styles.walletTitle}>选择钱包买入</Text>
                
                <TouchableOpacity 
                  style={styles.walletOption}
                  onPress={() => {
                    if (selectedToken?.contractAddress) {
                      const address = selectedToken.contractAddress;
                      // 尝试使用 window.prompt 显示合约地址（兼容某些 WebView）
                      if (typeof window !== 'undefined' && window.prompt) {
                        const result = window.prompt(`合约地址 (点击复制):`, address);
                        if (result === address) {
                          // 用户确认复制
                          Alert.alert('提示', '请手动长按复制合约地址');
                        }
                      } else if (navigator.clipboard) {
                        // 尝试使用 clipboard API
                        navigator.clipboard.writeText(address).then(() => {
                          Alert.alert('已复制', '合约地址已复制到剪贴板');
                        }).catch(() => {
                          setContractAddressForModal(address);
                          setContractModalVisible(true);
                        });
                      } else {
                        // 回退到弹窗
                        setContractAddressForModal(address);
                        setContractModalVisible(true);
                      }
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.walletIcon}>
                    <Text style={{ fontSize: 20 }}>💎</Text>
                  </View>
                  <View style={styles.walletInfo}>
                    <Text style={styles.walletName}>TokenPocket</Text>
                    <Text style={styles.walletDesc}>点击复制合约地址</Text>
                  </View>
                  <Ionicons name="copy" size={20} color="#00F0FF" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.walletOption} onPress={() => handleOpenWallet('okx')}>
                  <View style={styles.walletIcon}>
                    <Text style={{ fontSize: 20 }}>🟠</Text>
                  </View>
                  <View style={styles.walletInfo}>
                    <Text style={styles.walletName}>OKX Wallet</Text>
                    <Text style={styles.walletDesc}>OKX交易所官方钱包</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#555570" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.walletOption} onPress={() => handleOpenWallet('binance')}>
                  <View style={styles.walletIcon}>
                    <Text style={{ fontSize: 20 }}>🟡</Text>
                  </View>
                  <View style={styles.walletInfo}>
                    <Text style={styles.walletName}>Binance Web3</Text>
                    <Text style={styles.walletDesc}>Binance交易所Web3钱包</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#555570" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.walletOption} onPress={() => handleOpenWallet('contract')}>
                  <View style={styles.walletIcon}>
                    <Text style={{ fontSize: 20 }}>📋</Text>
                  </View>
                  <View style={styles.walletInfo}>
                    <Text style={styles.walletName}>复制合约地址</Text>
                    <Text style={styles.walletDesc}>复制后手动到钱包购买</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#555570" />
                </TouchableOpacity>

                {/* Web端提示 */}
                {webPrompt && (
                  <View style={styles.webPromptBox}>
                    <Ionicons name="information-circle" size={20} color="#FF9500" />
                    <Text style={styles.webPromptText}>{webPrompt}</Text>
                  </View>
                )}

                {/* 滑点设置 */}
                <View style={styles.slippageSection}>
                  <Text style={styles.slippageTitle}>滑点保护</Text>
                  <View style={styles.slippageOptions}>
                    {['0.5%', '1%', '2%', '3%'].map((opt) => (
                      <TouchableOpacity
                        key={opt}
                        style={[styles.slippageChip, slippage === opt && styles.slippageChipActive]}
                        onPress={() => setSlippage(opt)}
                      >
                        <Text style={[styles.slippageChipText, slippage === opt && styles.slippageChipTextActive]}>
                          {opt}
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
            </>
          )}
        </View>
      </View>
    </Modal>
  );

  // 合约地址弹窗 - 用于TP钱包浏览器
  const renderContractModal = () => (
    <Modal visible={contractModalVisible} transparent animationType="fade">
      <TouchableWithoutFeedback onPress={() => setContractModalVisible(false)}>
        <View style={styles.webPromptOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.webPromptContainer}>
              <Text style={styles.webPromptTitle}>复制合约地址</Text>
              <Text style={styles.webPromptText}>
                请复制以下合约地址到 TP 钱包的浏览器中粘贴搜索
              </Text>
              <View style={styles.contractAddressBox}>
                <Text style={styles.contractAddressText} selectable>
                  {contractAddressForModal}
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.copyButton}
                onPress={() => {
                  if (typeof navigator !== 'undefined' && navigator.clipboard) {
                    navigator.clipboard.writeText(contractAddressForModal);
                  }
                  setContractModalVisible(false);
                }}
              >
                <Text style={styles.copyButtonText}>复制合约地址</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setContractModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>关闭</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  // 设置面板
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
          <View style={styles.slippageSection}>
            <Text style={styles.slippageTitle}>默认滑点</Text>
            <View style={styles.slippageOptions}>
              {['0.5%', '1%', '2%', '3%'].map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={[styles.slippageChip, slippage === opt && styles.slippageChipActive]}
                  onPress={() => setSlippage(opt)}
                >
                  <Text style={[styles.slippageChipText, slippage === opt && styles.slippageChipTextActive]}>
                    {opt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

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
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.container}>
        {/* 顶部栏 */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>📡 机构跟投</Text>
          <TouchableOpacity style={styles.settingsButton} onPress={() => setSettingsVisible(true)}>
            <Ionicons name="settings-outline" size={22} color="#EAEAEA" />
          </TouchableOpacity>
        </View>

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

        {/* Tab内容 */}
        {activeTab === 'realtime' && renderRealtimeTab()}
        {activeTab === 'institution' && renderInstitutionTab()}
        {activeTab === 'decision' && renderDecisionTab()}

        {/* 快速复制合约地址入口 - 用于TP钱包 */}
        <TouchableOpacity 
          style={styles.copyContractButton}
          onPress={() => {
            // 复制列表第一个代币的合约地址
            if (tokens.length > 0) {
              const addr = tokens[0].contractAddress;
              try {
                navigator.clipboard.writeText(addr);
                Alert.alert('已复制', `已复制 ${tokens[0].symbol} 合约地址到剪贴板`);
              } catch (e) {
                Alert.alert('合约地址', addr);
              }
            }
          }}
        >
          <Ionicons name="copy-outline" size={18} color="#00F0FF" />
          <Text style={styles.copyContractText}>一键复制合约地址</Text>
        </TouchableOpacity>

        {/* TP钱包备用：显示所有代币合约地址 */}
        <View style={styles.contractListContainer}>
          <Text style={styles.contractListTitle}>📋 合约地址列表（TP钱包备用）</Text>
          {tokens.slice(0, 5).map((token) => (
            <TouchableOpacity 
              key={token.id}
              style={styles.contractListItem}
              onPress={() => {
                try {
                  navigator.clipboard.writeText(token.contractAddress);
                  Alert.alert('已复制', `已复制 ${token.symbol} 合约地址`);
                } catch (e) {
                  Alert.alert(token.symbol, token.contractAddress);
                }
              }}
            >
              <Text style={styles.contractListSymbol}>{token.symbol}</Text>
              <Text style={styles.contractListAddress} numberOfLines={1}>
                {token.contractAddress.slice(0, 10)}...{token.contractAddress.slice(-6)}
              </Text>
              <Ionicons name="copy" size={16} color="#00F0FF" />
            </TouchableOpacity>
          ))}
        </View>

        {/* 买入Modal */}
        {renderBuyModal()}

        {/* 合约地址弹窗 */}
        {renderContractModal()}

        {/* 详情Modal */}
        {renderDetailModal()}

        {/* 设置面板 */}
        {settingsVisible && renderSettings()}

        {/* 风险提示 */}
        <View style={styles.riskBanner}>
          <Ionicons name="shield-checkmark" size={14} color="#555570" />
          <Text style={styles.riskBannerText}>投资有风险，跟单需谨慎</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0A0F',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'web' ? 16 : 50,
    paddingBottom: 12,
    backgroundColor: '#0A0A0F',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  settingsButton: {
    padding: 8,
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  tab: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginRight: 8,
    borderRadius: 18,
    backgroundColor: '#1a1a2e',
  },
  tabActive: {
    backgroundColor: '#00F0FF20',
  },
  tabText: {
    fontSize: 14,
    color: '#888',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#00F0FF',
  },
  tabContent: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
    marginHorizontal: 12,
    marginBottom: 8,
    paddingHorizontal: 10,
    height: 36,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: '#EAEAEA',
  },
  filterScroll: {
    paddingHorizontal: 12,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
  },
  filterChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: '#1a1a2e',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterChipActive: {
    backgroundColor: '#00F0FF15',
    borderColor: '#00F0FF',
  },
  filterChipIcon: {
    fontSize: 11,
    marginRight: 4,
  },
  filterChipText: {
    fontSize: 12,
    color: '#888',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#00F0FF',
  },
  chainFilterScroll: {
    marginTop: 6,
    paddingHorizontal: 16,
  },
  chainFilterRow: {
    flexDirection: 'row',
    gap: 10,
  },
  chainChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: '#1a1a2e',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chainChipActive: {
    backgroundColor: '#00F0FF15',
    borderColor: '#00F0FF',
  },
  chainChipText: {
    fontSize: 12,
    color: '#888',
    fontWeight: '500',
  },
  chainChipTextActive: {
    color: '#00F0FF',
  },
  tokenList: {
    marginTop: 8,
    paddingBottom: 20,
  },
  tokenCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 10,
    marginBottom: 6,
    marginHorizontal: 12,
    borderWidth: 1,
    borderColor: '#252540',
  },
  tokenRow1: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  rankBadge: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#252540',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  rankGold: { backgroundColor: '#FFD70030' },
  rankSilver: { backgroundColor: '#C0C0C030' },
  rankBronze: { backgroundColor: '#CD7F3230' },
  rankText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#888',
  },
  rankGoldText: { color: '#FFD700' },
  rankSilverText: { color: '#C0C0C0' },
  rankBronzeText: { color: '#CD7F32' },
  tokenMain: {
    flex: 1,
  },
  tokenNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chainIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  tokenSymbol: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  tokenName: {
    fontSize: 11,
    color: '#888',
    marginLeft: 4,
  },
  hotBadge: {
    backgroundColor: '#FF6B6B20',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6,
  },
  hotBadgeText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#FF6B6B',
  },
  priceMain: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  changeText: {
    fontSize: 11,
    marginTop: 1,
  },
  changeUp: {
    color: '#00FF88',
  },
  changeDown: {
    color: '#FF6B6B',
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f0f1a',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  metric: {
    flex: 1,
    alignItems: 'center',
  },
  metricLast: {
    flex: 1,
    alignItems: 'center',
  },
  metricDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#252540',
  },
  metricLabel: {
    fontSize: 9,
    color: '#888',
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 11,
    fontWeight: '600',
    color: '#EAEAEA',
  },
  safetyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  safetyText: {
    fontSize: 11,
    color: '#00FF88',
    marginLeft: 2,
  },
  tokenRow3: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  tagSection: {
    flexDirection: 'row',
    gap: 4,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  detailBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00F0FF',
    backgroundColor: 'transparent',
    shadowColor: '#00F0FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  detailBtnText: {
    color: '#00F0FF',
    fontSize: 12,
    fontWeight: '600',
  },
  buyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#00F0FF',
    gap: 4,
    shadowColor: '#00F0FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 5,
  },
  buyBtnText: {
    color: '#0A0A0F',
    fontSize: 12,
    fontWeight: '700',
  },
  pasteLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00F0FF',
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    gap: 4,
  },
  pasteLinkBtnText: {
    color: '#00F0FF',
    fontSize: 11,
    fontWeight: '600',
  },
  contractRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#252540',
    gap: 4,
  },
  contractLabel: {
    fontSize: 10,
    color: '#666',
  },
  contractText: {
    fontSize: 10,
    color: '#00F0FF',
    fontFamily: 'monospace',
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: '#555570',
    marginTop: 12,
  },
  bottomPadding: {
    height: 20,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  timeline: {
    paddingLeft: 24,
    paddingRight: 16,
  },
  timelineItem: {
    position: 'relative',
    paddingBottom: 20,
  },
  timelineDot: {
    position: 'absolute',
    left: -20,
    top: 16,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#00F0FF',
  },
  timelineLine: {
    position: 'absolute',
    left: -15,
    top: 32,
    width: 2,
    height: '100%',
    backgroundColor: '#252540',
  },
  timelineCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#252540',
  },
  institutionHeader: {
    marginBottom: 12,
  },
  institutionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  institutionIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  institutionName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  institutionDate: {
    fontSize: 11,
    color: '#666',
    marginLeft: 8,
  },
  institutionAction: {
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00F0FF',
  },
  targetText: {
    fontSize: 14,
    color: '#EAEAEA',
  },
  institutionDesc: {
    fontSize: 12,
    color: '#888',
    marginBottom: 12,
    lineHeight: 18,
  },
  institutionMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  amountBadge: {
    backgroundColor: '#00FF8820',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
  },
  amountText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#00FF88',
  },
  chainBadge: {
    backgroundColor: '#00F0FF20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
  },
  chainText: {
    fontSize: 11,
    color: '#00F0FF',
  },
  categoryBadge: {
    backgroundColor: '#7C3AED20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 11,
    color: '#A855F7',
  },
  decisionList: {
    paddingHorizontal: 16,
  },
  decisionCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#252540',
  },
  decisionCardWarning: {
    borderColor: '#FF6B6B40',
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
    borderRadius: 8,
  },
  decisionTypeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  confidenceBadge: {
    alignItems: 'flex-end',
  },
  confidenceLabel: {
    fontSize: 10,
    color: '#666',
  },
  confidenceValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  decisionDescription: {
    fontSize: 13,
    color: '#EAEAEA',
    lineHeight: 20,
    marginBottom: 12,
  },
  reasonsList: {
    marginBottom: 12,
  },
  reasonItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  reasonBullet: {
    color: '#00F0FF',
    marginRight: 8,
  },
  reasonText: {
    fontSize: 12,
    color: '#888',
    flex: 1,
  },
  decisionTokenCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#252540',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  decisionTokenInfo: {},
  decisionTokenSymbol: {
    fontSize: 16,
    fontWeight: '700',
  },
  decisionTokenPrice: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  decisionTokenChange: {},
  decisionTokenChangeText: {
    fontSize: 14,
    fontWeight: '600',
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
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  decisionBuyBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0A0A0F',
  },
  // 买入Modal样式
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1a1a2e',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#252540',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalBody: {
    padding: 16,
  },
  // 详情Modal样式
  detailTokenCard: {
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#252545',
  },
  detailTokenRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailChainIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailChainIconText: {
    fontSize: 22,
  },
  detailTokenInfo: {
    flex: 1,
    marginLeft: 12,
  },
  detailTokenSymbol: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  detailTokenName: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  detailPriceInfo: {
    alignItems: 'flex-end',
  },
  detailPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  detailChange: {
    fontSize: 12,
    marginTop: 2,
  },
  detailMetrics: {
    flexDirection: 'row',
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#252545',
  },
  detailMetricItem: {
    flex: 1,
    alignItems: 'center',
  },
  detailMetricLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
  },
  detailMetricValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  detailSafetyCard: {
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#252545',
  },
  detailSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  detailSafetyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailSafetyScore: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginRight: 12,
  },
  detailSafetyNum: {
    fontSize: 28,
    fontWeight: '700',
    color: '#00F0FF',
  },
  detailSafetyLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailSafetyBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#252545',
    borderRadius: 4,
  },
  detailSafetyFill: {
    height: 8,
    backgroundColor: '#00F0FF',
    borderRadius: 4,
  },
  detailSafetyDesc: {
    fontSize: 12,
    color: '#888',
  },
  detailContract: {
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#252545',
  },
  detailContractLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  detailContractRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailContractAddr: {
    flex: 1,
    fontSize: 12,
    color: '#00F0FF',
    fontFamily: 'monospace',
  },
  detailActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  detailBuyBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00F0FF',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  detailBuyBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0A0A0F',
  },
  detailCopyBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#00F0FF',
    gap: 8,
  },
  detailCopyBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00F0FF',
  },
  buyTokenInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  buyChainIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buyChainIconText: {
    fontSize: 24,
  },
  buyTokenDetails: {
    flex: 1,
    marginLeft: 12,
  },
  buyTokenSymbol: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  buyTokenName: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  buyTokenPrice: {
    alignItems: 'flex-end',
  },
  buyPriceText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  buyChangeText: {
    fontSize: 13,
    marginTop: 2,
  },
  buyRiskAlert: {
    flexDirection: 'row',
    backgroundColor: '#FF6B6B20',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  buyRiskContent: {
    flex: 1,
    marginLeft: 10,
  },
  buyRiskTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B6B',
    marginBottom: 4,
  },
  buyRiskText: {
    fontSize: 12,
    color: '#FF9999',
    lineHeight: 18,
  },
  buyStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#252540',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  buyStatItem: {
    alignItems: 'center',
  },
  buyStatLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
  },
  buyStatValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  contractSection: {
    marginBottom: 20,
  },
  contractAddress: {
    flex: 1,
    fontSize: 12,
    color: '#00F0FF',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  walletTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  walletOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#252540',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  walletIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  walletInfo: {
    flex: 1,
    marginLeft: 12,
  },
  walletName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  walletDesc: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  webPromptBox: {
    backgroundColor: '#1E3A5F',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  webPromptText: {
    fontSize: 13,
    color: '#FFD700',
    textAlign: 'center',
    lineHeight: 20,
  },
  slippageSection: {
    marginTop: 16,
    marginBottom: 20,
  },
  slippageTitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 10,
  },
  slippageOptions: {
    flexDirection: 'row',
  },
  slippageChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#252540',
    marginRight: 8,
  },
  slippageChipActive: {
    backgroundColor: '#00F0FF',
  },
  slippageChipText: {
    fontSize: 13,
    color: '#888',
  },
  slippageChipTextActive: {
    color: '#0A0A0F',
    fontWeight: '600',
  },
  disclaimer: {
    flexDirection: 'row',
    backgroundColor: '#252540',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 20,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 11,
    color: '#555570',
    marginLeft: 8,
    lineHeight: 16,
  },
  // 设置面板样式
  settingsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
  },
  settingsBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  settingsPanel: {
    backgroundColor: '#1a1a2e',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '60%',
  },
  settingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#252540',
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  settingsContent: {
    padding: 16,
  },
  riskBanner: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#0A0A0F',
    borderTopWidth: 1,
    borderTopColor: '#1a1a2e',
  },
  riskBannerText: {
    fontSize: 11,
    color: '#555570',
    marginLeft: 6,
  },
  // 合约地址弹窗样式
  contractModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  contractModalContent: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    borderWidth: 1,
    borderColor: '#252545',
  },
  contractModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  contractAddressBox: {
    backgroundColor: '#252545',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  contractAddressLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
  },
  contractAddressText: {
    fontSize: 13,
    color: '#00F0FF',
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    wordBreak: 'break-all',
  },
  contractModalHint: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  contractButtonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  contractButton: {
    flex: 1,
    backgroundColor: '#252545',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  contractButtonPrimary: {
    backgroundColor: '#00F0FF',
  },
  contractButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  contractButtonTextPrimary: {
    color: '#0A0A0F',
  },
  closeButton: {
    marginTop: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 14,
    color: '#666',
  },
  // 合约地址弹窗样式
  webPromptOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  webPromptContainer: {
    backgroundColor: '#252540',
    borderRadius: 16,
    padding: 20,
    width: '85%',
    maxWidth: 340,
  },
  webPromptTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  copyButton: {
    backgroundColor: '#00F0FF',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  copyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#555570',
  },
  cancelButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  // 一键复制合约地址按钮
  copyContractButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a2e',
    marginHorizontal: 16,
    marginVertical: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#00F0FF',
    gap: 8,
  },
  copyContractText: {
    fontSize: 14,
    color: '#00F0FF',
    fontWeight: '500',
  },
  // 合约地址列表样式
  contractListContainer: {
    marginHorizontal: 16,
    marginBottom: 30,
    backgroundColor: 'rgba(0, 240, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.2)',
  },
  contractListTitle: {
    color: '#00F0FF',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 10,
  },
  contractListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  contractListSymbol: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    width: 60,
  },
  contractListAddress: {
    color: '#888',
    fontSize: 12,
    flex: 1,
    fontFamily: 'monospace',
  },
});
