/**
 * 客服帮助页面
 * DAPP 行情筛选器
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Screen } from '@/components/Screen';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { Ionicons } from '@expo/vector-icons';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

interface ServiceItem {
  id: string;
  icon: string;
  title: string;
  description: string;
  action: () => void;
}

const faqData: FAQItem[] = [
  {
    id: '1',
    question: '如何开通会员？',
    answer: '您可以在"我的"页面点击"开通会员"按钮，选择合适的套餐进行支付开通。支付成功后，会员权益将立即生效。',
  },
  {
    id: '2',
    question: '会员可以退款吗？',
    answer: '会员开通后7天内如需退款，请联系在线客服处理。超过7天的将无法退款，但会员权益将继续有效至到期日。',
  },
  {
    id: '3',
    question: '如何添加自选？',
    answer: '在行情页面或代币详情页，点击代币右侧的"⭐"图标即可添加自选。您也可以在搜索页面搜索代币后添加。',
  },
  {
    id: '4',
    question: '实盘交易如何操作？',
    answer: '实盘交易功能需要先完成实名认证。在"我的实盘"页面，您可以查看持仓、历史订单，并进行平仓等操作。',
  },
  {
    id: '5',
    question: '一键跟单是什么？',
    answer: '一键跟单允许您复制优秀交易员的操作策略。当交易员开仓时，您的账户会自动以相同方向开仓。',
  },
  {
    id: '6',
    question: '如何联系客服？',
    answer: '您可以通过以下方式联系我们：1. 在线客服（工作时间 9:00-21:00）；2. 发送邮件至 support@dapp.com',
  },
  {
    id: '7',
    question: '数据多久更新一次？',
    answer: '行情数据实时更新，筛选结果每分钟刷新一次，会员专属功能会有更快的更新频率。',
  },
  {
    id: '8',
    question: '如何取消跟单？',
    answer: '在"我的跟单"页面，点击要取消的交易员，选择"停止跟单"即可取消跟单关系。',
  },
];

export default function SupportScreen() {
  const router = useSafeRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [contactType, setContactType] = useState<'online' | 'email' | 'phone'>('online');

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleServiceClick = (type: string) => {
    switch (type) {
      case 'online':
        Alert.alert('提示', '在线客服功能即将上线，请通过其他方式联系我们');
        break;
      case 'feedback':
        setShowContactModal(true);
        break;
      case 'email':
        Alert.alert('提示', '请发送邮件至 support@dapp.com');
        break;
      case 'phone':
        Alert.alert('提示', '客服热线：400-888-8888');
        break;
    }
  };

  const handleSubmitFeedback = () => {
    if (!feedbackText.trim()) {
      Alert.alert('错误', '请输入反馈内容');
      return;
    }
    Alert.alert('成功', '感谢您的反馈，我们会尽快处理');
    setShowContactModal(false);
    setFeedbackText('');
  };

  const serviceItems: ServiceItem[] = [
    {
      id: 'online',
      icon: 'chatbubbles-outline',
      title: '在线客服',
      description: '工作时间 9:00-21:00',
      action: () => handleServiceClick('online'),
    },
    {
      id: 'feedback',
      icon: 'create-outline',
      title: '意见反馈',
      description: '提交您的建议或问题',
      action: () => handleServiceClick('feedback'),
    },
    {
      id: 'email',
      icon: 'mail-outline',
      title: '邮件联系',
      description: 'support@dapp.com',
      action: () => handleServiceClick('email'),
    },
    {
      id: 'phone',
      icon: 'call-outline',
      title: '电话客服',
      description: '400-888-8888',
      action: () => handleServiceClick('phone'),
    },
  ];

  return (
    <Screen>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#00F0FF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>客服与帮助</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Service Channels */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>联系客服</Text>
          <View style={styles.serviceGrid}>
            {serviceItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.serviceCard}
                onPress={item.action}
              >
                <View style={[styles.serviceIcon, { backgroundColor: 'rgba(0, 240, 255, 0.1)' }]}>
                  <Ionicons name={item.icon as any} size={24} color="#00F0FF" />
                </View>
                <Text style={styles.serviceTitle}>{item.title}</Text>
                <Text style={styles.serviceDesc}>{item.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quick FAQ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>常见问题</Text>
          <View style={styles.faqContainer}>
            {faqData.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.faqItem}
                onPress={() => toggleExpand(item.id)}
              >
                <View style={styles.faqHeader}>
                  <Text style={styles.faqQuestion}>{item.question}</Text>
                  <Ionicons
                    name={expandedId === item.id ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color="#666"
                  />
                </View>
                {expandedId === item.id && (
                  <Text style={styles.faqAnswer}>{item.answer}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Operating Hours */}
        <View style={styles.section}>
          <View style={styles.hoursCard}>
            <View style={styles.hoursHeader}>
              <Ionicons name="time-outline" size={20} color="#00F0FF" />
              <Text style={styles.hoursTitle}>服务时间</Text>
            </View>
            <View style={styles.hoursInfo}>
              <View style={styles.hoursRow}>
                <Text style={styles.hoursLabel}>在线客服</Text>
                <Text style={styles.hoursValue}>09:00 - 21:00</Text>
              </View>
              <View style={styles.hoursRow}>
                <Text style={styles.hoursLabel}>电话客服</Text>
                <Text style={styles.hoursValue}>09:00 - 18:00</Text>
              </View>
              <View style={styles.hoursRow}>
                <Text style={styles.hoursLabel}>邮件回复</Text>
                <Text style={styles.hoursValue}>24小时内</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Version Info */}
        <View style={styles.versionInfo}>
          <Text style={styles.versionText}>DAPP v1.0.0</Text>
          <Text style={styles.copyrightText}>© 2024 DAPP. All rights reserved.</Text>
        </View>
      </ScrollView>

      {/* Feedback Modal */}
      <Modal
        visible={showContactModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowContactModal(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>意见反馈</Text>
              <TouchableOpacity onPress={() => setShowContactModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.feedbackType}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  contactType === 'online' && styles.typeButtonActive,
                ]}
                onPress={() => setContactType('online')}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    contactType === 'online' && styles.typeButtonTextActive,
                  ]}
                >
                  功能建议
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  contactType === 'email' && styles.typeButtonActive,
                ]}
                onPress={() => setContactType('email')}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    contactType === 'email' && styles.typeButtonTextActive,
                  ]}
                >
                  问题反馈
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  contactType === 'phone' && styles.typeButtonActive,
                ]}
                onPress={() => setContactType('phone')}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    contactType === 'phone' && styles.typeButtonTextActive,
                  ]}
                >
                  其他
                </Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.feedbackInput}
              placeholder="请详细描述您的问题或建议..."
              placeholderTextColor="#666"
              value={feedbackText}
              onChangeText={setFeedbackText}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmitFeedback}>
              <Text style={styles.submitButtonText}>提交反馈</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
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
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  serviceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  serviceCard: {
    width: '47%',
    backgroundColor: '#1A1A1F',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  serviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  serviceDesc: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  faqContainer: {
    backgroundColor: '#1A1A1F',
    borderRadius: 16,
    overflow: 'hidden',
  },
  faqItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    fontSize: 14,
    color: '#FFFFFF',
    flex: 1,
    marginRight: 12,
  },
  faqAnswer: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 12,
    lineHeight: 20,
  },
  hoursCard: {
    backgroundColor: '#1A1A1F',
    borderRadius: 16,
    padding: 16,
  },
  hoursHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  hoursTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  hoursInfo: {},
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  hoursLabel: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  hoursValue: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  versionInfo: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  versionText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  copyrightText: {
    fontSize: 11,
    color: '#444',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1A1A1F',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  feedbackType: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#2A2A2F',
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: 'rgba(0, 240, 255, 0.2)',
    borderWidth: 1,
    borderColor: '#00F0FF',
  },
  typeButtonText: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  typeButtonTextActive: {
    color: '#00F0FF',
  },
  feedbackInput: {
    backgroundColor: '#2A2A2F',
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: '#FFFFFF',
    minHeight: 120,
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: '#00F0FF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0A0A0F',
  },
});
