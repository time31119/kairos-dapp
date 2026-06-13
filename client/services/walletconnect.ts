/**
 * WalletConnect 服务
 * 实现 WalletConnect v2 协议的钱包连接
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking, Alert } from 'react-native';

// WalletConnect 配置
const WALLETCONNECT_PROJECT_ID = 'YOUR_PROJECT_ID'; // 需要替换为实际的 Project ID
const WALLETCONNECT_RELAY_URL = 'relay.walletconnect.com';

// 支持的链 ID（十六进制）
export const WALLETCONNECT_CHAINS = {
  ethereum: '1',
  sepolia: '11155111',
  polygon: '137',
  bsc: '56',
  arbitrum: '42161',
  optimism: '10',
  bscTestnet: '97',
} as const;

export type WalletConnectChain = keyof typeof WALLETCONNECT_CHAINS;

// 存储键
const WC_SESSION_KEY = 'wc_session';
const WC_URI_KEY = 'wc_uri';

// Session 信息
export interface WCSession {
  topic: string;
  bridge: string;
  key: string;
  protocol: string;
  version: number;
  bridgeUrl: string;
  clientId: string;
  clientMeta: {
    name: string;
    description: string;
    url: string;
    icons: string[];
  };
  peerId: string;
  peerMeta: {
    name: string;
    description: string;
    url: string;
    icons: string[];
  };
  chainId?: number;
  accounts: string[];
  connected: boolean;
  handshakeId: string;
  handshakeTopic: string;
}

// 存储 Session
export async function storeWCSession(session: WCSession): Promise<void> {
  await AsyncStorage.setItem(WC_SESSION_KEY, JSON.stringify(session));
}

// 获取 Session
export async function getWCSession(): Promise<WCSession | null> {
  const data = await AsyncStorage.getItem(WC_SESSION_KEY);
  return data ? JSON.parse(data) : null;
}

// 清除 Session
export async function clearWCSession(): Promise<void> {
  await AsyncStorage.removeItem(WC_SESSION_KEY);
}

// 存储 WalletConnect URI
export async function storeWCUri(uri: string): Promise<void> {
  await AsyncStorage.setItem(WC_URI_KEY, uri);
}

// 获取 URI
export async function getWCUri(): Promise<string | null> {
  return await AsyncStorage.getItem(WC_URI_KEY);
}

// 清除 URI
export async function clearWCUri(): Promise<void> {
  await AsyncStorage.removeItem(WC_URI_KEY);
}

// 生成随机的客户端 ID
function generateClientId(): string {
  const chars = '0123456789abcdef';
  let id = '0x';
  for (let i = 0; i < 64; i++) {
    id += chars[Math.floor(Math.random() * 16)];
  }
  return id;
}

// 创建 WalletConnect URI（简化版，用于演示）
export function createWCUri(options: {
  bridge: string;
  topic: string;
  key: string;
  version?: number;
}): string {
  const { bridge, topic, key, version = 2 } = options;
  return `wc:${topic}@${version}?bridge=${encodeURIComponent(bridge)}&key=${key}`;
}

// 连接 WalletConnect
export async function connectWalletConnect(chain: WalletConnectChain = 'ethereum'): Promise<{
  uri: string;
  session: WCSession;
}> {
  const bridge = `https://${WALLETCONNECT_RELAY_URL}`;
  
  // 生成 session 数据
  const topic = generateClientId().substring(0, 32);
  const key = generateClientId();
  const uri = createWCUri({ bridge, topic, key });
  
  const session: WCSession = {
    topic,
    bridge,
    key,
    protocol: 'wc',
    version: 2,
    bridgeUrl: bridge,
    clientId: generateClientId(),
    clientMeta: {
      name: 'KAIROS DAPP',
      description: 'Crypto Screener DAPP',
      url: 'https://kairos.app',
      icons: ['https://kairos.app/icon.png'],
    },
    peerId: '',
    peerMeta: {
      name: '',
      description: '',
      url: '',
      icons: [],
    },
    chainId: parseInt(WALLETCONNECT_CHAINS[chain]),
    accounts: [],
    connected: false,
    handshakeId: '',
    handshakeTopic: topic,
  };

  // 存储 URI 和初始 session
  await storeWCUri(uri);
  await storeWCSession(session);

  return { uri, session };
}

// 解析 WalletConnect URI
export function parseWCUri(uri: string): {
  topic: string;
  version: number;
  bridge: string;
  key: string;
} | null {
  try {
    const match = uri.match(/wc:([^@]+)@(\d+)\?bridge=([^&]+)&key=([^&]+)/);
    if (match) {
      return {
        topic: match[1],
        version: parseInt(match[2]),
        bridge: decodeURIComponent(match[3]),
        key: match[4],
      };
    }
  } catch (error) {
    console.error('Failed to parse WC URI:', error);
  }
  return null;
}

// 深度链接到 WalletConnect 兼容钱包
export async function openWalletConnectWallet(uri: string): Promise<boolean> {
  // WalletConnect 支持的钱包 deep link
  const walletUrls = [
    { name: 'MetaMask', scheme: 'metamask://', url: 'metamask://wc?uri=' },
    { name: 'Trust Wallet', scheme: 'trust://', url: 'trust://wc?uri=' },
    { name: 'Rainbow', scheme: 'rainbow://', url: 'rainbow://wc?uri=' },
    { name: 'Coinbase', scheme: 'cbwallet://', url: 'cbwallet://wc?uri=' },
  ];

  // 尝试打开 WalletConnect 协议
  const wcDeepLink = `wc://uri?uri=${encodeURIComponent(uri)}`;
  
  try {
    const canOpen = await Linking.canOpenURL(wcDeepLink);
    if (canOpen) {
      await Linking.openURL(wcDeepLink);
      return true;
    }
  } catch (error) {
    console.error('Failed to open wallet:', error);
  }

  // 如果无法直接打开，显示提示
  Alert.alert(
    '连接钱包',
    '请使用 WalletConnect 兼容钱包扫描二维码或复制链接连接',
    [
      { text: '复制链接', onPress: () => {} },
      { text: '取消', style: 'cancel' },
    ]
  );

  return false;
}

// 检查是否有活跃的 WalletConnect Session
export async function hasActiveSession(): Promise<boolean> {
  const session = await getWCSession();
  return session !== null && session.connected;
}

// 断开 WalletConnect 连接
export async function disconnectWalletConnect(): Promise<void> {
  await clearWCSession();
  await clearWCUri();
}

// 获取当前连接的账户列表
export async function getConnectedAccounts(): Promise<string[]> {
  const session = await getWCSession();
  return session?.accounts || [];
}

// 获取当前链 ID
export async function getConnectedChainId(): Promise<number | null> {
  const session = await getWCSession();
  return session?.chainId || null;
}

// 切换链（需要钱包支持）
export async function switchChain(chainId: number): Promise<boolean> {
  const session = await getWCSession();
  if (!session) {
    return false;
  }

  // 发送链切换事件（通过 deep link）
  const switchUrl = `wc://switch?chainId=0x${chainId.toString(16)}`;
  
  try {
    await Linking.openURL(switchUrl);
    return true;
  } catch (error) {
    console.error('Failed to switch chain:', error);
    return false;
  }
}

// 签署消息请求（模拟）
export async function signMessage(message: string): Promise<string> {
  const session = await getWCSession();
  if (!session || !session.connected) {
    throw new Error('WalletConnect not connected');
  }

  // 在实际实现中，这里会发送签署请求到钱包
  // 返回模拟签名
  const mockSignature = '0x' + Array(130).fill('a').join('');
  return mockSignature;
}

// 发送交易请求（模拟）
export async function sendTransaction(params: {
  to: string;
  value?: string;
  data?: string;
}): Promise<string> {
  const session = await getWCSession();
  if (!session || !session.connected) {
    throw new Error('WalletConnect not connected');
  }

  // 在实际实现中，这里会发送交易请求到钱包
  // 返回模拟交易哈希
  const mockTxHash = '0x' + Array(64).fill('b').join('');
  return mockTxHash;
}

// 导出默认配置
export default {
  connectWalletConnect,
  disconnectWalletConnect,
  hasActiveSession,
  openWalletConnectWallet,
  getConnectedAccounts,
  getConnectedChainId,
  switchChain,
  signMessage,
  sendTransaction,
};
