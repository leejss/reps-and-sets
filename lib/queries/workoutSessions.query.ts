import type { Enums, Tables, TablesInsert } from "../database.types";
import { formatLocalDateISO } from "../date";
import { supabase } from "../supabase";
import { getAuthenticatedUser } from "../utils";

export type WorkoutStatus = Enums<"workout_status_enum">;

export interface WorkoutSet {
  id: string;
  setOrder: number;
  plannedReps?: number | null;
  plannedWeight?: number | null;
  actualReps?: number | null;
  actualWeight?: number | null;
  isCompleted: boolean;
}

export interface SessionExercise {
  id: string;
  sessionId: string;
  exerciseId: string;
  exerciseName: string;
  muscleGroup: string;
  isCompleted: boolean;
  orderInSession: number;
  sets: WorkoutSet[];
}

export interface WorkoutSession {
  id: string;
  date: string; // session_date (YYYY-MM-DD)
  title?: string | null;
  status: WorkoutStatus;
}

const mapSessionRow = (row: Tables<"workout_sessions">): WorkoutSession => ({
  id: row.id,
  date: row.session_date,
  title: row.title,
  status: row.status,
});

const mapSetRow = (row: Tables<"workout_sets">): WorkoutSet => ({
  id: row.id,
  setOrder: row.set_order,
  plannedReps: row.planned_reps,
  plannedWeight: row.planned_weight,
  actualReps: row.actual_reps,
  actualWeight: row.actual_weight,
  isCompleted: row.is_completed,
});

export const getOrCreateSessionForDate = async (
  date: Date | string,
): Promise<WorkoutSession> => {
  const user = await getAuthenticatedUser();
  const sessionDate = formatLocalDateISO(date);

  const { data: existing, error: selectError } = await supabase
    .from("workout_sessions")
    .select("*")
    .eq("user_id", user.id)
    .eq("session_date", sessionDate)
    .maybeSingle();

  if (selectError) {
    console.error("세션 조회 실패:", selectError);
    throw selectError;
  }

  if (existing) {
    return mapSessionRow(existing as Tables<"workout_sessions">);
  }

  const { data, error } = await supabase
    .from("workout_sessions")
    .insert({
      user_id: user.id,
      session_date: sessionDate,
      status: "planned" satisfies WorkoutStatus,
    })
    .select("*")
    .single();

  if (error) {
    console.error("세션 생성 실패:", error);
    throw error;
  }

  return mapSessionRow(data as Tables<"workout_sessions">);
};

export const fetchSessionsInRange = async (
  startDate: Date | string,
  endDate: Date | string,
): Promise<WorkoutSession[]> => {
  const user = await getAuthenticatedUser();
  const from = formatLocalDateISO(startDate);
  const to = formatLocalDateISO(endDate);

  const { data, error } = await supabase
    .from("workout_sessions")
    .select("*")
    .eq("user_id", user.id)
    .gte("session_date", from)
    .lte("session_date", to)
    .order("session_date", { ascending: true });

  if (error) {
    console.error("세션 범위 조회 실패:", error);
    throw error;
  }

  return (data ?? []).map((row) =>
    mapSessionRow(row as Tables<"workout_sessions">),
  );
};

export const fetchSessionDetail = async (
  sessionId: string,
): Promise<SessionExercise[]> => {
  const { data, error } = await supabase
    .from("workout_session_exercises")
    .select("*, exercises(name, target_muscle_group), workout_sets(*)")
    .eq("session_id", sessionId)
    .order("order_in_session", { ascending: true });

  if (error) {
    console.error("세션 상세 조회 실패:", error);
    throw error;
  }

  const rows = (data ?? []) as (Tables<"workout_session_exercises"> & {
    exercises: Tables<"exercises"> | null;
    workout_sets: Tables<"workout_sets">[];
  })[];

  return rows.map((row) => ({
    id: row.id,
    sessionId: row.session_id,
    exerciseId: row.exercise_id,
    exerciseName: row.exercises?.name ?? "",
    muscleGroup: row.exercises?.target_muscle_group ?? "",
    isCompleted: row.is_completed,
    orderInSession: row.order_in_session,
    sets: (row.workout_sets ?? []).map(mapSetRow),
  }));
};

