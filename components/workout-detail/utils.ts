import type { WorkoutSet } from "@/lib/queries/workoutSets.query";

// 계획된 값과 실제 값을 적절히 섞어서 화면에 보여줄 reps 문자열을 계산합니다.
export const getDisplayReps = (set: WorkoutSet): string | null => {
  const value = set.actualReps ?? set.plannedReps;
  return value != null ? value.toString() : null;
};

// 계획된 값과 실제 값을 적절히 섞어서 화면에 보여줄 weight 문자열을 계산합니다.
export const getDisplayWeight = (set: WorkoutSet): string | null => {
  const value = set.actualWeight ?? set.plannedWeight;
  return value != null ? value.toString() : null;
};
