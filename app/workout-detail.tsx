import { EditSetModal } from "@/components/workout-detail/edit-set-modal";
import type {
  EditableField,
  EditingState,
} from "@/components/workout-detail/types";
import {
  getDisplayReps,
  getDisplayWeight,
} from "@/components/workout-detail/utils";
import { WorkoutInfoCard } from "@/components/workout-detail/workout-info-card";
import { WorkoutSetItem } from "@/components/workout-detail/workout-set-item";
import { useColor } from "@/constants/colors";
import {
  toggleSetComplete,
  toggleWorkoutComplete,
  updateSetDetails,
  useDataStore,
} from "@/stores/data-store";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function WorkoutDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const todaySessionExercises = useDataStore(
    (state) => state.todaySessionExercises,
  );
  const colors = useColor();
  const [editingState, setEditingState] = useState<EditingState>({
    index: null,
    reps: "",
    weight: "",
  });

  const currentSessionExercises = todaySessionExercises.find(
    (w) => w.id === id,
  );

  if (!currentSessionExercises) {
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

  const completedCount = currentSessionExercises.sets.filter(
    (s) => s.completed,
  ).length;

  const currentSetsCount = currentSessionExercises.sets.length;
  const progressPercentage =
    currentSetsCount === 0 ? 0 : (completedCount / currentSetsCount) * 100;

  const resetEditingState = () =>
    setEditingState({
      index: null,
      reps: "",
      weight: "",
    });

  const updateEditingField = (field: EditableField, value: string) => {
    setEditingState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEditSet = (index: number) => {
    const set = currentSessionExercises.sets[index];
    const reps = getDisplayReps(set);
    const weight = getDisplayWeight(set);
    setEditingState({
      index,
      reps: reps ?? "",
      weight: weight ?? "",
    });
  };

  const handleSaveEdit = async () => {
    if (editingState.index !== null && editingState.reps) {
      const reps = parseInt(editingState.reps, 10);
      const weight = editingState.weight
        ? parseFloat(editingState.weight)
        : undefined;
      try {
        await updateSetDetails(
          currentSessionExercises.id,
          editingState.index,
          reps,
          weight,
        );
        resetEditingState();
      } catch (error) {
        console.error("세트 수정 실패:", error);
      }
    }
  };

  const handleCancelEdit = () => {
    resetEditingState();
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
        <WorkoutInfoCard
          exerciseName={currentSessionExercises.exerciseName}
          targetMuscleGroup={currentSessionExercises.targetMuscleGroup}
          totalSets={currentSetsCount}
          completedSets={completedCount}
          progressPercentage={progressPercentage}
        />

        {/* Sets List */}
        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
          세트
        </Text>
        <View style={styles.setsList}>
          {currentSessionExercises.sets.map((set, index) => (
            <WorkoutSetItem
              key={`${currentSessionExercises.id}-${index}`}
              index={index}
              set={set}
              onEdit={() => handleEditSet(index)}
              onToggle={async () => {
                try {
                  await toggleSetComplete(currentSessionExercises.id, index);
                } catch (error) {
                  console.error("세트 완료 토글 실패:", error);
                }
              }}
            />
          ))}
        </View>

        <TouchableOpacity
          onPress={async () => {
            try {
              await toggleWorkoutComplete(currentSessionExercises.id);
            } catch (error) {
              console.error("운동 완료 토글 실패:", error);
            }
          }}
          style={[
            styles.completeButton,
            {
              backgroundColor: currentSessionExercises.completed
                ? colors.tag.background
                : colors.primary,
              borderColor: currentSessionExercises.completed
                ? colors.input.border
                : colors.primary,
            },
          ]}
          activeOpacity={0.8}
        >
          <Text
            style={[styles.completeButtonText, { color: colors.text.primary }]}
          >
            {currentSessionExercises.completed ? "초기화" : "모든 세트 완료"}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <EditSetModal
        visible={editingState.index !== null}
        editingState={editingState}
        onUpdateField={updateEditingField}
        onSave={handleSaveEdit}
        onCancel={handleCancelEdit}
      />
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  setsList: {
    gap: 12,
    marginBottom: 24,
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
