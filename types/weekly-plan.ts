import { SetDetail } from "./index";

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
  id: string;
  exerciseId: string;
  exerciseName: string;
  muscleGroup: string;
  setDetails: SetDetail[];
  note?: string;
};

export type WeeklyWorkoutInput = Omit<WeeklyWorkout, "id">;

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


