import { useEffect } from "react";
import { useAppStore } from "../stores/app-store";
import { useAuthStore } from "../stores/auth-store";

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((state) => state.initialize);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const loadInitialData = useAppStore((state) => state.loadInitialData);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (isAuthenticated) {
      loadInitialData();
    }
  }, [isAuthenticated, loadInitialData]);

  return <>{children}</>;
}
