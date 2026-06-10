/**
 * 技术指标计算模块
 * 实现 RSI, ADX, MACD, EMA, MFI, OBV 等指标的计算
 */

export interface OHLCV {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Indicators {
  rsi: number | null;
  adx: number | null;
  plusDI: number | null;
  minusDI: number | null;
  macd: {
    value: number;
    signal: number;
    histogram: number;
  } | null;
  ema20: number | null;
  ema50: number | null;
  ema200: number | null;
  mfi: number | null;
  obv: number;
  atr: number | null;
  volumeRatio: number;
  vwap: number | null;
}

/**
 * 计算简单移动平均线
 */
function sma(data: number[], period: number): number | null {
  if (data.length < period) return null;
  const slice = data.slice(-period);
  return slice.reduce((a, b) => a + b, 0) / period;
}

/**
 * 计算指数移动平均线
 */
export function ema(data: number[], period: number): number | null {
  if (data.length < period) return null;
  
  const k = 2 / (period + 1);
  let emaValue = sma(data.slice(0, period), period);
  
  if (emaValue === null) return null;
  
  for (let i = period; i < data.length; i++) {
    emaValue = data[i] * k + emaValue * (1 - k);
  }
  
  return emaValue;
}

/**
 * 计算 RSI (相对强弱指数)
 */
export function calculateRSI(closes: number[], period: number = 14): number | null {
  if (closes.length < period + 1) return null;
  
  let gains = 0;
  let losses = 0;
  
  for (let i = closes.length - period; i < closes.length; i++) {
    const change = closes[i] - closes[i - 1];
    if (change > 0) gains += change;
    else losses -= change;
  }
  
  const avgGain = gains / period;
  const avgLoss = losses / period;
  
  if (avgLoss === 0) return 100;
  
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

/**
 * 计算 True Range 和 ATR
 */
function calculateTR(highs: number[], lows: number[], closes: number[]): number[] {
  const tr: number[] = [];
  for (let i = 1; i < highs.length; i++) {
    const h = highs[i];
    const l = lows[i];
    const pc = closes[i - 1];
    tr.push(Math.max(h - l, Math.abs(h - pc), Math.abs(l - pc)));
  }
  return tr;
}

export function calculateATR(highs: number[], lows: number[], closes: number[], period: number = 14): number | null {
  if (highs.length < period + 1) return null;
  
  const tr = calculateTR(highs, lows, closes);
  if (tr.length < period) return null;
  
  return sma(tr, period);
}

/**
 * 计算 ADX (平均趋向指数) 和 DI
 */
export function calculateADX(
  highs: number[], 
  lows: number[], 
  closes: number[], 
  period: number = 14
): { adx: number | null; plusDI: number | null; minusDI: number | null } {
  if (highs.length < period * 2 + 1) {
    return { adx: null, plusDI: null, minusDI: null };
  }
  
  const tr = calculateTR(highs, lows, closes);
  const plusDM: number[] = [];
  const minusDM: number[] = [];
  
  for (let i = 1; i < highs.length; i++) {
    const highDiff = highs[i] - highs[i - 1];
    const lowDiff = lows[i - 1] - lows[i];
    
    plusDM.push(highDiff > lowDiff && highDiff > 0 ? highDiff : 0);
    minusDM.push(lowDiff > highDiff && lowDiff > 0 ? lowDiff : 0);
  }
  
  if (plusDM.length < period || tr.length < period) {
    return { adx: null, plusDI: null, minusDI: null };
  }
  
  // 计算平滑的 DM 和 TR
  let smoothPlusDM = plusDM.slice(0, period).reduce((a, b) => a + b, 0);
  let smoothMinusDM = minusDM.slice(0, period).reduce((a, b) => a + b, 0);
  let smoothTR = tr.slice(0, period).reduce((a, b) => a + b, 0);
  
  const plusDIList: number[] = [];
  const minusDIList: number[] = [];
  const dxList: number[] = [];
  
  for (let i = period; i < plusDM.length; i++) {
    if (i > period) {
      smoothPlusDM = smoothPlusDM - smoothPlusDM / period + plusDM[i];
      smoothMinusDM = smoothMinusDM - smoothMinusDM / period + minusDM[i];
      smoothTR = smoothTR - smoothTR / period + tr[i];
    }
    
    const plusDI = (smoothPlusDM / smoothTR) * 100;
    const minusDI = (smoothMinusDM / smoothTR) * 100;
    const dx = (Math.abs(plusDI - minusDI) / (plusDI + minusDI)) * 100;
    
    plusDIList.push(plusDI);
    minusDIList.push(minusDI);
    dxList.push(dx);
  }
  
  if (dxList.length < period) {
    return { adx: null, plusDI: null, minusDI: null };
  }
  
  const adx = sma(dxList, period);
  const plusDI = plusDIList[plusDIList.length - 1];
  const minusDI = minusDIList[minusDIList.length - 1];
  
  return { adx, plusDI, minusDI };
}

/**
 * 计算 MACD
 */
export function calculateMACD(
  closes: number[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): { value: number; signal: number; histogram: number } | null {
  if (closes.length < slowPeriod + signalPeriod) return null;
  
  const fastEMA = ema(closes, fastPeriod);
  const slowEMA = ema(closes, slowPeriod);
  
  if (fastEMA === null || slowEMA === null) return null;
  
  const macdLine: number[] = [];
  for (let i = 0; i < closes.length; i++) {
    const f = ema(closes.slice(0, i + 1), fastPeriod);
    const s = ema(closes.slice(0, i + 1), slowPeriod);
    if (f !== null && s !== null) {
      macdLine.push(f - s);
    }
  }
  
  if (macdLine.length < signalPeriod) return null;
  
  const signalLine = ema(macdLine, signalPeriod);
  if (signalLine === null) return null;
  
  const macdValue = macdLine[macdLine.length - 1];
  const histogram = macdValue - signalLine;
  
  return {
    value: macdValue,
    signal: signalLine,
    histogram
  };
}

/**
 * 计算 MFI (资金流量指数)
 */
export function calculateMFI(
  highs: number[],
  lows: number[],
  closes: number[],
  volumes: number[],
  period: number = 14
): number | null {
  if (highs.length < period + 1) return null;
  
  const rawMF: number[] = [];
  
  for (let i = 1; i < highs.length; i++) {
    const typicalPrice = (highs[i] + lows[i] + closes[i]) / 3;
    const moneyFlow = typicalPrice * volumes[i];
    rawMF.push(moneyFlow);
  }
  
  if (rawMF.length < period) return null;
  
  let positiveMF = 0;
  let negativeMF = 0;
  
  for (let i = rawMF.length - period; i < rawMF.length; i++) {
    if (closes[i + 1] > closes[i]) {
      positiveMF += rawMF[i];
    } else {
      negativeMF += rawMF[i];
    }
  }
  
  if (negativeMF === 0) return 100;
  
  const moneyFlowRatio = positiveMF / negativeMF;
  return 100 - (100 / (1 + moneyFlowRatio));
}

/**
 * 计算 OBV (能量潮)
 */
export function calculateOBV(closes: number[], volumes: number[]): number {
  let obv = volumes[0];
  
  for (let i = 1; i < closes.length; i++) {
    if (closes[i] > closes[i - 1]) {
      obv += volumes[i];
    } else if (closes[i] < closes[i - 1]) {
      obv -= volumes[i];
    }
  }
  
  return obv;
}

/**
 * 计算 VWAP (成交量加权平均价格)
 */
export function calculateVWAP(
  highs: number[],
  lows: number[],
  closes: number[],
  volumes: number[]
): number | null {
  if (highs.length === 0) return null;
  
  let cumulativeTPV = 0;
  let cumulativeVolume = 0;
  
  for (let i = 0; i < highs.length; i++) {
    const typicalPrice = (highs[i] + lows[i] + closes[i]) / 3;
    cumulativeTPV += typicalPrice * volumes[i];
    cumulativeVolume += volumes[i];
  }
  
  if (cumulativeVolume === 0) return null;
  
  return cumulativeTPV / cumulativeVolume;
}

/**
 * 计算成交量比率
 */
export function calculateVolumeRatio(volumes: number[], lookback: number = 20): number {
  if (volumes.length < lookback + 1) return 1;
  
  const currentVolume = volumes[volumes.length - 1];
  const avgVolume = volumes.slice(-lookback - 1, -1).reduce((a, b) => a + b, 0) / lookback;
  
  if (avgVolume === 0) return 1;
  
  return currentVolume / avgVolume;
}

/**
 * 计算所有指标
 */
export function calculateAllIndicators(candles: OHLCV[]): Indicators | null {
  if (candles.length < 200) return null;
  
  const highs = candles.map(c => c.high);
  const lows = candles.map(c => c.low);
  const closes = candles.map(c => c.close);
  const volumes = candles.map(c => c.volume);
  
  const rsi = calculateRSI(closes);
  const { adx, plusDI, minusDI } = calculateADX(highs, lows, closes);
  const macd = calculateMACD(closes);
  const ema20 = ema(closes, 20);
  const ema50 = ema(closes, 50);
  const ema200 = ema(closes, 200);
  const mfi = calculateMFI(highs, lows, closes, volumes);
  const obv = calculateOBV(closes, volumes);
  const atr = calculateATR(highs, lows, closes);
  const vwap = calculateVWAP(highs, lows, closes, volumes);
  const volumeRatio = calculateVolumeRatio(volumes);
  
  return {
    rsi,
    adx,
    plusDI,
    minusDI,
    macd,
    ema20,
    ema50,
    ema200,
    mfi,
    obv,
    atr,
    volumeRatio,
    vwap
  };
}
