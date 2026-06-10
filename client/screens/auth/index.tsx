/**
 * 登录注册页面
 * KAIROS 行情筛选器
 */

import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Screen } from '@/components/Screen';
import { Ionicons } from '@expo/vector-icons';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9091';

// API 请求函数
async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}/api/v1${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });
  
  const data = await response.json();
  
  if (data.code !== 0) {
    throw new Error(data.message || '请求失败');
  }
  
  return data.data;
}

export default function LoginScreen() {
  const router = useSafeRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [sendCodeText, setSendCodeText] = useState('发送验证码');
  const [codeCooldown, setCodeCooldown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // 验证码倒计时
  useEffect(() => {
    if (codeCooldown > 0) {
      timerRef.current = setInterval(() => {
        setCodeCooldown((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [codeCooldown > 0]);

  // 发送验证码
  const handleSendCode = async () => {
    if (!phone) {
      Alert.alert('错误', '请输入手机号');
      return;
    }
    
    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      Alert.alert('错误', '请输入正确的手机号');
      return;
    }

    setSendingCode(true);
    try {
      await apiRequest('/auth/send-code', {
        method: 'POST',
        body: JSON.stringify({ phone }),
      });
      setCodeCooldown(60);
      Alert.alert('成功', '验证码已发送');
    } catch (error) {
      Alert.alert('错误', error instanceof Error ? error.message : '发送失败');
    } finally {
      setSendingCode(false);
    }
  };

  // 表单验证
  const validateForm = () => {
    if (!phone) {
      Alert.alert('错误', '请输入手机号');
      return false;
    }
    
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      Alert.alert('错误', '请输入正确的手机号');
      return false;
    }
    
    if (!password) {
      Alert.alert('错误', '请输入密码');
      return false;
    }
    
    if (password.length < 6) {
      Alert.alert('错误', '密码至少6位');
      return false;
    }
    
    if (!isLogin) {
      if (!verificationCode) {
        Alert.alert('错误', '请输入验证码');
        return false;
      }
      if (verificationCode.length !== 6) {
        Alert.alert('错误', '验证码为6位');
        return false;
      }
      if (password !== confirmPassword) {
        Alert.alert('错误', '两次密码输入不一致');
        return false;
      }
    }
    
    return true;
  };

  // 提交表单
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (isLogin) {
        // 登录：使用密码登录
        const result = await apiRequest<{
          token: string;
          user: { id: string; phone: string };
        }>('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ phone, password }),
        });
        
        // 保存登录信息
        await AsyncStorage.setItem('auth_token', result.token);
        await AsyncStorage.setItem('user_info', JSON.stringify(result.user));
        
        Alert.alert('成功', '登录成功');
      } else {
        // 注册
        const result = await apiRequest<{
          token: string;
          user: { id: string; phone: string };
        }>('/auth/register', {
          method: 'POST',
          body: JSON.stringify({ phone, code: verificationCode, password }),
        });
        
        // 保存登录信息
        await AsyncStorage.setItem('auth_token', result.token);
        await AsyncStorage.setItem('user_info', JSON.stringify(result.user));
        
        Alert.alert('成功', '注册成功');
      }
      
      router.back();
    } catch (error) {
      Alert.alert('错误', error instanceof Error ? error.message : '操作失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.logoIconContainer}>
              <Ionicons name="flash" size={40} color="#00F0FF" />
            </View>
            <Text style={styles.logoText}>KAIROS</Text>
            <Text style={styles.subtitle}>智能行情筛选器</Text>
          </View>

          {/* Tab Switch */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, isLogin && styles.tabActive]}
              onPress={() => setIsLogin(true)}
            >
              <Text style={[styles.tabText, isLogin && styles.tabTextActive]}>登录</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, !isLogin && styles.tabActive]}
              onPress={() => setIsLogin(false)}
            >
              <Text style={[styles.tabText, !isLogin && styles.tabTextActive]}>注册</Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Phone */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>手机号</Text>
              <TextInput
                style={styles.input}
                placeholder="请输入手机号"
                placeholderTextColor="#666"
                value={phone}
                onChangeText={setPhone}
                keyboardType="number-pad"
                maxLength={11}
              />
            </View>

            {/* Verification Code (Register only) */}
            {!isLogin && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>验证码</Text>
                <View style={styles.codeRow}>
                  <TextInput
                    style={[styles.input, styles.codeInput]}
                    placeholder="请输入验证码"
                    placeholderTextColor="#666"
                    value={verificationCode}
                    onChangeText={setVerificationCode}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                  <TouchableOpacity 
                    style={[styles.codeButton, codeCooldown > 0 && styles.codeButtonDisabled]} 
                    onPress={handleSendCode}
                    disabled={sendingCode || codeCooldown > 0}
                  >
                    {sendingCode ? (
                      <ActivityIndicator color="#00F0FF" size="small" />
                    ) : (
                      <Text style={[styles.codeButtonText, codeCooldown > 0 && styles.codeButtonTextDisabled]}>
                        {codeCooldown > 0 ? `${codeCooldown}s` : '发送验证码'}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Password */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>密码</Text>
              <TextInput
                style={styles.input}
                placeholder="请输入密码（至少6位）"
                placeholderTextColor="#666"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                maxLength={20}
              />
            </View>

            {/* Confirm Password (Register only) */}
            {!isLogin && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>确认密码</Text>
                <TextInput
                  style={styles.input}
                  placeholder="请再次输入密码"
                  placeholderTextColor="#666"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  maxLength={20}
                />
              </View>
            )}

            {/* Forgot Password (Login only) */}
            {isLogin && (
              <TouchableOpacity style={styles.forgotContainer}>
                <Text style={styles.forgotText}>忘记密码？</Text>
              </TouchableOpacity>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#0A0A0F" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {isLogin ? '登录' : '注册'}
                </Text>
              )}
            </TouchableOpacity>

            {/* Agreement (Register only) */}
            {!isLogin && (
              <View style={styles.agreementContainer}>
                <Text style={styles.agreementText}>注册即表示同意</Text>
                <TouchableOpacity>
                  <Text style={styles.agreementLink}>《用户协议》</Text>
                </TouchableOpacity>
                <Text style={styles.agreementText}>和</Text>
                <TouchableOpacity>
                  <Text style={styles.agreementLink}>《隐私政策》</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Bottom */}
          <View style={styles.bottomContainer}>
            <Text style={styles.bottomText}>
              {isLogin ? '还没有账号？' : '已有账号？'}
            </Text>
            <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
              <Text style={styles.bottomLink}>
                {isLogin ? '立即注册' : '立即登录'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Demo hint */}
          <View style={styles.demoHint}>
            <Text style={styles.demoHintText}>
              演示模式：注册时验证码任意6位数字
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: '#0A0A0F',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  logoIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#00F0FF',
    letterSpacing: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    alignSelf: 'center',
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 40,
  },
  tabActive: {
    backgroundColor: '#00F0FF',
    borderRadius: 8,
  },
  tabText: {
    fontSize: 16,
    color: '#888',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#0A0A0F',
    fontWeight: 'bold',
  },
  form: {
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1A1A1F',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFF',
    borderWidth: 1,
    borderColor: '#333',
  },
  codeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  codeInput: {
    flex: 1,
  },
  codeButton: {
    backgroundColor: '#1A1A1F',
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#00F0FF',
    minWidth: 120,
    alignItems: 'center',
  },
  codeButtonDisabled: {
    borderColor: '#444',
  },
  codeButtonText: {
    fontSize: 14,
    color: '#00F0FF',
    fontWeight: '500',
  },
  codeButtonTextDisabled: {
    color: '#666',
  },
  forgotContainer: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotText: {
    fontSize: 14,
    color: '#00F0FF',
  },
  submitButton: {
    backgroundColor: '#00F0FF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#333',
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0A0A0F',
  },
  agreementContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    flexWrap: 'wrap',
    gap: 4,
  },
  agreementText: {
    fontSize: 12,
    color: '#666',
  },
  agreementLink: {
    fontSize: 12,
    color: '#00F0FF',
  },
  bottomContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  bottomText: {
    fontSize: 14,
    color: '#888',
  },
  bottomLink: {
    fontSize: 14,
    color: '#00F0FF',
    fontWeight: '500',
  },
  demoHint: {
    marginTop: 32,
    padding: 16,
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.2)',
  },
  demoHintText: {
    fontSize: 12,
    color: '#00F0FF',
    textAlign: 'center',
  },
});
