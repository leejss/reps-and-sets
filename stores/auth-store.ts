import { getSupabaseSession } from "@/lib/auth";
import type { Tables } from "@/lib/database.types";
import {
  GoogleSignin,
  isSuccessResponse,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import type { Session, User } from "@supabase/supabase-js";
import { create } from "zustand";
import { combine } from "zustand/middleware";
import { fetchProfile } from "../lib/queries/profile.query";
import { supabase } from "../lib/supabase";

const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

if (!webClientId) {
  throw new Error(
    "EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID가 설정되지 않았습니다. app.config.ts 혹은 환경변수를 확인해주세요.",
  );
}

if (!iosClientId) {
  throw new Error(
    "EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID가 설정되지 않았습니다. app.config.ts 혹은 환경변수를 확인해주세요.",
  );
}

GoogleSignin.configure({
  webClientId,
  iosClientId,
  scopes: ["profile", "email"],
  offlineAccess: true,
});

export const useAuthStore = create(
  combine(
    {
      isAuthenticated: false,
      isLoading: true,
      session: null as Session | null,
      user: null as User | null,
      profile: null as Tables<"profiles"> | null,
    },
    (set) => ({
      initializeAuth: async () => {
        try {
          const session = await getSupabaseSession();
          if (!session) {
            set({
              session: null,
              isAuthenticated: false,
              user: null,
              profile: null,
            });
            return;
          }
          const profile = await fetchProfile(
            session.user.id,
            session.user.user_metadata?.full_name ?? session.user.email,
          );

          set({
            session,
            isAuthenticated: true,
            user: session.user,
            profile,
          });

          supabase.auth.onAuthStateChange(async (_event, session) => {
            try {
              if (!session) {
                set({
                  session: null,
                  isAuthenticated: false,
                  user: null,
                  profile: null,
                });
                return;
              }

              const profile = await fetchProfile(
                session.user.id,
                session.user.user_metadata?.full_name ?? session.user.email,
              );

              set({
                session,
                isAuthenticated: true,
                user: session.user,
                profile,
              });
            } catch (error) {
              console.error("사용자 프로필 동기화 실패:", error);
            }
          });
        } finally {
          set({ isLoading: false });
        }
      },

      // Google 소셜 로그인
      signInWithGoogle: async (): Promise<boolean> => {
        try {
          // 1. Google Play Services 체크 (Android)
          await GoogleSignin.hasPlayServices({
            showPlayServicesUpdateDialog: true,
          });

          // 2. Google 로그인 프롬프트
          const response = await GoogleSignin.signIn();

          if (!isSuccessResponse(response)) {
            console.log("사용자가 로그인을 취소했습니다");
            return false;
          }

          // 3. ID Token 확인
          const idToken = response.data.idToken;

          if (!idToken) {
            throw new Error("ID Token을 받지 못했습니다");
          }

          console.log("Google Sign-In 성공:", response.data.user);

          // 4. Supabase에 ID Token으로 로그인
          const { data, error } = await supabase.auth.signInWithIdToken({
            provider: "google",
            token: idToken,
          });

          if (error) throw error;

          console.log("Supabase 로그인 성공:", data.user?.email);
          return true;
        } catch (error: unknown) {
          // Google Sign-In 에러 핸들링
          const err = error as { code?: string };
          if (err.code === statusCodes.SIGN_IN_CANCELLED) {
            console.log("사용자가 로그인을 취소했습니다");
            return false;
          } else if (err.code === statusCodes.IN_PROGRESS) {
            console.log("로그인이 이미 진행 중입니다");
            return false;
          } else if (err.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
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

export const initializeAuth = useAuthStore.getState().initializeAuth;

export const isAuthenticated = () => useAuthStore.getState().isAuthenticated;

export const signInWithGoogle = useAuthStore.getState().signInWithGoogle;

export const signInWithEmail = useAuthStore.getState().signInWithEmail;
