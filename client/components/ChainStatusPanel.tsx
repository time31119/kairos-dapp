/**
 * 多链状态面板组件
 * 展示所有支持链的实时状态（Gas 价格、区块高度等）
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { getAllChains, getChainInfo, type ChainType } from '@/services/metamask';
import { getChainStatus, type ChainStatus } from '@/services/web3';

interface ChainStatusPanelProps {
  visible: boolean;
  currentChain: ChainType;
  onClose: () => void;
  onSelectChain: (chain: ChainType) => void;
}

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
  warning: '#F59E0B',
  error: '#EF4444',
};

export default function ChainStatusPanel({
  visible,
  currentChain,
  onClose,
  onSelectChain,
}: ChainStatusPanelProps) {
  const [refreshing, setRefreshing] = useState(false);
  const [chainStatuses, setChainStatuses] = useState<Record<ChainType, ChainStatus | null>>({} as any);
  const [loading, setLoading] = useState(true);

  // 加载链状态
  const loadChainStatuses = async () => {
    setLoading(true);
    try {
      const chains = getAllChains();
      const statuses: Record<string, ChainStatus | null> = {};

      // 并行加载所有链状态
      await Promise.all(
        chains.map(async (chain) => {
          try {
            const status = await getChainStatus(chain.key);
            statuses[chain.key] = status;
          } catch (error) {
            statuses[chain.key] = null;
          }
        })
      );

      setChainStatuses(statuses as Record<ChainType, ChainStatus | null>);
    } catch (error) {
      console.error('Failed to load chain statuses:', error);
    } finally {
      setLoading(false);
    }
  };

  // 首次加载和刷新
  useEffect(() => {
    if (visible) {
      loadChainStatuses();
    }
  }, [visible]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadChainStatuses();
    setRefreshing(false);
  };

  // 主网列表
  const mainnetChains = getAllChains().filter(c => !c.key.includes('testnet'));
  // 测试网列表
  const testnetChains = getAllChains().filter(c => c.key.includes('testnet'));

  const renderChainItem = (chainKey: ChainType, info: any) => {
    const status = chainStatuses[chainKey];
    const isSelected = currentChain === chainKey;
    const isOnline = status?.isOnline ?? false;

    return (
      <TouchableOpacity
        key={chainKey}
        style={[
          styles.chainItem,
          isSelected && styles.chainItemSelected,
        ]}
        onPress={() => {
          onSelectChain(chainKey);
          onClose();
        }}
        activeOpacity={0.7}
      >
        <View style={styles.chainHeader}>
          <View style={styles.chainLeft}>
            <View style={[styles.chainLogo, { backgroundColor: info.color + '20' }]}>
              <Text style={styles.chainLogoText}>{info.logo}</Text>
            </View>
            <View style={styles.chainInfo}>
              <Text style={styles.chainName}>{info.chainName}</Text>
              <Text style={styles.chainSymbol}>{info.symbol}</Text>
            </View>
          </View>
          <View style={styles.chainRight}>
            {isSelected && (
              <View style={styles.selectedBadge}>
                <Text style={styles.selectedText}>已选</Text>
              </View>
            )}
            <View style={[styles.statusDot, { backgroundColor: isOnline ? colors.success : colors.error }]} />
          </View>
        </View>

        {status && isOnline && (
          <View style={styles.chainStats}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Gas</Text>
              <Text style={styles.statValue}>{status.gasPrice} Gwei</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>区块</Text>
              <Text style={styles.statValue}>
                {status.blockNumber > 0 ? `#${status.blockNumber.toLocaleString()}` : '-'}
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>延迟</Text>
              <Text style={styles.statValue}>{status.latency}ms</Text>
            </View>
          </View>
        )}

        {!status && (
          <View style={styles.chainStats}>
            <Text style={styles.offlineText}>离线</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>切换网络</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Status Bar */}
          <View style={styles.statusBar}>
            <View style={styles.statusItem}>
              <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
              <Text style={styles.statusText}>
                {Object.values(chainStatuses).filter((s: any) => s?.isOnline).length}/{getAllChains().length} 在线
              </Text>
            </View>
            {refreshing && (
              <ActivityIndicator size="small" color={colors.neonCyan} />
            )}
          </View>

          {/* Chain List */}
          <ScrollView
            style={styles.chainList}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.neonCyan}
              />
            }
          >
            {loading && !refreshing ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.neonCyan} />
                <Text style={styles.loadingText}>加载中...</Text>
              </View>
            ) : (
              <>
                {/* Mainnets */}
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>主网</Text>
                </View>
                {mainnetChains.map((chain) => (
                  renderChainItem(chain.key, chain.info)
                ))}

                {/* Testnets */}
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>测试网</Text>
                </View>
                {testnetChains.map((chain) => (
                  renderChainItem(chain.key, chain.info)
                ))}
              </>
            )}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <FontAwesome6 name="info-circle" size={14} color={colors.textSecondary} />
            <Text style={styles.footerText}>
              数据由各链 RPC 节点实时提供
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 20,
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
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  chainList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    color: colors.textSecondary,
    marginTop: 12,
  },
  sectionHeader: {
    paddingVertical: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  chainItem: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chainItemSelected: {
    borderColor: colors.neonCyan,
  },
  chainHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chainLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  chainLogo: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chainLogoText: {
    fontSize: 20,
  },
  chainInfo: {
    gap: 2,
  },
  chainName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  chainSymbol: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  chainRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectedBadge: {
    backgroundColor: colors.neonCyan + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  selectedText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.neonCyan,
  },
  chainStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: colors.border,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  offlineText: {
    fontSize: 13,
    color: colors.error,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
