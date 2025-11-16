import type { User } from "@supabase/supabase-js";

import { supabase } from "./supabase";

/**
 * 동일한 세션 동안 불필요한 조회를 방지하기 위한 캐시
 */
let ensuredUserId: string | null = null;

type ProfilePayload = {
  id: string;
  email: string;
  name: string;
  profile_photo: string | null;
};

const buildProfilePayload = (user: User): ProfilePayload => {
  const metadata = user.user_metadata ?? {};
  const fallbackName =
    (typeof metadata.name === "string" && metadata.name.trim()) ||
    (typeof metadata.full_name === "string" && metadata.full_name.trim()) ||
    (typeof metadata.user_name === "string" && metadata.user_name.trim()) ||
    user.email?.split("@")[0] ||
    "User";

  const avatar =
    typeof metadata.avatar_url === "string" ? metadata.avatar_url : null;

  return {
    id: user.id,
    email: user.email ?? "",
    name: fallbackName,
    profile_photo: avatar,
  };
};

/**
 * auth.users에 존재하지만 public.users에는 아직 없는 레코드를 안전하게 생성합니다.
 *
 * Supabase 공식 가이드(Manage User Data)에 따라 auth.users와 1:1 관계를 유지해야
 * exercise, workout 등 다른 테이블의 외래키 제약조건을 만족시킬 수 있습니다.
 */
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
    .from("users")
    .select("id")
    .eq("id", targetUser.id)
    .maybeSingle();

  if (selectError) {
    console.error("사용자 프로필 조회 실패:", selectError);
    throw selectError;
  }

  if (!existing) {
    const payload = buildProfilePayload(targetUser);
    const { error: insertError } = await supabase.from("users").insert(payload);

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
