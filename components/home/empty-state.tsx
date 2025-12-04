import { useColor } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export const EmptyState = () => {
  const colors = useColor();

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <View
        style={[styles.iconContainer, { backgroundColor: colors.background }]}
      >
        <Ionicons name="barbell" size={40} color={colors.primary} />
      </View>
      <Text style={[styles.title, { color: colors.text.primary }]}>
        오늘의 운동을 시작하세요
      </Text>
      <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
        아래 + 버튼을 눌러 새로운 운동을 추가하고{"\n"}기록을 시작해보세요!
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 40,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});
