/**
 * 代币筛选器
 * 根据不同的场景筛选符合条件的代币
 */

import type { Indicators } from '../utils/indicators';
import type { CoinMarketData } from '../services/coingecko';
import { getTopCoins, getCoinsOHLC, getDaysForTimeframe } from '../services/coingecko';
import { calculateAllIndicators } from '../utils/indicators';

export type Timeframe = '1h' | '4h';
export type Direction = 'up' | 'down';
export type Scenario = `${Timeframe}_${Direction}`;

export interface ScreenedToken {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_24h: number;
  market_cap: number;
  volume_24h: number;
  indicators: Indicators;
  score: number; // 综合评分
  matchReasons: string[]; // 匹配原因
}

// 场景一：1小时上涨动能最强
function filter1HUp(tokens: ScreenedToken[]): ScreenedToken[] {
  return tokens.filter(token => {
    const { rsi, adx, volumeRatio, mfi } = token.indicators;
    if (rsi === null || adx === null || mfi === null) return false;
    
    // RSI 在 50-70 之间（刚启动，不过热）
    const rsiOk = rsi >= 50 && rsi <= 70;
    // ADX > 25（有趋势）
    const adxOk = adx > 25;
    // 成交量放大 > 1.5 倍
    const volOk = volumeRatio > 1.5;
    // MFI > 60 且资金流入
    const mfiOk = mfi > 60;
    
    return rsiOk && adxOk && volOk && mfiOk;
  }).map(token => {
    const reasons: string[] = [];
    const { rsi, adx, volumeRatio, mfi } = token.indicators;
    
    if (rsi !== null && rsi >= 50 && rsi <= 70) reasons.push(`RSI适中(${rsi.toFixed(0)})`);
    if (adx !== null && adx > 25) reasons.push(`ADX强势(${adx.toFixed(0)})`);
    if (volumeRatio > 1.5) reasons.push(`成交量放大(${volumeRatio.toFixed(1)}x)`);
    if (mfi !== null && mfi > 60) reasons.push(`资金流入(MFI:${mfi.toFixed(0)})`);
    
    // 计算评分
    let score = 0;
    if (rsi !== null && rsi >= 55 && rsi <= 65) score += 30; // 最优区间
    else if (rsi !== null) score += 15;
    if (adx !== null) score += adx;
    if (volumeRatio > 1.5) score += (volumeRatio - 1) * 20;
    if (mfi !== null) score += mfi - 50;
    
    return { ...token, score, matchReasons: reasons };
  });
}

// 场景二：4小时上涨动能最强
function filter4HUp(tokens: ScreenedToken[]): ScreenedToken[] {
  return tokens.filter(token => {
    const { ema50, ema200, macd, adx, plusDI, obv, volumeRatio } = token.indicators;
    if (ema50 === null || ema200 === null || macd === null || adx === null) return false;
    
    // 价格站上 EMA50
    const priceOk = token.current_price > ema50;
    // EMA 多头排列 (EMA50 > EMA200)
    const emaOk = ema50 > ema200;
    // MACD 在零轴上方且柱状图由负转正或放大
    const macdOk = macd.value > 0 && macd.histogram > 0;
    // ADX > 25
    const adxOk = adx > 25;
    // +DI 在 -DI 上方
    const diOk = plusDI !== null && plusDI > (token.indicators.minusDI || 0);
    
    return priceOk && emaOk && macdOk && adxOk && diOk;
  }).map(token => {
    const reasons: string[] = [];
    const { ema50, ema200, macd, adx, plusDI } = token.indicators;
    
    if (ema50 !== null && token.current_price > ema50) reasons.push('站上EMA50');
    if (ema50 !== null && ema200 !== null && ema50 > ema200) reasons.push('EMA多头排列');
    if (macd !== null && macd.value > 0) reasons.push('MACD零轴上方');
    if (macd !== null && macd.histogram > 0) reasons.push('MACD动能增强');
    if (adx !== null && adx > 25) reasons.push(`ADX强势(${adx.toFixed(0)})`);
    if (plusDI !== null && token.indicators.minusDI !== null && plusDI > token.indicators.minusDI) {
      reasons.push('+DI>-DI');
    }
    
    // 计算评分
    let score = 0;
    if (ema50 !== null && token.current_price > ema50) score += 20;
    if (ema50 !== null && ema200 !== null) score += (ema50 / ema200 - 1) * 100;
    if (macd !== null && macd.histogram > 0) score += macd.histogram * 10;
    if (adx !== null) score += adx;
    
    return { ...token, score, matchReasons: reasons };
  });
}

