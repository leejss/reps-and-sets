import { useColor } from "@/constants/colors";
import { DayExerciseWithDetails } from "@/lib/models/day-exercise";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type TodayExerciseCardProps = {
  exercise: DayExerciseWithDetails;
  onPress: (id: string) => void;
};

export const TodayExerciseCard = ({
  exercise,
  onPress,
}: TodayExerciseCardProps) => {
  const colors = useColor();

  const repsSummary = buildRepsDisplay(exercise.sets);
  const weightSummary = buildWeightDisplay(exercise.sets);
  const completedSets = exercise.sets.filter((set) => set.isCompleted).length;
  const totalSets = exercise.sets.length;
  const isCompleted = exercise.isCompleted;
  const isDeleted = exercise.isDeleted;

  const handleCardPress = () => onPress(exercise.id);

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: isCompleted ? colors.tag.tutorial : colors.surface,
          borderColor: isCompleted ? colors.primary : colors.border,
          opacity: isCompleted ? 0.95 : 1,
        },
      ]}
      onPress={handleCardPress}
      activeOpacity={0.7}
    >
      {isCompleted && (
        <View
          pointerEvents="none"
          style={[
            styles.completedGlow,
            {
              backgroundColor: colors.primary,
            },
          ]}
        />
      )}
      <View style={styles.content}>
        <View style={styles.info}>
          <View style={styles.titleRow}>
            <Text
              style={[
                styles.title,
                {
                  color: isDeleted
                    ? colors.text.tertiary
                    : isCompleted
                    ? colors.text.secondary
                    : colors.text.primary,
                  textDecorationLine: isCompleted ? "line-through" : "none",
                  fontStyle: isDeleted ? "italic" : "normal",
                },
              ]}
            >
              {exercise.exerciseName}
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
          <Text
            style={[
              styles.details,
              {
                color: isCompleted
                  ? colors.text.tertiary
                  : colors.text.secondary,
              },
            ]}
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
                  backgroundColor: isCompleted
                    ? colors.primary
                    : colors.tag.background,
                },
              ]}
            >
              <Text
                style={[
                  styles.tagText,
                  { color: isCompleted ? colors.surface : colors.tag.text },
                ]}
              >
                {exercise.targetMuscleGroup}
              </Text>
            </View>

            <View
              style={[
                styles.progress,
                {
                  backgroundColor: isCompleted
                    ? colors.primary
                    : colors.tag.background,
                },
              ]}
            >
              <Text
                style={[
                  styles.progressText,
                  { color: isCompleted ? colors.surface : colors.primary },
                ]}
              >
                {completedSets}/{totalSets}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const buildRepsDisplay = (sets: DayExerciseWithDetails["sets"]): string => {
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
  sets: DayExerciseWithDetails["sets"],
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
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  content: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    zIndex: 1,
  },
  info: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    flexShrink: 1,
    letterSpacing: -0.5,
  },
  deletedIcon: {
    marginLeft: 6,
  },
  details: {
    fontSize: 15,
    marginBottom: 12,
    fontWeight: "500",
  },
  tagRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  tag: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 13,
    fontWeight: "600",
  },
  progress: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  progressText: {
    fontSize: 13,
    fontWeight: "700",
  },
  completedGlow: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.08,
    zIndex: 0,
    borderRadius: 24,
  },
});
