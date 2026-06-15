/**
 * 代币兑换弹窗组件
 * 支持选择代币、输入金额、查看兑换汇率
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Pressable,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeRouter } from '@/hooks/useSafeRouter';

interface SwapModalProps {
  visible: boolean;
  token: any;
  onClose: () => void;
  onSwap?: (fromToken: string, toToken: string, amount: string) => void;
}

const API_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || ''

// 常用代币列表
const POPULAR_TOKENS = [
  { symbol: 'USDT', name: 'Tether USD', color: '#26A17B', icon: '●' },
  { symbol: 'USDC', name: 'USD Coin', color: '#2775CA', icon: '●' },
  { symbol: 'BNB', name: 'BNB', color: '#F3BA2F', icon: '●' },
  { symbol: 'ETH', name: 'Ethereum', color: '#627EEA', icon: '●' },
  { symbol: 'BTC', name: 'Bitcoin', color: '#F7931A', icon: '●' },
];

export default function SwapModal({ visible, token, onClose, onSwap }: SwapModalProps) {
  const [fromToken, setFromToken] = useState<string>('USDT');
  const [toToken, setToToken] = useState<string>('');
  const [fromAmount, setFromAmount] = useState<string>('');
  const [toAmount, setToAmount] = useState<string>('');
  const [exchangeRate, setExchangeRate] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [slippage, setSlippage] = useState<number>(0.5);
  const [selectingTokenFor, setSelectingTokenFor] = useState<'from' | 'to' | null>(null);

  // 常用代币列表
  const commonTokens = [
    { symbol: 'ETH', name: 'Ethereum', icon: 'E', price: 3456.78 },
    { symbol: 'USDT', name: 'Tether USD', icon: 'U', price: 1.00 },
    { symbol: 'USDC', name: 'USD Coin', icon: 'U', price: 1.00 },
    { symbol: 'BTC', name: 'Bitcoin', icon: 'B', price: 67890.12 },
    { symbol: 'BNB', name: 'BNB', icon: 'B', price: 567.89 },
    { symbol: 'SOL', name: 'Solana', icon: 'S', price: 145.67 },
    { symbol: 'XRP', name: 'Ripple', icon: 'X', price: 0.52 },
    { symbol: 'ADA', name: 'Cardano', icon: 'A', price: 0.45 },
    { symbol: 'DOGE', name: 'Dogecoin', icon: 'D', price: 0.12 },
    { symbol: 'DOT', name: 'Polkadot', icon: 'D', price: 7.23 },
  ];

  // 选择代币处理
  const handleSelectToken = (symbol: string) => {
    if (selectingTokenFor === 'from') {
      setFromToken(symbol);
      if (symbol === toToken) {
        setToToken(fromToken || 'ETH');
      }
    } else {
      setToToken(symbol);
      if (symbol === fromToken) {
        setFromToken(toToken || 'USDT');
      }
    }
    setSelectingTokenFor(null);
  };

  // 当选择目标代币时获取汇率
  useEffect(() => {
    if (fromToken && toToken) {
      fetchExchangeRate();
    }
  }, [fromToken, toToken]);

  // 当打开弹窗且有代币时，自动设置目标代币
  useEffect(() => {
    if (token && visible) {
      setToToken(token.symbol);
      fetchExchangeRate();
    }
  }, [token, visible]);

  const fetchExchangeRate = async () => {
    if (!fromToken || !toToken) return;
    
    try {
      const response = await fetch(
        `${API_URL}/api/v1/swap/rate?from=${fromToken}&to=${toToken}`
      );
      const result = await response.json();
      if (result.success) {
        setExchangeRate(result.rate || 0);
        // 如果有输入金额，计算输出金额
        if (fromAmount) {
          setToAmount((parseFloat(fromAmount) * (result.rate || 0)).toFixed(6));
        }
      }
    } catch (error) {
      // 模拟汇率
      setExchangeRate(getMockRate(fromToken, toToken));
    }
  };

  const getMockRate = (from: string, to: string): number => {
    const rates: Record<string, Record<string, number>> = {
      'USDT': { 'BTC': 0.000015, 'ETH': 0.00028, 'BNB': 0.003, 'USDC': 1, 'DOGE': 15 },
      'BTC': { 'USDT': 65000, 'ETH': 18, 'BNB': 200, 'USDC': 65000, 'DOGE': 1000000 },
      'ETH': { 'USDT': 3500, 'BTC': 0.055, 'BNB': 11, 'USDC': 3500, 'DOGE': 55000 },
    };
    return rates[from]?.[to] || 1;
  };

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value);
    if (value && exchangeRate > 0) {
      setToAmount((parseFloat(value) * exchangeRate).toFixed(6));
    } else {
      setToAmount('');
    }
  };

  const handleSwapTokens = () => {
    const temp = fromToken;
    const tempAmount = fromAmount;
    setFromToken(toToken);
    setToToken(temp);
    setFromAmount(toAmount);
    setToAmount(tempAmount);
  };

  // 选择代币
  const handleSelectToken = (symbol: string) => {
    if (selectingTokenFor === 'from') {
      setFromToken(symbol);
    } else if (selectingTokenFor === 'to') {
      setToToken(symbol);
    }
    setSelectingTokenFor(null);
  };

  const handleSwap = async () => {
    if (!fromAmount || !fromToken || !toToken) return;
    
    setLoading(true);
    try {
      if (onSwap) {
        await onSwap(fromToken, toToken, fromAmount);
      }
      // 模拟兑换成功
      setTimeout(() => {
        setLoading(false);
        setFromAmount('');
        setToAmount('');
        onClose();
      }, 1000);
    } catch (error) {
      setLoading(false);
    }
  };

  const getTokenInfo = (symbol: string) => {
    return POPULAR_TOKENS.find(t => t.symbol === symbol) || { symbol, name: symbol, color: '#00F0FF', icon: '●' };
  };

  const formatAmount = (amount: string) => {
    if (!amount) return '0.00';
    const num = parseFloat(amount);
    if (isNaN(num)) return '0.00';
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 });
  };

  if (!token) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* 头部 */}
          <View style={styles.header}>
            <Text style={styles.title}>代币兑换</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#8B8B9A" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* 从 */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>从</Text>
              <View style={styles.tokenRow}>
                <TouchableOpacity 
                  style={styles.tokenSelector}
                  onPress={() => setSelectingTokenFor('from')}
                >
                  <View style={[styles.tokenIcon, { backgroundColor: getTokenInfo(fromToken).color + '30' }]}>
                    <Text style={[styles.tokenIconText, { color: getTokenInfo(fromToken).color }]}>
                      {getTokenInfo(fromToken).icon}
                    </Text>
                  </View>
                  <Text style={styles.tokenSymbol}>{fromToken}</Text>
                  <Ionicons name="chevron-down" size={16} color="#8B8B9A" />
                </TouchableOpacity>
                <TextInput
                  style={styles.amountInput}
                  value={fromAmount}
                  onChangeText={handleFromAmountChange}
                  placeholder="0.00"
                  placeholderTextColor="#4B5563"
                  keyboardType="decimal-pad"
                />
              </View>
              <Text style={styles.tokenBalance}>余额: -- USDT</Text>
            </View>

            {/* 交换按钮 */}
            <TouchableOpacity style={styles.swapButton} onPress={handleSwapTokens}>
              <Ionicons name="swap-vertical" size={20} color="#00F0FF" />
            </TouchableOpacity>

            {/* 到 */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>到</Text>
              <View style={styles.tokenRow}>
                <TouchableOpacity 
                  style={styles.tokenSelector}
                  onPress={() => setSelectingTokenFor('to')}
                >
                  <View style={[styles.tokenIcon, { backgroundColor: getTokenInfo(toToken).color + '30' }]}>
                    <Text style={[styles.tokenIconText, { color: getTokenInfo(toToken).color }]}>
                      {getTokenInfo(toToken).icon}
                    </Text>
                  </View>
                  <Text style={styles.tokenSymbol}>{toToken || token.symbol}</Text>
                  <Ionicons name="chevron-down" size={16} color="#8B8B9A" />
                </TouchableOpacity>
                <Text style={styles.outputAmount}>
                  {formatAmount(toAmount) || '0.00'}
                </Text>
              </View>
            </View>

            {/* 兑换信息 */}
            {exchangeRate > 0 && fromAmount && (
              <View style={styles.infoSection}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>汇率</Text>
                  <Text style={styles.infoValue}>
                    1 {fromToken} = {exchangeRate.toFixed(6)} {toToken}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <View style={styles.infoLabelRow}>
                    <Text style={styles.infoLabel}>滑点 tolerance</Text>
                    <TouchableOpacity>
                      <Ionicons name="information-circle-outline" size={14} color="#8B8B9A" />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.slippageOptions}>
                    {[0.1, 0.5, 1.0].map(val => (
                      <TouchableOpacity
                        key={val}
                        style={[
                          styles.slippageBtn,
                          slippage === val && styles.slippageBtnActive
                        ]}
                        onPress={() => setSlippage(val)}
                      >
                        <Text style={[
                          styles.slippageText,
                          slippage === val && styles.slippageTextActive
                        ]}>
                          {val}%
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>最低收到</Text>
                  <Text style={styles.infoValue}>
                    {(parseFloat(toAmount || '0') * (1 - slippage / 100)).toFixed(6)} {toToken}
                  </Text>
                </View>
              </View>
            )}

            {/* 当前代币信息 */}
            {token && (
              <View style={styles.tokenInfoSection}>
                <Text style={styles.tokenInfoTitle}>当前代币信息</Text>
                <View style={styles.tokenInfoRow}>
                  <Text style={styles.tokenInfoLabel}>代币</Text>
                  <Text style={styles.tokenInfoValue}>{token.symbol}</Text>
                </View>
                {token.price && (
                  <View style={styles.tokenInfoRow}>
                    <Text style={styles.tokenInfoLabel}>价格</Text>
                    <Text style={styles.tokenInfoValue}>${parseFloat(token.price).toFixed(6)}</Text>
                  </View>
                )}
                {token.change !== undefined && (
                  <View style={styles.tokenInfoRow}>
                    <Text style={styles.tokenInfoLabel}>24h涨跌</Text>
                    <Text style={[
                      styles.tokenInfoValue,
                      { color: token.change >= 0 ? '#00FF88' : '#FF4444' }
                    ]}>
                      {token.change >= 0 ? '+' : ''}{token.change.toFixed(2)}%
                    </Text>
                  </View>
                )}
                {token.volume && (
                  <View style={styles.tokenInfoRow}>
                    <Text style={styles.tokenInfoLabel}>24h成交量</Text>
                    <Text style={styles.tokenInfoValue}>${(token.volume / 1000000).toFixed(2)}M</Text>
                  </View>
                )}
              </View>
            )}
          </ScrollView>

          {/* 底部按钮 */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.swapSubmitBtn,
                (!fromToken || !toToken || loading) && styles.swapSubmitBtnDisabled
              ]}
              onPress={handleSwap}
              disabled={!fromToken || !toToken || loading}
            >
              <Text style={styles.swapSubmitText}>
                {loading ? '兑换中...' : `兑换 ${fromToken} → ${toToken}`}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 代币选择器 */}
        <Modal visible={selectingTokenFor !== null} transparent animationType="slide">
          <View style={styles.overlay}>
            <View style={styles.tokenSelectorContainer}>
              <View style={styles.tokenSelectorHeader}>
                <Text style={styles.tokenSelectorTitle}>选择代币</Text>
                <TouchableOpacity onPress={() => setSelectingTokenFor(null)}>
                  <Ionicons name="close" size={24} color="#8B8B9A" />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.tokenList}>
                {POPULAR_TOKENS.map((t) => (
                  <TouchableOpacity
                    key={t.symbol}
                    style={styles.tokenItem}
                    onPress={() => handleSelectToken(t.symbol)}
                  >
                    <View style={[styles.tokenIcon, { backgroundColor: t.color + '30' }]}>
                      <Text style={[styles.tokenIconText, { color: t.color }]}>{t.icon}</Text>
                    </View>
                    <View style={styles.tokenItemInfo}>
                      <Text style={styles.tokenItemSymbol}>{t.symbol}</Text>
                      <Text style={styles.tokenItemName}>{t.name}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
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
    backgroundColor: '#1A1A2E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    minHeight: 500,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D44',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  closeBtn: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  inputSection: {
    backgroundColor: '#0D0D1A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 12,
    color: '#8B8B9A',
    marginBottom: 8,
  },
  tokenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tokenSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tokenIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  tokenIconText: {
    fontSize: 12,
  },
  tokenSymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 4,
  },
  amountInput: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'right',
    minWidth: 120,
  },
  outputAmount: {
    fontSize: 24,
    fontWeight: '600',
    color: '#8B8B9A',
  },
  tokenBalance: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
  },
  swapButton: {
    alignSelf: 'center',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#00F0FF20',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
  },
  infoSection: {
    backgroundColor: '#0D0D1A',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 13,
    color: '#8B8B9A',
  },
  infoLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoValue: {
    fontSize: 13,
    color: '#FFFFFF',
  },
  slippageOptions: {
    flexDirection: 'row',
  },
  slippageBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#1A1A2E',
    marginLeft: 8,
  },
  slippageBtnActive: {
    backgroundColor: '#00F0FF20',
  },
  slippageText: {
    fontSize: 12,
    color: '#8B8B9A',
  },
  slippageTextActive: {
    color: '#00F0FF',
  },
  tokenInfoSection: {
    backgroundColor: '#0D0D1A',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
  },
  tokenInfoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  tokenInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  tokenInfoLabel: {
    fontSize: 13,
    color: '#8B8B9A',
  },
  tokenInfoValue: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  footer: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    borderTopWidth: 1,
    borderTopColor: '#2D2D44',
  },
  swapSubmitBtn: {
    backgroundColor: '#00F0FF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  swapSubmitBtnDisabled: {
    backgroundColor: '#2D2D44',
  },
  swapSubmitText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0A0A0F',
  },
  // 代币选择器样式
  tokenSelectorContainer: {
    backgroundColor: '#1A1A2E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  tokenSelectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D44',
  },
  tokenSelectorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  tokenList: {
    padding: 16,
  },
  tokenItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#0D0D1A',
    borderRadius: 12,
    marginBottom: 8,
  },
  tokenItemInfo: {
    marginLeft: 12,
  },
  tokenItemSymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  tokenItemName: {
    fontSize: 12,
    color: '#8B8B9A',
    marginTop: 2,
  },
});
