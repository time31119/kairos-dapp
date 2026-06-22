import express from 'express';
import { getTopCoins } from '../services/coingecko';

const router = express.Router();

// 场景配置
const SCENARIO_CONFIG: Record<string, { name: string; color: string; description: string; coingeckoIds: string[] }> = {
  defi: { 
    name: 'DeFi 潜力币', 
    color: '#00FF88', 
    description: '去中心化金融赛道',
    coingeckoIds: ['uniswap', 'aave', 'curve-dao-token', 'maker', 'synthetix', 'compound-governance-token']
  },
  meme: { 
    name: 'Meme 币', 
    color: '#FFD700', 
    description: '社区驱动的代币',
    coingeckoIds: ['dogecoin', 'shiba-inu', 'pepe', 'floki', 'bonk']
  },
  ai: { 
    name: 'AI 赛道', 
    color: '#00F0FF', 
    description: '人工智能相关代币',
    coingeckoIds: ['singularitynet', 'fetch-ai', 'ocean-protocol', 'render-token', 'ai16z']
  },
  gaming: { 
    name: 'GameFi', 
    color: '#BF00FF', 
    description: '区块链游戏代币',
    coingeckoIds: ['axie-infinity', 'gala', 'immutable-x', 'decentraland', 'the-sandbox']
  },
  infrastructure: { 
    name: '基础设施', 
    color: '#4A90D9', 
    description: '区块链基础设施',
    coingeckoIds: ['ethereum', 'matic-network', 'arbitrum', 'optimism', 'chainlink']
  },
  layer2: { 
    name: 'Layer2', 
    color: '#F472B6', 
    description: '二层网络解决方案',
    coingeckoIds: ['arbitrum', 'optimism', 'polygon', 'zksync', 'starknet']
  },
};

// 缓存市场数据
let marketDataCache: any[] = [];
let lastFetchTime = 0;
const CACHE_DURATION = 60000; // 1分钟缓存

// 获取真实市场数据
async function getMarketData(): Promise<any[]> {
  const now = Date.now();
  
  // 如果缓存有效，直接返回
  if (marketDataCache.length > 0 && now - lastFetchTime < CACHE_DURATION) {
    return marketDataCache;
  }
  
  try {
    // 从 CoinGecko 获取真实数据
    const coins = await getTopCoins(100);
    
    if (coins.length > 0) {
      marketDataCache = coins;
      lastFetchTime = now;
      console.log(`[Screener] Fetched ${coins.length} coins from CoinGecko`);
      return coins;
    }
  } catch (error) {
    console.error('[Screener] Failed to fetch from CoinGecko:', error);
  }
  
  // 如果获取失败，返回缓存数据（即使是过期的）
  return marketDataCache;
}

// 热门精选实时数据
router.get('/featured/realtime', async (req, res) => {
  try {
    const scenario = req.query.scenario as string || 'all';
    const marketData = await getMarketData();
    
    if (marketData.length === 0) {
      return res.json({ success: false, message: 'No market data available' });
    }
    
    // 创建 symbol/id 映射
    const coinMap = new Map<string, any>();
    marketData.forEach(coin => {
      coinMap.set(coin.id, coin);
      coinMap.set(coin.symbol.toUpperCase(), coin);
    });
    
    let result: any[] = [];
    
    if (scenario === 'all' || !scenario) {
      // 返回所有场景
      for (const [key, config] of Object.entries(SCENARIO_CONFIG)) {
        const tokens = config.coingeckoIds
          .map(id => coinMap.get(id))
          .filter(Boolean)
          .slice(0, 5)
          .map(coin => ({
            symbol: coin.symbol.toUpperCase(),
            name: coin.name,
            price: coin.current_price,
            change: coin.price_change_percentage_24h || 0,
            volume: coin.total_volume,
            marketCap: coin.market_cap,
            image: coin.image,
            rank: marketData.findIndex(c => c.id === coin.id) + 1
          }));
        
        result.push({
          id: key,
          name: config.name,
          color: config.color,
          description: config.description,
          tokens,
          stats: {
            bullishTokens: tokens.filter(t => t.change > 0).length,
            totalTokens: tokens.length
          }
        });
      }
    } else {
      // 返回指定场景
      const config = SCENARIO_CONFIG[scenario];
      if (config) {
        const tokens = config.coingeckoIds
          .map(id => coinMap.get(id))
          .filter(Boolean)
          .slice(0, 10)
          .map(coin => ({
            symbol: coin.symbol.toUpperCase(),
            name: coin.name,
            price: coin.current_price,
            change: coin.price_change_percentage_24h || 0,
            volume: coin.total_volume,
            marketCap: coin.market_cap,
            image: coin.image,
            rank: marketData.findIndex(c => c.id === coin.id) + 1
          }));
        
        result = [{
          id: scenario,
          name: config.name,
          color: config.color,
          description: config.description,
          tokens,
          stats: {
            bullishTokens: tokens.filter(t => t.change > 0).length,
            totalTokens: tokens.length
          }
        }];
      }
    }
    
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error in /featured/realtime:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// 获取涨跌幅榜
router.get('/scenarios/realtime', async (req, res) => {
  try {
    const marketData = await getMarketData();
    
    if (marketData.length === 0) {
      return res.json({ success: false, message: 'No market data available' });
    }
    
    // 按涨跌幅排序
    const sortedByChange = [...marketData].sort((a, b) => 
      (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0)
    );
    
    const gainers = sortedByChange.slice(0, 20).map(coin => ({
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      price: coin.current_price,
      change: coin.price_change_percentage_24h || 0,
      volume: coin.total_volume,
      marketCap: coin.market_cap,
      image: coin.image
    }));
    
    const losers = sortedByChange.slice(-20).reverse().map(coin => ({
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      price: coin.current_price,
      change: coin.price_change_percentage_24h || 0,
      volume: coin.total_volume,
      marketCap: coin.market_cap,
      image: coin.image
    }));
    
    res.json({ 
      success: true, 
      data: { gainers, losers },
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in /scenarios/realtime:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// 获取全球资讯（暂时返回模拟数据）
router.get('/news', async (req, res) => {
  // 暂时返回空数据，后续可以接入真实新闻API
  res.json({ success: true, data: [] });
});

export default router;
