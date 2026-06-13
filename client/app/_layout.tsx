import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LogBox } from 'react-native';
import Toast from 'react-native-toast-message';
import { Provider } from '@/components/Provider';
import { Web3Provider } from '@/contexts/Web3Context';

import '../global.css';

LogBox.ignoreLogs([
  "TurboModuleRegistry.getEnforcing(...): 'RNMapsAirModule' could not be found",
  "useLinkPreviewContext must be used within a LinkPreviewContextProvider",
  // 添加其它想暂时忽略的错误或警告信息
]);

export default function RootLayout() {
  return (
    <Provider>
      <Web3Provider>
        <Stack
        screenOptions={{
          animation: 'slide_from_right',
          gestureEnabled: true,
          gestureDirection: 'horizontal',
          headerShown: false
        }}
      >
        <Stack.Screen name="(tabs)" options={{ title: "" }} />
        <Stack.Screen name="demo" options={{ title: "Demo" }} />
        <Stack.Screen name="screener/[scenario]" options={{ title: "筛选结果" }} />
        <Stack.Screen name="copytrading" options={{ title: "一键跟单" }} />
        <Stack.Screen name="copytrading/settings/index" options={{ title: "跟单设置" }} />
        <Stack.Screen name="vip" options={{ title: "会员速递" }} />
        <Stack.Screen name="vip/membership/index" options={{ title: "开通会员" }} />
        <Stack.Screen name="coin/[symbol]" options={{ title: "代币详情" }} />
        <Stack.Screen name="trading" options={{ title: "我的实盘交易" }} />
        <Stack.Screen name="search" options={{ title: "搜索" }} />
        <Stack.Screen name="notification" options={{ title: "消息通知" }} />
        <Stack.Screen name="settings" options={{ title: "设置" }} />
        <Stack.Screen name="settings/about/index" options={{ title: "关于我们" }} />
        <Stack.Screen name="auth" options={{ title: "登录注册" }} />
        <Stack.Screen name="kyc" options={{ title: "实名认证" }} />
        <Stack.Screen name="support" options={{ title: "帮助与客服" }} />
      </Stack>
      </Web3Provider>
      <Toast />
    </Provider>
  );
}
