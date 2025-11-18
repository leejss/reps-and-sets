import type { Tables } from "../database.types";

export interface WorkoutSet {
  id?: string;
  /**
   * 세션 내 세트 순서 (workout_sets.set_order)
   */
  setOrder: number;
  /**
   * 계획 반복 수 (workout_sets.planned_reps)
   */
  plannedReps?: number | null;
  /**
   * 계획 무게 (workout_sets.planned_weight)
   */
  plannedWeight?: number | null;
  /**
   * 실제 반복 수 (workout_sets.actual_reps)
   */
  actualReps?: number | null;
  /**
   * 실제 무게 (workout_sets.actual_weight)
   */
  actualWeight?: number | null;
  /**
   * 세트 완료 여부 (workout_sets.is_completed)
   */
  completed: boolean;
}

export const mapSetRow = (row: Tables<"workout_sets">): WorkoutSet => ({
  id: row.id,
  setOrder: row.set_order,
  plannedReps: row.planned_reps,
  plannedWeight: row.planned_weight,
  actualReps: row.actual_reps,
  actualWeight: row.actual_weight,
  completed: row.is_completed,
});
