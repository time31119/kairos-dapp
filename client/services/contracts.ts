/**
 * 智能合约交互服务
 * 支持读取和写入合约数据
 */

import { ethers, Contract, JsonRpcSigner, BrowserProvider, formatUnits, parseUnits } from 'ethers';
import { type ChainType } from './metamask';

// RPC URL 映射
const RPC_URLS: Record<ChainType, string> = {
  ethereum: 'https://eth.llamarpc.com',
  sepolia: 'https://rpc.sepolia.org',
  bsc: 'https://bsc-dataseed.binance.org',
  polygon: 'https://polygon-rpc.com',
  arbitrum: 'https://arb1.arbitrum.io/rpc',
  optimism: 'https://mainnet.optimism.io',
  bscTestnet: 'https://data-seed-prebsc-1-s1.binance.org:8545',
};

// ABI 类型定义
export interface ABIFragment {
  name: string;
  type: 'function' | 'event';
  inputs: Array<{ name: string; type: string; indexed?: boolean }>;
  outputs?: Array<{ name: string; type: string }>;
  stateMutability?: 'pure' | 'view' | 'nonpayable' | 'payable';
}

// 常用合约 ABI 库
export const CONTRACT_ABIS = {
  // ERC20 标准代币 ABI
  ERC20: [
    'function name() view returns (string)',
    'function symbol() view returns (string)',
    'function decimals() view returns (uint8)',
    'function totalSupply() view returns (uint256)',
    'function balanceOf(address owner) view returns (uint256)',
    'function transfer(address to, uint256 amount) returns (bool)',
    'function allowance(address owner, address spender) view returns (uint256)',
    'function approve(address spender, uint256 amount) returns (bool)',
    'function transferFrom(address from, address to, uint256 amount) returns (bool)',
    'event Transfer(address indexed from, address indexed to, uint256 value)',
    'event Approval(address indexed owner, address indexed spender, uint256 value)',
  ],

  // Uniswap V2 Pair
  UNISWAP_V2_PAIR: [
    'function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)',
    'function token0() view returns (address)',
    'function token1() view returns (address)',
    'function price0CumulativeLast() view returns (uint256)',
    'function price1CumulativeLast() view returns (uint256)',
    'function kLast() view returns (uint256)',
  ],

  // Uniswap V2 Router
  UNISWAP_V2_ROUTER: [
    'function getAmountOut(uint amountIn, uint reserveIn, uint reserveOut) view returns (uint amountOut)',
    'function getAmountIn(uint amountOut, uint reserveIn, uint reserveOut) view returns (uint amountIn)',
    'function getAmountsOut(uint amountIn, address[] memory path) view returns (uint[] memory amounts)',
    'function getAmountsIn(uint amountOut, address[] memory path) view returns (uint[] memory amounts)',
    'function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) returns (uint[] memory amounts)',
    'function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) payable returns (uint[] memory amounts)',
    'function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) returns (uint[] memory amounts)',
  ],

  // DEX 池子信息
  LP_TOKEN: [
    'function token0() view returns (address)',
    'function token1() view returns (address)',
    'function getReserves() view returns (uint112, uint112, uint32)',
    'function totalSupply() view returns (uint256)',
    'function balanceOf(address) view returns (uint256)',
  ],
};

// 常用合约地址配置
export const CONTRACT_ADDRESSES: Record<ChainType, {
  WETH: string;
  USDC: string;
  USDT: string;
  WBNB: string;
  UNISWAP_ROUTER: string;
  PANCAKE_ROUTER: string;
  QUICKSWAP_ROUTER: string;
}> = {
  ethereum: {
    WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    WBNB: '0x418D75f65a02C8C43eFT276C73C6C7b4e8418B22',
    UNISWAP_ROUTER: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
    PANCAKE_ROUTER: '',
    QUICKSWAP_ROUTER: '',
  },
  sepolia: {
    WETH: '0xfFf9976782d46CC05630D1f6eB18b87Cb7517D4E',
    USDC: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
    USDT: '0x7169D38820dfd117C3FA1f2a6B6055C40732a8A9',
    WBNB: '0x091608C163AC2dF6B2dB7a3C6D7Fb4dA93b10C9F',
    UNISWAP_ROUTER: '0xC532a74256D3Db42D0a125B220e6F5bAaA8dE8C8',
    PANCAKE_ROUTER: '',
    QUICKSWAP_ROUTER: '',
  },
  bsc: {
    WETH: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8',
    USDC: '0x8AC76a51cc950d9822D68d83eE1A19E64c5C5aBF',
    USDT: '0x55d398326f99059fF775485246999027B3197955',
    WBNB: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    UNISWAP_ROUTER: '',
    PANCAKE_ROUTER: '0x10ED43C718714eb63d5aA57B78B54704E256024E',
    QUICKSWAP_ROUTER: '',
  },
  polygon: {
    WETH: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
    USDC: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    USDT: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    WBNB: '0x5D3a536E4D6Db2ADeD3b4A3E0BfE8cA93f5A27B7',
    UNISWAP_ROUTER: '',
    PANCAKE_ROUTER: '',
    QUICKSWAP_ROUTER: '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff',
  },
  arbitrum: {
    WETH: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
    USDC: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
    USDT: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
    WBNB: '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f',
    UNISWAP_ROUTER: '0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24',
    PANCAKE_ROUTER: '',
    QUICKSWAP_ROUTER: '',
  },
  optimism: {
    WETH: '0x4200000000000000000000000000000000000006',
    USDC: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
    USDT: '0x94b008aA00579c1307B0EF2c499aD98a8ce58a58',
    WBNB: '0x4200000000000000000000000000000000000006',
    UNISWAP_ROUTER: '',
    PANCAKE_ROUTER: '',
    QUICKSWAP_ROUTER: '',
  },
  bscTestnet: {
    WETH: '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd',
    USDC: '0x6f9B816C6E3E8bB5A6Ac9D4F8C7d7b5A8f8d2c5D',
    USDT: '0xE6E340D4e86f0f3c3b3B4F5D6a7B8C9D0E1F2A3B',
    WBNB: '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd',
    UNISWAP_ROUTER: '',
    PANCAKE_ROUTER: '0xD99D1c33F9fC3444f8101754aBC46c52416550D1',
    QUICKSWAP_ROUTER: '',
  },
};

