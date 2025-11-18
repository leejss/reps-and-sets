import { useColor } from "@/constants/colors";
import type { WorkoutSet } from "@/lib/queries/workoutSets.query";
import { useAppStore } from "@/stores/app-store";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

export default function WorkoutDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const todayWorkouts = useAppStore((state) => state.todayExercises);
  const toggleSetComplete = useAppStore((state) => state.toggleSetComplete);
  const toggleWorkoutComplete = useAppStore(
    (state) => state.toggleWorkoutComplete,
  );
  const updateSetDetails = useAppStore((state) => state.updateSetDetails);

  const colors = useColor();
  const [editingSetIndex, setEditingSetIndex] = useState<number | null>(null);
  const [editReps, setEditReps] = useState("");
  const [editWeight, setEditWeight] = useState("");

  const getDisplayReps = (set: WorkoutSet): number | null => {
    if (set.actualReps != null) {
      return set.actualReps;
    }
    if (set.plannedReps != null) {
      return set.plannedReps;
    }
    return null;
  };

  const getDisplayWeight = (set: WorkoutSet): number | null => {
    if (set.actualWeight != null) {
      return set.actualWeight;
    }
    if (set.plannedWeight != null) {
      return set.plannedWeight;
    }
    return null;
  };

  const workout = todayWorkouts.find((w) => w.id === id);

  if (!workout) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
            Workout Not Found
          </Text>
        </View>
      </View>
    );
  }

  const completedCount = workout.workoutSetList.filter(
    (s) => s.completed,
  ).length;
  const totalSets = workout.workoutSetList.length;
  const progressPercentage =
    totalSets === 0 ? 0 : (completedCount / totalSets) * 100;

  const handleEditSet = (index: number) => {
    const set = workout.workoutSetList[index];
    const reps = getDisplayReps(set);
    const weight = getDisplayWeight(set);
    setEditReps(reps != null ? reps.toString() : "");
    setEditWeight(weight != null ? weight.toString() : "");
    setEditingSetIndex(index);
  };

  const handleSaveEdit = async () => {
    if (editingSetIndex !== null && editReps) {
      const reps = parseInt(editReps);
      const weight = editWeight ? parseFloat(editWeight) : undefined;
      try {
        await updateSetDetails(workout.id, editingSetIndex, reps, weight);
        setEditingSetIndex(null);
        setEditReps("");
        setEditWeight("");
      } catch (error) {
        console.error("세트 수정 실패:", error);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingSetIndex(null);
    setEditReps("");
    setEditWeight("");
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.headerSurface }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
          운동 상세
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
              {workout.targetMuscleGroup}
            </Text>
          </View>
          <Text style={[styles.workoutInfo, { color: colors.text.secondary }]}>
            총 {totalSets} 세트
          </Text>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressTextRow}>
              <Text
                style={[styles.progressText, { color: colors.text.secondary }]}
              >
                진행률
              </Text>
              <Text style={[styles.progressCount, { color: colors.primary }]}>
                {completedCount} / {totalSets} 세트
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
                    width: `${progressPercentage}%`,
                  },
                ]}
              />
            </View>
          </View>
        </View>

        {/* Sets List */}
        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
          세트
        </Text>
        <View style={styles.setsList}>
          {workout.workoutSetList.map((set, index) => (
            <View
              key={index}
              style={[
                styles.setCard,
                {
                  backgroundColor: set.completed
                    ? colors.primary
                    : colors.surface,
                  borderColor: set.completed ? colors.primary : colors.border,
                },
              ]}
            >
              <TouchableOpacity
                onPress={async () => {
                  try {
                    await toggleSetComplete(workout.id, index);
                  } catch (error) {
                    console.error("세트 완료 토글 실패:", error);
                  }
                }}
                style={styles.setCardTouchable}
                activeOpacity={0.7}
              >
                <View style={styles.setCardContent}>
                  <View style={styles.setInfo}>
                    <Text
                      style={[
                        styles.setNumber,
                        {
                          color: set.completed
                            ? colors.text.primary
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
                          color: set.completed
                            ? colors.text.primary
                            : colors.text.secondary,
                        },
                      ]}
                    >
                      {getDisplayReps(set) ?? 0} reps
                      {getDisplayWeight(set) != null &&
                        ` @ ${getDisplayWeight(set)}kg`}
                    </Text>
                  </View>
                  <View style={styles.setActions}>
                    <TouchableOpacity
                      onPress={() => handleEditSet(index)}
                      style={[
                        styles.editButton,
                        {
                          backgroundColor: set.completed
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
                          set.completed
                            ? colors.text.primary
                            : colors.text.secondary
                        }
                      />
                    </TouchableOpacity>
                    <View
                      style={[
                        styles.checkIcon,
                        {
                          backgroundColor: set.completed
                            ? "rgba(255, 255, 255, 0.2)"
                            : colors.tag.background,
                          borderColor: set.completed
                            ? "rgba(255, 255, 255, 0.3)"
                            : colors.input.border,
                        },
                      ]}
                    >
                      {set.completed && (
                        <Ionicons
                          name="checkmark"
                          size={24}
                          color={colors.text.primary}
                        />
                      )}
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Complete All Button */}
        <TouchableOpacity
          onPress={async () => {
            try {
              await toggleWorkoutComplete(workout.id);
            } catch (error) {
              console.error("운동 완료 토글 실패:", error);
            }
          }}
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
          <Text
            style={[styles.completeButtonText, { color: colors.text.primary }]}
          >
            {workout.completed ? "초기화" : "모든 세트 완료"}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* 편집 모달 */}
      <Modal
        visible={editingSetIndex !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancelEdit}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={handleCancelEdit}
        >
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.modalContent,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={[styles.modalTitle, { color: colors.text.primary }]}>
                Set {editingSetIndex !== null ? editingSetIndex + 1 : 0} 편집
              </Text>

              <View style={styles.modalInputGroup}>
                <Text style={[styles.modalLabel, { color: colors.text.label }]}>
                  반복 횟수 (Reps)
                </Text>
                <TextInput
                  style={[
                    styles.modalInput,
                    {
                      backgroundColor: colors.input.background,
                      borderColor: colors.input.border,
                      color: colors.text.primary,
                    },
                  ]}
                  placeholder="10"
                  placeholderTextColor={colors.input.placeholder}
                  value={editReps}
                  onChangeText={setEditReps}
                  keyboardType="numeric"
                  autoFocus
                />
              </View>

              <View style={styles.modalInputGroup}>
                <Text style={[styles.modalLabel, { color: colors.text.label }]}>
                  무게 (kg) - 선택사항
                </Text>
                <TextInput
                  style={[
                    styles.modalInput,
                    {
                      backgroundColor: colors.input.background,
                      borderColor: colors.input.border,
                      color: colors.text.primary,
                    },
                  ]}
                  placeholder="60"
                  placeholderTextColor={colors.input.placeholder}
                  value={editWeight}
                  onChangeText={setEditWeight}
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    styles.cancelButton,
                    {
                      backgroundColor: colors.tag.background,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={handleCancelEdit}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.modalButtonText,
                      { color: colors.text.secondary },
                    ]}
                  >
                    취소
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    styles.saveButton,
                    {
                      backgroundColor: colors.primary,
                    },
                  ]}
                  onPress={handleSaveEdit}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.modalButtonText,
                      { color: colors.text.primary },
                    ]}
                  >
                    저장
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    width: "80%",
    maxWidth: 400,
    alignSelf: "center",
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    gap: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  modalInputGroup: {
    gap: 8,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  modalInput: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    borderWidth: 1,
  },
  saveButton: {},
  modalButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
