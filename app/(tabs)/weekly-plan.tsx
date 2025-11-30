import { DayCarousel } from "@/components/weekly-plan/day-carousel";
import { SessionExerciseEditor } from "@/components/weekly-plan/session-exercise-editor";
import { SummaryHeader } from "@/components/weekly-plan/summary-header";
import { WorkoutBoard } from "@/components/weekly-plan/workout-board";
import { useColor } from "@/constants/colors";
import { formatLocalDateISO } from "@/lib/date";
import { getWeekdayFromDate } from "@/lib/utils";
import {
  addWorkout,
  editWorkout,
  loadWeeklyPlan,
  removeWorkout,
  useDataStore,
} from "@/stores/data-store";
import {
  WEEKDAY_LABELS,
  WeeklyPlanExercise,
  WeeklyWorkoutInput,
} from "@/types/weekly-plan";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type EditorState = {
  visible: boolean;
  mode: "create" | "edit";
  targetDate: string;
  workout?: WeeklyPlanExercise | null;
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

  const [selectedDate, setSelectedDate] = useState<string>(
    formatLocalDateISO(new Date()),
  );

  // 화면 진입 시 데이터 새로고침 (이미 데이터가 있으면 백그라운드 로드)
  useFocusEffect(
    useCallback(() => {
      const hasData = weeklyPlan.sessionPlans.some(
        (plan) => plan.exercises.length > 0,
      );
      loadWeeklyPlan(hasData); // hasData가 true면 silent 모드
    }, [weeklyPlan.sessionPlans]),
  );

  useEffect(() => {
    if (weeklyPlan.sessionPlans.length === 0) {
      return;
    }
    const exists = weeklyPlan.sessionPlans.some(
      (plan) => plan.trainingDate === selectedDate,
    );
    if (!exists) {
      setSelectedDate(weeklyPlan.sessionPlans[0].trainingDate);
    }
  }, [weeklyPlan.sessionPlans, selectedDate]);

  const activePlan = useMemo(() => {
    if (weeklyPlan.sessionPlans.length === 0) {
      return null;
    }
    return (
      weeklyPlan.sessionPlans.find(
        (day) => day.trainingDate === selectedDate,
      ) ?? weeklyPlan.sessionPlans[0]
    );
  }, [weeklyPlan.sessionPlans, selectedDate]);

  const [editorState, setEditorState] = useState<EditorState>({
    visible: false,
    mode: "create",
    targetDate: selectedDate,
    workout: null,
  });

  const openCreateEditor = () => {
    if (isLoading || isMutating || !activePlan) return;

    setEditorState({
      visible: true,
      mode: "create",
      targetDate: activePlan.trainingDate,
      workout: null,
    });
  };

  const openEditEditor = (workout: WeeklyPlanExercise) => {
    if (isLoading || isMutating || !activePlan) return;
    setEditorState({
      visible: true,
      mode: "edit",
      targetDate: activePlan.trainingDate,
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
          editorState.targetDate,
          editorState.workout.id,
          payload,
        );
      } else if (editorState.mode === "create") {
        await addWorkout(editorState.targetDate, payload);
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
      if (!activePlan) {
        return;
      }
      await removeWorkout(activePlan.trainingDate, workoutId);
    } catch (err) {
      handleError("삭제 실패", err, "운동을 삭제하는 중 오류가 발생했습니다.");
    }
  };

  if (!activePlan) {
    return null;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { backgroundColor: colors.background },
        ]}
      >
        <SummaryHeader range={weeklyPlan.weekRange} />
        <DayCarousel
          sessionPlans={weeklyPlan.sessionPlans}
          selectedDate={activePlan.trainingDate}
          onSelectDate={setSelectedDate}
        />
        <WorkoutBoard
          sessionPlan={activePlan}
          onAdd={openCreateEditor}
          onEdit={openEditEditor}
          onDelete={handleDeleteWorkout}
          isLoading={isLoading}
          errorMessage={error}
          onRetry={() => {}}
          disabled={isMutating}
        />
      </ScrollView>
      <SessionExerciseEditor
        visible={editorState.visible}
        mode={editorState.mode}
        dayLabel={(() => {
          const target =
            weeklyPlan.sessionPlans.find(
              (day) => day.trainingDate === editorState.targetDate,
            ) ?? activePlan;
          const weekday = getWeekdayFromDate(target.trainingDate);
          return WEEKDAY_LABELS[weekday];
        })()}
        exercises={exercises}
        initialValues={
          editorState.workout && editorState.workout.exerciseId
            ? {
                exerciseId: editorState.workout.exerciseId,
                exerciseName: editorState.workout.exerciseName,
                targetMuscleGroup: editorState.workout.targetMuscleGroup,
                setDetails: editorState.workout.sets,
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
    paddingBottom: 140,
    gap: 20,
  },
});
