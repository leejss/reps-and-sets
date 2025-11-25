import { useColor } from "@/constants/colors";
import { WeeklyPlanExercise } from "@/types/weekly-plan";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type WorkoutCardProps = {
  workout: WeeklyPlanExercise;
  onEdit: (workout: WeeklyPlanExercise) => void;
  onDelete: (workoutId: string) => void;
};

const createMetricDisplay = (values: number[], unit: string): string | null => {
  if (values.length === 0) {
    return null;
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  if (min === max) {
    return `${min}${unit}`;
  }

  return `${min}-${max}${unit}`;
};

const summarizeSets = (sets: WeeklyPlanExercise["sets"]) => {
  const reps = sets
    .map((set) => set.plannedReps)
    .filter((value): value is number => value != null && value > 0);

  const weights = sets
    .map((set) => set.plannedWeight)
    .filter((value): value is number => value != null && value > 0);

  return {
    repsDisplay: createMetricDisplay(reps, "회"),
    weightDisplay: createMetricDisplay(weights, "kg"),
  };
};

export const WorkoutCard = ({
  workout,
  onEdit,
  onDelete,
}: WorkoutCardProps) => {
  const colors = useColor();
  const { repsDisplay, weightDisplay } = useMemo(
    () => summarizeSets(workout.sets),
    [workout.sets],
  );

  const isDeleted = workout.isDeleted;

  return (
    <View
      style={[
        styles.workoutCard,
        {
          borderColor: isDeleted ? colors.status.warning : colors.border,
          backgroundColor: colors.surface,
          opacity: isDeleted ? 0.85 : 1,
        },
      ]}
    >
      <View style={styles.workoutInfo}>
        <View style={styles.workoutNameRow}>
          <Text
            style={[
              styles.workoutName,
              {
                color: isDeleted ? colors.text.tertiary : colors.text.primary,
                fontStyle: isDeleted ? "italic" : "normal",
              },
            ]}
          >
            {workout.exerciseName}
          </Text>
          {isDeleted && (
            <Ionicons
              name="alert-circle"
              size={16}
              color={colors.status.warning}
              style={styles.deletedIcon}
            />
          )}
        </View>
        <Text style={[styles.workoutDetail, { color: colors.text.secondary }]}>
          {workout.targetMuscleGroup} · {workout.sets.length}세트
          {repsDisplay && ` × ${repsDisplay}`}
          {weightDisplay && ` @ ${weightDisplay}`}
        </Text>
        {workout.note ? (
          <Text style={[styles.workoutNote, { color: colors.text.tertiary }]}>
            {workout.note}
          </Text>
        ) : null}
      </View>
      <View style={styles.workoutActions}>
        {!isDeleted && (
          <TouchableOpacity
            style={[
              styles.iconButton,
              { backgroundColor: colors.iconButton.background },
            ]}
            onPress={() => onEdit(workout)}
            activeOpacity={0.75}
          >
            <Ionicons
              name="create-outline"
              size={18}
              color={colors.text.primary}
            />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[
            styles.iconButton,
            { backgroundColor: colors.tag.background },
          ]}
          onPress={() => onDelete(workout.id)}
          activeOpacity={0.75}
        >
          <Ionicons
            name="trash-outline"
            size={18}
            color={colors.status.error}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  workoutCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  workoutInfo: {
    flex: 1,
    gap: 4,
  },
  workoutNameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  workoutName: {
    fontSize: 16,
    fontWeight: "600",
    flexShrink: 1,
  },
  deletedIcon: {
    marginLeft: 6,
  },
  workoutDetail: {
    fontSize: 14,
  },
  workoutNote: {
    fontSize: 13,
  },
  workoutActions: {
    flexDirection: "row",
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});
