/**
 * WalletButton - DAPP 钱包连接按钮组件
 */
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { useWeb3 } from '@/contexts/Web3Context';

// DAPP 暗黑科技风配色
const colors = {
  bg: '#0A0A0F',
  card: '#141419',
  neonCyan: '#00F0FF',
  neonPurple: '#BF00FF',
  text: '#FFFFFF',
  textMuted: '#8B8B9E',
  success: '#00FF88',
  warning: '#FFD700',
};

interface WalletButtonProps {
  size?: 'small' | 'medium' | 'large';
  showBalance?: boolean;
}

export function WalletButton({ size = 'medium', showBalance = false }: WalletButtonProps) {
  const { wallet, connect, disconnect } = useWeb3();

  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return { paddingVertical: 8, paddingHorizontal: 12, fontSize: 12 };
      case 'large':
        return { paddingVertical: 16, paddingHorizontal: 24, fontSize: 16 };
      default:
        return { paddingVertical: 12, paddingHorizontal: 16, fontSize: 14 };
    }
  };

  const sizeStyle = getSizeStyle();

  // 已连接状态
  if (wallet.isConnected) {
    return (
      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.card, borderColor: colors.neonCyan }]}
        onPress={disconnect}
      >
        <View style={styles.connectedInfo}>
          {/* 状态指示灯 */}
          <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
          {/* 钱包地址 */}
          <Text style={[styles.address, { fontSize: sizeStyle.fontSize }]}>
            {wallet.address ? `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}` : ''}
          </Text>
        </View>
        {showBalance && (
          <Text style={[styles.balance, { fontSize: sizeStyle.fontSize }]}>
            {wallet.balance} ETH
          </Text>
        )}
      </TouchableOpacity>
    );
  }

  // 连接中状态
  if (wallet.isConnecting) {
    return (
      <TouchableOpacity style={[styles.button, styles.connecting]} disabled>
        <ActivityIndicator color={colors.neonCyan} size="small" />
        <Text style={styles.connectingText}>连接中...</Text>
      </TouchableOpacity>
    );
  }

  // 未连接状态
  return (
    <TouchableOpacity
      style={[styles.button, styles.connectButton]}
      onPress={() => connect('metamask')}
    >
      <Text style={styles.connectText}>连接钱包</Text>
    </TouchableOpacity>
  );
}

// 样式
const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  connectedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  address: {
    color: colors.text,
    fontFamily: 'monospace',
  },
  balance: {
    color: colors.textMuted,
    marginLeft: 12,
  },
  connecting: {
    backgroundColor: colors.card,
    borderColor: colors.neonCyan,
    justifyContent: 'center',
  },
  connectingText: {
    color: colors.neonCyan,
    marginLeft: 8,
    fontSize: 14,
  },
  connectButton: {
    backgroundColor: colors.neonCyan,
    borderColor: colors.neonCyan,
    justifyContent: 'center',
  },
  connectText: {
    color: colors.bg,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default WalletButton;
