import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { Screen } from '@/components/Screen';
import Membership from './membership';

export default function VipScreen() {
  return (
    <Screen>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Membership />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
