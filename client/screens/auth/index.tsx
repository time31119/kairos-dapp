import { useState } from 'react';
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
import { Link, useRouter } from 'expo-router';

export default function LoginScreen() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [sendCodeText, setSendCodeText] = useState('发送验证码');

  const handleSendCode = () => {
    if (!email) {
      Alert.alert('错误', '请输入邮箱');
      return;
    }
    let seconds = 60;
    const timer = setInterval(() => {
      seconds--;
      if (seconds <= 0) {
        setSendCodeText('发送验证码');
        clearInterval(timer);
      } else {
        setSendCodeText(`${seconds}s`);
      }
    }, 1000);
    setSendCodeText(`${seconds}s`);
  };

  const handleSubmit = () => {
    if (!email || !password) {
      Alert.alert('错误', '请填写完整信息');
      return;
    }
    if (!isLogin && password !== confirmPassword) {
      Alert.alert('错误', '两次密码输入不一致');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert('成功', isLogin ? '登录成功' : '注册成功');
      router.back();
    }, 1500);
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
            <Text style={styles.logoIcon}>⚡</Text>
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
            {/* Email */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>邮箱</Text>
              <TextInput
                style={styles.input}
                placeholder="请输入邮箱"
                placeholderTextColor="#666"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
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
                  />
                  <TouchableOpacity style={styles.codeButton} onPress={handleSendCode}>
                    <Text style={styles.codeButtonText}>{sendCodeText}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Password */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>密码</Text>
              <TextInput
                style={styles.input}
                placeholder="请输入密码"
                placeholderTextColor="#666"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
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
                <Link href="/settings/about" asChild>
                  <TouchableOpacity>
                    <Text style={styles.agreementLink}>《用户协议》</Text>
                  </TouchableOpacity>
                </Link>
                <Text style={styles.agreementText}>和</Text>
                <Link href="/settings/privacy" asChild>
                  <TouchableOpacity>
                    <Text style={styles.agreementLink}>《隐私政策》</Text>
                  </TouchableOpacity>
                </Link>
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
  },
  codeButtonText: {
    color: '#00F0FF',
    fontSize: 14,
    fontWeight: '600',
  },
  forgotContainer: {
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  forgotText: {
    color: '#00F0FF',
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: '#00F0FF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#0A0A0F',
    fontSize: 18,
    fontWeight: 'bold',
  },
  agreementContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    flexWrap: 'wrap',
  },
  agreementText: {
    color: '#666',
    fontSize: 12,
  },
  agreementLink: {
    color: '#00F0FF',
    fontSize: 12,
  },
  bottomContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    paddingVertical: 24,
  },
  bottomText: {
    color: '#666',
    fontSize: 14,
  },
  bottomLink: {
    color: '#00F0FF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
});
