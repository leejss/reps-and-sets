import type { Enums, Tables } from "../database.types";
import { formatLocalDateISO } from "../date";
import { supabase } from "../supabase";
import { getAuthenticatedUser } from "../utils";
import {
  mapSessionExerciseJoinedRow,
  type SessionExerciseWithSets,
} from "./workoutSessionExercises.query";

export type WorkoutStatus = Enums<"workout_status_enum">;

export interface WorkoutSession {
  id: string;
  date: string; // session_date (YYYY-MM-DD)
  title?: string | null;
  status: WorkoutStatus;
}

export interface WorkoutSessionWithDetails {
  session: WorkoutSession;
  exercises: SessionExerciseWithSets[];
}

const mapSessionRow = (row: Tables<"workout_sessions">): WorkoutSession => ({
  id: row.id,
  date: row.session_date,
  title: row.title,
  status: row.status,
});

export const getOrCreateWorkoutSession = async (
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

export const fetchWorkoutSessionsInRange = async (
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

  return (data ?? []).map(mapSessionRow);
};

export const fetchWorkoutSessionsWithSetsInRange = async (
  startDate: Date | string,
  endDate: Date | string,
): Promise<WorkoutSessionWithDetails[]> => {
  const user = await getAuthenticatedUser();
  const from = formatLocalDateISO(startDate);
  const to = formatLocalDateISO(endDate);

  const { data, error } = await supabase
    .from("workout_sessions")
    .select("*, workout_session_exercises(*, exercises(*), workout_sets(*))")
    .eq("user_id", user.id)
    .gte("session_date", from)
    .lte("session_date", to)
    .order("session_date", { ascending: true });

  if (error) {
    console.error("세션+운동 범위 조회 실패:", error);
    throw error;
  }

  return (data ?? []).map((row) => ({
    session: mapSessionRow(row),
    exercises: (row.workout_session_exercises ?? []).map(
      mapSessionExerciseJoinedRow,
    ),
  }));
};
