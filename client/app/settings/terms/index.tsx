import { View, Text } from 'react-native';
import { Screen } from '@/components/Screen';

export default function TermsScreen() {
  return (
    <Screen>
      <View className="flex-1 bg-[#0A0A0F] items-center justify-center">
        <Text className="text-white text-lg">服务条款</Text>
      </View>
    </Screen>
  );
}
