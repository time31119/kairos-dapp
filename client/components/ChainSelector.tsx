/**
 * 链选择组件
 * 支持切换 Ethereum、BSC、Polygon、Arbitrum 等网络
 */

import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import {
  getAllChains,
  getChainInfo,
  type ChainType,
} from '@/services/metamask';

interface ChainSelectorProps {
  visible: boolean;
  currentChain: ChainType;
  onClose: () => void;
  onSelectChain: (chain: ChainType) => void;
}

export default function ChainSelector({
  visible,
  currentChain,
  onClose,
  onSelectChain,
}: ChainSelectorProps) {
  const chains = getAllChains();

  const handleSelect = async (chain: ChainType) => {
    onSelectChain(chain);
    onClose();
  };

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
            <Text style={styles.title}>切换网络</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Chain List */}
          <ScrollView style={styles.chainList} showsVerticalScrollIndicator={false}>
            {/* Mainnets */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>主网</Text>
            </View>
            {chains
              .filter(c => ['ethereum', 'bsc', 'polygon', 'arbitrum', 'optimism'].includes(c.key))
              .map((chain) => (
                <ChainItem
                  key={chain.key}
                  chain={chain.key}
                  isSelected={currentChain === chain.key}
                  onSelect={handleSelect}
                />
              ))}

            {/* Testnets */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>测试网</Text>
            </View>
            {chains
              .filter(c => ['sepolia', 'bscTestnet'].includes(c.key))
              .map((chain) => (
                <ChainItem
                  key={chain.key}
                  chain={chain.key}
                  isSelected={currentChain === chain.key}
                  onSelect={handleSelect}
                />
              ))}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              请确保您的钱包支持所选网络
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// 单个链选项组件
interface ChainItemProps {
  chain: ChainType;
  isSelected: boolean;
  onSelect: (chain: ChainType) => void;
}

function ChainItem({ chain, isSelected, onSelect }: ChainItemProps) {
  const info = getChainInfo(chain);

  return (
    <TouchableOpacity
      style={[
        styles.chainItem,
        isSelected && styles.chainItemSelected,
      ]}
      onPress={() => onSelect(chain)}
      activeOpacity={0.7}
    >
      <View style={styles.chainLeft}>
        {/* Chain Logo */}
        <View style={[styles.chainLogo, { borderColor: info.color }]}>
          <Text style={styles.chainLogoText}>{info.logo}</Text>
        </View>
        
        {/* Chain Info */}
        <View style={styles.chainInfo}>
          <Text style={styles.chainName}>{info.chainName}</Text>
          <Text style={styles.chainSymbol}>{info.symbol}</Text>
        </View>
      </View>

      {/* Selected Indicator */}
      {isSelected && (
        <View style={[styles.selectedIndicator, { backgroundColor: info.color }]}>
          <Text style={styles.checkmark}>✓</Text>
        </View>
      )}
    </TouchableOpacity>
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
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    maxHeight: '70%',
    borderTopWidth: 1,
    borderColor: '#1F1F2E',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
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
  chainList: {
    paddingHorizontal: 20,
  },
  sectionHeader: {
    paddingVertical: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  chainItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1A1A22',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#1F1F2E',
  },
  chainItemSelected: {
    borderColor: '#00F0FF',
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
  },
  chainLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  chainLogo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0A0A0F',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    borderWidth: 2,
  },
  chainLogoText: {
    fontSize: 20,
  },
  chainInfo: {
    flex: 1,
  },
  chainName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  chainSymbol: {
    fontSize: 12,
    color: '#6B7280',
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#1F1F2E',
    marginTop: 8,
  },
  footerText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
});
