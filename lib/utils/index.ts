import type { SetDetail } from "@/lib/types";
import { Weekday } from "@/types/weekly-plan";
import dayjs from "dayjs";
import { supabase } from "../supabase";
import { ensureUserProfile } from "../user-profile";

export const getAuthenticatedUser = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("인증되지 않은 사용자입니다.");
  }

  await ensureUserProfile(user);

  return user;
};

export const normalizeSetDetails = (details: unknown): SetDetail[] => {
  if (!Array.isArray(details)) {
    return [];
  }

  return (details as (Partial<SetDetail> | null | undefined)[]).map((set) => ({
    reps: typeof set?.reps === "number" ? set.reps : 0,
    weight: typeof set?.weight === "number" ? set.weight : undefined,
    completed: Boolean(set?.completed),
  }));
};

const WEEKDAY_BY_JS_INDEX: Weekday[] = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
];

/**
 * Date 객체에서 Weekday 문자열 반환
 * @param date - Date 객체 또는 날짜 문자열
 * @returns Weekday 타입 ('Mon', 'Tue', ...)
 */
export const getWeekdayFromDate = (date: Date | string): Weekday => {
  return WEEKDAY_BY_JS_INDEX[dayjs(date).day()];
};
