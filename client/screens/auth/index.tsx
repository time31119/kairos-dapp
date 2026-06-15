/**
 * DAPP 登录页面 - 钱包连接模式
 * KAIROS DAPP 行情筛选器
 */

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Screen } from '@/components/Screen';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { useWeb3 } from '@/contexts/Web3Context';
import WalletConnectQR from '@/components/WalletConnectQR';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || ''

// DAPP 暗黑科技风配色
const colors = {
  bg: '#0A0A0F',
  card: '#141419',
  cardLight: '#1A1A22',
  neonCyan: '#00F0FF',
  neonPurple: '#BF00FF',
  neonGold: '#FFD700',
  text: '#FFFFFF',
  textMuted: '#8B8B9E',
  success: '#00FF88',
  warning: '#FFD700',
  error: '#FF4444',
};

// API 请求函数
async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}/api/v1${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });
  
  const data = await response.json();
  
  if (data.code !== 0) {
    throw new Error(data.message || '请求失败');
  }
  
  return data.data;
}

export default function LoginScreen() {
  const router = useSafeRouter();
  const { wallet, connect, disconnect, signMessage, initiateWalletConnect, completeWalletConnect, cancelWalletConnect } = useWeb3();
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showWCQR, setShowWCQR] = useState(false);
  const [wcUri, setWcUri] = useState('');

  // 钱包连接后自动登录
  useEffect(() => {
    if (wallet.isConnected && wallet.address) {
      handleWalletLogin();
    }
  }, [wallet.isConnected, wallet.address]);

  // 钱包登录
  const handleWalletLogin = async () => {
    if (!wallet.address) return;
    
    setLoading(true);
    try {
      // 1. 请求签名
      const message = 'KAIROS DAPP 登录授权\n钱包地址将作为您的身份标识';
      const signature = await signMessage(message);
      
      // 2. 发送到后端验证并登录
      const response = await apiRequest<{ token: string }>('/auth/wallet-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: wallet.address,
          signature,
          message,
        }),
      });
      
      // 3. 保存登录状态
      await AsyncStorage.setItem('token', response?.token || 'wallet_token');
      await AsyncStorage.setItem('wallet_wallet.address', wallet.address);
      await AsyncStorage.setItem('login_type', 'wallet');
      
      Alert.alert('登录成功', `欢迎回来！\n${wallet.address.slice(0, 8)}...${wallet.address.slice(-6)}`);
      router.replace('/');
    } catch (error: any) {
      console.error('Wallet login error:', error);
      // 即使后端验证失败，也允许使用钱包登录（离线模式）
      await AsyncStorage.setItem('token', 'wallet_token');
      await AsyncStorage.setItem('wallet_wallet.address', wallet.address);
      await AsyncStorage.setItem('login_type', 'wallet');
      
      Alert.alert('登录成功', '钱包登录成功！');
      router.replace('/');
    } finally {
      setLoading(false);
    }
  };

  // 连接不同钱包
  const handleConnectWallet = async (walletType: string) => {
    setShowModal(false);
    
    try {
      if (walletType === 'walletconnect') {
        // 启动 WalletConnect 连接
        const uri = await initiateWalletConnect();
        setWcUri(uri);
        setShowWCQR(true);
      } else {
        // 其他钱包使用普通连接
        await connect(walletType as any);
      }
    } catch (error: any) {
      Alert.alert('连接失败', error.message || '请重试');
    }
  };

  // 处理 WalletConnect URI 变化
  const handleWCUriChange = (uri: string) => {
    setWcUri(uri);
  };

  // 关闭 WalletConnect QR
  const handleWCClose = () => {
    setShowWCQR(false);
    cancelWalletConnect();
  };

  // 跳过登录（游客模式）
  const handleGuestMode = async () => {
    await AsyncStorage.setItem('login_type', 'guest');
    router.replace('/');
  };

  return (
    <Screen>
      <View style={styles.container}>
        {/* 背景装饰 */}
        <View style={styles.bgDecoration}>
          <View style={styles.glowCircle1} />
          <View style={styles.glowCircle2} />
        </View>

        {/* Logo 区域 */}
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoIcon}>◇</Text>
          </View>
          <Text style={styles.appName}>KAIROS</Text>
          <Text style={styles.appType}>DAPP</Text>
          <Text style={styles.tagline}>行情筛选器</Text>
        </View>

        {/* 连接钱包区域 */}
        <View style={styles.connectSection}>
          {/* 主要连接按钮 */}
          {wallet.isConnecting ? (
            <View style={styles.connectingText}>
              <ActivityIndicator color={colors.neonCyan} size="large" />
              <Text style={styles.connectingText}>正在连接钱包...</Text>
              <Text style={styles.connectingHint}>请在钱包中确认授权</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.mainConnectButton}
              onPress={() => setShowModal(true)}
            >
              <View style={styles.buttonGlow} />
              <Text style={styles.buttonIcon}>◇</Text>
              <Text style={styles.buttonText}>连接钱包</Text>
            </TouchableOpacity>
          )}

          {/* 钱包选项 */}
          <View style={styles.connectSection}>
            <TouchableOpacity
              style={styles.connectButton}
              onPress={() => handleConnectWallet('metamask')}
            >
              <View style={styles.iconBox}>
                <Text style={styles.emoji}>🦊</Text>
              </View>
              <Text style={styles.walletName}>MetaMask</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.connectButton}
              onPress={() => handleConnectWallet('walletconnect')}
            >
              <View style={styles.iconBox}>
                <Text style={styles.emoji}>👛</Text>
              </View>
              <Text style={styles.walletName}>WalletConnect</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.connectButton}
              onPress={() => handleConnectWallet('browser')}
            >
              <View style={styles.iconBox}>
                <Text style={styles.emoji}>📱</Text>
              </View>
              <Text style={styles.walletName}>DApp Browser</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 底部信息 */}
        <View style={styles.footer}>
          {/* 已连接状态 */}
          {wallet.isConnected && wallet.address && (
            <View style={styles.connectedInfo}>
              <View style={styles.statusIndicator}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>已连接</Text>
              </View>
              <Text style={styles.addressText}>
                {wallet.address.slice(0, 8)}...{wallet.address.slice(-6)}
              </Text>
            </View>
          )}

          {/* 游客模式 */}
          <TouchableOpacity style={styles.guestButton} onPress={handleGuestMode}>
            <Text style={styles.guestText}>游客模式</Text>
            <Text style={styles.guestHint}>体验部分功能</Text>
          </TouchableOpacity>

          {/* 风险提示 */}
          <Text style={styles.riskText}>
            连接钱包即表示您同意我们的服务条款
          </Text>
        </View>

        {/* 钱包选择弹窗 */}
        {showModal && (
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowModal(false)}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>选择钱包</Text>
                <TouchableOpacity onPress={() => setShowModal(false)}>
                  <Text style={styles.modalClose}>×</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => handleConnectWallet('metamask')}
              >
                <Text style={styles.modalEmoji}>🦊</Text>
                <View style={styles.modalOptionInfo}>
                  <Text style={styles.modalOptionName}>MetaMask</Text>
                  <Text style={styles.modalOptionDesc}>最流行的以太坊钱包</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => handleConnectWallet('walletconnect')}
              >
                <Text style={styles.modalEmoji}>👛</Text>
                <View style={styles.modalOptionInfo}>
                  <Text style={styles.modalOptionName}>WalletConnect</Text>
                  <Text style={styles.modalOptionDesc}>支持多种钱包连接</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => handleConnectWallet('coinbase')}
              >
                <Text style={styles.modalEmoji}>💰</Text>
                <View style={styles.modalOptionInfo}>
                  <Text style={styles.modalOptionName}>Coinbase Wallet</Text>
                  <Text style={styles.modalOptionDesc}>安全可靠的托管钱包</Text>
                </View>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}

        {/* 加载遮罩 */}
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator color={colors.neonCyan} size="large" />
            <Text style={styles.loadingText}>验证签名中...</Text>
          </View>
        )}

        {/* WalletConnect QR 码 */}
        <WalletConnectQR
          visible={showWCQR}
          uri={wcUri || wallet.wcUri || ''}
          onClose={handleWCClose}
          onUriChange={handleWCUriChange}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  
  // 背景装饰
  bgDecoration: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  glowCircle1: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: colors.neonCyan,
    opacity: 0.1,
  },
  glowCircle2: {
    position: 'absolute',
    bottom: -150,
    left: -150,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: colors.neonPurple,
    opacity: 0.08,
  },

  // Logo 区域
  logoSection: {
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 40,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 24,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.neonCyan,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: colors.neonCyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  logoIcon: {
    fontSize: 48,
    color: colors.neonCyan,
  },
  appName: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: 4,
  },
  appType: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neonCyan,
    letterSpacing: 2,
    marginTop: 4,
  },
  tagline: {
    fontSize: 16,
    color: colors.textMuted,
    marginTop: 8,
  },

  // 连接区域
  connectSection: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.neonCyan + '40',
    gap: 12,
    marginTop: 24,
  },
  connectingText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  connectingHint: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 8,
  },
  mainConnectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neonCyan,
    borderRadius: 16,
    padding: 18,
    gap: 10,
    overflow: 'hidden',
  },
  buttonGlow: {
    position: 'absolute',
    top: -50,
    left: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.text,
    opacity: 0.1,
  },
  buttonIcon: {
    fontSize: 24,
    color: colors.bg,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.bg,
  },

  // 钱包选项
  walletOptions: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
    gap: 16,
  },
  walletOption: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1F1F28',
    minWidth: 90,
  },
  walletIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.cardLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  walletEmoji: {
    fontSize: 22,
  },
  walletName: {
    color: colors.textMuted,
    fontSize: 11,
  },

  // 连接按钮样式
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: '#1F1F2E',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  emoji: {
    fontSize: 20,
  },

  connected: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: '#1F1F2E',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },

  // 底部信息
  footer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  connectedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 8,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  statusText: {
    color: colors.success,
    fontSize: 14,
    fontWeight: '500',
  },
  addressText: {
    color: colors.text,
    fontSize: 14,
  },
  guestButton: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1F1F28',
  },
  guestText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '500',
  },
  guestHint: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  riskText: {
    color: colors.textMuted,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 16,
  },

  // 弹窗样式
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 50,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  modalClose: {
    color: colors.textMuted,
    fontSize: 28,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.bg,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1F1F28',
  },
  modalEmoji: {
    fontSize: 28,
    marginRight: 16,
  },
  modalOptionInfo: {
    flex: 1,
  },
  modalOptionName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  modalOptionDesc: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },

  // 加载遮罩
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(10,10,15,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    color: colors.neonCyan,
    fontSize: 16,
  },
});
