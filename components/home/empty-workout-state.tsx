import { useColor } from "@/constants/colors";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export const EmptyWorkoutState = () => {
  const colors = useColor();

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <Text style={[styles.title, { color: colors.text.secondary }]}>
        등록된 운동이 없습니다.
      </Text>
      <Text style={[styles.subtitle, { color: colors.text.tertiary }]}>
        아래 + 버튼을 눌러 운동을 추가해보세요
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 32,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  title: {
    fontSize: 14,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 12,
    marginTop: 8,
    textAlign: "center",
  },
});

