import { Screen } from '@/components/Screen';
import { Stack } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';

export default function CopytradingSettings() {
  return (
    <Screen>
      <Stack.Screen 
        options={{ 
          title: '跟单设置',
          headerStyle: { backgroundColor: '#0A0A0F' },
          headerTintColor: '#00F0FF',
        }} 
      />
      <View style={styles.container}>
        <Text style={styles.text}>跟单设置页面</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0A0F',
  },
  text: {
    color: '#E5E7EB',
    fontSize: 16,
  },
});
