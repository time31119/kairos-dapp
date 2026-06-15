import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, TextInput, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { useSafeRouter, useSafeSearchParams } from '@/hooks/useSafeRouter';

const EXPO_PUBLIC_BACKEND_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || ''

// Supported chains
const CHAINS = [
  { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', color: '#627EEA', icon: 'logo-ethereum' },
  { id: 'bsc', name: 'BNB Chain', symbol: 'BNB', color: '#F0B90B', icon: 'logo-btc' },
  { id: 'polygon', name: 'Polygon', symbol: 'MATIC', color: '#8247E5', icon: 'cube' },
  { id: 'tron', name: 'TRON', symbol: 'TRX', color: '#EF0027', icon: 'hardware-chip' },
]

// Popular tokens by chain
const TOKENS: Record<string, { symbol: string; name: string; address: string; decimals: number; logo?: string }[]> = {
  ethereum: [
    { symbol: 'ETH', name: 'Ethereum', address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', decimals: 18 },
    { symbol: 'USDT', name: 'Tether USD', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', decimals: 6 },
    { symbol: 'USDC', name: 'USD Coin', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', decimals: 6 },
    { symbol: 'WBTC', name: 'Wrapped BTC', address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', decimals: 8 },
    { symbol: 'UNI', name: 'Uniswap', address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', decimals: 18 },
    { symbol: 'AAVE', name: 'Aave', address: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9', decimals: 18 },
  ],
  bsc: [
    { symbol: 'BNB', name: 'BNB', address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', decimals: 18 },
    { symbol: 'USDT', name: 'Tether USD', address: '0x55d398326f99059fF775485246999027B3197955', decimals: 18 },
    { symbol: 'USDC', name: 'USD Coin', address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580', decimals: 18 },
    { symbol: 'CAKE', name: 'PancakeSwap', address: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82', decimals: 18 },
    { symbol: 'BUSD', name: 'Binance USD', address: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd0873D', decimals: 18 },
  ],
  polygon: [
    { symbol: 'MATIC', name: 'Polygon', address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', decimals: 18 },
    { symbol: 'USDT', name: 'Tether USD', address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', decimals: 6 },
    { symbol: 'USDC', name: 'USD Coin', address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', decimals: 6 },
    { symbol: 'QUICK', name: 'Quickswap', address: '0x6c28Ae8c9347B25fB4Fc5a9B8fC573A4F42aC4E7', decimals: 18 },
  ],
  tron: [
    { symbol: 'TRX', name: 'TRON', address: 'TRX', decimals: 6 },
    { symbol: 'USDT', name: 'Tether USD', address: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t', decimals: 6 },
    { symbol: 'USDC', name: 'USD Coin', address: 'TXLAQ63Xg1NAzckPwKHvzw7CSErLqjUML7', decimals: 6 },
  ],
}

export default function SwapScreen() {
  const router = useSafeRouter();
  const params = useSafeSearchParams<{ 
    fromToken?: string; 
    fromChain?: string; 
    scenario?: string 
  }>();

  // State
  const [selectedChain, setSelectedChain] = useState(params.fromChain || 'ethereum');
  const [fromToken, setFromToken] = useState<string>(params.fromToken || 'USDT');
  const [toToken, setToToken] = useState<string>('ETH');
  const [fromAmount, setFromAmount] = useState<string>('');
  const [toAmount, setToAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [showFromTokenPicker, setShowFromTokenPicker] = useState(false);
  const [showToTokenPicker, setShowToTokenPicker] = useState(false);
  const [showChainPicker, setShowChainPicker] = useState(false);

  // Token prices (mock)
  const tokenPrices: Record<string, number> = {
    ETH: 3456.78,
    USDT: 1.0,
    USDC: 1.0,
    BNB: 567.89,
    WBTC: 67890.12,
    UNI: 12.45,
    AAVE: 156.78,
    CAKE: 3.45,
    MATIC: 0.89,
    TRX: 0.12,
    QUICK: 0.56,
  }

  const getTokenInfo = useCallback((symbol: string) => {
    const chainTokens = TOKENS[selectedChain] || [];
    return chainTokens.find(t => t.symbol === symbol) || chainTokens[0];
  }, [selectedChain]);

  const getCurrentChain = useCallback(() => {
    return CHAINS.find(c => c.id === selectedChain) || CHAINS[0];
  }, [selectedChain]);

  // Calculate quote
  const calculateQuote = useCallback(async () => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      setToAmount('');
      return;
    }

    setQuoteLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const fromPrice = tokenPrices[fromToken] || 1;
    const toPrice = tokenPrices[toToken] || 1;
    const amount = parseFloat(fromAmount);
    
    // Simple price calculation with 0.5% fee
    const fromValue = amount * fromPrice;
    const toValue = fromValue / toPrice * 0.995;
    
    setToAmount(toValue.toFixed(6));
    setQuoteLoading(false);
  }, [fromAmount, fromToken, toToken]);

  useEffect(() => {
    const timer = setTimeout(() => {
      calculateQuote();
    }, 300);
    return () => clearTimeout(timer);
  }, [calculateQuote]);

  // Swap tokens
  const handleSwapTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  // Connect wallet
  const handleConnectWallet = async () => {
    try {
      // Try to connect to TP wallet via deeplink
      const deeplink = 'trust://wc';
      const supported = await Linking.canOpenURL(deeplink);
      
      if (supported) {
        await Linking.openURL(deeplink);
      } else {
        Alert.alert('提示', '请安装 TP 钱包后重试');
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  // Execute swap
  const handleSwap = async () => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      Alert.alert('错误', '请输入兑换数量');
      return;
    }

    if (!walletAddress) {
      Alert.alert('提示', '请先连接钱包', [
        { text: '取消', style: 'cancel' },
        { text: '连接钱包', onPress: handleConnectWallet },
      ]);
      return;
    }

    setLoading(true);

    try {
      const fromTokenInfo = getTokenInfo(fromToken);
      const toTokenInfo = getTokenInfo(toToken);
      const chain = getCurrentChain();

      // Build swap URL for TP wallet
      const swapParams = new URLSearchParams({
        chain: selectedChain,
        fromToken: fromTokenInfo.address,
        toToken: toTokenInfo.address,
        amount: (parseFloat(fromAmount) * Math.pow(10, fromTokenInfo.decimals)).toString(),
      });

      // For Tron chain, use TronLink or manual transfer
      if (selectedChain === 'tron') {
        const transferUrl = `https://tronswap.org/swap?${swapParams.toString()}`;
        await Linking.openURL(transferUrl);
      } else if (selectedChain === 'ethereum' || selectedChain === 'bsc') {
        const deeplink = `https://app.uniswap.org/swap?${swapParams.toString()}`;
        await Linking.openURL(deeplink);
      } else {
        Alert.alert('提示', '正在跳转到 DEX 进行交易...');
        const deeplink = `https://app.1inch.io/#/${selectedChain}/swap/${fromTokenInfo.address}/${toTokenInfo.address}`;
        await Linking.openURL(deeplink);
      }

      Alert.alert('成功', '已跳转到 DEX 进行交易，请在钱包中确认');
    } catch (error) {
      Alert.alert('错误', '交易失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: string | number, decimals = 2) => {
    const value = typeof num === 'string' ? parseFloat(num) : num;
    if (isNaN(value)) return '0';
    if (value >= 1000000) return (value / 1000000).toFixed(2) + 'M';
    if (value >= 1000) return (value / 1000).toFixed(2) + 'K';
    return value.toFixed(decimals);
  };

  return (
    <Screen>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>币币兑换</Text>
        <TouchableOpacity style={styles.headerRight} onPress={() => setShowChainPicker(true)}>
          <Ionicons name={getCurrentChain().icon as any} size={20} color={getCurrentChain().color} />
          <Text style={styles.chainText}>{getCurrentChain().symbol}</Text>
          <Ionicons name="chevron-down" size={16} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Scenario Tag */}
        {params.scenario && (
          <View style={styles.scenarioTag}>
            <Text style={styles.scenarioTagText}>{decodeURIComponent(params.scenario)}</Text>
          </View>
        )}

        {/* From Token */}
        <View style={styles.tokenCard}>
          <Text style={styles.label}>支付</Text>
          <View style={styles.tokenRow}>
            <TextInput
              style={styles.amountInput}
              placeholder="0.0"
              placeholderTextColor="#4B5563"
              keyboardType="decimal-pad"
              value={fromAmount}
              onChangeText={setFromAmount}
            />
            <TouchableOpacity 
              style={styles.tokenSelector}
              onPress={() => setShowFromTokenPicker(true)}
            >
              <Text style={styles.tokenSymbol}>{fromToken}</Text>
              <Ionicons name="chevron-down" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
          <View style={styles.tokenInfo}>
            <Text style={styles.tokenBalance}>
              余额: {formatNumber(tokenPrices[fromToken] * 1000)} {fromToken}
            </Text>
            <Text style={styles.usdValue}>
              ≈ ${formatNumber(parseFloat(fromAmount || '0') * (tokenPrices[fromToken] || 0))}
            </Text>
          </View>
        </View>

        {/* Swap Button */}
        <TouchableOpacity style={styles.swapButton} onPress={handleSwapTokens}>
          <View style={styles.swapIcon}>
            <Ionicons name="swap-vertical" size={24} color="#00F0FF" />
          </View>
        </TouchableOpacity>

        {/* To Token */}
        <View style={styles.tokenCard}>
          <Text style={styles.label}>接收</Text>
          <View style={styles.tokenRow}>
            <View style={styles.amountContainer}>
              {quoteLoading ? (
                <ActivityIndicator size="small" color="#00F0FF" />
              ) : (
                <Text style={styles.amountText}>
                  {toAmount ? formatNumber(toAmount, 6) : '0.0'}
                </Text>
              )}
            </View>
            <TouchableOpacity 
              style={styles.tokenSelector}
              onPress={() => setShowToTokenPicker(true)}
            >
              <Text style={styles.tokenSymbol}>{toToken}</Text>
              <Ionicons name="chevron-down" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
          <View style={styles.tokenInfo}>
            <Text style={styles.tokenBalance}>
              余额: {formatNumber(tokenPrices[toToken] * 1000)} {toToken}
            </Text>
            <Text style={styles.usdValue}>
              ≈ ${formatNumber(parseFloat(toAmount || '0') * (tokenPrices[toToken] || 0))}
            </Text>
          </View>
        </View>

        {/* Swap Info */}
        {fromAmount && toAmount && (
          <View style={styles.swapInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>汇率</Text>
              <Text style={styles.infoValue}>
                1 {fromToken} ≈ {formatNumber(parseFloat(toAmount) / parseFloat(fromAmount), 6)} {toToken}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>价格影响</Text>
              <Text style={[styles.infoValue, { color: '#00FF88' }]}>{'<0.01%'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>滑点容忍</Text>
              <Text style={styles.infoValue}>0.5%</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>最低接收</Text>
              <Text style={styles.infoValue}>
                {formatNumber(parseFloat(toAmount) * 0.995, 6)} {toToken}
              </Text>
            </View>
          </View>
        )}

        {/* Wallet Connection */}
        <TouchableOpacity 
          style={[styles.connectButton, walletAddress && styles.connectedButton]}
          onPress={handleConnectWallet}
        >
          <Ionicons 
            name={walletAddress ? 'checkmark-circle' : 'wallet-outline'} 
            size={20} 
            color={walletAddress ? '#00FF88' : '#00F0FF'} 
          />
          <Text style={[styles.connectText, walletAddress && styles.connectedText]}>
            {walletAddress 
              ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
              : '连接钱包'
            }
          </Text>
        </TouchableOpacity>

        {/* Swap Button */}
        <TouchableOpacity 
          style={[styles.submitButton, (!fromAmount || loading) && styles.disabledButton]}
          onPress={handleSwap}
          disabled={!fromAmount || loading}
        >
          {loading ? (
            <ActivityIndicator color="#0A0A0F" />
          ) : (
            <Text style={styles.submitText}>兑换</Text>
          )}
        </TouchableOpacity>

        {/* Disclaimer */}
        <Text style={styles.disclaimer}>
          交易由第三方 DEX 提供，KAIROS 不对交易结果负责
        </Text>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Token Picker Modal */}
      {(showFromTokenPicker || showToTokenPicker) && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackdrop} 
            onPress={() => {
              setShowFromTokenPicker(false);
              setShowToTokenPicker(false);
            }}
          />
          <View style={styles.tokenPicker}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>选择代币</Text>
              <TouchableOpacity onPress={() => {
                setShowFromTokenPicker(false);
                setShowToTokenPicker(false);
              }}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.tokenList}>
              {(TOKENS[selectedChain] || []).map((token) => (
                <TouchableOpacity
                  key={token.symbol}
                  style={[
                    styles.tokenItem,
                    (showFromTokenPicker ? fromToken : toToken) === token.symbol && styles.tokenItemActive
                  ]}
                  onPress={() => {
                    if (showFromTokenPicker) {
                      if (token.symbol !== toToken) {
                        setFromToken(token.symbol);
                      }
                    } else {
                      if (token.symbol !== fromToken) {
                        setToToken(token.symbol);
                      }
                    }
                    setShowFromTokenPicker(false);
                    setShowToTokenPicker(false);
                  }}
                >
                  <View style={styles.tokenIcon}>
                    <Text style={styles.tokenIconText}>{token.symbol.slice(0, 2)}</Text>
                  </View>
                  <View style={styles.tokenDetails}>
                    <Text style={styles.tokenItemSymbol}>{token.symbol}</Text>
                    <Text style={styles.tokenItemName}>{token.name}</Text>
                  </View>
                  <Text style={styles.tokenPrice}>
                    ${formatNumber(tokenPrices[token.symbol] || 0)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}

      {/* Chain Picker Modal */}
      {showChainPicker && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackdrop} 
            onPress={() => setShowChainPicker(false)}
          />
          <View style={styles.chainPicker}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>选择链</Text>
              <TouchableOpacity onPress={() => setShowChainPicker(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.chainList}>
              {CHAINS.map((chain) => (
                <TouchableOpacity
                  key={chain.id}
                  style={[
                    styles.chainItem,
                    selectedChain === chain.id && styles.chainItemActive
                  ]}
                  onPress={() => {
                    setSelectedChain(chain.id);
                    // Reset tokens when changing chain
                    const chainTokens = TOKENS[chain.id] || [];
                    setFromToken(chainTokens[0]?.symbol || 'USDT');
                    setToToken(chainTokens[1]?.symbol || 'ETH');
                    setFromAmount('');
                    setToAmount('');
                    setShowChainPicker(false);
                  }}
                >
                  <Ionicons name={chain.icon as any} size={24} color={chain.color} />
                  <Text style={styles.chainName}>{chain.name}</Text>
                  {selectedChain === chain.id && (
                    <Ionicons name="checkmark" size={20} color="#00F0FF" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#0A0A0F',
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F2E',
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F1F2E',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  chainText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
    paddingHorizontal: 16,
  },
  scenarioTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#00F0FF20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  scenarioTagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#00F0FF',
  },
  tokenCard: {
    backgroundColor: '#12121A',
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 8,
  },
  tokenRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountInput: {
    flex: 1,
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  amountContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  amountText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  tokenSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F1F2E',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 24,
    gap: 6,
  },
  tokenSymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  tokenInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  tokenBalance: {
    fontSize: 13,
    color: '#6B7280',
  },
  usdValue: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  swapButton: {
    alignSelf: 'center',
    marginVertical: -12,
    zIndex: 1,
  },
  swapIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1F1F2E',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#0A0A0F',
  },
  swapInfo: {
    backgroundColor: '#12121A',
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  infoLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1F1F2E',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 16,
    gap: 8,
  },
  connectedButton: {
    backgroundColor: '#00FF8820',
    borderWidth: 1,
    borderColor: '#00FF88',
  },
  connectText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#00F0FF',
  },
  connectedText: {
    color: '#00FF88',
  },
  submitButton: {
    backgroundColor: '#00F0FF',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#4B5563',
  },
  submitText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0A0A0F',
  },
  disclaimer: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 16,
  },
  bottomPadding: {
    height: 40,
  },

  // Modal styles
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  tokenPicker: {
    backgroundColor: '#12121A',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  chainPicker: {
    backgroundColor: '#12121A',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '50%',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F2E',
  },
  pickerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  tokenList: {
    paddingHorizontal: 16,
  },
  chainList: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  tokenItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
  tokenItemActive: {
    backgroundColor: '#1F1F2E',
  },
  tokenIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2A2A3A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tokenIconText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  tokenDetails: {
    flex: 1,
  },
  tokenItemSymbol: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  tokenItemName: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  tokenPrice: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  chainItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 4,
    gap: 12,
  },
  chainItemActive: {
    backgroundColor: '#1F1F2E',
  },
  chainName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#FFFFFF',
  },
});
