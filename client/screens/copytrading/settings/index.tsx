import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
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
};

export default function CopyTradingSettings() {
  const router = useSafeRouter();

  return (
    <Screen style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>跟单设置</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>跟单设置</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="cash-outline" size={20} color={colors.neonCyan} />
              <Text style={styles.settingLabel}>跟单仓位比例</Text>
            </View>
            <Text style={styles.settingValue}>50%</Text>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="shield-checkmark-outline" size={20} color={colors.neonCyan} />
              <Text style={styles.settingLabel}>止损比例</Text>
            </View>
            <Text style={styles.settingValue}>10%</Text>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="trending-up-outline" size={20} color={colors.neonCyan} />
              <Text style={styles.settingLabel}>止盈比例</Text>
            </View>
            <Text style={styles.settingValue}>20%</Text>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="wallet-outline" size={20} color={colors.neonCyan} />
              <Text style={styles.settingLabel}>最大跟单金额</Text>
            </View>
            <Text style={styles.settingValue}>$1,000</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>高级设置</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="sync-outline" size={20} color={colors.neonPurple} />
              <Text style={styles.settingLabel}>自动复利</Text>
            </View>
            <View style={styles.toggle}>
              <Text style={styles.toggleText}>关闭</Text>
            </View>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="notifications-outline" size={20} color={colors.neonPurple} />
              <Text style={styles.settingLabel}>开仓通知</Text>
            </View>
            <View style={[styles.toggle, { backgroundColor: colors.neonCyan + '20' }]}>
              <Text style={[styles.toggleText, { color: colors.neonCyan }]}>开启</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.dangerButton}>
            <Ionicons name="trash-outline" size={20} color={'#FF4444'} />
            <Text style={styles.dangerButtonText}>停止所有跟单</Text>
          </TouchableOpacity>
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
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 12 },
  settingItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.card, borderRadius: 12, padding: 16, marginBottom: 8,
    borderWidth: 1, borderColor: colors.cardBorder,
  },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingLabel: { fontSize: 15, color: colors.text },
  settingValue: { fontSize: 15, color: colors.neonCyan },
  toggle: {
    backgroundColor: colors.card, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8,
    borderWidth: 1, borderColor: colors.cardBorder,
  },
  toggleText: { fontSize: 13, color: colors.textSecondary },
  dangerButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#FF444420', borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: '#FF444440',
  },
  dangerButtonText: { fontSize: 15, color: '#FF4444' },
});
