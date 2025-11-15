import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useColor } from "@/constants/colors";

type SummaryCardProps = {
  range: string;
};

export const SummaryCard = ({ range }: SummaryCardProps) => {
  const colors = useColor();

  return (
    <View style={[styles.summaryCard, { backgroundColor: colors.primary }]}>
      <View>
        <Text
          style={[styles.summaryLabel, { color: colors.button.primary.text }]}
        >
          이번 주 계획
        </Text>
        <Text
          style={[styles.summaryRange, { color: colors.button.primary.text }]}
        >
          {range}
        </Text>
      </View>
      <Text style={[styles.summaryHint, { color: colors.button.primary.text }]}>
        요일을 선택하고 운동을 추가하세요
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  summaryCard: {
    borderRadius: 24,
    padding: 24,
    gap: 12,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: "600",
    opacity: 0.9,
  },
  summaryRange: {
    fontSize: 24,
    fontWeight: "700",
  },
  summaryHint: {
    fontSize: 14,
    opacity: 0.8,
  },
});

