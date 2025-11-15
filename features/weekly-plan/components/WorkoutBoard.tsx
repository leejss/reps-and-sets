import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useColor } from "@/constants/colors";

import { DayPlan, WeeklyWorkout } from "../types";

type WorkoutBoardProps = {
  dayPlan: DayPlan;
  onAdd: () => void;
  onEdit: (workout: WeeklyWorkout) => void;
  onDelete: (workoutId: string) => void;
};

export const WorkoutBoard = ({
  dayPlan,
  onAdd,
  onEdit,
  onDelete,
}: WorkoutBoardProps) => {
  const colors = useColor();

  return (
    <View style={[styles.workoutBoard, { backgroundColor: colors.surface }]}>
      <View style={styles.boardHeader}>
        <View>
          <Text style={[styles.boardTitle, { color: colors.text.primary }]}>
            {dayPlan.label} 계획
          </Text>
          <Text style={[styles.boardMeta, { color: colors.text.secondary }]}>
            {dayPlan.dateLabel} · {dayPlan.workouts.length}개의 운동
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.headerAddButton,
            { backgroundColor: colors.iconButton.background },
          ]}
          onPress={onAdd}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={18} color={colors.text.primary} />
          <Text style={[styles.headerAddLabel, { color: colors.text.primary }]}>
            추가
          </Text>
        </TouchableOpacity>
      </View>

      {dayPlan.workouts.length === 0 ? (
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
      ) : (
        dayPlan.workouts.map((workout) => (
          <WorkoutCard
            key={workout.id}
            workout={workout}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))
      )}
    </View>
  );
};

type WorkoutCardProps = {
  workout: WeeklyWorkout;
  onEdit: (workout: WeeklyWorkout) => void;
  onDelete: (workoutId: string) => void;
};

const WorkoutCard = ({ workout, onEdit, onDelete }: WorkoutCardProps) => {
  const colors = useColor();

  const repsValues = workout.setDetails.map((s) => s.reps);
  const minReps = Math.min(...repsValues);
  const maxReps = Math.max(...repsValues);
  const repsDisplay =
    minReps === maxReps ? `${minReps}회` : `${minReps}-${maxReps}회`;

  const weights = workout.setDetails
    .map((s) => s.weight)
    .filter((w): w is number => w !== undefined);
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
          {workout.muscleGroup} · {workout.setDetails.length}세트 × {repsDisplay}
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
          <Ionicons name="create-outline" size={18} color={colors.text.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: colors.tag.background }]}
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
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  emptyCaption: {
    fontSize: 14,
    textAlign: "center",
  },
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

