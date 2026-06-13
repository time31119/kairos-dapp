/**
 * MetaMask 服务
 * 支持连接 MetaMask 钱包、签名验证、多链切换
 */


// 钱包类型
export type WalletType = 'metamask' | 'walletconnect' | 'coinbase' | 'trust' | 'phantom' | 'demo';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking, Alert } from 'react-native';

// MetaMask deeplink
const METAMASK_DEEPLINK = 'metamask://connect';
const METAMASK_UNIVERSAL_LINK = 'https://metamask.app.link/connect';

// 链信息接口
export interface ChainInfo {
  chainId: string;
  chainName: string;
  symbol: string;
  rpcUrl: string;
  blockExplorerUrl: string;
  logo: string;
  color: string;
  decimals: number;
  rpcUrls?: string[];
  blockExplorerUrls?: string[];
  iconUrl?: string;
  avgGasPrice?: string;
  avgBlockTime?: string;
}

// 支持的链配置
export const SUPPORTED_CHAINS: Record<string, ChainInfo> = {
  ethereum: {
    chainId: '1',
    chainName: 'Ethereum',
    symbol: 'ETH',
    rpcUrl: 'https://eth.llamarpc.com',
    blockExplorerUrl: 'https://etherscan.io',
    logo: '🔷',
    color: '#627EEA',
    decimals: 18,
    rpcUrls: ['https://eth.llamarpc.com', 'https://rpc.ankr.com/eth'],
    blockExplorerUrls: ['https://etherscan.io'],
    iconUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png',
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
    rpcUrls: ['https://bsc-dataseed.binance.org', 'https://rpc.ankr.com/bsc'],
    blockExplorerUrls: ['https://bscscan.com'],
    iconUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/binance/info/logo.png',
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
    rpcUrls: ['https://polygon-rpc.com', 'https://rpc.ankr.com/polygon'],
    blockExplorerUrls: ['https://polygonscan.com'],
    iconUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/info/logo.png',
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
    rpcUrls: ['https://arb1.arbitrum.io/rpc', 'https://rpc.ankr.com/arbitrum'],
    blockExplorerUrls: ['https://arbiscan.io'],
    iconUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/arbitrum/info/logo.png',
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
    rpcUrls: ['https://mainnet.optimism.io', 'https://rpc.ankr.com/optimism'],
    blockExplorerUrls: ['https://optimistic.etherscan.io'],
    iconUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/optimism/info/logo.png',
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
    rpcUrls: ['https://rpc.sepolia.org'],
    blockExplorerUrls: ['https://sepolia.etherscan.io'],
    iconUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png',
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
    rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545'],
    blockExplorerUrls: ['https://testnet.bscscan.com'],
    iconUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/binance/info/logo.png',
    avgGasPrice: '3',
    avgBlockTime: '3s',
  },
} as const;

export type ChainType = keyof typeof SUPPORTED_CHAINS;

// Nonce 存储键
const NONCE_STORAGE_KEY = 'wallet_nonce';
const CHAIN_STORAGE_KEY = 'selected_chain';

