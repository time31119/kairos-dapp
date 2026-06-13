/**
 * 智能合约交互组件
 * 支持读取合约数据、写入合约、执行交易
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { useWeb3 } from '@/contexts/Web3Context';
import { formatUnits, parseUnits } from 'ethers';
import {
  getTokenInfo,
  getTokenBalance,
  getDexPrice,
  CONTRACT_ADDRESSES,
  CONTRACT_ABIS,
  ContractResult,
} from '@/services/contracts';

interface TokenInfo {
  name: string;
  symbol: string;
  balance: string;
  formattedBalance: string;
}

interface ContractCallResult {
  method: string;
  result: any;
  timestamp: number;
}

// 颜色配置 - 暗黑科技风
const colors = {
  background: '#0A0A0F',
  card: '#141420',
  neonCyan: '#00F0FF',
  neonPurple: '#BF00FF',
  neonGreen: '#00FF88',
  neonYellow: '#FFD700',
  neonRed: '#FF3366',
  text: '#FFFFFF',
  textSecondary: '#8A8A9A',
  muted: '#4A4A5A',
  border: '#2A2A3A',
};

export default function ContractInteraction() {
  const { wallet, switchChain, signMessage } = useWeb3();

  // Token 查询状态
  const [tokenAddress, setTokenAddress] = useState('');
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [loadingToken, setLoadingToken] = useState(false);

  // DEX Pair 查询状态
  const [pairAddress, setPairAddress] = useState('');
  const [pairInfo, setPairInfo] = useState<any>(null);
  const [loadingPair, setLoadingPair] = useState(false);

  // 合约调用历史
  const [callHistory, setCallHistory] = useState<ContractCallResult[]>([]);

  // 快速操作
  const [quickToken, setQuickToken] = useState<'usdc' | 'usdt' | 'weth'>('usdc');

  // 获取快速查询代币
  const getQuickTokenAddress = () => {
    const addresses = CONTRACT_ADDRESSES[wallet.chain];
    switch (quickToken) {
      case 'usdc':
        return addresses.USDC;
      case 'usdt':
        return addresses.USDT;
      case 'weth':
        return addresses.WETH;
      default:
        return addresses.USDC;
    }
  };

  // 查询代币信息
  const queryTokenInfo = useCallback(async () => {
    const address = tokenAddress || getQuickTokenAddress();
    if (!address) return;

    setLoadingToken(true);
    try {
      const [infoResult, balanceResult] = await Promise.all([
        getTokenInfo(address, wallet.chain),
        wallet?.address
          ? getTokenBalance(address, wallet.address, wallet.chain)
          : Promise.resolve({ success: false }),
      ]);

      if (infoResult.success) {
        const balance = balanceResult.success ? (balanceResult as any).data : "0";
        const decimals = infoResult.data?.decimals || 18;
        const formattedBalance = formatUnits(balance || '0', decimals);

        setTokenInfo({
          name: (infoResult as any).data?.name,
          symbol: (infoResult as any).data?.symbol,
          balance: balance || '0',
          formattedBalance: formattedBalance,
        });

        addToHistory('getTokenInfo', infoResult.data);
      }
    } catch (error: any) {
      console.error('Token query error:', error);
      Alert.alert('查询失败', error.message);
    } finally {
      setLoadingToken(false);
    }
  }, [tokenAddress, quickToken, wallet.chain, wallet?.address]);

  // 查询 DEX Pair 信息
  const queryPairInfo = useCallback(async () => {
    if (!pairAddress) return;

    setLoadingPair(true);
    try {
      const result = await getDexPrice(pairAddress, wallet.chain);

      if (result.success) {
        setPairInfo(result.data);
        addToHistory('getPairInfo', result.data);
      }
    } catch (error: any) {
      console.error('Pair query error:', error);
      Alert.alert('查询失败', error.message);
    } finally {
      setLoadingPair(false);
    }
  }, [pairAddress, wallet.chain]);

  // 添加到历史记录
  const addToHistory = (method: string, result: any) => {
    setCallHistory((prev) => [
      { method, result, timestamp: Date.now() },
      ...prev.slice(0, 9), // 保留最近 10 条
    ]);
  };

  // 清除历史
  const clearHistory = () => {
    setCallHistory([]);
  };

  // 复制地址
  const copyAddress = (address: string) => {
    Alert.alert('地址已复制', address);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 头部信息 */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <FontAwesome6 name="code" size={24} color={colors.neonCyan} />
        </View>
        <View>
          <Text style={styles.headerTitle}>智能合约交互</Text>
          <Text style={styles.headerSubtitle}>Web3 DAPP 核心功能</Text>
        </View>
      </View>

      {/* 连接状态 */}
      {!wallet.isConnected && (
        <View style={styles.warningCard}>
          <FontAwesome6 name="exclamation-triangle" size={20} color={colors.neonYellow} />
          <Text style={styles.warningText}>请先连接钱包以进行合约交互</Text>
        </View>
      )}

      {/* 快速代币查询 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>快速代币查询</Text>

        <View style={styles.quickButtons}>
          {(['usdc', 'usdt', 'weth'] as const).map((token) => (
            <TouchableOpacity
              key={token}
              style={[
                styles.quickButton,
                quickToken === token && styles.quickButtonActive,
              ]}
              onPress={() => {
                setQuickToken(token);
                setTokenAddress('');
              }}
            >
              <Text
                style={[
                  styles.quickButtonText,
                  quickToken === token && styles.quickButtonTextActive,
                ]}
              >
                {token.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="或输入合约地址..."
            placeholderTextColor={colors.muted}
            value={tokenAddress}
            onChangeText={setTokenAddress}
          />
          <TouchableOpacity
            style={styles.queryButton}
            onPress={queryTokenInfo}
            disabled={loadingToken}
          >
            {loadingToken ? (
              <ActivityIndicator size="small" color={colors.neonCyan} />
            ) : (
              <FontAwesome6 name="search" size={18} color={colors.text} />
            )}
          </TouchableOpacity>
        </View>

        {tokenInfo && (
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <Text style={styles.tokenSymbol}>{tokenInfo.symbol}</Text>
              <Text style={styles.tokenName}>{tokenInfo.name}</Text>
            </View>
            <View style={styles.resultBody}>
              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>余额</Text>
                <Text style={styles.resultValue}>
                  {parseFloat(tokenInfo.formattedBalance).toLocaleString(undefined, {
                    maximumFractionDigits: 4,
                  })}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.copyButton}
                onPress={() => copyAddress(tokenAddress || getQuickTokenAddress())}
              >
                <FontAwesome6 name="copy" size={14} color={colors.neonCyan} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* DEX Pair 查询 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>DEX 交易对查询</Text>

        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="输入 Pair 合约地址..."
            placeholderTextColor={colors.muted}
            value={pairAddress}
            onChangeText={setPairAddress}
          />
          <TouchableOpacity
            style={styles.queryButton}
            onPress={queryPairInfo}
            disabled={loadingPair}
          >
            {loadingPair ? (
              <ActivityIndicator size="small" color={colors.neonCyan} />
            ) : (
              <FontAwesome6 name="search" size={18} color={colors.text} />
            )}
          </TouchableOpacity>
        </View>

        {pairInfo && (
          <View style={styles.resultCard}>
            <Text style={styles.pairTitle}>交易对信息</Text>
            <View style={styles.pairInfo}>
              <View style={styles.pairToken}>
                <View style={[styles.tokenDot, { backgroundColor: colors.neonCyan }]} />
                <Text style={styles.pairTokenText}>
                  {pairInfo.token0?.slice(0, 6)}...{pairInfo.token0?.slice(-4)}
                </Text>
              </View>
              <Text style={styles.pairSeparator}>⚡</Text>
              <View style={styles.pairToken}>
                <View style={[styles.tokenDot, { backgroundColor: colors.neonPurple }]} />
                <Text style={styles.pairTokenText}>
                  {pairInfo.token1?.slice(0, 6)}...{pairInfo.token1?.slice(-4)}
                </Text>
              </View>
            </View>
            <View style={styles.reserveInfo}>
              <View style={styles.reserveItem}>
                <Text style={styles.reserveLabel}>Reserve 0</Text>
                <Text style={styles.reserveValue}>
                  {parseFloat(pairInfo.reserve0).toLocaleString(undefined, {
                    maximumFractionDigits: 4,
                  })}
                </Text>
              </View>
              <View style={styles.reserveItem}>
                <Text style={styles.reserveLabel}>Reserve 1</Text>
                <Text style={styles.reserveValue}>
                  {parseFloat(pairInfo.reserve1).toLocaleString(undefined, {
                    maximumFractionDigits: 4,
                  })}
                </Text>
              </View>
            </View>
            <View style={styles.priceInfo}>
              <Text style={styles.priceLabel}>当前价格</Text>
              <Text style={styles.priceValue}>
                1 {pairInfo.token0?.slice(0, 6)} = {pairInfo.price?.toFixed(6)}{' '}
                {pairInfo.token1?.slice(0, 6)}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* 合约调用历史 */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>调用历史</Text>
          {callHistory.length > 0 && (
            <TouchableOpacity onPress={clearHistory}>
              <Text style={styles.clearButton}>清除</Text>
            </TouchableOpacity>
          )}
        </View>

        {callHistory.length === 0 ? (
          <Text style={styles.emptyText}>暂无调用记录</Text>
        ) : (
          callHistory.map((item, index) => (
            <View key={index} style={styles.historyItem}>
              <View style={styles.historyHeader}>
                <Text style={styles.historyMethod}>{item.method}</Text>
                <Text style={styles.historyTime}>
                  {new Date(item.timestamp).toLocaleTimeString()}
                </Text>
              </View>
              <Text style={styles.historyResult} numberOfLines={2}>
                {JSON.stringify(item.result).slice(0, 100)}
              </Text>
            </View>
          ))
        )}
      </View>

      {/* 支持的合约 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>当前链支持</Text>
        <View style={styles.supportedList}>
          {Object.entries(CONTRACT_ADDRESSES[wallet.chain] || {}).map(([key, address]) => (
            <View key={key} style={styles.supportedItem}>
              <Text style={styles.supportedName}>{key}</Text>
              <Text style={styles.supportedAddress} numberOfLines={1}>
                {address || '-'}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.footer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    borderWidth: 1,
    borderColor: colors.neonCyan + '40',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neonYellow + '20',
    margin: 15,
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.neonYellow + '40',
  },
  warningText: {
    color: colors.neonYellow,
    marginLeft: 10,
    fontSize: 14,
  },
  section: {
    padding: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  quickButtons: {
    flexDirection: 'row',
    marginBottom: 15,
    gap: 10,
  },
  quickButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  quickButtonActive: {
    borderColor: colors.neonCyan,
    backgroundColor: colors.neonCyan + '20',
  },
  quickButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  quickButtonTextActive: {
    color: colors.neonCyan,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  queryButton: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: colors.neonCyan,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginTop: 15,
    borderWidth: 1,
    borderColor: colors.neonCyan + '30',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tokenSymbol: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.neonCyan,
    marginRight: 10,
  },
  tokenName: {
    fontSize: 16,
    color: colors.text,
  },
  resultBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultItem: {
    flex: 1,
  },
  resultLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  resultValue: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  copyButton: {
    padding: 10,
    backgroundColor: colors.background,
    borderRadius: 8,
  },
  pairTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  pairInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  pairToken: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  tokenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  pairTokenText: {
    fontSize: 13,
    color: colors.text,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  pairSeparator: {
    fontSize: 18,
    marginHorizontal: 15,
    color: colors.textSecondary,
  },
  reserveInfo: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  reserveItem: {
    flex: 1,
    padding: 10,
    backgroundColor: colors.background,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  reserveLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  reserveValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  priceInfo: {
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  priceLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.neonGreen,
  },
  clearButton: {
    fontSize: 13,
    color: colors.neonRed,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    padding: 20,
  },
  historyItem: {
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  historyMethod: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.neonCyan,
  },
  historyTime: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  historyResult: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  supportedList: {
    backgroundColor: colors.card,
    borderRadius: 12,
    overflow: 'hidden',
  },
  supportedItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  supportedName: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text,
    width: 100,
  },
  supportedAddress: {
    fontSize: 11,
    color: colors.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    flex: 1,
    textAlign: 'right',
  },
  footer: {
    height: 50,
  },
});
