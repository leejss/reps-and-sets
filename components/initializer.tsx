import { initializeAuth, useAuthStore } from "@/stores/auth-store";
import { loadInitialData } from "@/stores/data-store";
import { useEffect } from "react";

export function Initializer() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    initializeAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadInitialData();
    }
  }, [isAuthenticated]);

  return null;
}
