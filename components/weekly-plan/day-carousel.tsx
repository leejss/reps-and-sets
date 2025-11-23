import { useColor } from "@/constants/colors";
import { formatChipDate } from "@/lib/date";
import { getWeekdayFromDate } from "@/lib/utils";
import {
  Weekday,
  WEEKDAY_LABELS,
  WeeklySessionPlan,
} from "@/types/weekly-plan";
import React, { useEffect, useRef, useState } from "react";
import {
  LayoutChangeEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";

type DayCarouselProps = {
  sessionPlans: WeeklySessionPlan[];
  selectedDate: string;
  onSelectDate: (dateISO: string) => void;
};

export const DayCarousel = ({
  sessionPlans,
  selectedDate,
  onSelectDate,
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
    const layout = chipLayouts[getWeekdayFromDate(selectedDate)];
    if (!layout || !scrollRef.current) {
      return;
    }

    scrollRef.current.scrollTo({
      x: layout.x,
      y: 0,
      animated: true,
    });
  }, [chipLayouts, selectedDate]);

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.carousel}
    >
      {sessionPlans.map((plan) => {
        const weekdayId = getWeekdayFromDate(plan.sessionDate);
        const isSelected = selectedDate === plan.sessionDate;

        return (
          <TouchableOpacity
            key={plan.sessionDate}
            onLayout={handleChipLayout(weekdayId)}
            style={[
              styles.dayChip,
              {
                backgroundColor: isSelected
                  ? colors.primary
                  : colors.iconButton.background,
              },
            ]}
            onPress={() => onSelectDate(plan.sessionDate)}
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
              {WEEKDAY_LABELS[weekdayId]}
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
              {formatChipDate(plan.sessionDate)}
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
