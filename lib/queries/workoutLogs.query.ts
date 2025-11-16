import type { TodayWorkout } from "@/lib/types";
import { WeeklyWorkoutInput } from "@/types/weekly-plan";
import { formatLocalDateISO } from "../date";
import { Database, supabase } from "../supabase";
import { getAuthenticatedUser, normalizeSetDetails } from "../utils";

export async function fetchWorkoutLogs(date: Date): Promise<TodayWorkout[]> {
  const user = await getAuthenticatedUser();

  const dateString = formatLocalDateISO(date);

  const { data, error } = await supabase
    .from("workout_logs")
    .select("*")
    .eq("user_id", user.id)
    .eq("workout_date", dateString)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("운동 기록 조회 실패:", error);
    throw error;
  }

  // 데이터베이스 형식을 앱 형식으로 변환
  return (data || []).map((row) => ({
    id: row.id,
    exerciseId: row.exercise_id || "",
    exerciseName: row.exercise_name,
    muscleGroup: row.muscle_group,
    setDetails: normalizeSetDetails(row.set_details),
    completed: row.completed,
    date: row.workout_date,
    scheduledWorkoutId: row.scheduled_workout_id || undefined,
  }));
}

export async function createWorkoutLog(
  workout: Omit<TodayWorkout, "id">,
): Promise<TodayWorkout> {
  const user = await getAuthenticatedUser();

  const { data, error } = await supabase
    .from("workout_logs")
    .insert({
      user_id: user.id,
      exercise_id: workout.exerciseId || null,
      exercise_name: workout.exerciseName,
      muscle_group: workout.muscleGroup,
      set_details:
        workout.setDetails as unknown as Database["public"]["Tables"]["workout_logs"]["Insert"]["set_details"],
      completed: workout.completed,
      workout_date: workout.date,
      scheduled_workout_id: workout.scheduledWorkoutId ?? null,
    })
    .select()
    .single();

  if (error) {
    console.error("운동 기록 생성 실패:", error);
    throw error;
  }

  return {
    id: data.id,
    exerciseId: data.exercise_id || "",
    exerciseName: data.exercise_name,
    muscleGroup: data.muscle_group,
    setDetails: normalizeSetDetails(data.set_details),
    completed: data.completed,
    date: data.workout_date,
    scheduledWorkoutId: data.scheduled_workout_id || undefined,
  };
}

/**
 * 운동 기록 수정
 */
export async function updateWorkoutLog(
  id: string,
  workout: Partial<Omit<TodayWorkout, "id">>,
): Promise<TodayWorkout> {
  const updateData: Record<string, unknown> = {};

  if (workout.exerciseId !== undefined) {
    updateData.exercise_id = workout.exerciseId || null;
  }
  if (workout.exerciseName !== undefined) {
    updateData.exercise_name = workout.exerciseName;
  }
  if (workout.muscleGroup !== undefined) {
    updateData.muscle_group = workout.muscleGroup;
  }
  if (workout.setDetails !== undefined) {
    updateData.set_details = workout.setDetails;
  }
  if (workout.completed !== undefined) {
    updateData.completed = workout.completed;
  }
  if (workout.date !== undefined) {
    updateData.workout_date = workout.date;
  }
  if (workout.scheduledWorkoutId !== undefined) {
    updateData.scheduled_workout_id = workout.scheduledWorkoutId ?? null;
  }

  const { data, error } = await supabase
    .from("workout_logs")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("운동 기록 수정 실패:", error);
    throw error;
  }

  return {
    id: data.id,
    exerciseId: data.exercise_id || "",
    exerciseName: data.exercise_name,
    muscleGroup: data.muscle_group,
    setDetails: normalizeSetDetails(data.set_details),
    completed: data.completed,
    date: data.workout_date,
    scheduledWorkoutId: data.scheduled_workout_id || undefined,
  };
}

export async function syncWorkoutLogFromSchedule(params: {
  scheduledWorkoutId: string;
  workout: WeeklyWorkoutInput;
}): Promise<TodayWorkout | null> {
  const user = await getAuthenticatedUser();

  const { data, error } = await supabase
    .from("workout_logs")
    .update({
      exercise_id: params.workout.exerciseId,
      exercise_name: params.workout.exerciseName,
      muscle_group: params.workout.muscleGroup,
      set_details: params.workout
        .setDetails as unknown as Database["public"]["Tables"]["workout_logs"]["Update"]["set_details"],
    })
    .eq("user_id", user.id)
    .eq("scheduled_workout_id", params.scheduledWorkoutId)
    .select("*")
    .maybeSingle();

  if (error) {
    console.error("운동 로그 동기화 실패:", error);
    throw error;
  }

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    exerciseId: data.exercise_id || "",
    exerciseName: data.exercise_name,
    muscleGroup: data.muscle_group,
    setDetails: normalizeSetDetails(data.set_details),
    completed: data.completed,
    date: data.workout_date,
    scheduledWorkoutId: data.scheduled_workout_id || undefined,
  };
}
