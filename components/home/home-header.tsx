import { useColor } from "@/constants/colors";
import { formatKoreanHeaderDate } from "@/lib/date";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: 24,
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
});
