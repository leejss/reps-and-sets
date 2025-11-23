import { useColor } from "@/constants/colors";
import type { SessionExerciseWithSets } from "@/lib/queries/workoutSessionExercises.query";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type GestureResponderEvent,
} from "react-native";

type WorkoutCardProps = {
  workout: SessionExerciseWithSets;
  onPress: (workoutId: string) => void;
  onToggle: (workoutId: string) => Promise<void> | void;
};

export const WorkoutCard = ({
  workout,
  onPress,
  onToggle,
}: WorkoutCardProps) => {
  const colors = useColor();

  const repsSummary = buildRepsDisplay(workout.sets);
  const weightSummary = buildWeightDisplay(workout.sets);
  const completedSets = workout.sets.filter((set) => set.completed).length;
  const totalSets = workout.sets.length;

  const handleCardPress = () => onPress(workout.id);

  const handleTogglePress = async (event: GestureResponderEvent) => {
    event.stopPropagation();
    await onToggle(workout.id);
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          opacity: workout.completed ? 0.6 : 1,
        },
      ]}
      onPress={handleCardPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={styles.info}>
          <Text
            style={[
              styles.title,
              {
                color: colors.text.primary,
                textDecorationLine: workout.completed ? "line-through" : "none",
              },
            ]}
          >
            {workout.exerciseName}
          </Text>
          <Text
            style={[styles.details, { color: colors.text.secondary }]}
            numberOfLines={1}
          >
            {totalSets} sets × {repsSummary}
            {weightSummary && ` @ ${weightSummary}`}
          </Text>
          <View style={styles.tagRow}>
            <View
              style={[
                styles.tag,
                {
                  backgroundColor: colors.tag.background,
                },
              ]}
            >
              <Text style={[styles.tagText, { color: colors.tag.text }]}>
                {workout.targetMuscleGroup}
              </Text>
            </View>

            <View
              style={[
                styles.progress,
                {
                  backgroundColor: colors.tag.background,
                },
              ]}
            >
              <Text style={[styles.progressText, { color: colors.primary }]}>
                {completedSets}/{totalSets}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleTogglePress}
          style={[
            styles.checkButton,
            {
              backgroundColor: workout.completed
                ? colors.primary
                : colors.tag.background,
              borderColor: workout.completed
                ? colors.primary
                : colors.input.border,
            },
          ]}
          activeOpacity={0.7}
        >
          {workout.completed && (
            <Ionicons name="checkmark" size={20} color={colors.text.primary} />
          )}
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const buildRepsDisplay = (
  sets: SessionExerciseWithSets["sets"],
): string => {
  if (sets.length === 0) {
    return "0 reps";
  }

  const repsValues = sets
    .map((set) => set.actualReps ?? set.plannedReps)
    .filter((value): value is number => typeof value === "number");

  if (repsValues.length === 0) {
    return "0 reps";
  }

  const minReps = Math.min(...repsValues);
  const maxReps = Math.max(...repsValues);

  return minReps === maxReps ? `${minReps} reps` : `${minReps}-${maxReps} reps`;
};

const buildWeightDisplay = (
  sets: SessionExerciseWithSets["sets"],
): string | null => {
  const weights = sets
    .map((set) => set.actualWeight ?? set.plannedWeight)
    .filter((weight): weight is number => typeof weight === "number");

  if (weights.length === 0) {
    return null;
  }

  const minWeight = Math.min(...weights);
  const maxWeight = Math.max(...weights);

  return minWeight === maxWeight
    ? `${minWeight}kg`
    : `${minWeight}-${maxWeight}kg`;
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  content: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  details: {
    fontSize: 14,
    marginBottom: 8,
  },
  tagRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  tag: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
  },
  progress: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  progressText: {
    fontSize: 12,
    fontWeight: "700",
  },
  checkButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
});

