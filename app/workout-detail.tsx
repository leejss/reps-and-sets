import { useColor } from "@/constants/colors";
import { useApp } from "@/context/app-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function WorkoutDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { todayWorkouts, toggleSetComplete, toggleWorkoutComplete } = useApp();
  const colors = useColor();

  const workout = todayWorkouts.find((w) => w.id === id);

  if (!workout) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
            Workout Not Found
          </Text>
        </View>
      </View>
    );
  }

  const completedCount = workout.completedSets.filter((s) => s).length;
  const progressPercentage = (completedCount / workout.sets) * 100;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.headerSurface }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
          Workout Detail
        </Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Workout Info Card */}
        <View
          style={[
            styles.infoCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.exerciseName, { color: colors.text.primary }]}>
            {workout.exerciseName}
          </Text>
          <View
            style={[
              styles.muscleGroupTag,
              { backgroundColor: colors.tag.background },
            ]}
          >
            <Text style={[styles.muscleGroupText, { color: colors.tag.text }]}>
              {workout.muscleGroup}
            </Text>
          </View>
          <Text style={[styles.workoutInfo, { color: colors.text.secondary }]}>
            {workout.reps} reps per set
            {workout.weight && ` @ ${workout.weight}kg`}
          </Text>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressTextRow}>
              <Text style={[styles.progressText, { color: colors.text.secondary }]}>
                Progress
              </Text>
              <Text style={[styles.progressCount, { color: colors.primary }]}>
                {completedCount} / {workout.sets} sets
              </Text>
            </View>
            <View
              style={[styles.progressBarBg, { backgroundColor: colors.input.background }]}
            >
              <View
                style={[
                  styles.progressBarFill,
                  {
                    backgroundColor: colors.primary,
                    width: `${progressPercentage}%`,
                  },
                ]}
              />
            </View>
          </View>
        </View>

        {/* Sets List */}
        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
          Sets
        </Text>
        <View style={styles.setsList}>
          {workout.completedSets.map((completed, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => toggleSetComplete(workout.id, index)}
              style={[
                styles.setCard,
                {
                  backgroundColor: completed
                    ? colors.primary
                    : colors.surface,
                  borderColor: completed
                    ? colors.primary
                    : colors.border,
                },
              ]}
              activeOpacity={0.7}
            >
              <View style={styles.setCardContent}>
                <View style={styles.setInfo}>
                  <Text
                    style={[
                      styles.setNumber,
                      {
                        color: completed
                          ? colors.text.primary
                          : colors.text.primary,
                      },
                    ]}
                  >
                    Set {index + 1}
                  </Text>
                  <Text
                    style={[
                      styles.setDetails,
                      {
                        color: completed
                          ? colors.text.primary
                          : colors.text.secondary,
                      },
                    ]}
                  >
                    {workout.reps} reps
                    {workout.weight && ` @ ${workout.weight}kg`}
                  </Text>
                </View>
                <View
                  style={[
                    styles.checkIcon,
                    {
                      backgroundColor: completed
                        ? "rgba(255, 255, 255, 0.2)"
                        : colors.tag.background,
                      borderColor: completed
                        ? "rgba(255, 255, 255, 0.3)"
                        : colors.input.border,
                    },
                  ]}
                >
                  {completed && (
                    <Ionicons
                      name="checkmark"
                      size={24}
                      color={colors.text.primary}
                    />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Complete All Button */}
        <TouchableOpacity
          onPress={() => toggleWorkoutComplete(workout.id)}
          style={[
            styles.completeButton,
            {
              backgroundColor: workout.completed
                ? colors.tag.background
                : colors.primary,
              borderColor: workout.completed
                ? colors.input.border
                : colors.primary,
            },
          ]}
          activeOpacity={0.8}
        >
          <Ionicons
            name={workout.completed ? "refresh" : "checkmark-done"}
            size={20}
            color={colors.text.primary}
          />
          <Text style={[styles.completeButtonText, { color: colors.text.primary }]}>
            {workout.completed ? "Reset All Sets" : "Complete All Sets"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 16,
    gap: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingBottom: 40,
  },
  infoCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  exerciseName: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 12,
  },
  muscleGroupTag: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 12,
  },
  muscleGroupText: {
    fontSize: 13,
    fontWeight: "600",
  },
  workoutInfo: {
    fontSize: 15,
    marginBottom: 20,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  setsList: {
    gap: 12,
    marginBottom: 24,
  },
  setCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  setCardContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  setInfo: {
    flex: 1,
  },
  setNumber: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  setDetails: {
    fontSize: 14,
  },
  checkIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  completeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    gap: 8,
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