// 场景三：1小时下跌动能最强
function filter1HDown(tokens: ScreenedToken[]): ScreenedToken[] {
  return tokens.filter(token => {
    const { rsi, vwap, volumeRatio } = token.indicators;
    if (rsi === null || vwap === null) return false;
    
    // 价格在 VWAP 下方
    const vwapOk = token.current_price < vwap;
    // RSI 在 30-50 之间且下降
    const rsiOk = rsi >= 30 && rsi <= 50;
    // 下跌放量
    const volOk = volumeRatio > 1.5 && token.price_change_24h < 0;
    
    return vwapOk && rsiOk && volOk;
  }).map(token => {
    const reasons: string[] = [];
    const { rsi, vwap, volumeRatio } = token.indicators;
    
    if (vwap !== null && token.current_price < vwap) reasons.push('低于VWAP');
    if (rsi !== null && rsi >= 30 && rsi <= 50) reasons.push(`RSI偏弱(${rsi.toFixed(0)})`);
    if (volumeRatio > 1.5 && token.price_change_24h < 0) reasons.push(`下跌放量(${volumeRatio.toFixed(1)}x)`);
    
    // 计算评分（下跌动能）
    let score = 0;
    if (vwap !== null) score += ((vwap - token.current_price) / vwap) * 100;
    if (rsi !== null && rsi <= 40) score += (50 - rsi);
    if (volumeRatio > 1.5) score += (volumeRatio - 1) * 15;
    
    return { ...token, score: score * -1, matchReasons: reasons }; // 负数表示下跌
  });
}

// 场景四：4小时下跌动能最强
function filter4HDown(tokens: ScreenedToken[]): ScreenedToken[] {
  return tokens.filter(token => {
    const { ema50, ema200, macd, adx, atr } = token.indicators;
    if (ema50 === null || ema200 === null || macd === null || adx === null || atr === null) return false;
    
    // 价格跌破 EMA50
    const priceOk = token.current_price < ema50;
    // EMA 空头排列 (EMA50 < EMA200)
    const emaOk = ema50 < ema200;
    // MACD 在零轴下方
    const macdOk = macd.value < 0;
    // ADX > 25（趋势明显）
    const adxOk = adx > 25;
    // ATR 扩张
    const atrOk = atr > 0;
    
    return priceOk && emaOk && macdOk && adxOk;
  }).map(token => {
    const reasons: string[] = [];
    const { ema50, ema200, macd, adx, atr } = token.indicators;
    
    if (ema50 !== null && token.current_price < ema50) reasons.push('跌破EMA50');
    if (ema50 !== null && ema200 !== null && ema50 < ema200) {
      reasons.push('EMA空头排列');
    }
    if (macd !== null && macd.value < 0) reasons.push('MACD零轴下方');
    if (macd !== null && macd.histogram < 0) reasons.push('MACD动能衰减');
    if (adx !== null && adx > 25) reasons.push(`ADX强势(${adx.toFixed(0)})`);
    if (atr !== null) reasons.push(`波动扩张(ATR:${atr.toFixed(2)})`);
    
    // 计算评分
    let score = 0;
    if (ema50 !== null) {
      if (token.current_price < ema50) score += (ema50 - token.current_price) / ema50 * 100;
    }
    if (macd !== null && macd.histogram < 0) score += Math.abs(macd.histogram) * 10;
    if (adx !== null) score += adx;
    if (atr !== null) score += atr / token.current_price * 100;
    
    return { ...token, score: score * -1, matchReasons: reasons }; // 负数表示下跌
  });
}

