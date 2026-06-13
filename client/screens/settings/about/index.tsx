import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { Screen } from '@/components/Screen';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { Ionicons } from '@expo/vector-icons';

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
};

const TEAM_MEMBERS = [
  { name: 'Alex Chen', role: 'Founder & CEO', avatar: 'A' },
  { name: 'Sarah Liu', role: 'CTO', avatar: 'S' },
  { name: 'Mike Wang', role: 'Head of Product', avatar: 'M' },
  { name: 'Lisa Zhang', role: 'Lead Developer', avatar: 'L' },
];

const PARTNERS = [
  { name: 'Binance Labs', type: '战略投资' },
  { name: 'Coinbase Ventures', type: '战略投资' },
  { name: 'Dragonfly Capital', type: '投资机构' },
];

export default function AboutPage() {
  const router = useSafeRouter();

  return (
    <Screen style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>关于我们</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Logo & Slogan */}
        <View style={styles.hero}>
          <View style={styles.logoContainer}>
            <Ionicons name="analytics" size={48} color={colors.neonCyan} />
          </View>
          <Text style={styles.appName}>KAIROS</Text>
          <Text style={styles.slogan}>让投资更简单</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
        </View>

        {/* Mission */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>我们的使命</Text>
          <View style={styles.missionCard}>
            <Text style={styles.missionText}>
              KAIROS 致力于为用户提供最专业的加密货币行情分析和投资工具。
              我们相信，去中心化金融将重塑全球金融体系，让每个人都能参与到这场变革中。
            </Text>
          </View>
        </View>

        {/* Team */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>核心团队</Text>
          <View style={styles.teamList}>
            {TEAM_MEMBERS.map((member, index) => (
              <View key={index} style={styles.teamMember}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{member.avatar}</Text>
                </View>
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{member.name}</Text>
                  <Text style={styles.memberRole}>{member.role}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Partners */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>合作伙伴</Text>
          <View style={styles.partnersList}>
            {PARTNERS.map((partner, index) => (
              <View key={index} style={styles.partnerItem}>
                <View style={styles.partnerIcon}>
                  <Ionicons name="business-outline" size={20} color={colors.neonPurple} />
                </View>
                <View>
                  <Text style={styles.partnerName}>{partner.name}</Text>
                  <Text style={styles.partnerType}>{partner.type}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>数据统计</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>100K+</Text>
              <Text style={styles.statLabel}>注册用户</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>$500M+</Text>
              <Text style={styles.statLabel}>交易量</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>50+</Text>
              <Text style={styles.statLabel}>支持币种</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>7x24</Text>
              <Text style={styles.statLabel}>客服支持</Text>
            </View>
          </View>
        </View>

        {/* Links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>更多链接</Text>
          <View style={styles.linksList}>
            <TouchableOpacity style={styles.linkItem}>
              <Ionicons name="document-text-outline" size={20} color={colors.text} />
              <Text style={styles.linkText}>使用条款</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.linkItem}>
              <Ionicons name="shield-checkmark-outline" size={20} color={colors.text} />
              <Text style={styles.linkText}>隐私政策</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.linkItem}>
              <Ionicons name="alert-circle-outline" size={20} color={colors.text} />
              <Text style={styles.linkText}>风险提示</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Social */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>关注我们</Text>
          <View style={styles.socialList}>
            <TouchableOpacity style={styles.socialItem}>
              <Ionicons name="logo-twitter" size={24} color="#1DA1F2" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialItem}>
              <Ionicons name="logo-discord" size={24} color="#5865F2" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialItem}>
              <Ionicons name="send" size={24} color="#0088CC" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialItem}>
              <Ionicons name="logo-youtube" size={24} color="#FF0000" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2024 KAIROS Finance. All rights reserved.</Text>
          <Text style={styles.footerSubtext}>注册于开曼群岛</Text>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: colors.text },
  content: { flex: 1, paddingHorizontal: 16 },
  hero: { alignItems: 'center', paddingVertical: 32 },
  logoContainer: {
    width: 80, height: 80, borderRadius: 20,
    backgroundColor: colors.neonCyan + '20',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: colors.neonCyan,
    marginBottom: 16,
  },
  appName: { fontSize: 28, fontWeight: 'bold', color: colors.text, letterSpacing: 4 },
  slogan: { fontSize: 16, color: colors.neonCyan, marginTop: 8 },
  version: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 12 },
  missionCard: {
    backgroundColor: colors.card, borderRadius: 16, padding: 20,
    borderWidth: 1, borderColor: colors.cardBorder,
  },
  missionText: { fontSize: 14, color: colors.textSecondary, lineHeight: 22 },
  teamList: { backgroundColor: colors.card, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: colors.cardBorder },
  teamMember: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.cardBorder },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.neonCyan + '20', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 18, fontWeight: '600', color: colors.neonCyan },
  memberInfo: { marginLeft: 12 },
  memberName: { fontSize: 15, fontWeight: '500', color: colors.text },
  memberRole: { fontSize: 13, color: colors.textSecondary },
  partnersList: { backgroundColor: colors.card, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: colors.cardBorder },
  partnerItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.cardBorder },
  partnerIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.neonPurple + '20', alignItems: 'center', justifyContent: 'center' },
  partnerName: { fontSize: 15, fontWeight: '500', color: colors.text, marginLeft: 12 },
  partnerType: { fontSize: 13, color: colors.textSecondary },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statItem: { flex: 1, minWidth: '45%', backgroundColor: colors.card, borderRadius: 16, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: colors.cardBorder },
  statValue: { fontSize: 24, fontWeight: 'bold', color: colors.neonCyan },
  statLabel: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  linksList: { backgroundColor: colors.card, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: colors.cardBorder },
  linkItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.cardBorder },
  linkText: { flex: 1, fontSize: 15, color: colors.text, marginLeft: 12 },
  socialList: { flexDirection: 'row', justifyContent: 'center', gap: 20 },
  socialItem: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.cardBorder },
  footer: { alignItems: 'center', paddingVertical: 32 },
  footerText: { fontSize: 13, color: colors.textSecondary },
  footerSubtext: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },
});
