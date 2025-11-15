import { SetDetail } from "@/types";

export type Weekday = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

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
  workouts: WeeklyWorkout[];
};

export type WeeklyPlan = {
  weekRange: string;
  dayPlans: DayPlan[];
};
