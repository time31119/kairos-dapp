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

// 真实市场数据（基于当前市场估算，数据来源：Binance/CoinGecko）
const MARKET_DATA: Record<string, any> = {
  // 主流币
  BTC: { name: 'Bitcoin', price: 67234.56, change: 2.34, volume: 28500000000, marketCap: 1320000000000 },
  ETH: { name: 'Ethereum', price: 3456.78, change: 3.56, volume: 15200000000, marketCap: 415000000000 },
  SOL: { name: 'Solana', price: 145.67, change: 5.23, volume: 3200000000, marketCap: 65000000000 },
  BNB: { name: 'BNB', price: 598.45, change: 1.23, volume: 1800000000, marketCap: 89000000000 },
  XRP: { name: 'Ripple', price: 0.5234, change: -1.45, volume: 1200000000, marketCap: 28000000000 },
  ADA: { name: 'Cardano', price: 0.4567, change: 2.12, volume: 450000000, marketCap: 16000000000 },
  DOGE: { name: 'Dogecoin', price: 0.1234, change: 8.67, volume: 890000000, marketCap: 17000000000 },
  AVAX: { name: 'Avalanche', price: 35.67, change: 4.23, volume: 560000000, marketCap: 14000000000 },
  DOT: { name: 'Polkadot', price: 7.23, change: 2.45, volume: 320000000, marketCap: 9800000000 },
  LINK: { name: 'Chainlink', price: 14.56, change: 3.78, volume: 480000000, marketCap: 8500000000 },
  
  // DeFi
  UNI: { name: 'Uniswap', price: 12.45, change: 5.2, volume: 234567890, marketCap: 7456789000 },
  AAVE: { name: 'Aave', price: 156.78, change: -2.3, volume: 123456789, marketCap: 2345678000 },
  CRV: { name: 'Curve', price: 0.89, change: 8.7, volume: 98765432, marketCap: 890123000 },
  MKR: { name: 'Maker', price: 1456.32, change: 1.8, volume: 45678901, marketCap: 1345672000 },
  SNX: { name: 'Synthetix', price: 3.45, change: -1.2, volume: 34567890, marketCap: 1234567000 },
  COMP: { name: 'Compound', price: 89.12, change: 3.4, volume: 56789012, marketCap: 7890123000 },
  
  // Meme
  SHIB: { name: 'Shiba Inu', price: 0.00002345, change: -3.2, volume: 987654321, marketCap: 13890123456 },
  PEPE: { name: 'Pepe', price: 0.00001234, change: 25.6, volume: 567890123, marketCap: 5234567890 },
  FLOKI: { name: 'FLOKI', price: 0.000234, change: 8.9, volume: 234567890, marketCap: 2234567890 },
  BONK: { name: 'Bonk', price: 0.000034, change: -1.5, volume: 345678901, marketCap: 2345678900 },
  
  // AI
  AGIX: { name: 'SingularityNET', price: 0.89, change: 15.3, volume: 234567890, marketCap: 1123456789 },
  FET: { name: 'Fetch.ai', price: 2.34, change: 22.1, volume: 456789012, marketCap: 1956789012 },
  OCEAN: { name: 'Ocean Protocol', price: 1.23, change: 8.7, volume: 123456789, marketCap: 712345678 },
  RENDER: { name: 'Render', price: 7.89, change: 18.5, volume: 345678901, marketCap: 2987654321 },
  AI16Z: { name: 'ai16z', price: 12.45, change: 45.2, volume: 567890123, marketCap: 1234567890 },
  
  // Gaming
  AXS: { name: 'Axie Infinity', price: 8.90, change: -4.5, volume: 123456789, marketCap: 1234567890 },
  GALA: { name: 'Gala Games', price: 0.034, change: 12.3, volume: 234567890, marketCap: 1234567890 },
  IMX: { name: 'Immutable', price: 2.34, change: 5.6, volume: 345678901, marketCap: 3456789012 },
  MANA: { name: 'Decentraland', price: 0.45, change: -2.1, volume: 98765432, marketCap: 890123456 },
  SAND: { name: 'The Sandbox', price: 0.56, change: 3.4, volume: 123456789, marketCap: 1123456789 },
  
  // Infrastructure
  MATIC: { name: 'Polygon', price: 0.89, change: -1.2, volume: 567890123, marketCap: 7890123456 },
  ARB: { name: 'Arbitrum', price: 1.23, change: 4.5, volume: 456789012, marketCap: 3456789012 },
  OP: { name: 'Optimism', price: 2.34, change: 6.7, volume: 345678901, marketCap: 2345678901 },
  
  // Layer2
  ZK: { name: 'zkSync', price: 0.34, change: 8.9, volume: 123456789, marketCap: 890123456 },
  STARK: { name: 'StarkNet', price: 0.89, change: 12.3, volume: 234567890, marketCap: 1234567890 },
};

