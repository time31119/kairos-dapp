import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput, Alert } from 'react-native';
import { Screen } from '@/components/Screen';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { ActivityIndicator } from 'react-native';

export default function AIStrategy() {
  const router = useSafeRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState<any>(null);
  const [entrustAmount, setEntrustAmount] = useState('');
  const [entrustPeriod, setEntrustPeriod] = useState('1个月');
  const [paymentLink, setPaymentLink] = useState('');

  // 策略数据
  const strategies = [
    { 
      id: 1, 
      name: '网格套利策略', 
      description: '利用市场波动进行低买高卖，自动捕捉价差收益。通过在预设价格区间内布置多空网格单，当价格波动时自动触发买卖，实现稳定的价差收益。',
      returns: '+25.8%',
      annualReturns: '年化收益 86%+',
      risk: '低',
      users: 2156,
      minAmount: '$1,000',
      profit: '3:7',
      cycle: '一月一结',
      features: ['全天候自动运行', '风险可控', '收益稳定'],
      history: ['近1月 +12.5%', '近3月 +32.5%', '近6月 +48.3%'],
    },
    { 
      id: 2, 
      name: '趋势追踪策略', 
      description: '基于AI技术识别市场趋势，顺势而为。当检测到上升趋势时自动做多，下降趋势时自动做空，最大化捕捉趋势行情。',
      returns: '+33.5%',
      annualReturns: '年化收益 120%+',
      risk: '中',
      users: 1832,
      minAmount: '$2,000',
      profit: '3:7',
      cycle: '一月一结',
      features: ['AI智能识别', '顺势而为', '趋势捕捉'],
      history: ['近1月 +18.5%', '近3月 +52.3%', '近6月 +86.2%'],
    },
    { 
      id: 3, 
      name: '均值回归策略', 
      description: '捕捉价格偏离均值的机会，当价格偏离度过大时自动入场，等待价格回归均值时获利了结。',
      returns: '+22.3%',
      annualReturns: '年化收益 75%+',
      risk: '低',
      users: 1456,
      minAmount: '$800',
      profit: '3:7',
      cycle: '一月一结',
      features: ['均值回归逻辑', '逆向思维', '稳健收益'],
      history: ['近1月 +8.5%', '近3月 +22.3%', '近6月 +38.6%'],
    },
    { 
      id: 4, 
      name: '多空对冲策略', 
      description: '同时做多做空，降低市场整体风险敞口。通过配置相关性较高的多空组合，对冲市场系统性风险，追求绝对收益。',
      returns: '+18.6%',
      annualReturns: '年化收益 55%+',
      risk: '中',
      users: 987,
      minAmount: '$3,000',
      profit: '3:7',
      cycle: '一月一结',
      features: ['双向对冲', '风险对冲', '绝对收益'],
      history: ['近1月 +6.8%', '近3月 +18.6%', '近6月 +32.5%'],
    },
  ];

  const [isSubmitting, setIsSubmitting] = useState(false);

  // 统计数据
  const stats = [
    { label: '总管理资金', value: '$28.5M', icon: 'wallet-outline' },
    { label: '活跃用户', value: '6,500+', icon: 'people-outline' },
    { label: '累计收益', value: '$8.2M', icon: 'trending-up-outline' },
    { label: '策略数量', value: '12个', icon: 'git-branch-outline' },
  ];

  const handleEntrust = (strategy: any) => {
    setSelectedStrategy(strategy);
    setEntrustAmount(strategy.minAmount.replace('$', '').replace(',', ''));
    setEntrustPeriod('1个月');
    setPaymentLink('');
    setModalVisible(true);
  };

  const handleSubmitEntrust = () => {
    const minAmount = parseFloat(selectedStrategy?.minAmount?.replace('$', '').replace(',', '') || '0');
    const inputAmount = parseFloat(entrustAmount);
    
    if (!entrustAmount || inputAmount < minAmount) {
      Alert.alert('提示', `最低跟单金额为 ${selectedStrategy?.minAmount}`);
      return;
    }
    if (!paymentLink) {
      Alert.alert('提示', '请填写收款链接');
      return;
    }
    // 简单验证 BNB Chain 地址格式 (0x开头，42位)
    if (!/^0x[a-fA-F0-9]{40}$/.test(paymentLink)) {
      Alert.alert('提示', '请输入有效的 BNB Chain 地址（0x开头，42位）');
      return;
    }
    
    setIsSubmitting(true);
    
    // 模拟提交
    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert(
        '提交成功', 
        `您的跟单申请已提交\n\n策略: ${selectedStrategy?.name}\n金额: $${parseFloat(entrustAmount).toLocaleString()}\n期限: ${entrustPeriod}\n\n我们将在24小时内与您联系确认详情。`,
        [{ text: '确定', onPress: () => setModalVisible(false) }]
      );
      // 清空表单
      setEntrustAmount('');
      setPaymentLink('');
    }, 1500);
  };

  return (
    <Screen>
      <ScrollView style={styles.container}>
        {/* 返回按钮 */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>

        {/* Hero Section */}
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <FontAwesome5 name="brain" size={40} color="#8B5CF6" />
          </View>
          <Text style={styles.heroTitle}>AI策略交易</Text>
          <Text style={styles.heroSubtitle}>
            智能量化策略 | 自动执行 | 稳健收益
          </Text>
        </View>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statItem}>
              <Ionicons name={stat.icon as any} size={22} color="#8B5CF6" />
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* 跟单合作说明 */}
        <View style={styles.cooperationSection}>
          <Text style={styles.sectionTitle}>跟单合作方式</Text>
          <View style={styles.cooperationCard}>
            <View className="flex-row justify-between items-center mb-3">
              <View style={styles.cooperationItem}>
                <Text style={styles.cooperationValue}>3 : 7</Text>
                <Text style={styles.cooperationLabel}>利润分成</Text>
              </View>
              <View style={styles.cooperationDivider} />
              <View style={styles.cooperationItem}>
                <Text style={styles.cooperationValue}>1个月</Text>
                <Text style={styles.cooperationLabel}>结算周期</Text>
              </View>
              <View style={styles.cooperationDivider} />
              <View style={styles.cooperationItem}>
                <Text style={styles.cooperationValue}>$5,000</Text>
                <Text style={styles.cooperationLabel}>最低门槛</Text>
              </View>
            </View>
            <View style={styles.cooperationNote}>
              <Ionicons name="information-circle" size={14} color="#8B5CF6" />
              <Text style={styles.cooperationNoteText}>盈利后分成，亏损由您自行承担，资金安全有保障</Text>
            </View>
          </View>
        </View>

        {/* Strategy List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>热门策略</Text>
          {strategies.map((strategy) => (
            <View key={strategy.id} style={styles.strategyCard}>
              {/* 策略头部 */}
              <View style={styles.strategyHeader}>
                <View style={styles.strategyHeaderLeft}>
                  <Text style={styles.strategyName}>{strategy.name}</Text>
                  <View style={styles.returnsBadge}>
                    <Text style={styles.returnsText}>{strategy.returns}</Text>
                    <Text style={styles.returnsLabel}>月化</Text>
                  </View>
                </View>
                <View style={[styles.riskBadge, { backgroundColor: strategy.risk === '低' ? '#DCFCE7' : '#FEF3C7' }]}>
                  <Text style={[styles.riskText, { color: strategy.risk === '低' ? '#22C55E' : '#F59E0B' }]}>
                    {strategy.risk}风险
                  </Text>
                </View>
              </View>

              {/* 策略简介 */}
              <View style={styles.strategySection}>
                <Text style={styles.strategySectionTitle}>策略简介</Text>
                <Text style={styles.strategyDesc}>{strategy.description}</Text>
              </View>

              {/* 过往业绩 */}
              <View style={styles.strategySection}>
                <Text style={styles.strategySectionTitle}>近期业绩</Text>
                <View style={styles.historyContainer}>
                  {strategy.history.map((item, index) => (
                    <View key={index} style={styles.historyItem}>
                      <Text style={styles.historyText}>{item}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* 策略特点 */}
              <View style={styles.strategySection}>
                <Text style={styles.strategySectionTitle}>策略特点</Text>
                <View className="flex-row flex-wrap">
                  {strategy.features.map((feature, index) => (
                    <View key={index} style={styles.featureTag}>
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* 跟单合作 */}
              <View style={styles.strategySection}>
                <Text style={styles.strategySectionTitle}>跟单合作</Text>
                <View style={styles.profitInfo}>
                  <View style={styles.profitItem}>
                    <Text style={styles.profitLabel}>分成比例</Text>
                    <Text style={styles.profitValue}>{strategy.profit}</Text>
                  </View>
                  <View style={styles.profitItem}>
                    <Text style={styles.profitLabel}>结算周期</Text>
                    <Text style={styles.profitValue}>{strategy.cycle}</Text>
                  </View>
                  <View style={styles.profitItem}>
                    <Text style={styles.profitLabel}>最低金额</Text>
                    <Text style={styles.profitValue}>{strategy.minAmount}</Text>
                  </View>
                </View>
              </View>

              {/* 我要跟单按钮 */}
              <TouchableOpacity 
                style={styles.entrustButton}
                onPress={() => handleEntrust(strategy)}
              >
                <Ionicons name="wallet-outline" size={18} color="#fff" />
                <Text style={styles.entrustButtonText}>我要跟单</Text>
              </TouchableOpacity>

              {/* 跟投人数 */}
              <View style={styles.usersContainer}>
                <Ionicons name="people" size={14} color="#6B7280" />
                <Text style={styles.usersText}>{strategy.users}人已跟单</Text>
              </View>
            </View>
          ))}
        </View>

        {/* 底部间距 */}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* 跟单 Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>跟单申请</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {selectedStrategy && (
              <View style={styles.modalStrategyInfo}>
                <Text style={styles.modalStrategyName}>{selectedStrategy.name}</Text>
                <View style={styles.modalStrategyReturns}>
                  <Text style={styles.modalReturnsText}>{selectedStrategy.returns}</Text>
                  <Text style={styles.modalReturnsLabel}>月化收益</Text>
                </View>
              </View>
            )}

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>跟单金额 (USDT)</Text>
              <TextInput
                style={styles.formInput}
                value={entrustAmount}
                onChangeText={setEntrustAmount}
                placeholder={`最低 ${selectedStrategy?.minAmount || '$100'}`}
                placeholderTextColor="#6B7280"
                keyboardType="numeric"
              />
              <Text style={styles.formHint}>可用余额充足，资金将转入策略托管账户</Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>跟单期限</Text>
              <View style={styles.periodSelector}>
                {['1个月', '3个月', '6个月', '12个月'].map((period) => (
                  <TouchableOpacity
                    key={period}
                    style={[
                      styles.periodButton,
                      entrustPeriod === period && styles.periodButtonActive
                    ]}
                    onPress={() => setEntrustPeriod(period)}
                  >
                    <Text style={[
                      styles.periodButtonText,
                      entrustPeriod === period && styles.periodButtonTextActive
                    ]}>
                      {period}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>收款链接（BNB Chain 地址）</Text>
              <TextInput
                style={styles.formInput}
                value={paymentLink}
                onChangeText={setPaymentLink}
                placeholder="请输入您的 BNB Chain 收款地址"
                placeholderTextColor="#6B7280"
                autoCapitalize="none"
              />
              <View style={styles.addressHint}>
                <Ionicons name="information-circle" size={12} color="#8B5CF6" />
                <Text style={styles.addressHintText}>使用此地址在 BNB Chain 上接收代币</Text>
              </View>
            </View>

            <View style={styles.agreementSection}>
              <Ionicons name="shield-checkmark" size={16} color="#22C55E" />
              <Text style={styles.agreementText}>我已阅读并同意《AI策略跟单协议》</Text>
            </View>

            <TouchableOpacity 
              style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
              onPress={handleSubmitEntrust}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.submitButtonText}>提交跟单申请</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.disclaimer}>
              * 投资有风险，跟单需谨慎。过往业绩不代表未来表现。
            </Text>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  backButton: {
    position: 'absolute',
    top: 15,
    left: 15,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  container: {
    flex: 1,
    backgroundColor: '#0F0F14',
  },
  hero: {
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20,
    backgroundColor: '#1A1A24',
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 15,
    paddingVertical: 20,
  },
  statItem: {
    width: '50%',
    alignItems: 'center',
    paddingVertical: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 6,
  },
  statLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
  },
  cooperationSection: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  cooperationCard: {
    backgroundColor: '#1A1A24',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#8B5CF6',
  },
  cooperationItem: {
    flex: 1,
    alignItems: 'center',
  },
  cooperationValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B5CF6',
    marginBottom: 4,
  },
  cooperationLabel: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  cooperationDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#374151',
    marginHorizontal: 10,
  },
  cooperationNote: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  cooperationNoteText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 6,
    flex: 1,
  },
  strategyCard: {
    backgroundColor: '#1A1A24',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2D2D3A',
  },
  strategyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  strategyHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  strategyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginRight: 12,
  },
  returnsBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  returnsText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#22C55E',
  },
  returnsLabel: {
    fontSize: 10,
    color: '#22C55E',
    marginLeft: 2,
  },
  riskBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  riskText: {
    fontSize: 12,
    fontWeight: '600',
  },
  strategySection: {
    marginBottom: 16,
  },
  strategySectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8B5CF6',
    marginBottom: 8,
  },
  strategyDesc: {
    fontSize: 14,
    color: '#D1D5DB',
    lineHeight: 22,
  },
  historyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  historyItem: {
    flex: 1,
    backgroundColor: '#0F0F14',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
  },
  historyText: {
    fontSize: 12,
    color: '#22C55E',
    fontWeight: '500',
  },
  featureTag: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  featureText: {
    fontSize: 12,
    color: '#A78BFA',
  },
  profitInfo: {
    flexDirection: 'row',
    backgroundColor: '#0F0F14',
    borderRadius: 12,
    padding: 12,
  },
  profitItem: {
    flex: 1,
    alignItems: 'center',
  },
  profitLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 4,
  },
  profitValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  entrustButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5CF6',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  entrustButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 8,
  },
  usersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  usersText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1A1A24',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalStrategyInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0F0F14',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  modalStrategyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  modalStrategyReturns: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  modalReturnsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#22C55E',
  },
  modalReturnsLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#0F0F14',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#374151',
  },
  formHint: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 6,
  },
  addressHint: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginTop: 8,
  },
  addressHintText: {
    fontSize: 11,
    color: '#8B5CF6',
    marginLeft: 4,
  },
  periodSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: '#0F0F14',
    marginRight: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  periodButtonActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderColor: '#8B5CF6',
  },
  periodButtonText: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  periodButtonTextActive: {
    color: '#8B5CF6',
    fontWeight: '600',
  },
  agreementSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  agreementText: {
    fontSize: 13,
    color: '#22C55E',
    marginLeft: 6,
  },
  submitButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  submitButtonDisabled: {
    backgroundColor: '#6B7280',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  disclaimer: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
  },
});
