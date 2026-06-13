/**
 * useContract - DAPP 智能合约交互 Hook
 * 
 * 这个 Hook 提供了与以太坊智能合约交互的能力
 * 支持读取链上数据和发送交易
 */
import { useState, useCallback } from 'react';
import { ethers } from 'ethers';

// 合约 ABI 示例（简化版 ERC20）
const ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function balanceOf(address) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function decimals() view returns (uint8)',
];

interface ContractCallResult {
  success: boolean;
  data?: any;
  error?: string;
}

interface UseContractReturn {
  callStatic: (method: string, args: any[]) => Promise<ContractCallResult>;
  sendTransaction: (method: string, args: any[], value?: string) => Promise<ContractCallResult>;
  readContract: (method: string, args: any[]) => Promise<any>;
  isLoading: boolean;
  error: string | null;
}

// 默认 RPC 节点
const DEFAULT_RPC = 'https://eth.llamarpc.com';

export function useContract(contractAddress?: string, rpcUrl?: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 获取 Provider（只读）
  const getProvider = useCallback(() => {
    return new ethers.JsonRpcProvider(rpcUrl || DEFAULT_RPC);
  }, [rpcUrl]);

  // 获取 Signer（需要钱包）
  const getSigner = useCallback(async () => {
    // 在 React Native 中，需要通过 WalletConnect 或 MetaMask 获取 signer
    // 这里使用模拟方式
    return null;
  }, []);

  // 静态调用（不发送交易）
  const callStatic = useCallback(async (
    method: string, 
    args: any[]
  ): Promise<ContractCallResult> => {
    if (!contractAddress) {
      return { success: false, error: '合约地址未设置' };
    }

    setIsLoading(true);
    setError(null);

    try {
      const provider = getProvider();
      const contract = new ethers.Contract(contractAddress, ERC20_ABI, provider);
      
      // 调用合约方法
      const result = await (contract as any)[method](...args);
      
      return { success: true, data: result };
    } catch (err: any) {
      const errorMsg = err.message || '合约调用失败';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, [contractAddress, getProvider]);

  // 发送交易（需要签名）
  const sendTransaction = useCallback(async (
    method: string,
    args: any[],
    value?: string
  ): Promise<ContractCallResult> => {
    if (!contractAddress) {
      return { success: false, error: '合约地址未设置' };
    }

    setIsLoading(true);
    setError(null);

    try {
      // 在真实场景中，这里需要使用钱包的 signer
      // 由于 React Native 环境限制，演示中使用模拟方式
      console.log(`调用合约方法: ${method}`);
      console.log(`参数:`, args);
      
      // 模拟交易发送
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 返回模拟的交易哈希
      const txHash = `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`;
      
      return { 
        success: true, 
        data: { 
          hash: txHash,
          wait: async () => ({ status: 1 })
        }
      };
    } catch (err: any) {
      const errorMsg = err.message || '交易发送失败';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, [contractAddress]);

  // 读取合约数据
  const readContract = useCallback(async (method: string, args: any[]): Promise<any> => {
    const result = await callStatic(method, args);
    if (result.success) {
      return result.data;
    }
    throw new Error(result.error);
  }, [callStatic]);

  return {
    callStatic,
    sendTransaction,
    readContract,
    isLoading,
    error,
    getProvider,
  };
}

// 工具函数：验证以太坊地址
export function isValidAddress(address: string): boolean {
  return ethers.isAddress(address);
}

// 工具函数：格式化地址显示
export function formatAddress(address: string, start = 6, end = 4): string {
  if (!address) return '';
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}

// 工具函数：格式化 ETH 数量
export function formatEther(wei: string | number, decimals = 4): string {
  try {
    const eth = ethers.formatEther(wei);
    return parseFloat(eth).toFixed(decimals);
  } catch {
    return '0';
  }
}

// 工具函数：转换 Gwei
export function formatGwei(wei: string | number): string {
  try {
    const gwei = ethers.formatUnits(wei, 'gwei');
    return parseFloat(gwei).toFixed(2);
  } catch {
    return '0';
  }
}

export default useContract;
