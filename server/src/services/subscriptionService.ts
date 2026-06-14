import crypto from 'crypto';

// 订阅套餐配置
const subscriptionPlans = [
  {
    id: 'basic',
    name: '基础版',
    price: {
      monthly: 99,
      quarterly: 238,
      yearly: 899
    },
    features: [
      '6大赛道行情',
      '30条筛选条件',
      '每日资讯推送'
    ],
    color: '#00F0FF'
  },
  {
    id: 'professional',
    name: '专业版',
    price: {
      monthly: 199,
      quarterly: 478,
      yearly: 1433
    },
    features: [
      '全部赛道行情',
      '无限筛选条件',
      '实时行情推送',
      '技术分析工具',
      '基础跟单功能'
    ],
    color: '#BF00FF',
    recommended: true
  },
  {
    id: 'vip',
    name: '尊享版',
    price: {
      monthly: 299,
      quarterly: 718,
      yearly: 2153
    },
    features: [
      '高级技术分析',
      '智能跟单功能',
      '完整API接口',
      '优先客服支持'
    ],
    color: '#FFD700'
  }
];

// 用户订阅数据存储（内存中，生产环境应使用数据库）
const userSubscriptions = new Map();

/**
 * 获取所有订阅套餐
 */
export function getSubscriptionPlans() {
  return subscriptionPlans;
}

/**
 * 获取用户订阅状态
 */
export function getUserSubscription(userId: string) {
  return userSubscriptions.get(userId) || null;
}

/**
 * 创建订阅
 */
export function createSubscription(userId: string, data: {
  plan: string;
  status: string;
  expiresAt: string;
}) {
  userSubscriptions.set(userId, {
    ...data,
    subscribedAt: new Date().toISOString()
  });
  return true;
}

/**
 * 更新订阅
 */
export function updateSubscription(userId: string, data: Partial<{
  plan: string;
  status: string;
  expiresAt: string;
}>) {
  const current = userSubscriptions.get(userId);
  if (current) {
    userSubscriptions.set(userId, { ...current, ...data });
  }
  return true;
}

/**
 * 验证支付签名
 */
export function verifyPaymentSignature(data: string, signature: string) {
  const expectedSignature = crypto
    .createHmac('sha256', process.env.PAYMENT_SECRET || 'payment-secret')
    .update(data)
    .digest('hex');
  return signature === expectedSignature;
}