/**
 * 主筛选函数
 */
export async function screenTokens(
  scenario: Scenario,
  limit: number = 10
): Promise<ScreenedToken[]> {
  console.log(`Starting screening for scenario: ${scenario}`);
  
  // 1. 获取市值前100的代币
  const topCoins = await getTopCoins(100);
  console.log(`Fetched ${topCoins.length} top coins`);
  
  if (topCoins.length === 0) {
    return [];
  }
  
  // 2. 确定时间框架和K线天数
  const timeframe = scenario.split('_')[0] as Timeframe;
  const days = getDaysForTimeframe(timeframe);
  
  // 3. 获取K线数据
  const coinIds = topCoins.map(c => c.id);
  const ohlcData = await getCoinsOHLC(coinIds, days);
  console.log(`Fetched OHLC data for ${ohlcData.size} coins`);
  
  // 4. 计算指标并构建代币数据
  const tokensWithIndicators: ScreenedToken[] = [];
  
  for (const coin of topCoins) {
    const ohlcv = ohlcData.get(coin.id);
    if (!ohlcv || ohlcv.length < 50) continue;
    
    const indicators = calculateAllIndicators(ohlcv);
    if (!indicators) continue;
    
    tokensWithIndicators.push({
      id: coin.id,
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      image: coin.image,
      current_price: coin.current_price,
      price_change_24h: coin.price_change_percentage_24h,
      market_cap: coin.market_cap,
      volume_24h: coin.total_volume,
      indicators,
      score: 0,
      matchReasons: []
    });
  }
  
  console.log(`Calculated indicators for ${tokensWithIndicators.length} tokens`);
  
  // 5. 根据场景筛选
  let filtered: ScreenedToken[];
  
  switch (scenario) {
    case '1h_up':
      filtered = filter1HUp(tokensWithIndicators);
      break;
    case '4h_up':
      filtered = filter4HUp(tokensWithIndicators);
      break;
    case '1h_down':
      filtered = filter1HDown(tokensWithIndicators);
      break;
    case '4h_down':
      filtered = filter4HDown(tokensWithIndicators);
      break;
    default:
      filtered = [];
  }
  
  // 6. 按评分排序并限制数量
  filtered.sort((a, b) => Math.abs(b.score) - Math.abs(a.score));
  
  console.log(`Filtered ${filtered.length} tokens for ${scenario}`);
  
  return filtered.slice(0, limit);
}

/**
 * 获取筛选条件说明
 */
export function getScenarioDescription(scenario: Scenario): string {
  switch (scenario) {
    case '1h_up':
      return 'RSI 50-70 | ADX>25 | 成交量>1.5x | MFI>60';
    case '4h_up':
      return 'EMA多头排列 | MACD零轴上方 | ADX>25 | +DI>-DI';
    case '1h_down':
      return '低于VWAP | RSI 30-50 | 下跌放量';
    case '4h_down':
      return '跌破EMA50 | EMA空头 | MACD零轴下方 | ATR扩张';
    default:
      return '';
  }
}

/**
 * 获取场景标题
 */
export function getScenarioTitle(scenario: Scenario): { direction: string; timeframe: string; description: string } {
  switch (scenario) {
    case '1h_up':
      return { direction: 'up', timeframe: '1H', description: '1小时上涨动能' };
    case '4h_up':
      return { direction: 'up', timeframe: '4H', description: '4小时上涨动能' };
    case '1h_down':
      return { direction: 'down', timeframe: '1H', description: '1小时下跌动能' };
    case '4h_down':
      return { direction: 'down', timeframe: '4H', description: '4小时下跌动能' };
    default:
      return { direction: 'up', timeframe: '1H', description: '' };
  }
}
