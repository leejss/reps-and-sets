import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '@/context/auth-context';
import { Colors } from '@/constants/colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { router } from 'expo-router';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Get themed colors
  const colors = {
    background: isDark ? Colors.background.dark : Colors.background.light,
    surface: isDark ? Colors.surface.dark : Colors.surface.light,
    textPrimary: isDark ? Colors.text.primary.dark : Colors.text.primary.light,
    textSecondary: isDark ? Colors.text.secondary.dark : Colors.text.secondary.light,
    inputBackground: isDark ? Colors.input.background.dark : Colors.input.background.light,
    inputBorder: isDark ? Colors.input.border.dark : Colors.input.border.light,
    inputPlaceholder: isDark ? Colors.input.placeholder.dark : Colors.input.placeholder.light,
  };

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      // 개발 중: 입력값이 없으면 기본 계정 사용
      const loginEmail = email.trim() || 'dev@repandset.com';
      const loginPassword = password.trim() || 'dev123';
      
      await login(loginEmail, loginPassword);
      
      // 로그인 성공 시 메인 화면으로 이동
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('로그인 실패', error instanceof Error ? error.message : '로그인에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.content}>
        {/* Logo & Title */}
        <View style={styles.header}>
          <Text style={[styles.logo, { color: Colors.primary }]}>💪</Text>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Rep & Set</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            운동을 기록하고 성장하세요
          </Text>
        </View>

        {/* Login Form */}
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.textPrimary }]}>이메일</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.inputBorder,
                  color: colors.textPrimary,
                },
              ]}
              placeholder="example@email.com"
              placeholderTextColor={colors.inputPlaceholder}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.textPrimary }]}>비밀번호</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.inputBorder,
                  color: colors.textPrimary,
                },
              ]}
              placeholder="••••••••"
              placeholderTextColor={colors.inputPlaceholder}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
              editable={!isLoading}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.loginButton,
              { backgroundColor: Colors.primary },
              isLoading && styles.loginButtonDisabled,
            ]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.button.primary.text} />
            ) : (
              <Text style={[styles.loginButtonText, { color: Colors.button.primary.text }]}>
                로그인
              </Text>
            )}
          </TouchableOpacity>

          {/* Demo Credentials Info */}
          <View style={styles.demoInfo}>
            <Text style={[styles.demoText, { color: colors.textSecondary }]}>
              개발 중: 로그인 버튼만 눌러도 자동으로 인증됩니다
            </Text>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    fontSize: 72,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  loginButton: {
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  demoInfo: {
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
  demoText: {
    fontSize: 13,
    textAlign: 'center',
  },
});
