import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import type { Session } from "@supabase/supabase-js";
import { create } from "zustand";
import { combine } from "zustand/middleware";
import { supabase } from "../lib/supabase";

// Google Sign-In 초기화
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
    },
    (set, get) => ({
      setSession: (session: Session | null) => {
        set({
          session,
          isAuthenticated: !!session,
        });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      initialize: async () => {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Error getting session:", error);
          // TODO:  Emit error event
          // emit("auth-error", error);
          set({ isLoading: false });
          return;
        }

        set({
          session,
          isAuthenticated: !!session,
        });

        set({ isLoading: false });

        supabase.auth.onAuthStateChange((_event, session) => {
          console.log("onAuthStateChange", _event, session);
          set({
            session,
            isAuthenticated: !!session,
          });
        });
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
          // Google SDK 로그아웃
          await GoogleSignin.signOut();
        } catch (error) {
          console.warn("Google Sign-Out 오류:", error);
        }

        // Supabase 로그아웃
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error("로그아웃 실패:", error);
          throw error;
        }
      },
    }),
  ),
);
// TODO: if session is not null, update public.user data
export const getAuthStore = () => {
  return useAuthStore.getState();
};
