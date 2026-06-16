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
  SUPPORTED_CHAINS,
  type ChainType,
  type WalletType,
} from '@/services/metamask';

// API 基础 URL
const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || ''

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

// Trust / TP 钱包连接
export async function connectTrust(): Promise<string> {
  let address: string = '';
  
  // 检查是否在 TP Wallet 浏览器中
  if (typeof window !== 'undefined') {
    const trustWallet = (window as any).trustwallet;
    
    if (trustWallet) {
      console.log('TP Wallet provider detected');
      
      // 优先尝试 tron_requestAccounts (TP Wallet 主要使用 TRON 链)
      try {
        console.log('Requesting tron_requestAccounts...');
        const tronResult = await trustWallet.request({
          method: 'tron_requestAccounts',
        });
        
        console.log('tron_requestAccounts result:', tronResult);
        
        if (tronResult) {
          // TP Wallet 返回格式可能是:
          // 1. { address: 'Txxx...' }
          // 2. { code: 200, address: 'Txxx...' }
          // 3. ['Txxx...'] 直接返回数组
          // 4. 'Txxx...' 直接返回字符串
          
          if (typeof tronResult === 'string') {
            address = tronResult;
          } else if (Array.isArray(tronResult)) {
            address = tronResult[0];
          } else if (tronResult.address) {
            address = tronResult.address;
          } else if (tronResult.code === 200 && tronResult.address) {
            address = tronResult.address;
          }
          
          if (address) {
            console.log('Got TRON address from TP Wallet:', address);
            // TRON 地址以 T 开头
            if (address.startsWith('T')) {
              // 存储并返回 TRON 地址
              const nonce = generateNonce();
              await storeNonce(address, nonce);
              
              await storeWalletInfo({
                address,
                chain: 'tron',
                connectedAt: Date.now(),
              });
              await storeWalletType('trust');
              
              return address;
            }
          }
        }
      } catch (tronError) {
        console.log('tron_requestAccounts error:', tronError);
      }
      
      // 如果 Tron 方式失败或返回的不是 TRON 地址，尝试 eth_requestAccounts
      // 但需要排除 MetaMask 等其他钱包
      try {
        console.log('Requesting eth_requestAccounts...');
        const ethResult = await trustWallet.request({
          method: 'eth_requestAccounts',
        });
        
        console.log('eth_requestAccounts result:', ethResult);
        
        if (ethResult && ethResult.length > 0) {
          // 检查是否是有效的以太坊地址
          const isValidEthAddress = /^0x[a-fA-F0-9]{40}$/.test(ethResult[0]);
          if (isValidEthAddress) {
            address = ethResult[0];
            console.log('Got Ethereum address from TP Wallet:', address);
          }
        }
      } catch (ethError) {
        console.log('eth_requestAccounts error:', ethError);
      }
    } else {
      console.log('TrustWallet provider not found in window');
      console.log('Available providers:', Object.keys(window).filter(k => k.includes('trust') || k.includes('ethereum') || k.includes('bnb')));
    }
  } else {
    console.log('Window not defined (not in browser)');
  }
  
  // 如果获取地址失败，抛出错误
  if (!address) {
    throw new Error('无法连接到 TP 钱包，请确保在 TP 钱包的内置浏览器中打开此页面');
  }
  
  const nonce = generateNonce();
  await storeNonce(address, nonce);
  
  const chain = await getSelectedChain();
  await storeWalletInfo({
    address,
    chain,
    connectedAt: Date.now(),
  });
  await storeWalletType('trust');
  
  return address;
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

// 获取原生代币余额（通过 RPC）
export async function getNativeBalance(
  address: string,
  chain: ChainType
): Promise<string> {
  try {
    const chainInfo = getChainInfo(chain);
    
    // 构建 RPC 请求
    const rpcPayload = {
      jsonrpc: '2.0',
      method: 'eth_getBalance',
      params: [address, 'latest'],
      id: 1,
    };

    const response = await fetch(chainInfo.rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(rpcPayload),
    });

    const data = await response.json();
    
    if (data.result) {
      // 将十六进制转换为十进制（以 wei/wei 为单位）
      const balanceWei = BigInt(data.result);
      const decimals = chainInfo.decimals || 18;
      const divisor = BigInt(10 ** decimals);
      
      // 转换为可读格式
      const balanceMain = balanceWei / divisor;
      const remainder = balanceWei % divisor;
      const decimalStr = remainder.toString().padStart(decimals, '0').slice(0, 4);
      
      return `${balanceMain}.${decimalStr}`;
    }
    
    return '0';
  } catch (error) {
    console.error('Failed to get balance:', error);
    return '0';
  }
}

