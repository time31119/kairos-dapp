import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Alert, Platform } from 'react-native';
import { Screen } from '@/components/Screen';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { Ionicons } from '@expo/vector-icons';
import { useWeb3 } from '@/contexts/Web3Context';

// 暗黑科技风配色
const colors = {
  background: '#0A0A0F',
  card: '#12121A',
  cardBorder: '#1F1F2E',
  neonCyan: '#00F0FF',
  neonPurple: '#BF00FF',
  text: '#FFFFFF',
  textSecondary: '#8E8E9A',
  success: '#00FF88',
  warning: '#FFB800',
  error: '#FF4444',
};

// KYC 认证级别
const KYC_LEVELS = [
  {
    level: 1,
    name: '基础认证',
    requirements: ['邮箱验证', '手机验证'],
    benefits: ['基础交易', '每日提现 $1,000'],
    status: 'completed',
    color: colors.success,
  },
  {
    level: 2,
    name: '高级认证',
    requirements: ['身份证认证', '人脸识别', '地址验证'],
    benefits: ['高级交易', '每日提现 $10,000', '合约交互'],
    status: 'pending',
    color: colors.warning,
  },
  {
    level: 3,
    name: 'VIP 认证',
    requirements: ['银行流水', '收入证明', '视频认证'],
    benefits: ['无限交易', '无限提现', '专属客服', '优先上币'],
    status: 'locked',
    color: colors.neonPurple,
  },
];

export default function KYCPage() {
  const router = useSafeRouter();
  const { wallet } = useWeb3();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    realName: '',
    idNumber: '',
    address: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (step === 1) {
      if (!formData.email || !formData.phone) {
        Alert.alert('提示', '请填写邮箱和手机号');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!formData.realName || !formData.idNumber) {
        Alert.alert('提示', '请填写真实姓名和身份证号');
        return;
      }
      // 模拟提交
      Alert.alert(
        '提交成功',
        '您的 KYC 认证申请已提交，审核结果将在 24 小时内通知您。',
        [{ text: '确定', onPress: () => router.back() }]
      );
    }
  };

  const currentLevel = KYC_LEVELS[1]; // 当前进行中的认证

  return (
    <Screen style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>KYC 身份认证</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        {KYC_LEVELS.map((item, index) => (
          <View key={item.level} style={styles.progressItem}>
            <View style={[
              styles.progressDot,
              { 
                backgroundColor: item.status === 'completed' ? colors.success 
                  : item.status === 'pending' ? colors.warning 
                  : colors.textSecondary,
                borderColor: item.status === 'pending' ? colors.warning : 'transparent',
              }
            ]}>
              {item.status === 'completed' && (
                <Ionicons name="checkmark" size={12} color={colors.background} />
              )}
              {item.status === 'pending' && (
                <Text style={styles.progressDotText}>{item.level}</Text>
              )}
              {item.status === 'locked' && (
                <Ionicons name="lock-closed" size={10} color={colors.text} />
              )}
            </View>
            <Text style={[
              styles.progressLabel,
              item.status === 'pending' && { color: colors.warning }
            ]}>
              {item.name}
            </Text>
          </View>
        ))}
      </View>

      {/* Current Level Card */}
      <View style={styles.levelCard}>
        <View style={styles.levelHeader}>
          <View style={[styles.levelBadge, { backgroundColor: currentLevel.color + '20' }]}>
            <Text style={[styles.levelBadgeText, { color: currentLevel.color }]}>
              Lv.{currentLevel.level}
            </Text>
          </View>
          <Text style={styles.levelName}>{currentLevel.name}</Text>
        </View>
        
        <View style={styles.levelSection}>
          <Text style={styles.sectionTitle}>认证要求</Text>
          {currentLevel.requirements.map((req, index) => (
            <View key={index} style={styles.requirementItem}>
              <Ionicons name="checkbox-outline" size={18} color={colors.warning} />
              <Text style={styles.requirementText}>{req}</Text>
            </View>
          ))}
        </View>

        <View style={styles.levelSection}>
          <Text style={styles.sectionTitle}>认证权益</Text>
          {currentLevel.benefits.map((benefit, index) => (
            <View key={index} style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={18} color={colors.success} />
              <Text style={styles.benefitText}>{benefit}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Form */}
      <ScrollView style={styles.formContainer}>
        {step === 1 && (
          <View style={styles.formSection}>
            <Text style={styles.formTitle}>基本信息</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>钱包地址</Text>
              <View style={styles.walletDisplay}>
                <Text style={styles.walletAddress}>
                  {wallet.address ? `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}` : '未连接'}
                </Text>
                {wallet.isConnected && (
                  <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                )}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>邮箱地址</Text>
              <TextInput
                style={styles.input}
                placeholder="请输入邮箱"
                placeholderTextColor={colors.textSecondary}
                value={formData.email}
                onChangeText={(v) => handleInputChange('email', v)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>手机号码</Text>
              <TextInput
                style={styles.input}
                placeholder="请输入手机号"
                placeholderTextColor={colors.textSecondary}
                value={formData.phone}
                onChangeText={(v) => handleInputChange('phone', v)}
                keyboardType="phone-pad"
              />
            </View>
          </View>
        )}

        {step === 2 && (
          <View style={styles.formSection}>
            <Text style={styles.formTitle}>身份信息</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>真实姓名</Text>
              <TextInput
                style={styles.input}
                placeholder="请输入真实姓名"
                placeholderTextColor={colors.textSecondary}
                value={formData.realName}
                onChangeText={(v) => handleInputChange('realName', v)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>身份证号</Text>
              <TextInput
                style={styles.input}
                placeholder="请输入身份证号"
                placeholderTextColor={colors.textSecondary}
                value={formData.idNumber}
                onChangeText={(v) => handleInputChange('idNumber', v)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>居住地址</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="请输入详细居住地址"
                placeholderTextColor={colors.textSecondary}
                value={formData.address}
                onChangeText={(v) => handleInputChange('address', v)}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.agreement}>
              <Ionicons name="square-outline" size={20} color={colors.textSecondary} />
              <Text style={styles.agreementText}>
                我已阅读并同意《KYC 认证协议》和《隐私政策》
              </Text>
            </View>
          </View>
        )}

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>
            {step === 1 ? '下一步' : '提交认证'}
          </Text>
        </TouchableOpacity>

        {step === 2 && (
          <TouchableOpacity 
            style={styles.backButtonText} 
            onPress={() => setStep(1)}
          >
            <Text style={styles.backButtonTextInner}>返回上一步</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </Screen>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  progressItem: {
    alignItems: 'center',
  },
  progressDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  progressDotText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.background,
  },
  progressLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 8,
  },
  levelCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  levelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelBadgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  levelName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  levelSection: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  requirementText: {
    fontSize: 14,
    color: colors.text,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  benefitText: {
    fontSize: 14,
    color: colors.text,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  formSection: {
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  walletDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  walletAddress: {
    fontSize: 14,
    color: colors.text,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  agreement: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 8,
  },
  agreementText: {
    flex: 1,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  submitButton: {
    backgroundColor: colors.neonCyan,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.background,
  },
  backButtonText: {
    alignItems: 'center',
    padding: 12,
  },
  backButtonTextInner: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});
