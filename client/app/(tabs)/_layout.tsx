import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome6, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useCSSVariable } from 'uniwind';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const [background, muted, accent, border] = useCSSVariable([
    '--color-background',
    '--color-muted',
    '--color-accent',
    '--color-border',
  ]) as string[];

  // Web 端使用固定深色背景
  const tabBarBackground = Platform.OS === 'web' ? '#0A0A0F' : background;
  
  let tabBarStyle = {
    backgroundColor: tabBarBackground,
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
    paddingBottom: Platform.OS === 'ios' ? insets.bottom / 2 : 8,
    paddingTop: 8,
    height: 60 + (Platform.OS === 'ios' ? insets.bottom / 2 : 0),
  };

  if (Platform.OS === 'web') {
    tabBarStyle = {
      ...tabBarStyle,
      height: 'auto' as unknown as number,
    };
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle,
        tabBarActiveTintColor: accent,
        tabBarInactiveTintColor: muted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500' as const,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '首页',
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome6 
              name={focused ? 'house' : 'house'} 
              size={22} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="copytrading"
        options={{
          title: '一键跟单',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons 
              name={focused ? 'chart-line' : 'chart-line-variant'} 
              size={22} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="signal"
        options={{
          title: '机构跟投',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'pulse' : 'pulse-outline'} 
              size={22} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="mine"
        options={{
          title: '我的',
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome6 
              name={focused ? 'user' : 'user'} 
              size={22} 
              color={color} 
            />
          ),
        }}
      />
    </Tabs>
  );
}
