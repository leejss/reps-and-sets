import { FloatingActionButton } from "@/components/floating-action-button";
import { EmptyWorkoutState } from "@/components/home/empty-workout-state";
import { HomeHeader } from "@/components/home/home-header";
import { WorkoutList } from "@/components/home/workout-list";
import { useColor } from "@/constants/colors";
import { useDataStore } from "@/stores/data-store";
import { router } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { RouteHelpers, Routes } from "../route-config";

export default function HomeScreen() {
  const todaySessionExercises = useDataStore(
    (state) => state.todaySessionExercises,
  );
  const colors = useColor();
  const navigateToRegister = () => {
    router.push(Routes.WORKOUT_REGISTER);
  };

  const navigateToDetail = (workoutId: string) => {
    router.push(RouteHelpers.workoutDetail(workoutId));
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

        {todaySessionExercises.length === 0 ? (
          <EmptyWorkoutState />
        ) : (
          <WorkoutList
            workouts={todaySessionExercises}
            onPressWorkout={navigateToDetail}
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
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
});
