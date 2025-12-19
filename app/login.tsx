import { useColor } from "@/constants/colors";
import { signInWithGoogle, signInDev } from "@/stores/auth-store";
import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useCallback, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const colors = useColor();

  const handleGoogleLogin = useCallback(async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
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

  const handleDevBypass = useCallback(async () => {
    setIsLoading(true);
    try {
      await signInDev();
    } catch (error) {
      Alert.alert("Bypass 실패", "개발용 로그인에 실패했습니다.");
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

            {__DEV__ && (
              <TouchableOpacity
                style={[
                  styles.devButton,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                  },
                ]}
                onPress={handleDevBypass}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons
                  name="xml"
                  size={20}
                  color={colors.text.secondary}
                  style={styles.socialIcon}
                />
                <Text
                  style={[
                    styles.devButtonText,
                    { color: colors.text.secondary },
                  ]}
                >
                  Developer Bypass
                </Text>
              </TouchableOpacity>
            )}
          </Animated.View>

          {/* Footer Info */}
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
    gap: 12,
  },
  socialButton: {
    flexDirection: "row",
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  devButton: {
    flexDirection: "row",
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    marginTop: 12,
    borderStyle: "dashed",
  },
  socialIcon: {
    marginRight: 12,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  devButtonText: {
    fontSize: 14,
    fontWeight: "500",
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
