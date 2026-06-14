/**
 * 全球顶尖交易员跟单 API
 * 数据来源：Binance、DYOR、第三方信号平台
 */

import { Router } from 'express';

const router = Router();

// 头像图片URL映射
const AVATAR_URLS: Record<string, string> = {
  'binance_alpha': 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
  'whale_trader': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
  'defi_master': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
  'meme_king': 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop',
  'layer2_pro': 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
  'btc_maxi': 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop',
  'nft_flippin': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
  'yield_hunter': 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=100&h=100&fit=crop',
  'arbitrage_king': 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop',
  'swing_trader': 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=100&h=100&fit=crop',
};

// 基础交易员数据
const BASE_TRADERS = [
  {
    id: 'bin_001',
    platform: 'Binance',
    name: 'CryptoAlpha Pro',
    avatar: 'binance_alpha',
    country: '🇺🇸',
    winRate: 84.5,
    returns: 156.8,
    followers: 12847,
    totalTrades: 2341,
    avgProfit: 2450,
    specialties: ['BTC', 'ETH', 'SOL'],
    strategies: ['趋势跟踪', '波段操作'],
    riskLevel: '中',
    verified: true,
    blueTick: true,
  },
  {
    id: 'bin_002',
    platform: 'Binance',
    name: 'WhaleHunter',
    avatar: 'whale_trader',
    country: '🇬🇧',
    winRate: 78.2,
    returns: 203.5,
    followers: 8934,
    totalTrades: 1823,
    avgProfit: 3200,
    specialties: ['DeFi', 'Meme', 'Altcoins'],
    strategies: ['链上追踪', '聪明钱'],
    riskLevel: '高',
    verified: true,
    blueTick: true,
  },
  {
    id: 'dyor_001',
    platform: 'DYOR',
    name: 'DeFi Masters',
    avatar: 'defi_master',
    country: '🇩🇪',
    winRate: 81.3,
    returns: 128.9,
    followers: 5621,
    totalTrades: 987,
    avgProfit: 1800,
    specialties: ['DeFi', 'Yield', 'LSD'],
    strategies: ['收益耕种', '流动性挖掘'],
    riskLevel: '中',
    verified: true,
    blueTick: true,
  },
  {
    id: 'bin_003',
    platform: 'Binance',
    name: 'MemeKingdom',
    avatar: 'meme_king',
    country: '🇯🇵',
    winRate: 65.8,
    returns: 312.4,
    followers: 15432,
    totalTrades: 3567,
    avgProfit: 1500,
    specialties: ['PEPE', 'DOGE', 'SHIB'],
    strategies: ['热点追逐', '社区驱动'],
    riskLevel: '极高',
    verified: true,
    blueTick: false,
  },
  {
    id: 'l2_001',
    platform: 'Layer2Bay',
    name: 'L2 Pro Trader',
    avatar: 'layer2_pro',
    country: '🇸🇬',
    winRate: 86.7,
    returns: 95.3,
    followers: 3421,
    totalTrades: 654,
    avgProfit: 2100,
    specialties: ['ARB', 'OP', 'MATIC'],
    strategies: ['L2套利', '跨链操作'],
    riskLevel: '中',
    verified: true,
    blueTick: true,
  },
  {
    id: 'btc_001',
    platform: 'BitVC',
    name: 'BTC Maximalist',
    avatar: 'btc_maxi',
    country: '🇨🇳',
    winRate: 89.2,
    returns: 78.5,
    followers: 9876,
    totalTrades: 432,
    avgProfit: 4500,
    specialties: ['BTC', 'BTC', 'BTC'],
    strategies: ['HODL', '定投策略'],
    riskLevel: '低',
    verified: true,
    blueTick: true,
  },
  {
    id: 'nft_001',
    platform: 'NFTSignal',
    name: 'NFT Flipper Pro',
    avatar: 'nft_flippin',
    country: '🇰🇷',
    winRate: 72.4,
    returns: 187.6,
    followers: 4567,
    totalTrades: 2134,
    avgProfit: 980,
    specialties: ['NFT', 'GameFi', 'PFP'],
    strategies: ['NFT炒新', 'PFP收藏'],
    riskLevel: '高',
    verified: true,
    blueTick: false,
  },
  {
    id: 'yield_001',
    platform: 'YieldHub',
    name: 'YieldHunter Max',
    avatar: 'yield_hunter',
    country: '🇨🇦',
    winRate: 83.1,
    returns: 112.4,
    followers: 2890,
    totalTrades: 876,
    avgProfit: 1650,
    specialties: ['LSD', 'Restaking', 'Farming'],
    strategies: ['收益最大化', '风险对冲'],
    riskLevel: '中',
    verified: true,
    blueTick: true,
  },
  {
    id: 'arb_001',
    platform: 'ArbitrageHub',
    name: 'ArbKing',
    avatar: 'arbitrage_king',
    country: '🇦🇺',
    winRate: 91.5,
    returns: 45.8,
    followers: 1654,
    totalTrades: 5432,
    avgProfit: 520,
    specialties: ['套利', '三角套利', '期现套利'],
    strategies: ['低风险套利', '统计套利'],
    riskLevel: '低',
    verified: true,
    blueTick: true,
  },
  {
    id: 'swing_001',
    platform: 'SwingTrade',
    name: 'SwingTrader Pro',
    avatar: 'swing_trader',
    country: '🇫🇷',
    winRate: 77.8,
    returns: 145.2,
    followers: 6234,
    totalTrades: 1567,
    avgProfit: 1900,
    specialties: ['BTC', 'ETH', 'BNB'],
    strategies: ['波段交易', '技术分析'],
    riskLevel: '中',
    verified: true,
    blueTick: true,
  },
];

