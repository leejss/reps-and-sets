import { getSupabaseSession } from "@/lib/auth";
import type { Tables } from "@/lib/database.types";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import type { Session, User } from "@supabase/supabase-js";
import { create } from "zustand";
import { combine } from "zustand/middleware";
import { getOrCreateProfile } from "../lib/queries/users.query";
import { supabase } from "../lib/supabase";

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  scopes: ["profile", "email"],
  offlineAccess: true,
});

export const useAuthStore = create(
  combine(
    {
      isAuthenticated: false, // if session is not null
      isLoading: true,
      session: null as Session | null,
      user: null as User | null,
      profile: null as Tables<"profiles"> | null,
    },
    (set) => ({
      initialize: async () => {
        try {
          const session = await getSupabaseSession();

          let profile: Tables<"profiles"> | null = null;
          if (session?.user) {
            try {
              profile = await getOrCreateProfile(session.user);
            } catch (error) {
              console.error("초기 사용자 프로필 로드 실패:", error);
            }
          }

          set({
            session,
            isAuthenticated: !!session,
            user: session?.user ?? null,
            profile,
          });

          supabase.auth.onAuthStateChange((_event, session) => {
            const user = session?.user ?? null;

            set({
              session,
              isAuthenticated: !!session,
              user,
              // 로그아웃 시에는 프로필도 정리
              profile: user ? useAuthStore.getState().profile : null,
            });

            if (user) {
              // 비동기로 프로필 최신 상태 동기화
              getOrCreateProfile(user)
                .then((nextProfile) => {
                  set({ profile: nextProfile });
                })
                .catch((error) => {
                  console.error("사용자 프로필 동기화 실패:", error);
                });
            }
          });
        } finally {
          set({ isLoading: false });
        }
      },

      // Google 소셜 로그인
      signInWithGoogle: async () => {
        try {
          // 1. Google Play Services 체크 (Android)
          await GoogleSignin.hasPlayServices({
            showPlayServicesUpdateDialog: true,
          });

          // 2. Google 로그인 프롬프트
          const userInfo = await GoogleSignin.signIn();

          // 3. ID Token 확인
          if (!userInfo.data?.idToken) {
            throw new Error("ID Token을 받지 못했습니다");
          }

          console.log("Google Sign-In 성공:", userInfo.data.user);

          // 4. Supabase에 ID Token으로 로그인
          const { data, error } = await supabase.auth.signInWithIdToken({
            provider: "google",
            token: userInfo.data.idToken,
          });

          if (error) throw error;

          console.log("Supabase 로그인 성공:", data.user?.email);

          // 세션은 onAuthStateChange에서 자동 처리됨
        } catch (error: any) {
          // Google Sign-In 에러 핸들링
          if (error.code === statusCodes.SIGN_IN_CANCELLED) {
            console.log("사용자가 로그인을 취소했습니다");
            return; // throw 하지 않음
          } else if (error.code === statusCodes.IN_PROGRESS) {
            console.log("로그인이 이미 진행 중입니다");
            return;
          } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
            throw new Error("Google Play Services를 사용할 수 없습니다");
          }

          console.error("Google 로그인 실패:", error);
          throw error;
        }
      },

      // 이메일/비밀번호 로그인 (개발용)
      signInWithEmail: async (email: string, password: string) => {
        try {
          const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) throw error;

          // 세션은 자동으로 onAuthStateChange 리스너에서 처리됨
        } catch (error) {
          console.error("이메일 로그인 실패:", error);
          throw error;
        }
      },

      logout: async () => {
        try {
          await GoogleSignin.signOut();
        } catch (error) {
          console.warn("Google Sign-Out 오류:", error);
        }

        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error("로그아웃 실패:", error);
          throw error;
        }
      },
    }),
  ),
);
export const getAuthStore = () => useAuthStore.getState();
