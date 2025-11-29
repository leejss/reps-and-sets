import type { Exercise, ExerciseInput } from "../../models/exercise";
import { supabase } from "../../supabase";
import { getAuthenticatedUser } from "../../utils";
import type { IExerciseRepository } from "../types";

/**
 * TODO: Supabase 마이그레이션 후 테이블 이름 변경
 * exercises → exercise_library
 */
const TABLE_NAME = "exercises" as const;

/**
 * Supabase Row를 도메인 모델로 변환
 */
function mapToExercise(row: {
  id: string;
  name: string;
  target_muscle_group: string;
  description: string | null;
  external_link: string | null;
  created_at: string;
  updated_at: string;
}): Exercise {
  return {
    id: row.id,
    name: row.name,
    targetMuscleGroup: row.target_muscle_group,
    description: row.description ?? undefined,
    externalLink: row.external_link ?? undefined,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export class SupabaseExerciseRepository implements IExerciseRepository {
  async findAll(): Promise<Exercise[]> {
    const user = await getAuthenticatedUser();

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("운동 목록 조회 실패:", error);
      throw error;
    }

    return (data ?? []).map(mapToExercise);
  }

  async findById(id: string): Promise<Exercise | null> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("운동 조회 실패:", error);
      throw error;
    }

    return data ? mapToExercise(data) : null;
  }

  async create(input: ExerciseInput): Promise<Exercise> {
    const user = await getAuthenticatedUser();

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert({
        user_id: user.id,
        name: input.name,
        target_muscle_group: input.targetMuscleGroup,
        description: input.description ?? null,
        external_link: input.externalLink ?? null,
      })
      .select()
      .single();

    if (error) {
      console.error("운동 생성 실패:", error);
      throw error;
    }

    return mapToExercise(data);
  }

  async update(id: string, input: ExerciseInput): Promise<Exercise> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update({
        name: input.name,
        target_muscle_group: input.targetMuscleGroup,
        description: input.description ?? null,
        external_link: input.externalLink ?? null,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("운동 수정 실패:", error);
      throw error;
    }

    return mapToExercise(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from(TABLE_NAME).delete().eq("id", id);

    if (error) {
      console.error("운동 삭제 실패:", error);
      throw error;
    }
  }
}
