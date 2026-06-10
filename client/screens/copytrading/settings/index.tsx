/**
 * 跟单设置页面
 * KAIROS 行情筛选器
 */

'use client';

import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Switch, Alert } from 'react-native';
import { Screen } from '@/components/Screen';
import { Ionicons } from '@expo/vector-icons';
import { useSafeRouter } from '@/hooks/useSafeRouter';

export default function CopySettingsPage() {
  const router = useSafeRouter();
  const [ratio, setRatio] = useState('50'); // 跟单比例
  const [stopLoss, setStopLoss] = useState('10'); // 止损比例
  const [takeProfit, setTakeProfit] = useState('20'); // 止盈比例
  const [maxAmount, setMaxAmount] = useState('1000'); // 最大跟单金额
  const [autoCopy, setAutoCopy] = useState(true); // 自动跟单

  const handleSave = () => {
    Alert.alert('设置已保存', '您的跟单设置已更新', [
      { text: '确定', onPress: () => router.back() }
    ]);
  };

  return (
    <Screen>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Trader Info */}
        <View style={styles.traderCard}>
          <View style={styles.traderAvatar}>
            <Text style={styles.traderAvatarText}>币</Text>
          </View>
          <View style={styles.traderInfo}>
            <Text style={styles.traderName}>币神张三</Text>
            <Text style={styles.traderTags}>连胜中 | 高胜率</Text>
          </View>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>跟单设置</Text>

          {/* Ratio */}
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>跟单比例</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={ratio}
                onChangeText={setRatio}
                keyboardType="numeric"
                maxLength={3}
              />
              <Text style={styles.inputSuffix}>%</Text>
            </View>
          </View>
          <Text style={styles.settingHint}>每次交易按此比例跟随，50%表示跟随一半仓位</Text>

          {/* Stop Loss */}
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>止损比例</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={stopLoss}
                onChangeText={setStopLoss}
                keyboardType="numeric"
                maxLength={3}
              />
              <Text style={styles.inputSuffix}>%</Text>
            </View>
          </View>
          <Text style={styles.settingHint}>亏损达到此比例时自动平仓止损</Text>

          {/* Take Profit */}
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>止盈比例</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={takeProfit}
                onChangeText={setTakeProfit}
                keyboardType="numeric"
                maxLength={3}
              />
              <Text style={styles.inputSuffix}>%</Text>
            </View>
          </View>
          <Text style={styles.settingHint}>盈利达到此比例时自动平仓止盈</Text>

          {/* Max Amount */}
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>最大跟单金额</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={maxAmount}
                onChangeText={setMaxAmount}
                keyboardType="numeric"
                maxLength={6}
              />
              <Text style={styles.inputSuffix}>U</Text>
            </View>
          </View>
          <Text style={styles.settingHint}>单次跟单最高金额，超出后不再跟单</Text>

          {/* Auto Copy */}
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>自动跟单</Text>
            <Switch
              value={autoCopy}
              onValueChange={setAutoCopy}
              trackColor={{ false: '#2A2A3E', true: '#00F0FF' }}
              thumbColor="#FFFFFF"
            />
          </View>
          <Text style={styles.settingHint}>开启后，交易员开仓时自动跟随</Text>
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>保存设置</Text>
        </TouchableOpacity>

        {/* Cancel */}
        <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
          <Text style={styles.cancelButtonText}>取消</Text>
        </TouchableOpacity>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  traderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#12121A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#1F1F2E',
  },
  traderAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0, 240, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  traderAvatarText: {
    fontSize: 24,
    color: '#00F0FF',
    fontWeight: 'bold',
  },
  traderInfo: {
    flex: 1,
  },
  traderName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  traderTags: {
    fontSize: 13,
    color: '#6B7280',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#12121A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#1F1F2E',
  },
  settingLabel: {
    fontSize: 15,
    color: '#FFFFFF',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  input: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
    minWidth: 50,
  },
  inputSuffix: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  settingHint: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 12,
    marginLeft: 4,
  },
  saveButton: {
    backgroundColor: '#00F0FF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0A0A0F',
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9CA3AF',
  },
});
