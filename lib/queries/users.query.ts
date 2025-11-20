import type { User } from "@supabase/supabase-js";
import type { Tables } from "../database.types";
import { supabase } from "../supabase";
import { ensureUserProfile } from "../user-profile";
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
 * 사용자 프로필 조회 또는 생성 후 조회
 *
 * - `userOverride`가 주어지면 해당 유저 기준으로 프로필을 보장하고 조회
 * - 없으면 현재 인증된 사용자 기준으로 동작 (`fetchUserProfile` 재사용)
 */
export async function getOrCreateProfile(
  userOverride?: User | null,
): Promise<Tables<"profiles">> {
  // 세션 정보가 없는 경우에는 기존 플로우(현재 사용자 기준)로 위임
  if (!userOverride) {
    return fetchUserProfile();
  }

  // 1) 프로필이 없으면 생성
  await ensureUserProfile(userOverride);

  // 2) 항상 최신 상태의 프로필을 조회해서 반환
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userOverride.id)
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
