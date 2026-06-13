/**
 * Web3 Context
 * 全局钱包状态管理
 * 支持 MetaMask 和 WalletConnect
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
import {
  connectWalletConnect,
  disconnectWalletConnect,
  hasActiveSession,
  openWalletConnectWallet,
  getConnectedAccounts,
  getConnectedChainId,
  storeWCUri,
  getWCUri,
  clearWCUri,
  type WCSession,
} from '@/services/walletconnect';

// 钱包状态接口
export interface WalletState {
  address: string | null;
  chain: ChainType;
  balance: string;
  walletType: WalletType | null;
  isConnected: boolean;
  isConnecting: boolean;
  isWalletConnectConnecting: boolean;
  wcUri: string | null;
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
  // WalletConnect 专用方法
  initiateWalletConnect: () => Promise<string>;
  completeWalletConnect: (uri: string) => Promise<void>;
  cancelWalletConnect: () => void;
}

// 默认状态
const defaultState: WalletState = {
  address: null,
  chain: 'ethereum',
  balance: '0',
  walletType: null,
  isConnected: false,
  isConnecting: false,
  isWalletConnectConnecting: false,
  wcUri: null,
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
        // 检查常规钱包连接
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
            isWalletConnectConnecting: false,
            wcUri: null,
            error: null,
          });
        } else {
          // 检查 WalletConnect Session
          const hasWC = await hasActiveSession();
          if (hasWC) {
            const accounts = await getConnectedAccounts();
            const chainId = await getConnectedChainId();
            
            if (accounts.length > 0) {
              const chain = getChainTypeFromChainId(chainId || 1);
              setWallet({
                address: accounts[0],
                chain,
                balance: '0',
                walletType: 'walletconnect',
                isConnected: true,
                isConnecting: false,
                isWalletConnectConnecting: false,
                wcUri: null,
                error: null,
              });
            }
          }
        }
      } catch (error) {
        console.error('Failed to restore connection:', error);
      }
    };

    restoreConnection();
  }, []);

  // 连接钱包
  const connect = useCallback(async (type: WalletType) => {
    // WalletConnect 需要特殊处理
    if (type === 'walletconnect') {
      return; // WalletConnect 使用 initiateWalletConnect
    }

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
        isWalletConnectConnecting: false,
        wcUri: null,
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
      // 如果是 WalletConnect，断开 WC 连接
      if (wallet.walletType === 'walletconnect') {
        await disconnectWalletConnect();
      }
      await disconnect();
      setWallet(defaultState);
    } catch (error: any) {
      setWallet(prev => ({
        ...prev,
        error: error.message || 'Failed to disconnect',
      }));
    }
  }, [wallet.walletType]);

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

  // ===== WalletConnect 专用方法 =====

  // 初始化 WalletConnect 连接
  const initiateWalletConnect = useCallback(async (): Promise<string> => {
    setWallet(prev => ({
      ...prev,
      isConnecting: true,
      isWalletConnectConnecting: true,
      error: null,
    }));

    try {
      const { uri } = await connectWalletConnect();
      setWallet(prev => ({
        ...prev,
        wcUri: uri,
        isConnecting: false,
      }));
      
      // 尝试打开钱包
      await openWalletConnectWallet(uri);
      
      return uri;
    } catch (error: any) {
      setWallet(prev => ({
        ...prev,
        isConnecting: false,
        isWalletConnectConnecting: false,
        error: error.message || 'Failed to initiate WalletConnect',
      }));
      throw error;
    }
  }, []);

  // 完成 WalletConnect 连接
  const completeWalletConnect = useCallback(async (uri: string) => {
    setWallet(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      // 存储 URI 并等待连接
      await storeWCUri(uri);
      
      // 模拟连接成功（实际需要监听钱包响应）
      // 这里简化处理，实际应使用 WalletConnect SDK
      const accounts = await getConnectedAccounts();
      const chainId = await getConnectedChainId();
      
      if (accounts.length > 0) {
        const chain = getChainTypeFromChainId(chainId || 1);
        setWallet({
          address: accounts[0],
          chain,
          balance: '0',
          walletType: 'walletconnect',
          isConnected: true,
          isConnecting: false,
          isWalletConnectConnecting: false,
          wcUri: null,
          error: null,
        });
      } else {
        throw new Error('No accounts connected');
      }
    } catch (error: any) {
      setWallet(prev => ({
        ...prev,
        isConnecting: false,
        isWalletConnectConnecting: false,
        error: error.message || 'Failed to complete WalletConnect',
      }));
      throw error;
    }
  }, []);

  // 取消 WalletConnect 连接
  const cancelWalletConnect = useCallback(() => {
    clearWCUri();
    setWallet(prev => ({
      ...prev,
      isConnecting: false,
      isWalletConnectConnecting: false,
      wcUri: null,
      error: null,
    }));
  }, []);

  // 辅助函数：根据链 ID 获取链类型
  const getChainTypeFromChainId = (chainId: number): ChainType => {
    const chainMap: Record<number, ChainType> = {
      1: 'ethereum',
      11155111: 'sepolia',
      137: 'polygon',
      56: 'bsc',
      42161: 'arbitrum',
      10: 'optimism',
      97: 'bscTestnet',
    };
    return chainMap[chainId] || 'ethereum';
  };

  const value: Web3ContextType = {
    wallet,
    connect,
    disconnect: disconnectWallet,
    switchChain,
    refreshBalance,
    signMessage,
    verifySign,
    initiateWalletConnect,
    completeWalletConnect,
    cancelWalletConnect,
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
