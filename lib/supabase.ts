import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, processLock } from "@supabase/supabase-js";
import { AppState, Platform } from "react-native";
import "react-native-url-polyfill/auto";
import type { Database } from "./database.types";

export type { Database };

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

const ExpoWebSecureStoreAdapter = {
  getItem: (key: string) => {
    console.debug("getItem", { key });
    return AsyncStorage.getItem(key);
  },
  setItem: (key: string, value: string) => {
    return AsyncStorage.setItem(key, value);
  },
  removeItem: (key: string) => {
    return AsyncStorage.removeItem(key);
  },
};

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    ...(Platform.OS !== "web" ? { storage: ExpoWebSecureStoreAdapter } : {}),
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
