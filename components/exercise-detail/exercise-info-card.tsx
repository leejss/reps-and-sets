import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useColor } from "@/constants/colors";

type ExerciseInfoCardProps = {
  exerciseName: string;
  targetMuscleGroup: string;
  totalSets: number;
  completedSets: number;
  progressPercentage: number;
};

export const ExerciseInfoCard = ({
  exerciseName,
  targetMuscleGroup,
  totalSets,
  completedSets,
  progressPercentage,
}: ExerciseInfoCardProps) => {
  const colors = useColor();

  const safeProgress = Math.max(0, Math.min(100, progressPercentage || 0));

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      <Text
        style={[styles.exerciseName, { color: colors.text.primary }]}
        numberOfLines={2}
      >
        {exerciseName}
      </Text>

      <View style={styles.topRow}>
        <View style={styles.leftColumn}>
          <View
            style={[
              styles.muscleGroupTag,
              { backgroundColor: colors.tag.background },
            ]}
          >
            <Text style={[styles.muscleGroupText, { color: colors.tag.text }]}>
              {targetMuscleGroup}
            </Text>
          </View>
        </View>

        <View style={styles.rightColumn}>
          <Text style={[styles.percentageText, { color: colors.primary }]}>
            {safeProgress.toFixed(0)}%
          </Text>
          <Text
            style={[styles.percentageCaption, { color: colors.text.secondary }]}
          >
            진행률
          </Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressTextRow}>
          <Text style={[styles.progressText, { color: colors.text.secondary }]}>
            진행률
          </Text>
          <Text style={[styles.progressCount, { color: colors.primary }]}>
            {completedSets} / {totalSets} 세트
          </Text>
        </View>
        <View
          style={[
            styles.progressBarBg,
            { backgroundColor: colors.input.background },
          ]}
        >
          <View
            style={[
              styles.progressBarFill,
              {
                backgroundColor: colors.primary,
                width: `${safeProgress}%`,
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  leftColumn: {
    flex: 1,
    paddingRight: 16,
    gap: 8,
  },
  rightColumn: {
    alignItems: "flex-end",
  },
  exerciseName: {
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: 0.5,
    lineHeight: 32,
    marginBottom: 16,
  },
  muscleGroupTag: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  muscleGroupText: {
    fontSize: 13,
    fontWeight: "600",
  },
  percentageText: {
    fontSize: 24,
    fontWeight: "800",
  },
  percentageCaption: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: "500",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  workoutInfo: {
    fontSize: 15,
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  progressContainer: {
    gap: 8,
  },
  progressTextRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressText: {
    fontSize: 14,
    fontWeight: "600",
  },
  progressCount: {
    fontSize: 14,
    fontWeight: "700",
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
});
