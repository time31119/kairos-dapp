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
const DAPP_TITLE = 'Kairos DApp';

function HeadContent() {
  if (Platform.OS === 'web') {
    if (typeof document !== 'undefined') {
      document.title = DAPP_TITLE;
      // Update or create meta description
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.name = 'description';
        document.head.appendChild(metaDesc);
      }
      metaDesc.content = 'Kairos Decentralized Application';
      
      // Update or create theme-color
      let themeColor = document.querySelector('meta[name="theme-color"]');
      if (!themeColor) {
        themeColor = document.createElement('meta');
        themeColor.name = 'theme-color';
        document.head.appendChild(themeColor);
      }
      themeColor.content = '#000000';
    }
  }
  return null;
}

LogBox.ignoreLogs([
  "TurboModuleRegistry.getEnforcing(...): 'RNMapsAirModule' could not be found",
  "useLinkPreviewContext must be used within a LinkPreviewContextProvider",
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
            <Stack.Screen name="vip" />
            <Stack.Screen name="vip/membership" />
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
