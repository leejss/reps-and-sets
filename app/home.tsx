import { FloatingActionButton } from "@/components/floating-action-button";
import { EmptyState } from "@/components/home/empty-state";
import { HomeHeader } from "@/components/home/home-header";
import { TodayExerciseList } from "@/components/home/today-exercise-list";
import { useColor } from "@/constants/colors";
import { useDataStore } from "@/stores/data-store";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RouteHelpers, Routes } from "./route-config";

export default function HomeScreen() {
  const todayExercises = useDataStore((state) => state.todayExercises);
  const colors = useColor();

  const navigateToRegister = () => {
    router.push(Routes.TODAY_EXERCISE_REGISTER);
  };

  const navigateToDetail = (id: string) => {
    router.push(RouteHelpers.exerciseDetail(id));
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView
        edges={["top"]}
        style={{ backgroundColor: colors.headerSurface }}
      >
        <HomeHeader />
      </SafeAreaView>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Actions Section */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[
              styles.actionCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            onPress={() => router.push(Routes.WEEKLY_PLAN)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: colors.primary + "20" },
              ]}
            >
              <Ionicons name="calendar" size={24} color={colors.primary} />
            </View>
            <Text style={[styles.actionLabel, { color: colors.text.primary }]}>
              주간 계획
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            onPress={() => router.push(Routes.EXERCISES)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: colors.primary + "20" },
              ]}
            >
              <Ionicons name="barbell" size={24} color={colors.primary} />
            </View>
            <Text style={[styles.actionLabel, { color: colors.text.primary }]}>
              내 운동
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
          오늘의 운동
        </Text>

        {todayExercises.length === 0 ? (
          <EmptyState />
        ) : (
          <TodayExerciseList
            exercises={todayExercises}
            onPress={navigateToDetail}
          />
        )}
      </ScrollView>
      <FloatingActionButton onPress={navigateToRegister} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingBottom: 100,
  },
  quickActions: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 32,
  },
  actionCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  actionLabel: {
    fontSize: 15,
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
    letterSpacing: -0.5,
  },
});
