/**
 * KAIROS API 服务
 * 统一的 API 调用接口
 */

const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9091';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// 通用请求方法
async function request<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// 市场概览
export async function getMarketOverview() {
  return request<{
    totalMarketCap: string;
    totalVolume24h: string;
    btcDominance: string;
    ethDominance: string;
    fearGreedIndex: number;
    fearGreedValue: string;
    fearGreedStatus: string;
  }>('/market/overview');
}

// 热搜榜单
export async function getHotSearch() {
  return request<Array<{
    rank: number;
    keyword: string;
    symbol?: string;
    change: string;
  }>>('/market/hot-search');
}

// 行情快讯
export async function getNews(category?: string) {
  const query = category ? `?category=${category}` : '';
  return request<Array<{
    id: string;
    title: string;
    summary: string;
    source: string;
    time: string;
    category: string;
    isHot: boolean;
  }>>(`/news${query}`);
}

// 涨跌榜
export async function getGainersLosers(type: 'gainers' | 'losers', limit: number = 5) {
  return request<Array<{
    id: string;
    symbol: string;
    name: string;
    price: string;
    change24h: string;
    changePercent: string;
  }>>(`/market/${type}?limit=${limit}`);
}

// 代币详情
export async function getTokenDetail(symbol: string) {
  return request<{
    id: string;
    symbol: string;
    name: string;
    price: string;
    change24h: string;
    change7d: string;
    marketCap: string;
    volume24h: string;
    high24h: string;
    low24h: string;
    circulatingSupply: string;
    totalSupply: string;
    maxSupply: string;
  }>(`/token/${symbol}`);
}

// 搜索
export async function search(query: string) {
  return request<{
    tokens: Array<{
      id: string;
      symbol: string;
      name: string;
      price: string;
      change24h: string;
    }>;
    traders: Array<{
      id: string;
      name: string;
      avatar: string;
      yield: string;
      followers: number;
    }>;
  }>(`/search?q=${encodeURIComponent(query)}`);
}

// 用户登录
export async function login(phone: string, code: string) {
  return request<{
    token: string;
    user: {
      id: string;
      name: string;
      phone: string;
      vipLevel: string;
      vipExpireDate: string;
    };
  }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ phone, code }),
  });
}

// 发送验证码
export async function sendCode(phone: string) {
  return request<{ success: boolean }>('/auth/send-code', {
    method: 'POST',
    body: JSON.stringify({ phone }),
  });
}

// 获取用户信息
export async function getUserInfo() {
  return request<{
    id: string;
    name: string;
    phone: string;
    avatar: string;
    uid: string;
    vipLevel: string;
    vipExpireDate: string;
    following: number;
    positions: number;
    winRate: string;
  }>('/user/info');
}

// 获取通知列表
export async function getNotifications(type?: string) {
  const query = type ? `?type=${type}` : '';
  return request<Array<{
    id: string;
    type: string;
    title: string;
    content: string;
    time: string;
    isRead: boolean;
    badge?: string;
  }>>(`/notifications${query}`);
}

// 标记通知已读
export async function markNotificationRead(id: string) {
  return request<{ success: boolean }>(`/notifications/${id}/read`, {
    method: 'POST',
  });
}

// 标记所有通知已读
export async function markAllNotificationsRead() {
  return request<{ success: boolean }>('/notifications/read-all', {
    method: 'POST',
  });
}

// 获取自选列表
export async function getWatchlist() {
  return request<Array<{
    id: string;
    symbol: string;
    name: string;
    price: string;
    change24h: string;
    changePercent: string;
    marketCap: string;
    volume24h: string;
  }>>('/user/watchlist');
}

// 添加自选
export async function addToWatchlist(symbol: string) {
  return request<{ success: boolean }>('/user/watchlist', {
    method: 'POST',
    body: JSON.stringify({ symbol }),
  });
}

// 移除自选
export async function removeFromWatchlist(symbol: string) {
  return request<{ success: boolean }>(`/user/watchlist/${symbol}`, {
    method: 'DELETE',
  });
}

// 获取实盘持仓
export async function getPositions() {
  return request<Array<{
    id: string;
    symbol: string;
    side: 'long' | 'short';
    leverage: number;
    entryPrice: string;
    currentPrice: string;
    liquidationPrice: string;
    margin: string;
    pnl: string;
    pnlPercent: string;
    tpPrice: string;
    slPrice: string;
  }>>('/trading/positions');
}

// 获取实盘历史
export async function getTradingHistory() {
  return request<Array<{
    id: string;
    symbol: string;
    side: 'long' | 'short';
    entryPrice: string;
    exitPrice: string;
    leverage: number;
    pnl: string;
    pnlPercent: string;
    fee: string;
    closeReason: string;
    closeTime: string;
  }>>('/trading/history');
}

// 获取交易员列表
export async function getTraders() {
  return request<Array<{
    id: string;
    name: string;
    avatar: string;
    tags: string[];
    yield: string;
    winRate: string;
    followers: number;
  }>('/copytrading/traders');
}

// 跟单设置
export async function setCopySettings(traderId: string, settings: {
  ratio: number;
  stopLoss: number;
  takeProfit: number;
  maxAmount: number;
  autoCopy: boolean;
}) {
  return request<{ success: boolean }>(`/copytrading/settings/${traderId}`, {
    method: 'POST',
    body: JSON.stringify(settings),
  });
}

// 获取跟单列表
export async function getCopyTrades() {
  return request<Array<{
    id: string;
    traderId: string;
    traderName: string;
    status: string;
    ratio: number;
    pnl: string;
    startDate: string;
  }>>('/copytrading/positions');
}

export default {
  getMarketOverview,
  getHotSearch,
  getNews,
  getGainersLosers,
  getTokenDetail,
  search,
  login,
  sendCode,
  getUserInfo,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  getPositions,
  getTradingHistory,
  getTraders,
  setCopySettings,
  getCopyTrades,
};
