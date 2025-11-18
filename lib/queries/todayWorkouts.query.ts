import type { TodayWorkout } from "@/lib/types";
import type { TablesUpdate } from "../database.types";
import { formatLocalDateISO } from "../date";
import { supabase } from "../supabase";
import {
  createSessionExerciseWithSets,
  fetchWorkoutSessionExercise,
  getOrCreateWorkoutSession,
} from "./workoutSessions.query";

export const fetchTodayExercises = async (
  date: Date | string,
): Promise<TodayWorkout[]> => {
  // 현재 date에 해당하는 세션을 조회, 없으면 생성
  const workoutSession = await getOrCreateWorkoutSession(date);
  // 세션에 속한 운동 목록을 조회
  const exercises = await fetchWorkoutSessionExercise(workoutSession.id);

  return exercises.map((exercise) => ({
    id: exercise.id,
    exerciseId: exercise.exerciseId,
    exerciseName: exercise.exerciseName,
    targetMuscleGroup: exercise.muscleGroup,
    workoutSetList: exercise.sets,
    completed: exercise.isCompleted,
    date: formatLocalDateISO(date),
  }));
};

export const createTodayWorkout = async (
  workout: Omit<TodayWorkout, "id">,
): Promise<TodayWorkout> => {
  const workoutSession = await getOrCreateWorkoutSession(workout.date);
  const existingExercises = await fetchWorkoutSessionExercise(
    workoutSession.id,
  );
  const orderInSession = existingExercises.length;

  const sessionExercise = await createSessionExerciseWithSets({
    sessionId: workoutSession.id,
    exerciseId: workout.exerciseId,
    orderInSession,
    plannedSets: workout.workoutSetList.map((set, index) => ({
      reps: set.plannedReps ?? 0,
      weight: set.plannedWeight ?? undefined,
    })),
  });

  const setDetails = sessionExercise.sets;

  return {
    id: sessionExercise.id,
    exerciseId: sessionExercise.exerciseId,
    exerciseName: sessionExercise.exerciseName,
    targetMuscleGroup: sessionExercise.muscleGroup,
    workoutSetList: setDetails,
    completed: sessionExercise.isCompleted,
    date: formatLocalDateISO(workoutSession.date),
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
