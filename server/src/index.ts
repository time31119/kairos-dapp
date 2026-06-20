import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import screenerRouter from "./routes/screener";
import copytradingRouter from "./routes/copytrading";
import apiRouter from "./routes/api";
import authRouter from "./routes/auth";
import chainsRouter from "./routes/chains";
import contractsRouter from "./routes/contracts";
import signatureRouter from "./routes/signature";
import newsRouter from "./routes/news";
import subscriptionRouter from "./routes/subscription";
import referralRouter from "./routes/referral";
import positionsRouter from "./routes/positions";
import signalRouter from "./routes/signal";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 静态文件路径：开发模式从 dist 目录（向上两级），生产模式从 dist 目录
// __dirname: /workspace/projects/server/src -> dist: /workspace/projects/server/dist
// __dirname: /workspace/projects/server/dist -> dist: /workspace/projects/server/dist
function findDistDir(dir: string): string {
  // 如果当前是 dist 目录，直接返回
  if (dir.endsWith('dist')) {
    return dir;
  }
  // 向上两级到 server 目录，然后进入 dist
  const parentDir = path.join(dir, '..');
  const distPath = path.join(parentDir, 'dist');
  if (fs.existsSync(distPath)) {
    return distPath;
  }
  return distPath; // 返回预期路径
}

const staticPath = findDistDir(__dirname);
console.log('[Static] Serving from:', staticPath);

const app = express();
const port = process.env.PORT || 9091;

// Standard express.static with index option for SPA fallback
app.use(express.static(staticPath, {
  index: 'index.html',
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
}));

// SPA fallback - serve index.html for non-file routes (except API)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(staticPath, 'index.html'));
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.get('/api/v1/health', (req, res) => {
  console.log('Health check success');
  res.status(200).json({ status: 'ok' });
});

// API routes
app.use('/api/v1/screener', screenerRouter);
app.use('/api/v1/copytrading', copytradingRouter);
app.use('/api/v1', apiRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/web3/chains', chainsRouter);
app.use('/api/v1/web3/contracts', contractsRouter);
app.use('/api/v1/web3/signature', signatureRouter);
app.use('/api/v1/news', newsRouter);
app.use('/api/v1/subscription', subscriptionRouter);
app.use('/api/v1/referral', referralRouter);
app.use('/api/v1/positions', positionsRouter);
app.use('/api/v1/signal', signalRouter);

app.listen(Number(port), '0.0.0.0', () => {
  console.log(`Server listening at http://0.0.0.0:${port}/`);
});
