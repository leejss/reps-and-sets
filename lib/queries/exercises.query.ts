import { TablesInsert } from "../database.types";
import { supabase } from "../supabase";
import { getAuthenticatedUser } from "../utils";
import { Exercise, mapExerciseRow } from "./exercises.model";

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

  return (data || []).map(mapExerciseRow);
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

  return mapExerciseRow(data);
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

  return mapExerciseRow(data);
}

export async function deleteExercise(id: string): Promise<void> {
  const { error } = await supabase.from("exercises").delete().eq("id", id);

  if (error) {
    console.error("운동 삭제 실패:", error);
    throw error;
  }
}
