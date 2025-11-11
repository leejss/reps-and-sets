import { useColor } from "@/constants/colors";
import { useAuthStore } from "@/stores/auth-store";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
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
import { Routes } from "./route-config";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showDevLogin, setShowDevLogin] = useState(false);
  const signInWithGoogle = useAuthStore((state) => state.signInWithGoogle);
  const signInWithKakao = useAuthStore((state) => state.signInWithKakao);
  const signInWithEmail = useAuthStore((state) => state.signInWithEmail);
  const colors = useColor();

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
      // 로그인 성공 시 메인 화면으로 이동
      router.replace(Routes.TABS);
    } catch (error) {
      Alert.alert(
        "Google 로그인 실패",
        error instanceof Error ? error.message : "로그인에 실패했습니다.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // const handleKakaoLogin = async () => {
  //   setIsLoading(true);
  //   try {
  //     await signInWithKakao();
  //     // 로그인 성공 시 메인 화면으로 이동
  //     router.replace(Routes.TABS);
  //   } catch (error) {
  //     Alert.alert(
  //       "Kakao 로그인 실패",
  //       error instanceof Error ? error.message : "로그인에 실패했습니다.",
  //     );
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleEmailLogin = async () => {
    if (!signInWithEmail) {
      Alert.alert("알림", "개발용 로그인이 비활성화되었습니다.");
      return;
    }

    if (!email.trim() || !password.trim()) {
      Alert.alert("알림", "이메일과 비밀번호를 입력해주세요.");
      return;
    }

    setIsLoading(true);
    try {
      await signInWithEmail(email.trim(), password.trim());
      // 로그인 성공 시 메인 화면으로 이동
      router.replace(Routes.TABS);
    } catch (error) {
      Alert.alert(
        "로그인 실패",
        error instanceof Error ? error.message : "로그인에 실패했습니다.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.headerSurface }]}>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
          Rep & Set
        </Text>
        <Text style={[styles.headerSubtitle, { color: colors.text.secondary }]}>
          운동을 기록하고 성장하세요
        </Text>
      </View>

      {/* Content */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.content}
      >
        <ScrollView
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            소셜 로그인
          </Text>

          {/* Google Login Button */}
          <TouchableOpacity
            style={[
              styles.socialButton,
              styles.googleButton,
              { opacity: isLoading ? 0.6 : 1 },
            ]}
            onPress={handleGoogleLogin}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <Ionicons name="logo-google" size={20} color="#4285F4" />
            <Text style={styles.socialButtonText}>Google로 계속하기</Text>
          </TouchableOpacity>

          {/* Kakao Login Button */}
          {/* <TouchableOpacity
            style={[
              styles.socialButton,
              styles.kakaoButton,
              { opacity: isLoading ? 0.6 : 1 },
            ]}
            onPress={handleKakaoLogin}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <Ionicons name="chatbubble" size={20} color="#000000" />
            <Text style={styles.kakaoButtonText}>Kakao로 계속하기</Text>
          </TouchableOpacity>
 */}
          {/* Divider */}
          <View style={styles.divider}>
            <View
              style={[styles.dividerLine, { backgroundColor: colors.border }]}
            />
            <Text
              style={[styles.dividerText, { color: colors.text.secondary }]}
            >
              또는
            </Text>
            <View
              style={[styles.dividerLine, { backgroundColor: colors.border }]}
            />
          </View>

          {/* Dev Login Toggle */}
          <TouchableOpacity
            style={styles.devToggle}
            onPress={() => setShowDevLogin(!showDevLogin)}
          >
            <Text
              style={[styles.devToggleText, { color: colors.text.secondary }]}
            >
              {showDevLogin ? "개발자 로그인 숨기기" : "개발자 로그인 표시"}
            </Text>
            <Ionicons
              name={showDevLogin ? "chevron-up" : "chevron-down"}
              size={16}
              color={colors.text.secondary}
            />
          </TouchableOpacity>

          {/* Dev Email Login */}
          {showDevLogin && (
            <View style={styles.devLoginSection}>
              {/* Email Input */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text.label }]}>
                  이메일
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.input.background,
                      borderColor: colors.input.border,
                      color: colors.text.primary,
                    },
                  ]}
                  placeholder="example@email.com"
                  placeholderTextColor={colors.input.placeholder}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                  editable={!isLoading}
                />
              </View>

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text.label }]}>
                  비밀번호
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.input.background,
                      borderColor: colors.input.border,
                      color: colors.text.primary,
                    },
                  ]}
                  placeholder="••••••••"
                  placeholderTextColor={colors.input.placeholder}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoComplete="password"
                  editable={!isLoading}
                />
              </View>

              {/* Email Login Button */}
              <TouchableOpacity
                style={[
                  styles.loginButton,
                  {
                    backgroundColor: colors.button.secondary.background,
                    opacity: isLoading ? 0.6 : 1,
                  },
                ]}
                onPress={handleEmailLogin}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.button.secondary.text} />
                ) : (
                  <Text
                    style={[
                      styles.loginButtonText,
                      { color: colors.button.secondary.text },
                    ]}
                  >
                    이메일로 로그인
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Info */}
          <View
            style={[
              styles.infoBox,
              {
                backgroundColor: colors.tag.tutorial,
                borderColor: colors.border,
              },
            ]}
          >
            <Ionicons
              name="information-circle-outline"
              size={16}
              color={colors.tag.tutorialText}
            />
            <Text style={[styles.infoText, { color: colors.tag.tutorialText }]}>
              Supabase와 연동되어 있습니다. Google 또는 Kakao 계정으로
              로그인하세요.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 32,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 24,
  },
  socialButton: {
    height: 52,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    gap: 12,
    borderWidth: 1,
  },
  googleButton: {
    backgroundColor: "#FFFFFF",
    borderColor: "#DADCE0",
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F1F1F",
  },
  kakaoButton: {
    backgroundColor: "#FEE500",
    borderColor: "#FEE500",
  },
  kakaoButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
    gap: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 14,
  },
  devToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 8,
  },
  devToggleText: {
    fontSize: 14,
  },
  devLoginSection: {
    marginTop: 16,
    paddingTop: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  loginButton: {
    height: 48,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    gap: 8,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    marginTop: 24,
  },
  infoText: {
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
});
