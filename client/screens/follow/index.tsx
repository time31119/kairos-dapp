/**
 * 技术分析页面 - KAIROS DAPP
 * 技术指标筛选场景
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Screen } from '@/components/Screen';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const SCENARIOS = [
  {
    id: '1h_up',
    title: '1小时上涨动能',
    description: '寻找短期爆发标的',
    direction: 'up',
    timeframe: '1H',
    icon: 'trending-up-outline',
    color: '#00F0FF',
    filters: 'RSI 50-70 | ADX>25 | 成交量>1.5x | MFI>60'
  },
  {
    id: '4h_up',
    title: '4小时上涨动能',
    description: '波段趋势延续',
    direction: 'up',
    timeframe: '4H',
    icon: 'stats-chart-outline',
    color: '#00FF88',
    filters: 'EMA多头排列 | MACD零轴上方 | ADX>25 | +DI>-DI'
  },
  {
    id: '1h_down',
    title: '1小时下跌动能',
    description: '做空短期弱势',
    direction: 'down',
    timeframe: '1H',
    icon: 'trending-down-outline',
    color: '#FF4444',
    filters: 'RSI 30-50 | ADX>25 | 成交量>1.5x | MFI<40'
  },
  {
    id: '4h_down',
    title: '4小时下跌动能',
    description: '波段做空机会',
    direction: 'down',
    timeframe: '4H',
    icon: 'trending-down-outline',
    color: '#FF6B6B',
    filters: 'EMA空头排列 | MACD零轴下方 | ADX>25 | -DI>+DI'
  },
  {
    id: 'macd_cross',
    title: 'MACD 金叉',
    description: '趋势转折信号',
    direction: 'up',
    timeframe: '4H',
    icon: 'sync-outline',
    color: '#9370DB',
    filters: 'MACD 零轴下方金叉 | 成交量放大'
  },
  {
    id: 'high_volume',
    title: '成交量异动',
    description: '关注资金动向',
    direction: 'neutral',
    timeframe: '1D',
    icon: 'pulse-outline',
    color: '#FFD700',
    filters: '成交量>5x 均量 | 价格变动>3%'
  },
  {
    id: 'low_cap_gem',
    title: '小市值 Gem',
    description: '高风险高收益',
    direction: 'up',
    timeframe: '1D',
    icon: 'diamond-outline',
    color: '#FF69B4',
    filters: '市值<100M | 流动性>$1M | 合约安全'
  },
  {
    id: 'vip_radar',
    title: '异动雷达 VIP',
    description: '机构级异动监测',
    direction: 'up',
    timeframe: 'Real',
    icon: 'radar-outline',
    color: '#BF00FF',
    filters: '大户异动 | 链上数据 | 实时推送'
  },
];

function ScenarioCard({ scenario }: { scenario: any }) {
  const isUp = scenario.direction === 'up';
  const isDown = scenario.direction === 'down';
  const borderColor = isUp ? '#00F0FF' : isDown ? '#FF4444' : scenario.color;
  
  return (
    <Link href={'/screener/' + scenario.id} asChild>
      <Pressable style={[styles.card, { borderColor }]}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconBox, { backgroundColor: borderColor + '20' }]}>
            <Ionicons name={scenario.icon} size={22} color={borderColor} />
          </View>
          <View style={styles.titleArea}>
            <View style={styles.titleRow}>
              {isUp && <Text style={styles.arrow}>↑</Text>}
              {isDown && <Text style={[styles.arrow, { color: '#FF4444' }]}>↓</Text>}
              <Text style={styles.title}>{scenario.title}</Text>
            </View>
            <Text style={styles.timeframe}>{scenario.timeframe}</Text>
          </View>
        </View>
        
        <Text style={styles.description}>{scenario.description}</Text>
        
        <View style={styles.filtersBox}>
          <Text style={styles.filtersLabel}>筛选条件</Text>
          <Text style={styles.filters}>{scenario.filters}</Text>
        </View>
        
        <View style={[styles.bottomLine, { backgroundColor: borderColor }]} />
      </Pressable>
    </Link>
  );
}

export default function FollowScreen() {
  return (
    <Screen>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.logo}>技术分析</Text>
          <Text style={styles.sub}>技术指标筛选场景</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📊 动能筛选</Text>
            <View style={styles.grid}>
              {SCENARIOS.slice(0, 4).map(s => (
                <ScenarioCard key={s.id} scenario={s} />
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎯 信号筛选</Text>
            <View style={styles.grid}>
              {SCENARIOS.slice(4, 6).map(s => (
                <ScenarioCard key={s.id} scenario={s} />
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💎 潜力筛选</Text>
            <View style={styles.grid}>
              {SCENARIOS.slice(6).map(s => (
                <ScenarioCard key={s.id} scenario={s} />
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F' },
  header: { padding: 20, paddingTop: 60 },
  logo: { fontSize: 24, fontWeight: '700', color: '#FFFFFF' },
  sub: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  content: { padding: 16 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#FFFFFF', marginBottom: 12 },
  grid: { gap: 12 },
  card: {
    backgroundColor: '#12121A',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    overflow: 'hidden',
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  iconBox: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  titleArea: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  arrow: { fontSize: 18, color: '#00F0FF', marginRight: 4 },
  title: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  timeframe: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  description: { fontSize: 13, color: '#9CA3AF', marginBottom: 12 },
  filtersBox: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: 10 },
  filtersLabel: { fontSize: 10, color: '#6B7280', marginBottom: 4 },
  filters: { fontSize: 11, color: '#D1D5DB', lineHeight: 16 },
  bottomLine: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 2 },
});
