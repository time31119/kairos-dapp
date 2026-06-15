import React from 'react';
import { View, Text } from 'react-native';
import { Screen } from '@/components/Screen';

export default function MembershipScreen() {
  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A0A0F' }}>
        <Text style={{ color: '#FFF', fontSize: 18 }}>会员订阅</Text>
      </View>
    </Screen>
  );
}