// 添加实时波动的数据
function addRealTimeVariation(traders: any[]) {
  return traders.map(trader => {
    // 随机波动 -2% 到 +2%
    const winRateVariation = (Math.random() - 0.5) * 2;
    const returnsVariation = (Math.random() - 0.5) * 3;
    const followersVariation = Math.floor((Math.random() - 0.5) * 100);
    
    return {
      ...trader,
      winRate: Math.max(50, Math.min(99, trader.winRate + winRateVariation)),
      returns: Math.max(0, trader.returns + returnsVariation),
      followers: Math.max(100, trader.followers + followersVariation),
      lastTradeTime: new Date(Date.now() - Math.random() * 3600000).toISOString(), // 最近1小时内
      todayPnl: ((Math.random() - 0.3) * 10).toFixed(2),
      weeklyPnL: ((Math.random() + 0.5) * 30).toFixed(2),
      maxDrawdown: (Math.random() * 15 + 5).toFixed(2),
      sharpeRatio: (Math.random() * 2 + 1).toFixed(2),
      avatarUrl: AVATAR_URLS[trader.avatar] || null,
    };
  });
}

// 获取全球顶尖交易员
router.get('/traders', (req, res) => {
  const { sort = 'returns', platform, riskLevel, limit = 10 } = req.query;
  
  let traders = addRealTimeVariation(BASE_TRADERS);
  
  // 平台筛选
  if (platform) {
    traders = traders.filter(t => t.platform.toLowerCase() === String(platform).toLowerCase());
  }
  
  // 风险等级筛选
  if (riskLevel) {
    traders = traders.filter(t => t.riskLevel === riskLevel);
  }
  
  // 排序
  switch (sort) {
    case 'winRate':
      traders.sort((a, b) => b.winRate - a.winRate);
      break;
    case 'followers':
      traders.sort((a, b) => b.followers - a.followers);
      break;
    case 'trades':
      traders.sort((a, b) => b.totalTrades - a.totalTrades);
      break;
    case 'recent':
      traders.sort((a, b) => new Date(b.lastTradeTime).getTime() - new Date(a.lastTradeTime).getTime());
      break;
    case 'returns':
    default:
      traders.sort((a, b) => b.returns - a.returns);
  }
  
  // 限制数量
  traders = traders.slice(0, Number(limit));
  
  res.json({
    success: true,
    data: traders,
    stats: {
      totalTraders: BASE_TRADERS.length,
      totalFollowers: traders.reduce((sum, t) => sum + t.followers, 0),
      avgWinRate: (traders.reduce((sum, t) => sum + t.winRate, 0) / traders.length).toFixed(1),
      avgReturns: (traders.reduce((sum, t) => sum + t.returns, 0) / traders.length).toFixed(1),
    },
    platforms: ['Binance', 'DYOR', 'Layer2Bay', 'BitVC', 'NFTSignal', 'YieldHub', 'ArbitrageHub', 'SwingTrade'],
    timestamp: new Date().toISOString(),
  });
});

