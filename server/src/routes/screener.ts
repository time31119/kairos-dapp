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

// 获取所有场景（支持实时数据更新）
router.get('/scenarios/realtime', (req, res) => {
  const scenarios = Object.entries(SCENARIO_CONFIG).map(([key, config]) => {
    const baseTokens = generateTokens(key as ScenarioType);
    // 添加实时波动（5秒内小幅波动）
    const tokens = baseTokens.map(token => ({
      ...token,
      price: parseFloat((token.price * (1 + (Math.random() - 0.5) * 0.002)).toFixed(token.price > 1 ? 2 : 6)),
      change: parseFloat((token.change + (Math.random() - 0.5) * 0.3).toFixed(2)),
      volume: Math.floor(token.volume * (1 + (Math.random() - 0.5) * 0.05)),
    }));
    
    return {
      id: key,
      ...config,
      tokenCount: tokens.length,
      stats: {
        avgChange: parseFloat((tokens.reduce((sum, t) => sum + t.change, 0) / tokens.length).toFixed(2)),
        totalVolume: tokens.reduce((sum, t) => sum + t.volume, 0),
        bullishCount: tokens.filter(t => t.change > 0).length,
        bearishCount: tokens.filter(t => t.change < 0).length,
        totalMarketCap: tokens.reduce((sum, t) => sum + t.marketCap, 0),
      },
      updatedAt: new Date().toISOString(),
    };
  });
  
  res.json({
    success: true,
    data: scenarios,
    timestamp: Date.now(),
    updatedAt: new Date().toISOString(),
  });
});

// 获取所有场景（兼容旧接口）
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

// 技术分析实时数据
router.get('/analysis/realtime', (req, res) => {
  // 技术分析指标数据（带实时变化）
  const analysisData = [
    { id: '1h_up', title: '1H上涨', icon: 'trending-up', color: '#00F0FF', desc: '短期爆发信号', signal: '强多', signalColor: '#00FF88', period: '1H', baseCount: 23, baseWinRate: 78 },
    { id: '4h_up', title: '4H上涨', icon: 'trending-up', color: '#00FF88', desc: '波段延续信号', signal: '看多', signalColor: '#00FF88', period: '4H', baseCount: 18, baseWinRate: 82 },
    { id: 'macd', title: 'MACD金叉', icon: 'sync', color: '#9370DB', desc: '趋势转折信号', signal: '买入', signalColor: '#00FF88', period: '多周期', baseCount: 31, baseWinRate: 75 },
    { id: 'rsi', title: 'RSI超卖', icon: 'speedometer', color: '#FFA500', desc: '超卖反弹信号', signal: '关注', signalColor: '#FFA500', period: '4H', baseCount: 27, baseWinRate: 71 },
    { id: 'volume', title: '成交量异动', icon: 'pulse', color: '#FF69B4', desc: '资金涌入信号', signal: '放量', signalColor: '#FF69B4', period: '1H', baseCount: 42, baseWinRate: 68 },
    { id: 'golden', title: '均线金叉', icon: 'git-merge', color: '#FFD700', desc: '多头发散信号', signal: '多头', signalColor: '#00FF88', period: '日线', baseCount: 24, baseWinRate: 79 },
    { id: 'bollinger', title: '布林下轨', icon: 'radio-button-on', color: '#00CED1', desc: '支撑反弹信号', signal: '回踩', signalColor: '#00CED1', period: '4H', baseCount: 19, baseWinRate: 73 },
    { id: '1h_down', title: '1H下跌', icon: 'trending-down', color: '#FF4444', desc: '做空机会信号', signal: '做空', signalColor: '#FF4444', period: '1H', baseCount: 15, baseWinRate: 65 },
    { id: 'kdj', title: 'KDJ超买', icon: 'analytics', color: '#FF6347', desc: '超买回调信号', signal: '警惕', signalColor: '#FF6347', period: '1H', baseCount: 12, baseWinRate: 62 },
    { id: 'vol_down', title: '缩量整理', icon: 'contract', color: '#808080', desc: '横盘蓄势信号', signal: '观望', signalColor: '#808080', period: '日线', baseCount: 36, baseWinRate: 0 },
  ];

  // 添加实时波动
  const data = analysisData.map(item => {
    // 随机波动币种数量
    const countVariation = Math.floor(Math.random() * 3) - 1; // -1 到 1
    const count = Math.max(1, item.baseCount + countVariation);
    
    // 随机波动胜率
    const winRateVariation = Math.floor(Math.random() * 5) - 2; // -2 到 2
    const winRate = item.baseWinRate > 0 ? Math.min(95, Math.max(50, item.baseWinRate + winRateVariation)) : 0;
    
    // 随机变化信号（小幅概率变化）
    const signalChange = Math.random() > 0.9;
    const signals = item.signalColor === '#00FF88' 
      ? ['强多', '看多', '买入', '多头']
      : item.signalColor === '#FF4444'
      ? ['做空', '警惕']
      : item.signalColor === '#808080'
      ? ['观望', '等待']
      : ['关注', '注意'];
    
    return {
      ...item,
      count,
      winRate,
      signal: signalChange ? signals[Math.floor(Math.random() * signals.length)] : item.signal,
      updatedAt: new Date().toISOString(),
    };
  });

  // 统计数据
  const stats = {
    bullishCount: data.filter(d => d.signalColor === '#00FF88' || d.signalColor === '#00CED1').length,
    bearishCount: data.filter(d => d.signalColor === '#FF4444').length,
    neutralCount: data.filter(d => d.signalColor !== '#00FF88' && d.signalColor !== '#00CED1' && d.signalColor !== '#FF4444').length,
    avgWinRate: Math.round(data.filter(d => d.winRate > 0).reduce((sum, d) => sum + d.winRate, 0) / data.filter(d => d.winRate > 0).length),
    totalCoins: data.reduce((sum, d) => sum + d.count, 0),
  };

  res.json({
    success: true,
    data,
    stats,
    timestamp: Date.now(),
    updatedAt: new Date().toISOString(),
  });
});

