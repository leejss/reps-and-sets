import type { Tables, TablesInsert } from "../database.types";
import { supabase } from "../supabase";
import { getAuthenticatedUser } from "../utils";

/**
 * 사용자 프로필 조회
 */
export async function fetchUserProfile(): Promise<Tables<"profiles">> {
  const user = await getAuthenticatedUser();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("사용자 프로필 조회 실패:", error);
    throw error;
  }

  return data;
}

/**
 * 사용자 프로필 업데이트
 */
export async function updateUserProfile(updates: {
  display_name?: string | null;
}): Promise<Tables<"profiles">> {
  const user = await getAuthenticatedUser();

  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id)
    .select()
    .single();

  if (error) {
    console.error("사용자 프로필 업데이트 실패:", error);
    throw error;
  }

  return data;
}

export type UserInsertPayload = TablesInsert<"profiles">;
export async function insertUserProfileRow(payload: UserInsertPayload) {
  return supabase.from("profiles").insert(payload);
}
