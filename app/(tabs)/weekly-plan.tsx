import { useColor } from "@/constants/colors";
import { DayCarousel } from "@/features/weekly-plan/components/DayCarousel";
import { PlanWorkoutEditor } from "@/features/weekly-plan/components/PlanWorkoutEditor";
import { SummaryCard } from "@/features/weekly-plan/components/SummaryCard";
import { WorkoutBoard } from "@/features/weekly-plan/components/WorkoutBoard";
import { getWeekdayFromDate } from "@/lib/utils";
import {
  addWorkout,
  editWorkout,
  removeWorkout,
  useDataStore,
} from "@/stores/data-store";
import {
  Weekday,
  WeeklyWorkout,
  WeeklyWorkoutInput,
} from "@/types/weekly-plan";
import React, { useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type EditorState = {
  visible: boolean;
  mode: "create" | "edit";
  targetDay: Weekday;
  workout?: WeeklyWorkout | null;
};

const handleError = (
  title: string,
  error: unknown,
  defaultMessage: string = "오류가 발생했습니다.",
) => {
  const message = error instanceof Error ? error.message : defaultMessage;
  Alert.alert(title, message);
};

export default function WeeklyPlanScreen() {
  const colors = useColor();
  const exercises = useDataStore((state) => state.exercises);
  const weeklyPlan = useDataStore((state) => state.weeklyPlan);
  const isLoading = useDataStore((state) => state.isLoadingWeeklyPlan);
  const error = useDataStore((state) => state.weeklyPlanError);
  const isMutating = useDataStore((state) => state.isMutatingWeeklyPlan);

  const [selectedDay, setSelectedDay] = useState<Weekday>(
    getWeekdayFromDate(new Date()),
  );

  const selectedPlan = useMemo(
    () =>
      weeklyPlan.dayPlans.find((day) => day.id === selectedDay) ??
      weeklyPlan.dayPlans[0],
    [weeklyPlan.dayPlans, selectedDay],
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
      }

      if (editorState.mode === "create") {
        await addWorkout(editorState.targetDay, payload);
      }

      closeEditor();
    } catch (err) {
      handleError(
        "저장 실패",
        err,
        "주간 계획을 저장하는 중 오류가 발생했습니다.",
      );
    }
  };

  const handleDeleteWorkout = async (workoutId: string) => {
    try {
      await removeWorkout(selectedPlan.id, workoutId);
    } catch (err) {
      handleError("삭제 실패", err, "운동을 삭제하는 중 오류가 발생했습니다.");
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
        <SummaryCard range={weeklyPlan.weekRange} />
        <DayCarousel
          dayPlans={weeklyPlan.dayPlans}
          selectedDay={selectedPlan.id}
          onSelectDay={setSelectedDay}
        />
        <WorkoutBoard
          dayPlan={selectedPlan}
          onAdd={openCreateEditor}
          onEdit={openEditEditor}
          onDelete={handleDeleteWorkout}
          isLoading={isLoading}
          errorMessage={error}
          onRetry={() => {}}
          disabled={isMutating}
        />
      </ScrollView>
      <PlanWorkoutEditor
        visible={editorState.visible}
        mode={editorState.mode}
        dayLabel={
          weeklyPlan.dayPlans.find((day) => day.id === editorState.targetDay)
            ?.label ?? selectedPlan.label
        }
        exercises={exercises}
        initialValues={
          editorState.workout
            ? {
                exerciseId: editorState.workout.exerciseId,
                exerciseName: editorState.workout.exerciseName,
                muscleGroup: editorState.workout.muscleGroup,
                setDetails: editorState.workout.workoutSetList,
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
