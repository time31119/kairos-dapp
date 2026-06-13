/**
 * KYC 实名认证页面
 * KAIROS 行情筛选器
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Screen } from '@/components/Screen';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { Ionicons } from '@expo/vector-icons';

type VerificationStep = 'select' | 'id_card' | 'face_verify' | 'complete';

export default function KycScreen() {
  const router = useSafeRouter();
  const [step, setStep] = useState<VerificationStep>('select');
  const [loading, setLoading] = useState(false);
  
  // 身份证信息
  const [idName, setIdName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  
  // 认证状态
  const [kycStatus] = useState<'none' | 'pending' | 'approved'>('none');

  // 处理步骤选择
  const handleSelectMethod = (method: 'id_card' | 'passport') => {
    setStep('id_card');
  };

  // 提交身份证信息
  const handleSubmitId = async () => {
    if (!idName.trim()) {
      Alert.alert('错误', '请输入真实姓名');
      return;
    }
    if (!idNumber.trim() || idNumber.length < 15) {
      Alert.alert('错误', '请输入正确的身份证号码');
      return;
    }

    setLoading(true);
    try {
      // 模拟 API 调用
      await new Promise(resolve => setTimeout(resolve, 1500));
      setStep('face_verify');
    } catch (error) {
      Alert.alert('错误', '提交失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 人脸验证
  const handleFaceVerify = async () => {
    setLoading(true);
    try {
      // 模拟人脸验证
      await new Promise(resolve => setTimeout(resolve, 2000));
      setStep('complete');
      Alert.alert('成功', '实名认证已提交，请等待审核');
    } catch (error) {
      Alert.alert('错误', '认证失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const renderProgress = () => {
    const steps = [
      { key: 'select', label: '选择方式' },
      { key: 'id_card', label: '身份信息' },
      { key: 'face_verify', label: '人脸识别' },
      { key: 'complete', label: '完成' },
    ];
    
    const currentIndex = steps.findIndex(s => s.key === step);
    
    return (
      <View style={styles.progressContainer}>
        {steps.map((s, index) => (
          <View key={s.key} style={styles.progressItem}>
            <View
              style={[
                styles.progressDot,
                index <= currentIndex && styles.progressDotActive,
              ]}
            >
              {index < currentIndex ? (
                <Ionicons name="checkmark" size={12} color="#0A0A0F" />
              ) : (
                <Text
                  style={[
                    styles.progressDotText,
                    index <= currentIndex && styles.progressDotTextActive,
                  ]}
                >
                  {index + 1}
                </Text>
              )}
            </View>
            <Text
              style={[
                styles.progressLabel,
                index <= currentIndex && styles.progressLabelActive,
              ]}
            >
              {s.label}
            </Text>
            {index < steps.length - 1 && (
              <View
                style={[
                  styles.progressLine,
                  index < currentIndex && styles.progressLineActive,
                ]}
              />
            )}
          </View>
        ))}
      </View>
    );
  };

  const renderSelectMethod = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>选择认证方式</Text>
      <Text style={styles.stepDesc}>
        请选择您希望的认证方式，我们支持以下两种实名认证方式：
      </Text>

      <TouchableOpacity
        style={styles.methodCard}
        onPress={() => handleSelectMethod('id_card')}
      >
        <View style={[styles.methodIcon, { backgroundColor: 'rgba(0, 240, 255, 0.1)' }]}>
          <Ionicons name="card-outline" size={32} color="#00F0FF" />
        </View>
        <View style={styles.methodInfo}>
          <Text style={styles.methodTitle}>身份证认证</Text>
          <Text style={styles.methodDesc}>
            使用本人身份证进行认证，需要拍摄身份证正反面照片
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#666" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.methodCard}
        onPress={() => handleSelectMethod('passport')}
      >
        <View style={[styles.methodIcon, { backgroundColor: 'rgba(168, 85, 247, 0.1)' }]}>
          <Ionicons name="document-text-outline" size={32} color="#A855F7" />
        </View>
        <View style={styles.methodInfo}>
          <Text style={styles.methodTitle}>护照认证</Text>
          <Text style={styles.methodDesc}>
            使用护照进行认证，需要拍摄护照照片
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#666" />
      </TouchableOpacity>
    </View>
  );

  const renderIdCard = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>填写身份信息</Text>
      <Text style={styles.stepDesc}>
        请确保填写的信息与证件上的信息完全一致
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>真实姓名</Text>
        <TextInput
          style={styles.input}
          placeholder="请输入证件上的姓名"
          placeholderTextColor="#666"
          value={idName}
          onChangeText={setIdName}
          autoCapitalize="characters"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>身份证号码</Text>
        <TextInput
          style={styles.input}
          placeholder="请输入18位身份证号码"
          placeholderTextColor="#666"
          value={idNumber}
          onChangeText={setIdNumber}
          keyboardType="number-pad"
          maxLength={18}
        />
      </View>

      <View style={styles.photoGuide}>
        <Text style={styles.photoGuideTitle}>身份证照片要求</Text>
        <View style={styles.photoRequirements}>
          <View style={styles.photoItem}>
            <View style={[styles.photoBox, { borderColor: '#FFD700' }]}>
              <Ionicons name="camera-outline" size={24} color="#FFD700" />
              <Text style={styles.photoBoxText}>身份证人像面</Text>
            </View>
          </View>
          <View style={styles.photoItem}>
            <View style={[styles.photoBox, { borderColor: '#00F0FF' }]}>
              <Ionicons name="camera-outline" size={24} color="#00F0FF" />
              <Text style={styles.photoBoxText}>身份证国徽面</Text>
            </View>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        onPress={handleSubmitId}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#0A0A0F" />
        ) : (
          <Text style={styles.submitButtonText}>下一步</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderFaceVerify = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>人脸识别验证</Text>
      <Text style={styles.stepDesc}>
        请在光线充足的环境下，将脸部对准识别区域
      </Text>

      <View style={styles.faceVerifyContainer}>
        <View style={styles.faceFrame}>
          <View style={[styles.faceCorner, styles.faceCornerTL]} />
          <View style={[styles.faceCorner, styles.faceCornerTR]} />
          <View style={[styles.faceCorner, styles.faceCornerBL]} />
          <View style={[styles.faceCorner, styles.faceCornerBR]} />
          <Ionicons name="person-outline" size={80} color="rgba(0, 240, 255, 0.3)" />
        </View>
        <Text style={styles.faceHint}>请将面部对准框内</Text>
      </View>

      <View style={styles.tipsContainer}>
        <View style={styles.tipItem}>
          <Ionicons name="checkmark-circle" size={16} color="#00FF88" />
          <Text style={styles.tipText}>保持面部清晰可见</Text>
        </View>
        <View style={styles.tipItem}>
          <Ionicons name="checkmark-circle" size={16} color="#00FF88" />
          <Text style={styles.tipText}>光线充足，避免背光</Text>
        </View>
        <View style={styles.tipItem}>
          <Ionicons name="checkmark-circle" size={16} color="#00FF88" />
          <Text style={styles.tipText}>摘下墨镜、帽子等遮挡物</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        onPress={handleFaceVerify}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#0A0A0F" />
        ) : (
          <Text style={styles.submitButtonText}>开始验证</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderComplete = () => (
    <View style={styles.stepContent}>
      <View style={styles.completeIcon}>
        <Ionicons name="checkmark-circle" size={80} color="#00FF88" />
      </View>
      <Text style={styles.completeTitle}>实名认证已提交</Text>
      <Text style={styles.completeDesc}>
        您的实名认证申请已提交，审核结果将在1-3个工作日内完成。
        审核结果将以站内信形式通知您。
      </Text>

      <TouchableOpacity
        style={styles.doneButton}
        onPress={() => router.back()}
      >
        <Text style={styles.doneButtonText}>返回</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Screen>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#00F0FF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>实名认证</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {renderProgress()}

        {step === 'select' && renderSelectMethod()}
        {step === 'id_card' && renderIdCard()}
        {step === 'face_verify' && renderFaceVerify()}
        {step === 'complete' && renderComplete()}
      </ScrollView>
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
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  progressItem: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  progressDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1A1A1F',
    borderWidth: 2,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressDotActive: {
    backgroundColor: '#00F0FF',
    borderColor: '#00F0FF',
  },
  progressDotText: {
    fontSize: 10,
    color: '#666',
    fontWeight: 'bold',
  },
  progressDotTextActive: {
    color: '#0A0A0F',
  },
  progressLabel: {
    fontSize: 11,
    color: '#666',
  },
  progressLabelActive: {
    color: '#00F0FF',
  },
  progressLine: {
    position: 'absolute',
    top: 12,
    left: '60%',
    width: '80%',
    height: 2,
    backgroundColor: '#333',
  },
  progressLineActive: {
    backgroundColor: '#00F0FF',
  },
  stepContent: {
    padding: 16,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  stepDesc: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 24,
    lineHeight: 20,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1F',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  methodIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  methodInfo: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  methodDesc: {
    fontSize: 13,
    color: '#9CA3AF',
    lineHeight: 18,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1A1A1F',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#333',
  },
  photoGuide: {
    marginTop: 16,
  },
  photoGuideTitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 12,
  },
  photoRequirements: {
    flexDirection: 'row',
    gap: 12,
  },
  photoItem: {
    flex: 1,
  },
  photoBox: {
    height: 100,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1A1F',
  },
  photoBoxText: {
    fontSize: 11,
    color: '#666',
    marginTop: 8,
  },
  submitButton: {
    backgroundColor: '#00F0FF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonDisabled: {
    backgroundColor: '#333',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0A0A0F',
  },
  faceVerifyContainer: {
    alignItems: 'center',
    marginVertical: 32,
  },
  faceFrame: {
    width: 200,
    height: 260,
    borderRadius: 20,
    backgroundColor: '#1A1A1F',
    borderWidth: 2,
    borderColor: '#00F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  faceCorner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#FFD700',
  },
  faceCornerTL: {
    top: -2,
    left: -2,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 20,
  },
  faceCornerTR: {
    top: -2,
    right: -2,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 20,
  },
  faceCornerBL: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 20,
  },
  faceCornerBR: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 20,
  },
  faceHint: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 16,
  },
  tipsContainer: {
    backgroundColor: '#1A1A1F',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  tipText: {
    fontSize: 13,
    color: '#D1D5DB',
    marginLeft: 8,
  },
  completeIcon: {
    alignItems: 'center',
    marginVertical: 40,
  },
  completeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  completeDesc: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  doneButton: {
    backgroundColor: '#00F0FF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 32,
    marginHorizontal: 16,
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0A0A0F',
  },
});
