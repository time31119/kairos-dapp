/**
 * Web3 Context
 * 全局钱包状态管理
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  connectWallet,
  disconnect,
  switchNetwork,
  getWalletInfo,
  getWalletType,
  getBalance,
  createSignMessage,
  verifySignature,
  type WalletInfo,
} from '@/services/web3';
import {
  getChainInfo,
  formatAddress,
  formatBalance,
  type ChainType,
  type WalletType,
} from '@/services/metamask';

// 钱包状态接口
export interface WalletState {
  address: string | null;
  chain: ChainType;
  balance: string;
  walletType: WalletType | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
}

// Context 接口
interface Web3ContextType {
  wallet: WalletState;
  connect: (type: WalletType) => Promise<void>;
  disconnect: () => Promise<void>;
  switchChain: (chain: ChainType) => Promise<void>;
  refreshBalance: () => Promise<void>;
  signMessage: (message?: string) => Promise<string>;
  verifySign: (signature: string) => Promise<boolean>;
}

// 默认状态
const defaultState: WalletState = {
  address: null,
  chain: 'ethereum',
  balance: '0',
  walletType: null,
  isConnected: false,
  isConnecting: false,
  error: null,
};

// 创建 Context
const Web3Context = createContext<Web3ContextType | undefined>(undefined);

// Provider Props
interface Web3ProviderProps {
  children: ReactNode;
}

// Provider 组件
export function Web3Provider({ children }: Web3ProviderProps) {
  const [wallet, setWallet] = useState<WalletState>(defaultState);

  // 初始化 - 恢复连接状态
  useEffect(() => {
    const restoreConnection = async () => {
      try {
        const info = await getWalletInfo();
        const type = await getWalletType();

        if (info && type) {
          const balance = await getBalance(info.address);
          
          setWallet({
            address: info.address,
            chain: info.chain,
            balance,
            walletType: type,
            isConnected: true,
            isConnecting: false,
            error: null,
          });
        }
      } catch (error) {
        console.error('Failed to restore connection:', error);
      }
    };

    restoreConnection();
  }, []);

  // 连接钱包
  const connect = useCallback(async (type: WalletType) => {
    setWallet(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      const { address, chain } = await connectWallet(type);
      const balance = await getBalance(address);

      setWallet({
        address,
        chain,
        balance,
        walletType: type,
        isConnected: true,
        isConnecting: false,
        error: null,
      });
    } catch (error: any) {
      setWallet(prev => ({
        ...prev,
        isConnecting: false,
        error: error.message || 'Failed to connect',
      }));
      throw error;
    }
  }, []);

  // 断开连接
  const disconnectWallet = useCallback(async () => {
    try {
      await disconnect();
      setWallet(defaultState);
    } catch (error: any) {
      setWallet(prev => ({
        ...prev,
        error: error.message || 'Failed to disconnect',
      }));
    }
  }, []);

  // 切换链
  const switchChain = useCallback(async (chain: ChainType) => {
    if (!wallet.address) return;

    try {
      await switchNetwork(chain);
      setWallet(prev => ({ ...prev, chain }));
    } catch (error: any) {
      setWallet(prev => ({
        ...prev,
        error: error.message || 'Failed to switch chain',
      }));
    }
  }, [wallet.address]);

  // 刷新余额
  const refreshBalance = useCallback(async () => {
    if (!wallet.address) return;

    try {
      const balance = await getBalance(wallet.address);
      setWallet(prev => ({ ...prev, balance }));
    } catch (error) {
      console.error('Failed to refresh balance:', error);
    }
  }, [wallet.address]);

  // 获取签名消息
  const signMessage = useCallback(async (message?: string): Promise<string> => {
    if (!wallet.address) {
      throw new Error('Wallet not connected');
    }
    const msg = message || `KAIROS DAPP 登录授权\n钱包地址: ${wallet.address}\n时间: ${new Date().toISOString()}`;
    return createSignMessage(wallet.address, msg);
  }, [wallet.address]);

  // 验证签名
  const verifySign = useCallback(async (signature: string): Promise<boolean> => {
    if (!wallet.address) {
      throw new Error('Wallet not connected');
    }
    return await verifySignature(wallet.address, signature);
  }, [wallet.address]);

  const value: Web3ContextType = {
    wallet,
    connect,
    disconnect: disconnectWallet,
    switchChain,
    refreshBalance,
    signMessage,
    verifySign,
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
}

// Hook
export function useWeb3(): Web3ContextType {
  const context = useContext(Web3Context);
  
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  
  return context;
}

// 辅助 Hook - 获取格式化数据
export function useFormattedWallet() {
  const { wallet } = useWeb3();
  
  return {
    ...wallet,
    shortAddress: wallet.address ? formatAddress(wallet.address) : null,
    chainInfo: getChainInfo(wallet.chain),
    formattedBalance: wallet.address ? formatBalance(wallet.balance) : '0',
  };
}
