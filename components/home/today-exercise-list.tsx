import { DayExerciseWithDetails } from "@/lib/models/day-exercise";
import React from "react";
import { StyleSheet, View } from "react-native";
import { TodayExerciseCard } from "./today-exercise-card";

type TodayExerciseListProps = {
  exercises: DayExerciseWithDetails[];
  onPress: (id: string) => void;
};

export const TodayExerciseList = ({
  exercises,
  onPress,
}: TodayExerciseListProps) => {
  return (
    <View style={styles.list}>
      {exercises.map((exercise) => (
        <TodayExerciseCard
          key={exercise.id}
          exercise={exercise}
          onPress={onPress}
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
