import { Tabs } from "expo-router";
import React from "react";
import { Ionicons } from "@expo/vector-icons";

import { HapticTab } from "@/components/haptic-tab";
import { useApp } from "@/context/app-context";

export default function TabLayout() {
  const { darkMode } = useApp();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#00FFC6",
        tabBarInactiveTintColor: darkMode ? "#9CA3AF" : "#4B5563",
        tabBarStyle: {
          backgroundColor: darkMode ? "#0B0C10" : "#FFFFFF",
          borderTopColor: darkMode ? "#374151" : "#E5E7EB",
        },
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="exercises"
        options={{
          title: "Exercises",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="barbell" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
