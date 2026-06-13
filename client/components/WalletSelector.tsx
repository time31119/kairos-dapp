/**
 * 钱包选择组件
 * 支持 MetaMask、WalletConnect 等多种钱包
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';

// 钱包类型
export type WalletType = 'metamask' | 'walletconnect' | 'coinbase' | 'trust' | 'phantom';

// 钱包配置
export const WALLET_CONFIG: Record<WalletType, {
  name: string;
  icon: string;
  description: string;
  color: string;
}> = {
  metamask: {
    name: 'MetaMask',
    icon: '🦊',
    description: '最受欢迎的以太坊钱包',
    color: '#F6851B',
  },
  walletconnect: {
    name: 'WalletConnect',
    icon: '🔗',
    description: '连接 300+ 钱包',
    color: '#3B99FC',
  },
  coinbase: {
    name: 'Coinbase Wallet',
    icon: '💰',
    description: '安全可靠的加密钱包',
    color: '#0052FF',
  },
  trust: {
    name: 'Trust Wallet',
    icon: '👛',
    description: '移动端首选钱包',
    color: '#3375BB',
  },
  phantom: {
    name: 'Phantom',
    icon: '👻',
    description: 'Solana 生态钱包',
    color: '#AB9FF2',
  },
};

interface WalletSelectorProps {
  visible: boolean;
  onClose: () => void;
  onSelectWallet: (wallet: WalletType) => void;
}

export default function WalletSelector({
  visible,
  onClose,
  onSelectWallet,
}: WalletSelectorProps) {
  const [selectedWallet, setSelectedWallet] = useState<WalletType | null>(null);
  const [connecting, setConnecting] = useState(false);

  const handleConnect = async (wallet: WalletType) => {
    setSelectedWallet(wallet);
    setConnecting(true);
    
    try {
      // 触发连接
      await onSelectWallet(wallet);
    } catch (error) {
      console.error('Connection failed:', error);
    } finally {
      setConnecting(false);
      setSelectedWallet(null);
      onClose();
    }
  };

  const wallets: WalletType[] = ['metamask', 'walletconnect', 'coinbase', 'trust', 'phantom'];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>连接钱包</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Subtitle */}
          <Text style={styles.subtitle}>
            选择您想要连接的钱包
          </Text>

          {/* Wallet List */}
          <View style={styles.walletList}>
            {wallets.map((wallet) => (
              <TouchableOpacity
                key={wallet}
                style={[
                  styles.walletItem,
                  selectedWallet === wallet && styles.walletItemSelected,
                ]}
                onPress={() => handleConnect(wallet)}
                disabled={connecting}
                activeOpacity={0.7}
              >
                <View style={styles.walletLeft}>
                  <View style={styles.walletIconContainer}>
                    <Text style={styles.walletIcon}>
                      {WALLET_CONFIG[wallet].icon}
                    </Text>
                  </View>
                  <View style={styles.walletInfo}>
                    <Text style={styles.walletName}>
                      {WALLET_CONFIG[wallet].name}
                    </Text>
                    <Text style={styles.walletDesc}>
                      {WALLET_CONFIG[wallet].description}
                    </Text>
                  </View>
                </View>
                {selectedWallet === wallet && connecting ? (
                  <View style={styles.loadingContainer}>
                    <Text style={styles.connectingText}>连接中...</Text>
                  </View>
                ) : (
                  <View style={styles.arrowContainer}>
                    <Text style={styles.arrow}>›</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              连接前请确保您的钱包已解锁
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#0A0A0F',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    borderTopWidth: 1,
    borderColor: '#1F1F2E',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F2E',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1F1F2E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 16,
    color: '#6B7280',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 12,
    marginBottom: 20,
  },
  walletList: {
    gap: 12,
  },
  walletItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1A1A22',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1F1F2E',
  },
  walletItemSelected: {
    borderColor: '#00F0FF',
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
  },
  walletLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  walletIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0A0A0F',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: '#1F1F2E',
  },
  walletIcon: {
    fontSize: 24,
  },
  walletInfo: {
    flex: 1,
  },
  walletName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  walletDesc: {
    fontSize: 12,
    color: '#6B7280',
  },
  loadingContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#00F0FF',
    borderRadius: 8,
  },
  connectingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0A0A0F',
  },
  arrowContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    fontSize: 20,
    color: '#6B7280',
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#6B7280',
  },
});
