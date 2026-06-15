import React from 'react';
import { View, Text } from 'react-native';
import { Screen } from '@/components/Screen';

export default function CopyTradingSettingsScreen() {
  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A0A0F' }}>
        <Text style={{ color: '#FFF', fontSize: 18 }}>跟单设置</Text>
      </View>
    </Screen>
  );
}
