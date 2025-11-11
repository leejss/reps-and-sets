/**
 * Supabase 클라이언트 설정
 *
 * 이 파일은 Supabase 클라이언트 인스턴스를 생성하고 설정합니다.
 * AsyncStorage를 사용하여 세션을 영구 저장합니다.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, processLock } from "@supabase/supabase-js";
import { AppState, Platform } from "react-native";
import "react-native-url-polyfill/auto";

// 환경 변수에서 Supabase 설정 가져오기
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// 환경 변수 검증
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Supabase URL과 Anon Key가 설정되지 않았습니다.\n" +
      ".env 파일에 EXPO_PUBLIC_SUPABASE_URL과 EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY를 설정해주세요.",
  );
}

/**
 * Supabase 클라이언트 인스턴스
 *
 * AsyncStorage를 사용하여 세션을 자동으로 저장하고 복원합니다.
 * 앱이 재시작되어도 로그인 상태가 유지됩니다.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // 웹이 아닌 경우에만 AsyncStorage 사용 (웹은 기본 storage 사용)
    ...(Platform.OS !== "web" ? { storage: AsyncStorage } : {}),
    // 자동 토큰 갱신 활성화
    autoRefreshToken: true,
    // 세션 감지 활성화
    persistSession: true,
    // 세션 감지 방법
    detectSessionInUrl: false,
    // 멀티탭/멀티 인스턴스 환경에서 세션 충돌 방지
    lock: processLock,
  },
});

/**
 * AppState 리스너 설정
 *
 * Supabase Auth가 앱이 포그라운드에 있을 때 자동으로 세션을 새로고침하도록 설정합니다.
 * 이를 통해 앱이 활성화되어 있는 동안 `onAuthStateChange` 이벤트에서
 * `TOKEN_REFRESHED` 또는 `SIGNED_OUT` 이벤트를 계속 받을 수 있습니다.
 *
 * 이는 한 번만 등록되어야 합니다.
 */
if (Platform.OS !== "web") {
  AppState.addEventListener("change", (state) => {
    if (state === "active") {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}

/**
 * 데이터베이스 타입 정의
 *
 * Supabase CLI로 생성된 타입 정의를 여기에 import할 수 있습니다.
 * 예: import { Database } from './database.types';
 */
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          profile_photo: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          profile_photo?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          profile_photo?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      exercises: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          muscle_group: string;
          description: string | null;
          link: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          muscle_group: string;
          description?: string | null;
          link?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          muscle_group?: string;
          description?: string | null;
          link?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      workout_logs: {
        Row: {
          id: string;
          user_id: string;
          exercise_id: string | null;
          exercise_name: string;
          muscle_group: string;
          set_details: any; // JSONB
          completed: boolean;
          workout_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          exercise_id?: string | null;
          exercise_name: string;
          muscle_group: string;
          set_details: any;
          completed?: boolean;
          workout_date?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          exercise_id?: string | null;
          exercise_name?: string;
          muscle_group?: string;
          set_details?: any;
          completed?: boolean;
          workout_date?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};
