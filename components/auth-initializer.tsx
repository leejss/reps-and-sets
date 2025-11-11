import { useEffect } from "react";
import { useAppStore } from "../stores/app-store";
import { useAuthStore } from "../stores/auth-store";

/**
 * 스토어 초기화 컴포넌트
 *
 * Auth와 App 스토어를 초기화합니다.
 * - AuthStore: Supabase 세션 확인 및 리스너 설정
 * - AppStore: 사용자가 인증되면 운동 데이터 로드
 */
export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((state) => state.initialize);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const loadInitialData = useAppStore((state) => state.loadInitialData);

  // Auth 초기화
  useEffect(() => {
    initialize();
  }, [initialize]);

  // 인증 상태 변경 시 App 데이터 로드
  useEffect(() => {
    if (isAuthenticated) {
      loadInitialData();
    }
  }, [isAuthenticated, loadInitialData]);

  return <>{children}</>;
}
