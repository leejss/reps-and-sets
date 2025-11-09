import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { AppProvider } from "@/context/app-context";
import { AuthProvider } from "@/context/auth-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <AppProvider>
        <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
          <SafeAreaProvider>
            <Stack>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="login" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen
                name="modal"
                options={{ presentation: "modal", title: "Modal" }}
              />
              <Stack.Screen
                name="workout-register"
                options={{ presentation: "modal", headerShown: false }}
              />
              <Stack.Screen
                name="exercise-register"
                options={{ presentation: "modal", headerShown: false }}
              />
              <Stack.Screen
                name="workout-detail"
                options={{ headerShown: false }}
              />
            </Stack>
            <StatusBar style="light" />
          </SafeAreaProvider>
        </ThemeProvider>
      </AppProvider>
    </AuthProvider>
  );
}
