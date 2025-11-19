import { useColor } from "@/constants/colors";
import { DayPlan, Weekday } from "@/types/weekly-plan";
import React, { useEffect, useRef, useState } from "react";
import {
  LayoutChangeEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";

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

  const scrollRef = useRef<ScrollView | null>(null);
  const [chipLayouts, setChipLayouts] = useState<
    Partial<Record<Weekday, { x: number; width: number }>>
  >({});

  const handleChipLayout = (dayId: Weekday) => (event: LayoutChangeEvent) => {
    const { x, width } = event.nativeEvent.layout;
    setChipLayouts((prev) => {
      const prevLayout = prev[dayId];
      if (prevLayout && prevLayout.x === x && prevLayout.width === width) {
        return prev;
      }
      return { ...prev, [dayId]: { x, width } };
    });
  };

  useEffect(() => {
    const layout = chipLayouts[selectedDay];
    if (!layout || !scrollRef.current) {
      return;
    }

    scrollRef.current.scrollTo({
      x: layout.x,
      y: 0,
      animated: true,
    });
  }, [chipLayouts, selectedDay]);

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.carousel}
    >
      {dayPlans.map((day) => {
        const isSelected = day.id === selectedDay;

        return (
          <TouchableOpacity
            key={day.id}
            onLayout={handleChipLayout(day.id)}
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
