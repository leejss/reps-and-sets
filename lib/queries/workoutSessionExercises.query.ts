import type { Tables, TablesInsert } from "../database.types";
import { supabase } from "../supabase";
import { mapSetRow, WorkoutSet } from "./workoutSets.model";

export interface SessionExerciseWithSets {
  id: string;
  sessionId: string;
  exerciseId: string | null;
  exerciseName: string;
  targetMuscleGroup: string;
  completed: boolean;
  orderInSession: number;
  sets: WorkoutSet[];
  /** 운동이 삭제되었는지 여부 */
  isDeleted: boolean;
}

type SessionExerciseJoinedRow = Tables<"workout_session_exercises"> & {
  exercises: Tables<"exercises"> | null;
  workout_sets: Tables<"workout_sets">[] | null;
};

/** 삭제된 운동의 기본 표시 텍스트 */
export const DELETED_EXERCISE_NAME = "삭제된 운동";
export const DELETED_EXERCISE_MUSCLE_GROUP = "미분류";

export const mapSessionExerciseJoinedRow = (
  row: SessionExerciseJoinedRow,
): SessionExerciseWithSets => {
  const isDeleted = row.exercise_id === null || row.exercises === null;

  return {
    id: row.id,
    sessionId: row.session_id,
    exerciseId: row.exercise_id,
    exerciseName: row.exercises?.name ?? DELETED_EXERCISE_NAME,
    targetMuscleGroup:
      row.exercises?.target_muscle_group ?? DELETED_EXERCISE_MUSCLE_GROUP,
    completed: row.is_completed,
    orderInSession: row.order_in_session,
    sets: (row.workout_sets ?? []).map(mapSetRow),
    isDeleted,
  };
};

export const fetchWorkoutSessionExercise = async (
  sessionId: string,
): Promise<SessionExerciseWithSets[]> => {
  const { data, error } = await supabase
    .from("workout_session_exercises")
    .select("*, exercises(*), workout_sets(*)")
    .eq("session_id", sessionId)
    .order("order_in_session", { ascending: true });

  if (error) {
    console.error("세션 상세 조회 실패:", error);
    throw error;
  }

  return ((data as SessionExerciseJoinedRow[] | null) ?? []).map(
    mapSessionExerciseJoinedRow,
  );
};

export const insertSessionExercise = async (params: {
  sessionId: string;
  exerciseId: string;
  orderInSession: number;
}): Promise<{
  id: string;
  sessionId: string;
  exerciseId: string;
  orderInSession: number;
}> => {
  const payload: TablesInsert<"workout_session_exercises"> = {
    session_id: params.sessionId,
    exercise_id: params.exerciseId,
    order_in_session: params.orderInSession,
  };

  const { data, error } = await supabase
    .from("workout_session_exercises")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    console.error("세션 운동 생성 실패:", error);
    throw error;
  }

  return {
    id: data.id,
    sessionId: data.session_id,
    exerciseId: data.exercise_id,
    orderInSession: data.order_in_session,
  };
};

export const updateSessionExercise = async (params: {
  sessionExerciseId: string;
  exerciseId?: string;
  orderInSession?: number;
}): Promise<void> => {
  const updatePayload: Partial<Tables<"workout_session_exercises">> = {};

  if (params.exerciseId !== undefined) {
    updatePayload.exercise_id = params.exerciseId;
  }
  if (params.orderInSession !== undefined) {
    updatePayload.order_in_session = params.orderInSession;
  }

  if (Object.keys(updatePayload).length === 0) {
    return;
  }

  const { error } = await supabase
    .from("workout_session_exercises")
    .update(updatePayload)
    .eq("id", params.sessionExerciseId);

  if (error) {
    console.error("세션 운동 수정 실패:", error);
    throw error;
  }
};

export const deleteSessionExercise = async (
  sessionExerciseId: string,
): Promise<void> => {
  const { error } = await supabase
    .from("workout_session_exercises")
    .delete()
    .eq("id", sessionExerciseId);

  if (error) {
    console.error("세션 운동 삭제 실패:", error);
    throw error;
  }
};