// 获取钱包余额（模拟，实际使用 getNativeBalance）
export async function getBalance(address: string): Promise<string> {
  // 模拟返回随机余额
  const balance = (Math.random() * 10).toFixed(4);
  return balance;
}

// 获取 Gas 价格
export async function getGasPrice(chain: ChainType): Promise<string> {
  try {
    const chainInfo = getChainInfo(chain);
    
    const rpcPayload = {
      jsonrpc: '2.0',
      method: 'eth_gasPrice',
      params: [],
      id: 1,
    };

    const response = await fetch(chainInfo.rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(rpcPayload),
    });

    const data = await response.json();
    
    if (data.result) {
      // 将 hex 转换为 Gwei
      const gasPriceWei = BigInt(data.result);
      const gasPriceGwei = Number(gasPriceWei) / 1e9;
      return gasPriceGwei.toFixed(2);
    }
    
    return '0';
  } catch (error) {
    console.error('Failed to get gas price:', error);
    return '0';
  }
}

// 获取区块信息
export async function getBlockNumber(chain: ChainType): Promise<number> {
  try {
    const chainInfo = getChainInfo(chain);
    
    const rpcPayload = {
      jsonrpc: '2.0',
      method: 'eth_blockNumber',
      params: [],
      id: 1,
    };

    const response = await fetch(chainInfo.rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(rpcPayload),
    });

    const data = await response.json();
    
    if (data.result) {
      return parseInt(data.result, 16);
    }
    
    return 0;
  } catch (error) {
    console.error('Failed to get block number:', error);
    return 0;
  }
}

// 链状态信息
export interface ChainStatus {
  chain: ChainType;
  blockNumber: number;
  gasPrice: string;
  isOnline: boolean;
  latency: number;
}

// 获取链状态
export async function getChainStatus(chain: ChainType): Promise<ChainStatus> {
  const start = Date.now();
  
  try {
    const [blockNumber, gasPrice] = await Promise.all([
      getBlockNumber(chain),
      getGasPrice(chain),
    ]);
    
    return {
      chain,
      blockNumber,
      gasPrice,
      isOnline: true,
      latency: Date.now() - start,
    };
  } catch (error) {
    return {
      chain,
      blockNumber: 0,
      gasPrice: '0',
      isOnline: false,
      latency: Date.now() - start,
    };
  }
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

// ============ 链状态 API 调用 ============

// 获取链配置列表
export async function getChainConfigs(): Promise<any[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/web3/chains`);
    const data = await response.json();
    
    if (data.code !== 0) {
      throw new Error(data.message || '获取链配置失败');
    }
    
    return data.data;
  } catch (error) {
    console.error('Get chain configs error:', error);
    // 返回本地配置作为兜底
    return Object.entries(SUPPORTED_CHAINS).map(([key, info]) => ({
      key,
      ...info,
    }));
  }
}

// 获取所有链状态
export async function getAllChainStatuses(): Promise<{
  chains: ChainStatus[];
  onlineCount: number;
  totalCount: number;
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/web3/chains/status`);
    const data = await response.json();
    
    if (data.code !== 0) {
      throw new Error(data.message || '获取链状态失败');
    }
    
    return data.data;
  } catch (error) {
    console.error('Get all chain statuses error:', error);
    // 返回本地获取的状态作为兜底
    const statuses: ChainStatus[] = [];
    for (const chain of Object.keys(SUPPORTED_CHAINS)) {
      const status = await getChainStatus(chain as ChainType);
      statuses.push(status);
    }
    
    return {
      chains: statuses,
      onlineCount: statuses.filter(s => s.isOnline).length,
      totalCount: statuses.length,
    };
  }
}

