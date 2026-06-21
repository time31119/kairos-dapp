import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Screen } from '@/components/Screen';

export default function NotificationsScreen() {
  return (
    <Screen contentContainerStyle={styles.container}>
      <ScrollView>
        <Text style={styles.title}>通知中心</Text>
        <Text style={styles.placeholder}>暂无新通知</Text>
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
