/**
 * VIP 会员中心页面
 * 支持钱包验证和智能合约交互
 */

import { Screen } from '@/components/Screen';
import { Stack } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { useState } from 'react';
import ContractInteraction from '@/components/ContractInteraction';
import { useWeb3 } from '@/contexts/Web3Context';

// 颜色配置 - 暗黑科技风
const colors = {
  background: '#0A0A0F',
  card: '#141420',
  neonCyan: '#00F0FF',
  neonPurple: '#BF00FF',
  neonGreen: '#00FF88',
  neonYellow: '#FFD700',
  text: '#FFFFFF',
  textSecondary: '#8A8A9A',
  muted: '#4A4A5A',
  border: '#2A2A3A',
};

export default function Membership() {
  const { wallet, signMessage } = useWeb3();
  const [activeTab, setActiveTab] = useState<'vip' | 'contracts'>('vip');

  // VIP 等级配置
  const vipLevels = [
    {
      level: 1,
      name: 'Bronze',
      color: '#CD7F32',
      price: '0.01 ETH',
      features: ['基础行情', '100 条筛选条件', '邮件提醒'],
    },
    {
      level: 2,
      name: 'Silver',
      color: '#C0C0C0',
      price: '0.05 ETH',
      features: ['高级行情', '无限筛选条件', '实时推送', '链上数据'],
    },
    {
      level: 3,
      name: 'Gold',
      color: '#FFD700',
      price: '0.1 ETH',
      features: ['全部功能', 'API 访问', '优先客服', '合约监控'],
    },
  ];

  const [selectedVip, setSelectedVip] = useState<number | null>(null);

  return (
    <Screen>
      <Stack.Screen
        options={{
          title: '会员中心',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.neonCyan,
        }}
      />

      {/* Tab 切换 */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'vip' && styles.tabActive]}
          onPress={() => setActiveTab('vip')}
        >
          <FontAwesome6
            name="crown"
            size={16}
            color={activeTab === 'vip' ? colors.neonCyan : colors.textSecondary}
          />
          <Text style={[styles.tabText, activeTab === 'vip' && styles.tabTextActive]}>
            VIP 会员
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'contracts' && styles.tabActive]}
          onPress={() => setActiveTab('contracts')}
        >
          <FontAwesome6
            name="code"
            size={16}
            color={activeTab === 'contracts' ? colors.neonCyan : colors.textSecondary}
          />
          <Text style={[styles.tabText, activeTab === 'contracts' && styles.tabTextActive]}>
            合约交互
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'vip' ? (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* 连接状态提示 */}
          {!wallet.isConnected && (
            <View style={styles.warningCard}>
              <FontAwesome6 name="exclamation-triangle" size={20} color={colors.neonYellow} />
              <Text style={styles.warningText}>
                连接钱包以购买 VIP 会员，解锁更多高级功能
              </Text>
            </View>
          )}

          {/* 当前 VIP 状态 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>当前会员</Text>
            <View style={styles.currentVipCard}>
              <View style={styles.currentVipInfo}>
                <FontAwesome6 name="crown" size={24} color={colors.neonYellow} />
                <View style={styles.currentVipText}>
                  <Text style={styles.currentVipLabel}>免费用户</Text>
                  <Text style={styles.currentVipDesc}>基础功能</Text>
                </View>
              </View>
              {wallet?.address && (
                <View style={styles.walletBadge}>
                  <Text style={styles.walletBadgeText}>
                    {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* VIP 套餐 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>升级套餐</Text>
            {vipLevels.map((vip) => (
              <TouchableOpacity
                key={vip.level}
                style={[
                  styles.vipCard,
                  selectedVip === vip.level && styles.vipCardSelected,
                  { borderColor: selectedVip === vip.level ? vip.color : colors.border },
                ]}
                onPress={() => setSelectedVip(vip.level)}
              >
                <View style={styles.vipHeader}>
                  <View style={styles.vipTitleRow}>
                    <FontAwesome6 name="crown" size={20} color={vip.color} />
                    <Text style={[styles.vipName, { color: vip.color }]}>{vip.name}</Text>
                  </View>
                  <Text style={styles.vipPrice}>{vip.price}</Text>
                </View>
                <View style={styles.vipFeatures}>
                  {vip.features.map((feature, index) => (
                    <View key={index} style={styles.featureItem}>
                      <FontAwesome6 name="check" size={12} color={colors.neonGreen} />
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))}
                </View>
                {selectedVip === vip.level && (
                  <View style={[styles.selectedBadge, { backgroundColor: vip.color }]}>
                    <Text style={styles.selectedBadgeText}>已选择</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* 购买按钮 */}
          {selectedVip && (
            <TouchableOpacity style={styles.purchaseButton}>
              <FontAwesome6 name="shopping-cart" size={18} color={colors.text} />
              <Text style={styles.purchaseButtonText}>立即购买</Text>
            </TouchableOpacity>
          )}

          {/* 合约验证 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>钱包验证</Text>
            <View style={styles.verifyCard}>
              <FontAwesome6 name="wallet" size={24} color={colors.neonCyan} />
              <View style={styles.verifyInfo}>
                <Text style={styles.verifyTitle}>签名验证</Text>
                <Text style={styles.verifyDesc}>
                  签名消息以验证您是钱包持有者
                </Text>
              </View>
              <TouchableOpacity
                style={styles.verifyButton}
                disabled={!wallet.isConnected}
                onPress={async () => {
                  try {
                    const message = `KAIROS VIP Verification\nWallet: ${wallet?.address}\nTimestamp: ${Date.now()}`;
                    await signMessage(message);
                  } catch (error) {
                    console.error('Sign error:', error);
                  }
                }}
              >
                <Text style={styles.verifyButtonText}>验证</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.footer} />
        </ScrollView>
      ) : (
        <ContractInteraction />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  tabActive: {
    backgroundColor: colors.neonCyan + '20',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.neonCyan,
  },
  content: {
    flex: 1,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neonYellow + '20',
    margin: 15,
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.neonYellow + '40',
  },
  warningText: {
    color: colors.neonYellow,
    marginLeft: 10,
    fontSize: 13,
    flex: 1,
  },
  section: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  currentVipCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
  },
  currentVipInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentVipText: {
    marginLeft: 12,
  },
  currentVipLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  currentVipDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  walletBadge: {
    backgroundColor: colors.neonCyan + '20',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  walletBadgeText: {
    fontSize: 12,
    color: colors.neonCyan,
    fontFamily: 'monospace',
  },
  vipCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
  },
  vipCardSelected: {
    backgroundColor: colors.card,
  },
  vipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  vipTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  vipName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  vipPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  vipFeatures: {
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  selectedBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  selectedBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.background,
  },
  purchaseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neonCyan,
    marginHorizontal: 15,
    marginVertical: 10,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  purchaseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.background,
  },
  verifyCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  verifyInfo: {
    flex: 1,
    marginLeft: 12,
  },
  verifyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  verifyDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  verifyButton: {
    backgroundColor: colors.neonPurple,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  verifyButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  footer: {
    height: 50,
  },
});
