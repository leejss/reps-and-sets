import { FloatingActionButton } from "@/components/floating-action-button";
import { useColor } from "@/constants/colors";
import { DayCarousel } from "@/features/weekly-plan/components/DayCarousel";
import { PlanWorkoutEditor } from "@/features/weekly-plan/components/PlanWorkoutEditor";
import { SummaryCard } from "@/features/weekly-plan/components/SummaryCard";
import { WorkoutBoard } from "@/features/weekly-plan/components/WorkoutBoard";
import {
  Weekday,
  WeeklyWorkout,
  WeeklyWorkoutInput,
} from "@/features/weekly-plan/types";
import { useWeeklyPlan } from "@/features/weekly-plan/useWeeklyPlan";
import { useAppStore } from "@/stores/app-store";
import React, { useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type EditorState = {
  visible: boolean;
  mode: "create" | "edit";
  targetDay: Weekday;
  workout?: WeeklyWorkout | null;
};

export default function WeeklyPlanScreen() {
  const colors = useColor();
  const exercises = useAppStore((state) => state.exercises);
  const {
    plan,
    selectedDay,
    selectDay,
    addWorkout,
    editWorkout,
    removeWorkout,
    isLoading,
    error,
    isMutating,
    refresh,
  } = useWeeklyPlan();

  const selectedPlan = useMemo(
    () =>
      plan.dayPlans.find((day) => day.id === selectedDay) ?? plan.dayPlans[0],
    [plan.dayPlans, selectedDay],
  );

  const [editorState, setEditorState] = useState<EditorState>({
    visible: false,
    mode: "create",
    targetDay: selectedPlan.id,
    workout: null,
  });

  const openCreateEditor = () => {
    if (isLoading || isMutating) return;
    setEditorState({
      visible: true,
      mode: "create",
      targetDay: selectedPlan.id,
      workout: null,
    });
  };

  const openEditEditor = (workout: WeeklyWorkout) => {
    if (isLoading || isMutating) return;
    setEditorState({
      visible: true,
      mode: "edit",
      targetDay: selectedPlan.id,
      workout,
    });
  };

  const closeEditor = () =>
    setEditorState((prev) => ({
      ...prev,
      visible: false,
    }));

  const handleSubmitEditor = async (payload: WeeklyWorkoutInput) => {
    try {
      if (editorState.mode === "edit" && editorState.workout) {
        await editWorkout(
          editorState.targetDay,
          editorState.workout.id,
          payload,
        );
      } else {
        await addWorkout(editorState.targetDay, payload);
      }
      closeEditor();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "주간 계획을 저장하는 중 오류가 발생했습니다.";
      Alert.alert("저장 실패", message);
    }
  };

  const handleDeleteWorkout = async (workoutId: string) => {
    try {
      await removeWorkout(selectedPlan.id, workoutId);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "운동을 삭제하는 중 오류가 발생했습니다.";
      Alert.alert("삭제 실패", message);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { backgroundColor: colors.background },
        ]}
      >
        <SummaryCard range={plan.weekRange} />
        <DayCarousel
          dayPlans={plan.dayPlans}
          selectedDay={selectedPlan.id}
          onSelectDay={selectDay}
        />
        <WorkoutBoard
          dayPlan={selectedPlan}
          onAdd={openCreateEditor}
          onEdit={openEditEditor}
          onDelete={handleDeleteWorkout}
          isLoading={isLoading}
          errorMessage={error}
          onRetry={refresh}
          disabled={isMutating}
        />
      </ScrollView>

      <FloatingActionButton onPress={openCreateEditor} bottom={32} />

      <PlanWorkoutEditor
        visible={editorState.visible}
        mode={editorState.mode}
        dayLabel={
          plan.dayPlans.find((day) => day.id === editorState.targetDay)
            ?.label ?? selectedPlan.label
        }
        exercises={exercises}
        initialValues={
          editorState.workout
            ? {
                exerciseId: editorState.workout.exerciseId,
                exerciseName: editorState.workout.exerciseName,
                muscleGroup: editorState.workout.muscleGroup,
                setDetails: editorState.workout.setDetails,
                note: editorState.workout.note,
              }
            : undefined
        }
        onClose={closeEditor}
        onSubmit={handleSubmitEditor}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 140,
    gap: 20,
  },
});
