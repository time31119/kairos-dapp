import { Screen } from '@/components/Screen';
import { Stack } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';

export default function Membership() {
  return (
    <Screen>
      <Stack.Screen 
        options={{ 
          title: '会员中心',
          headerStyle: { backgroundColor: '#0A0A0F' },
          headerTintColor: '#00F0FF',
        }} 
      />
      <View style={styles.container}>
        <Text style={styles.text}>会员中心页面</Text>
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
