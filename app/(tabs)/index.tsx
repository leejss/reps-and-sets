import { FloatingActionButton } from "@/components/floating-action-button";
import { useColor } from "@/constants/colors";
import { useApp } from "@/context/app-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Routes, RouteHelpers } from "../route-config";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function HomeScreen() {
  const { todayWorkouts, toggleWorkoutComplete } = useApp();
  const colors = useColor();
  const today = new Date().toLocaleDateString("ko-KR", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const navigateToRegister = () => {
    router.push(Routes.WORKOUT_REGISTER);
  };

  const navigateToDetail = (workoutId: string) => {
    router.push(RouteHelpers.workoutDetail(workoutId));
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.headerSurface }]}>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
          Reps and Sets
        </Text>
        <Text style={[styles.headerDate, { color: colors.text.secondary }]}>
          {today}
        </Text>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
          오늘의 운동
        </Text>

        {todayWorkouts.length === 0 ? (
          <View
            style={[
              styles.emptyCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.emptyText, { color: colors.text.secondary }]}>
              등록된 운동이 없습니다.
            </Text>
            <Text
              style={[styles.emptySubtext, { color: colors.text.tertiary }]}
            >
              아래 + 버튼을 눌러 운동을 추가해보세요
            </Text>
          </View>
        ) : (
          <View style={styles.workoutList}>
            {todayWorkouts.map((workout) => {
              const completedCount = workout.setDetails.filter(
                (s) => s.completed,
              ).length;
              const totalSets = workout.setDetails.length;

              // 세트 정보 요약
              const repsValues = workout.setDetails.map((s) => s.reps);
              const minReps = Math.min(...repsValues);
              const maxReps = Math.max(...repsValues);
              const repsDisplay =
                minReps === maxReps
                  ? `${minReps} reps`
                  : `${minReps}-${maxReps} reps`;

              // 무게 정보 요약
              const weights = workout.setDetails
                .map((s) => s.weight)
                .filter((w): w is number => w !== undefined);
              const weightDisplay =
                weights.length > 0
                  ? weights.length === 1 ||
                    Math.min(...weights) === Math.max(...weights)
                    ? `${weights[0]}kg`
                    : `${Math.min(...weights)}-${Math.max(...weights)}kg`
                  : null;
              return (
                <TouchableOpacity
                  key={workout.id}
                  style={[
                    styles.workoutCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      opacity: workout.completed ? 0.6 : 1,
                    },
                  ]}
                  onPress={() => navigateToDetail(workout.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.workoutCardContent}>
                    <View style={styles.workoutInfo}>
                      <Text
                        style={[
                          styles.workoutName,
                          {
                            color: colors.text.primary,
                            textDecorationLine: workout.completed
                              ? "line-through"
                              : "none",
                          },
                        ]}
                      >
                        {workout.exerciseName}
                      </Text>
                      <Text
                        style={[
                          styles.workoutDetails,
                          { color: colors.text.secondary },
                        ]}
                      >
                        {totalSets} sets × {repsDisplay}
                        {weightDisplay && ` @ ${weightDisplay}`}
                      </Text>
                      <View style={styles.tagRow}>
                        <View
                          style={[
                            styles.muscleGroupTag,
                            {
                              backgroundColor: colors.tag.background,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.muscleGroupText,
                              { color: colors.tag.text },
                            ]}
                          >
                            {workout.muscleGroup}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.progressTag,
                            {
                              backgroundColor: colors.tag.background,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.progressText,
                              { color: colors.primary },
                            ]}
                          >
                            {completedCount}/{totalSets}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        toggleWorkoutComplete(workout.id);
                      }}
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
                        <Ionicons
                          name="checkmark"
                          size={20}
                          color={colors.text.primary}
                        />
                      )}
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <FloatingActionButton onPress={navigateToRegister} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 32,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 4,
  },
  headerDate: {
    fontSize: 14,
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
  emptyCard: {
    padding: 32,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 12,
    marginTop: 8,
    textAlign: "center",
  },
  workoutList: {
    gap: 12,
  },
  workoutCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  tagRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  progressTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  progressText: {
    fontSize: 12,
    fontWeight: "700",
  },
  workoutCardContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  workoutDetails: {
    fontSize: 14,
    marginBottom: 8,
  },
  muscleGroupTag: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  muscleGroupText: {
    fontSize: 12,
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
