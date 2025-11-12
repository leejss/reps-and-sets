import { useAuthStore } from "@/stores/auth-store";
import { SplashScreen } from "expo-router";

SplashScreen.preventAutoHideAsync();

export function SplashScreenController() {
  const isLoading = useAuthStore((state) => state.isLoading);

  if (!isLoading) {
    SplashScreen.hideAsync();
  }

  return null;
}
