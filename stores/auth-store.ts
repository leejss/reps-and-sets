import { getSupabaseSession } from "@/lib/auth";
import type { Tables } from "@/lib/database.types";
import {
  cleanupSyncedLocalData,
  getPendingDataCount,
  syncLocalToRemote,
  type SyncProgress,
} from "@/lib/sync/sync-service";
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
    "EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID가 설정되지 않았습니다. app.config.ts 혹은 환경변수를 확인해주세요."
  );
}

if (!iosClientId) {
  throw new Error(
    "EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID가 설정되지 않았습니다. app.config.ts 혹은 환경변수를 확인해주세요."
  );
}

GoogleSignin.configure({
  webClientId,
  iosClientId,
  scopes: ["profile", "email"],
  offlineAccess: true,
});

export type SyncState = "idle" | "checking" | "syncing" | "done" | "error";

export const useAuthStore = create(
  combine(
    {
      isAuthenticated: false,
      isLoading: true,
      session: null as Session | null,
      user: null as User | null,
      profile: null as Tables<"profiles"> | null,
      // 동기화 관련 상태
      syncState: "idle" as SyncState,
      syncProgress: null as SyncProgress | null,
      syncError: null as string | null,
      pendingDataCount: 0,
    },
    (set, get) => ({
      initializeAuth: async () => {
        try {
          const session = await getSupabaseSession();
          if (!session) {
            // 비로그인 상태 - 로컬 모드로 동작
            set({
              session: null,
              isAuthenticated: false,
              user: null,
              profile: null,
            });
            return;
          }
          const profile = await fetchProfile(session.user.id);

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

              const profile = await fetchProfile(session.user.id);

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

      /**
       * 동기화 대기 데이터 확인
       */
      checkPendingData: async () => {
        set({ syncState: "checking" });
        try {
          const counts = await getPendingDataCount();
          set({
            pendingDataCount: counts.total,
            syncState: "idle",
          });
          return counts.total > 0;
        } catch (error) {
          console.error("대기 데이터 확인 실패:", error);
          set({ syncState: "error", syncError: "데이터 확인 실패" });
          return false;
        }
      },

      /**
       * 로컬 데이터를 원격으로 동기화
       */
      syncData: async () => {
        set({ syncState: "syncing", syncError: null });

        const result = await syncLocalToRemote((progress) => {
          set({ syncProgress: progress });
        });

        if (result.success) {
          // 동기화 완료된 데이터 정리
          await cleanupSyncedLocalData();
          set({
            syncState: "done",
            syncProgress: null,
            pendingDataCount: 0,
          });
          return true;
        } else {
          set({
            syncState: "error",
            syncError: result.error ?? "동기화 실패",
            syncProgress: null,
          });
          return false;
        }
      },

      /**
       * 동기화 상태 초기화
       */
      resetSyncState: () => {
        set({
          syncState: "idle",
          syncProgress: null,
          syncError: null,
        });
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

          // 5. 로그인 성공 후 동기화 대기 데이터 확인
          const hasPendingData = await get().checkPendingData();
          if (hasPendingData) {
            // 동기화 대기 데이터가 있으면 자동 동기화
            await get().syncData();
          }

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

          // 로그인 성공 후 동기화 대기 데이터 확인
          const hasPendingData = await get().checkPendingData();
          if (hasPendingData) {
            await get().syncData();
          }
        } catch (error) {
          console.error("이메일 로그인 실패:", error);
          throw error;
        }
      },

      /**
       * 비로그인 모드로 시작
       * 로컬 저장소를 사용하여 앱 사용 가능
       */
      continueAsGuest: () => {
        set({
          isAuthenticated: false,
          isLoading: false,
          session: null,
          user: null,
          profile: null,
        });
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

        // 동기화 상태 초기화
        set({
          syncState: "idle",
          syncProgress: null,
          syncError: null,
          pendingDataCount: 0,
        });
      },
    })
  )
);

export const getAuthStore = () => useAuthStore.getState();

export const initializeAuth = useAuthStore.getState().initializeAuth;

export const isAuthenticated = () => useAuthStore.getState().isAuthenticated;

export const signInWithGoogle = useAuthStore.getState().signInWithGoogle;

export const signInWithEmail = useAuthStore.getState().signInWithEmail;

export const continueAsGuest = useAuthStore.getState().continueAsGuest;

export const checkPendingData = useAuthStore.getState().checkPendingData;

export const syncData = useAuthStore.getState().syncData;