// 获取单个链状态
export async function getChainStatusFromBackend(chain: ChainType): Promise<ChainStatus> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/web3/chains/${chain}/status`);
    const data = await response.json();
    
    if (data.code !== 0) {
      throw new Error(data.message || '获取链状态失败');
    }
    
    return data.data;
  } catch (error) {
    console.error('Get chain status error:', error);
    // 返回本地获取的状态作为兜底
    return getChainStatus(chain);
  }
}

// 获取代币价格
export async function getTokenPrice(chain: ChainType): Promise<{
  symbol: string;
  usd: number;
  change24h: number;
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/web3/price/${chain}`);
    const data = await response.json();
    
    if (data.code !== 0) {
      throw new Error(data.message || '获取代币价格失败');
    }
    
    return data.data;
  } catch (error) {
    console.error('Get token price error:', error);
    // 返回模拟价格作为兜底
    const prices: Record<ChainType, { symbol: string; usd: number; change24h: number }> = {
      ethereum: { symbol: 'ETH', usd: 3450, change24h: 2.5 },
      sepolia: { symbol: 'ETH', usd: 3450, change24h: 0 },
      bsc: { symbol: 'BNB', usd: 605, change24h: -1.2 },
      bscTestnet: { symbol: 'BNB', usd: 605, change24h: 0 },
      polygon: { symbol: 'MATIC', usd: 0.85, change24h: 3.8 },
      arbitrum: { symbol: 'ETH', usd: 3.45, change24h: 1.5 },
      optimism: { symbol: 'ETH', usd: 3.45, change24h: 1.2 },
    };
    
    return prices[chain];
  }
}

// ============ 签名验证 API 调用 ============

// 签名验证结果类型
export interface SignatureVerifyResult {
  address: string;
  verified: boolean;
  network: string;
  verifiedAt: string;
  sessionToken?: string;
}

// Nonce 状态类型
export interface NonceStatus {
  hasActiveNonce: boolean;
  remainingTime?: number;
  expiresAt?: number;
}

// 获取 Nonce
export async function getSignatureNonce(address: string): Promise<{
  nonce: string;
  message: string;
  expiresIn: number;
  timestamp: string;
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/web3/signature/nonce/${address}`);
    const data = await response.json();

    if (data.code !== 0) {
      throw new Error(data.message || '获取 Nonce 失败');
    }

    return data.data;
  } catch (error) {
    console.error('Get signature nonce error:', error);
    // 生成本地 Nonce 作为兜底
    const nonce = generateNonce();
    const timestamp = new Date().toISOString();
    const message = `Welcome to KAIROS DAPP!

This request will not trigger a blockchain transaction or cost any gas fees.

Wallet Address: ${address}
Nonce: ${nonce}
Timestamp: ${timestamp}
Network: Ethereum Mainnet

Please sign this message to verify your wallet ownership.`;

    return {
      nonce,
      message,
      expiresIn: 600,
      timestamp,
    };
  }
}

// 验证签名
export async function verifyWalletSignature(
  address: string,
  signature: string,
  message: string,
  network?: string
): Promise<SignatureVerifyResult> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/web3/signature/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address,
        signature,
        message,
        network,
      }),
    });

    const data = await response.json();

    if (data.code !== 0) {
      throw new Error(data.message || '签名验证失败');
    }

    return data.data;
  } catch (error) {
    console.error('Verify signature error:', error);
    throw error;
  }
}

// 验证会话
export async function verifySession(
  address: string,
  sessionToken: string
): Promise<{
  address: string;
  sessionValid: boolean;
  expiresIn: number;
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/web3/signature/verify-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address,
        sessionToken,
      }),
    });

    const data = await response.json();

    if (data.code !== 0) {
      throw new Error(data.message || '会话验证失败');
    }

    return data.data;
  } catch (error) {
    console.error('Verify session error:', error);
    throw error;
  }
}

// 获取 Nonce 状态
export async function getNonceStatus(address: string): Promise<NonceStatus> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/web3/signature/nonce-status/${address}`);
    const data = await response.json();

    if (data.code !== 0) {
      throw new Error(data.message || '获取 Nonce 状态失败');
    }

    return data.data;
  } catch (error) {
    console.error('Get nonce status error:', error);
    return { hasActiveNonce: false };
  }
}

// 完整的签名验证流程
export async function performSignatureVerification(
  address: string,
  signature: string,
  network?: string
): Promise<{
  success: boolean;
  result?: SignatureVerifyResult;
  error?: string;
}> {
  try {
    // 1. 获取签名消息
    const { message, nonce } = await getSignatureNonce(address);

    // 2. 验证签名
    const result = await verifyWalletSignature(address, signature, message, network);

    return {
      success: result.verified,
      result,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || '签名验证失败',
    };
  }
}
