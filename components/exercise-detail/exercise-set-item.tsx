import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useColor } from "@/constants/colors";
import type { ExerciseSet } from "@/lib/models/exercise-set";
import { getDisplayReps, getDisplayWeight } from "./utils";

type WorkoutSetItemProps = {
  index: number;
  set: ExerciseSet;
  onToggle: () => void;
  onEdit: () => void;
};

export const WorkoutSetItem = ({
  index,
  set,
  onToggle,
  onEdit,
}: WorkoutSetItemProps) => {
  const colors = useColor();

  const displayReps = getDisplayReps(set) ?? "0";
  const displayWeight = getDisplayWeight(set);
  return (
    <View
      style={[
        styles.setCard,
        {
          backgroundColor: set.isCompleted ? colors.primary : colors.surface,
          borderColor: set.isCompleted ? colors.primary : colors.border,
        },
      ]}
    >
      <TouchableOpacity
        onPress={onToggle}
        style={styles.setCardTouchable}
        activeOpacity={0.7}
      >
        <View style={styles.setCardContent}>
          <View style={styles.setInfo}>
            <Text
              style={[
                styles.setNumber,
                {
                  color: set.isCompleted
                    ? colors.primarySurface
                    : colors.text.primary,
                },
              ]}
            >
              {index + 1} 세트
            </Text>
            <Text
              style={[
                styles.setDetails,
                {
                  color: set.isCompleted
                    ? colors.primarySurface
                    : colors.text.secondary,
                },
              ]}
            >
              {displayReps} reps
              {displayWeight != null && ` @ ${displayWeight}kg`}
            </Text>
          </View>

          <View style={styles.setActions}>
            <TouchableOpacity
              onPress={onEdit}
              style={[
                styles.editButton,
                {
                  backgroundColor: set.isCompleted
                    ? "rgba(255, 255, 255, 0.2)"
                    : colors.tag.background,
                },
              ]}
              activeOpacity={0.7}
            >
              <Ionicons
                name="create-outline"
                size={18}
                color={
                  set.isCompleted ? colors.primarySurface : colors.text.secondary
                }
              />
            </TouchableOpacity>
            <View
              style={[
                styles.checkIcon,
                {
                  backgroundColor: set.isCompleted
                    ? "rgba(255, 255, 255, 0.2)"
                    : colors.tag.background,
                  borderColor: set.isCompleted
                    ? "rgba(255, 255, 255, 0.3)"
                    : colors.input.border,
                },
              ]}
            >
              {set.isCompleted && (
                <Ionicons
                  name="checkmark"
                  size={24}
                  color={colors.primarySurface}
                />
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  setCard: {
    borderRadius: 12,
    borderWidth: 2,
  },
  setCardTouchable: {
    padding: 16,
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
  setActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  checkIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
});
