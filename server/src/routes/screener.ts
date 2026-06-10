/**
 * 行情筛选器 API 路由
 */

import { Router } from 'express';
import type { Scenario } from '../services/screener';
import { screenTokens, getScenarioDescription, getScenarioTitle } from '../services/screener';

const router = Router();

/**
 * GET /api/v1/screener/:scenario
 * 获取筛选结果
 * 
 * 参数:
 * - scenario: 筛选场景 (1h_up, 4h_up, 1h_down, 4h_down)
 * - limit: 返回数量 (默认 10)
 */
router.get('/:scenario', async (req, res) => {
  try {
    const { scenario } = req.params;
    const limit = parseInt(req.query.limit as string) || 10;
    
    // 验证场景
    const validScenarios: Scenario[] = ['1h_up', '4h_up', '1h_down', '4h_down'];
    if (!validScenarios.includes(scenario as Scenario)) {
      return res.status(400).json({
        error: 'Invalid scenario',
        validScenarios,
        message: 'Scenario must be one of: 1h_up, 4h_up, 1h_down, 4h_down'
      });
    }
    
    console.log(`[Screener API] Screening scenario: ${scenario}, limit: ${limit}`);
    
    const results = await screenTokens(scenario as Scenario, limit);
    const title = getScenarioTitle(scenario as Scenario);
    const description = getScenarioDescription(scenario as Scenario);
    
    res.json({
      success: true,
      scenario,
      title,
      description,
      count: results.length,
      data: results
    });
  } catch (error) {
    console.error('[Screener API] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/v1/screener/scenarios
 * 获取所有可用场景
 */
router.get('/scenarios/list', (req, res) => {
  const scenarios = [
    {
      id: '1h_up',
      title: '1小时上涨动能',
      description: '寻找短期爆发标的',
      direction: 'up',
      timeframe: '1H',
      filters: 'RSI 50-70 | ADX>25 | 成交量>1.5x | MFI>60'
    },
    {
      id: '4h_up',
      title: '4小时上涨动能',
      description: '波段趋势延续',
      direction: 'up',
      timeframe: '4H',
      filters: 'EMA多头排列 | MACD零轴上方 | ADX>25 | +DI>-DI'
    },
    {
      id: '1h_down',
      title: '1小时下跌动能',
      description: '做空短期弱势',
      direction: 'down',
      timeframe: '1H',
      filters: '低于VWAP | RSI 30-50 | 下跌放量'
    },
    {
      id: '4h_down',
      title: '4小时下跌动能',
      description: '趋势性破位标的',
      direction: 'down',
      timeframe: '4H',
      filters: '跌破EMA50 | EMA空头 | MACD零轴下方 | ATR扩张'
    }
  ];
  
  res.json({
    success: true,
    scenarios
  });
});

export default router;
