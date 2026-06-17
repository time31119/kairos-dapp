import { Router } from 'express';
import { fetchUserPositions, validateApiKey } from '../services/binance';
import { binanceApiService, userService, positionService } from '../services/supabase';
import crypto from 'crypto';

const router = Router();

// 简单的 session token 生成
function generateToken(walletAddress: string): string {
  return crypto.createHash('sha256')
    .update(walletAddress + Date.now())
    .digest('hex');
}

// 内存存储（用于 demo，生产环境使用 Supabase）
const inMemoryUsers: Map<string, {
  wallet_address: string;
  api_key?: string;
  api_secret?: string;
}> = new Map();

// ============ 钱包登录 ============
router.post('/wallet-login', async (req, res) => {
  try {
    const { wallet_address, signature } = req.body;
    
    if (!wallet_address) {
      return res.status(400).json({ error: 'Missing wallet_address' });
    }
    
    // 验证签名（简化版，生产环境需要验证签名）
    // 这里简化处理，只要有钱包地址即可
    
    const address = wallet_address.toLowerCase();
    
    // 查找或创建用户
    let user = inMemoryUsers.get(address);
    
    if (!user) {
      user = { wallet_address: address };
      inMemoryUsers.set(address, user);
    }
    
    // 生成 token
    const token = generateToken(address);
    
    res.json({
      success: true,
      token,
      wallet_address: address,
      message: 'Login successful',
    });
  } catch (error) {
    console.error('[Wallet Login] Error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// ============ 绑定币安 API ============
router.post('/bind-binance', async (req, res) => {
  try {
    const { wallet_address, api_key, api_secret } = req.body;
    
    if (!wallet_address || !api_key || !api_secret) {
      return res.status(400).json({ error: 'Missing parameters' });
    }
    
    // 验证 API Key 是否有效
    const isValid = await validateApiKey(api_key, api_secret);
    
    if (!isValid) {
      return res.status(400).json({ 
        error: 'Invalid API key or secret',
        message: '请检查 API Key 和 Secret 是否正确'
      });
    }
    
    const address = wallet_address.toLowerCase();
    
    // 保存到内存（生产环境使用 Supabase）
    const user = inMemoryUsers.get(address);
    if (user) {
      user.api_key = api_key;
      user.api_secret = api_secret;
    } else {
      inMemoryUsers.set(address, { 
        wallet_address: address, 
        api_key, 
        api_secret 
      });
    }
    
    // 尝试保存到 Supabase（如果配置了）
    // Note: Supabase integration disabled for now
    // if (supabaseConfigured) {
    //   const dbUser = await userService.findOrCreateByWallet(address);
    //   if (dbUser) {
    //     await binanceApiService.saveApiKey(dbUser.id, api_key, api_secret);
    //   }
    // }
    
    res.json({
      success: true,
      message: 'Binance API bound successfully',
    });
  } catch (error) {
    console.error('[Bind Binance] Error:', error);
    res.status(500).json({ error: 'Failed to bind Binance API' });
  }
});

// ============ 获取绑定状态 ============
router.get('/binance-status', async (req, res) => {
  try {
    const wallet_address = req.query.wallet_address as string;
    
    if (!wallet_address) {
      return res.status(400).json({ error: 'Missing wallet_address' });
    }
    
    const address = wallet_address.toLowerCase();
    const user = inMemoryUsers.get(address);
    
    const isBound = !!(user?.api_key && user?.api_secret);
    
    res.json({
      is_bound: isBound,
      api_key: isBound ? (user?.api_key?.substring(0, 8) ?? '***') + '...' : null,
    });
  } catch (error) {
    console.error('[Binance Status] Error:', error);
    res.status(500).json({ error: 'Failed to get status' });
  }
});

// ============ 解绑币安 API ============
router.post('/unbind-binance', async (req, res) => {
  try {
    const { wallet_address } = req.body;
    
    if (!wallet_address) {
      return res.status(400).json({ error: 'Missing wallet_address' });
    }
    
    const address = wallet_address.toLowerCase();
    const user = inMemoryUsers.get(address);
    
    if (user) {
      delete user.api_key;
      delete user.api_secret;
    }
    
    res.json({
      success: true,
      message: 'Binance API unbound successfully',
    });
  } catch (error) {
    console.error('[Unbind Binance] Error:', error);
    res.status(500).json({ error: 'Failed to unbind' });
  }
});

// ============ 获取用户持仓 (别名) ============
router.post('/my', async (req, res) => {
  try {
    const { wallet_address } = req.body;
    
    if (!wallet_address) {
      return res.status(400).json({ error: 'Missing wallet_address' });
    }
    
    const address = wallet_address.toLowerCase();
    const user = inMemoryUsers.get(address);
    
    // 如果没有绑定 API，返回提示
    if (!user?.api_key || !user?.api_secret) {
      return res.json({
        has_api: false,
        positions: [],
        message: '请先绑定 Binance API',
      });
    }
    
    // 从币安获取真实持仓
    const positions = await fetchUserPositions(user.api_key, user.api_secret);
    
    // 格式化返回数据
    const formattedPositions = positions.map((p: any) => ({
      symbol: p.symbol,
      amount: p.amount,
      value: p.value,
      pnl: p.pnl || 0,
      pnlPercent: p.pnlPercent || 0,
    }));
    
    res.json({
      has_api: true,
      positions: formattedPositions,
      totalValue: formattedPositions.reduce((sum: number, p: any) => sum + p.value, 0),
      totalPnl: formattedPositions.reduce((sum: number, p: any) => sum + p.pnl, 0),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('获取持仓失败:', error);
    res.status(500).json({ error: 'Failed to fetch positions' });
  }
});

// ============ 获取用户持仓 ============
router.get('/positions', async (req, res) => {
  try {
    const wallet_address = req.query.wallet_address as string;
    
    if (!wallet_address) {
      return res.status(400).json({ error: 'Missing wallet_address' });
    }
    
    const address = wallet_address.toLowerCase();
    const user = inMemoryUsers.get(address);
    
    // 如果没有绑定 API，返回提示
    if (!user?.api_key || !user?.api_secret) {
      return res.json({
        has_api: false,
        positions: [],
        message: '请先绑定 Binance API',
      });
    }
    
    // 从币安获取真实持仓
    const positions = await fetchUserPositions(user.api_key, user.api_secret);
    
    // 格式化返回数据
    const formattedPositions = positions.map((p: any) => ({
      symbol: p.symbol,
      amount: p.amount,
      value: p.value,
      pnl: p.pnl || 0,
      pnlPercent: p.pnlPercent || 0,
    }));
    
    res.json({
      has_api: true,
      positions: formattedPositions,
      totalValue: formattedPositions.reduce((sum: number, p: any) => sum + p.value, 0),
    });
  } catch (error: any) {
    console.error('[Positions] Error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch positions',
      message: error.message 
    });
  }
});

// Supabase 配置检查（通过环境变量）
const supabaseConfigured = !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY);

export default router;
