import express from 'express';

const router = express.Router();

// 行情场景类型
type ScenarioType = 'defi' | 'meme' | 'ai' | 'gaming' | 'infrastructure' | 'layer2';

// 场景配置
const SCENARIO_CONFIG: Record<ScenarioType, { name: string; color: string; description: string }> = {
  defi: { name: 'DeFi 潜力币', color: '#00FF88', description: '去中心化金融赛道' },
  meme: { name: 'Meme 币', color: '#FFD700', description: '社区驱动的代币' },
  ai: { name: 'AI 赛道', color: '#00F0FF', description: '人工智能相关代币' },
  gaming: { name: 'GameFi', color: '#BF00FF', description: '区块链游戏代币' },
  infrastructure: { name: '基础设施', color: '#4A90D9', description: '区块链基础设施' },
  layer2: { name: 'Layer2', color: '#F472B6', description: '二层网络解决方案' },
};

// 代币数据
const generateTokens = (scenario: ScenarioType) => {
  const tokens: Record<ScenarioType, any[]> = {
    defi: [
      { symbol: 'UNI', name: 'Uniswap', price: 12.45, change: 5.2, volume: 234567890, marketCap: 7456789000, liquidity: 456789000 },
      { symbol: 'AAVE', name: 'Aave', price: 156.78, change: -2.3, volume: 123456789, marketCap: 2345678000, liquidity: 234567000 },
      { symbol: 'CRV', name: 'Curve', price: 0.89, change: 8.7, volume: 98765432, marketCap: 890123000, liquidity: 123456000 },
      { symbol: 'MKR', name: 'Maker', price: 1456.32, change: 1.8, volume: 45678901, marketCap: 1345672000, liquidity: 98765432 },
      { symbol: 'SNX', name: 'Synthetix', price: 3.45, change: -1.2, volume: 34567890, marketCap: 1234567000, liquidity: 56789000 },
      { symbol: 'COMP', name: 'Compound', price: 89.12, change: 3.4, volume: 56789012, marketCap: 7890123000, liquidity: 78901234 },
    ],
    meme: [
      { symbol: 'DOGE', name: 'Dogecoin', price: 0.1234, change: 12.5, volume: 1234567890, marketCap: 17654321000, liquidity: 2345678900 },
      { symbol: 'SHIB', name: 'Shiba Inu', price: 0.00002345, change: -3.2, volume: 987654321, marketCap: 13890123456, liquidity: 1234567890 },
      { symbol: 'PEPE', name: 'Pepe', price: 0.00001234, change: 25.6, volume: 567890123, marketCap: 5234567890, liquidity: 890123456 },
      { symbol: 'FLOKI', name: 'FLOKI', price: 0.000234, change: 8.9, volume: 234567890, marketCap: 2234567890, liquidity: 345678900 },
      { symbol: 'BONK', name: 'Bonk', price: 0.000034, change: -1.5, volume: 345678901, marketCap: 2345678900, liquidity: 456789012 },
    ],
    ai: [
      { symbol: 'AGIX', name: 'SingularityNET', price: 0.89, change: 15.3, volume: 234567890, marketCap: 1123456789, liquidity: 123456789 },
      { symbol: 'FET', name: 'Fetch.ai', price: 2.34, change: 22.1, volume: 456789012, marketCap: 1956789012, liquidity: 234567890 },
      { symbol: 'OCEAN', name: 'Ocean Protocol', price: 1.23, change: 8.7, volume: 123456789, marketCap: 712345678, liquidity: 98765432 },
      { symbol: 'RENDER', name: 'Render', price: 7.89, change: 18.5, volume: 345678901, marketCap: 2987654321, liquidity: 234567890 },
      { symbol: 'AI16Z', name: 'ai16z', price: 12.45, change: 45.2, volume: 567890123, marketCap: 1234567890, liquidity: 345678901 },
    ],
    gaming: [
      { symbol: 'AXS', name: 'Axie Infinity', price: 8.90, change: -4.5, volume: 123456789, marketCap: 1234567890, liquidity: 234567890 },
      { symbol: 'GALA', name: 'Gala Games', price: 0.034, change: 12.3, volume: 234567890, marketCap: 1234567890, liquidity: 345678901 },
      { symbol: 'IMX', name: 'Immutable', price: 2.34, change: 5.6, volume: 345678901, marketCap: 3456789012, liquidity: 234567890 },
      { symbol: 'MANA', name: 'Decentraland', price: 0.45, change: -2.1, volume: 98765432, marketCap: 890123456, liquidity: 123456789 },
      { symbol: 'SAND', name: 'The Sandbox', price: 0.56, change: 3.4, volume: 123456789, marketCap: 1123456789, liquidity: 156789012 },
    ],
    infrastructure: [
      { symbol: 'ETH', name: 'Ethereum', price: 3456.78, change: 2.3, volume: 12345678900, marketCap: 415678901234, liquidity: 12345678900 },
      { symbol: 'MATIC', name: 'Polygon', price: 0.89, change: -1.2, volume: 567890123, marketCap: 7890123456, liquidity: 345678901 },
      { symbol: 'ARB', name: 'Arbitrum', price: 1.23, change: 4.5, volume: 456789012, marketCap: 3456789012, liquidity: 234567890 },
      { symbol: 'OP', name: 'Optimism', price: 2.34, change: 6.7, volume: 345678901, marketCap: 2345678901, liquidity: 198765432 },
      { symbol: 'LINK', name: 'Chainlink', price: 15.67, change: 3.2, volume: 567890123, marketCap: 9123456789, liquidity: 234567890 },
    ],
    layer2: [
      { symbol: 'ARB', name: 'Arbitrum', price: 1.23, change: 4.5, volume: 456789012, marketCap: 3456789012, liquidity: 234567890 },
      { symbol: 'OP', name: 'Optimism', price: 2.34, change: 6.7, volume: 345678901, marketCap: 2345678901, liquidity: 198765432 },
      { symbol: 'MATIC', name: 'Polygon', price: 0.89, change: -1.2, volume: 567890123, marketCap: 7890123456, liquidity: 345678901 },
      { symbol: 'ZK', name: 'zkSync', price: 0.34, change: 8.9, volume: 123456789, marketCap: 890123456, liquidity: 98765432 },
      { symbol: 'STARK', name: 'StarkNet', price: 0.89, change: 12.3, volume: 234567890, marketCap: 1234567890, liquidity: 156789012 },
    ],
  };
  return tokens[scenario] || tokens.defi;
};

