import type { Tables } from "../../database.types";
import { supabase } from "../../supabase";
import type { IProfileRepository } from "../profile.repository";

export class SupabaseProfileRepository implements IProfileRepository {
  async getOrCreate(
    userId: string,
    displayName?: string | null,
  ): Promise<Tables<"profiles">> {
    // 먼저 기존 프로필 확인
    const { data: existingProfile, error: selectError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (selectError) {
      console.error("프로필 조회 실패:", selectError);
      throw selectError;
    }

    if (existingProfile) {
      return existingProfile;
    }

    // 프로필이 없으면 생성
    const { data: newProfile, error: insertError } = await supabase
      .from("profiles")
      .insert({
        id: userId,
        display_name: displayName ?? null,
      })
      .select("*")
      .single();

    if (insertError) {
      console.error("프로필 생성 실패:", insertError);
      throw insertError;
    }

    return newProfile;
  }
}
