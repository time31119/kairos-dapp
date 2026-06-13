import express from 'express';

const router = express.Router();

// 交易员数据
const TRADERS = [
  {
    id: 'trader_001',
    name: '币神张三',
    avatar: null,
    tags: ['连胜中', '高胜率', '币安认证'],
    bio: '专注现货趋势交易，擅长捕捉主流币阶段性机会，管理资金超500万U',
    followers: 2341,
    totalYield: 127.5,
    yieldPercent: 12.8,
    winRate: 82,
    totalTrades: 156,
    avgHoldingTime: '3-5天',
    chains: ['ethereum', 'bsc'],
    pairs: ['BTC/USDT', 'ETH/USDT', 'BNB/USDT'],
    recentTrades: [
      { date: '2024-01-15', action: '做多', pair: 'BTC/USDT', yield: 5.2, status: 'win' },
      { date: '2024-01-14', action: '做多', pair: 'ETH/USDT', yield: 3.8, status: 'win' },
      { date: '2024-01-13', action: '做空', pair: 'BNB/USDT', yield: -1.2, status: 'lose' },
      { date: '2024-01-12', action: '做多', pair: 'BTC/USDT', yield: 4.5, status: 'win' },
      { date: '2024-01-11', action: '做多', pair: 'ETH/USDT', yield: 2.3, status: 'win' },
    ],
  },
  {
    id: 'trader_002',
    name: '量化女王李四',
    avatar: null,
    tags: ['量化策略', '稳健收益', '低回撤'],
    bio: '采用多周期量化策略，日均交易50+次，回撤控制在5%以内',
    followers: 1567,
    totalYield: 89.3,
    yieldPercent: 8.9,
    winRate: 76,
    totalTrades: 423,
    avgHoldingTime: '1-2天',
    chains: ['ethereum', 'polygon'],
    pairs: ['ETH/USDT', 'MATIC/USDT', 'AAVE/USDT'],
    recentTrades: [
      { date: '2024-01-15', action: '做多', pair: 'ETH/USDT', yield: 1.5, status: 'win' },
      { date: '2024-01-15', action: '做空', pair: 'MATIC/USDT', yield: 0.8, status: 'win' },
      { date: '2024-01-14', action: '做多', pair: 'AAVE/USDT', yield: 2.1, status: 'win' },
      { date: '2024-01-14', action: '做空', pair: 'ETH/USDT', yield: -0.5, status: 'lose' },
      { date: '2024-01-13', action: '做多', pair: 'MATIC/USDT', yield: 1.2, status: 'win' },
    ],
  },
  {
    id: 'trader_003',
    name: '合约之王王五',
    avatar: null,
    tags: ['高收益', '高风险', '带单达人'],
    bio: '专注合约带单，单月最高收益率200%+，追求极致收益',
    followers: 4521,
    totalYield: 356.8,
    yieldPercent: 35.7,
    winRate: 68,
    totalTrades: 892,
    avgHoldingTime: '4-12小时',
    chains: ['bsc', 'arbitrum'],
    pairs: ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'ARBI/USDT'],
    recentTrades: [
      { date: '2024-01-15', action: '做多', pair: 'BTC/USDT', yield: 15.6, status: 'win' },
      { date: '2024-01-15', action: '做空', pair: 'ETH/USDT', yield: -3.2, status: 'lose' },
      { date: '2024-01-14', action: '做多', pair: 'SOL/USDT', yield: 22.3, status: 'win' },
      { date: '2024-01-14', action: '做多', pair: 'BTC/USDT', yield: 8.9, status: 'win' },
      { date: '2024-01-13', action: '做空', pair: 'ETH/USDT', yield: -1.8, status: 'lose' },
    ],
  },
];

// 我的跟单仓位
const MY_POSITIONS = [
  {
    id: 'pos_001',
    traderId: 'trader_001',
    traderName: '币神张三',
    pair: 'BTC/USDT',
    direction: '做多',
    entryPrice: 42500,
    currentPrice: 43800,
    amount: 0.1,
    pnl: 130,
    pnlPercent: 3.06,
    openTime: '2024-01-12 10:30:00',
    status: 'open',
  },
  {
    id: 'pos_002',
    traderId: 'trader_001',
    traderName: '币神张三',
    pair: 'ETH/USDT',
    direction: '做多',
    entryPrice: 2280,
    currentPrice: 2350,
    amount: 1.5,
    pnl: 105,
    pnlPercent: 3.07,
    openTime: '2024-01-13 14:20:00',
    status: 'open',
  },
];

