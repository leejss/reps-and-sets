import type { Session, User } from "@supabase/supabase-js";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { create } from "zustand";
import { combine } from "zustand/middleware";
import { supabase } from "../lib/supabase";

// WebBrowser 세션 완료 설정 (OAuth 리다이렉트 처리)
WebBrowser.maybeCompleteAuthSession();

export const useAuthStore = create(
  combine(
    {
      isAuthenticated: false,
      isLoading: true,
      user: null as { email: string; name: string; id: string } | null,
      session: null as Session | null,
    },
    (set, get) => ({
      setSession: (session: Session | null) => {
        set({
          session,
          isAuthenticated: !!session,
        });
      },

      setUser: (user: { email: string; name: string; id: string } | null) => {
        set({ user });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      // 초기화 함수 (앱 시작 시 호출)
      initialize: () => {
        // 초기 세션 확인
        supabase.auth.getSession().then(({ data: { session } }) => {
          set({
            session,
            isAuthenticated: !!session,
          });
          if (session?.user) {
            updateUserFromSupabaseUser(session.user, set);
          }
          set({ isLoading: false });
        });

        // Auth 상태 변경 리스너
        supabase.auth.onAuthStateChange((_event, session) => {
          set({
            session,
            isAuthenticated: !!session,
          });
          if (session?.user) {
            updateUserFromSupabaseUser(session.user, set);
          } else {
            set({ user: null });
          }
        });
      },

      // Google 소셜 로그인
      signInWithGoogle: async () => {
        try {
          const redirectUrl = AuthSession.makeRedirectUri({
            path: "/auth/callback",
          });

          const { data, error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
              redirectTo: redirectUrl,
              skipBrowserRedirect: false,
            },
          });

          if (error) throw error;

          // OAuth URL을 브라우저로 열기
          if (data.url) {
            const result = await WebBrowser.openAuthSessionAsync(
              data.url,
              redirectUrl,
            );

            if (result.type === "success") {
              // URL에서 세션 정보 추출
              const url = result.url;
              const params = new URLSearchParams(url.split("#")[1]);
              const access_token = params.get("access_token");
              const refresh_token = params.get("refresh_token");

              if (access_token && refresh_token) {
                await supabase.auth.setSession({
                  access_token,
                  refresh_token,
                });
              }
            }
          }
        } catch (error) {
          console.error("Google 로그인 실패:", error);
          throw error;
        }
      },

      signInWithKakao: async () => {
        try {
          const kakaoAppKey = process.env.EXPO_PUBLIC_KAKAO_APP_KEY;

          if (!kakaoAppKey) {
            throw new Error("Kakao App Key가 설정되지 않았습니다.");
          }

          const redirectUrl = AuthSession.makeRedirectUri({
            path: "/auth/callback",
          });

          // Kakao OAuth URL 생성
          const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${kakaoAppKey}&redirect_uri=${encodeURIComponent(
            redirectUrl,
          )}&response_type=code`;

          // 브라우저로 OAuth 플로우 시작
          const result = await WebBrowser.openAuthSessionAsync(
            kakaoAuthUrl,
            redirectUrl,
          );

          if (result.type === "success") {
            const url = result.url;
            const code = new URL(url).searchParams.get("code");

            if (code) {
              // Kakao 토큰 교환 (서버 사이드에서 처리하거나 Supabase Edge Function 사용)
              // 현재는 간단히 에러를 던집니다.
              // 실제 구현에서는 서버나 Edge Function에서 처리해야 합니다.
              throw new Error(
                "Kakao 로그인은 서버 사이드 처리가 필요합니다. " +
                  "Supabase Edge Function을 구현하거나 백엔드 API를 사용하세요.",
              );
            }
          }
        } catch (error) {
          console.error("Kakao 로그인 실패:", error);
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
          const { error } = await supabase.auth.signOut();
          if (error) throw error;

          // AppStore 데이터도 초기화
          const { useAppStore } = await import("./app-store");
          useAppStore.getState().clearData();
        } catch (error) {
          console.error("로그아웃 실패:", error);
          throw error;
        }
      },
    }),
  ),
);

function updateUserFromSupabaseUser(
  supabaseUser: User,
  set: (
    state: Partial<{
      isAuthenticated: boolean;
      isLoading: boolean;
      user: { email: string; name: string; id: string } | null;
      session: Session | null;
    }>,
  ) => void,
) {
  set({
    user: {
      id: supabaseUser.id,
      email: supabaseUser.email || "",
      name:
        supabaseUser.user_metadata?.name ||
        supabaseUser.user_metadata?.full_name ||
        supabaseUser.email?.split("@")[0] ||
        "User",
    },
  });
}
