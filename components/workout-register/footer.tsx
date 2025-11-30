import { useColor } from "@/constants/colors";
import { formatLocalDateISO } from "@/lib/date";
import { addTodayExercise, useDataStore } from "@/stores/data-store";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTodayExerciseRegister } from "./context";

export function TodayExerciseRegisterFooter() {
  const insets = useSafeAreaInsets();
  const colors = useColor();
  const exercises = useDataStore((state) => state.exercises);
  const { selectedExerciseId, sets, resetState } = useTodayExerciseRegister();

  const selectedExercise = exercises.find((e) => e.id === selectedExerciseId);

  const handleSubmit = async () => {
    if (!selectedExercise || sets.length === 0) {
      return;
    }

    // 최소한 하나의 세트에 reps가 입력되어야 함
    const hasValidSet = sets.some((set) => (set.plannedReps ?? 0) > 0);

    if (!hasValidSet) {
      return;
    }

    try {
      const today = formatLocalDateISO(new Date());
      await addTodayExercise({
        date: today,
        exerciseId: selectedExercise.id,
        exerciseName: selectedExercise.name,
        targetMuscleGroup: selectedExercise.targetMuscleGroup,
        sets,
      });

      resetState();
      router.back();
    } catch (error) {
      console.error("운동 추가 실패:", error);
    }
  };

  if (!selectedExercise) {
    return null;
  }

  return (
    <View
      style={[
        styles.bottomBar,
        {
          backgroundColor: colors.headerSurface,
          borderTopColor: colors.border,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.submitButton,
          {
            backgroundColor: colors.button.primary.background,
            opacity:
              sets.length === 0 || !sets.some((s) => (s.plannedReps ?? 0) > 0)
                ? 0.5
                : 1,
          },
        ]}
        onPress={handleSubmit}
        disabled={
          sets.length === 0 || !sets.some((s) => (s.plannedReps ?? 0) > 0)
        }
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={20} color={colors.button.primary.text} />
        <Text
          style={[
            styles.submitButtonText,
            { color: colors.button.primary.text },
          ]}
        >
          오늘의 운동에 추가
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomBar: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  submitButton: {
    height: 48,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
