import type { SetDetail, TodayWorkout } from "@/lib/types";
import type { TablesUpdate } from "../database.types";
import { formatLocalDateISO } from "../date";
import { supabase } from "../supabase";
import {
  createSessionExerciseWithSets,
  fetchSessionDetail,
  getOrCreateSessionForDate,
} from "./workoutSessions.query";

const mapSetDetailsFromSession = (
  sets: {
    plannedReps?: number | null;
    plannedWeight?: number | null;
    actualReps?: number | null;
    actualWeight?: number | null;
    isCompleted: boolean;
  }[],
): SetDetail[] => {
  return sets.map((set) => ({
    reps: set.actualReps ?? set.plannedReps ?? 0,
    weight: set.actualWeight ?? set.plannedWeight ?? undefined,
    completed: set.isCompleted,
  }));
};

export const fetchTodayWorkouts = async (
  date: Date | string,
): Promise<TodayWorkout[]> => {
  const session = await getOrCreateSessionForDate(date);
  const exercises = await fetchSessionDetail(session.id);

  const dateISO = formatLocalDateISO(date);

  return exercises.map((exercise) => ({
    id: exercise.id,
    exerciseId: exercise.exerciseId,
    exerciseName: exercise.exerciseName,
    muscleGroup: exercise.muscleGroup,
    setDetails: mapSetDetailsFromSession(exercise.sets),
    completed: exercise.isCompleted,
    date: dateISO,
  }));
};

export const createTodayWorkout = async (
  workout: Omit<TodayWorkout, "id">,
): Promise<TodayWorkout> => {
  const session = await getOrCreateSessionForDate(workout.date);
  const existingExercises = await fetchSessionDetail(session.id);
  const orderInSession = existingExercises.length;

  const sessionExercise = await createSessionExerciseWithSets({
    sessionId: session.id,
    exerciseId: workout.exerciseId,
    orderInSession,
    plannedSets: workout.setDetails.map((set) => ({
      reps: set.reps,
      weight: set.weight,
    })),
  });

  const setDetails = mapSetDetailsFromSession(sessionExercise.sets);

  return {
    id: sessionExercise.id,
    exerciseId: sessionExercise.exerciseId,
    exerciseName: sessionExercise.exerciseName,
    muscleGroup: sessionExercise.muscleGroup,
    setDetails,
    completed: sessionExercise.isCompleted,
    date: formatLocalDateISO(session.date),
  };
};

export const updateTodayWorkoutCompletion = async (
  sessionExerciseId: string,
  completed: boolean,
): Promise<void> => {
  const { error } = await supabase
    .from("workout_sets")
    .update({ is_completed: completed })
    .eq("session_exercise_id", sessionExerciseId);

  if (error) {
    console.error("오늘의 운동 완료 상태 업데이트 실패:", error);
    throw error;
  }
};

export const updateTodaySetCompletion = async (
  sessionExerciseId: string,
  setIndex: number,
  completed: boolean,
): Promise<void> => {
  const { error } = await supabase
    .from("workout_sets")
    .update({ is_completed: completed })
    .eq("session_exercise_id", sessionExerciseId)
    .eq("set_order", setIndex);

  if (error) {
    console.error("세트 완료 상태 업데이트 실패:", error);
    throw error;
  }
};

export const updateTodaySetDetails = async (
  sessionExerciseId: string,
  setIndex: number,
  reps: number,
  weight?: number,
): Promise<void> => {
  const payload: TablesUpdate<"workout_sets"> = {
    actual_reps: reps,
    actual_weight: weight ?? null,
  };

  const { error } = await supabase
    .from("workout_sets")
    .update(payload)
    .eq("session_exercise_id", sessionExerciseId)
    .eq("set_order", setIndex);

  if (error) {
    console.error("세트 상세 정보 업데이트 실패:", error);
    throw error;
  }
};
