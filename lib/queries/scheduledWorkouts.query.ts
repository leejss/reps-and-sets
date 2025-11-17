import type {
  ScheduledWorkoutRecord,
  WeeklyPlanWorkoutsResult,
} from "@/lib/types";
import { WeeklyWorkoutInput } from "@/types/weekly-plan";
import type { TablesInsert, TablesUpdate } from "../database.types";
import { formatLocalDateISO, getStartOfWeek } from "../date";
import { supabase } from "../supabase";
import { getAuthenticatedUser, normalizeSetDetails } from "../utils";

export async function fetchScheduledWorkouts(date: string) {
  const user = await getAuthenticatedUser();

  const { data, error } = await supabase
    .from("scheduled_workouts")
    .select("*")
    .eq("user_id", user.id)
    .eq("scheduled_date", date)
    .order("order_index", { ascending: true });

  if (error) {
    console.error("일별 운동 계획 조회 실패:", error);
    throw error;
  }

  return data;
}

export async function fetchWeeklyPlanWorkouts(
  date: Date,
): Promise<WeeklyPlanWorkoutsResult> {
  const user = await getAuthenticatedUser();

  const weekStart = getStartOfWeek(date);
  const weekEnd = weekStart.add(6, "day");
  const startDate = formatLocalDateISO(weekStart);
  const endDate = formatLocalDateISO(weekEnd);

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
    workouts: (data ?? []).map((row) => ({
      id: row.id,
      scheduledDate: row.scheduled_date,
      exerciseId: row.exercise_id || "",
      exerciseName: row.exercise_name,
      muscleGroup: row.muscle_group,
      setDetails: normalizeSetDetails(row.set_details),
      note: row.note ?? undefined,
      orderIndex: row.order_index,
    })),
  };
}

export async function createWeeklyPlanWorkout(params: {
  scheduledDate: string;
  workout: WeeklyWorkoutInput;
  orderIndex: number;
}): Promise<ScheduledWorkoutRecord> {
  const user = await getAuthenticatedUser();

  const payload: TablesInsert<"scheduled_workouts"> = {
    user_id: user.id,
    scheduled_date: params.scheduledDate,
    exercise_id: params.workout.exerciseId,
    exercise_name: params.workout.exerciseName,
    muscle_group: params.workout.muscleGroup,
    set_details: params.workout.setDetails as any,
    note: params.workout.note ?? null,
    order_index: params.orderIndex,
  };

  const { data, error } = await supabase
    .from("scheduled_workouts")
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error("주간 운동 계획 저장 실패:", error);
    throw error;
  }

  return {
    id: data.id,
    scheduledDate: data.scheduled_date,
    exerciseId: data.exercise_id || "",
    exerciseName: data.exercise_name,
    muscleGroup: data.muscle_group,
    setDetails: normalizeSetDetails(data.set_details),
    note: data.note ?? undefined,
    orderIndex: data.order_index,
  };
}

export async function updateWeeklyPlanWorkout(
  id: string,
  payload: WeeklyWorkoutInput,
): Promise<ScheduledWorkoutRecord> {
  const updatePayload: TablesUpdate<"scheduled_workouts"> = {
    exercise_id: payload.exerciseId,
    exercise_name: payload.exerciseName,
    muscle_group: payload.muscleGroup,
    set_details: payload.setDetails as any,
    note: payload.note ?? null,
  };

  const { data, error } = await supabase
    .from("scheduled_workouts")
    .update(updatePayload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("주간 운동 계획 수정 실패:", error);
    throw error;
  }

  return {
    id: data.id,
    scheduledDate: data.scheduled_date,
    exerciseId: data.exercise_id || "",
    exerciseName: data.exercise_name,
    muscleGroup: data.muscle_group,
    setDetails: normalizeSetDetails(data.set_details),
    note: data.note ?? undefined,
    orderIndex: data.order_index,
  };
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

// export async function ensureScheduledWorkoutForDate(params: {
//   date: string;
//   workout: WeeklyWorkoutInput;
// }): Promise<ScheduledWorkoutRecord> {
//   const planned = dayjs(params.date);
//   if (!planned.isValid()) {
//     throw new Error("유효하지 않은 날짜입니다.");
//   }

//   const user = await getAuthenticatedUser();

//   const { data: existing, error: existingError } = await supabase
//     .from("scheduled_workouts")
//     .select("*")
//     .eq("user_id", user.id)
//     .eq("scheduled_date", params.date)
//     .eq("exercise_id", params.workout.exerciseId)
//     .limit(1);

//   if (existingError) {
//     console.error("주간 계획 항목 조회 실패:", existingError);
//     throw existingError;
//   }

//   if (existing && existing.length > 0) {
//     const row = existing[0];
//     return {
//       id: row.id,
//       scheduledDate: row.scheduled_date,
//       exerciseId: row.exercise_id || "",
//       exerciseName: row.exercise_name,
//       muscleGroup: row.muscle_group,
//       setDetails: normalizeSetDetails(row.set_details),
//       note: row.note ?? undefined,
//       orderIndex: row.order_index,
//     };
//   }

//   const { count, error: countError } = await supabase
//     .from("scheduled_workouts")
//     .select("*", { count: "exact", head: true })
//     .eq("user_id", user.id)
//     .eq("scheduled_date", params.date);

//   if (countError) {
//     console.error("주간 계획 세기 실패:", countError);
//     throw countError;
//   }

//   const orderIndex = count ?? 0;

//   return createWeeklyPlanWorkout({
//     scheduledDate: params.date,
//     workout: params.workout,
//     orderIndex,
//   });
// }
