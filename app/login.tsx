import { useColor } from "@/constants/colors";
import { signInWithEmail, signInWithGoogle } from "@/stores/auth-store";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeOutUp,
  LinearTransition,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Routes } from "./route-config";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailLogin, setShowEmailLogin] = useState(false);
  const colors = useColor();
  const passwordInputRef = useRef<TextInput>(null);

  const handleGoogleLogin = useCallback(async () => {
    setIsLoading(true);
    try {
      const loggedIn = await signInWithGoogle();
      if (loggedIn) {
        router.replace(Routes.TABS);
      }
    } catch (error) {
      Alert.alert(
        "Google 로그인 실패",
        error instanceof Error ? error.message : "로그인에 실패했습니다.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleEmailLogin = useCallback(async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("알림", "이메일과 비밀번호를 입력해주세요.");
      return;
    }

    setIsLoading(true);
    try {
      await signInWithEmail(email.trim(), password.trim());
      router.replace(Routes.TABS);
    } catch (error) {
      Alert.alert(
        "로그인 실패",
        error instanceof Error ? error.message : "로그인에 실패했습니다.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [email, password]);

  const toggleEmailLogin = useCallback(() => {
    setShowEmailLogin((prev) => !prev);
  }, []);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <Animated.View
            entering={FadeInDown.delay(100).springify()}
            style={styles.header}
          >
            <Image
              source={require("@/assets/images/icon.png")}
              style={styles.logo}
              contentFit="contain"
            />
            <Text style={[styles.title, { color: colors.text.primary }]}>
              Reps & Sets
            </Text>
            <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
              나만의 운동 루틴을 기록하고{"\n"}더 나은 내일을 만들어보세요
            </Text>
          </Animated.View>

          {/* Action Section */}
          <Animated.View
            entering={FadeInDown.delay(300).springify()}
            style={styles.actionContainer}
          >
            {/* Google Login Button */}
            <TouchableOpacity
              style={[
                styles.socialButton,
                styles.googleButton,
                {
                  opacity: isLoading ? 0.7 : 1,
                  shadowColor: colors.shadow,
                },
              ]}
              onPress={handleGoogleLogin}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <Ionicons name="logo-google" size={24} color="#4285F4" />
              <Text style={styles.socialButtonText}>Google로 시작하기</Text>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View
                style={[styles.dividerLine, { backgroundColor: colors.border }]}
              />
              <Text
                style={[styles.dividerText, { color: colors.text.tertiary }]}
              >
                또는
              </Text>
              <View
                style={[styles.dividerLine, { backgroundColor: colors.border }]}
              />
            </View>

            {/* Email Login Toggle */}
            <TouchableOpacity
              style={[
                styles.emailToggle,
                {
                  backgroundColor: showEmailLogin
                    ? colors.surface
                    : "transparent",
                },
              ]}
              onPress={toggleEmailLogin}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.emailToggleText,
                  { color: colors.text.secondary },
                ]}
              >
                이메일로 로그인
              </Text>
              <Ionicons
                name={showEmailLogin ? "chevron-up" : "chevron-down"}
                size={16}
                color={colors.text.secondary}
              />
            </TouchableOpacity>

            {/* Email Login Form */}
            {showEmailLogin && (
              <Animated.View
                entering={FadeInUp.springify()}
                exiting={FadeOutUp.duration(200)}
                style={styles.formContainer}
              >
                <View style={styles.inputWrapper}>
                  <View
                    style={[
                      styles.inputContainer,
                      {
                        backgroundColor: colors.input.background,
                        borderColor: colors.input.border,
                      },
                    ]}
                  >
                    <Ionicons
                      name="mail-outline"
                      size={20}
                      color={colors.text.tertiary}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={[styles.input, { color: colors.text.primary }]}
                      placeholder="이메일"
                      placeholderTextColor={colors.input.placeholder}
                      value={email}
                      onChangeText={setEmail}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      autoComplete="email"
                      editable={!isLoading}
                      returnKeyType="next"
                      onSubmitEditing={() => passwordInputRef.current?.focus()}
                      blurOnSubmit={false}
                    />
                  </View>

                  <View
                    style={[
                      styles.inputContainer,
                      {
                        backgroundColor: colors.input.background,
                        borderColor: colors.input.border,
                      },
                    ]}
                  >
                    <Ionicons
                      name="lock-closed-outline"
                      size={20}
                      color={colors.text.tertiary}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      ref={passwordInputRef}
                      style={[styles.input, { color: colors.text.primary }]}
                      placeholder="비밀번호"
                      placeholderTextColor={colors.input.placeholder}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry
                      autoComplete="password"
                      editable={!isLoading}
                      returnKeyType="go"
                      onSubmitEditing={handleEmailLogin}
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={[
                    styles.loginButton,
                    { backgroundColor: colors.button.primary.background },
                  ]}
                  onPress={handleEmailLogin}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <Text style={styles.loginButtonText}>로그인</Text>
                  )}
                </TouchableOpacity>
              </Animated.View>
            )}
          </Animated.View>

          {/* Footer Info */}
          <Animated.View
            entering={FadeInDown.delay(500).springify()}
            layout={LinearTransition.springify()}
            style={styles.footer}
          >
            <Text style={[styles.footerText, { color: colors.text.tertiary }]}>
              로그인하면 이용약관 및 개인정보처리방침에{"\n"}동의하는 것으로
              간주합니다.
            </Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 24,
    borderRadius: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  actionContainer: {
    width: "100%",
  },
  socialButton: {
    height: 56,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 24,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F1F1F",
  },
  googleButton: {
    // Specific Google styles if needed
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    gap: 16,
    paddingHorizontal: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    opacity: 0.5,
  },
  dividerText: {
    fontSize: 14,
    fontWeight: "500",
  },
  emailToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 6,
    borderRadius: 8,
    marginBottom: 12,
  },
  emailToggleText: {
    fontSize: 14,
    fontWeight: "500",
  },
  formContainer: {
    marginTop: 8,
  },
  inputWrapper: {
    gap: 16,
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 16,
  },
  loginButton: {
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  footer: {
    marginTop: 40,
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
  },
});
