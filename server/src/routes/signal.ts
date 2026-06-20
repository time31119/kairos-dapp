import { Router } from 'express';

const router = Router();

// 代币合约地址映射
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

// 热门代币列表
const HOT_TOKENS = [
  { id: '1', symbol: 'BONK', name: 'Bonk', chain: 'Solana', price: 0.00002845, change24h: 12.5, safetyScore: 5, totalScore: 6, smartMoneyCount: 156, marketCap: 2850, volume24h: 145, isHot: true, riskLevel: 'medium' },
  { id: '2', symbol: 'PEPE', name: 'Pepe', chain: 'Ethereum', price: 0.00001234, change24h: 8.3, safetyScore: 4, totalScore: 6, smartMoneyCount: 89, marketCap: 5200, volume24h: 320, isHot: true, riskLevel: 'high', institutionTag: 'Meme热潮' },
  { id: '3', symbol: 'WIF', name: 'dogwifhat', chain: 'Solana', price: 2.85, change24h: -2.1, safetyScore: 5, totalScore: 6, smartMoneyCount: 234, marketCap: 2850, volume24h: 189, isHot: true, riskLevel: 'medium' },
  { id: '4', symbol: 'DEGEN', name: 'Degen', chain: 'Base', price: 0.0156, change24h: 25.8, safetyScore: 4, totalScore: 6, smartMoneyCount: 67, marketCap: 156, volume24h: 45, isHot: true, riskLevel: 'high', institutionTag: 'Base生态' },
  { id: '5', symbol: 'FLOKI', name: 'FLOKI Inu', chain: 'Ethereum', price: 0.000152, change24h: 5.2, safetyScore: 5, totalScore: 6, smartMoneyCount: 312, marketCap: 1450, volume24h: 89, isHot: false, riskLevel: 'medium' },
  { id: '6', symbol: 'ORDI', name: 'ORDI', chain: 'Ethereum', price: 42.5, change24h: 3.8, safetyScore: 4, totalScore: 6, smartMoneyCount: 45, marketCap: 890, volume24h: 23, isHot: false, riskLevel: 'medium' },
  { id: '7', symbol: 'SUI', name: 'Sui', chain: 'Solana', price: 1.23, change24h: 1.5, safetyScore: 6, totalScore: 6, smartMoneyCount: 567, marketCap: 3200, volume24h: 456, isHot: false, riskLevel: 'low' },
  { id: '8', symbol: 'PENDLE', name: 'Pendle', chain: 'Ethereum', price: 3.45, change24h: 15.2, safetyScore: 5, totalScore: 6, smartMoneyCount: 123, marketCap: 680, volume24h: 78, isHot: true, riskLevel: 'medium' },
  { id: '9', symbol: 'NEIRO', name: 'Neiro', chain: 'Solana', price: 0.00234, change24h: 45.2, safetyScore: 3, totalScore: 6, smartMoneyCount: 78, marketCap: 234, volume24h: 56, isHot: true, riskLevel: 'high' },
  { id: '10', symbol: 'MOTHER', name: 'MOTHER', chain: 'Solana', price: 0.0234, change24h: 32.1, safetyScore: 3, totalScore: 6, smartMoneyCount: 45, marketCap: 123, volume24h: 34, isHot: true, riskLevel: 'high', institutionTag: 'Meme热潮' },
];

// 机构数据
const INSTITUTIONS = [
  { id: '1', name: 'A16z Crypto', type: 'VC', logo: '🔷', action: '投资', target: 'AI + Blockchain 初创公司', amount: '$1.2B', date: '2小时前', chain: '多链', category: 'AI' },
  { id: '2', name: 'Paradigm', type: 'VC', logo: '🔴', action: '增持', target: 'DeFi 流动性协议', amount: '$500M', date: '5小时前', chain: 'Ethereum', category: 'DeFi' },
  { id: '3', name: 'Binance Labs', type: '交易所', logo: '🟡', action: '孵化', target: 'Web3 开发者工具', amount: '$100M', date: '1天前', chain: 'BSC', category: '基础设施' },
  { id: '4', name: 'Coinbase Ventures', type: '交易所', logo: '🔵', action: '战略投资', target: 'ZK-Rollup 项目', amount: '$50M', date: '1天前', chain: 'Base', category: 'L2' },
  { id: '5', name: 'Animoca Brands', type: '游戏', logo: '🎮', action: '领投', target: '链游工作室', amount: '$80M', date: '2天前', chain: '多链', category: 'GameFi' },
  { id: '6', name: 'OKX Ventures', type: '交易所', logo: '🌐', action: '投资', target: '模块化区块链', amount: '$40M', date: '3天前', chain: '多链', category: '基础设施' },
  { id: '7', name: 'Polychain Capital', type: 'VC', logo: '💎', action: '领投', target: 'BTC Layer2 解决方案', amount: '$60M', date: '3天前', chain: 'Bitcoin', category: 'L2' },
  { id: '8', name: 'Dragonfly', type: 'VC', logo: '🦋', action: '投资', target: 'RWA 资产协议', amount: '$35M', date: '4天前', chain: '多链', category: 'RWA' },
];

