/**
 * 智能合约查询接口
 * 支持批量查询链上合约数据
 */

import express from 'express';
import type { Request, Response } from 'express';
import { ethers } from 'ethers';

const router = express.Router();

// 链配置
const CHAIN_CONFIG: Record<string, { rpcUrl: string; name: string }> = {
  ethereum: {
    rpcUrl: 'https://eth.llamarpc.com',
    name: 'Ethereum',
  },
  sepolia: {
    rpcUrl: 'https://rpc.sepolia.org',
    name: 'Sepolia',
  },
  bsc: {
    rpcUrl: 'https://bsc-dataseed.binance.org',
    name: 'BNB Chain',
  },
  polygon: {
    rpcUrl: 'https://polygon-rpc.com',
    name: 'Polygon',
  },
  arbitrum: {
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    name: 'Arbitrum',
  },
  optimism: {
    rpcUrl: 'https://mainnet.optimism.io',
    name: 'Optimism',
  },
  bscTestnet: {
    rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545',
    name: 'BSC Testnet',
  },
};

// ERC20 ABI
const ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address owner) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
];

// DEX Pair ABI
const PAIR_ABI = [
  'function token0() view returns (address)',
  'function token1() view returns (address)',
  'function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)',
];

// DEX Router ABI
const ROUTER_ABI = [
  'function getAmountsOut(uint amountIn, address[] memory path) view returns (uint[] memory amounts)',
  'function getAmountsIn(uint amountOut, address[] memory path) view returns (uint[] memory amounts)',
];

// 常用合约地址
const CONTRACT_ADDRESSES: Record<string, Record<string, string>> = {
  ethereum: {
    WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    UNI: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
    WBTC: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    UNISWAP_V2_ROUTER: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
  },
  bsc: {
    WBNB: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    BUSD: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
    USDT: '0x55d398326f99059fF775485246999027B3197955',
    CAKE: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82',
    PANCAKE_ROUTER: '0x10ED43C718714eb63d5aA57B78B54704E256024E',
  },
  polygon: {
    WMATIC: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
    USDC: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    USDT: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    WETH: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
    QUICKSWAP_ROUTER: '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff',
  },
  arbitrum: {
    WETH: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
    USDC: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
    USDT: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
  },
  optimism: {
    WETH: '0x4200000000000000000000000000000000000006',
    USDC: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
    USDT: '0x94b008aA00579c1307B0EF2c499aD98a8ce58a58',
  },
  sepolia: {
    WETH: '0xfFf9976782d46CC05630D1f6eB18b87Cb7517D4E',
    USDC: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
  },
  bscTestnet: {
    WBNB: '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd',
    BUSD: '0xE6E340D4e86f0f3c3b3B4F5D6a7B8C9D0E1F2A3B',
    PANCAKE_ROUTER: '0xD99D1c33F9fC3444f8101754aBC46c52416550D1',
  },
};

// 获取 Provider
function getProvider(chain: string): ethers.JsonRpcProvider | null {
  const config = CHAIN_CONFIG[chain];
  if (!config) return null;
  return new ethers.JsonRpcProvider(config.rpcUrl);
}

// 验证地址格式
function isValidAddress(address: string): boolean {
  return ethers.isAddress(address);
}

// 格式化代币金额
function formatTokenAmount(amount: bigint, decimals: number): string {
  return Number(ethers.formatUnits(amount, decimals)).toFixed(6);
}

// ==================== 路由定义 ====================

/**
 * GET /api/v1/web3/contracts/chain
 * 获取指定链的信息
 */