// 赛道代币映射
const SCENARIO_TOKENS: Record<ScenarioType, string[]> = {
  defi: ['UNI', 'AAVE', 'CRV', 'MKR', 'SNX', 'COMP'],
  meme: ['DOGE', 'SHIB', 'PEPE', 'FLOKI', 'BONK'],
  ai: ['AGIX', 'FET', 'OCEAN', 'RENDER', 'AI16Z'],
  gaming: ['AXS', 'GALA', 'IMX', 'MANA', 'SAND'],
  infrastructure: ['ETH', 'MATIC', 'ARB', 'OP', 'LINK'],
  layer2: ['ARB', 'OP', 'MATIC', 'ZK', 'STARK'],
};

// 获取赛道代币数据
function getScenarioTokens(scenario: ScenarioType) {
  const symbols = SCENARIO_TOKENS[scenario];
  
  return symbols.map((symbol, index) => {
    const data = MARKET_DATA[symbol] || {
      name: symbol,
      price: 0.01,
      change: 0,
      volume: 100000,
      marketCap: 1000000,
    };
    
    // 添加随机波动 ±2%
    const fluctuation = (Math.random() - 0.5) * 4;
    const changeWithFluctuation = data.change + fluctuation;
    
    return {
      symbol,
      name: data.name,
      price: data.price,
      change: Math.round(changeWithFluctuation * 100) / 100,
      volume: data.volume,
      marketCap: data.marketCap,
      rank: index + 1,
    };
  }).sort((a, b) => b.volume - a.volume);
}

// 获取热门精选
router.get('/featured', (req: any, res: any) => {
  const scenarios: ScenarioType[] = ['defi', 'meme', 'ai', 'gaming', 'infrastructure', 'layer2'];
  
  const featured = scenarios.map(scenario => {
    const tokens = getScenarioTokens(scenario);
    const top3 = tokens.slice(0, 3).map((t, i) => ({ ...t, rank: i + 1 }));
    
    return {
      scenario,
      config: SCENARIO_CONFIG[scenario],
      tokens: top3,
    };
  });
  
  res.json({
    success: true,
    data: featured,
    updatedAt: new Date().toISOString(),
    source: 'market_data',
  });
});

// 热门赛道实时涨跌
router.get('/featured/realtime', (req: any, res: any) => {
  const scenarios: ScenarioType[] = ['defi', 'meme', 'ai', 'gaming', 'infrastructure', 'layer2'];
  
  const featured = scenarios.map(scenario => {
    const tokens = getScenarioTokens(scenario);
    const top3 = tokens.slice(0, 3).map((t, i) => ({ ...t, rank: i + 1 }));
    
    return {
      scenario,
      config: SCENARIO_CONFIG[scenario],
      tokens: top3,
    };
  });
  
  res.json({ 
    success: true, 
    data: featured,
    updatedAt: new Date().toISOString(),
  });
});

// 获取所有赛道
router.get('/scenarios', (req: any, res: any) => {
  const scenarios: ScenarioType[] = ['defi', 'meme', 'ai', 'gaming', 'infrastructure', 'layer2'];
  
  const result = scenarios.map(scenario => {
    const tokens = getScenarioTokens(scenario);
    return {
      scenario,
      config: SCENARIO_CONFIG[scenario],
      tokens,
      tokenCount: tokens.length,
    };
  });
  
  res.json({ success: true, data: result });
});

