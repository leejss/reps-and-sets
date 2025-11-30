import type { Tables } from "../database.types";
import { supabase } from "../supabase";

/**
 * 프로필 조회. 없으면 자동 생성
 */
export async function fetchProfile(
  userId: string,
  displayName?: string | null,
): Promise<Tables<"profiles">> {
  // 먼저 기존 프로필 확인
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (existingProfile) {
    return existingProfile;
  }

  // 프로필이 없으면 생성
  const { data: newProfile, error } = await supabase
    .from("profiles")
    .insert({
      id: userId,
      display_name: displayName ?? null,
    })
    .select()
    .single();

  if (error) {
    console.error("프로필 생성 실패:", error);
    throw error;
  }

  return newProfile;
}
