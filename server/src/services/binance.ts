import crypto from 'crypto';

// 币安 API 服务 - 获取用户真实持仓

const BINANCE_API_URL = 'https://api.binance.com';
const BINANCE_SPOT_API_URL = 'https://api.binance.com/api/v3';

// 签名请求
function createSignature(queryString: string, secretKey: string): string {
  return crypto
    .createHmac('sha256', secretKey)
    .update(queryString)
    .digest('hex');
}

// 获取账户信息（持仓）
export async function getAccountInfo(apiKey: string, apiSecret: string) {
  try {
    const timestamp = Date.now();
    const queryString = `timestamp=${timestamp}`;
    const signature = createSignature(queryString, apiSecret);

    const response = await fetch(
      `${BINANCE_SPOT_API_URL}/account?${queryString}&signature=${signature}`,
      {
        headers: {
          'X-MBX-APIKEY': apiKey,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json() as { msg?: string };
      throw new Error(error.msg || 'Failed to fetch account info');
    }

    return await response.json();
  } catch (error) {
    console.error('[Binance API] Get account info error:', error);
    throw error;
  }
}

// 获取持仓
export function extractPositions(accountInfo: any): Array<{symbol: string; free: number; locked: number; total: number}> {
  const positions: Array<{symbol: string; free: number; locked: number; total: number}> = [];
  
  if (!accountInfo || !accountInfo.balances) {
    return positions;
  }

  for (const balance of accountInfo.balances) {
    const free = parseFloat(balance.free) || 0;
    const locked = parseFloat(balance.locked) || 0;
    const total = free + locked;

    // 只显示有持仓的币种
    if (total > 0.00000001) {
      positions.push({
        symbol: balance.asset,
        free,
        locked,
        total,
      });
    }
  }

  return positions;
}

// 获取多个币种的价格
export async function getPrices(symbols: string[]) {
  try {
    const response = await fetch(`${BINANCE_API_URL}/api/v3/ticker/price`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch prices');
    }

    const allPrices = (await response.json()) as Array<{symbol: string; price: string}>;
    const priceMap = new Map<string, number>();
    
    for (const price of allPrices) {
      priceMap.set(price.symbol, parseFloat(price.price));
    }

    // 只返回请求的币种价格
    const result: Record<string, number> = {};
    for (const symbol of symbols) {
      result[symbol] = priceMap.get(symbol) || 0;
    }

    return result;
  } catch (error) {
    console.error('[Binance API] Get prices error:', error);
    return {};
  }
}

// 计算持仓价值和盈亏
export function calculatePositionsWithPnL(balances: any[], prices: Record<string, number>, baseCurrency = 'USDT') {
  const result = [];
  
  for (const balance of balances) {
    if (balance.total <= 0) continue;
    
    const symbol = balance.symbol;
    let currentPrice = 0;
    let priceChange24h = 0;
    
    // 获取价格（如果是 USDT 直接对）
    const priceSymbol = symbol === baseCurrency ? symbol : `${symbol}${baseCurrency}`;
    currentPrice = prices[priceSymbol] || 0;
    
    // 如果是 USDT 本身
    if (symbol === baseCurrency) {
      currentPrice = 1;
    }
    
    // 计算持仓价值（折算为 USDT）
    const value = balance.total * currentPrice;
    
    // 只返回有实际价值的持仓（大于 1 USDT）
    if (value >= 1) {
      result.push({
        symbol,
        amount: balance.total,
        avgPrice: currentPrice, // 如果没有买入记录，用当前价代替
        currentPrice,
        value,
        pnl: 0, // 没有买入价，无法计算真实盈亏
        pnlPercent: 0,
      });
    }
  }
  
  // 按价值排序
  result.sort((a, b) => b.value - a.value);
  
  return result;
}

// 完整获取用户持仓（带价格）
export async function fetchUserPositions(apiKey: string, apiSecret: string) {
  try {
    // 1. 获取账户信息
    const accountInfo = await getAccountInfo(apiKey, apiSecret);
    
    // 2. 提取持仓
    const balances = extractPositions(accountInfo);
    
    if (balances.length === 0) {
      return [];
    }
    
    // 3. 获取价格
    const symbols = balances.map(b => 
      b.symbol === 'USDT' ? b.symbol : `${b.symbol}USDT`
    );
    const prices = await getPrices(symbols);
    
    // 4. 计算价值和盈亏
    const positions = calculatePositionsWithPnL(balances, prices);
    
    return positions;
  } catch (error) {
    console.error('[Binance API] Fetch positions error:', error);
    throw error;
  }
}

// 验证 API Key 是否有效
export async function validateApiKey(apiKey: string, apiSecret: string): Promise<boolean> {
  try {
    await getAccountInfo(apiKey, apiSecret);
    return true;
  } catch {
    return false;
  }
}

export default {
  getAccountInfo,
  fetchUserPositions,
  validateApiKey,
};
