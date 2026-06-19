/**
 * 币安 API 绑定页面
 * 用户在此输入币安 API Key 和 Secret 进行授权
 */

import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Screen } from '@/components/Screen';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { getApiBase } from '@/utils/apiConfig';

export default function BinanceApiScreen() {
  const router = useSafeRouter();
  const [apiKey, setApiKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [isBound, setIsBound] = useState(false);
  const [checking, setChecking] = useState(true);

  // 检查绑定状态
  useEffect(() => {
    checkBindStatus();
  }, []);

  const checkBindStatus = async () => {
    try {
      const sessionToken = await AsyncStorage.getItem('session');
      const response = await fetch(`${getApiBase()}/api/v1/copytrading/binance-status`, {
        headers: {
          'x-session': sessionToken || '',
        },
      });
      const result = await response.json();
      if (result.success && result.data?.isBound) {
        setIsBound(true);
      }
    } catch (error) {
      console.error('Check status error:', error);
    } finally {
      setChecking(false);
    }
  };

  // 验证 API Key 格式
  const validateApiKey = (key: string): boolean => {
    return key.length >= 32 && /^[a-zA-Z0-9]+$/.test(key);
  };

  // 验证 Secret Key 格式
  const validateSecretKey = (key: string): boolean => {
    return key.length >= 32 && /^[a-zA-Z0-9]+$/.test(key);
  };

  // 提交绑定
  const handleBind = async () => {
    if (!apiKey.trim()) {
      Alert.alert('错误', '请输入 API Key');
      return;
    }

    if (!secretKey.trim()) {
      Alert.alert('错误', '请输入 Secret Key');
      return;
    }

    if (!validateApiKey(apiKey)) {
      Alert.alert('错误', 'API Key 格式不正确');
      return;
    }

    if (!validateSecretKey(secretKey)) {
      Alert.alert('错误', 'Secret Key 格式不正确');
      return;
    }

    setLoading(true);

    try {
      const sessionToken = await AsyncStorage.getItem('session');
      const response = await fetch(`${getApiBase()}/api/v1/copytrading/bind-binance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session': sessionToken || '',
        },
        body: JSON.stringify({
          apiKey: apiKey.trim(),
          secretKey: secretKey.trim(),
        }),
      });

      const result = await response.json();

      if (result.success) {
        Alert.alert('绑定成功', '您的币安 API 已成功绑定', [
          {
            text: '确定',
            onPress: () => {
              setIsBound(true);
            },
          },
        ]);
      } else {
        Alert.alert('绑定失败', result.error || '请检查 API Key 和 Secret 是否正确');
      }
    } catch (error) {
      console.error('Bind error:', error);
      Alert.alert('网络错误', '请检查网络连接后重试');
    } finally {
      setLoading(false);
    }
  };

  // 解绑
  const handleUnbind = () => {
    Alert.alert(
      '确认解绑',
      '解绑后您将无法使用一键跟单功能，确定要解绑吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确认解绑',
          style: 'destructive',
          onPress: async () => {
            try {
              const sessionToken = await AsyncStorage.getItem('session');
              await fetch(`${getApiBase()}/api/v1/copytrading/unbind-binance`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'x-session': sessionToken || '',
                },
              });
              setIsBound(false);
              setApiKey('');
              setSecretKey('');
              Alert.alert('已解绑', '您的币安 API 已解除绑定');
            } catch (error) {
              Alert.alert('解绑失败', '请重试');
            }
          },
        },
      ]
    );
  };

  // 打开币安帮助页面
  const openBinanceHelp = () => {
    Alert.alert(
      '如何获取 API Key',
      '1. 登录币安官网\n2. 点击右上角头像 → API 管理\n3. 创建 API 密钥\n4. 勾选"仅现货交易"权限\n5. 保存 API Key 和 Secret Key',
      [{ text: '知道了' }]
    );
  };

  if (checking) {
    return (
      <Screen>
        <SafeAreaView className="flex-1 bg-gray-900">
          <View className="flex-1 justify-center items-center">
            <Text className="text-white">检查中...</Text>
          </View>
        </SafeAreaView>
      </Screen>
    );
  }

  if (isBound) {
    return (
      <Screen>
        <SafeAreaView className="flex-1 bg-gray-900">
          <View className="flex-1 px-5 py-6">
            {/* 头部 */}
            <View className="flex-row items-center mb-6">
              <TouchableOpacity onPress={() => router.back()} className="mr-3">
                <Feather name="arrow-left" size={24} color="white" />
              </TouchableOpacity>
              <Text className="text-xl font-bold text-white">币安 API 已绑定</Text>
            </View>

            {/* 已绑定状态 */}
            <View className="flex-1 justify-center items-center">
              <View className="w-20 h-20 rounded-full bg-green-500 items-center justify-center mb-4">
                <Feather name="check" size={40} color="white" />
              </View>
              <Text className="text-white text-lg font-bold mb-2">绑定成功</Text>
              <Text className="text-gray-400 text-center mb-6">
                您的币安 API 已成功绑定，可以开始使用一键跟单功能了
              </Text>

              <TouchableOpacity
                className="bg-red-600 px-6 py-3 rounded-lg"
                onPress={handleUnbind}
              >
                <Text className="text-white font-medium">解除绑定</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Screen>
    );
  }

  return (
    <Screen>
      <SafeAreaView className="flex-1 bg-gray-900">
        <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
          <View className="px-5 py-6">
            {/* 头部 */}
            <View className="flex-row items-center mb-6">
              <TouchableOpacity onPress={() => router.back()} className="mr-3">
                <Feather name="arrow-left" size={24} color="white" />
              </TouchableOpacity>
              <Text className="text-xl font-bold text-white">绑定币安 API</Text>
            </View>

            {/* 说明 */}
            <View className="bg-yellow-900/30 border border-yellow-600/30 rounded-xl p-4 mb-6">
              <View className="flex-row items-start">
                <Feather name="alert-circle" size={20} color="#fbbf24" />
                <View className="flex-1 ml-3">
                  <Text className="text-yellow-400 font-medium mb-2">安全提示</Text>
                  <Text className="text-gray-400 text-sm leading-5">
                    1. 请勿勾选"允许提现"权限{'\n'}
                    2. API Key 和 Secret 仅用于交易复制{'\n'}
                    3. 请妥善保管，切勿泄露给他人
                  </Text>
                </View>
              </View>
            </View>

            {/* API Key 输入 */}
            <View className="mb-4">
              <Text className="text-gray-300 mb-2">API Key</Text>
              <TextInput
                className="bg-gray-800 text-white rounded-lg px-4 py-3 border border-gray-700"
                placeholder="请输入币安 API Key"
                placeholderTextColor="#6B7280"
                value={apiKey}
                onChangeText={setApiKey}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Secret Key 输入 */}
            <View className="mb-4">
              <Text className="text-gray-300 mb-2">Secret Key</Text>
              <TextInput
                className="bg-gray-800 text-white rounded-lg px-4 py-3 border border-gray-700"
                placeholder="请输入币安 Secret Key"
                placeholderTextColor="#6B7280"
                value={secretKey}
                onChangeText={setSecretKey}
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry
              />
            </View>

            {/* 帮助按钮 */}
            <TouchableOpacity
              className="flex-row items-center justify-center mb-6"
              onPress={openBinanceHelp}
            >
              <Feather name="help-circle" size={16} color="#00F0FF" />
              <Text className="text-cyan-400 ml-2 text-sm">如何获取 API Key？</Text>
            </TouchableOpacity>

            {/* 绑定按钮 */}
            <TouchableOpacity
              className={`rounded-lg py-4 items-center ${loading ? 'bg-gray-600' : 'bg-cyan-500'}`}
              onPress={handleBind}
              disabled={loading}
            >
              <Text className="text-white font-bold text-lg">
                {loading ? '绑定中...' : '确认绑定'}
              </Text>
            </TouchableOpacity>

            {/* 底部说明 */}
            <View className="mt-8">
              <Text className="text-gray-500 text-xs text-center">
                绑定即表示您同意我们的服务条款和隐私政策
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Screen>
  );
}