// 生成随机 Nonce
export function generateNonce(): string {
  const array = new Uint8Array(16);
  for (let i = 0; i < array.length; i++) {
    array[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// 存储 Nonce
export async function storeNonce(address: string, nonce: string): Promise<void> {
  await AsyncStorage.setItem(`${NONCE_STORAGE_KEY}_${address.toLowerCase()}`, nonce);
}

// 获取 Nonce
export async function getNonce(address: string): Promise<string | null> {
  return await AsyncStorage.getItem(`${NONCE_STORAGE_KEY}_${address.toLowerCase()}`);
}

// 删除 Nonce
export async function clearNonce(address: string): Promise<void> {
  await AsyncStorage.removeItem(`${NONCE_STORAGE_KEY}_${address.toLowerCase()}`);
}

// 存储选择的链
export async function storeSelectedChain(chain: ChainType): Promise<void> {
  await AsyncStorage.setItem(CHAIN_STORAGE_KEY, chain);
}

// 获取选择的链
export async function getSelectedChain(): Promise<ChainType> {
  const chain = await AsyncStorage.getItem(CHAIN_STORAGE_KEY);
  return (chain as ChainType) || 'ethereum';
}

// 检查 MetaMask 是否安装
export function isMetaMaskInstalled(): boolean {
  // 在 React Native 中无法直接检测，只能尝试连接
  return true;
}

// 生成签名消息
export function generateSignMessage(address: string, nonce: string): string {
  return `Welcome to KAIROS DAPP!\n\nWallet: ${address}\nNonce: ${nonce}\n\nSign this message to verify your ownership.`;
}

// 解析签名结果
export function parseSignature(signature: string): {
  v: number;
  r: string;
  s: string;
} | null {
  if (!signature || signature.length !== 132) {
    return null;
  }
  
  try {
    return {
      v: parseInt(signature.slice(-2), 16),
      r: '0x' + signature.slice(2, 66),
      s: '0x' + signature.slice(66, 130),
    };
  } catch {
    return null;
  }
}

// 验证地址格式
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

// 格式化地址显示
export function formatAddress(address: string, start = 6, end = 4): string {
  if (!address || address.length < start + end) return address;
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}

// 格式化余额
export function formatBalance(balance: string | number, decimals = 4): string {
  const num = typeof balance === 'string' ? parseFloat(balance) : balance;
  if (isNaN(num)) return '0';
  if (num === 0) return '0';
  if (num < 0.0001) return '<0.0001';
  if (num < 1) return num.toFixed(6);
  if (num < 1000) return num.toFixed(decimals);
  if (num < 1000000) return (num / 1000).toFixed(2) + 'K';
  return (num / 1000000).toFixed(2) + 'M';
}

// 获取区块浏览器链接
export function getExplorerUrl(chain: ChainType, type: 'tx' | 'address', hash: string): string {
  const explorer = SUPPORTED_CHAINS[chain].blockExplorerUrl;
  return `${explorer}/${type}/${hash}`;
}

// 打开 MetaMask
export async function openMetaMask(): Promise<void> {
  try {
    const url = `${METAMASK_UNIVERSAL_LINK}/connect`;
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      // 如果无法打开，提示用户安装
      Alert.alert(
        'MetaMask 未安装',
        '请先安装 MetaMask 钱包',
        [{ text: '确定' }]
      );
    }
  } catch (error) {
    console.error('Failed to open MetaMask:', error);
    throw error;
  }
}

// 切换网络
export async function switchChain(chainId: string): Promise<boolean> {
  const chainHex = '0x' + parseInt(chainId).toString(16);
  
  try {
    // 尝试通过 window.ethereum 请求切换网络
    // 在 React Native 中需要通过 deeplink
    const url = `metamask://switch?chainId=${chainHex}`;
    const canOpen = await Linking.canOpenURL(url);
    
    if (canOpen) {
      await Linking.openURL(url);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Failed to switch chain:', error);
    return false;
  }
}

// 添加自定义网络
export async function addNetwork(network: ChainInfo): Promise<boolean> {
  try {
    const params = {
      chainId: network.chainId,
      chainName: network.chainName,
      nativeCurrency: {
        name: network.symbol,
        symbol: network.symbol,
        decimals: network.decimals || 18,
      },
      rpcUrls: network.rpcUrls || [network.rpcUrl],
      blockExplorerUrls: network.blockExplorerUrls || [network.blockExplorerUrl],
    };
    
    const url = `metamask://addEthereumChain?chainId=${params.chainId}&rpcUrl=${encodeURIComponent(params.rpcUrls[0])}`;
    const canOpen = await Linking.canOpenURL(url);
    
    if (canOpen) {
      await Linking.openURL(url);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Failed to add network:', error);
    return false;
  }
}

// 获取链信息
export function getChainInfo(chain: ChainType): ChainInfo {
  return SUPPORTED_CHAINS[chain];
}

// 获取所有链列表
export function getAllChains(): { key: ChainType; info: ChainInfo }[] {
  return Object.entries(SUPPORTED_CHAINS).map(([key, info]) => ({
    key: key as ChainType,
    info: info as ChainInfo,
  }));
}

// 获取主网列表（排除测试网）
export function getMainnetChains(): { key: ChainType; info: ChainInfo }[] {
  return getAllChains().filter(c => !c.key.includes('testnet'));
}

// 获取测试网列表
export function getTestnetChains(): { key: ChainType; info: ChainInfo }[] {
  return getAllChains().filter(c => c.key.includes('testnet'));
}

// 导出常量
export const METAMASK_DEEP_LINK = METAMASK_UNIVERSAL_LINK;

// 导出链类型列表
export const CHAIN_LIST = Object.keys(SUPPORTED_CHAINS) as ChainType[];

// 链 ID 到链类型的映射
export const CHAIN_ID_TO_TYPE: Record<string, ChainType> = Object.entries(SUPPORTED_CHAINS).reduce(
  (acc, [key, info]) => {
    acc[info.chainId] = key as ChainType;
    return acc;
  },
  {} as Record<string, ChainType>
);

// 链类型到链 ID 的映射
export const CHAIN_TYPE_TO_ID: Record<ChainType, string> = Object.entries(SUPPORTED_CHAINS).reduce(
  (acc, [key, info]) => {
    acc[key as ChainType] = info.chainId;
    return acc;
  },
  {} as Record<ChainType, string>
);
