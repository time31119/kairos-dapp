/**
 * 代币交易弹窗组件
 * 支持买入/卖出功能、快捷金额选择
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
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TradeModalProps {
  visible: boolean;
  token: any;
  mode?: 'buy' | 'sell';
  onClose: () => void;
  onTrade?: (token: string, amount: string, type: 'buy' | 'sell') => void;
}

const API_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || ''

// 快捷金额选项
const QUICK_AMOUNTS = ['$100', '$500', '$1,000', '$5,000'];

export default function TradeModal({ visible, token, mode: initialMode, onClose, onTrade }: TradeModalProps) {
  const [mode, setMode] = useState<'buy' | 'sell'>(initialMode || 'buy');
  const [amount, setAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState<string>('--');

  // 重置状态当弹窗打开
  useEffect(() => {
    if (visible) {
      setMode(initialMode || 'buy');
      setAmount('');
      fetchBalance();
    }
  }, [visible, initialMode]);

  // 获取钱包余额
  const fetchBalance = async () => {
    try {
      // 模拟获取余额
      setBalance('1,250.00');
    } catch (error) {
      setBalance('--');
    }
  };

  // 选择快捷金额
  const selectQuickAmount = (quickAmount: string) => {
    const value = quickAmount.replace('$', '').replace(',', '');
    setAmount(value);
  };

  // 处理交易
  const handleTrade = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('错误', '请输入有效的交易金额');
      return;
    }

    const numAmount = parseFloat(amount);
    if (mode === 'sell' && numAmount > parseFloat(balance.replace(',', ''))) {
      Alert.alert('错误', '余额不足');
      return;
    }

    setLoading(true);
    try {
      // 模拟交易请求
      if (onTrade) {
        await onTrade(token?.symbol || '', amount, mode);
      }
      
      // 模拟交易成功
      Alert.alert(
        '交易成功',
        `${mode === 'buy' ? '买入' : '卖出'} ${amount} ${token?.symbol || ''}`,
        [{ text: '确定', onPress: onClose }]
      );
    } catch (error) {
      Alert.alert('交易失败', '请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 计算交易数量
  const getTokenAmount = () => {
    if (!amount || !token?.price) return '0';
    const numAmount = parseFloat(amount);
    const numPrice = parseFloat(token.price.toString().replace('$', ''));
    if (isNaN(numAmount) || isNaN(numPrice) || numPrice === 0) return '0';
    return (numAmount / numPrice).toFixed(6);
  };

  // 计算预估价值
  const getEstimatedValue = () => {
    if (!amount || !token?.price) return '$0.00';
    const numAmount = parseFloat(amount);
    const numPrice = parseFloat(token.price.toString().replace('$', ''));
    if (isNaN(numAmount) || isNaN(numPrice)) return '$0.00';
    return '$' + (numAmount * numPrice).toFixed(2);
  };

  if (!token) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* 头部 */}
          <View style={styles.header}>
            <Text style={styles.title}>交易 {token.symbol}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* 买入/卖出切换 */}
            <View style={styles.modeSelector}>
              <TouchableOpacity
                style={[styles.modeBtn, mode === 'buy' && styles.modeBtnActiveBuy]}
                onPress={() => setMode('buy')}
              >
                <Text style={[styles.modeBtnText, mode === 'buy' && styles.modeBtnTextActive]}>
                  买入
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modeBtn, mode === 'sell' && styles.modeBtnActiveSell]}
                onPress={() => setMode('sell')}
              >
                <Text style={[styles.modeBtnText, mode === 'sell' && styles.modeBtnTextActive]}>
                  卖出
                </Text>
              </TouchableOpacity>
            </View>

            {/* 代币信息 */}
            <View style={styles.tokenInfo}>
              <View style={styles.tokenIcon}>
                <Text style={styles.tokenIconText}>{token.symbol?.slice(0, 2)}</Text>
              </View>
              <View style={styles.tokenDetails}>
                <Text style={styles.tokenName}>{token.name || token.symbol}</Text>
                <Text style={styles.tokenPrice}>
                  ${token.price?.toFixed(6) || '0.000000'}
                </Text>
              </View>
              <View style={styles.changeTag}>
                <Text style={[
                  styles.changeText,
                  { color: (token.change || 0) >= 0 ? '#00FF88' : '#FF4444' }
                ]}>
                  {(token.change || 0) >= 0 ? '+' : ''}{(token.change || 0).toFixed(2)}%
                </Text>
              </View>
            </View>

            {/* 余额显示 */}
            <View style={styles.balanceRow}>
              <Text style={styles.balanceLabel}>
                {mode === 'buy' ? '可用 USDT' : `可用 ${token.symbol}`}
              </Text>
              <Text style={styles.balanceValue}>
                {mode === 'buy' ? `$${balance}` : `${balance} ${token.symbol}`}
              </Text>
            </View>

            {/* 金额输入 */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>金额 (USD)</Text>
              <View style={styles.inputWrap}>
                <Text style={styles.inputPrefix}>$</Text>
                <TextInput
                  style={styles.input}
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="0.00"
                  placeholderTextColor="#4B5563"
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            {/* 快捷金额 */}
            <View style={styles.quickAmounts}>
              {QUICK_AMOUNTS.map((qa) => (
                <TouchableOpacity
                  key={qa}
                  style={[
                    styles.quickBtn,
                    amount === qa.replace('$', '').replace(',', '') && styles.quickBtnActive
                  ]}
                  onPress={() => selectQuickAmount(qa)}
                >
                  <Text style={[
                    styles.quickBtnText,
                    amount === qa.replace('$', '').replace(',', '') && styles.quickBtnTextActive
                  ]}>
                    {qa}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* 交易详情 */}
            <View style={styles.details}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>
                  {mode === 'buy' ? '将收到' : '将卖出'}
                </Text>
                <Text style={styles.detailValue}>
                  {getTokenAmount()} {token.symbol}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>预估价值</Text>
                <Text style={styles.detailValue}>{getEstimatedValue()}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>交易费 (0.1%)</Text>
                <Text style={styles.detailValue}>
                  ${amount ? (parseFloat(amount) * 0.001).toFixed(2) : '0.00'}
                </Text>
              </View>
            </View>

            {/* 技术分析信号 */}
            {token.techSignals && token.techSignals.length > 0 && (
              <View style={styles.signalsSection}>
                <Text style={styles.signalsTitle}>技术信号</Text>
                <View style={styles.signalsList}>
                  {token.techSignals.map((signal: any, idx: number) => (
                    <View
                      key={idx}
                      style={[styles.signalTag, { backgroundColor: signal.color + '20' }]}
                    >
                      <Text style={[styles.signalText, { color: signal.color }]}>
                        {signal.name}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>

          {/* 底部按钮 */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.tradeBtn,
                mode === 'buy' ? styles.buyBtn : styles.sellBtn,
                loading && styles.tradeBtnDisabled,
              ]}
              onPress={handleTrade}
              disabled={loading}
            >
              <Text style={styles.tradeBtnText}>
                {loading ? '处理中...' : (mode === 'buy' ? `买入 ${token.symbol}` : `卖出 ${token.symbol}`)}
              </Text>
            </TouchableOpacity>
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
    backgroundColor: '#12121A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  closeBtn: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  modeSelector: {
    flexDirection: 'row',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  modeBtnActiveBuy: {
    backgroundColor: '#00FF88',
  },
  modeBtnActiveSell: {
    backgroundColor: '#FF4444',
  },
  modeBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  modeBtnTextActive: {
    color: '#000',
  },
  tokenInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A24',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  tokenIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#00F0FF20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tokenIconText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#00F0FF',
  },
  tokenDetails: {
    flex: 1,
    marginLeft: 12,
  },
  tokenName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  tokenPrice: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  changeTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#1F2937',
  },
  changeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  balanceValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFF',
  },
  inputSection: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A24',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#00F0FF40',
  },
  inputPrefix: {
    fontSize: 24,
    fontWeight: '600',
    color: '#6B7280',
  },
  input: {
    flex: 1,
    fontSize: 24,
    fontWeight: '600',
    color: '#FFF',
    paddingVertical: 16,
    paddingLeft: 8,
  },
  quickAmounts: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  quickBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 8,
  },
  quickBtnActive: {
    backgroundColor: '#00F0FF20',
    borderWidth: 1,
    borderColor: '#00F0FF',
  },
  quickBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  quickBtnTextActive: {
    color: '#00F0FF',
  },
  details: {
    backgroundColor: '#1A1A24',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFF',
  },
  signalsSection: {
    marginBottom: 20,
  },
  signalsTitle: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 10,
  },
  signalsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  signalTag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  signalText: {
    fontSize: 12,
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 20,
    borderTopWidth: 1,
    borderTopColor: '#1F2937',
  },
  tradeBtn: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buyBtn: {
    backgroundColor: '#00FF88',
  },
  sellBtn: {
    backgroundColor: '#FF4444',
  },
  tradeBtnDisabled: {
    opacity: 0.6,
  },
  tradeBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
});