// 决策台数据
const DECISIONS = [
  { id: '1', type: 'institution_sync', title: '机构同频', description: 'A16z投资AI赛道 + Base生态代币活跃度上升', token: 'DEGEN', chain: 'Base', confidence: 92, tag: '高置信度', timestamp: '10分钟前' },
  { id: '2', type: 'smart_money', title: '聪明钱共振', description: '3个聪明钱地址同时增持WIF，总计$2.3M', token: 'WIF', chain: 'Solana', confidence: 88, tag: '聪明钱信号', timestamp: '30分钟前' },
  { id: '3', type: 'ecosystem_bonus', title: '生态红利', description: 'Base日活地址突破50万，TVL环比增长45%', token: 'DEGEN', chain: 'Base', confidence: 82, tag: '生态机会', timestamp: '1小时前' },
  { id: '4', type: 'risk_warning', title: '风险背离', description: 'PEPE 24h交易量激增300%，但机构净卖出', token: 'PEPE', chain: 'Ethereum', confidence: 75, tag: '⚠️ 谨慎', timestamp: '2小时前' },
  { id: '5', type: 'institution_sync', title: '机构同频', description: 'Coinbase Ventures投资ZK赛道，生态代币普涨', token: 'ORDI', chain: 'Ethereum', confidence: 78, tag: '关注', timestamp: '3小时前' },
  { id: '6', type: 'smart_money', title: '聪明钱共振', description: '知名DeFi鲸鱼买入PENDLE，金额$1.8M', token: 'PENDLE', chain: 'Ethereum', confidence: 85, tag: '聪明钱信号', timestamp: '4小时前' },
  { id: '7', type: 'ecosystem_bonus', title: '生态红利', description: 'Solana生态激励计划公布，FLOKI系列受益', token: 'FLOKI', chain: 'Solana', confidence: 76, tag: '生态机会', timestamp: '5小时前' },
];

// 获取代币合约地址
const getTokenAddress = (chain: string, symbol: string): string => {
  const upperSymbol = symbol.toUpperCase();
  if (TOKEN_ADDRESSES[chain]?.[upperSymbol]) {
    return TOKEN_ADDRESSES[chain][upperSymbol];
  }
  return '';
};

// 链信息
const CHAIN_CONFIG: Record<string, { icon: string; color: string }> = {
  'Solana': { icon: '🟢', color: '#00FFA3' },
  'Ethereum': { icon: '🔷', color: '#627EEA' },
  'Base': { icon: '🔵', color: '#0052FF' },
  'BSC': { icon: '🟡', color: '#F0B90B' },
  'Bitcoin': { icon: '🟠', color: '#F7931A' },
};

// 获取跟投信号列表
router.get('/tokens', (req, res) => {
  const { chain, filter, risk } = req.query;

  let tokens = HOT_TOKENS.map(t => ({
    ...t,
    chainIcon: CHAIN_CONFIG[t.chain]?.icon || '🟢',
    contractAddress: getTokenAddress(t.chain, t.symbol),
  }));

  // 链筛选
  if (chain && chain !== '全部') {
    tokens = tokens.filter(t => t.chain === chain);
  }

  // 风险筛选
  if (risk === 'low') {
    tokens = tokens.filter(t => t.riskLevel === 'low' || t.riskLevel === 'medium');
  }

  // 排序
  switch (filter) {
    case 'gainers':
      tokens.sort((a, b) => b.change24h - a.change24h);
      break;
    case 'smart':
      tokens.sort((a, b) => b.smartMoneyCount - a.smartMoneyCount);
      break;
    case 'safe':
      tokens.sort((a, b) => b.safetyScore - a.safetyScore);
      break;
    case 'hot':
    default:
      tokens.sort((a, b) => (b.isHot ? 1 : 0) - (a.isHot ? 1 : 0) || b.smartMoneyCount - a.smartMoneyCount);
  }

  res.json({
    success: true,
    data: tokens,
    timestamp: new Date().toISOString(),
  });
});

// 获取单个代币详情
router.get('/tokens/:symbol', (req, res) => {
  const { symbol } = req.params;
  const upperSymbol = symbol.toUpperCase();

  const token = HOT_TOKENS.find(t => t.symbol.toUpperCase() === upperSymbol);

  if (!token) {
    return res.status(404).json({ success: false, error: 'Token not found' });
  }

  // 查找所有链的合约地址
  const addresses: Record<string, string> = {};
  Object.entries(TOKEN_ADDRESSES).forEach(([chain, tokens]) => {
    if (tokens[upperSymbol]) {
      addresses[chain] = tokens[upperSymbol];
    }
  });

  res.json({
    success: true,
    data: {
      ...token,
      chainIcon: CHAIN_CONFIG[token.chain]?.icon || '🟢',
      addresses,
    },
  });
});

// 获取机构动向
router.get('/institutions', (req, res) => {
  const { category, chain } = req.query;

  let data = [...INSTITUTIONS];

  if (category) {
    data = data.filter(i => i.category === category);
  }

  if (chain && chain !== '全部') {
    data = data.filter(i => i.chain === chain || i.chain === '多链');
  }

  res.json({
    success: true,
    data,
  });
});

// 获取决策台信号
router.get('/decisions', (req, res) => {
  const { type } = req.query;

  let data = [...DECISIONS];

  if (type) {
    data = data.filter(d => d.type === type);
  }

  // 按置信度排序
  data.sort((a, b) => b.confidence - a.confidence);

  res.json({
    success: true,
    data,
  });
});

// 获取统计数据
router.get('/stats', (req, res) => {
  res.json({
    success: true,
    data: {
      totalTokens: HOT_TOKENS.length,
      hotTokens: HOT_TOKENS.filter(t => t.isHot).length,
      totalInstitutions: INSTITUTIONS.length,
      totalDecisions: DECISIONS.length,
      topChains: [
        { chain: 'Solana', count: HOT_TOKENS.filter(t => t.chain === 'Solana').length },
        { chain: 'Ethereum', count: HOT_TOKENS.filter(t => t.chain === 'Ethereum').length },
        { chain: 'Base', count: HOT_TOKENS.filter(t => t.chain === 'Base').length },
      ],
    },
  });
});

export default router;
