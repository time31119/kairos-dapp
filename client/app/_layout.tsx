import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LogBox } from 'react-native';
import Toast from 'react-native-toast-message';
import { Provider } from '@/components/Provider';
import { Web3Provider } from '@/contexts/Web3Context';
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';
import { TouchableOpacity, View, Text, Platform } from 'react-native';

import '../global.css';

// TP Wallet / Web DApp Metadata
const DAPP_NAME = 'Kairos DApp';
const DAPP_TITLE = 'Kairos - 币势预测';
const DAPP_DESCRIPTION = '区块链加密货币行情分析平台，提供实时行情、技术分析、VIP会员服务';
const DAPP_URL = 'https://kairosdapp.com';
const DAPP_ICON = '/icon-192.png';

function HeadContent() {
  if (Platform.OS === 'web') {
    if (typeof document !== 'undefined') {
      // 禁用 fontfaceobserver 超时警告（heroui UI 组件库的字体检测）
      window.addEventListener('error', (event) => {
        if (event.message && event.message.includes('timeout exceeded')) {
          event.preventDefault();
          event.stopPropagation();
          return false;
        }
      });
      
      // Title
      document.title = DAPP_TITLE;
      
      // Meta tags
      const metaTags = [
        { name: 'description', content: DAPP_DESCRIPTION },
        { name: 'theme-color', content: '#000000' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
      ];
      
      metaTags.forEach(({ name, content }) => {
        let meta = document.querySelector(`meta[name="${name}"]`);
        if (!meta) {
          meta = document.createElement('meta');
          meta.setAttribute('name', name);
          document.head.appendChild(meta);
        }
        meta.setAttribute('content', content);
      });
      
      // Open Graph tags (for social sharing)
      const ogTags = [
        { property: 'og:title', content: DAPP_TITLE },
        { property: 'og:description', content: DAPP_DESCRIPTION },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: DAPP_URL },
        { property: 'og:image', content: `${DAPP_URL}${DAPP_ICON}` },
        { property: 'og:site_name', content: DAPP_NAME },
      ];
      
      ogTags.forEach(({ property, content }) => {
        let meta = document.querySelector(`meta[property="${property}"]`);
        if (!meta) {
          meta = document.createElement('meta');
          meta.setAttribute('property', property);
          document.head.appendChild(meta);
        }
        meta.setAttribute('content', content);
      });
      
      // Twitter Card tags
      const twitterTags = [
        { name: 'twitter:card', content: 'summary' },
        { name: 'twitter:title', content: DAPP_TITLE },
        { name: 'twitter:description', content: DAPP_DESCRIPTION },
        { name: 'twitter:image', content: `${DAPP_URL}${DAPP_ICON}` },
      ];
      
      twitterTags.forEach(({ name, content }) => {
        let meta = document.querySelector(`meta[name="${name}"]`);
        if (!meta) {
          meta = document.createElement('meta');
          meta.setAttribute('name', name);
          document.head.appendChild(meta);
        }
        meta.setAttribute('content', content);
      });
    }
  }
  return null;
}

LogBox.ignoreLogs([
  "TurboModuleRegistry.getEnforcing(...): 'RNMapsAirModule' could not be found",
  "useLinkPreviewContext must be used within a LinkPreviewContextProvider",
  "6000ms timeout exceeded",
  "fontfaceobserver",
]);

export default function RootLayout() {
  return (
    <>
      <HeadContent />
      <Web3Provider>
        <SubscriptionProvider>
          <Stack
            screenOptions={{
              animation: 'slide_from_right',
              gestureEnabled: true,
              headerShown: false
            }}
          >
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="coin/[symbol]" />
            <Stack.Screen name="search" />
            <Stack.Screen name="auth" />
            <Stack.Screen name="membership" />


            <Stack.Screen name="vip-status" />
            <Stack.Screen name="vip-status/subscription-manage" />
            <Stack.Screen name="vip-status/order-history" />
            <Stack.Screen name="payment-confirm" />
            <Stack.Screen name="settings" />
            <Stack.Screen name="settings/language" />
            <Stack.Screen name="settings/security" />
            <Stack.Screen name="settings/terms" />
            <Stack.Screen name="alerts" />
            <Stack.Screen name="analysis" />
            <Stack.Screen name="categories" />
            <Stack.Screen name="copytrading" />
            <Stack.Screen name="demo" />
            <Stack.Screen name="kyc" />
            <Stack.Screen name="notification" />
            <Stack.Screen name="support" />
            <Stack.Screen name="trading" />
            <Stack.Screen name="trader" />
            <Stack.Screen name="news" />
            <Stack.Screen name="follow" />
            <Stack.Screen name="notifications" />
            <Stack.Screen name="screener" />
          </Stack>
          <Toast />
        </SubscriptionProvider>
      </Web3Provider>
    </>
  );
}
