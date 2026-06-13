import express from "express";
import cors from "cors";
import screenerRouter from "./routes/screener";
import apiRouter from "./routes/api";
import authRouter from "./routes/auth";
import chainsRouter from "./routes/chains";

const app = express();
const port = process.env.PORT || 9091;

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
app.use('/api/v1', apiRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/web3', chainsRouter);

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}/`);
});
