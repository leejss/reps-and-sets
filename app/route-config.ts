import type { Href } from "expo-router";

/**
 * 라우트 경로 중앙 관리
 *
 * 모든 라우트 경로를 이 파일에서 중앙화하여 관리합니다.
 * 라우트 경로가 변경될 경우 이 파일만 수정하면 됩니다.
 */

export const Routes = {
  // 인증 관련
  LOGIN: "/login",

  // 메인 화면
  ROOT: "/",
  HOME: "/home",
  EXERCISES: "/exercises",
  WEEKLY_PLAN: "/weekly-plan",
  SETTINGS: "/settings",

  // 운동 관련
  TODAY_EXERCISE_REGISTER: "/today-exercise-register",
  EXERCISE_DETAIL: "/exercise-detail",

  // 운동 종목 관련
  EXERCISE_REGISTER: "/exercise-register",
} as const;

/**
 * 라우트 경로를 쿼리 파라미터와 함께 생성하는 헬퍼 함수들
 */
export const RouteHelpers = {
  /**
   * 운동 상세 화면으로 이동하는 경로 생성
   * @param id 운동 ID
   * @returns `/exercise-detail?id={id}`
   */
  exerciseDetail: (id: string): Href => {
    return `${Routes.EXERCISE_DETAIL}?id=${id}` as Href;
  },

  /**
   * 운동 등록 화면으로 이동하는 경로 생성 (편집 모드)
   * @param exerciseId 운동 종목 ID (선택사항)
   * @returns `/exercise-register` 또는 `/exercise-register?id={exerciseId}`
   */
  exerciseRegister: (exerciseId?: string): Href => {
    if (exerciseId) {
      return `${Routes.EXERCISE_REGISTER}?id=${exerciseId}` as Href;
    }
    return Routes.EXERCISE_REGISTER;
  },
} as const;
