import dayjs from "dayjs";

import { Exercise, SetDetail, TodayWorkout } from "@/types";
import { Weekday, WeeklyWorkoutInput } from "@/types/weekly-plan";

import { formatLocalDateISO } from "./date";
import { Database, supabase } from "./supabase";
import { ensureUserProfile } from "./user-profile";

/**
 * 주간 계획 계산용: 해당 주의 월요일 반환
 * @param date - Date 객체 또는 날짜 문자열
 * @returns 해당 주의 월요일 00:00:00 Date 객체
 */
const getWeekStart = (date: Date | string): Date => {
  const dayjsDate = dayjs(date);
  const day = dayjsDate.day(); // 0 (Sun) - 6 (Sat)
  const diffToMonday = (day + 6) % 7;
  return dayjsDate.subtract(diffToMonday, "day").startOf("day").toDate();
};

const WEEKDAY_BY_JS_INDEX: Weekday[] = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
];

/**
 * Date 객체에서 Weekday 문자열 반환
 * @param date - Date 객체 또는 날짜 문자열
 * @returns Weekday 타입 ('Mon', 'Tue', ...)
 */
const getWeekdayFromDate = (date: Date | string): Weekday => {
  return WEEKDAY_BY_JS_INDEX[dayjs(date).day()];
};

const getAuthenticatedUser = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("인증되지 않은 사용자입니다.");
  }

  await ensureUserProfile(user);

  return user;
};

type ScheduledWorkoutRow =
  Database["public"]["Tables"]["scheduled_workouts"]["Row"];

export type ScheduledWorkoutRecord = {
  id: string;
  weekday: Weekday;
  scheduledDate: string;
  exerciseId: string;
  exerciseName: string;
  muscleGroup: string;
  setDetails: SetDetail[];
  note?: string;
  orderIndex: number;
};

/**
 * 현재 사용자의 모든 운동 목록 조회
 */
export async function fetchExercises(): Promise<Exercise[]> {
  const user = await getAuthenticatedUser();

  const { data, error } = await supabase
    .from("exercises")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("운동 목록 조회 실패:", error);
    throw error;
  }

  return (data || []).map((exercise) => ({
    id: exercise.id,
    name: exercise.name,
    muscleGroup: exercise.muscle_group,
    description: exercise.description || undefined,
    link: exercise.link || undefined,
    createdAt: dayjs(exercise.created_at).toDate(),
  }));
}

/**
 * 새 운동 생성
 */
export async function createExercise(
  exercise: Omit<Exercise, "id" | "createdAt">,
): Promise<Exercise> {
  const user = await getAuthenticatedUser();

  const { data, error } = await supabase
    .from("exercises")
    .insert({
      user_id: user.id,
      name: exercise.name,
      muscle_group: exercise.muscleGroup,
      description: exercise.description || null,
      link: exercise.link || null,
    })
    .select()
    .single();

  if (error) {
    console.error("운동 생성 실패:", error);
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    muscleGroup: data.muscle_group,
    description: data.description || undefined,
    link: data.link || undefined,
    createdAt: dayjs(data.created_at).toDate(),
  };
}

/**
 * 운동 수정
 */
export async function updateExercise(
  id: string,
  exercise: Omit<Exercise, "id" | "createdAt">,
): Promise<Exercise> {
  const { data, error } = await supabase
    .from("exercises")
    .update({
      name: exercise.name,
      muscle_group: exercise.muscleGroup,
      description: exercise.description || null,
      link: exercise.link || null,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("운동 수정 실패:", error);
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    muscleGroup: data.muscle_group,
    description: data.description || undefined,
    link: data.link || undefined,
    createdAt: dayjs(data.created_at).toDate(),
  };
}

/**
 * 운동 삭제
 */
export async function deleteExercise(id: string): Promise<void> {
  const { error } = await supabase.from("exercises").delete().eq("id", id);

  if (error) {
    console.error("운동 삭제 실패:", error);
    throw error;
  }
}

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
  return (data || []).map(mapWorkoutLog);
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
      set_details: workout.setDetails,
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

  return mapWorkoutLog(data);
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

  return mapWorkoutLog(data);
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
      set_details: params.workout.setDetails,
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

  return mapWorkoutLog(data);
}

/**
 * 운동 기록 삭제
 */
export async function deleteWorkoutLog(id: string): Promise<void> {
  const { error } = await supabase.from("workout_logs").delete().eq("id", id);

  if (error) {
    console.error("운동 기록 삭제 실패:", error);
    throw error;
  }
}

// ============================================
// 주간 계획 (Weekly Plan) 함수
// ============================================

const normalizeSetDetails = (details: unknown): SetDetail[] => {
  if (!Array.isArray(details)) {
    return [];
  }

  return (details as (Partial<SetDetail> | null | undefined)[]).map((set) => ({
    reps: typeof set?.reps === "number" ? set.reps : 0,
    weight: typeof set?.weight === "number" ? set.weight : undefined,
    completed: Boolean(set?.completed),
  }));
};

const mapScheduledWorkout = (
  row: ScheduledWorkoutRow,
): ScheduledWorkoutRecord => ({
  id: row.id,
  weekday: (row.weekday as Weekday) ?? getWeekdayFromDate(row.scheduled_date),
  scheduledDate: row.scheduled_date,
  exerciseId: row.exercise_id || "",
  exerciseName: row.exercise_name,
  muscleGroup: row.muscle_group,
  setDetails: normalizeSetDetails(row.set_details),
  note: row.note ?? undefined,
  orderIndex: row.order_index,
});

