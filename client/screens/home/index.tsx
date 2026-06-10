/**
 * 首页 - 场景选择
 * KAIROS 行情筛选器
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Platform } from 'react-native';
import { Screen } from '@/components/Screen';
import { Link } from 'expo-router';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { Ionicons } from '@expo/vector-icons';

type IconName = 'trending-up-outline' | 'stats-chart-outline' | 'flame-outline' | 'arrow-down-outline';

interface Scenario {
  id: string;
  title: string;
  description: string;
  direction: 'up' | 'down';
  timeframe: string;
  icon: IconName;
  filters: string;
}

const scenarios: Scenario[] = [
  {
    id: '1h_up',
    title: '1小时上涨动能',
    description: '寻找短期爆发标的',
    direction: 'up',
    timeframe: '1H',
    icon: 'trending-up-outline',
    filters: 'RSI 50-70 | ADX>25 | 成交量>1.5x | MFI>60'
  },
  {
    id: '4h_up',
    title: '4小时上涨动能',
    description: '波段趋势延续',
    direction: 'up',
    timeframe: '4H',
    icon: 'stats-chart-outline',
    filters: 'EMA多头排列 | MACD零轴上方 | ADX>25 | +DI>-DI'
  },
  {
    id: '1h_down',
    title: '1小时下跌动能',
    description: '做空短期弱势',
    direction: 'down',
    timeframe: '1H',
    icon: 'flame-outline',
    filters: '低于VWAP | RSI 30-50 | 下跌放量'
  },
  {
    id: '4h_down',
    title: '4小时下跌动能',
    description: '趋势性破位标的',
    direction: 'down',
    timeframe: '4H',
    icon: 'arrow-down-outline',
    filters: '跌破EMA50 | EMA空头 | MACD零轴下方 | ATR扩张'
  }
];

function ScenarioCard({ scenario }: { scenario: Scenario }) {
  const router = useSafeRouter();
  const isUp = scenario.direction === 'up';
  
  const borderColor = isUp ? '#00F0FF' : '#BF00FF';
  const glowColor = isUp ? 'rgba(0, 240, 255, 0.15)' : 'rgba(191, 0, 255, 0.15)';
  const arrowColor = isUp ? '#00F0FF' : '#BF00FF';
  
  return (
    <Link
      href={`/screener/${scenario.id}`}
      asChild
    >
      <Pressable
        style={({ pressed }) => [
          styles.scenarioCard,
          {
            borderColor,
            backgroundColor: pressed ? '#1A1A24' : '#12121A',
            shadowColor: borderColor,
            shadowOpacity: pressed ? 0.4 : 0.2,
          }
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.iconContainer, { backgroundColor: glowColor }]}>
            <Ionicons 
              name={scenario.icon} 
              size={24} 
              color={borderColor} 
            />
          </View>
          <View style={styles.titleContainer}>
            <View style={styles.titleRow}>
              <Text style={[styles.arrowIcon, { color: arrowColor }]}>
                {isUp ? '↑' : '↓'}
              </Text>
              <Text style={styles.title}>{scenario.title}</Text>
            </View>
            <Text style={styles.timeframe}>{scenario.timeframe}</Text>
          </View>
        </View>
        
        <Text style={styles.description}>{scenario.description}</Text>
        
        <View style={styles.filtersContainer}>
          <Text style={styles.filtersLabel}>筛选条件</Text>
          <Text style={styles.filters}>{scenario.filters}</Text>
        </View>
        
        <View style={[styles.gradientLine, { backgroundColor: borderColor }]} />
      </Pressable>
    </Link>
  );
}

// VIP 功能数据
interface VipFeature {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  route: string;
}

const vipFeatures: VipFeature[] = [
  {
    id: 'radar',
    title: '异动雷达',
    subtitle: '15分钟内成交量突增',
    icon: 'flame',
    route: '/screener/radar'
  },
  {
    id: 'institutional',
    title: '机构动向',
    subtitle: '大户建仓信号预警',
    icon: 'trending-up',
    route: '/screener/institutional'
  },
  {
    id: 'multi-cycle',
    title: '跨周期共振',
    subtitle: '多周期强势信号',
    icon: 'layers',
    route: '/screener/multi-cycle'
  },
  {
    id: 'precision',
    title: '精准狙击',
    subtitle: '多指标买卖点',
    icon: 'target',
    route: '/screener/precision'
  }
];

function VipSection() {
  return (
    <View style={styles.vipContainer}>
      {/* Section Header */}
      <View style={styles.vipHeader}>
        <View style={styles.vipTitleRow}>
          <Text style={styles.vipCrown}>👑</Text>
          <Text style={styles.vipTitle}>会员速递</Text>
        </View>
        <Pressable>
          <Text style={styles.vipMore}>全部 →</Text>
        </Pressable>
      </View>
      
      {/* VIP Feature Grid */}
      <View style={styles.vipGrid}>
        {vipFeatures.map((feature, index) => (
          <Pressable 
            key={feature.id} 
            style={({ pressed }) => [
              styles.vipCard,
              {
                backgroundColor: pressed ? '#1A1A24' : '#12121A',
                opacity: pressed ? 0.8 : 1,
              }
            ]}
          >
            <View style={styles.vipCardIcon}>
              <Ionicons 
                name={feature.icon as any} 
                size={22} 
                color="#FFD700" 
              />
            </View>
            <Text style={styles.vipCardTitle}>{feature.title}</Text>
            <Text style={styles.vipCardSubtitle}>{feature.subtitle}</Text>
          </Pressable>
        ))}
      </View>
      
      {/* VIP Badge */}
      <View style={styles.vipBadge}>
        <Ionicons name="diamond" size={12} color="#FFD700" />
        <Text style={styles.vipBadgeText}>开通会员解锁全部高级功能</Text>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  return (
    <Screen>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="flash" size={32} color="#00F0FF" style={styles.logoIcon} />
            <Text style={styles.logoText}>KAIROS</Text>
          </View>
          <Text style={styles.subtitle}>行情筛选器</Text>
        </View>
        
        {/* Intro */}
        <View style={styles.introContainer}>
          <Text style={styles.introText}>
            从海量代币中筛选出趋势最明确的标的
          </Text>
          <Text style={styles.introSubtext}>
            基于动量指标、资金流向、跨周期验证
          </Text>
        </View>
        
        {/* VIP Section */}
        <VipSection />
        
        {/* Scenarios */}
        <View style={styles.scenariosContainer}>
          <Text style={styles.sectionTitle}>选择筛选场景</Text>
          
          <View style={styles.scenarioList}>
            {scenarios.map((scenario) => (
              <ScenarioCard key={scenario.id} scenario={scenario} />
            ))}
          </View>
        </View>
        
        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            数据来源：CoinGecko
          </Text>
        </View>
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
    padding: 20,
    paddingBottom: 40,
  },
  
  // Header
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  logoIcon: {
    marginRight: 8,
  },
  logoText: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    letterSpacing: 2,
  },
  
  // Intro
  introContainer: {
    backgroundColor: '#12121A',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#1F1F2E',
  },
  introText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  introSubtext: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  
  // Scenarios
  scenariosContainer: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    letterSpacing: 1,
  },
  scenarioList: {
    gap: 16,
  },
  
  // Scenario Card
  scenarioCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    position: 'relative',
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 20,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  arrowIcon: {
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  timeframe: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    marginLeft: 26,
  },
  description: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 12,
    marginLeft: 60,
  },
  filtersContainer: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 10,
    padding: 12,
    marginLeft: 60,
  },
  filtersLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 4,
    letterSpacing: 1,
  },
  filters: {
    fontSize: 11,
    color: '#9CA3AF',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  gradientLine: {
    position: 'absolute',
    bottom: 0,
    left: 20,
    right: 20,
    height: 2,
    borderRadius: 1,
  },
  
  // VIP Section
  vipContainer: {
    backgroundColor: '#12121A',
    borderRadius: 20,
    padding: 16,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)',
  },
  vipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  vipTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vipCrown: {
    fontSize: 18,
    marginRight: 8,
  },
  vipTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFD700',
    letterSpacing: 1,
  },
  vipMore: {
    fontSize: 12,
    color: '#FFD700',
  },
  vipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  vipCard: {
    width: '47%',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.15)',
  },
  vipCardIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  vipCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  vipCardSubtitle: {
    fontSize: 11,
    color: '#6B7280',
  },
  vipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 215, 0, 0.05)',
    borderRadius: 10,
    gap: 6,
  },
  vipBadgeText: {
    fontSize: 11,
    color: '#FFD700',
    letterSpacing: 0.5,
  },
  
  // Footer
  footer: {
    alignItems: 'center',
    paddingTop: 20,
  },
  footerText: {
    fontSize: 11,
    color: '#4B5563',
  },
});
