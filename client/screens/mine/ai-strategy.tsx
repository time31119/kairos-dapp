import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { Screen } from '@/components/Screen';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

export default function AIStrategy() {
  const router = useSafeRouter();
  const [modalVisible, setModalVisible] = useState(false);

  // 策略数据
  const strategies = [
    { id: 1, name: '网格套利策略', description: '利用市场波动进行低买高卖，自动捕捉价差收益', returns: '+15.8%', risk: '低', users: 1234 },
    { id: 2, name: '趋势追踪策略', description: '基于AI技术识别市场趋势，顺势而为', returns: '+23.5%', risk: '中', users: 856 },
    { id: 3, name: '均值回归策略', description: '捕捉价格偏离均值的机会，自动回归时获利', returns: '+12.3%', risk: '低', users: 567 },
    { id: 4, name: '多空对冲策略', description: '同时做多做空，降低市场整体风险', returns: '+8.6%', risk: '中', users: 432 },
  ];

  // 统计数据
  const stats = [
    { label: '总管理资金', value: '$12.5M', icon: 'wallet-outline' },
    { label: '活跃用户', value: '3,200+', icon: 'people-outline' },
    { label: '累计收益', value: '$2.8M', icon: 'trending-up-outline' },
    { label: '策略数量', value: '12', icon: 'git-branch-outline' },
  ];

  return (
    <Screen>
      <ScrollView style={styles.container}>
        {/* Hero Section */}
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <FontAwesome5 name="brain" size={40} color="#8B5CF6" />
          </View>
          <Text style={styles.heroTitle}>AI策略交易</Text>
          <Text style={styles.heroSubtitle}>
            智能量化策略，自动执行，稳健收益
          </Text>
        </View>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statItem}>
              <Ionicons name={stat.icon as any} size={24} color="#8B5CF6" />
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* How it Works */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>工作原理</Text>
          <View style={styles.stepContainer}>
            <View style={styles.step}>
              <View style={[styles.stepIcon, { backgroundColor: '#EEF2FF' }]}>
                <MaterialCommunityIcons name="account-cash" size={24} color="#6366F1" />
              </View>
              <Text style={styles.stepTitle}>1. 资金划转</Text>
              <Text style={styles.stepDesc}>将资金划转至策略账户</Text>
            </View>
            <View style={styles.stepLine} />
            <View style={styles.step}>
              <View style={[styles.stepIcon, { backgroundColor: '#F3E8FF' }]}>
                <MaterialCommunityIcons name="robot" size={24} color="#9333EA" />
              </View>
              <Text style={styles.stepTitle}>2. AI运行</Text>
              <Text style={styles.stepDesc}>智能策略自动分析市场</Text>
            </View>
            <View style={styles.stepLine} />
            <View style={styles.step}>
              <View style={[styles.stepIcon, { backgroundColor: '#DCFCE7' }]}>
                <MaterialCommunityIcons name="cash-check" size={24} color="#22C55E" />
              </View>
              <Text style={styles.stepTitle}>3. 自动交易</Text>
              <Text style={styles.stepDesc}>7x24小时智能执行</Text>
            </View>
          </View>
        </View>

        {/* Strategy List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>热门策略</Text>
          {strategies.map((strategy) => (
            <View key={strategy.id} style={styles.strategyCard}>
              <View style={styles.strategyHeader}>
                <Text style={styles.strategyName}>{strategy.name}</Text>
                <View style={[styles.riskBadge, { backgroundColor: strategy.risk === '低' ? '#DCFCE7' : '#FEF3C7' }]}>
                  <Text style={[styles.riskText, { color: strategy.risk === '低' ? '#22C55E' : '#F59E0B' }]}>
                    {strategy.risk}风险
                  </Text>
                </View>
              </View>
              <Text style={styles.strategyDesc}>{strategy.description}</Text>
              <View style={styles.strategyFooter}>
                <View style={styles.strategyStat}>
                  <Ionicons name="trending-up" size={16} color="#22C55E" />
                  <Text style={styles.strategyReturns}>{strategy.returns}</Text>
                </View>
                <View style={styles.strategyStat}>
                  <Ionicons name="people" size={16} color="#6B7280" />
                  <Text style={styles.strategyUsers}>{strategy.users}人跟投</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* CTA Button */}
        <View style={styles.ctaContainer}>
          <TouchableOpacity 
            style={styles.ctaButton}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="flash" size={20} color="#fff" />
            <Text style={styles.ctaButtonText}>立即开通服务</Text>
          </TouchableOpacity>
          <Text style={styles.ctaNote}>会员尊享 | 最低 $100 起投</Text>
        </View>

        {/* Coming Soon Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalIcon}>
                <Ionicons name="construct" size={40} color="#8B5CF6" />
              </View>
              <Text style={styles.modalTitle}>功能即将上线</Text>
              <Text style={styles.modalText}>
                AI策略交易功能正在紧张开发中，预计近期上线，敬请期待！
              </Text>
              <TouchableOpacity 
                style={styles.modalButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>知道了</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F14',
  },
  hero: {
    alignItems: 'center',
    paddingVertical: 40,
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
    paddingVertical: 15,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
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
  stepContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  step: {
    flex: 1,
    alignItems: 'center',
  },
  stepIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  stepDesc: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  stepLine: {
    width: 30,
    height: 2,
    backgroundColor: '#374151',
    marginBottom: 30,
  },
  strategyCard: {
    backgroundColor: '#1A1A24',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  strategyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  strategyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  riskBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  riskText: {
    fontSize: 11,
    fontWeight: '500',
  },
  strategyDesc: {
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 12,
  },
  strategyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  strategyStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  strategyReturns: {
    fontSize: 14,
    fontWeight: '600',
    color: '#22C55E',
  },
  strategyUsers: {
    fontSize: 12,
    color: '#6B7280',
  },
  ctaContainer: {
    padding: 20,
    alignItems: 'center',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5CF6',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
    gap: 8,
    width: '100%',
  },
  ctaButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  ctaNote: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1A1A24',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    width: '100%',
  },
  modalIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  modalText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
