import type { WorkoutSet } from "@/lib/queries/workoutSets.model";

export type Weekday = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

export const WEEKDAY_ORDER: Weekday[] = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
];

export const WEEKDAY_LABELS: Record<Weekday, string> = {
  Mon: "월요일",
  Tue: "화요일",
  Wed: "수요일",
  Thu: "목요일",
  Fri: "금요일",
  Sat: "토요일",
  Sun: "일요일",
};

export type WeeklyWorkout = {
  /**
   * 세션 내 운동의 고유 ID (workout_session_exercises.id)
   */
  id: string;

  /**
   * 이 운동이 속한 세션의 ID (workout_sessions.id)
   */
  sessionId: string;

  /**
   * 세션 날짜 (workout_sessions.session_date)
   */
  scheduledDate: string;

  /**
   * exercises.id
   */
  exerciseId: string;
  exerciseName: string;
  muscleGroup: string;

  /**
   * 세션 내 정렬 순서 (workout_session_exercises.order_in_session)
   */
  orderInSession: number;

  /**
   * 세션 내 세트 목록 (workout_sets)
   */
  workoutSetList: WorkoutSet[];

  /**
   * 선택 메모. 현재는 클라이언트 전용 필드로 사용.
   */
  note?: string;
};

export type WeeklyWorkoutInput = {
  exerciseId: string;
  exerciseName: string;
  muscleGroup: string;
  setDetails: WorkoutSet[];
  note?: string;
};

export type DayPlan = {
  id: Weekday;
  label: string;
  dateLabel: string;
  dateISO: string;
  workouts: WeeklyWorkout[];
};

export type WeeklyPlan = {
  weekStartDate: string;
  weekEndDate: string;
  weekRange: string;
  dayPlans: DayPlan[];
};
