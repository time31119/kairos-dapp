import { Router } from 'express';
import { z } from 'zod';

const router = Router();

// 代币列表
const tokens = [
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', price: 67823.45, change24h: 2.34, marketCap: 1328000000000, volume24h: 28500000000 },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', price: 3456.78, change24h: 3.56, marketCap: 415000000000, volume24h: 15200000000 },
  { id: 'solana', symbol: 'SOL', name: 'Solana', price: 178.92, change24h: 5.67, marketCap: 78500000000, volume24h: 4500000000 },
  { id: 'binancecoin', symbol: 'BNB', name: 'BNB', price: 567.34, change24h: 1.23, marketCap: 87500000000, volume24h: 1800000000 },
  { id: 'ripple', symbol: 'XRP', name: 'XRP', price: 0.5234, change24h: -1.45, marketCap: 28000000000, volume24h: 1200000000 },
  { id: 'cardano', symbol: 'ADA', name: 'Cardano', price: 0.4567, change24h: 2.12, marketCap: 16000000000, volume24h: 450000000 },
  { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin', price: 0.1234, change24h: 4.56, marketCap: 17500000000, volume24h: 890000000 },
  { id: 'polkadot', symbol: 'DOT', name: 'Polkadot', price: 7.89, change24h: -0.78, marketCap: 10000000000, volume24h: 320000000 },
  { id: 'avalanche', symbol: 'AVAX', name: 'Avalanche', price: 35.67, change24h: 6.78, marketCap: 13500000000, volume24h: 560000000 },
  { id: 'chainlink', symbol: 'LINK', name: 'Chainlink', price: 14.56, change24h: 1.89, marketCap: 8500000000, volume24h: 420000000 },
];

// 交易员列表
const traders = [
  { id: '1', name: '币神张三', avatar: '神', followers: 2341, winRate: 82, totalYield: 127.5, tags: ['连胜中', '高胜率'] },
  { id: '2', name: '量化小王', avatar: '王', followers: 1856, winRate: 76, totalYield: 89.3, tags: ['稳健'] },
  { id: '3', name: '合约女王', avatar: '女', followers: 3204, winRate: 68, totalYield: 156.8, tags: ['高收益'] },
];

// 代币列表接口
router.get('/tokens', (req, res) => {
  res.json({
    code: 0,
    data: tokens,
  });
});

// 代币详情接口
router.get('/tokens/:id', (req, res) => {
  const token = tokens.find((t) => t.id === req.params.id);
  if (!token) {
    return res.status(404).json({ code: 404, message: 'Token not found' });
  }
  
  // 模拟技术指标
  const indicators = {
    rsi: Math.floor(Math.random() * 40) + 40,
    macd: { value: (Math.random() - 0.5) * 100, signal: 'bullish' },
    adx: Math.floor(Math.random() * 30) + 15,
    mfi: Math.floor(Math.random() * 40) + 40,
    ema20: token.price * 0.98,
    ema50: token.price * 0.95,
    ema200: token.price * 0.88,
  };
  
  res.json({
    code: 0,
    data: { ...token, indicators },
  });
});

// 搜索接口
router.get('/search', (req, res) => {
  const { q } = req.query;
  const query = (q as string || '').toLowerCase();
  
  const tokenResults = tokens.filter(
    (t) =>
      t.name.toLowerCase().includes(query) ||
      t.symbol.toLowerCase().includes(query)
  );
  
  const traderResults = traders.filter(
    (t) => t.name.toLowerCase().includes(query)
  );
  
  res.json({
    code: 0,
    data: {
      tokens: tokenResults,
      traders: traderResults,
    },
  });
});

// 热搜榜单
router.get('/hot', (req, res) => {
  const hotKeywords = [
    { id: '1', keyword: 'BTC', heat: 9850 },
    { id: '2', keyword: 'ETH', heat: 8720 },
    { id: '3', keyword: 'SOL', heat: 7650 },
    { id: '4', keyword: 'Meme', heat: 6540 },
    { id: '5', keyword: 'DeFi', heat: 5430 },
    { id: '6', keyword: 'AI', heat: 4980 },
    { id: '7', keyword: 'RWA', heat: 4320 },
    { id: '8', keyword: 'L2', heat: 3870 },
  ];
  
  res.json({
    code: 0,
    data: hotKeywords,
  });
});

// 交易员列表接口
router.get('/traders', (req, res) => {
  res.json({
    code: 0,
    data: traders,
  });
});

// 市场概览
router.get('/market', (req, res) => {
  res.json({
    code: 0,
    data: {
      totalMarketCap: 2420000000000,
      change24h: 2.15,
      totalVolume24h: 98500000000,
      btcDominance: 52.4,
      ethDominance: 17.8,
      fearGreedIndex: 72,
      fearGreedStatus: '贪婪',
      defiTvl: 128500000000,
    },
  });
});

export default router;
