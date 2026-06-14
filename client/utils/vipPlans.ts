// 会员套餐配置 - 供会员中心和订阅详情页共享
export const VIP_PLANS = [
  {
    id: 'basic',
    name: '基础版',
    subtitle: '新手入门',
    color: '#8B9DC3',
    price: { month: 99, quarter: 249, year: 999 },
    features: [
      { text: '6大赛道行情', enabled: true },
      { text: '30条筛选条件', enabled: true },
      { text: '每日资讯推送', enabled: true },
      { text: '技术分析工具', enabled: false },
      { text: '跟单功能', enabled: false },
      { text: 'API接口访问', enabled: false },
    ],
    shortFeatures: ['6大赛道', '30条筛选', '每日推送'],
    recommended: false,
  },
  {
    id: 'pro',
    name: '专业版',
    subtitle: '交易必备',
    color: '#00F0FF',
    price: { month: 199, quarter: 499, year: 1999 },
    features: [
      { text: '全部赛道行情', enabled: true },
      { text: '无限筛选条件', enabled: true },
      { text: '实时行情推送', enabled: true },
      { text: '技术分析工具', enabled: true },
      { text: '基础跟单功能', enabled: true },
      { text: 'API接口访问', enabled: false },
    ],
    shortFeatures: ['全部赛道', '无限筛选', '实时推送', '技术分析', '基础跟单'],
    recommended: true,
  },
  {
    id: 'vip',
    name: '尊享版',
    subtitle: '机构级服务',
    color: '#FFD700',
    price: { month: 299, quarter: 799, year: 2999 },
    features: [
      { text: '全部赛道行情', enabled: true },
      { text: '无限筛选条件', enabled: true },
      { text: '实时行情推送', enabled: true },
      { text: '高级技术分析', enabled: true },
      { text: '智能跟单功能', enabled: true },
      { text: '完整API接口', enabled: true },
    ],
    shortFeatures: ['高级分析', '智能跟单', '完整API'],
    recommended: false,
  },
];

export const PAYMENT_METHODS = [
  { id: 'usdt', name: 'USDT', icon: 'logo-usd', color: '#26A17B' },
  { id: 'eth', name: 'ETH', icon: 'logo-ethereum', color: '#627EEA' },
  { id: 'card', name: '信用卡', icon: 'card-outline', color: '#FF6B6B' },
];

export type BillingCycle = 'month' | 'quarter' | 'year';