// 合约交互结果
export interface ContractResult {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * 创建合约实例（只读）
 */
export function getContract(
  address: string,
  abi: string[],
  chain: ChainType = 'ethereum'
): Contract | null {
  try {
    const rpcUrl = RPC_URLS[chain];
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    return new Contract(address, abi, provider);
  } catch (error: any) {
    console.error('Failed to create contract:', error);
    return null;
  }
}

/**
 * 创建合约实例（带签名者，用于写入操作）
 */
export function getSignedContract(
  address: string,
  abi: string[],
  signer: JsonRpcSigner
): Contract | null {
  try {
    return new Contract(address, abi, signer);
  } catch (error: any) {
    console.error('Failed to create signed contract:', error);
    return null;
  }
}

/**
 * 读取合约数据（view 函数）
 */
export async function readContract(
  address: string,
  abi: string[],
  method: string,
  args: any[] = [],
  chain: ChainType = 'ethereum'
): Promise<ContractResult> {
  try {
    const contract = getContract(address, abi, chain);
    if (!contract) {
      return { success: false, error: 'Failed to create contract' };
    }

    // 检查方法是否存在
    if (!(method in contract)) {
      return { success: false, error: `Method ${method} not found in contract` };
    }

    const result = await (contract as any)[method](...args);
    return { success: true, data: result };
  } catch (error: any) {
    console.error('Contract read error:', error);
    return { success: false, error: error.message || 'Unknown error' };
  }
}

/**
 * 写入合约数据（交易）
 */
export async function writeContract(
  address: string,
  abi: string[],
  method: string,
  args: any[] = [],
  signer: JsonRpcSigner,
  value: string = '0'
): Promise<ContractResult> {
  try {
    const contract = getSignedContract(address, abi, signer);
    if (!contract) {
      return { success: false, error: 'Failed to create contract' };
    }

    // 检查方法是否存在
    if (!(method in contract)) {
      return { success: false, error: `Method ${method} not found in contract` };
    }

    const options = value !== '0' ? { value: parseUnits(value, 'ether') } : {};
    const tx = await (contract as any)[method](...args, options);
    const receipt = await tx.wait();

    return {
      success: true,
      data: {
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
      },
    };
  } catch (error: any) {
    console.error('Contract write error:', error);
    return { success: false, error: error.message || 'Unknown error' };
  }
}

// ============ ERC20 代币操作 ============

/**
 * 获取 ERC20 代币余额
 */
export async function getTokenBalance(
  tokenAddress: string,
  ownerAddress: string,
  chain: ChainType = 'ethereum'
): Promise<ContractResult> {
  return readContract(tokenAddress, CONTRACT_ABIS.ERC20, 'balanceOf', [ownerAddress], chain);
}

/**
 * 获取代币信息
 */
export async function getTokenInfo(
  tokenAddress: string,
  chain: ChainType = 'ethereum'
): Promise<ContractResult> {
  try {
    const contract = getContract(tokenAddress, CONTRACT_ABIS.ERC20, chain);
    if (!contract) {
      return { success: false, error: 'Failed to create contract' };
    }

    const [name, symbol, decimals, totalSupply] = await Promise.all([
      contract.name(),
      contract.symbol(),
      contract.decimals(),
      contract.totalSupply(),
    ]);

    return {
      success: true,
      data: {
        name,
        symbol,
        decimals: Number(decimals),
        totalSupply: formatUnits(totalSupply, decimals),
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * 获取用户代币授权额度
 */
export async function getTokenAllowance(
  tokenAddress: string,
  ownerAddress: string,
  spenderAddress: string,
  chain: ChainType = 'ethereum'
): Promise<ContractResult> {
  return readContract(
    tokenAddress,
    CONTRACT_ABIS.ERC20,
    'allowance',
    [ownerAddress, spenderAddress],
    chain
  );
}

/**
 * 授权代币花费
 */
export async function approveToken(
  tokenAddress: string,
  spenderAddress: string,
  amount: string,
  signer: JsonRpcSigner
): Promise<ContractResult> {
  return writeContract(
    tokenAddress,
    CONTRACT_ABIS.ERC20,
    'approve',
    [spenderAddress, parseUnits(amount, 18)],
    signer
  );
}

// ============ DEX 操作 ============

/**
 * 获取 DEX 交易对价格
 */
export async function getDexPrice(
  pairAddress: string,
  chain: ChainType = 'ethereum'
): Promise<ContractResult> {
  try {
    const contract = getContract(pairAddress, CONTRACT_ABIS.LP_TOKEN, chain);
    if (!contract) {
      return { success: false, error: 'Failed to create contract' };
    }

    const [token0, token1, reserves] = await Promise.all([
      contract.token0(),
      contract.token1(),
      contract.getReserves(),
    ]);

    const [reserve0, reserve1] = reserves;

    // 计算价格（假设 token0 是基础货币）
    const price = Number(formatUnits(reserve1, 18)) / Number(formatUnits(reserve0, 18));

    return {
      success: true,
      data: {
        token0,
        token1,
        reserve0: formatUnits(reserve0, 18),
        reserve1: formatUnits(reserve1, 18),
        price,
        priceInverse: 1 / price,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * 获取交易路径的输出金额
 */
export async function getSwapAmountOut(
  routerAddress: string,
  amountIn: string,
  path: string[],
  chain: ChainType = 'ethereum'
): Promise<ContractResult> {
  return readContract(
    routerAddress,
    CONTRACT_ABIS.UNISWAP_V2_ROUTER,
    'getAmountsOut',
    [parseUnits(amountIn, 18), path],
    chain
  );
}

/**
 * 执行代币交换
 */
export async function executeSwap(
  routerAddress: string,
  amountIn: string,
  amountOutMin: string,
  path: string[],
  deadline: number,
  signer: JsonRpcSigner
): Promise<ContractResult> {
  return writeContract(
    routerAddress,
    CONTRACT_ABIS.UNISWAP_V2_ROUTER,
    'swapExactTokensForTokens',
    [parseUnits(amountIn, 18), parseUnits(amountOutMin, 18), path, await signer.getAddress(), deadline],
    signer
  );
}

// ============ 批量查询 ============

/**
 * 批量读取多个合约数据
 */
export async function batchReadContracts(
  requests: Array<{
    address: string;
    abi: string[];
    method: string;
    args?: any[];
    chain?: ChainType;
  }>
): Promise<ContractResult[]> {
  const results: ContractResult[] = [];

  for (const req of requests) {
    const result = await readContract(req.address, req.abi, req.method, req.args || [], req.chain);
    results.push(result);
  }

  return results;
}

/**
 * 获取钱包在多条链上的代币余额
 */
export async function getCrossChainBalances(
  address: string,
  chain: ChainType = 'ethereum'
): Promise<ContractResult> {
  try {
    const addresses = CONTRACT_ADDRESSES[chain];
    const nativeBalance = await readContract(
      addresses.WETH,
      CONTRACT_ABIS.ERC20,
      'balanceOf',
      [address],
      chain
    );

    const usdcBalance = await readContract(
      addresses.USDC,
      CONTRACT_ABIS.ERC20,
      'balanceOf',
      [address],
      chain
    );

    return {
      success: true,
      data: {
        chain,
        native: nativeBalance.data || '0',
        usdc: usdcBalance.data || '0',
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ============ 工具函数 ============

/**
 * 估算交易 Gas
 */
export async function estimateGas(
  address: string,
  abi: string[],
  method: string,
  args: any[],
  signer: JsonRpcSigner
): Promise<string> {
  try {
    const contract = getSignedContract(address, abi, signer);
    if (!contract) return '21000';

    const gasEstimate = await (contract as any).estimateGas[method](...args);
    return gasEstimate.toString();
  } catch (error: any) {
    console.error('Gas estimation error:', error);
    return '21000';
  }
}

/**
 * 解析合约事件
 */
export function parseContractEvent(
  receipt: any,
  eventName: string,
  abi: string[]
): any[] {
  try {
    const iface = new ethers.Interface(abi);
    const events = receipt.logs.filter((log: any) => {
      try {
        const parsed = iface.parseLog(log);
        return parsed?.name === eventName;
      } catch {
        return false;
      }
    });

    return events.map((log: any) => {
      const parsed = iface.parseLog(log);
      return {
        name: parsed?.name,
        args: parsed?.args,
        blockNumber: log.blockNumber,
        transactionHash: log.transactionHash,
      };
    });
  } catch (error: any) {
    console.error('Event parsing error:', error);
    return [];
  }
}
