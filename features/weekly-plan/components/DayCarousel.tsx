import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";

import { useColor } from "@/constants/colors";

import { DayPlan, Weekday } from "../types";

type DayCarouselProps = {
  dayPlans: DayPlan[];
  selectedDay: Weekday;
  onSelectDay: (dayId: Weekday) => void;
};

export const DayCarousel = ({
  dayPlans,
  selectedDay,
  onSelectDay,
}: DayCarouselProps) => {
  const colors = useColor();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.carousel}
    >
      {dayPlans.map((day) => {
        const isSelected = day.id === selectedDay;

        return (
          <TouchableOpacity
            key={day.id}
            style={[
              styles.dayChip,
              {
                backgroundColor: isSelected
                  ? colors.primary
                  : colors.iconButton.background,
              },
            ]}
            onPress={() => onSelectDay(day.id)}
            activeOpacity={0.85}
          >
            <Text
              style={[
                styles.dayChipLabel,
                {
                  color: isSelected
                    ? colors.button.primary.text
                    : colors.text.primary,
                },
              ]}
            >
              {day.label}
            </Text>
            <Text
              style={[
                styles.dayChipDate,
                {
                  color: isSelected
                    ? colors.button.primary.text
                    : colors.text.secondary,
                },
              ]}
            >
              {day.dateLabel}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  carousel: {
    gap: 12,
    paddingBottom: 4,
  },
  dayChip: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    gap: 4,
    minWidth: 88,
  },
  dayChipLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  dayChipDate: {
    fontSize: 12,
  },
});

