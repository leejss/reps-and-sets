import { useColor } from "@/constants/colors";
import { formatChipDate } from "@/lib/date";
import { getWeekdayFromDate } from "@/lib/utils";
import {
  WEEKDAY_LABELS,
  WeeklyPlanExercise,
  WeeklySessionPlan,
} from "@/types/weekly-plan";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { WorkoutCard } from "./workout-card";

type WorkoutBoardProps = {
  sessionPlan: WeeklySessionPlan;
  onAdd: () => void;
  onEdit: (workout: WeeklyPlanExercise) => void;
  onDelete: (workoutId: string) => void;
  isLoading?: boolean;
  errorMessage?: string | null;
  onRetry?: () => void;
  disabled?: boolean;
};

type BoardState = "loading" | "error" | "empty" | "ready";

const resolveBoardState = ({
  isLoading,
  errorMessage,
  workouts,
}: {
  isLoading: boolean;
  errorMessage?: string | null;
  workouts: WeeklyPlanExercise[];
}): BoardState => {
  if (isLoading) {
    return "loading";
  }
  if (errorMessage) {
    return "error";
  }
  if (workouts.length === 0) {
    return "empty";
  }
  return "ready";
};

export const WorkoutBoard = ({
  sessionPlan,
  onAdd,
  onEdit,
  onDelete,
  isLoading = false,
  errorMessage,
  onRetry,
  disabled = false,
}: WorkoutBoardProps) => {
  const colors = useColor();
  const workouts = sessionPlan.exercises;
  const boardState = resolveBoardState({ isLoading, errorMessage, workouts });
  const isInteractive = !isLoading && !disabled;
  const weekdayId = getWeekdayFromDate(sessionPlan.trainingDate);
  const dayLabel = WEEKDAY_LABELS[weekdayId];
  const dateLabel = formatChipDate(sessionPlan.trainingDate);

  const renderContentByState: Record<BoardState, () => React.ReactNode> = {
    loading: () => (
      <View style={styles.feedbackState}>
        <ActivityIndicator color={colors.primary} size="small" />
        <Text style={[styles.feedbackText, { color: colors.text.secondary }]}>
          주간 계획을 불러오는 중입니다...
        </Text>
      </View>
    ),
    error: () => (
      <View
        style={[
          styles.feedbackState,
          styles.errorState,
          { borderColor: colors.status.error },
        ]}
      >
        <Ionicons
          name="warning-outline"
          size={18}
          color={colors.status.error}
        />
        <Text style={[styles.feedbackText, { color: colors.status.error }]}>
          {errorMessage}
        </Text>
        {onRetry ? (
          <TouchableOpacity
            style={[
              styles.retryButton,
              { backgroundColor: colors.status.error },
            ]}
            onPress={onRetry}
            activeOpacity={0.8}
          >
            <Text
              style={[styles.retryText, { color: colors.button.primary.text }]}
            >
              다시 시도
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    ),
    empty: () => (
      <View
        style={[
          styles.emptyState,
          {
            borderColor: colors.border,
          },
        ]}
      >
        <Ionicons
          name="calendar-outline"
          size={20}
          color={colors.text.secondary}
        />
        <Text style={[styles.emptyTitle, { color: colors.text.secondary }]}>
          등록된 운동이 없습니다
        </Text>
        <Text style={[styles.emptyCaption, { color: colors.text.tertiary }]}>
          운동을 추가해 루틴을 완성하세요.
        </Text>
      </View>
    ),
    ready: () => (
      <>
        {workouts.map((workout) => (
          <WorkoutCard
            key={workout.id}
            workout={workout}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </>
    ),
  };

  return (
    <View style={[styles.workoutBoard, { backgroundColor: colors.surface }]}>
      <View style={styles.boardHeader}>
        <View>
          <Text style={[styles.boardTitle, { color: colors.text.primary }]}>
            {dayLabel} 계획
          </Text>
          <Text style={[styles.boardMeta, { color: colors.text.secondary }]}>
            {dateLabel} · {workouts.length}개의 운동
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.headerAddButton,
            {
              backgroundColor: colors.iconButton.background,
              opacity: isInteractive ? 1 : 0.5,
            },
          ]}
          onPress={isInteractive ? onAdd : undefined}
          activeOpacity={0.85}
          disabled={!isInteractive}
        >
          <Ionicons name="add" size={18} color={colors.text.primary} />
          <Text style={[styles.headerAddLabel, { color: colors.text.primary }]}>
            추가
          </Text>
        </TouchableOpacity>
      </View>

      {renderContentByState[boardState]()}
    </View>
  );
};

// sessionDate
// list of session exercises with sets

const styles = StyleSheet.create({
  workoutBoard: {
    borderRadius: 20,
    padding: 20,
    gap: 16,
  },
  boardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  boardTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  boardMeta: {
    fontSize: 13,
  },
  headerAddButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  headerAddLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  emptyState: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    gap: 8,
  },
  feedbackState: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    alignItems: "center",
    gap: 8,
  },
  errorState: {
    borderStyle: "solid",
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  emptyCaption: {
    fontSize: 14,
    textAlign: "center",
  },
  feedbackText: {
    fontSize: 14,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 4,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },
  retryText: {
    fontSize: 13,
    fontWeight: "600",
  },
});
