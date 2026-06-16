import { createClient } from '@supabase/supabase-js';

// Supabase 配置 - 使用环境变量
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

if (!supabaseServiceKey) {
  console.warn('[Supabase] Service key not configured, using in-memory storage');
}

// 服务端 Supabase 客户端（带管理员权限）
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// 用户相关操作
export const userService = {
  // 通过钱包地址获取或创建用户
  async findOrCreateByWallet(walletAddress: string) {
    if (!supabaseServiceKey) {
      return null;
    }
    
    try {
      // 先查找
      const { data: existing } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('wallet_address', walletAddress.toLowerCase())
        .single();
      
      if (existing) {
        return existing;
      }
      
      // 创建新用户
      const { data: newUser, error } = await supabaseAdmin
        .from('users')
        .insert({ wallet_address: walletAddress.toLowerCase() })
        .select()
        .single();
      
      if (error) {
        console.error('[Supabase] Create user error:', error);
        return null;
      }
      
      return newUser;
    } catch (err) {
      console.error('[Supabase] User service error:', err);
      return null;
    }
  },

  // 获取用户信息
  async getUser(userId: string) {
    if (!supabaseServiceKey) return null;
    
    try {
      const { data } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      return data;
    } catch (err) {
      console.error('[Supabase] Get user error:', err);
      return null;
    }
  },
};

// 持仓相关操作
export const positionService = {
  // 保存用户持仓
  async savePositions(userId: string, positions: Array<{
    symbol: string;
    amount: number;
    avg_price: number;
    current_price: number;
    pnl: number;
    pnl_percent: number;
  }>) {
    if (!supabaseServiceKey || !userId) return false;
    
    try {
      // 删除旧持仓
      await supabaseAdmin
        .from('user_positions')
        .delete()
        .eq('user_id', userId);
      
      // 插入新持仓
      if (positions.length > 0) {
        const positionsWithUser = positions.map(p => ({
          user_id: userId,
          symbol: p.symbol,
          amount: p.amount,
          avg_price: p.avg_price,
          current_price: p.current_price,
          pnl: p.pnl,
          pnl_percent: p.pnl_percent,
        }));
        
        await supabaseAdmin
          .from('user_positions')
          .insert(positionsWithUser);
      }
      
      return true;
    } catch (err) {
      console.error('[Supabase] Save positions error:', err);
      return false;
    }
  },

  // 获取用户持仓
  async getPositions(userId: string) {
    if (!supabaseServiceKey) return null;
    
    try {
      const { data } = await supabaseAdmin
        .from('user_positions')
        .select('*')
        .eq('user_id', userId)
        .order('pnl_percent', { ascending: false });
      return data || [];
    } catch (err) {
      console.error('[Supabase] Get positions error:', err);
      return null;
    }
  },
};

// 币安 API 相关操作
export const binanceApiService = {
  // 保存用户币安 API
  async saveApiKey(userId: string, apiKey: string, apiSecret: string) {
    if (!supabaseServiceKey || !userId) return false;
    
    try {
      // 加密存储（简单加密，生产环境应使用更安全的方式）
      const encryptedSecret = Buffer.from(apiSecret).toString('base64');
      
      await supabaseAdmin
        .from('user_binance_api')
        .upsert({
          user_id: userId,
          api_key: apiKey,
          api_secret_encrypted: encryptedSecret,
          is_active: true,
        }, {
          onConflict: 'user_id',
        });
      
      return true;
    } catch (err) {
      console.error('[Supabase] Save API key error:', err);
      return false;
    }
  },

  // 获取用户币安 API
  async getApiKey(userId: string) {
    if (!supabaseServiceKey) return null;
    
    try {
      const { data } = await supabaseAdmin
        .from('user_binance_api')
        .select('api_key, api_secret_encrypted')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();
      
      if (data) {
        return {
          apiKey: data.api_key,
          apiSecret: Buffer.from(data.api_secret_encrypted, 'base64').toString(),
        };
      }
      return null;
    } catch (err) {
      console.error('[Supabase] Get API key error:', err);
      return null;
    }
  },

  // 删除用户币安 API
  async deleteApiKey(userId: string) {
    if (!supabaseServiceKey) return false;
    
    try {
      await supabaseAdmin
        .from('user_binance_api')
        .update({ is_active: false })
        .eq('user_id', userId);
      return true;
    } catch (err) {
      console.error('[Supabase] Delete API key error:', err);
      return false;
    }
  },
};

export default {
  supabaseAdmin,
  userService,
  positionService,
  binanceApiService,
};
