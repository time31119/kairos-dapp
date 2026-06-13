/**
 * WalletConnect QR 码连接组件
 * 显示连接 QR 码，支持复制链接和打开钱包
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Share,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { FontAwesome6 } from '@expo/vector-icons';

// 颜色主题
const colors = {
  background: '#0A0A0F',
  card: '#12121A',
  border: '#1F1F2E',
  text: '#FFFFFF',
  textSecondary: '#9CA3AF',
  neonCyan: '#00F0FF',
  neonPurple: '#BF00FF',
  success: '#10B981',
};

interface WalletConnectQRProps {
  visible: boolean;
  uri: string;
  onClose: () => void;
  onUriChange?: (uri: string) => void;
}

export default function WalletConnectQR({
  visible,
  uri,
  onClose,
  onUriChange,
}: WalletConnectQRProps) {
  const [manualUri, setManualUri] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);

  // 复制链接
  const handleCopyLink = async () => {
    try {
      await Share.share({
        message: uri,
        title: 'WalletConnect Link',
      });
    } catch (error) {
      Alert.alert('复制失败', '无法复制链接到剪贴板');
    }
  };

  // 手动输入 URI（用于钱包扫描）
  const handleManualSubmit = () => {
    if (manualUri.trim() && onUriChange) {
      onUriChange(manualUri.trim());
      setManualUri('');
      setShowManualInput(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.overlay}>
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>WalletConnect</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Subtitle */}
            <Text style={styles.subtitle}>
              使用 WalletConnect 钱包扫描二维码连接
            </Text>

            {/* QR Code */}
            <View style={styles.qrContainer}>
              <View style={styles.qrWrapper}>
                <QRCode
                  value={uri}
                  size={200}
                  backgroundColor={colors.card}
                  color={colors.text}
                />
              </View>
              
              {/* Glow effect */}
              <View style={styles.qrGlow} />
            </View>

            {/* Instructions */}
            <View style={styles.instructions}>
              <View style={styles.stepRow}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepText}>1</Text>
                </View>
                <Text style={styles.stepDesc}>打开 WalletConnect 兼容钱包</Text>
              </View>
              <View style={styles.stepRow}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepText}>2</Text>
                </View>
                <Text style={styles.stepDesc}>扫描上方二维码或复制链接</Text>
              </View>
              <View style={styles.stepRow}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepText}>3</Text>
                </View>
                <Text style={styles.stepDesc}>在钱包中确认连接</Text>
              </View>
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleCopyLink}
              >
                <FontAwesome6 name="copy" size={16} color={colors.neonCyan} />
                <Text style={styles.actionText}>复制链接</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.actionButtonSecondary]}
                onPress={() => setShowManualInput(!showManualInput)}
              >
                <FontAwesome6 name="keyboard" size={16} color={colors.neonPurple} />
                <Text style={[styles.actionText, styles.actionTextSecondary]}>
                  手动输入
                </Text>
              </TouchableOpacity>
            </View>

            {/* Manual Input */}
            {showManualInput && (
              <View style={styles.manualInput}>
                <Text style={styles.manualLabel}>粘贴 WalletConnect URI</Text>
                <TextInput
                  style={styles.input}
                  value={manualUri}
                  onChangeText={setManualUri}
                  placeholder="wc:..."
                  placeholderTextColor={colors.textSecondary}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleManualSubmit}
                >
                  <Text style={styles.submitText}>确认</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Supported Wallets */}
            <View style={styles.wallets}>
              <Text style={styles.walletsTitle}>支持的WalletConnect钱包</Text>
              <View style={styles.walletList}>
                <Text style={styles.walletName}>MetaMask</Text>
                <Text style={styles.walletName}>Trust Wallet</Text>
                <Text style={styles.walletName}>Rainbow</Text>
                <Text style={styles.walletName}>Coinbase</Text>
                <Text style={styles.walletName}>更多...</Text>
              </View>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: colors.background,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  qrWrapper: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  qrGlow: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: colors.neonCyan,
    opacity: 0.1,
    filter: 'blur(40px)',
  },
  instructions: {
    marginBottom: 24,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.neonCyan + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepText: {
    color: colors.neonCyan,
    fontSize: 12,
    fontWeight: '600',
  },
  stepDesc: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.neonCyan + '40',
  },
  actionButtonSecondary: {
    borderColor: colors.neonPurple + '40',
  },
  actionText: {
    color: colors.neonCyan,
    fontSize: 14,
    fontWeight: '600',
  },
  actionTextSecondary: {
    color: colors.neonPurple,
  },
  manualInput: {
    marginBottom: 24,
  },
  manualLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    color: colors.text,
    fontSize: 14,
    marginBottom: 12,
  },
  submitButton: {
    backgroundColor: colors.neonCyan,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitText: {
    color: colors.background,
    fontSize: 14,
    fontWeight: '600',
  },
  wallets: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 16,
  },
  walletsTitle: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: 12,
  },
  walletList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  walletName: {
    color: colors.text,
    fontSize: 12,
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
});
