/**
 * Subscription Service - 支持无Supabase运行（使用mock数据）
 */
import type { SupabaseClient } from '@supabase/supabase-js';

// 懒加载Supabase客户端
let supabase: SupabaseClient | null = null;
let supabaseInitialized = false;

function getSupabase(): SupabaseClient | null {
  if (supabaseInitialized) return supabase;
  
  try {
    // 动态导入避免循环依赖
    const { getSupabaseClient } = require('../storage/database/supabase-client');
    supabase = getSupabaseClient();
  } catch (e) {
    console.log('[Subscription] Supabase not configured, using mock data');
    supabase = null;
  }
  supabaseInitialized = true;
  return supabase;
}

// 订阅方案枚举
export const SubscriptionTier = {
  SILVER: 'silver',
  GOLD: 'gold',
  DIAMOND: 'diamond',
} as const;
export type SubscriptionTier = typeof SubscriptionTier[keyof typeof SubscriptionTier];

// 订阅状态枚举
export const SubscriptionStatus = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled',
  PENDING: 'pending',
} as const;
export type SubscriptionStatus = typeof SubscriptionStatus[keyof typeof SubscriptionStatus];

// USDT 收款地址
export const PAYMENT_ADDRESS = 'TxxxxWalletAddress'; // TODO: 替换为实际地址

// 价格配置
export const PRICING: Record<SubscriptionTier, number> = {
  [SubscriptionTier.SILVER]: 99,
  [SubscriptionTier.GOLD]: 199,
  [SubscriptionTier.DIAMOND]: 299,
};

// 权益配置
export const BENEFITS: Record<SubscriptionTier, { name: string; items: string[] }> = {
  [SubscriptionTier.SILVER]: {
    name: '白银版',
    items: [
      '机构跟投-实时信号',
      '热门代币行情',
      '基础智能分析',
      '代币详情查看',
    ],
  },
  [SubscriptionTier.GOLD]: {
    name: '黄金版',
    items: [
      '机构跟投-实时信号',
      '热门代币行情',
      '高级智能分析',
      '跟单功能',
      '风险预警',
      '聪明钱追踪',
    ],
  },
  [SubscriptionTier.DIAMOND]: {
    name: '钻石版',
    items: [
      '机构跟投-实时+机构',
      '热门代币行情',
      '高级智能分析',
      '跟单功能',
      '聪明钱追踪',
      '风险预警',
      '机构布局追踪',
      'VIP专属客服',
    ],
  },
};

// Mock数据存储
const mockSubscriptions = new Map<string, any>();
const mockOrders = new Map<string, any[]>();

// ==================== 数据库操作 ====================

/**
 * 获取用户订阅信息
 */
export async function getUserSubscription(userId: string) {
  const client = getSupabase();
  if (!client) {
    return mockSubscriptions.get(userId) || null;
  }
  
  const { data, error } = await client
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .maybeSingle();
  
  if (error) throw new Error(`获取订阅失败: ${error.message}`);
  return data;
}

/**
 * 获取用户所有订单
 */
export async function getUserOrders(userId: string) {
  const client = getSupabase();
  if (!client) {
    return mockOrders.get(userId) || [];
  }
  
  const { data, error } = await client
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw new Error(`获取订单失败: ${error.message}`);
  return data || [];
}

/**
 * 创建订阅订单
 */
export async function createSubscription(userId: string, tier: SubscriptionTier, txHash: string) {
  const client = getSupabase();
  const order = {
    id: `order_${Date.now()}`,
    user_id: userId,
    tier,
    status: SubscriptionStatus.PENDING,
    tx_hash: txHash,
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  };

  if (!client) {
    mockOrders.set(userId, [...(mockOrders.get(userId) || []), order]);
    return order;
  }

  const { data, error } = await client
    .from('subscriptions')
    .insert(order)
    .select()
    .maybeSingle();

  if (error) throw new Error(`创建订阅失败: ${error.message}`);
  return data;
}

/**
 * 激活订阅
 */
export async function activateSubscription(userId: string, txHash: string) {
  const client = getSupabase();
  if (!client) {
    const orders = mockOrders.get(userId) || [];
    const order = orders.find(o => o.tx_hash === txHash);
    if (order) {
      order.status = SubscriptionStatus.ACTIVE;
    }
    mockSubscriptions.set(userId, order);
    return order;
  }

  const { data, error } = await client
    .from('subscriptions')
    .update({ status: SubscriptionStatus.ACTIVE })
    .eq('tx_hash', txHash)
    .eq('user_id', userId)
    .select()
    .maybeSingle();

  if (error) throw new Error(`激活订阅失败: ${error.message}`);
  return data;
}