type WorkoutLogRow = Database["public"]["Tables"]["workout_logs"]["Row"];

const mapWorkoutLog = (row: WorkoutLogRow): TodayWorkout => ({
  id: row.id,
  exerciseId: row.exercise_id || "",
  exerciseName: row.exercise_name,
  muscleGroup: row.muscle_group,
  setDetails: normalizeSetDetails(row.set_details),
  completed: row.completed,
  date: row.workout_date,
  scheduledWorkoutId: row.scheduled_workout_id || undefined,
});

export async function fetchWeeklyPlanWorkouts(date: Date): Promise<{
  weekStartDate: string;
  workouts: ScheduledWorkoutRecord[];
}> {
  const user = await getAuthenticatedUser();

  const weekStart = dayjs(getWeekStart(date));
  const weekEnd = weekStart.add(6, "day");
  const startDate = formatLocalDateISO(weekStart.toDate());
  const endDate = formatLocalDateISO(weekEnd.toDate());

  const { data, error } = await supabase
    .from("scheduled_workouts")
    .select("*")
    .eq("user_id", user.id)
    .gte("scheduled_date", startDate)
    .lte("scheduled_date", endDate)
    .order("scheduled_date", { ascending: true })
    .order("order_index", { ascending: true });

  if (error) {
    console.error("주간 운동 계획 조회 실패:", error);
    throw error;
  }

  return {
    weekStartDate: startDate,
    workouts: (data ?? []).map(mapScheduledWorkout),
  };
}

export async function createWeeklyPlanWorkout(params: {
  weekday: Weekday;
  scheduledDate: string;
  workout: WeeklyWorkoutInput;
  orderIndex: number;
}): Promise<ScheduledWorkoutRecord> {
  const user = await getAuthenticatedUser();

  const { data, error } = await supabase
    .from("scheduled_workouts")
    .insert({
      user_id: user.id,
      scheduled_date: params.scheduledDate,
      weekday: params.weekday,
      exercise_id: params.workout.exerciseId,
      exercise_name: params.workout.exerciseName,
      muscle_group: params.workout.muscleGroup,
      set_details: params.workout.setDetails,
      note: params.workout.note ?? null,
      order_index: params.orderIndex,
    })
    .select()
    .single();

  if (error) {
    console.error("주간 운동 계획 저장 실패:", error);
    throw error;
  }

  return mapScheduledWorkout(data);
}

export async function updateWeeklyPlanWorkout(
  id: string,
  payload: WeeklyWorkoutInput,
): Promise<ScheduledWorkoutRecord> {
  const { data, error } = await supabase
    .from("scheduled_workouts")
    .update({
      exercise_id: payload.exerciseId,
      exercise_name: payload.exerciseName,
      muscle_group: payload.muscleGroup,
      set_details: payload.setDetails,
      note: payload.note ?? null,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("주간 운동 계획 수정 실패:", error);
    throw error;
  }

  return mapScheduledWorkout(data);
}

export async function deleteWeeklyPlanWorkout(id: string): Promise<void> {
  const { error } = await supabase
    .from("scheduled_workouts")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("주간 운동 계획 삭제 실패:", error);
    throw error;
  }
}

export async function ensureScheduledWorkoutForDate(params: {
  date: string;
  workout: WeeklyWorkoutInput;
}): Promise<ScheduledWorkoutRecord> {
  const planned = dayjs(params.date);
  if (!planned.isValid()) {
    throw new Error("유효하지 않은 날짜입니다.");
  }

  const user = await getAuthenticatedUser();

  const weekday = getWeekdayFromDate(params.date);

  const { data: existing, error: existingError } = await supabase
    .from("scheduled_workouts")
    .select("*")
    .eq("user_id", user.id)
    .eq("scheduled_date", params.date)
    .eq("exercise_id", params.workout.exerciseId)
    .limit(1);

  if (existingError) {
    console.error("주간 계획 항목 조회 실패:", existingError);
    throw existingError;
  }

  if (existing && existing.length > 0) {
    return mapScheduledWorkout(existing[0]);
  }

  const { count, error: countError } = await supabase
    .from("scheduled_workouts")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("scheduled_date", params.date);

  if (countError) {
    console.error("주간 계획 세기 실패:", countError);
    throw countError;
  }

  const orderIndex = count ?? 0;

  return createWeeklyPlanWorkout({
    weekday,
    scheduledDate: params.date,
    workout: params.workout,
    orderIndex,
  });
}

// ============================================
// 사용자 프로필 함수
// ============================================

/**
 * 사용자 프로필 조회
 */
export async function fetchUserProfile() {
  const user = await getAuthenticatedUser();

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("사용자 프로필 조회 실패:", error);
    throw error;
  }

  return data;
}

/**
 * 사용자 프로필 업데이트
 */
export async function updateUserProfile(updates: {
  name?: string;
  profile_photo?: string;
}) {
  const user = await getAuthenticatedUser();

  const { data, error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", user.id)
    .select()
    .single();

  if (error) {
    console.error("사용자 프로필 업데이트 실패:", error);
    throw error;
  }

  return data;
}
