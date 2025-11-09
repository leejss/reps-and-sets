import { useColor } from "@/constants/colors";
import { useAuth } from "@/context/auth-context";
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

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const colors = useColor();

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      // 개발 중: 입력값이 없으면 기본 계정 사용
      const loginEmail = email.trim() || "dev@repandset.com";
      const loginPassword = password.trim() || "dev123";

      await login(loginEmail, loginPassword);

      // 로그인 성공 시 메인 화면으로 이동
      router.replace("/(tabs)");
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
            로그인
          </Text>

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

          {/* Login Button */}
          <TouchableOpacity
            style={[
              styles.loginButton,
              {
                backgroundColor: colors.button.primary.background,
                opacity: isLoading ? 0.6 : 1,
              },
            ]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.button.primary.text} />
            ) : (
              <>
                <Text
                  style={[
                    styles.loginButtonText,
                    { color: colors.button.primary.text },
                  ]}
                >
                  로그인
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Dev Info */}
          <View
            style={[
              styles.devInfo,
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
            <Text
              style={[styles.devInfoText, { color: colors.tag.tutorialText }]}
            >
              개발 중: 로그인 버튼만 눌러도 자동으로 인증됩니다
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
  inputGroup: {
    marginBottom: 20,
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
  devInfo: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    marginTop: 24,
  },
  devInfoText: {
    fontSize: 13,
    flex: 1,
  },
});
