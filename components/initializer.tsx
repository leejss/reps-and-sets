import { initializeAuth, useAuthStore } from "@/stores/auth-store";
import { loadInitialData } from "@/stores/data-store";
import { useEffect } from "react";

export function Initializer() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isGuest = useAuthStore((state) => state.isGuest);

  useEffect(() => {
    initializeAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated || isGuest) {
      loadInitialData();
    }
  }, [isAuthenticated, isGuest]);

  return null;
}
