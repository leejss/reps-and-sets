import { useColor } from "@/constants/colors";
import { continueAsGuest, signInWithEmail } from "@/stores/auth-store";
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

  // 게스트 모드로 시작하기
  const handleGuestLogin = useCallback(() => {
    try {
      setIsLoading(true);
      continueAsGuest();
      router.replace(Routes.TABS);
    } catch (error) {
      console.error(error);
      Alert.alert("오류", "게스트 모드로 진입하는 중 문제가 발생했습니다.");
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
              운동의 시작,{"\n"}지금 바로 기록해보세요
            </Text>
          </Animated.View>

          {/* Action Section */}
          <Animated.View
            entering={FadeInDown.delay(300).springify()}
            style={styles.actionContainer}
            layout={LinearTransition.springify()}
          >
            {/* Primary Action: Guest Mode */}
            {!showEmailLogin && (
              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  {
                    backgroundColor: colors.button.primary.background,
                    shadowColor: colors.button.primary.background,
                  },
                ]}
                onPress={handleGuestLogin}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <>
                    <Text style={styles.primaryButtonText}>
                      비회원으로 시작하기
                    </Text>
                    <Ionicons name="arrow-forward" size={20} color="#FFF" />
                  </>
                )}
              </TouchableOpacity>
            )}

            {/* Secondary Action: Toggle Email Login */}
            <TouchableOpacity
              style={[
                styles.secondaryButton,
                {
                  backgroundColor: showEmailLogin
                    ? colors.surface
                    : "transparent",
                  borderColor: showEmailLogin ? "transparent" : colors.border,
                  marginTop: showEmailLogin ? 0 : 16,
                },
              ]}
              onPress={toggleEmailLogin}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.secondaryButtonText,
                  { color: colors.text.primary },
                ]}
              >
                {showEmailLogin ? "이메일 로그인 닫기" : "이메일로 로그인"}
              </Text>
              <Ionicons
                name={showEmailLogin ? "chevron-up" : "mail-outline"}
                size={18}
                color={colors.text.primary}
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
              Reps & Sets는 여러분의 건강한 운동 습관을 응원합니다.
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
    marginBottom: 48,
  },
  logo: {
    width: 96,
    height: 96,
    marginBottom: 24,
    borderRadius: 24,
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
    opacity: 0.8,
  },
  actionContainer: {
    width: "100%",
    gap: 12,
  },
  primaryButton: {
    height: 58,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 8,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  secondaryButton: {
    height: 56,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  formContainer: {
    marginTop: 8,
    backgroundColor: "transparent",
  },
  inputWrapper: {
    gap: 12,
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
    marginTop: 48,
    alignItems: "center",
  },
  footerText: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
    opacity: 0.6,
  },
});
