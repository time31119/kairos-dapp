/**
 * CoinGecko API 服务
 * 用于获取加密货币行情数据
 */

import type { OHLCV } from '../utils/indicators';

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';

export interface CoinMarketData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
}

export interface CoinOHLCVData {
  id: string;
  symbol: string;
  name: string;
  ohlcv: OHLCV[];
}

/**
 * 获取市值排名前N的代币
 */
export async function getTopCoins(limit: number = 100): Promise<CoinMarketData[]> {
  try {
    const response = await fetch(
      `${COINGECKO_BASE}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false&price_change_percentage=24h`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json() as CoinMarketData[];
    return data;
  } catch (error) {
    console.error('Error fetching top coins:', error);
    return [];
  }
}

/**
 * 获取单个代币的K线数据 (OHLCV)
 */
export async function getCoinOHLC(coinId: string, days: number): Promise<OHLCV[]> {
  try {
    const response = await fetch(
      `${COINGECKO_BASE}/coins/${coinId}/ohlc?vs_currency=usd&days=${days}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json() as number[][];
    
    // CoinGecko 返回的格式: [timestamp, open, high, low, close, volume]
    return data.map((item: number[]) => ({
      timestamp: item[0],
      open: item[1],
      high: item[2],
      low: item[3],
      close: item[4],
      volume: item[5]
    }));
  } catch (error) {
    console.error(`Error fetching OHLC for ${coinId}:`, error);
    return [];
  }
}

/**
 * 批量获取K线数据
 */
export async function getCoinsOHLC(
  coinIds: string[],
  days: number
): Promise<Map<string, OHLCV[]>> {
  const results = new Map<string, OHLCV[]>();
  
  // 限制并发请求
  const batchSize = 5;
  for (let i = 0; i < coinIds.length; i += batchSize) {
    const batch = coinIds.slice(i, i + batchSize);
    const promises = batch.map(async (coinId) => {
      const ohlcv = await getCoinOHLC(coinId, days);
      return { coinId, ohlcv };
    });
    
    const batchResults = await Promise.all(promises);
    batchResults.forEach(({ coinId, ohlcv }) => {
      if (ohlcv.length > 0) {
        results.set(coinId, ohlcv);
      }
    });
    
    // 避免请求过快
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  return results;
}

/**
 * 获取K线数据的天数映射
 */
export function getDaysForTimeframe(timeframe: '1h' | '4h'): number {
  switch (timeframe) {
    case '1h':
      return 7; // 需要至少 200 根 1 小时 K 线
    case '4h':
      return 30; // 需要至少 200 根 4 小时 K 线
    default:
      return 7;
  }
}
