import type { SessionExerciseWithSets } from "@/lib/queries/workoutSessionExercises.query";
import React from "react";
import { StyleSheet, View } from "react-native";
import { WorkoutCard } from "./workout-card";

type WorkoutListProps = {
  workouts: SessionExerciseWithSets[];
  onPressWorkout: (workoutId: string) => void;
};

export const WorkoutList = ({ workouts, onPressWorkout }: WorkoutListProps) => {
  return (
    <View style={styles.list}>
      {workouts.map((workout) => (
        <WorkoutCard
          key={workout.id}
          workout={workout}
          onPress={onPressWorkout}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  list: {
    gap: 12,
  },
});
