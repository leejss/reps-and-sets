import type { Tables, TablesInsert, TablesUpdate } from "../database.types";
import { supabase } from "../supabase";
import { fetchWorkoutSessionExercise } from "./workoutSessionExercises.query";
import { getOrCreateWorkoutSession } from "./workoutSessions.query";
import type { WorkoutSet } from "./workoutSets.model";
import { mapSetRow } from "./workoutSets.model";
export { mapSetRow } from "./workoutSets.model";
export type { WorkoutSet } from "./workoutSets.model";

export interface WorkoutSetPlanInput {
  reps?: number | null;
  weight?: number | null;
}

export const insertWorkoutSetsForSessionExercise = async (params: {
  sessionExerciseId: string;
  plannedSets: WorkoutSetPlanInput[];
}): Promise<WorkoutSet[]> => {
  if (params.plannedSets.length === 0) {
    return [];
  }

  const payload: TablesInsert<"workout_sets">[] = params.plannedSets.map(
    (set, index) => ({
      session_exercise_id: params.sessionExerciseId,
      set_order: index,
      planned_reps: set.reps ?? null,
      planned_weight: set.weight ?? null,
    }),
  );

  const { data, error } = await supabase
    .from("workout_sets")
    .insert(payload)
    .select("*");

  if (error) {
    console.error("세트 생성 실패:", error);
    throw error;
  }

  const rows = (data ?? []) as Tables<"workout_sets">[];
  return rows.map(mapSetRow);
};

export const replaceWorkoutSetsForSessionExercise = async (params: {
  sessionExerciseId: string;
  plannedSets: WorkoutSetPlanInput[];
}): Promise<WorkoutSet[]> => {
  const { error: deleteError } = await supabase
    .from("workout_sets")
    .delete()
    .eq("session_exercise_id", params.sessionExerciseId);

  if (deleteError) {
    console.error("세트 삭제 실패:", deleteError);
    throw deleteError;
  }

  if (params.plannedSets.length === 0) {
    return [];
  }

  return insertWorkoutSetsForSessionExercise(params);
};

// 오늘의 운동(세션 운동) 관련 유틸리티

export const fetchSessionExercisesByDate = async (date: Date | string) => {
  // 현재 date에 해당하는 세션을 조회, 없으면 생성
  const workoutSession = await getOrCreateWorkoutSession(date);
  // 세션에 속한 운동 목록을 조회
  const sessionExercises = await fetchWorkoutSessionExercise(workoutSession.id);
  return sessionExercises;
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
