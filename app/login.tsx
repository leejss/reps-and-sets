import { useColor } from "@/constants/colors";
import { signInWithGoogle } from "@/stores/auth-store";
import { AntDesign } from "@expo/vector-icons";
import React, { useCallback, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const colors = useColor();

  const handleGoogleLogin = useCallback(async () => {
    setIsLoading(true);
    try {
      const success = await signInWithGoogle();
      if (!success) {
        // 사용자가 취소한 경우
        console.log("Google 로그인 취소됨");
      }
      // 성공 시 onAuthStateChange가 트리거되어 자동 네비게이션
    } catch (error) {
      Alert.alert(
        "로그인 실패",
        error instanceof Error
          ? error.message
          : "Google 로그인에 실패했습니다.",
      );
    } finally {
      setIsLoading(false);
    }
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
            <Text style={[styles.title, { color: colors.text.primary }]}>
              Reps & Sets
            </Text>
            <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
              운동의 시작,{"\n"}지금 바로 기록해보세요
            </Text>
          </Animated.View>

          <Animated.View
            entering={FadeInUp.delay(300).springify()}
            style={styles.formContainer}
          >
            <TouchableOpacity
              style={[
                styles.socialButton,
                {
                  backgroundColor: colors.input.background,
                  borderColor: colors.border,
                },
              ]}
              onPress={handleGoogleLogin}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <AntDesign
                name="google"
                size={20}
                color={colors.text.primary}
                style={styles.socialIcon}
              />
              <Text
                style={[
                  styles.socialButtonText,
                  { color: colors.text.primary },
                ]}
              >
                Google로 시작하기
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Footer Info */}
          <Animated.View
            entering={FadeInDown.delay(500).springify()}
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
  formContainer: {
    width: "100%",
  },
  socialButton: {
    flexDirection: "row",
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  socialIcon: {
    marginRight: 12,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: "600",
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
