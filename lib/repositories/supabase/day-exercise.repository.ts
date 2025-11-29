import {
  DayExercise,
  DayExerciseInput,
  DayExerciseWithDetails,
  DELETED_EXERCISE_MUSCLE_GROUP,
  DELETED_EXERCISE_NAME,
} from "@/lib/models/day-exercise";
import { ExerciseSet } from "@/lib/models/exercise-set";
import { TrainingDay } from "@/lib/models/training-day";
import { supabase } from "../../supabase";
import { getAuthenticatedUser } from "../../utils";
import type { IDayExerciseRepository } from "../types";
import type {
  DayExerciseInsert,
  DayExerciseJoinedRow,
  DayExerciseRow,
  ExerciseSetRow,
  TrainingDayWithExercisesRow,
} from "./types";

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

/**
 * DayExerciseRow를 도메인 모델로 변환
 */
function mapToDayExercise(row: DayExerciseRow): DayExercise {
  return {
    id: row.id,
    trainingDayId: row.training_day_id,
    exerciseId: row.exercise_id,
    displayOrder: row.display_order,
    isCompleted: row.is_completed,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

/**
 * DayExerciseJoinedRow를 상세 도메인 모델로 변환
 */
function mapToDayExerciseWithDetails(
  row: DayExerciseJoinedRow,
): DayExerciseWithDetails {
  const isDeleted = row.exercise_id === null || row.exercise_library === null;

  return {
    id: row.id,
    trainingDayId: row.training_day_id,
    exerciseId: row.exercise_id,
    exerciseName: row.exercise_library?.name ?? DELETED_EXERCISE_NAME,
    targetMuscleGroup:
      row.exercise_library?.target_muscle_group ??
      DELETED_EXERCISE_MUSCLE_GROUP,
    displayOrder: row.display_order,
    isCompleted: row.is_completed,
    sets: (row.exercise_sets ?? []).map(mapToExerciseSet),
    isDeleted,
  };
}

/**
 * TrainingDayRow를 도메인 모델로 변환
 */
function mapToTrainingDay(row: TrainingDayWithExercisesRow): TrainingDay {
  return {
    id: row.id,
    trainingDate: row.training_date,
    title: row.title,
    status: row.status,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export class SupabaseDayExerciseRepository implements IDayExerciseRepository {
  async findByTrainingDayId(
    trainingDayId: string,
  ): Promise<DayExerciseWithDetails[]> {
    const { data, error } = await supabase
      .from("day_exercises")
      .select("*, exercise_library(*), exercise_sets(*)")
      .eq("training_day_id", trainingDayId)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("일별 운동 조회 실패:", error);
      throw error;
    }

    return ((data as DayExerciseJoinedRow[]) ?? []).map(
      mapToDayExerciseWithDetails,
    );
  }

  async findByDateRange(
    startDate: string,
    endDate: string,
  ): Promise<
    { trainingDay: TrainingDay; exercises: DayExerciseWithDetails[] }[]
  > {
    const user = await getAuthenticatedUser();

    const { data, error } = await supabase
      .from("training_days")
      .select("*, day_exercises(*, exercise_library(*), exercise_sets(*))")
      .eq("user_id", user.id)
      .gte("training_date", startDate)
      .lte("training_date", endDate)
      .order("training_date", { ascending: true });

    if (error) {
      console.error("날짜 범위 운동 조회 실패:", error);
      throw error;
    }

    return ((data as TrainingDayWithExercisesRow[]) ?? []).map((row) => ({
      trainingDay: mapToTrainingDay(row),
      exercises: (row.day_exercises ?? [])
        .sort((a, b) => a.display_order - b.display_order)
        .map(mapToDayExerciseWithDetails),
    }));
  }

  async create(input: DayExerciseInput): Promise<DayExercise> {
    const payload: DayExerciseInsert = {
      training_day_id: input.trainingDayId,
      exercise_id: input.exerciseId,
      display_order: input.displayOrder,
    };

    const { data, error } = await supabase
      .from("day_exercises")
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error("일별 운동 생성 실패:", error);
      throw error;
    }

    return mapToDayExercise(data);
  }

  async update(
    id: string,
    input: Partial<Pick<DayExerciseInput, "exerciseId" | "displayOrder">>,
  ): Promise<DayExercise> {
    const updatePayload: Record<string, unknown> = {};

    if (input.exerciseId !== undefined) {
      updatePayload.exercise_id = input.exerciseId;
    }
    if (input.displayOrder !== undefined) {
      updatePayload.display_order = input.displayOrder;
    }

    if (Object.keys(updatePayload).length === 0) {
      const existing = await supabase
        .from("day_exercises")
        .select()
        .eq("id", id)
        .single();

      if (existing.error) throw existing.error;
      return mapToDayExercise(existing.data);
    }

    const { data, error } = await supabase
      .from("day_exercises")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("일별 운동 수정 실패:", error);
      throw error;
    }

    return mapToDayExercise(data);
  }

  async updateCompletion(id: string, isCompleted: boolean): Promise<void> {
    const { error } = await supabase
      .from("day_exercises")
      .update({ is_completed: isCompleted })
      .eq("id", id);

    if (error) {
      console.error("일별 운동 완료 상태 업데이트 실패:", error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from("day_exercises")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("일별 운동 삭제 실패:", error);
      throw error;
    }
  }
}
