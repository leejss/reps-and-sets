import { TablesInsert } from "../database.types";
import { supabase } from "../supabase";
import { getAuthenticatedUser } from "../utils";

export interface Exercise {
  id: string;
  name: string;
  targetMuscleGroup: string;
  description?: string;
  externalLink?: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function fetchExercises(): Promise<Exercise[]> {
  const user = await getAuthenticatedUser();
  const { data, error } = await supabase
    .from("exercises")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("운동 목록 조회 실패:", error);
    throw error;
  }

  return (data || []).map((exercise) => ({
    id: exercise.id,
    name: exercise.name,
    targetMuscleGroup: exercise.target_muscle_group,
    description: exercise.description || undefined,
    link: exercise.external_link || undefined,
    createdAt: new Date(exercise.created_at),
    updatedAt: new Date(exercise.updated_at),
  }));
}

export async function createExercise(
  exercise: Omit<Exercise, "id" | "createdAt" | "updatedAt">,
): Promise<Exercise> {
  const user = await getAuthenticatedUser();

  const values: TablesInsert<"exercises"> = {
    user_id: user.id,
    name: exercise.name,
    target_muscle_group: exercise.targetMuscleGroup,
    description: exercise.description || null,
    external_link: exercise.externalLink || null,
  };

  const { data, error } = await supabase
    .from("exercises")
    .insert(values)
    .select()
    .single();

  if (error) {
    console.error("운동 생성 실패:", error);
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    targetMuscleGroup: data.target_muscle_group,
    description: data.description || undefined,
    externalLink: data.external_link || undefined,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

export async function updateExercise(
  id: string,
  exercise: Omit<Exercise, "id" | "createdAt">,
): Promise<Exercise> {
  const { data, error } = await supabase
    .from("exercises")
    .update({
      name: exercise.name,
      target_muscle_group: exercise.targetMuscleGroup,
      description: exercise.description || null,
      external_link: exercise.externalLink || null,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("운동 수정 실패:", error);
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    targetMuscleGroup: data.target_muscle_group,
    description: data.description || undefined,
    externalLink: data.external_link || undefined,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

export async function deleteExercise(id: string): Promise<void> {
  const { error } = await supabase.from("exercises").delete().eq("id", id);

  if (error) {
    console.error("운동 삭제 실패:", error);
    throw error;
  }
}
