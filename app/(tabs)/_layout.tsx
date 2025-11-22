import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";
import { useColor } from "@/constants/colors";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const colors = useColor();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1, paddingTop: insets.top }}>
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: colors.tabBar.active,
            tabBarInactiveTintColor: colors.tabBar.inactive,
            tabBarStyle: {
              backgroundColor: colors.tabBar.background,
              borderTopColor: colors.border,
              paddingBottom: insets.bottom,
            },
            headerShown: false,
            tabBarButton: HapticTab,
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: "홈",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="home" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="exercises"
            options={{
              title: "내 운동",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="barbell" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="weekly-plan"
            options={{
              title: "계획",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="calendar" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="settings"
            options={{
              title: "설정",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="settings" size={size} color={color} />
              ),
            }}
          />
        </Tabs>
      </View>
    </View>
  );
}
