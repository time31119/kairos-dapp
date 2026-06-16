import express from "express";
import cors from "cors";
import path from "path";
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

// Static files for frontend
const staticPath = path.join(__dirname, '../../client/dist');
app.use(express.static(staticPath));

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

// SPA fallback - serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(staticPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}/`);
});
