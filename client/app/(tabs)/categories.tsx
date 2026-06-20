import { Screen } from '@/components/Screen';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Categories() {
  return (
    <Screen>
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: '#0A0A0F' }}>
        <Ionicons name="trending-up-outline" size={64} color="#FFD700" />
        <Text className="text-xl mt-4 font-bold" style={{ color: '#FFFFFF' }}>热门赛道</Text>
        <Text className="text-sm mt-2" style={{ color: '#6B7280' }}>功能开发中...</Text>
      </View>
    </Screen>
  );
}
