'use client';

import React, { useState } from 'react';
import { Screen } from '@/components/Screen';
import { Text, View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeRouter } from '@/hooks/useSafeRouter';

const LANGUAGES = [
  { code: 'zh-CN', name: '简体中文', native: '简体中文', flag: '🇨🇳' },
  { code: 'zh-TW', name: '繁体中文', native: '繁體中文', flag: '🇹🇼' },
  { code: 'en-US', name: 'English', native: 'English', flag: '🇺🇸' },
  { code: 'ja-JP', name: '日本語', native: '日本語', flag: '🇯🇵' },
  { code: 'ko-KR', name: '한국어', native: '한국어', flag: '🇰🇷' },
  { code: 'es-ES', name: 'Español', native: 'Español', flag: '🇪🇸' },
  { code: 'ru-RU', name: 'Русский', native: 'Русский', flag: '🇷🇺' },
  { code: 'ar-SA', name: 'العربية', native: 'العربية', flag: '🇸🇦' },
];

export default function LanguageScreen() {
  const router = useSafeRouter();
  const [selected, setSelected] = useState('zh-CN');

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-5 pt-3 pb-4 flex-row items-center gap-3">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-white">语言</Text>
        </View>

        {/* Current Language */}
        <View className="px-5 mb-5">
          <View className="bg-gray-900 rounded-2xl p-4 border border-gray-800 flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <Ionicons name="globe-outline" size={20} color="#00F0FF" />
              <Text className="text-sm text-white">当前语言</Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Text className="text-sm text-gray-400">简体中文</Text>
              <View className="px-2 py-0.5 rounded" style={{ backgroundColor: '#00F0FF20' }}>
                <Text className="text-xs text-cyan-400">已选</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Language List */}
        <View className="px-5 mb-5">
          <Text className="text-xs text-gray-500 uppercase mb-3 ml-1">选择语言</Text>
          <View className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
            {LANGUAGES.map((lang, index) => (
              <TouchableOpacity
                key={lang.code}
                className="flex-row items-center justify-between px-4 py-4"
                onPress={() => setSelected(lang.code)}
                style={index < LANGUAGES.length - 1 ? {
                  borderBottomWidth: 1,
                  borderBottomColor: '#1F2937'
                } : undefined}
              >
                <View className="flex-row items-center gap-3">
                  <Text className="text-lg">{lang.flag}</Text>
                  <View>
                    <Text className="text-sm text-white">{lang.name}</Text>
                    <Text className="text-xs text-gray-500">{lang.native}</Text>
                  </View>
                </View>
                {selected === lang.code ? (
                  <View className="w-6 h-6 rounded-full bg-cyan-500 items-center justify-center">
                    <Ionicons name="checkmark" size={14} color="#0A0A0F" />
                  </View>
                ) : (
                  <View className="w-6 h-6 rounded-full border border-gray-600" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Note */}
        <View className="px-5 mb-8">
          <View className="bg-gray-900/50 rounded-2xl p-4 border border-gray-800/50">
            <View className="flex-row items-start gap-2">
              <Ionicons name="information-circle-outline" size={16} color="#6B7280" />
              <Text className="text-xs text-gray-500 leading-4 flex-1">
                部分界面内容可能仍显示为默认语言，完整翻译将陆续推出。
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}
