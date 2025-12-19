import { useColor } from "@/constants/colors";
import { formatKoreanHeaderDate } from "@/lib/date";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Routes } from "@/app/route-config";

export const HomeHeader = () => {
  const colors = useColor();
  const dateLabel = formatKoreanHeaderDate();

  return (
    <View style={[styles.container, { backgroundColor: colors.headerSurface }]}>
      <View>
        <Text style={[styles.title, { color: colors.text.primary }]}>
          {dateLabel}
        </Text>
      </View>
      <View style={styles.rightSection}>
        <TouchableOpacity
          onPress={() => router.push(Routes.SETTINGS)}
          hitSlop={8}
          activeOpacity={0.7}
        >
          <Ionicons name="settings-outline" size={24} color={colors.text.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
});
