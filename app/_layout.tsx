import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { AuthInitializer } from "@/components/auth-initializer";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuthStore } from "@/stores/auth-store";
import { SafeAreaProvider } from "react-native-safe-area-context";

function RootNavigator() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />

      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="login" options={{ headerShown: false }} />
      </Stack.Protected>

      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="workout-detail" options={{ headerShown: false }} />

        <Stack.Screen
          name="workout-register"
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
    <AuthInitializer>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <SafeAreaProvider>
          <RootNavigator />
          <StatusBar style="light" />
        </SafeAreaProvider>
      </ThemeProvider>
    </AuthInitializer>
  );
}
