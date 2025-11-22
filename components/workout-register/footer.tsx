import { useColor } from "@/constants/colors";
import { formatLocalDateISO } from "@/lib/date";
import { addTodaySessionExercise, useDataStore } from "@/stores/data-store";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useWorkoutRegister } from "./context";

export function WorkoutRegisterFooter() {
  const insets = useSafeAreaInsets();
  const colors = useColor();
  const exercises = useDataStore((state) => state.exercises);
  const {
    selectedExerciseId,
    workoutSetList,
    setSelectedExerciseId,
    setNumberOfSets,
    setWorkoutSetList,
    setUniformReps,
    setUniformWeight,
    setUseUniformValues,
  } = useWorkoutRegister();

  const selectedExercise = exercises.find((e) => e.id === selectedExerciseId);

  const handleSubmit = async () => {
    if (!selectedExercise || workoutSetList.length === 0) {
      return;
    }

    // 최소한 하나의 세트에 reps가 입력되어야 함
    const hasValidSet = workoutSetList.some(
      (set) => (set.plannedReps ?? 0) > 0,
    );
    if (!hasValidSet) {
      return;
    }

    try {
      const today = formatLocalDateISO(new Date());
      await addTodaySessionExercise({
        exerciseId: selectedExercise.id,
        exerciseName: selectedExercise.name,
        targetMuscleGroup: selectedExercise.targetMuscleGroup,
        workoutSetList: workoutSetList.map((set, index) => ({
          id: undefined,
          setOrder: set.setOrder ?? index,
          plannedReps: set.plannedReps ?? 0,
          plannedWeight: set.plannedWeight ?? undefined,
          actualReps: null,
          actualWeight: null,
          completed: false,
        })),
        completed: false,
        date: today,
      });

      setSelectedExerciseId(null);
      setNumberOfSets("");
      setWorkoutSetList([]);
      setUniformReps("");
      setUniformWeight("");
      setUseUniformValues(true);
      router.back();
    } catch (error) {
      console.error("운동 추가 실패:", error);
      // 에러는 Context에서 이미 처리되었으므로 여기서는 로그만 남김
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
              workoutSetList.length === 0 ||
              !workoutSetList.some((s) => (s.plannedReps ?? 0) > 0)
                ? 0.5
                : 1,
          },
        ]}
        onPress={handleSubmit}
        disabled={
          workoutSetList.length === 0 ||
          !workoutSetList.some((s) => (s.plannedReps ?? 0) > 0)
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