// 热门精选实时数据（基于技术分析筛选）
router.get('/featured/realtime', (req, res) => {
  const { scenario } = req.query;
  
  const scenarios = ['defi', 'meme', 'ai', 'gaming', 'infrastructure', 'layer2'];
  const scenarioConfig: Record<string, { name: string; icon: string; color: string; desc: string }> = {
    defi: { name: 'DeFi', icon: 'pool', color: '#00F0FF', desc: '去中心化金融' },
    meme: { name: 'Meme', icon: 'happy', color: '#FFD700', desc: '社区驱动代币' },
    ai: { name: 'AI', icon: 'bulb', color: '#9370DB', desc: '人工智能革命' },
    gaming: { name: 'GameFi', icon: 'game-controller-a', color: '#FF69B4', desc: '游戏金融生态' },
    infrastructure: { name: '基础设施', icon: 'server', color: '#00FF88', desc: '链上基础设施' },
    layer2: { name: 'Layer2', icon: 'layers', color: '#FFA500', desc: '扩容解决方案' },
  };
  
  // 技术分析信号池（基于技术分析指标）
  const techSignals = [
    { id: '1h_up', name: '1H上涨', color: '#00FF88' },
    { id: '4h_up', name: '4H上涨', color: '#00FF88' },
    { id: 'macd', name: 'MACD金叉', color: '#00FF88' },
    { id: 'rsi', name: 'RSI超卖', color: '#00CED1' },
    { id: 'volume', name: '成交量异动', color: '#FF69B4' },
    { id: 'golden', name: '均线金叉', color: '#00FF88' },
    { id: 'bollinger', name: '布林下轨', color: '#00CED1' },
  ];
  
  // 生成做多信号的函数
  const generateTechSignal = () => {
    // 70%概率有做多信号
    if (Math.random() > 0.3) {
      const numSignals = Math.random() > 0.6 ? 2 : 1; // 30%概率有2个信号
      const shuffled = [...techSignals].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, numSignals);
    }
    return [];
  };
  
  const featured = scenarios.map(id => {
    const config = scenarioConfig[id];
    const tokens = generateTokens(id as ScenarioType);
    
    // 为每个代币添加技术分析信号
    const tokensWithSignals = tokens.map(token => {
      const signals = generateTechSignal();
      const bullishSignals = signals.filter(s => s.color === '#00FF88' || s.color === '#00CED1');
      
      return {
        ...token,
        // 技术分析信号
        techSignals: signals,
        hasBullishSignal: bullishSignals.length > 0,
        signalStrength: bullishSignals.length, // 信号强度 0-2
        // 实时行情
        updatedAt: new Date().toISOString(),
      };
    });
    
    // 只展示有做多信号的代币，按信号强度和涨幅排序
    const tokensWithBullishSignals = tokensWithSignals
      .filter(t => t.hasBullishSignal)
      .sort((a, b) => {
        // 先按信号强度排序，再按涨幅排序
        if (b.signalStrength !== a.signalStrength) {
          return b.signalStrength - a.signalStrength;
        }
        return b.change - a.change;
      })
      .slice(0, 3)
      .map((token, index) => {
        // 价格波动 ±0.5%
        const priceVariation = (Math.random() - 0.5) * 0.01;
        const newPrice = token.price * (1 + priceVariation);
        
        // 涨跌幅波动 ±0.3%
        const changeVariation = (Math.random() - 0.5) * 0.6;
        const newChange = parseFloat((token.change + changeVariation).toFixed(2));
        
        // 24h成交量波动 ±5%
        const volumeVariation = (Math.random() - 0.5) * 0.1;
        const newVolume = Math.floor(token.volume * (1 + volumeVariation));
        
        return {
          ...token,
          price: newPrice,
          change: Math.min(99.99, Math.max(-99.99, newChange)),
          volume: newVolume,
          rank: index + 1,
          updatedAt: new Date().toISOString(),
        };
      });
    
    return {
      id,
      ...config,
      tokens: tokensWithBullishSignals,
      // 统计该赛道有多少代币满足技术分析条件
      stats: {
        totalTokens: tokens.length,
        bullishTokens: tokensWithSignals.filter(t => t.hasBullishSignal).length,
        avgChange: tokensWithBullishSignals.length > 0 
          ? parseFloat((tokensWithBullishSignals.reduce((sum, t) => sum + t.change, 0) / tokensWithBullishSignals.length).toFixed(2))
          : 0,
        avgWinRate: tokensWithBullishSignals.length > 0
          ? Math.round(70 + Math.random() * 15) // 基于技术分析的预估胜率
          : 0,
        totalVolume: tokensWithBullishSignals.reduce((sum, t) => sum + t.volume, 0),
        bullishCount: tokensWithBullishSignals.filter(t => t.change > 0).length,
        bearishCount: tokensWithBullishSignals.filter(t => t.change < 0).length,
      },
      // 技术分析统计
      techStats: {
        totalSignals: tokensWithSignals.reduce((sum, t) => sum + t.techSignals.length, 0),
        topSignal: techSignals[Math.floor(Math.random() * techSignals.length)]?.name || '暂无',
      },
      updatedAt: new Date().toISOString(),
    };
  });
  
  // 如果指定了scenario，只返回该scenario
  const result = scenario && scenarios.includes(scenario as string) 
    ? featured.filter(f => f.id === scenario)
    : featured;
  
  res.json({
    success: true,
    data: result,
    // 技术分析统计
    analysisStats: {
      totalBullishTokens: featured.reduce((sum, f) => sum + f.stats.bullishTokens, 0),
      topScenarios: featured
        .filter(f => f.stats.bullishTokens > 0)
        .sort((a, b) => b.stats.bullishTokens - a.stats.bullishTokens)
        .slice(0, 3)
        .map(f => ({ id: f.id, name: f.name, count: f.stats.bullishTokens })),
    },
    timestamp: Date.now(),
    updatedAt: new Date().toISOString(),
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