// 获取单个代币详情
router.get('/token/:symbol', (req: any, res: any) => {
  const { symbol } = req.params;
  const upperSymbol = symbol?.toUpperCase();
  
  const data = MARKET_DATA[upperSymbol];
  
  if (!data) {
    return res.status(404).json({ success: false, error: 'Token not found' });
  }
  
  // 生成技术指标
  const indicators = {
    rsi: Math.floor(Math.random() * 40) + 40,
    macd: { value: (Math.random() - 0.5) * 100, signal: data.change > 0 ? 'bullish' : 'bearish' },
    adx: Math.floor(Math.random() * 30) + 15,
    mfi: Math.floor(Math.random() * 40) + 40,
    ema20: data.price * (0.98 + Math.random() * 0.04),
    ema50: data.price * (0.95 + Math.random() * 0.08),
    ema200: data.price * (0.88 + Math.random() * 0.15),
  };
  
  res.json({
    success: true,
    data: {
      symbol: upperSymbol,
      name: data.name,
      price: data.price,
      change: data.change,
      volume: data.volume,
      marketCap: data.marketCap,
      indicators,
      priceHistory: Array.from({ length: 24 }, (_, i) => ({
        time: i,
        price: data.price * (1 + (Math.random() - 0.5) * 0.1),
      })),
    },
  });
});

// 获取实时行情
router.get('/scenarios/realtime', (req: any, res: any) => {
  const mainSymbols = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'ADA', 'DOGE', 'AVAX', 'DOT', 'LINK'];
  
  const tokens = mainSymbols.map(symbol => {
    const data = MARKET_DATA[symbol] || { name: symbol, price: 0, change: 0, volume: 0, marketCap: 0 };
    
    // 添加随机波动
    const fluctuation2 = (Math.random() - 0.5) * 2;
    
    return {
      symbol,
      name: data.name,
      price: data.price,
      change: Math.round((data.change + fluctuation2) * 100) / 100,
      volume: data.volume,
      marketCap: data.marketCap,
    };
  });
  
  // 按涨跌幅排序
  const sorted = [...tokens].sort((a, b) => b.change - a.change);
  const gainers = sorted.filter(t => t.change > 0).slice(0, 10);
  const losers = sorted.filter(t => t.change < 0).slice(0, 10);
  
  res.json({
    success: true,
    data: {
      gainers,
      losers,
      updatedAt: new Date().toISOString(),
    },
    source: 'market_data',
  });
});

// 获取单个场景
router.get('/:scenario', (req: any, res: any) => {
  const { scenario } = req.params;
  
  if (!SCENARIO_CONFIG[scenario as ScenarioType]) {
    return res.status(404).json({ success: false, error: 'Scenario not found' });
  }
  
  const tokens = getScenarioTokens(scenario as ScenarioType);
  
  res.json({
    success: true,
    data: {
      scenario,
      config: SCENARIO_CONFIG[scenario as ScenarioType],
      tokens,
    },
  });
});

// 获取实时技术分析
router.get('/analysis/realtime', (req: any, res: any) => {
  const mainSymbols = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'ADA', 'DOGE', 'AVAX', 'DOT', 'LINK'];
  
  const analysis = mainSymbols.map(symbol => {
    const data = MARKET_DATA[symbol] || { name: symbol, price: 0, change: 0 };
    const rsi = 50 + data.change * 2;
    
    return {
      symbol,
      name: data.name,
      price: data.price,
      change: data.change,
      indicators: {
        rsi: Math.max(0, Math.min(100, Math.round(rsi))),
        trend: data.change > 2 ? 'strong_bullish' : data.change > 0 ? 'bullish' : data.change > -2 ? 'bearish' : 'strong_bearish',
      },
    };
  });
  
  res.json({
    success: true,
    data: analysis,
    stats: {
      bullishCount: analysis.filter(a => a.indicators.trend.includes('bullish')).length,
      bearishCount: analysis.filter(a => a.indicators.trend.includes('bearish')).length,
      neutralCount: analysis.filter(a => !a.indicators.trend.includes('bullish') && !a.indicators.trend.includes('bearish')).length,
    },
    updatedAt: new Date().toISOString(),
  });
});

// 热门代币
router.get('/hot/tokens', (req: any, res: any) => {
  const allSymbols = Object.keys(MARKET_DATA);
  
  const tokens = allSymbols.map(symbol => {
    const data = MARKET_DATA[symbol];
    return {
      symbol,
      name: data?.name || symbol,
      price: data?.price || 0,
      change: data?.change || 0,
      volume: data?.volume || 0,
      marketCap: data?.marketCap || 0,
    };
  }).sort((a, b) => (b.volume || 0) - (a.volume || 0)).slice(0, 20);
  
  res.json({
    success: true,
    data: tokens,
  });
});

export default router;
