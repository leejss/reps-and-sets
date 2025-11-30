import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { Initializer } from "@/components/initializer";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuthStore } from "@/stores/auth-store";
import { SafeAreaProvider } from "react-native-safe-area-context";

function RootNavigator() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isGuest = useAuthStore((state) => state.isGuest);

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />

      <Stack.Protected guard={!isAuthenticated && !isGuest}>
        <Stack.Screen name="login" options={{ headerShown: false }} />
      </Stack.Protected>

      <Stack.Protected guard={isAuthenticated || isGuest}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="workout-detail" options={{ headerShown: false }} />

        <Stack.Screen
          name="today-exercise-register"
          options={{ presentation: "modal", headerShown: false }}
        />
        <Stack.Screen
          name="exercise-register"
          options={{ presentation: "modal", headerShown: false }}
        />
      </Stack.Protected>

      <Stack.Screen
        name="modal"
        options={{ presentation: "modal", title: "Modal" }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <SafeAreaProvider>
        <Initializer />
        <RootNavigator />
        <StatusBar style="light" />
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
