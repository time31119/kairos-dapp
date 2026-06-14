import { Router } from 'express';

const router = Router();

// 模拟新闻数据生成
function generateNewsItem(id: number, isHot: boolean = false) {
  const newsTemplates = [
    { title: 'BTC 突破 {price} 美元关口，机构资金持续涌入', category: '快讯', tags: ['BTC', '快讯'], source: 'CoinDesk' },
    { title: '以太坊 ETF 净流入创历史新高，单日净流入超 {value} 亿美元', category: '快讯', tags: ['ETH', 'ETF'], source: 'Bloomberg' },
    { title: 'Solana 生态 TVL 突破 {tvl} 亿美元，开发者活动创新高', category: 'DeFi', tags: ['SOL', 'DeFi'], source: 'DeFiLlama' },
    { title: 'AI 赛道持续爆发，FET 单日涨幅超 {gain}%', category: '快讯', tags: ['AI', 'FET'], source: 'The Block' },
    { title: 'Meme 币热潮持续，PEPE 跻身加密货币前 50', category: '快讯', tags: ['Meme', 'PEPE'], source: 'CryptoSlate' },
    { title: 'Layer2 战争升级，Arbitrum 与 Optimism 争夺市场份额', category: '深度', tags: ['L2', 'Arbitrum'], source: 'Bankless' },
    { title: 'MicroStrategy 再次购入 {btc} 枚 BTC，持续看多加密市场', category: '宏观', tags: ['BTC', '机构'], source: 'CoinDesk' },
    { title: '以太坊开发者大会召开，坎昆升级时间表确定', category: '宏观', tags: ['ETH', '升级'], source: 'Ethereum Foundation' },
    { title: 'DeFi 协议总锁仓量突破 {tvl} 亿美元，创年内新高', category: 'DeFi', tags: ['DeFi', 'TVL'], source: 'DeFiLlama' },
    { title: '贝莱德比特币 ETF 资产管理规模突破 {aum} 亿美元', category: '宏观', tags: ['BTC', 'ETF'], source: 'Bloomberg' },
    { title: 'BNB Chain 活跃地址数突破 100 万，生态发展强劲', category: '快讯', tags: ['BNB', '快讯'], source: 'BNB Chain' },
    { title: 'Web3 游戏用户突破 1000 万，GameFi 进入爆发期', category: '深度', tags: ['GameFi', '游戏'], source: 'DappRadar' },
  ];
  
  const template = newsTemplates[id % newsTemplates.length];
  const now = new Date();
  const minutesAgo = Math.floor(Math.random() * 180);
  const timeStr = minutesAgo < 60 ? `${minutesAgo}分钟前` : `${Math.floor(minutesAgo / 60)}小时前`;
  
  // 动态替换模板变量
  const price = (65000 + Math.random() * 5000).toFixed(0);
  const value = (3 + Math.random() * 5).toFixed(1);
  const tvl = (40 + Math.random() * 20).toFixed(0);
  const gain = (15 + Math.random() * 20).toFixed(1);
  const btc = Math.floor(Math.random() * 1000 + 500);
  const aum = Math.floor(Math.random() * 5000 + 3000);
  
  const title = template.title
    .replace('{price}', price)
    .replace('{value}', value)
    .replace('{tvl}', tvl)
    .replace('{gain}', gain)
    .replace('{btc}', btc.toString())
    .replace('{aum}', aum.toString());
  
  return {
    id: `news-${id}`,
    title,
    category: template.category,
    tags: template.tags,
    source: template.source,
    time: timeStr,
    hot: isHot || Math.random() > 0.7,
    summary: `${template.source} 报道：加密货币市场今日表现强劲...`,
  };
}

// 获取新闻列表
router.get('/', (req, res) => {
  const count = 15;
  const news = [];
  
  for (let i = 0; i < count; i++) {
    news.push(generateNewsItem(i, i < 3));
  }
  
  // 按时间排序，最新的在前
  news.sort((a, b) => {
    const getMinutes = (time: string) => {
      if (time.includes('分钟')) return parseInt(time);
      if (time.includes('小时')) return parseInt(time) * 60;
      return 0;
    };
    return getMinutes(a.time) - getMinutes(b.time);
  });
  
  res.json({ success: true, data: news });
});

// 获取快讯（最新资讯）
router.get('/flash', (req, res) => {
  const flashNews = [];
  for (let i = 0; i < 5; i++) {
    flashNews.push(generateNewsItem(i, true));
  }
  res.json({ success: true, data: flashNews });
});

// 获取热门资讯
router.get('/hot', (req, res) => {
  const hotNews = [];
  for (let i = 0; i < 8; i++) {
    hotNews.push(generateNewsItem(i, true));
  }
  res.json({ success: true, data: hotNews });
});

export default router;
