import type {
  ExerciseSet,
  ExerciseSetActualInput,
  ExerciseSetPlanInput,
} from "../../models";
import { supabase } from "../../supabase";
import type { IExerciseSetRepository } from "../types";
import type { ExerciseSetInsert, ExerciseSetRow } from "./types";

/**
 * ExerciseSetRow를 도메인 모델로 변환
 */
function mapToExerciseSet(row: ExerciseSetRow): ExerciseSet {
  return {
    id: row.id,
    dayExerciseId: row.day_exercise_id,
    setOrder: row.set_order,
    plannedReps: row.planned_reps,
    plannedWeight: row.planned_weight,
    actualReps: row.actual_reps,
    actualWeight: row.actual_weight,
    isCompleted: row.is_completed,
    completedAt: row.completed_at ? new Date(row.completed_at) : null,
  };
}

export class SupabaseExerciseSetRepository implements IExerciseSetRepository {
  async findByDayExerciseId(dayExerciseId: string): Promise<ExerciseSet[]> {
    const { data, error } = await supabase
      .from("exercise_sets")
      .select("*")
      .eq("day_exercise_id", dayExerciseId)
      .order("set_order", { ascending: true });

    if (error) {
      console.error("세트 목록 조회 실패:", error);
      throw error;
    }

    return (data ?? []).map(mapToExerciseSet);
  }

  async createMany(
    dayExerciseId: string,
    sets: ExerciseSetPlanInput[]
  ): Promise<ExerciseSet[]> {
    if (sets.length === 0) return [];

    const payload: ExerciseSetInsert[] = sets.map((set, index) => ({
      day_exercise_id: dayExerciseId,
      set_order: index,
      planned_reps: set.reps ?? null,
      planned_weight: set.weight ?? null,
    }));

    const { data, error } = await supabase
      .from("exercise_sets")
      .insert(payload)
      .select();

    if (error) {
      console.error("세트 생성 실패:", error);
      throw error;
    }

    return (data ?? []).map(mapToExerciseSet);
  }

  async replaceAll(
    dayExerciseId: string,
    sets: ExerciseSetPlanInput[]
  ): Promise<ExerciseSet[]> {
    // 기존 세트 삭제
    const { error: deleteError } = await supabase
      .from("exercise_sets")
      .delete()
      .eq("day_exercise_id", dayExerciseId);

    if (deleteError) {
      console.error("세트 삭제 실패:", deleteError);
      throw deleteError;
    }

    if (sets.length === 0) return [];

    return this.createMany(dayExerciseId, sets);
  }

  async updateCompletion(
    dayExerciseId: string,
    setOrder: number,
    isCompleted: boolean
  ): Promise<void> {
    const { error } = await supabase
      .from("exercise_sets")
      .update({
        is_completed: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : null,
      })
      .eq("day_exercise_id", dayExerciseId)
      .eq("set_order", setOrder);

    if (error) {
      console.error("세트 완료 상태 업데이트 실패:", error);
      throw error;
    }
  }

  async updateActual(
    dayExerciseId: string,
    setOrder: number,
    input: ExerciseSetActualInput
  ): Promise<void> {
    const { error } = await supabase
      .from("exercise_sets")
      .update({
        actual_reps: input.actualReps,
        actual_weight: input.actualWeight ?? null,
      })
      .eq("day_exercise_id", dayExerciseId)
      .eq("set_order", setOrder);

    if (error) {
      console.error("세트 실제 기록 업데이트 실패:", error);
      throw error;
    }
  }

  async updateAllCompletion(
    dayExerciseId: string,
    isCompleted: boolean
  ): Promise<void> {
    const { error } = await supabase
      .from("exercise_sets")
      .update({
        is_completed: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : null,
      })
      .eq("day_exercise_id", dayExerciseId);

    if (error) {
      console.error("세트 일괄 완료 상태 업데이트 실패:", error);
      throw error;
    }
  }
}

