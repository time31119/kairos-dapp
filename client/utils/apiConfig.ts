// API 配置模块 - 统一管理 API 基础地址
// 兼容 Web 和移动端环境

export const getApiBase = (): string => {
  // 服务端（SSR）或无法访问 window 时使用环境变量
  if (typeof window === 'undefined') {
    return process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9091';
  }
  
  // Web 端使用当前域名（通过 nginx 代理访问 API）
  return window.location.origin;
};

// 创建 API URL
export const apiUrl = (path: string): string => {
  const base = getApiBase();
  // 确保路径以 / 开头
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${cleanPath}`;
};