export const createSessionExerciseWithSets = async (params: {
  sessionId: string;
  exerciseId: string;
  orderInSession: number;
  plannedSets: { reps?: number | null; weight?: number | null }[];
}): Promise<SessionExercise> => {
  const { data: exerciseRow, error: exerciseError } = await supabase
    .from("workout_session_exercises")
    .insert({
      session_id: params.sessionId,
      exercise_id: params.exerciseId,
      order_in_session: params.orderInSession,
    })
    .select("*")
    .single();

  if (exerciseError) {
    console.error("세션 운동 생성 실패:", exerciseError);
    throw exerciseError;
  }

  const sessionExercise = exerciseRow as Tables<"workout_session_exercises">;

  if (params.plannedSets.length > 0) {
    const payload: TablesInsert<"workout_sets">[] = params.plannedSets.map(
      (set, index) => ({
        session_exercise_id: sessionExercise.id,
        set_order: index,
        planned_reps: set.reps ?? null,
        planned_weight: set.weight ?? null,
      }),
    );

    const { error: setsError } = await supabase
      .from("workout_sets")
      .insert(payload);

    if (setsError) {
      console.error("세션 세트 생성 실패:", setsError);
      throw setsError;
    }
  }

  const details = await fetchSessionDetail(params.sessionId);
  const created = details.find((d) => d.id === sessionExercise.id);

  if (!created) {
    throw new Error("생성된 세션 운동 정보를 찾을 수 없습니다.");
  }

  return created;
};

export const updateSessionExerciseAndSets = async (params: {
  sessionExerciseId: string;
  exerciseId?: string;
  orderInSession?: number;
  plannedSets?: { reps?: number | null; weight?: number | null }[];
}): Promise<SessionExercise> => {
  const { data: existingRow, error: existingError } = await supabase
    .from("workout_session_exercises")
    .select("*")
    .eq("id", params.sessionExerciseId)
    .single();

  if (existingError) {
    console.error("세션 운동 조회 실패:", existingError);
    throw existingError;
  }

  const base = existingRow as Tables<"workout_session_exercises">;

  const updatePayload: Partial<Tables<"workout_session_exercises">> = {};
  if (params.exerciseId !== undefined) {
    updatePayload.exercise_id = params.exerciseId;
  }
  if (params.orderInSession !== undefined) {
    updatePayload.order_in_session = params.orderInSession;
  }

  if (Object.keys(updatePayload).length > 0) {
    const { error: updateError } = await supabase
      .from("workout_session_exercises")
      .update(updatePayload)
      .eq("id", params.sessionExerciseId);

    if (updateError) {
      console.error("세션 운동 수정 실패:", updateError);
      throw updateError;
    }
  }

  if (params.plannedSets) {
    const { error: deleteError } = await supabase
      .from("workout_sets")
      .delete()
      .eq("session_exercise_id", params.sessionExerciseId);

    if (deleteError) {
      console.error("세션 세트 삭제 실패:", deleteError);
      throw deleteError;
    }

    if (params.plannedSets.length > 0) {
      const payload: TablesInsert<"workout_sets">[] = params.plannedSets.map(
        (set, index) => ({
          session_exercise_id: params.sessionExerciseId,
          set_order: index,
          planned_reps: set.reps ?? null,
          planned_weight: set.weight ?? null,
        }),
      );

      const { error: insertError } = await supabase
        .from("workout_sets")
        .insert(payload);

      if (insertError) {
        console.error("세션 세트 재생성 실패:", insertError);
        throw insertError;
      }
    }
  }

  const details = await fetchSessionDetail(base.session_id);
  const updated = details.find((d) => d.id === params.sessionExerciseId);

  if (!updated) {
    throw new Error("세션 운동 상세 정보를 찾을 수 없습니다.");
  }

  return updated;
};

export const deleteSessionExercise = async (
  sessionExerciseId: string,
): Promise<void> => {
  const { data: existingRow, error: existingError } = await supabase
    .from("workout_session_exercises")
    .select("*")
    .eq("id", sessionExerciseId)
    .single();

  if (existingError) {
    console.error("세션 운동 조회 실패:", existingError);
    throw existingError;
  }

  const base = existingRow as Tables<"workout_session_exercises">;

  const { error: deleteError } = await supabase
    .from("workout_session_exercises")
    .delete()
    .eq("id", sessionExerciseId);

  if (deleteError) {
    console.error("세션 운동 삭제 실패:", deleteError);
    throw deleteError;
  }

  const { count, error: countError } = await supabase
    .from("workout_session_exercises")
    .select("id", { count: "exact", head: true })
    .eq("session_id", base.session_id);

  if (countError) {
    console.error("세션 운동 개수 조회 실패:", countError);
    throw countError;
  }

  if (!count) {
    const { error: sessionDeleteError } = await supabase
      .from("workout_sessions")
      .delete()
      .eq("id", base.session_id);

    if (sessionDeleteError) {
      console.error("빈 세션 삭제 실패:", sessionDeleteError);
      throw sessionDeleteError;
    }
  }
};
