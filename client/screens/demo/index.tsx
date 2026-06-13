import { router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Screen } from '@/components/Screen';

export default function DemoScreen() {

  return (
    <Screen>
      <View style={styles.container}>
        <Text style={styles.title}>DAPP Demo</Text>
        <Text style={styles.subtitle}>行情筛选器示例页面</Text>
        
        <TouchableOpacity 
          style={styles.button}
          onPress={() => router.back()}
        >
          <Text style={styles.buttonText}>返回上一页</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.primaryButton]}
          onPress={() => router.push('/')}
        >
          <Text style={styles.buttonText}>返回首页</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00F0FF',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#1a1a2e',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#00F0FF',
  },
  primaryButton: {
    backgroundColor: '#00F0FF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});
