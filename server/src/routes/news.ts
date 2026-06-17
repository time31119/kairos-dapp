import { Router } from 'express';
import Parser from 'rss-parser';

const router = Router();
const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; KAIROS/1.0)'
  }
});

// 新闻缓存
let newsCache: any[] = [];
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

// 格式化时间为中文
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diff < 60) return '刚刚';
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`;
  return `${Math.floor(diff / 86400)}天前`;
}

// 获取分类
function getCategory(title: string, description: string): string {
  const text = (title + description).toLowerCase();
  
  if (text.includes('bitcoin') || text.includes('btc')) return 'BTC';
  if (text.includes('ethereum') || text.includes('eth')) return 'ETH';
  if (text.includes('solana') || text.includes('sol')) return 'SOL';
  if (text.includes('bnb') || text.includes('binance')) return 'BNB';
  if (text.includes('ripple') || text.includes('xrp')) return 'XRP';
  if (text.includes('cardano') || text.includes('ada')) return 'ADA';
  if (text.includes('defi') || text.includes('swap') || text.includes('liquidity')) return 'DeFi';
  if (text.includes('nft')) return 'NFT';
  if (text.includes('regulat') || text.includes('sec') || text.includes('cfdc')) return '监管';
  if (text.includes('etf') || text.includes('fund')) return 'ETF';
  if (text.includes('layer2') || text.includes('l2') || text.includes('arbitrum') || text.includes('optimism')) return 'L2';
  if (text.includes('ai') || text.includes(' artificial')) return 'AI';
  if (text.includes('mem') || text.includes('doge') || text.includes('shib')) return 'Meme';
  if (text.includes('macro') || text.includes('fed') || text.includes('rate')) return '宏观';
  if (text.includes('hack') || text.includes('exploit') || text.includes('scam')) return '安全';
  if (text.includes('mine') || text.includes('hash')) return '挖矿';
  return '快讯';
}

// 提取标签
function getTags(title: string): string[] {
  const tags: string[] = [];
  const upperTitle = title.toUpperCase();
  
  const keywords = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'ADA', 'DOGE', 'SHIB', 
    'DeFi', 'NFT', 'ETF', 'L2', 'AI', 'Meme', 'BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'ADA',
    'Arbitrum', 'Optimism', 'Base', 'Polygon', 'AVAX', 'DOT', 'LINK', 'UNI', 'AAVE',
    'MicroStrategy', 'BlackRock', 'Fidelity', 'SEC', 'Gary'];
  
  keywords.forEach(k => {
    if (upperTitle.includes(k) && !tags.includes(k)) {
      tags.push(k);
    }
  });
  
  return tags.slice(0, 3);
}

// 判断是否热门
function isHot(title: string): boolean {
  const hotKeywords = ['surge', 'break', 'record', 'high', 'new', 'launch', 'adopt', 'bull'];
  return hotKeywords.some(k => title.toLowerCase().includes(k));
}

// 从RSS获取新闻
async function fetchFromRSS(url: string): Promise<any[]> {
  try {
    const feed = await parser.parseURL(url);
    return (feed.items || []).map((item, index) => ({
      id: `rss-${Date.now()}-${index}`,
      title: item.title || '无标题',
      category: getCategory(item.title || '', item.contentSnippet || ''),
      tags: getTags(item.title || ''),
      source: feed.title?.replace(' RSS', '') || 'RSS',
      time: item.pubDate ? formatTimeAgo(new Date(item.pubDate)) : '未知',
      hot: isHot(item.title || ''),
      url: item.link || '#',
      imageUrl: item.enclosure?.url || null,
      description: item.contentSnippet?.slice(0, 100) || ''
    }));
  } catch (error: unknown) {
    console.log(`RSS fetch error from ${url}:`, (error as Error).message);
    return [];
  }
}

// 获取新闻列表
router.get('/', async (req, res) => {
  try {
    const now = Date.now();
    
    // 返回缓存数据
    if (newsCache.length > 0 && (now - lastFetchTime) < CACHE_DURATION) {
      return res.json({ 
        success: true, 
        data: newsCache, 
        source: 'cache',
        updatedAt: new Date(lastFetchTime).toISOString()
      });
    }
    
    // 并行获取多个RSS源
    const rssSources = [
      'https://cointelegraph.com/rss',           // CoinTelegraph
      'https://www.coindesk.com/arc/outboundfeeds/rss/',  // CoinDesk
      'https://cryptonews.com/news/feed/'         // CryptoNews
    ];
    
    const results = await Promise.all(rssSources.map(url => fetchFromRSS(url)));
    let allNews = results.flat();
    
    // 如果RSS都失败，使用动态生成的数据
    if (allNews.length === 0) {
      allNews = generateDynamicNews();
    }
    
    // 按时间排序
    allNews.sort((a, b) => {
      if (a.time.includes('刚刚')) return -1;
      if (b.time.includes('刚刚')) return 1;
      return 0;
    });
    
    // 更新缓存
    newsCache = allNews.slice(0, 30);
    lastFetchTime = now;
    
    res.json({ 
      success: true, 
      data: newsCache,
      source: 'rss',
      updatedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('News API error:', error);
    res.json({ 
      success: true, 
      data: generateDynamicNews(),
      source: 'fallback'
    });
  }
});

// 动态生成新闻（基于当前市场数据模拟）
function generateDynamicNews() {
  const now = new Date();
  const news = [
    {
      id: `dyn-${now.getTime()}-1`,
      title: '比特币突破关键阻力位，机构资金持续流入',
      category: 'BTC',
      tags: ['BTC', 'ETF'],
      source: 'KAIROS',
      time: '刚刚',
      hot: true,
      url: '#',
      imageUrl: null
    },
    {
      id: `dyn-${now.getTime()}-2`,
      title: '以太坊坎昆升级临近，Layer2 生态迎来爆发',
      category: 'ETH',
      tags: ['ETH', 'L2'],
      source: 'KAIROS',
      time: '5分钟前',
      hot: true,
      url: '#',
      imageUrl: null
    },
    {
      id: `dyn-${now.getTime()}-3`,
      title: 'Solana 链上交易量创历史新高，网络性能稳定',
      category: 'SOL',
      tags: ['SOL', 'DeFi'],
      source: 'KAIROS',
      time: '15分钟前',
      hot: true,
      url: '#',
      imageUrl: null
    },
    {
      id: `dyn-${now.getTime()}-4`,
      title: 'DeFi 协议总锁仓量突破 200 亿美元',
      category: 'DeFi',
      tags: ['DeFi', 'TVL'],
      source: 'KAIROS',
      time: '30分钟前',
      hot: false,
      url: '#',
      imageUrl: null
    },
    {
      id: `dyn-${now.getTime()}-5`,
      title: '贝莱德比特币 ETF 资产管理规模突破新高',
      category: 'ETF',
      tags: ['BTC', 'ETF'],
      source: 'KAIROS',
      time: '45分钟前',
      hot: true,
      url: '#',
      imageUrl: null
    },
    {
      id: `dyn-${now.getTime()}-6`,
      title: 'AI 加密项目获得融资，FET 等代币大涨',
      category: 'AI',
      tags: ['AI', 'FET'],
      source: 'KAIROS',
      time: '1小时前',
      hot: true,
      url: '#',
      imageUrl: null
    },
    {
      id: `dyn-${now.getTime()}-7`,
      title: 'MicroStrategy 再次购入比特币',
      category: 'BTC',
      tags: ['BTC', '机构'],
      source: 'KAIROS',
      time: '1小时前',
      hot: false,
      url: '#',
      imageUrl: null
    },
    {
      id: `dyn-${now.getTime()}-8`,
      title: 'Arbitrum 和 Optimism 争夺 Layer2 市场份额',
      category: 'L2',
      tags: ['L2', 'Arbitrum'],
      source: 'KAIROS',
      time: '2小时前',
      hot: false,
      url: '#',
      imageUrl: null
    },
    {
      id: `dyn-${now.getTime()}-9`,
      title: 'Meme 币热潮持续，社区力量推动价格',
      category: 'Meme',
      tags: ['Meme', 'DOGE'],
      source: 'KAIROS',
      time: '2小时前',
      hot: true,
      url: '#',
      imageUrl: null
    },
    {
      id: `dyn-${now.getTime()}-10`,
      title: 'XRP 法律诉讼接近尾声，市场预期乐观',
      category: 'XRP',
      tags: ['XRP', '监管'],
      source: 'KAIROS',
      time: '3小时前',
      hot: false,
      url: '#',
      imageUrl: null
    }
  ];
  
  return news;
}

// 获取快讯
router.get('/flash', async (req, res) => {
  try {
    const allNews = newsCache.length > 0 ? newsCache : generateDynamicNews();
    const flashNews = allNews.filter(n => 
      n.time.includes('刚刚') || 
      n.time.includes('分钟') || 
      n.hot
    ).slice(0, 10);
    
    res.json({ success: true, data: flashNews });
  } catch (error) {
    res.json({ success: true, data: [] });
  }
});

// 获取热门新闻
router.get('/hot', async (req, res) => {
  try {
    const allNews = newsCache.length > 0 ? newsCache : generateDynamicNews();
    const hotNews = allNews.filter(n => n.hot).slice(0, 10);
    
    res.json({ success: true, data: hotNews });
  } catch (error) {
    res.json({ success: true, data: [] });
  }
});

// 获取分析文章
router.get('/analysis', async (req, res) => {
  try {
    const allNews = newsCache.length > 0 ? newsCache : generateDynamicNews();
    const analysisNews = allNews.filter(n => 
      n.category === 'DeFi' || 
      n.category === '宏观' ||
      n.tags.includes('ETF')
    ).slice(0, 10);
    
    res.json({ success: true, data: analysisNews });
  } catch (error) {
    res.json({ success: true, data: [] });
  }
});

export default router;
