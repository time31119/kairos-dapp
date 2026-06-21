/**
 * Subscription Service - 使用 Supabase 数据库
 */
import { getSupabaseClient } from '../storage/database/supabase-client';

const supabase = getSupabaseClient();

// 订阅方案枚举
export enum SubscriptionTier {
  SILVER = 'silver',     // 白银版 $99/月
  GOLD = 'gold',         // 黄金版 $199/月
  DIAMOND = 'diamond',    // 钻石版 $299/月
}

// 订阅状态枚举
export enum SubscriptionStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
  PENDING = 'pending',    // 待支付
}

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

// ==================== 数据库操作 ====================

/**
 * 获取用户订阅信息
 */
export async function getUserSubscription(userId: string) {
  const { data, error } = await supabase
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
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw new Error(`获取订单失败: ${error.message}`);
  return data || [];
}

/**
 * 创建新订阅/订单
 */
export async function createSubscription(params: {
  userId: string;
  walletAddress: string;
  tier: SubscriptionTier;
  paymentMethod?: string;
}) {
  const { data, error } = await supabase
    .from('subscriptions')
    .insert({
      user_id: params.userId,
      wallet_address: params.walletAddress,
      tier: params.tier,
      price: PRICING[params.tier],
      status: SubscriptionStatus.PENDING,
      payment_method: params.paymentMethod || 'USDT',
    })
    .select()
    .single();
  
  if (error) throw new Error(`创建订单失败: ${error.message}`);
  return data;
}

/**
 * 确认支付成功
 */
export async function confirmSubscription(orderId: string, txHash?: string) {
  // 计算到期时间
  const now = new Date();
  const expireAt = new Date(now.setMonth(now.getMonth() + 1));
  
  const { data, error } = await supabase
    .from('subscriptions')
    .update({
      status: SubscriptionStatus.ACTIVE,
      tx_hash: txHash,
      activated_at: new Date().toISOString(),
      expire_at: expireAt.toISOString(),
    })
    .eq('id', orderId)
    .select()
    .single();
  
  if (error) throw new Error(`确认订阅失败: ${error.message}`);
  return data;
}

/**
 * 取消订阅
 */
export async function cancelSubscription(orderId: string) {
  const { data, error } = await supabase
    .from('subscriptions')
    .update({
      status: SubscriptionStatus.CANCELLED,
      cancelled_at: new Date().toISOString(),
    })
    .eq('id', orderId)
    .select()
    .single();
  
  if (error) throw new Error(`取消订阅失败: ${error.message}`);
  return data;
}

/**
 * 升级订阅
 */
export async function upgradeSubscription(orderId: string, newTier: SubscriptionTier) {
  const { data: current, error: fetchError } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('id', orderId)
    .maybeSingle();
  
  if (fetchError) throw new Error(`获取订阅失败: ${fetchError.message}`);
  if (!current) throw new Error('订阅不存在');
  
  // 计算差价
  const priceDiff = PRICING[newTier] - current.price;
  const now = new Date();
  const expireAt = new Date(now.setMonth(now.getMonth() + 1));
  
  const { data, error } = await supabase
    .from('subscriptions')
    .update({
      tier: newTier,
      price: PRICING[newTier],
      status: SubscriptionStatus.ACTIVE,
      upgraded_from: current.tier,
      upgraded_at: new Date().toISOString(),
      expire_at: expireAt.toISOString(),
    })
    .eq('id', orderId)
    .select()
    .single();
  
  if (error) throw new Error(`升级订阅失败: ${error.message}`);
  return { subscription: data, priceDiff };
}

/**
 * 查询链上交易 (模拟 - 实际需要第三方API如 TRONSCAN)
 */
export async function checkOnChainTransaction(walletAddress: string, expectedAmount: number) {
  // TODO: 接入 TRONSCAN API 或其他链上数据源
  // 这里返回模拟数据，实际需要调用第三方API
  
  // 模拟返回
  return {
    found: false,
    txHash: null,
    amount: 0,
    timestamp: null,
  };
}

/**
 * 监听钱包地址交易 (后台任务)
 */
export async function monitorPayment(params: {
  orderId: string;
  walletAddress: string;
  expectedAmount: number;
}) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('status')
    .eq('id', params.orderId)
    .maybeSingle();
  
  if (error) throw new Error(`查询订单失败: ${error.message}`);
  if (!data) throw new Error('订单不存在');
  if (data.status === SubscriptionStatus.ACTIVE) {
    return { success: true, message: '订单已激活' };
  }
  
  // 查询链上交易
  const txResult = await checkOnChainTransaction(params.walletAddress, params.expectedAmount);
  
  if (txResult.found && txResult.amount >= params.expectedAmount) {
    // 确认支付
    await confirmSubscription(params.orderId, txResult.txHash || undefined);
    return { success: true, message: '支付确认成功' };
  }
  
  return { success: false, message: '等待链上确认...' };
}

/**
 * 获取订阅统计数据
 */
export async function getSubscriptionStats() {
  const { data: total, error: totalError } = await supabase
    .from('subscriptions')
    .select('*', { count: 'exact', head: true });
  
  if (totalError) throw new Error(`统计失败: ${totalError.message}`);
  
  const { data: active, error: activeError } = await supabase
    .from('subscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('status', SubscriptionStatus.ACTIVE);
  
  if (activeError) throw new Error(`统计失败: ${activeError.message}`);
  
  return {
    totalSubscriptions: total || 0,
    activeSubscriptions: active || 0,
  };
}
