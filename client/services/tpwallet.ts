/**
 * TP 钱包服务
 * 支持连接和交易操作
 */

import { ethers } from 'ethers';

// TP 钱包提供者类型
declare global {
  interface Window {
    trustwallet?: {
      isTrust?: boolean;
      isTokenPocket?: boolean;
      request?: (args: any) => Promise<any>;
      on?: (event: string, callback: any) => void;
      removeListener?: (event: string, callback: any) => void;
    };
    ethereum?: {
      isTokenPocket?: boolean;
      request?: (args: any) => Promise<any>;
      on?: (event: string, callback: any) => void;
      removeListener?: (event: string, callback: any) => void;
    };
  }
}

// 检查是否是 TP 钱包
export const isTokenPocketWallet = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // 检查 trustwallet 对象
  if (window.trustwallet?.isTrust || window.trustwallet?.isTokenPocket) {
    return true;
  }
  
  // 检查 ethereum 对象是否有 TokenPocket 标识
  if (window.ethereum?.isTokenPocket) {
    return true;
  }
  
  // 检查 User Agent 中是否有 TokenPocket
  if (typeof navigator !== 'undefined' && navigator.userAgent) {
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('tokenpocket') || ua.includes('tpwallet')) {
      return true;
    }
  }
  
  return false;
};

// 获取 TP 钱包提供者
export const getTokenPocketProvider = (): any | null => {
  if (typeof window === 'undefined') return null;
  
  // 优先使用 trustwallet 对象
  if (window.trustwallet) {
    return window.trustwallet;
  }
  
  // 其次使用 ethereum 对象
  if (window.ethereum) {
    return window.ethereum;
  }
  
  return null;
};

// 获取 ethers.js provider
export const getEthersProvider = (): ethers.BrowserProvider | null => {
  const provider = getTokenPocketProvider();
  if (!provider) return null;
  
  try {
    return new ethers.BrowserProvider(provider);
  } catch {
    return null;
  }
};

// 连接 TP 钱包
export const connectTokenPocket = async (): Promise<{
  address: string;
  chainId: number;
  provider: ethers.BrowserProvider;
  signer: ethers.JsonRpcSigner;
} | null> => {
  try {
    const ethersProvider = getEthersProvider();
    if (!ethersProvider) {
      console.error('TP Wallet provider not found');
      return null;
    }
    
    // 请求账户
    const accounts = await ethersProvider.send('eth_requestAccounts', []);
    
    if (!accounts || accounts.length === 0) {
      console.error('No accounts found');
      return null;
    }
    
    // 获取签名者
    const signer = await ethersProvider.getSigner();
    
    // 获取链 ID
    const network = await ethersProvider.getNetwork();
    
    return {
      address: accounts[0],
      chainId: Number(network.chainId),
      provider: ethersProvider,
      signer,
    };
  } catch (error: any) {
    console.error('Connect TP Wallet failed:', error);
    
    // 用户拒绝连接
    if (error.code === 4001) {
      throw new Error('用户拒绝了连接请求');
    }
    
    throw error;
  }
};

// 发送 ETH 转账
export const sendEth = async (
  to: string,
  amount: string
): Promise<string> => {
  try {
    const ethersProvider = getEthersProvider();
    if (!ethersProvider) {
      throw new Error('TP Wallet provider not found');
    }
    
    const signer = await ethersProvider.getSigner();
    const value = ethers.parseEther(amount);
    
    const tx = await signer.sendTransaction({
      to,
      value,
    });
    
    await tx.wait();
    
    return tx.hash;
  } catch (error: any) {
    console.error('Send ETH failed:', error);
    
    if (error.code === 4001) {
      throw new Error('用户取消了交易');
    }
    
    throw error;
  }
};

// 调用合约方法（发送交易）
export const sendContractTransaction = async (
  contractAddress: string,
  abi: any[],
  method: string,
  params: any[] = [],
  value?: string // ETH 金额（如果是 payable 函数）
): Promise<string> => {
  try {
    const ethersProvider = getEthersProvider();
    if (!ethersProvider) {
      throw new Error('TP Wallet provider not found');
    }
    
    const signer = await ethersProvider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    
    const txParams: any[] = [...params];
    const options: any = {};
    
    if (value) {
      options.value = ethers.parseEther(value);
    }
    
    // 调用合约方法
    const tx = await contract[method](...txParams, options);
    
    // 等待交易确认
    await tx.wait();
    
    return tx.hash;
  } catch (error: any) {
    console.error('Contract transaction failed:', error);
    
    if (error.code === 4001) {
      throw new Error('用户取消了交易');
    }
    
    throw error;
  }
};

// 读取合约数据（不发送交易）
export const readContract = async (
  contractAddress: string,
  abi: any[],
  method: string,
  params: any[] = []
): Promise<any> => {
  try {
    const ethersProvider = getEthersProvider();
    if (!ethersProvider) {
      throw new Error('TP Wallet provider not found');
    }
    
    const contract = new ethers.Contract(contractAddress, abi, ethersProvider);
    
    const result = await contract[method](...params);
    
    return result;
  } catch (error: any) {
    console.error('Read contract failed:', error);
    throw error;
  }
};

// 监听账户变化
export const onAccountsChanged = (callback: (accounts: string[]) => void): void => {
  const provider = getTokenPocketProvider();
  if (provider?.on) {
    provider.on('accountsChanged', callback);
  }
};

// 监听链变化
export const onChainChanged = (callback: (chainId: string) => void): void => {
  const provider = getTokenPocketProvider();
  if (provider?.on) {
    provider.on('chainChanged', callback);
  }
};

// 移除监听
export const removeListeners = (
  event: 'accountsChanged' | 'chainChanged',
  callback: any
): void => {
  const provider = getTokenPocketProvider();
  if (provider?.removeListener) {
    provider.removeListener(event, callback);
  }
};

// 切换网络
export const switchChain = async (chainId: string): Promise<void> => {
  try {
    const provider = getTokenPocketProvider();
    if (!provider) {
      throw new Error('TP Wallet provider not found');
    }
    
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId }],
    });
  } catch (error: any) {
    // 链未添加
    if (error.code === 4902) {
      throw new Error('请先添加该网络');
    }
    throw error;
  }
};

// 格式化地址显示
export const formatAddress = (address: string, start = 6, end = 4): string => {
  if (!address) return '';
  return `${address.slice(0, start)}...${address.slice(-end)}`;
};

// 检查地址是否有效
export const isValidAddress = (address: string): boolean => {
  return ethers.isAddress(address);
};
