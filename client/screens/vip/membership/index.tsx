import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Modal,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import * as Clipboard from 'expo-clipboard';
import { useSafeRouter } from '@/hooks/useSafeRouter';

const EXPO_PUBLIC_BACKEND_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || ''

// BSC USDT 收款地址
const RECEIVE_ADDRESS = '0x769ecB24694F56d75d6eaaD5F634d99eF12c407d'
// BSC USDT 合约地址
const USDT_CONTRACT = '0x55d398326f99059fF775485246999027B3197955'

// VIP 套餐
const PLANS = [
  { id: 'basic', name: 'Basic', price: 9.9, period: '月', features: ['基础K线分析', '5个交易对监控', '邮件通知'] },
  { id: 'standard', name: 'Standard', price: 29.9, period: '月', features: ['完整K线分析', '20个交易对监控', '实时推送', '优先客服'] },
  { id: 'premium', name: 'Premium', price: 99, period: '月', features: ['专业K线分析', '无限交易对', 'API接口', '专属客服', '优先体验'] },
  { id: 'yearly', name: '年度VIP', price: 999, period: '年', features: ['全部Premium功能', '2个月免费', '专属客服'] },
]

export default function MembershipScreen() {
  const router = useSafeRouter();
  const [selectedPlan, setSelectedPlan] = useState(PLANS[2]); // 默认Premium
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // 复制地址
  const handleCopyAddress = async () => {
    await Clipboard.setStringAsync(RECEIVE_ADDRESS);
    Alert.alert('已复制', '收款地址已复制到剪贴板');
  };

  // 复制金额
  const handleCopyAmount = async () => {
    await Clipboard.setStringAsync(selectedPlan.price.toString());
    Alert.alert('已复制', `金额 ${selectedPlan.price} USDT 已复制到剪贴板');
  };

  // 在TPWallet中打开合约转账页面
  const handleOpenInWallet = async () => {
    // BSCSCAN 合约页面，用户可以在这里发起转账
    const url = `https://bscscan.com/token/${USDT_CONTRACT}?a=${RECEIVE_ADDRESS}`;
    try {
      await Linking.openURL(url);
    } catch (e) {
      // 如果无法打开，提示复制地址
      Alert.alert('提示', '请手动复制下方的收款地址，在TPWallet中转账');
    }
  };

  // 确认已转账
  const handleConfirmPayment = async () => {
    if (!orderId) return;
    
    setIsProcessing(true);
    try {
      // 调用后端确认订单
      const response = await fetch(EXPO_PUBLIC_BACKEND_BASE_URL + '/api/v1/subscription/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        Alert.alert('成功', 'VIP开通成功！', [
          { text: '确定', onPress: () => router.replace('/') }
        ]);
      } else {
        Alert.alert('提示', data.message || '请等待区块确认后重试');
      }
    } catch (error) {
      Alert.alert('提示', '请等待区块确认后再试');
    } finally {
      setIsProcessing(false);
    }
  };

  // 购买VIP - 创建订单
  const handlePurchase = async () => {
    setIsProcessing(true);
    
    try {
      // 创建订单
      const response = await fetch(EXPO_PUBLIC_BACKEND_BASE_URL + '/api/v1/subscription/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: selectedPlan.id,
          walletAddress: RECEIVE_ADDRESS,
        }),
      });
      
      const data = await response.json();
      
      if (data.orderId) {
        setOrderId(data.orderId);
        setShowPaymentModal(true);
      } else {
        // 即使后端失败，也显示支付界面
        setOrderId('manual-' + Date.now());
        setShowPaymentModal(true);
      }
    } catch (error) {
      // 离线模式也显示支付界面
      setOrderId('offline-' + Date.now());
      setShowPaymentModal(true);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Screen>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/')}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>VIP 会员</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.container}>
        {/* Banner */}
        <View style={styles.banner}>
          <Ionicons name="diamond" size={40} color="#FFD700" />
          <Text style={styles.bannerTitle}>KAIROS VIP</Text>
          <Text style={styles.bannerSubtitle}>解锁全部高级功能</Text>
        </View>

        {/* 套餐列表 */}
        <View style={styles.plansContainer}>
          {PLANS.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              style={[
                styles.planCard,
                selectedPlan.id === plan.id && styles.planCardSelected,
              ]}
              onPress={() => setSelectedPlan(plan)}
            >
              <View style={styles.planHeader}>
                <Text style={styles.planName}>{plan.name}</Text>
                {selectedPlan.id === plan.id && (
                  <Ionicons name="checkmark-circle" size={20} color="#00F0FF" />
                )}
              </View>
              <View style={styles.planPrice}>
                <Text style={styles.priceSymbol}>$</Text>
                <Text style={styles.priceValue}>{plan.price}</Text>
                <Text style={styles.pricePeriod}>/{plan.period}</Text>
              </View>
              <View style={styles.features}>
                {plan.features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <Ionicons name="checkmark" size={14} color="#00FF88" />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* 购买按钮 */}
        <TouchableOpacity
          style={[styles.buyButton, isProcessing && styles.buyButtonDisabled]}
          onPress={handlePurchase}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="#0A0A0F" />
          ) : (
            <Text style={styles.buyButtonText}>
              立即开通 ${selectedPlan.price}/{selectedPlan.period}
            </Text>
          )}
        </TouchableOpacity>

        {/* 支付说明 */}
        <View style={styles.paymentInfo}>
          <Text style={styles.paymentInfoTitle}>支付方式</Text>
          <Text style={styles.paymentInfoText}>
            支持 BSC 链上的 USDT (BEP20) 转账支付
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* 支付弹窗 */}
      <Modal visible={showPaymentModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>USDT 转账支付</Text>
              <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
                <Ionicons name="close" size={24} color="#4B5563" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* 金额 */}
              <View style={styles.paymentItem}>
                <Text style={styles.paymentLabel}>支付金额</Text>
                <View style={styles.paymentValueContainer}>
                  <Text style={styles.paymentAmount}>{selectedPlan.price}</Text>
                  <Text style={styles.paymentUnit}>USDT</Text>
                </View>
                <TouchableOpacity style={styles.copyBtn} onPress={handleCopyAmount}>
                  <Ionicons name="copy-outline" size={16} color="#00F0FF" />
                  <Text style={styles.copyBtnText}>复制金额</Text>
                </TouchableOpacity>
              </View>

              {/* 收款地址 */}
              <View style={styles.paymentItem}>
                <Text style={styles.paymentLabel}>收款地址 (BSC)</Text>
                <Text style={styles.paymentValue} numberOfLines={2}>
                  {RECEIVE_ADDRESS}
                </Text>
                <TouchableOpacity style={styles.copyBtn} onPress={handleCopyAddress}>
                  <Ionicons name="copy-outline" size={16} color="#00F0FF" />
                  <Text style={styles.copyBtnText}>复制地址</Text>
                </TouchableOpacity>
              </View>

              {/* 操作指南 */}
              <View style={styles.guide}>
                <Text style={styles.guideTitle}>转账步骤</Text>
                <Text style={styles.guideText}>1. 复制上方收款地址</Text>
                <Text style={styles.guideText}>2. 打开 TPWallet</Text>
                <Text style={styles.guideText}>3. 进入 USDT 发送页面</Text>
                <Text style={styles.guideText}>4. 粘贴地址，填入金额</Text>
                <Text style={styles.guideText}>5. 确认转账完成</Text>
                <Text style={styles.guideText}>6. 点击下方"已转账"按钮</Text>
              </View>

              {/* 注意事项 */}
              <View style={styles.warning}>
                <Ionicons name="alert-circle" size={20} color="#FFB800" />
                <Text style={styles.warningText}>
                  请确保使用 BSC 链的 USDT (BEP20)，转错链资产不可找回
                </Text>
              </View>
            </ScrollView>

            {/* 底部按钮 */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.confirmButton, isProcessing && styles.confirmButtonDisabled]}
                onPress={handleConfirmPayment}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <ActivityIndicator color="#0A0A0F" />
                ) : (
                  <Text style={styles.confirmButtonText}>我已转账完成</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#13131A',
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F2E',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  banner: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#13131A',
    marginBottom: 20,
  },
  bannerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD700',
    marginTop: 12,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
  plansContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  planCard: {
    backgroundColor: '#13131A',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1F1F2E',
    marginBottom: 12,
  },
  planCardSelected: {
    borderColor: '#00F0FF',
    backgroundColor: 'rgba(0, 240, 255, 0.05)',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  planPrice: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 8,
  },
  priceSymbol: {
    fontSize: 16,
    color: '#00F0FF',
  },
  priceValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#00F0FF',
  },
  pricePeriod: {
    fontSize: 14,
    color: '#6B7280',
  },
  features: {
    marginTop: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  featureText: {
    fontSize: 13,
    color: '#9CA3AF',
    marginLeft: 8,
  },
  buyButton: {
    backgroundColor: '#00F0FF',
    marginHorizontal: 16,
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buyButtonDisabled: {
    opacity: 0.6,
  },
  buyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0A0A0F',
  },
  paymentInfo: {
    marginTop: 24,
    marginHorizontal: 16,
    padding: 16,
    backgroundColor: '#13131A',
    borderRadius: 12,
  },
  paymentInfoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  paymentInfoText: {
    fontSize: 13,
    color: '#6B7280',
  },
  // 弹窗样式
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1A1A2E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A3E',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalBody: {
    padding: 20,
  },
  paymentItem: {
    backgroundColor: '#13131A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  paymentLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
  },
  paymentValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  paymentAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#00F0FF',
  },
  paymentUnit: {
    fontSize: 16,
    color: '#6B7280',
    marginLeft: 8,
  },
  paymentValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  copyBtnText: {
    fontSize: 14,
    color: '#00F0FF',
    marginLeft: 6,
  },
  guide: {
    backgroundColor: '#13131A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  guideTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  guideText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  warning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 184, 0, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: '#FFB800',
    marginLeft: 10,
  },
  modalFooter: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    borderTopWidth: 1,
    borderTopColor: '#2A2A3E',
  },
  confirmButton: {
    backgroundColor: '#00FF88',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0A0A0F',
  },
});
