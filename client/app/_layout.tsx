import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LogBox } from 'react-native';
import Toast from 'react-native-toast-message';
import { Provider } from '@/components/Provider';
import { Web3Provider } from '@/contexts/Web3Context';
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';

import '../global.css';

LogBox.ignoreLogs([
  "TurboModuleRegistry.getEnforcing(...): 'RNMapsAirModule' could not be found",
  "useLinkPreviewContext must be used within a LinkPreviewContextProvider",
]);

export default function RootLayout() {
  return (
    <Provider>
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
          </Stack>
          <Toast />
        </SubscriptionProvider>
      </Web3Provider>
    </Provider>
  );
}
