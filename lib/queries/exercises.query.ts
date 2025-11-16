import type { Exercise } from "@/lib/types";
import dayjs from "dayjs";
import { supabase } from "../supabase";
import { getAuthenticatedUser } from "../utils";

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
    muscleGroup: exercise.muscle_group,
    description: exercise.description || undefined,
    link: exercise.link || undefined,
    createdAt: dayjs(exercise.created_at).toDate(),
  }));
}

export async function createExercise(
  exercise: Omit<Exercise, "id" | "createdAt">,
): Promise<Exercise> {
  const user = await getAuthenticatedUser();

  const { data, error } = await supabase
    .from("exercises")
    .insert({
      user_id: user.id,
      name: exercise.name,
      muscle_group: exercise.muscleGroup,
      description: exercise.description || null,
      link: exercise.link || null,
    })
    .select()
    .single();

  if (error) {
    console.error("운동 생성 실패:", error);
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    muscleGroup: data.muscle_group,
    description: data.description || undefined,
    link: data.link || undefined,
    createdAt: dayjs(data.created_at).toDate(),
  };
}

/**
 * 운동 수정
 */
export async function updateExercise(
  id: string,
  exercise: Omit<Exercise, "id" | "createdAt">,
): Promise<Exercise> {
  const { data, error } = await supabase
    .from("exercises")
    .update({
      name: exercise.name,
      muscle_group: exercise.muscleGroup,
      description: exercise.description || null,
      link: exercise.link || null,
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
    muscleGroup: data.muscle_group,
    description: data.description || undefined,
    link: data.link || undefined,
    createdAt: dayjs(data.created_at).toDate(),
  };
}

/**
 * 운동 삭제
 */
export async function deleteExercise(id: string): Promise<void> {
  const { error } = await supabase.from("exercises").delete().eq("id", id);

  if (error) {
    console.error("운동 삭제 실패:", error);
    throw error;
  }
}