// 获取所有场景
router.get('/scenarios', (req, res) => {
  const scenarios = Object.entries(SCENARIO_CONFIG).map(([key, config]) => ({
    id: key,
    ...config,
    tokenCount: generateTokens(key as ScenarioType).length,
  }));
  res.json({ success: true, data: scenarios });
});

// 获取场景详情
// 获取热门精选（每个赛道前3名）
router.get('/featured', (req: any, res: any) => {
  const scenarios: ScenarioType[] = ['defi', 'meme', 'ai', 'gaming', 'infrastructure', 'layer2'];
  
  const featured = scenarios.map(scenario => {
    const tokens = generateTokens(scenario);
    // 按成交量排序取前3
    const top3 = tokens
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 3)
      .map(t => ({ ...t, rank: tokens.indexOf(t) + 1 }));
    
    return {
      scenario,
      config: SCENARIO_CONFIG[scenario],
      tokens: top3
    };
  });
  
  res.json({
    success: true,
    data: featured,
    updatedAt: new Date().toISOString()
  });
});

router.get('/:scenario', (req, res) => {
  const { scenario } = req.params;
  const validScenario = scenario as ScenarioType;
  
  if (!SCENARIO_CONFIG[validScenario]) {
    return res.status(400).json({ success: false, error: 'Invalid scenario' });
  }
  
  const tokens = generateTokens(validScenario);
  const config = SCENARIO_CONFIG[validScenario];
  
  res.json({
    success: true,
    data: {
      id: validScenario,
      ...config,
      tokens,
      stats: {
        totalTokens: tokens.length,
        avgChange: tokens.reduce((sum, t) => sum + t.change, 0) / tokens.length,
        avgVolume: tokens.reduce((sum, t) => sum + t.volume, 0) / tokens.length,
        totalMarketCap: tokens.reduce((sum, t) => sum + t.marketCap, 0),
      },
    },
  });
});

// 获取热门代币
router.get('/hot/tokens', (req, res) => {
  const allTokens = [
    ...generateTokens('defi'),
    ...generateTokens('ai'),
    ...generateTokens('gaming'),
  ].sort((a, b) => b.volume - a.volume).slice(0, 10);
  
  res.json({ success: true, data: allTokens });
});

// 获取代币详情
router.get('/token/:symbol', (req, res) => {
  const { symbol } = req.params;
  const allTokens = [
    ...generateTokens('defi'),
    ...generateTokens('meme'),
    ...generateTokens('ai'),
    ...generateTokens('gaming'),
    ...generateTokens('infrastructure'),
    ...generateTokens('layer2'),
  ];
  
  const token = allTokens.find(t => t.symbol.toUpperCase() === symbol.toUpperCase());
  
  if (!token) {
    return res.status(404).json({ success: false, error: 'Token not found' });
  }
  
  // 生成更多详情
  const details = {
    ...token,
    priceHistory: Array.from({ length: 24 }, (_, i) => ({
      time: i,
      price: token.price * (1 + (Math.random() - 0.5) * 0.1),
    })),
    holders: Math.floor(Math.random() * 1000000) + 10000,
    transactions: Math.floor(Math.random() * 10000000) + 100000,
    contractAddress: `0x${symbol.toLowerCase().repeat(10)}...`,
    website: `https://${symbol.toLowerCase()}.xyz`,
    twitter: `@${symbol}Protocol`,
  };
  
  res.json({ success: true, data: details });
});

export default router;