// 跟单记录
const HISTORY = [
  { id: 'h001', trader: '币神张三', pair: 'BTC/USDT', direction: '做多', amount: 100, yield: 5.2, pnl: 5.2, closeTime: '2024-01-10', status: 'closed' },
  { id: 'h002', trader: '币神张三', pair: 'ETH/USDT', direction: '做空', amount: 200, yield: -1.5, pnl: -3.0, closeTime: '2024-01-08', status: 'closed' },
  { id: 'h003', trader: '量化女王李四', pair: 'MATIC/USDT', direction: '做多', amount: 500, yield: 3.8, pnl: 19.0, closeTime: '2024-01-05', status: 'closed' },
  { id: 'h004', trader: '币神张三', pair: 'BNB/USDT', direction: '做多', amount: 150, yield: 4.2, pnl: 6.3, closeTime: '2024-01-03', status: 'closed' },
  { id: 'h005', trader: '合约之王王五', pair: 'SOL/USDT', direction: '做多', amount: 100, yield: 8.5, pnl: 8.5, closeTime: '2024-01-01', status: 'closed' },
];

// 全局统计数据（模拟）
const GLOBAL_STATS = {
  totalTraders: 156,
  totalFollowers: 45678,
  totalAum: '12.5M U',
  avgWinRate: 72,
  totalProfit: '3.2M U',
  avgYield: 15.8,
};

// 获取交易员列表
router.get('/traders', (req, res) => {
  const { sort = 'yield', limit = 10, offset = 0 } = req.query;
  
  let sortedTraders = [...TRADERS];
  
  switch (sort) {
    case 'yield':
      sortedTraders.sort((a, b) => b.totalYield - a.totalYield);
      break;
    case 'followers':
      sortedTraders.sort((a, b) => b.followers - a.followers);
      break;
    case 'winRate':
      sortedTraders.sort((a, b) => b.winRate - a.winRate);
      break;
    default:
      break;
  }
  
  const paginatedTraders = sortedTraders.slice(Number(offset), Number(offset) + Number(limit));
  
  res.json({
    success: true,
    data: {
      traders: paginatedTraders,
      total: TRADERS.length,
      stats: GLOBAL_STATS,
    },
  });
});

// 获取交易员详情
router.get('/traders/:id', (req, res) => {
  const { id } = req.params;
  const trader = TRADERS.find(t => t.id === id);
  
  if (!trader) {
    return res.status(404).json({ success: false, error: 'Trader not found' });
  }
  
  res.json({ success: true, data: trader });
});

// 获取热门交易员
router.get('/traders/hot/top', (req, res) => {
  const hotTraders = [...TRADERS]
    .sort((a, b) => b.followers - a.followers)
    .slice(0, 3);
  
  res.json({ success: true, data: hotTraders });
});

// 获取我的跟单
router.get('/positions', (req, res) => {
  res.json({
    success: true,
    data: {
      positions: MY_POSITIONS,
      stats: {
        totalPnL: MY_POSITIONS.reduce((sum, p) => sum + p.pnl, 0),
        totalPositions: MY_POSITIONS.length,
        openPositions: MY_POSITIONS.filter(p => p.status === 'open').length,
      },
    },
  });
});

// 跟单
router.post('/follow', (req, res) => {
  const { traderId, amount, stopLoss, takeProfit } = req.body;
  
  if (!traderId || !amount) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }
  
  const trader = TRADERS.find(t => t.id === traderId);
  if (!trader) {
    return res.status(404).json({ success: false, error: 'Trader not found' });
  }
  
  // 模拟创建跟单
  const newPosition = {
    id: `pos_${Date.now()}`,
    traderId,
    traderName: trader.name,
    pair: trader.pairs[0],
    direction: '做多',
    entryPrice: 0,
    currentPrice: 0,
    amount,
    pnl: 0,
    pnlPercent: 0,
    openTime: new Date().toISOString(),
    status: 'open',
    stopLoss,
    takeProfit,
  };
  
  res.json({
    success: true,
    data: { position: newPosition, message: 'Follow successful' },
  });
});

// 取消跟单
router.delete('/positions/:id', (req, res) => {
  const { id } = req.params;
  
  res.json({
    success: true,
    data: { message: 'Position closed successfully' },
  });
});

// 获取跟单记录
router.get('/history', (req, res) => {
  const traderId = req.query.traderId as string | undefined;
  const limit = Number(req.query.limit) || 20;
  const offset = Number(req.query.offset) || 0;
  
  let filteredHistory = [...HISTORY];
  if (traderId) {
    filteredHistory = filteredHistory.filter(h => h.trader.includes(traderId));
  }
  
  const paginatedHistory = filteredHistory.slice(offset, offset + limit);
  
  res.json({
    success: true,
    data: {
      history: paginatedHistory,
      total: filteredHistory.length,
      stats: {
        totalPnL: filteredHistory.reduce((sum, h) => sum + h.pnl, 0),
        winCount: filteredHistory.filter(h => h.pnl > 0).length,
        loseCount: filteredHistory.filter(h => h.pnl < 0).length,
      },
    },
  });
});

// 获取跟单统计
router.get('/stats', (req, res) => {
  res.json({
    success: true,
    data: {
      ...GLOBAL_STATS,
      myStats: {
        totalPnL: HISTORY.reduce((sum, h) => sum + h.pnl, 0),
        totalTrades: HISTORY.length,
        winRate: (HISTORY.filter(h => h.pnl > 0).length / HISTORY.length * 100).toFixed(1),
        followCount: MY_POSITIONS.length,
      },
    },
  });
});

export default router;
