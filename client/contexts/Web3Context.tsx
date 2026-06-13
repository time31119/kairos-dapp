/**
 * Web3 Context - DAPP 钱包连接管理
 */
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';
import * as Crypto from 'expo-crypto';
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 钱包连接状态
interface WalletState {
  address: string | null;
  shortAddress: string;
  balance: string;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
}

interface Web3ContextType extends WalletState {
  connect: () => Promise<void>;
  disconnect: () => void;
  signMessage: (message: string) => Promise<string>;
  switchNetwork: (chainId: number) => Promise<void>;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

// 简化版钱包（用于演示）
// 实际 DAPP 应该使用 WalletConnect 或 MetaMask
class SimpleWallet {
  privateKey: string;
  address: string;

  constructor() {
    // 生成随机钱包
    const wallet = ethers.Wallet.createRandom();
    this.privateKey = wallet.privateKey;
    this.address = wallet.address;
  }

  getAddress(): string {
    return this.address;
  }

  signMessage(message: string): Promise<string> {
    const wallet = new ethers.Wallet(this.privateKey);
    return wallet.signMessage(message);
  }
}

// 存储当前钱包
let currentWallet: SimpleWallet | null = null;

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<WalletState>({
    address: null,
    shortAddress: '',
    balance: '0',
    chainId: 1,
    isConnected: false,
    isConnecting: false,
    error: null,
  });

  // 连接钱包（简化版 - 模拟连接）
  const connect = useCallback(async () => {
    setState(prev => ({ ...prev, isConnecting: true, error: null }));
    
    try {
      // 模拟连接延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 创建新钱包或使用已有钱包
      if (!currentWallet) {
        currentWallet = new SimpleWallet();
      }
      
      const address = currentWallet.getAddress();
      const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
      
      setState({
        address,
        shortAddress,
        balance: '0.5', // 模拟余额
        chainId: 1,
        isConnected: true,
        isConnecting: false,
        error: null,
      });
      
      // 存储到本地
      try {
        await AsyncStorage.setItem('wallet_address', address);
      } catch (e) {
        // 忽略存储错误
      }
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isConnecting: false,
        error: error.message || '连接失败'
      }));
    }
  }, []);

  // 断开连接
  const disconnect = useCallback(() => {
    currentWallet = null;
    setState({
      address: null,
      shortAddress: '',
      balance: '0',
      chainId: null,
      isConnected: false,
      isConnecting: false,
      error: null,
    });
    
    // 异步清理存储
    AsyncStorage.removeItem('wallet_address').catch(() => {});
  }, []);

  // 签名消息
  const signMessage = useCallback(async (message: string): Promise<string> => {
    if (!currentWallet) {
      throw new Error('请先连接钱包');
    }
    
    // 生成随机 nonce 用于防重放攻击
    const nonce = await Crypto.getRandomBytesAsync(16);
    const nonceHex = Buffer.from(nonce).toString('hex');
    const fullMessage = `${message}\n\nNonce: ${nonceHex}\nTimestamp: ${Date.now()}`;
    
    return currentWallet.signMessage(fullMessage);
  }, []);

  // 切换网络
  const switchNetwork = useCallback(async (chainId: number) => {
    setState(prev => ({ ...prev, chainId }));
  }, []);

  // 恢复连接状态
  useEffect(() => {
    const restoreConnection = async () => {
      try {
        const savedAddress = await AsyncStorage.getItem('wallet_address');
        
        if (savedAddress) {
          // 恢复钱包
          currentWallet = new SimpleWallet();
          (currentWallet as any).address = savedAddress;
          
          setState({
            address: savedAddress,
            shortAddress: `${savedAddress.slice(0, 6)}...${savedAddress.slice(-4)}`,
            balance: '0.5',
            chainId: 1,
            isConnected: true,
            isConnecting: false,
            error: null,
          });
        }
      } catch (e) {
        // 忽略
      }
    };
    
    restoreConnection();
  }, []);

  return (
    <Web3Context.Provider value={{
      ...state,
      connect,
      disconnect,
      signMessage,
      switchNetwork,
    }}>
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within Web3Provider');
  }
  return context;
}

export type { WalletState };
