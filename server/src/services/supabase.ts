// 内存存储模式 - 用于开发环境
// 生产环境请配置 Supabase 环境变量

import type { SupabaseClient } from '@supabase/supabase-js';

// 内存存储数据结构
interface MemoryStorage {
  users: Map<string, any>;
  positions: Map<string, any>;
  orders: Map<string, any>;
  subscriptions: Map<string, any>;
  binanceApis: Map<string, any>;
}

// 全局内存存储
const memoryStorage: MemoryStorage = {
  users: new Map(),
  positions: new Map(),
  orders: new Map(),
  subscriptions: new Map(),
  binanceApis: new Map(),
};

// 检查是否使用真实 Supabase
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

// 只有在环境变量都配置时才使用 Supabase
let supabaseClient: SupabaseClient | null = null;

if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
  // 动态导入以避免环境变量未配置时出错
  import('@supabase/supabase-js').then(({ createClient }) => {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    console.log('[Supabase] Connected to real Supabase');
  });
} else {
  console.log('[Supabase] Using in-memory storage (no Supabase credentials)');
}

// 导出 Supabase 客户端（可能是 null）
export const supabase: SupabaseClient | null = supabaseClient;

// 导出内存存储
export const memory = memoryStorage;

// 便捷函数：从内存或 Supabase 获取用户
export async function getUser(walletAddress: string): Promise<any> {
  if (supabaseClient) {
    const { data } = await supabaseClient
      .from('users')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single();
    return data;
  }
  // 内存模式
  for (const user of memory.users.values()) {
    if (user.wallet_address === walletAddress) return user;
  }
  return null;
}

// 便捷函数：创建或更新用户
export async function upsertUser(userData: any): Promise<any> {
  if (supabaseClient) {
    const { data } = await supabaseClient
      .from('users')
      .upsert(userData)
      .select()
      .single();
    return data;
  }
  // 内存模式
  memory.users.set(userData.wallet_address || userData.id, userData);
  return userData;
}

// 便捷函数：获取用户持仓
export async function getUserPositions(userId: string): Promise<any[]> {
  if (supabaseClient) {
    const { data } = await supabaseClient
      .from('user_positions')
      .select('*')
      .eq('user_id', userId);
    return data || [];
  }
  // 内存模式
  const positions: any[] = [];
  memory.positions.forEach(pos => {
    if (pos.user_id === userId) positions.push(pos);
  });
  return positions;
}

// 便捷函数：保存持仓
export async function saveUserPosition(position: any): Promise<void> {
  if (supabaseClient) {
    await supabaseClient.from('user_positions').upsert(position);
  } else {
    // 内存模式：用 user_id + symbol 作为 key
    const key = `${position.user_id}_${position.symbol}`;
    memory.positions.set(key, position);
  }
}

// 便捷函数：获取用户币安 API
export async function getUserBinanceApi(userId: string): Promise<any> {
  if (supabaseClient) {
    const { data } = await supabaseClient
      .from('user_binance_api')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();
    return data;
  }
  // 内存模式
  for (const api of memory.binanceApis.values()) {
    if (api.user_id === userId && api.is_active) return api;
  }
  return null;
}

// 便捷函数：保存币安 API
export async function saveUserBinanceApi(apiData: any): Promise<void> {
  if (supabaseClient) {
    await supabaseClient.from('user_binance_api').upsert(apiData);
  } else {
    memory.binanceApis.set(apiData.user_id, apiData);
  }
}

// 便捷函数：删除币安 API
export async function deleteUserBinanceApi(userId: string): Promise<void> {
  if (supabaseClient) {
    await supabaseClient
      .from('user_binance_api')
      .update({ is_active: false })
      .eq('user_id', userId);
  } else {
    const api = memory.binanceApis.get(userId);
    if (api) api.is_active = false;
  }
}

// 便捷函数：获取订阅
export async function getUserSubscription(userId: string): Promise<any> {
  if (supabaseClient) {
    const { data } = await supabaseClient
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    return data;
  }
  // 内存模式
  for (const sub of memory.subscriptions.values()) {
    if (sub.user_id === userId) return sub;
  }
  return null;
}

// 便捷函数：保存订阅
export async function saveSubscription(subData: any): Promise<void> {
  if (supabaseClient) {
    await supabaseClient.from('subscriptions').insert(subData);
  } else {
    memory.subscriptions.set(subData.id, subData);
  }
}
