import { useColor } from "@/constants/colors";
import { WeeklyWorkout } from "@/types/weekly-plan";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type WorkoutCardProps = {
  workout: WeeklyWorkout;
  onEdit: (workout: WeeklyWorkout) => void;
  onDelete: (workoutId: string) => void;
};

export const WorkoutCard = ({
  workout,
  onEdit,
  onDelete,
}: WorkoutCardProps) => {
  const colors = useColor();

  const repsValues = workout.workoutSetList
    .map((s) => s.plannedReps)
    .filter((r): r is number => r != null && r > 0);
  const hasReps = repsValues.length > 0;
  const minReps = hasReps ? Math.min(...repsValues) : null;
  const maxReps = hasReps ? Math.max(...repsValues) : null;
  const repsDisplay =
    minReps != null && maxReps != null
      ? minReps === maxReps
        ? `${minReps}회`
        : `${minReps}-${maxReps}회`
      : null;

  const weights = workout.workoutSetList
    .map((s) => s.plannedWeight)
    .filter((w): w is number => w != null && w > 0);
  const weightDisplay =
    weights.length > 0
      ? weights.length === 1 || Math.min(...weights) === Math.max(...weights)
        ? `${weights[0]}kg`
        : `${Math.min(...weights)}-${Math.max(...weights)}kg`
      : null;

  return (
    <View
      style={[
        styles.workoutCard,
        {
          borderColor: colors.border,
          backgroundColor: colors.surface,
        },
      ]}
    >
      <View style={styles.workoutInfo}>
        <Text style={[styles.workoutName, { color: colors.text.primary }]}>
          {workout.exerciseName}
        </Text>
        <Text style={[styles.workoutDetail, { color: colors.text.secondary }]}>
          {workout.muscleGroup} · {workout.workoutSetList.length}세트
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
  workoutName: {
    fontSize: 16,
    fontWeight: "600",
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
