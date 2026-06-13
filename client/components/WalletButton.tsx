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
  const { address, shortAddress, balance, isConnected, isConnecting, connect, disconnect } = useWeb3();

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
  if (isConnected) {
    return (
      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.card, borderColor: colors.neonCyan }]}
        onPress={disconnect}
      >
        <View style={styles.connectedInfo}>
          {/* 状态指示灯 */}
          <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
          
          {/* 地址 */}
          <Text style={[styles.addressText, { fontSize: sizeStyle.fontSize }]}>
            {shortAddress}
          </Text>
        </View>
        
        {/* 余额 */}
        {showBalance && (
          <Text style={[styles.balanceText, { fontSize: sizeStyle.fontSize - 2 }]}>
            {balance} ETH
          </Text>
        )}
        
        {/* 断开图标 */}
        <Text style={styles.disconnectIcon}>×</Text>
      </TouchableOpacity>
    );
  }

  // 连接中状态
  if (isConnecting) {
    return (
      <View style={[styles.button, styles.connectingButton]}>
        <ActivityIndicator color={colors.neonCyan} size="small" />
        <Text style={[styles.connectingText, { fontSize: sizeStyle.fontSize }]}>
          连接中...
        </Text>
      </View>
    );
  }

  // 未连接状态 - 连接钱包按钮
  return (
    <TouchableOpacity
      style={[
        styles.button,
        styles.connectButton,
        { paddingVertical: sizeStyle.paddingVertical, paddingHorizontal: sizeStyle.paddingHorizontal }
      ]}
      onPress={connect}
    >
      <Text style={styles.walletIcon}>◇</Text>
      <Text style={[styles.connectText, { fontSize: sizeStyle.fontSize }]}>
        连接钱包
      </Text>
    </TouchableOpacity>
  );
}

// 全屏钱包连接弹窗
export function WalletConnectModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { connect, isConnecting } = useWeb3();

  if (!visible) return null;

  return (
    <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>连接钱包</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeIcon}>×</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.modalDesc}>
          选择一种钱包方式连接 DAPP
        </Text>

        {/* 钱包选项 */}
        <TouchableOpacity style={styles.walletOption} onPress={connect}>
          <View style={styles.walletOptionIcon}>
            <Text style={styles.walletEmoji}>🦊</Text>
          </View>
          <View style={styles.walletOptionInfo}>
            <Text style={styles.walletOptionName}>MetaMask</Text>
            <Text style={styles.walletOptionDesc}>连接浏览器钱包</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.walletOption} onPress={connect}>
          <View style={styles.walletOptionIcon}>
            <Text style={styles.walletEmoji}>👛</Text>
          </View>
          <View style={styles.walletOptionInfo}>
            <Text style={styles.walletOptionName}>WalletConnect</Text>
            <Text style={styles.walletOptionDesc}>扫描二维码连接</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.walletOption} onPress={connect}>
          <View style={styles.walletOptionIcon}>
            <Text style={styles.walletEmoji}>📱</Text>
          </View>
          <View style={styles.walletOptionInfo}>
            <Text style={styles.walletOptionName}>钱包内浏览器</Text>
            <Text style={styles.walletOptionDesc}>DApp Browser</Text>
          </View>
        </TouchableOpacity>

        {/* 风险提示 */}
        <View style={styles.riskNotice}>
          <Text style={styles.riskText}>
            连接钱包意味着您授权此应用访问您的资产。请确保来自可信来源。
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // 按钮基础样式
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
  },
  
  // 连接中样式
  connectingButton: {
    justifyContent: 'center',
    gap: 8,
  },
  connectingText: {
    color: colors.neonCyan,
    marginLeft: 4,
  },

  // 连接按钮样式
  connectButton: {
    backgroundColor: colors.neonCyan + '20',
    borderColor: colors.neonCyan,
    justifyContent: 'center',
    gap: 6,
  },
  walletIcon: {
    color: colors.neonCyan,
    fontSize: 16,
  },
  connectText: {
    color: colors.neonCyan,
    fontWeight: '600',
  },

  // 已连接样式
  connectedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  addressText: {
    color: colors.text,
    fontWeight: '500',
  },
  balanceText: {
    color: colors.textMuted,
    marginLeft: 8,
  },
  disconnectIcon: {
    color: colors.textMuted,
    fontSize: 18,
    marginLeft: 8,
  },

  // 弹窗样式
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  closeIcon: {
    color: colors.textMuted,
    fontSize: 28,
  },
  modalDesc: {
    color: colors.textMuted,
    fontSize: 14,
    marginBottom: 20,
  },

  // 钱包选项
  walletOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1F1F28',
  },
  walletOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  walletEmoji: {
    fontSize: 24,
  },
  walletOptionInfo: {
    flex: 1,
  },
  walletOptionName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  walletOptionDesc: {
    color: colors.textMuted,
    fontSize: 12,
  },

  // 风险提示
  riskNotice: {
    backgroundColor: colors.warning + '15',
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.warning + '30',
  },
  riskText: {
    color: colors.warning,
    fontSize: 12,
    lineHeight: 18,
  },
});

export default WalletButton;
