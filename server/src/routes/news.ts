import { Router } from 'express';

const router = Router();

// 获取真实加密货币新闻的API配置
const NEWS_API_CONFIGS = {
  // CryptoCompare 免费新闻API
  cryptocompare: {
    baseUrl: 'https://min-api.cryptocompare.com/data/v2',
    apiKey: '' // 可以添加免费的API Key提升限制
  }
};

// 格式化时间
function formatTime(date: Date): string {
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diff < 60) return '刚刚';
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`;
  return `${Math.floor(diff / 86400)}天前`;
}

// 获取新闻源名称
function getSourceName(source: string): string {
  const sourceMap: Record<string, string> = {
    'CC': 'CryptoCompare',
    'CCT': 'CryptoCompare',
    'BN': 'Binance',
    'CB': 'Coinbase',
    'YG': 'Yahoo Finance',
    'FG': 'Financial Times',
    'BBC': 'BBC',
    'CNN': 'CNN',
    'REUTERS': 'Reuters',
    'COINTELEGRAPH': 'CoinTelegraph',
    'COINDESK': 'CoinDesk',
    'DECRYPT': 'Decrypt',
    'THEBLOCK': 'The Block',
    'CRYPTO': 'CryptoNews'
  };
  return sourceMap[source] || source;
}

// 获取新闻分类
function getCategory(category: string): string {
  const categoryMap: Record<string, string> = {
    'exchange': '交易',
    'blockchain': '区块链',
    'altcoin': '主流币',
    'bitcoin': 'BTC',
    'ethereum': 'ETH',
    'defi': 'DeFi',
    'nft': 'NFT',
    'regulation': '监管',
    'metaverse': '元宇宙',
    'mining': '挖矿',
    'technology': '技术',
    'business': '商业',
    'market': '市场'
  };
  return categoryMap[category?.toLowerCase()] || '快讯';
}

// 模拟新闻数据（当API不可用时使用）
function generateMockNews(id: number) {
  const now = new Date();
  const mockTemplates = [
    { title: 'BTC 突破 $68,000 关口，机构资金持续涌入加密市场', category: 'BTC', tags: ['BTC', '快讯'], source: 'CoinDesk', price: '$68,000+' },
    { title: '以太坊 ETF 净流入创历史新高，单日净流入超 5 亿美元', category: 'ETH', tags: ['ETH', 'ETF'], source: 'Bloomberg', value: '5亿+' },
    { title: 'Solana 生态 TVL 突破 80 亿美元，开发者活动创新高', category: 'DeFi', tags: ['SOL', 'DeFi'], source: 'DeFiLlama', tvl: '80亿' },
    { title: 'AI 赛道持续爆发，FET 单日涨幅超 25%', category: 'AI', tags: ['AI', 'FET'], source: 'The Block', gain: '25%+' },
    { title: 'Meme 币热潮持续，PEPE 跻身加密货币前 30', category: 'Meme', tags: ['Meme', 'PEPE'], source: 'CryptoSlate', rank: '30' },
    { title: 'Layer2 战争升级，Arbitrum 与 Optimism 争夺市场份额', category: 'L2', tags: ['L2', 'Arbitrum'], source: 'Bankless', tvl: '竞争' },
    { title: 'MicroStrategy 再次购入 1,000 枚 BTC，持续看多加密市场', category: 'BTC', tags: ['BTC', '机构'], source: 'CoinDesk', btc: '1,000' },
    { title: '以太坊坎昆升级时间表确定，EIP-4844 将于下月激活', category: 'ETH', tags: ['ETH', '升级'], source: 'Ethereum Foundation', upgrade: 'Cancun' },
    { title: 'DeFi 协议总锁仓量突破 200 亿美元，创年内新高', category: 'DeFi', tags: ['DeFi', 'TVL'], source: 'DeFiLlama', tvl: '200亿' },
    { title: '贝莱德比特币 ETF 资产管理规模突破 200 亿美元', category: 'BTC', tags: ['BTC', 'ETF'], source: 'Bloomberg', aum: '200亿' },
    { title: 'BNB Chain 活跃地址数突破 200 万，生态发展强劲', category: 'BNB', tags: ['BNB', '生态'], source: 'BNB Chain', addrs: '200万' },
    { title: 'Web3 游戏用户突破 1,500 万，GameFi 进入爆发期', category: 'GameFi', tags: ['GameFi', '游戏'], source: 'DappRadar', users: '1,500万' },
    { title: 'Ripple 法律诉讼即将结束，XRP 价格预期上涨', category: 'XRP', tags: ['XRP', '法律'], source: 'CoinTelegraph', case: '诉讼' },
    { title: 'Cardano 主网升级完成，智能合约性能提升 50%', category: 'ADA', tags: ['ADA', '升级'], source: 'CryptoNews', perf: '50%' },
    { title: '加密货币总市值突破 2.5 万亿美元，市场情绪高涨', category: '市场', tags: ['市场', '市值'], source: 'CoinGecko', mcap: '2.5万亿' }
  ];
  
  const template = mockTemplates[id % mockTemplates.length];
  const minutesAgo = Math.floor(Math.random() * 180);
  
  return {
    id: `news-${Date.now()}-${id}`,
    title: template.title,
    category: getCategory(template.category),
    tags: template.tags,
    source: template.source,
    time: formatTime(new Date(now.getTime() - minutesAgo * 60000)),
    hot: Math.random() > 0.4,
    url: '#',
    imageUrl: null
  };
}

// 获取新闻列表（优先尝试真实API，失败则使用模拟数据）
router.get('/', async (req, res) => {
  try {
    // 尝试从 CryptoCompare 获取真实新闻
    const response = await fetch(
      `${NEWS_API_CONFIGS.cryptocompare.baseUrl}/?term=&categories=Blockchain&excludeCategories=Sponsored&lang=ZH&limit=20`,
      {
        headers: {
          'Accept': 'application/json'
        },
        signal: AbortSignal.timeout(5000) // 5秒超时
      }
    );
    
    if (response.ok) {
      const data = await response.json();
      if (data.Data && data.Data.length > 0) {
        const news = data.Data.map((item: any, index: number) => ({
          id: item.id?.toString() || `news-${index}`,
          title: item.title || '无标题',
          category: getCategory(item.categories),
          tags: item.categories?.split('|').slice(0, 2) || ['快讯'],
          source: getSourceName(item.source),
          time: formatTime(new Date(item.published_on * 1000)),
          hot: index < 3 || item.hot,
          url: item.url,
          imageUrl: item.imageurl
        }));
        
        return res.json({ success: true, data: news, source: 'cryptocompare' });
      }
    }
  } catch (error) {
    console.log('获取真实新闻失败，使用模拟数据:', error);
  }
  
  // 使用模拟数据
  const count = 15;
  const news = Array.from({ length: count }, (_, i) => generateMockNews(i));
  news.sort((a, b) => {
    const getMinutes = (time: string) => {
      if (time.includes('刚刚')) return 0;
      if (time.includes('分钟')) return parseInt(time);
      if (time.includes('小时')) return parseInt(time) * 60;
      if (time.includes('天')) return parseInt(time) * 1440;
      return 999;
    };
    return getMinutes(a.time) - getMinutes(b.time);
  });
  
  res.json({ success: true, data: news, source: 'mock' });
});

// 获取快讯（最新5条）
router.get('/flash', async (req, res) => {
  try {
    const response = await fetch(
      `${NEWS_API_CONFIGS.cryptocompare.baseUrl}/?categories=Blockchain&excludeCategories=Sponsored&lang=ZH&limit=8`,
      {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(5000)
      }
    );
    
    if (response.ok) {
      const data = await response.json();
      if (data.Data && data.Data.length > 0) {
        const flashNews = data.Data.slice(0, 5).map((item: any, index: number) => ({
          id: item.id?.toString() || `flash-${index}`,
          title: item.title,
          category: getCategory(item.categories),
          tags: item.categories?.split('|').slice(0, 2) || ['快讯'],
          source: getSourceName(item.source),
          time: formatTime(new Date(item.published_on * 1000)),
          hot: true,
          url: item.url,
          imageUrl: item.imageurl
        }));
        return res.json({ success: true, data: flashNews, source: 'cryptocompare' });
      }
    }
  } catch (error) {
    console.log('获取快讯失败，使用模拟数据');
  }
  
  // 模拟数据
  const flashNews = Array.from({ length: 5 }, (_, i) => generateMockNews(i));
  res.json({ success: true, data: flashNews, source: 'mock' });
});

// 获取热门资讯
router.get('/hot', async (req, res) => {
  try {
    const response = await fetch(
      `${NEWS_API_CONFIGS.cryptocompare.baseUrl}/?categories=Blockchain&excludeCategories=Sponsored&lang=ZH&limit=10&sort=popular`,
      {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(5000)
      }
    );
    
    if (response.ok) {
      const data = await response.json();
      if (data.Data && data.Data.length > 0) {
        const hotNews = data.Data.map((item: any, index: number) => ({
          id: item.id?.toString() || `hot-${index}`,
          title: item.title,
          category: getCategory(item.categories),
          tags: item.categories?.split('|').slice(0, 2) || ['热门'],
          source: getSourceName(item.source),
          time: formatTime(new Date(item.published_on * 1000)),
          hot: true,
          url: item.url,
          imageUrl: item.imageurl
        }));
        return res.json({ success: true, data: hotNews, source: 'cryptocompare' });
      }
    }
  } catch (error) {
    console.log('获取热门资讯失败，使用模拟数据');
  }
  
  const hotNews = Array.from({ length: 8 }, (_, i) => generateMockNews(i));
  res.json({ success: true, data: hotNews, source: 'mock' });
});

// 获取市场分析
router.get('/analysis', async (req, res) => {
  try {
    const response = await fetch(
      `${NEWS_API_CONFIGS.cryptocompare.baseUrl}/?categories=Marketcall,Analysis&excludeCategories=Sponsored&lang=ZH&limit=10`,
      {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(5000)
      }
    );
    
    if (response.ok) {
      const data = await response.json();
      if (data.Data && data.Data.length > 0) {
        const analysis = data.Data.map((item: any, index: number) => ({
          id: item.id?.toString() || `analysis-${index}`,
          title: item.title,
          category: '分析',
          tags: ['分析', '市场'],
          source: getSourceName(item.source),
          time: formatTime(new Date(item.published_on * 1000)),
          hot: item.hot || false,
          url: item.url,
          imageUrl: item.imageurl
        }));
        return res.json({ success: true, data: analysis, source: 'cryptocompare' });
      }
    }
  } catch (error) {
    console.log('获取市场分析失败');
  }
  
  const analysis = Array.from({ length: 5 }, (_, i) => ({
    ...generateMockNews(i),
    category: '分析',
    tags: ['分析', '市场']
  }));
  res.json({ success: true, data: analysis, source: 'mock' });
});

export default router;
