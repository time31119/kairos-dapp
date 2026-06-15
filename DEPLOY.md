# KAIROS 加密货币行情工具 - 部署指南

## 🚀 快速部署

### 方式一：Docker 部署（推荐）

```bash
# 1. 克隆项目
git clone https://github.com/time31119/kairos-dapp.git
cd kairos-dapp

# 2. 构建前端
cd client && pnpm install && pnpm build && cd ..

# 3. 启动服务
docker-compose up -d
```

服务地址：
- 前端：http://localhost:5000
- 后端 API：http://localhost:9091

### 方式二：手动部署

#### 前端部署

```bash
# 1. 构建前端
cd client
pnpm install
pnpm build

# 2. 将 dist 目录部署到 Nginx
# dist 目录包含静态文件，可以部署到任何静态托管服务

# 3. 或使用 Vercel
vercel --prod
```

#### 后端部署

```bash
# 1. 安装依赖
cd server
pnpm install

# 2. 设置环境变量
export NODE_ENV=production
export PORT=9091

# 3. 启动服务
pnpm start

# 或使用 PM2
pm2 start ecosystem.config.js
```

## 📁 目录结构

```
kairos-dapp/
├── client/                 # React Native 前端
│   ├── app/               # Expo Router 路由
│   ├── screens/            # 页面组件
│   ├── components/         # 可复用组件
│   ├── dist/              # 构建输出目录
│   └── package.json
├── server/                 # Express.js 后端
│   ├── src/
│   │   ├── routes/        # API 路由
│   │   └── index.ts       # 入口文件
│   └── package.json
├── Dockerfile.server       # 后端 Docker 配置
├── docker-compose.yml      # Docker Compose 配置
└── nginx.conf             # Nginx 配置
```

## 🔧 环境变量

### 前端 (.env)
```
EXPO_PUBLIC_BACKEND_BASE_URL=https://your-api-domain.com
```

### 后端 (.env)
```
NODE_ENV=production
PORT=9091
```

## 🌐 API 端点

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/v1/health` | GET | 健康检查 |
| `/api/v1/coins/trending` | GET | 热门币种 |
| `/api/v1/screener/scenarios/realtime` | GET | 实时行情 |
| `/api/v1/news/` | GET | 加密货币资讯 |
| `/api/v1/subscription/plans` | GET | 订阅套餐 |
| `/api/v1/referral/info` | GET | 邀请奖励信息 |

## 📱 构建移动端 App

```bash
# Android
cd client
npx expo run:android

# iOS
npx expo run:ios

# 构建 APK
eas build --platform android --local
```

## 🔒 安全建议

1. 生产环境请配置 HTTPS
2. 设置正确的 CORS 策略
3. 使用环境变量存储敏感信息
4. 定期更新依赖包

## 📞 支持

如有问题，请提交 Issue：https://github.com/time31119/kairos-dapp/issues
