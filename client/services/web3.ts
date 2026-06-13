/**
 * Web3 服务
 * 统一管理所有钱包连接和链操作
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking, Alert } from 'react-native';
import {
  generateNonce,
  storeNonce,
  getNonce,
  clearNonce,
  storeSelectedChain,
  getSelectedChain,
  getChainInfo,
  formatAddress,
  type ChainType,
  type WalletType,
} from '@/services/metamask';

// API 基础 URL
const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9091';

// 存储键
const WALLET_STORAGE_KEY = 'wallet_info';
const WALLET_TYPE_KEY = 'wallet_type';

// 钱包信息接口
export interface WalletInfo {
  address: string;
  chain: ChainType;
  connectedAt: number;
}

// 存储钱包信息
export async function storeWalletInfo(info: WalletInfo): Promise<void> {
  await AsyncStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(info));
}

// 获取钱包信息
export async function getWalletInfo(): Promise<WalletInfo | null> {
  const data = await AsyncStorage.getItem(WALLET_STORAGE_KEY);
  return data ? JSON.parse(data) : null;
}

// 清除钱包信息
export async function clearWalletInfo(): Promise<void> {
  await AsyncStorage.removeItem(WALLET_STORAGE_KEY);
}

// 存储钱包类型
export async function storeWalletType(type: WalletType): Promise<void> {
  await AsyncStorage.setItem(WALLET_TYPE_KEY, type);
}

// 获取钱包类型
export async function getWalletType(): Promise<WalletType | null> {
  return await AsyncStorage.getItem(WALLET_TYPE_KEY) as WalletType | null;
}

// 清除钱包类型
export async function clearWalletType(): Promise<void> {
  await AsyncStorage.removeItem(WALLET_TYPE_KEY);
}

// MetaMask 连接
export async function connectMetaMask(): Promise<string> {
  // 生成随机地址用于演示（实际需要 MetaMask Mobile SDK）
  const mockAddress = generateMockAddress();
  
  // 生成并存储 nonce
  const nonce = generateNonce();
  await storeNonce(mockAddress, nonce);
  
  // 存储钱包信息
  const chain = await getSelectedChain();
  await storeWalletInfo({
    address: mockAddress,
    chain,
    connectedAt: Date.now(),
  });
  await storeWalletType('metamask');
  
  return mockAddress;
}

// WalletConnect 连接
export async function connectWalletConnect(): Promise<string> {
  // WalletConnect 需要 QR 码或 deep link
  const mockAddress = generateMockAddress();
  
  const nonce = generateNonce();
  await storeNonce(mockAddress, nonce);
  
  const chain = await getSelectedChain();
  await storeWalletInfo({
    address: mockAddress,
    chain,
    connectedAt: Date.now(),
  });
  await storeWalletType('walletconnect');
  
  return mockAddress;
}

// Coinbase 钱包连接
export async function connectCoinbase(): Promise<string> {
  const mockAddress = generateMockAddress();
  
  const nonce = generateNonce();
  await storeNonce(mockAddress, nonce);
  
  const chain = await getSelectedChain();
  await storeWalletInfo({
    address: mockAddress,
    chain,
    connectedAt: Date.now(),
  });
  await storeWalletType('coinbase');
  
  return mockAddress;
}

// Trust 钱包连接
export async function connectTrust(): Promise<string> {
  const mockAddress = generateMockAddress();
  
  const nonce = generateNonce();
  await storeNonce(mockAddress, nonce);
  
  const chain = await getSelectedChain();
  await storeWalletInfo({
    address: mockAddress,
    chain,
    connectedAt: Date.now(),
  });
  await storeWalletType('trust');
  
  return mockAddress;
}

// Phantom 钱包连接 (Solana)
export async function connectPhantom(): Promise<string> {
  const mockAddress = generateSolanaAddress();
  
  const nonce = generateNonce();
  await storeNonce(mockAddress, nonce);
  
  await storeWalletInfo({
    address: mockAddress,
    chain: 'ethereum', // Phantom 主要用于 Solana
    connectedAt: Date.now(),
  });
  await storeWalletType('phantom');
  
  return mockAddress;
}

// 断开连接
export async function disconnect(): Promise<void> {
  const info = await getWalletInfo();
  if (info) {
    await clearNonce(info.address);
  }
  await clearWalletInfo();
  await clearWalletType();
}

// 切换链
export async function switchNetwork(chain: ChainType): Promise<boolean> {
  const info = getChainInfo(chain);
  const chainHex = '0x' + parseInt(info.chainId).toString(16);
  
  try {
    // 尝试通过 deep link 切换
    const url = `metamask://switch?chainId=${chainHex}`;
    const canOpen = await Linking.canOpenURL(url);
    
    if (canOpen) {
      await Linking.openURL(url);
      await storeSelectedChain(chain);
      
      // 更新存储的钱包信息
      const walletInfo = await getWalletInfo();
      if (walletInfo) {
        walletInfo.chain = chain;
        await storeWalletInfo(walletInfo);
      }
      
      return true;
    }
    
    // 如果无法打开，提示用户手动切换
    Alert.alert(
      '切换网络',
      `请在钱包中手动切换到 ${info.chainName}`,
      [{ text: '确定' }]
    );
    
    // 即使无法打开也更新本地存储
    await storeSelectedChain(chain);
    return false;
  } catch (error) {
    console.error('Failed to switch network:', error);
    return false;
  }
}

// 验证签名消息
export async function verifySignature(
  address: string,
  signature: string
): Promise<boolean> {
  const nonce = await getNonce(address);
  if (!nonce) {
    return false;
  }
  
  // 在实际应用中，这里需要：
  // 1. 使用 ethers.js 的 verifyMessage 验证签名
  // 2. 后端验证签名是否正确
  // 3. 验证 nonce 是否匹配
  
  // 模拟验证（实际需要实现）
  return signature.length > 0;
}

// 生成签名消息（用于显示给用户）
export function createSignMessage(address: string, nonce: string): string {
  return `Welcome to KAIROS DAPP!

Please sign this message to verify your wallet ownership.

Wallet: ${formatAddress(address)}
Nonce: ${nonce}

This request will not trigger a blockchain transaction or cost any gas fees.`;
}

// 获取钱包余额（模拟）
export async function getBalance(address: string): Promise<string> {
  // 实际应用中需要通过 RPC 获取
  // 模拟返回随机余额
  const balance = (Math.random() * 10).toFixed(4);
  return balance;
}

// 生成模拟以太坊地址
function generateMockAddress(): string {
  const chars = '0123456789abcdef';
  let address = '0x';
  for (let i = 0; i < 40; i++) {
    address += chars[Math.floor(Math.random() * 16)];
  }
  return address;
}

// 生成模拟 Solana 地址
function generateSolanaAddress(): string {
  const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let address = '';
  for (let i = 0; i < 44; i++) {
    address += chars[Math.floor(Math.random() * chars.length)];
  }
  return address;
}

// 统一连接入口
export async function connectWallet(
  type: WalletType
): Promise<{ address: string; chain: ChainType }> {
  let address: string;
  
  switch (type) {
    case 'metamask':
      address = await connectMetaMask();
      break;
    case 'walletconnect':
      address = await connectWalletConnect();
      break;
    case 'coinbase':
      address = await connectCoinbase();
      break;
    case 'trust':
      address = await connectTrust();
      break;
    case 'phantom':
      address = await connectPhantom();
      break;
    default:
      throw new Error('Unsupported wallet type');
  }
  
  const chain = await getSelectedChain();
  return { address, chain };
}

// 检查钱包是否已连接
export async function isWalletConnected(): Promise<boolean> {
  const info = await getWalletInfo();
  return info !== null;
}

// 后端 API 调用：钱包登录
export async function walletLoginToBackend(
  walletAddress: string,
  signature: string,
  message: string
): Promise<{ token: string; user: any }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/wallet-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        walletAddress,
        signature,
        message,
      }),
    });

    const data = await response.json();

    if (data.code !== 0) {
      throw new Error(data.message || '钱包登录失败');
    }

    return data.data;
  } catch (error) {
    console.error('Wallet login error:', error);
    throw error;
  }
}

// 后端 API 调用：获取 Web3 用户信息
export async function getWeb3UserFromBackend(token: string): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/web3-user`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (data.code !== 0) {
      throw new Error(data.message || '获取用户信息失败');
    }

    return data.data;
  } catch (error) {
    console.error('Get web3 user error:', error);
    throw error;
  }
}

// 获取签名消息（用于显示给用户签署）
export async function getSignMessage(address: string, message?: string): Promise<string> {
  let nonce = await getNonce(address);
  
  if (!nonce) {
    nonce = generateNonce();
    await storeNonce(address, nonce);
  }
  
  return createSignMessage(address, nonce);
}
