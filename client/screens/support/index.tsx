import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Alert, Linking, Platform } from 'react-native';
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

// 常见问题分类
const FAQ_CATEGORIES = [
  {
    id: 'wallet',
    title: '钱包问题',
    icon: 'wallet-outline',
    questions: [
      { q: '如何连接钱包？', a: '点击"连接钱包"按钮，选择您使用的钱包（如 MetaMask），然后在钱包中确认连接请求。' },
      { q: '钱包连接失败怎么办？', a: '请确保您的钱包已解锁，并已授权该网站连接。如问题持续，请尝试刷新页面或切换网络。' },
      { q: '如何切换网络？', a: '在钱包中手动切换网络，或点击页面上的"切换网络"按钮，选择您想要的网络。' },
    ],
  },
  {
    id: 'transaction',
    title: '交易问题',
    icon: 'swap-horizontal-outline',
    questions: [
      { q: '交易失败怎么办？', a: '请检查：1) 余额是否充足；2) Gas 是否足够；3) 网络是否拥堵。如仍有问题，请联系客服。' },
      { q: '交易被卡住了？', a: '您可以在钱包中取消待处理交易，或等待网络拥堵缓解后自动完成。' },
      { q: '如何查看交易记录？', a: '在钱包中查看交易历史，或使用区块链浏览器搜索您的钱包地址。' },
    ],
  },
  {
    id: 'account',
    title: '账户问题',
    icon: 'person-outline',
    questions: [
      { q: '如何设置账户安全？', a: '我们建议您：1) 使用硬件钱包；2) 开启双因素认证；3) 定期检查授权记录。' },
      { q: '忘记密码怎么办？', a: '作为去中心化应用，我们不存储您的密码。请确保您已备份钱包助记词。' },
    ],
  },
];

// 联系方式
const CONTACT_METHODS = [
  { type: 'email', value: 'support@kairos.finance', icon: 'mail-outline' },
  { type: 'telegram', value: '@KAIROS_Finance', icon: 'send-outline' },
  { type: 'twitter', value: '@KAIROSFinance', icon: 'logo-twitter' },
  { type: 'discord', value: 'KAIROS Community', icon: 'logo-discord' },
];