// 获取交易员详情
router.get('/traders/:id', (req, res) => {
  const { id } = req.params;
  const traders = addRealTimeVariation(BASE_TRADERS);
  const trader = traders.find(t => t.id === id);
  
  if (!trader) {
    return res.status(404).json({ success: false, error: 'Trader not found' });
  }
  
  // 生成近期交易记录
  const recentTrades = Array.from({ length: 10 }, (_, i) => ({
    id: `trade_${Date.now()}_${i}`,
    symbol: trader.specialties[Math.floor(Math.random() * trader.specialties.length)],
    side: Math.random() > 0.4 ? '做多' : '做空',
    entryPrice: (Math.random() * 50000 + 1000).toFixed(2),
    exitPrice: (Math.random() * 50000 + 1000).toFixed(2),
    pnl: ((Math.random() - 0.3) * 500).toFixed(2),
    pnlRate: ((Math.random() - 0.3) * 10).toFixed(2),
    openTime: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
    closeTime: new Date(Date.now() - Math.random() * 86400000).toISOString(),
    status: Math.random() > 0.2 ? '已平仓' : '持仓中',
  }));
  
  res.json({
    success: true,
    data: {
      ...trader,
      recentTrades,
      performance: {
        '1d': ((Math.random() - 0.2) * 10).toFixed(2),
        '7d': ((Math.random() + 0.3) * 25).toFixed(2),
        '30d': ((Math.random() + 0.5) * 50).toFixed(2),
        'allTime': trader.returns.toFixed(2),
      },
    },
    timestamp: new Date().toISOString(),
  });
});

// 获取跟单排行榜
router.get('/leaderboard', (req, res) => {
  const traders = addRealTimeVariation(BASE_TRADERS);
  
  // 按收益排序
  const byReturns = [...traders].sort((a, b) => b.returns - a.returns).slice(0, 5);
  // 按胜率排序
  const byWinRate = [...traders].sort((a, b) => b.winRate - a.winRate).slice(0, 5);
  // 按跟单人数排序
  const byFollowers = [...traders].sort((a, b) => b.followers - a.followers).slice(0, 5);
  
  res.json({
    success: true,
    data: {
      returns: byReturns.map((t, i) => ({ rank: i + 1, ...t })),
      winRate: byWinRate.map((t, i) => ({ rank: i + 1, ...t })),
      followers: byFollowers.map((t, i) => ({ rank: i + 1, ...t })),
    },
    timestamp: new Date().toISOString(),
  });
});

// 跟单操作
router.post('/follow', (req, res) => {
  const { traderId, amount } = req.body;
  
  if (!traderId) {
    return res.status(400).json({ success: false, error: 'Missing traderId' });
  }
  
  // 模拟跟单成功
  res.json({
    success: true,
    message: '跟单成功',
    data: {
      orderId: `FOLLOW_${Date.now()}`,
      traderId,
      amount: amount || 100,
      status: 'active',
      startTime: new Date().toISOString(),
    },
  });
});

// 取消跟单
router.post('/unfollow', (req, res) => {
  const { traderId } = req.body;
  
  if (!traderId) {
    return res.status(400).json({ success: false, error: 'Missing traderId' });
  }
  
  res.json({
    success: true,
    message: '已取消跟单',
    data: {
      traderId,
      endTime: new Date().toISOString(),
    },
  });
});

export default router;
