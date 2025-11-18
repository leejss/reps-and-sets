import type { User } from "@supabase/supabase-js";
import { insertUserProfileRow, UserInsertPayload } from "./queries/users.query";
import { supabase } from "./supabase";

let ensuredUserId: string | null = null;

const pickFirstNonEmpty = (...values: unknown[]): string | undefined => {
  for (const value of values) {
    if (typeof value !== "string") continue;
    const trimmed = value.trim();
    if (trimmed) return trimmed;
  }
  return undefined;
};

const buildProfilePayload = (user: User): UserInsertPayload => {
  const metadata = user.user_metadata ?? {};
  const display_name =
    pickFirstNonEmpty(
      metadata.name,
      metadata.full_name,
      metadata.user_name,
      metadata.preferred_username,
    ) ??
    user.email?.split("@")[0] ??
    "User";

  return {
    id: user.id,
    display_name,
  };
};

export const ensureUserProfile = async (
  userOverride?: User | null,
): Promise<void> => {
  const targetUser =
    userOverride ??
    (
      await supabase.auth.getUser().catch((error) => {
        console.error("현재 사용자 조회 실패:", error);
        throw error;
      })
    ).data.user;

  if (!targetUser) {
    return;
  }

  if (ensuredUserId === targetUser.id) {
    return;
  }

  const { data: existing, error: selectError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", targetUser.id)
    .maybeSingle();

  if (selectError) {
    console.error("사용자 프로필 조회 실패:", selectError);
    throw selectError;
  }

  if (!existing) {
    const payload = buildProfilePayload(targetUser);
    const { error: insertError } = await insertUserProfileRow(payload);

    if (insertError) {
      // 중복 삽입 시도는 무시 (다른 클라이언트가 선행해도 OK)
      if (insertError.code === "23505") {
        ensuredUserId = targetUser.id;
        return;
      }

      console.error("사용자 프로필 생성 실패:", insertError);
      throw insertError;
    }
  }

  ensuredUserId = targetUser.id;
};