router.get('/chain/:chain', async (req: Request, res: Response) => {
  try {
    const chain = req.params.chain as string;
    const config = CHAIN_CONFIG[chain];

    if (!config) {
      return res.status(400).json({ error: 'Unsupported chain' });
    }

    const provider = getProvider(chain);
    if (!provider) {
      return res.status(500).json({ error: 'Failed to connect to chain' });
    }

    const blockNumber = await provider.getBlockNumber();
    const gasPrice = await provider.getFeeData();

    res.json({
      chain,
      name: config.name,
      blockNumber,
      gasPrice: gasPrice.gasPrice ? gasPrice.gasPrice.toString() : null,
      timestamp: Date.now(),
    });
  } catch (error: any) {
    console.error('Chain info error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/v1/web3/contracts/addresses/:chain
 * 获取指定链的常用合约地址
 */
router.get('/addresses/:chain', (req: Request, res: Response) => {
  const chain = req.params.chain as string;
  const addresses = CONTRACT_ADDRESSES[chain];

  if (!addresses) {
    return res.status(400).json({ error: 'Unsupported chain' });
  }

  res.json({
    chain,
    addresses,
  });
});

/**
 * POST /api/v1/web3/contracts/token
 * 查询代币信息
 * Body: { address: string, chain: string }
 */
router.post('/token', async (req: Request, res: Response) => {
  try {
    const { address, chain = 'ethereum' } = req.body;

    if (!address) {
      return res.status(400).json({ error: 'Address is required' });
    }

    if (!isValidAddress(address)) {
      return res.status(400).json({ error: 'Invalid address format' });
    }

    const provider = getProvider(chain);
    if (!provider) {
      return res.status(400).json({ error: 'Unsupported chain' });
    }

    const contract = new ethers.Contract(address, ERC20_ABI, provider);

    try {
      const [name, symbol, decimals, totalSupply] = await Promise.all([
        contract.name(),
        contract.symbol(),
        contract.decimals(),
        contract.totalSupply(),
      ]);

      res.json({
        address,
        chain,
        name,
        symbol,
        decimals,
        totalSupply: formatTokenAmount(totalSupply, decimals),
      });
    } catch (contractError: any) {
      res.status(400).json({
        error: 'Not a valid ERC20 token',
        details: contractError.message,
      });
    }
  } catch (error: any) {
    console.error('Token query error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/v1/web3/contracts/balance
 * 查询地址余额
 * Body: { address: string, chain: string }
 */
router.post('/balance', async (req: Request, res: Response) => {
  try {
    const { address, chain = 'ethereum' } = req.body;

    if (!address) {
      return res.status(400).json({ error: 'Address is required' });
    }

    if (!isValidAddress(address)) {
      return res.status(400).json({ error: 'Invalid address format' });
    }

    const provider = getProvider(chain);
    if (!provider) {
      return res.status(400).json({ error: 'Unsupported chain' });
    }

    const balance = await provider.getBalance(address);
    const decimals = 18;

    res.json({
      address,
      chain,
      balance: formatTokenAmount(balance, decimals),
      balanceWei: balance.toString(),
    });
  } catch (error: any) {
    console.error('Balance query error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/v1/web3/contracts/token-balance
 * 查询代币余额
 * Body: { tokenAddress: string, walletAddress: string, chain: string }
 */
router.post('/token-balance', async (req: Request, res: Response) => {
  try {
    const { tokenAddress, walletAddress, chain = 'ethereum' } = req.body;

    if (!tokenAddress || !walletAddress) {
      return res.status(400).json({ error: 'Token address and wallet address are required' });
    }

    if (!isValidAddress(tokenAddress) || !isValidAddress(walletAddress)) {
      return res.status(400).json({ error: 'Invalid address format' });
    }

    const provider = getProvider(chain);
    if (!provider) {
      return res.status(400).json({ error: 'Unsupported chain' });
    }

    const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);

    try {
      const [decimals, balance] = await Promise.all([
        contract.decimals(),
        contract.balanceOf(walletAddress),
      ]);

      res.json({
        tokenAddress,
        walletAddress,
        chain,
        balance: formatTokenAmount(balance, decimals),
        balanceRaw: balance.toString(),
      });
    } catch (contractError: any) {
      res.status(400).json({
        error: 'Failed to query token balance',
        details: contractError.message,
      });
    }
  } catch (error: any) {
    console.error('Token balance query error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/v1/web3/contracts/pair
 * 查询 DEX Pair 信息
 * Body: { pairAddress: string, chain: string }
 */
router.post('/pair', async (req: Request, res: Response) => {
  try {
    const { pairAddress, chain = 'ethereum' } = req.body;

    if (!pairAddress) {
      return res.status(400).json({ error: 'Pair address is required' });
    }

    if (!isValidAddress(pairAddress)) {
      return res.status(400).json({ error: 'Invalid address format' });
    }

    const provider = getProvider(chain);
    if (!provider) {
      return res.status(400).json({ error: 'Unsupported chain' });
    }

    const pairContract = new ethers.Contract(pairAddress, PAIR_ABI, provider);

    try {
      const [token0, token1, reserves] = await Promise.all([
        pairContract.token0(),
        pairContract.token1(),
        pairContract.getReserves(),
      ]);

      const [reserve0, reserve1] = reserves;

      // 获取 token0 信息
      const token0Contract = new ethers.Contract(token0, ERC20_ABI, provider);
      let token0Symbol = '';
      let token0Decimals = 18;
      try {
        token0Symbol = await token0Contract.symbol();
        token0Decimals = await token0Contract.decimals();
      } catch {
        token0Symbol = 'Unknown';
      }

      // 获取 token1 信息
      const token1Contract = new ethers.Contract(token1, ERC20_ABI, provider);
      let token1Symbol = '';
      let token1Decimals = 18;
      try {
        token1Symbol = await token1Contract.symbol();
        token1Decimals = await token1Contract.decimals();
      } catch {
        token1Symbol = 'Unknown';
      }

      const price = Number(ethers.formatUnits(reserve1, token1Decimals)) /
                    Number(ethers.formatUnits(reserve0, token0Decimals));

      res.json({
        pairAddress,
        chain,
        token0: {
          address: token0,
          symbol: token0Symbol,
          reserve: formatTokenAmount(reserve0, token0Decimals),
        },
        token1: {
          address: token1,
          symbol: token1Symbol,
          reserve: formatTokenAmount(reserve1, token1Decimals),
        },
        price: price.toFixed(6),
        priceInverse: (1 / price).toFixed(6),
        totalLiquidity: (
          Number(formatTokenAmount(reserve0, token0Decimals)) +
          Number(formatTokenAmount(reserve1, token1Decimals))
        ).toFixed(2),
      });
    } catch (contractError: any) {
      res.status(400).json({
        error: 'Failed to query pair info',
        details: contractError.message,
      });
    }
  } catch (error: any) {
    console.error('Pair query error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/v1/web3/contracts/swap-quote
 * 获取交易报价
 * Body: { chain: string, tokenIn: string, tokenOut: string, amountIn: string }
 */
router.post('/swap-quote', async (req: Request, res: Response) => {
  try {
    const { chain = 'ethereum', tokenIn, tokenOut, amountIn } = req.body;

    if (!tokenIn || !tokenOut || !amountIn) {
      return res.status(400).json({ error: 'Token addresses and amount are required' });
    }

    const addresses = CONTRACT_ADDRESSES[chain];
    if (!addresses) {
      return res.status(400).json({ error: 'Unsupported chain' });
    }

    const routerAddress = addresses.UNISWAP_ROUTER || addresses.PANCAKE_ROUTER || addresses.QUICKSWAP_ROUTER;
    if (!routerAddress) {
      return res.status(400).json({ error: 'No DEX router available for this chain' });
    }

    const provider = getProvider(chain);
    if (!provider) {
      return res.status(400).json({ error: 'Failed to connect to chain' });
    }

    const routerContract = new ethers.Contract(routerAddress, ROUTER_ABI, provider);
    const path = [tokenIn, tokenOut];
    const amountInWei = ethers.parseUnits(amountIn, 18);

    const amounts = await routerContract.getAmountsOut(amountInWei, path);

    const tokenInContract = new ethers.Contract(tokenIn, ERC20_ABI, provider);
    const tokenOutContract = new ethers.Contract(tokenOut, ERC20_ABI, provider);

    const [tokenInDecimals, tokenOutDecimals] = await Promise.all([
      tokenInContract.decimals(),
      tokenOutContract.decimals(),
    ]);

    res.json({
      chain,
      router: routerAddress,
      path: {
        tokenIn: {
          address: tokenIn,
          amountIn: amountIn,
        },
        tokenOut: {
          address: tokenOut,
          amountOut: ethers.formatUnits(amounts[1], tokenOutDecimals),
        },
      },
      priceImpact: '0.5', // 估算值
      estimatedGas: '150000',
      route: path.map((a: string) => a.slice(0, 6) + '...' + a.slice(-4)),
    });
  } catch (error: any) {
    console.error('Swap quote error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/v1/web3/contracts/batch
 * 批量查询
 * Body: { queries: Array<{ type: string, ...params }> }
 */
router.post('/batch', async (req: Request, res: Response) => {
  try {
    const { queries } = req.body;

    if (!queries || !Array.isArray(queries)) {
      return res.status(400).json({ error: 'Queries array is required' });
    }

    const results = await Promise.allSettled(
      queries.map(async (query: any) => {
        const { type, ...params } = query;

        switch (type) {
          case 'token':
            return queryToken(params);
          case 'balance':
            return queryBalance(params);
          case 'token-balance':
            return queryTokenBalance(params);
          case 'pair':
            return queryPair(params);
          default:
            throw new Error(`Unknown query type: ${type}`);
        }
      })
    );

    const response = results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return { success: true, data: result.value, index };
      } else {
        return { success: false, error: result.reason?.message, index };
      }
    });

    res.json({
      results: response,
      total: queries.length,
      successful: response.filter((r: any) => r.success).length,
    });
  } catch (error: any) {
    console.error('Batch query error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 辅助函数
async function queryToken(params: any) {
  const { address, chain = 'ethereum' } = params;
  const provider = getProvider(chain);
  if (!provider) throw new Error('Unsupported chain');

  const contract = new ethers.Contract(address, ERC20_ABI, provider);
  const [name, symbol, decimals, totalSupply] = await Promise.all([
    contract.name(),
    contract.symbol(),
    contract.decimals(),
    contract.totalSupply(),
  ]);

  return { address, chain, name, symbol, decimals, totalSupply: formatTokenAmount(totalSupply, decimals) };
}

async function queryBalance(params: any) {
  const { address, chain = 'ethereum' } = params;
  const provider = getProvider(chain);
  if (!provider) throw new Error('Unsupported chain');

  const balance = await provider.getBalance(address);
  return { address, chain, balance: formatTokenAmount(balance, 18), balanceWei: balance.toString() };
}

async function queryTokenBalance(params: any) {
  const { tokenAddress, walletAddress, chain = 'ethereum' } = params;
  const provider = getProvider(chain);
  if (!provider) throw new Error('Unsupported chain');

  const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
  const [decimals, balance] = await Promise.all([
    contract.decimals(),
    contract.balanceOf(walletAddress),
  ]);

  return { tokenAddress, walletAddress, chain, balance: formatTokenAmount(balance, decimals) };
}

async function queryPair(params: any) {
  const { pairAddress, chain = 'ethereum' } = params;
  const provider = getProvider(chain);
  if (!provider) throw new Error('Unsupported chain');

  const pairContract = new ethers.Contract(pairAddress, PAIR_ABI, provider);
  const [token0, token1, reserves] = await Promise.all([
    pairContract.token0(),
    pairContract.token1(),
    pairContract.getReserves(),
  ]);

  return {
    pairAddress,
    chain,
    token0,
    token1,
    reserve0: formatTokenAmount(reserves[0], 18),
    reserve1: formatTokenAmount(reserves[1], 18),
  };
}

export default router;
