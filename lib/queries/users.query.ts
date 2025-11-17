import type { TablesInsert } from "../database.types";
import { supabase } from "../supabase";
import type { UserProfile } from "../types";
import { getAuthenticatedUser } from "../utils";

/**
 * 사용자 프로필 조회
 */
export async function fetchUserProfile(): Promise<UserProfile> {
  const user = await getAuthenticatedUser();

  const { data, error } = await supabase
    .from("users")
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
  name?: string;
  profile_photo?: string;
}): Promise<UserProfile> {
  const user = await getAuthenticatedUser();

  const { data, error } = await supabase
    .from("users")
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

export type UserInsertPayload = TablesInsert<"users">;
export async function insertUserProfileRow(payload: UserInsertPayload) {
  return supabase.from("users").insert(payload);
}
