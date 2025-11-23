import type { SessionExerciseWithSets } from "@/lib/queries/workoutSessionExercises.query";
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

export type WeeklyWorkoutInput = {
  exerciseId: string;
  exerciseName: string;
  targetMuscleGroup: string;
  setDetails: WorkoutSet[];
  note?: string;
};

export type WeeklyPlanExercise = SessionExerciseWithSets & {
  note?: string;
};

export type WeeklySessionPlan = {
  sessionDate: string;
  exercises: WeeklyPlanExercise[];
};

export type WeeklyPlan = {
  weekStartDate: string;
  weekEndDate: string;
  weekRange: string;
  sessionPlans: WeeklySessionPlan[];
};
