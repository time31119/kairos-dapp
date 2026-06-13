import { Router } from 'express';

const router = Router();

// 支持的链配置
const SUPPORTED_CHAINS = {
  ethereum: {
    chainId: '1',
    chainName: 'Ethereum',
    symbol: 'ETH',
    rpcUrl: 'https://eth.llamarpc.com',
    blockExplorerUrl: 'https://etherscan.io',
    logo: '🔷',
    color: '#627EEA',
    decimals: 18,
    avgGasPrice: '25',
    avgBlockTime: '12s',
  },
  bsc: {
    chainId: '56',
    chainName: 'BNB Chain',
    symbol: 'BNB',
    rpcUrl: 'https://bsc-dataseed.binance.org',
    blockExplorerUrl: 'https://bscscan.com',
    logo: '🟡',
    color: '#F3BA2F',
    decimals: 18,
    avgGasPrice: '3',
    avgBlockTime: '3s',
  },
  polygon: {
    chainId: '137',
    chainName: 'Polygon',
    symbol: 'MATIC',
    rpcUrl: 'https://polygon-rpc.com',
    blockExplorerUrl: 'https://polygonscan.com',
    logo: '🟣',
    color: '#8247E5',
    decimals: 18,
    avgGasPrice: '50',
    avgBlockTime: '2s',
  },
  arbitrum: {
    chainId: '42161',
    chainName: 'Arbitrum One',
    symbol: 'ETH',
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    blockExplorerUrl: 'https://arbiscan.io',
    logo: '🔵',
    color: '#28A0F0',
    decimals: 18,
    avgGasPrice: '0.1',
    avgBlockTime: '0.25s',
  },
  optimism: {
    chainId: '10',
    chainName: 'Optimism',
    symbol: 'ETH',
    rpcUrl: 'https://mainnet.optimism.io',
    blockExplorerUrl: 'https://optimistic.etherscan.io',
    logo: '🔴',
    color: '#FF0420',
    decimals: 18,
    avgGasPrice: '0.001',
    avgBlockTime: '2s',
  },
  sepolia: {
    chainId: '11155111',
    chainName: 'Sepolia',
    symbol: 'ETH',
    rpcUrl: 'https://rpc.sepolia.org',
    blockExplorerUrl: 'https://sepolia.etherscan.io',
    logo: '🔶',
    color: '#CFB5F0',
    decimals: 18,
    avgGasPrice: '20',
    avgBlockTime: '15s',
  },
  bscTestnet: {
    chainId: '97',
    chainName: 'BSC Testnet',
    symbol: 'BNB',
    rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545',
    blockExplorerUrl: 'https://testnet.bscscan.com',
    logo: '🟨',
    color: '#F3BA2F',
    decimals: 18,
    avgGasPrice: '3',
    avgBlockTime: '3s',
  },
};

// 链状态缓存
const chainStatusCache: Map<string, { status: any; timestamp: number }> = new Map();
const CACHE_TTL = 30000; // 30秒缓存

// RPC 响应类型
interface RpcResponse {
  jsonrpc: string;
  id: number;
  result?: string;
  error?: {
    code: number;
    message: string;
  };
}

// 获取链状态
async function getChainStatus(chainKey: string): Promise<any> {
  const chain = SUPPORTED_CHAINS[chainKey as keyof typeof SUPPORTED_CHAINS];
  if (!chain) return null;

  try {
    const rpcPayload = {
      jsonrpc: '2.0',
      method: 'eth_blockNumber',
      params: [],
      id: 1,
    };

    const gasPayload = {
      jsonrpc: '2.0',
      method: 'eth_gasPrice',
      params: [],
      id: 1,
    };

    const start = Date.now();

    const [blockResponse, gasResponse] = await Promise.all([
      fetch(chain.rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rpcPayload),
      }),
      fetch(chain.rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gasPayload),
      }),
    ]);

    const blockData: RpcResponse = (await blockResponse.json()) as RpcResponse;
    const gasData: RpcResponse = (await gasResponse.json()) as RpcResponse;

    return {
      chain: chainKey,
      chainName: chain.chainName,
      blockNumber: blockData.result ? parseInt(blockData.result, 16) : 0,
      gasPrice: gasData.result ? (BigInt(gasData.result) / BigInt(1e9)).toString() : '0',
      isOnline: true,
      latency: Date.now() - start,
    };
  } catch (error) {
    console.error(`Failed to get status for ${chainKey}:`, error);
    return {
      chain: chainKey,
      chainName: chain.chainName,
      blockNumber: 0,
      gasPrice: '0',
      isOnline: false,
      latency: 0,
    };
  }
}

// 获取所有链列表
router.get('/chains', (req, res) => {
  const chains = Object.entries(SUPPORTED_CHAINS).map(([key, info]) => ({
    key,
    ...info,
  }));

  res.json({
    code: 0,
    data: chains,
  });
});

// 获取所有链状态
router.get('/chains/status', async (req, res) => {
  try {
    const statuses: any[] = [];
    const promises = Object.keys(SUPPORTED_CHAINS).map(async (key) => {
      // 检查缓存
      const cached = chainStatusCache.get(key);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.status;
      }

      const status = await getChainStatus(key);
      chainStatusCache.set(key, { status, timestamp: Date.now() });
      return status;
    });

    const results = await Promise.all(promises);
    results.forEach(status => {
      if (status) statuses.push(status);
    });

    res.json({
      code: 0,
      data: {
        chains: statuses,
        onlineCount: statuses.filter((s: any) => s.isOnline).length,
        totalCount: statuses.length,
        timestamp: Date.now(),
      },
    });
  } catch (error) {
    console.error('Failed to get chain statuses:', error);
    res.status(500).json({
      code: 500,
      message: '获取链状态失败',
    });
  }
});

// 获取单个链状态
router.get('/chains/:chain/status', async (req, res) => {
  const { chain } = req.params;

  if (!SUPPORTED_CHAINS[chain as keyof typeof SUPPORTED_CHAINS]) {
    return res.status(400).json({
      code: 400,
      message: '不支持的链',
    });
  }

  try {
    // 检查缓存
    const cached = chainStatusCache.get(chain);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return res.json({
        code: 0,
        data: cached.status,
      });
    }

    const status = await getChainStatus(chain);
    chainStatusCache.set(chain, { status, timestamp: Date.now() });

    res.json({
      code: 0,
      data: status,
    });
  } catch (error) {
    console.error('Failed to get chain status:', error);
    res.status(500).json({
      code: 500,
      message: '获取链状态失败',
    });
  }
});

// 获取代币价格（模拟）
router.get('/price/:chain', async (req, res) => {
  const { chain } = req.params;

  const chainInfo = SUPPORTED_CHAINS[chain as keyof typeof SUPPORTED_CHAINS];
  if (!chainInfo) {
    return res.status(400).json({
      code: 400,
      message: '不支持的链',
    });
  }

  // 模拟价格数据
  const prices: Record<string, any> = {
    ethereum: { usd: 3450.00, change24h: 2.5 },
    bsc: { usd: 605.00, change24h: -1.2 },
    polygon: { usd: 0.85, change24h: 3.8 },
    arbitrum: { usd: 3.45, change24h: 1.5 },
    optimism: { usd: 3.45, change24h: 1.2 },
    sepolia: { usd: 3450.00, change24h: 0 },
    bscTestnet: { usd: 605.00, change24h: 0 },
  };

  res.json({
    code: 0,
    data: {
      symbol: chainInfo.symbol,
      ...prices[chain],
    },
  });
});

export default router;
