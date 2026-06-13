import { View, Text, StyleSheet, ScrollView, Linking, TouchableOpacity } from 'react-native';
import { Screen } from '@/components/Screen';

const VERSION = '1.0.0';
const BUILD = '20240115';

export default function AboutScreen() {
  const handleOpenUrl = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <Screen>
      <ScrollView 
        className="flex-1"
        style={{ backgroundColor: '#0A0A0F' }}
        contentContainerStyle={{ padding: 16 }}
      >
        {/* Logo */}
        <View className="items-center mb-8 mt-4">
          <View 
            className="w-24 h-24 rounded-3xl items-center justify-center mb-4"
            style={{ 
              backgroundColor: '#0A0A0F', 
              borderWidth: 2, 
              borderColor: '#00F0FF',
              shadowColor: '#00F0FF',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 12,
            }}
          >
            <Text className="text-3xl font-bold" style={{ color: '#00F0FF' }}>K</Text>
          </View>
          <Text className="text-2xl font-bold" style={{ color: '#FFFFFF' }}>
            KAIROS
          </Text>
          <Text className="text-sm mt-1" style={{ color: '#6B7280' }}>
            DAPP 行情筛选器
          </Text>
          <View 
            className="px-3 py-1 rounded-full mt-3"
            style={{ backgroundColor: '#1A1A22', borderWidth: 1, borderColor: '#00F0FF' }}
          >
            <Text className="text-xs" style={{ color: '#00F0FF' }}>
              v{VERSION} ({BUILD})
            </Text>
          </View>
        </View>

        {/* Description */}
        <View 
          className="rounded-2xl p-4 mb-4"
          style={{ backgroundColor: '#0A0A0F', borderWidth: 1, borderColor: '#1F1F2E' }}
        >
          <Text className="text-base font-bold mb-2" style={{ color: '#FFFFFF' }}>
            关于 KAIROS
          </Text>
          <Text className="text-sm leading-6" style={{ color: '#9CA3AF' }}>
            KAIROS 是一款专业的加密货币行情筛选工具，基于先进的量化策略和机器学习算法，
            帮助用户发现最具潜力的交易机会。
          </Text>
          <Text className="text-sm leading-6 mt-2" style={{ color: '#9CA3AF' }}>
            我们提供四大筛选场景：1H/4H 上涨/下跌动能最强的代币，让您在瞬息万变的市场中
            把握先机。
          </Text>
        </View>

        {/* Features */}
        <View 
          className="rounded-2xl p-4 mb-4"
          style={{ backgroundColor: '#0A0A0F', borderWidth: 1, borderColor: '#1F1F2E' }}
        >
          <Text className="text-base font-bold mb-3" style={{ color: '#FFFFFF' }}>
            核心功能
          </Text>
          {[
            { icon: '📊', title: '智能筛选', desc: '多维度量化指标精选' },
            { icon: '💎', title: '会员速递', desc: '机构级投资信号' },
            { icon: '🤝', title: '一键跟单', desc: '跟随顶级交易员' },
            { icon: '🔔', title: '实时提醒', desc: '价格波动及时通知' },
          ].map((item, index) => (
            <View key={index} className="flex-row items-center mb-3">
              <View 
                className="w-10 h-10 rounded-xl items-center justify-center"
                style={{ backgroundColor: '#1A1A22' }}
              >
                <Text className="text-lg">{item.icon}</Text>
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-sm font-bold" style={{ color: '#FFFFFF' }}>
                  {item.title}
                </Text>
                <Text className="text-xs" style={{ color: '#6B7280' }}>
                  {item.desc}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Links */}
        <View 
          className="rounded-2xl p-4 mb-4"
          style={{ backgroundColor: '#0A0A0F', borderWidth: 1, borderColor: '#1F1F2E' }}
        >
          <Text className="text-base font-bold mb-3" style={{ color: '#FFFFFF' }}>
            快捷链接
          </Text>
          {[
            { icon: '📄', title: '用户协议', url: 'https://kairos.app/terms' },
            { icon: '🔒', title: '隐私政策', url: 'https://kairos.app/privacy' },
            { icon: '📧', title: '联系我们', url: 'mailto:support@kairos.app' },
            { icon: '💬', title: '在线客服', url: 'https://kairos.app/chat' },
          ].map((item, index) => (
            <TouchableOpacity
              key={index}
              className="flex-row items-center justify-between py-3 border-b"
              style={{ borderColor: '#1F1F2E' }}
              onPress={() => handleOpenUrl(item.url)}
            >
              <View className="flex-row items-center">
                <Text className="text-lg mr-3">{item.icon}</Text>
                <Text className="text-sm" style={{ color: '#FFFFFF' }}>
                  {item.title}
                </Text>
              </View>
              <Text className="text-sm" style={{ color: '#6B7280' }}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Copyright */}
        <View className="items-center mt-6 mb-4">
          <Text className="text-xs" style={{ color: '#6B7280' }}>
            © 2024 KAIROS. All rights reserved.
          </Text>
          <Text className="text-xs mt-1" style={{ color: '#4B5563' }}>
            Built with ❤️ for Crypto Traders
          </Text>
        </View>

        {/* DAPP Badge */}
        <View className="items-center">
          <View 
            className="px-4 py-2 rounded-full"
            style={{ backgroundColor: '#1A1A22', borderWidth: 1, borderColor: '#00F0FF' }}
          >
            <Text className="text-xs font-bold" style={{ color: '#00F0FF' }}>
              🔗 Web3 Native DAPP
            </Text>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}
