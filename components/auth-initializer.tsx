import { useEffect } from "react";
import { useAuthStore } from "../stores/auth-store";
import { useDataStore } from "../stores/data-store";

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((state) => state.initialize);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const loadInitialData = useDataStore((state) => state.loadInitialData);

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
