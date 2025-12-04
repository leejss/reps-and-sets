import { FloatingActionButton } from "@/components/floating-action-button";
import { EmptyState } from "@/components/home/empty-state";
import { HomeHeader } from "@/components/home/home-header";
import { TodayExerciseList } from "@/components/home/today-exercise-list";
import { useColor } from "@/constants/colors";
import { useDataStore } from "@/stores/data-store";
import { router } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { RouteHelpers, Routes } from "../route-config";

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
      <HomeHeader />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
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
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
    letterSpacing: -0.5,
  },
});
