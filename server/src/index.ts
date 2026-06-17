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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 9091;

// Custom static file handler with SPA fallback
const staticPath = path.join(__dirname);

console.log('[Static] Serving from:', staticPath);
console.log('[Static] __dirname:', __dirname);
console.log('[Static] index.html exists:', fs.existsSync(path.join(staticPath, 'index.html')));

// Custom static middleware with SPA fallback
app.use((req, res, next) => {
  // Skip API routes
  if (req.path.startsWith('/api')) {
    return next();
  }
  
  // Try to serve static file
  const filePath = path.join(staticPath, req.path);
  
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    return res.sendFile(filePath, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  }
  
  // Fallback to index.html for SPA
  res.sendFile(path.join(staticPath, 'index.html'), {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  });
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

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}/`);
});
