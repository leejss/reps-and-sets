import { useColor } from "@/constants/colors";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type HomeHeaderProps = {
  dateLabel: string;
};

export const HomeHeader = ({ dateLabel }: HomeHeaderProps) => {
  const colors = useColor();

  return (
    <View style={[styles.container, { backgroundColor: colors.headerSurface }]}>
      <Text style={[styles.title, { color: colors.text.primary }]}>RepSet</Text>
      <Text style={[styles.date, { color: colors.text.secondary }]}>
        {dateLabel}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
  },
});