/**
 * 验证订阅状态
 */
export async function checkSubscriptionStatus(userId: string): Promise<{
  isActive: boolean;
  tier: SubscriptionTier | null;
  expiresAt: string | null;
}> {
  const subscription = await getUserSubscription(userId);
  
  if (!subscription) {
    return { isActive: false, tier: null, expiresAt: null };
  }

  if (subscription.status !== SubscriptionStatus.ACTIVE) {
    return { isActive: false, tier: null, expiresAt: null };
  }

  const now = new Date();
  const expiresAt = new Date(subscription.expires_at);
  
  if (expiresAt < now) {
    return { isActive: false, tier: null, expiresAt: null };
  }

  return {
    isActive: true,
    tier: subscription.tier,
    expiresAt: subscription.expires_at,
  };
}

/**
 * 确认订阅（管理员操作）
 */
export async function confirmSubscription(txHash: string) {
  const client = getSupabase();
  if (!client) {
    // 在mock中查找并激活
    for (const [userId, orders] of mockOrders.entries()) {
      const order = orders.find((o: any) => o.tx_hash === txHash);
      if (order) {
        order.status = SubscriptionStatus.ACTIVE;
        order.confirmed_at = new Date().toISOString();
        order.expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        mockSubscriptions.set(userId, order);
        return order;
      }
    }
    return null;
  }

  const { data, error } = await client
    .from('subscriptions')
    .update({ 
      status: SubscriptionStatus.ACTIVE,
      confirmed_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    })
    .eq('tx_hash', txHash)
    .select()
    .maybeSingle();

  if (error) throw new Error(`确认订阅失败: ${error.message}`);
  return data;
}

/**
 * 取消订阅
 */
export async function cancelSubscription(userId: string) {
  const client = getSupabase();
  if (!client) {
    const subscription = mockSubscriptions.get(userId);
    if (subscription) {
      subscription.status = SubscriptionStatus.CANCELLED;
    }
    return subscription;
  }

  const { data, error } = await client
    .from('subscriptions')
    .update({ status: SubscriptionStatus.CANCELLED })
    .eq('user_id', userId)
    .eq('status', SubscriptionStatus.ACTIVE)
    .select()
    .maybeSingle();

  if (error) throw new Error(`取消订阅失败: ${error.message}`);
  return data;
}

/**
 * 升级订阅
 */
export async function upgradeSubscription(userId: string, newTier: SubscriptionTier, txHash: string) {
  const client = getSupabase();
  // 先取消旧订阅
  await cancelSubscription(userId);
  
  // 创建新订阅
  return createSubscription(userId, newTier, txHash);
}

/**
 * 监控支付（轮询查询）
 */
export async function monitorPayment(txHash: string): Promise<{
  status: SubscriptionStatus | null;
  order: any;
}> {
  const client = getSupabase();
  if (!client) {
    for (const [userId, orders] of mockOrders.entries()) {
      const order = orders.find((o: any) => o.tx_hash === txHash);
      if (order) {
        return { status: order.status, order };
      }
    }
    return { status: null, order: null };
  }

  const { data, error } = await client
    .from('subscriptions')
    .select('*')
    .eq('tx_hash', txHash)
    .maybeSingle();

  if (error) throw new Error(`监控支付失败: ${error.message}`);
  return { status: data?.status || null, order: data };
}

/**
 * 获取订阅统计数据
 */
export async function getSubscriptionStats() {
  const client = getSupabase();
  if (!client) {
    const totalOrders = Array.from(mockOrders.values()).flat().length;
    const activeOrders = Array.from(mockOrders.values()).flat()
      .filter((o: any) => o.status === SubscriptionStatus.ACTIVE).length;
    return {
      totalSubscriptions: totalOrders,
      activeSubscriptions: activeOrders,
      revenue: totalOrders * 99, // mock计算
    };
  }

  const { data, error } = await client
    .from('subscriptions')
    .select('tier, status');

  if (error) throw new Error(`获取统计失败: ${error.message}`);
  
  const activeCount = data?.filter((s: any) => s.status === SubscriptionStatus.ACTIVE).length || 0;
  
  return {
    totalSubscriptions: data?.length || 0,
    activeSubscriptions: activeCount,
    revenue: data?.reduce((sum: number, s: any) => sum + (PRICING[s.tier as SubscriptionTier] || 0), 0) || 0,
  };
}
