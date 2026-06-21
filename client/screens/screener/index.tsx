import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Screen } from '@/components/Screen';

export default function ScreenerScreen() {
  return (
    <Screen contentContainerStyle={styles.container}>
      <ScrollView>
        <Text style={styles.title}>筛选器</Text>
        <Text style={styles.placeholder}>筛选器内容即将上线</Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0F',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  placeholder: {
    fontSize: 16,
    color: '#8B8B9A',
    textAlign: 'center',
    marginTop: 50,
  },
});