export default function SupportPage() {
  const router = useSafeRouter();
  const { wallet } = useWeb3();
  
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [showTicketForm, setShowTicketForm] = useState(false);

  const handleSubmitTicket = () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert('提示', '请填写主题和详细描述');
      return;
    }
    
    // 模拟提交工单
    Alert.alert(
      '提交成功',
      '您的工单已提交，我们的团队将在 24 小时内回复您。',
      [{ text: '确定', onPress: () => {
        setSubject('');
        setMessage('');
        setShowTicketForm(false);
      }}]
    );
  };

  const handleContactPress = (type: string, value: string) => {
    switch (type) {
      case 'email':
        Linking.openURL(`mailto:${value}`);
        break;
      case 'telegram':
        Linking.openURL('https://t.me/KAIROS_Finance');
        break;
      case 'twitter':
        Linking.openURL('https://twitter.com/KAIROSFinance');
        break;
      case 'discord':
        Alert.alert('Discord', '请加入我们的 Discord 社区: https://discord.gg/kairos');
        break;
    }
  };

  return (
    <Screen style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>帮助与支持</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => setShowTicketForm(true)}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: colors.neonCyan + '20' }]}>
              <Ionicons name="create-outline" size={24} color={colors.neonCyan} />
            </View>
            <Text style={styles.quickActionText}>提交工单</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => Linking.openURL('https://docs.kairos.finance')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: colors.neonPurple + '20' }]}>
              <Ionicons name="document-text-outline" size={24} color={colors.neonPurple} />
            </View>
            <Text style={styles.quickActionText}>使用文档</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => Alert.alert('视频教程', '即将推出')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: colors.success + '20' }]}>
              <Ionicons name="play-circle-outline" size={24} color={colors.success} />
            </View>
            <Text style={styles.quickActionText}>视频教程</Text>
          </TouchableOpacity>
        </View>

        {/* Ticket Form */}
        {showTicketForm && (
          <View style={styles.ticketForm}>
            <View style={styles.ticketFormHeader}>
              <Text style={styles.sectionTitle}>提交工单</Text>
              <TouchableOpacity onPress={() => setShowTicketForm(false)}>
                <Ionicons name="close-circle" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {wallet.isConnected && (
              <View style={styles.walletInfo}>
                <Ionicons name="wallet" size={16} color={colors.neonCyan} />
                <Text style={styles.walletInfoText}>
                  {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}
                </Text>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>主题</Text>
              <TextInput
                style={styles.input}
                placeholder="请输入问题主题"
                placeholderTextColor={colors.textSecondary}
                value={subject}
                onChangeText={setSubject}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>详细描述</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="请详细描述您遇到的问题..."
                placeholderTextColor={colors.textSecondary}
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={5}
              />
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmitTicket}>
              <Text style={styles.submitButtonText}>提交工单</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* FAQ Section */}
        <View style={styles.faqSection}>
          <Text style={styles.sectionTitle}>常见问题</Text>
          
          {FAQ_CATEGORIES.map((category) => (
            <View key={category.id} style={styles.faqCategory}>
              <TouchableOpacity
                style={styles.faqCategoryHeader}
                onPress={() => setExpandedCategory(
                  expandedCategory === category.id ? null : category.id
                )}
              >
                <View style={styles.faqCategoryLeft}>
                  <Ionicons 
                    name={category.icon as any} 
                    size={20} 
                    color={colors.neonCyan} 
                  />
                  <Text style={styles.faqCategoryTitle}>{category.title}</Text>
                </View>
                <Ionicons
                  name={expandedCategory === category.id ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>

              {expandedCategory === category.id && (
                <View style={styles.faqQuestions}>
                  {category.questions.map((item, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.faqQuestion}
                      onPress={() => setExpandedQuestion(
                        expandedQuestion === `${category.id}-${index}` ? null : `${category.id}-${index}`
                      )}
                    >
                      <View style={styles.faqQuestionHeader}>
                        <Text style={styles.faqQuestionText}>Q: {item.q}</Text>
                        <Ionicons
                          name={expandedQuestion === `${category.id}-${index}` ? 'chevron-up' : 'chevron-down'}
                          size={16}
                          color={colors.textSecondary}
                        />
                      </View>
                      {expandedQuestion === `${category.id}-${index}` && (
                        <Text style={styles.faqAnswer}>A: {item.a}</Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Contact Us */}
        <View style={styles.contactSection}>
          <Text style={styles.sectionTitle}>联系我们</Text>
          
          <View style={styles.contactList}>
            {CONTACT_METHODS.map((contact, index) => (
              <TouchableOpacity
                key={index}
                style={styles.contactItem}
                onPress={() => handleContactPress(contact.type, contact.value)}
              >
                <View style={[styles.contactIcon, { backgroundColor: colors.card }]}>
                  <Ionicons name={contact.icon as any} size={20} color={colors.text} />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactType}>{contact.type.toUpperCase()}</Text>
                  <Text style={styles.contactValue}>{contact.value}</Text>
                </View>
                <Ionicons name="open-outline" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Community */}
        <View style={styles.communitySection}>
          <Text style={styles.sectionTitle}>社区</Text>
          <View style={styles.communityList}>
            <TouchableOpacity style={styles.communityItem}>
              <Ionicons name="logo-discord" size={24} color="#5865F2" />
              <Text style={styles.communityText}>Discord 社区</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.communityItem}>
              <Ionicons name="logo-twitter" size={24} color="#1DA1F2" />
              <Text style={styles.communityText}>Twitter</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.communityItem}>
              <Ionicons name="logo-reddit" size={24} color="#FF4500" />
              <Text style={styles.communityText}>Reddit</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>KAIROS Finance © 2024</Text>
          <Text style={styles.footerSubtext}>让投资更简单</Text>
        </View>
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
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '500',
  },
  ticketForm: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  ticketFormHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  walletInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.neonCyan + '10',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  walletInfoText: {
    fontSize: 13,
    color: colors.neonCyan,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: colors.neonCyan,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.background,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  faqSection: {
    marginBottom: 24,
  },
  faqCategory: {
    backgroundColor: colors.card,
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  faqCategoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  faqCategoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  faqCategoryTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
  },
  faqQuestions: {
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  faqQuestion: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  faqQuestionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  faqQuestionText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    marginRight: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    lineHeight: 20,
  },
  contactSection: {
    marginBottom: 24,
  },
  contactList: {
    backgroundColor: colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactInfo: {
    flex: 1,
    marginLeft: 12,
  },
  contactType: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  contactValue: {
    fontSize: 14,
    color: colors.text,
  },
  communitySection: {
    marginBottom: 24,
  },
  communityList: {
    flexDirection: 'row',
    gap: 12,
  },
  communityItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  communityText: {
    fontSize: 13,
    color: colors.text,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  footerText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  footerSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
});
