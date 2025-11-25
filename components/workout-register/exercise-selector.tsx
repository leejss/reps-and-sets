import { useColor } from "@/constants/colors";
import { useDataStore } from "@/stores/data-store";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useWorkoutRegister } from "./context";

export function ExerciseSelector() {
  const exercises = useDataStore((state) => state.exercises);
  const colors = useColor();
  const { selectedExerciseId, setSelectedExerciseId } = useWorkoutRegister();

  const toggleExercise = (exerciseId: string) => {
    if (selectedExerciseId === exerciseId) {
      setSelectedExerciseId(null);
    } else {
      setSelectedExerciseId(exerciseId);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
        운동 선택
      </Text>

      <View style={styles.exerciseList}>
        {exercises.map((exercise) => {
          const isSelected = selectedExerciseId === exercise.id;
          return (
            <TouchableOpacity
              key={exercise.id}
              style={[
                styles.exerciseCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: isSelected ? colors.primary : colors.border,
                  borderWidth: isSelected ? 2 : 1,
                },
              ]}
              onPress={() => toggleExercise(exercise.id)}
              activeOpacity={0.7}
            >
              <View style={styles.exerciseCardContent}>
                <View style={styles.exerciseInfo}>
                  <Text
                    style={[
                      styles.exerciseName,
                      { color: colors.text.primary },
                    ]}
                  >
                    {exercise.name}
                  </Text>
                  <Text
                    style={[
                      styles.exerciseMuscleGroup,
                      { color: colors.text.secondary },
                    ]}
                  >
                    {exercise.targetMuscleGroup}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {!selectedExerciseId && (
        <View style={styles.addExerciseSection}>
          <Text
            style={[styles.addExerciseTitle, { color: colors.text.secondary }]}
          >
            원하는 운동이 없으신가요?
          </Text>
          <Text
            style={[
              styles.addExerciseSubtitle,
              { color: colors.text.tertiary },
            ]}
          >
            아래 버튼을 눌러 추가해보세요
          </Text>
          <TouchableOpacity
            style={[
              styles.addExerciseButton,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            onPress={() => router.push("/exercise-register")}
            activeOpacity={0.7}
          >
            <Ionicons
              name="add-circle-outline"
              size={20}
              color={colors.primary}
            />
            <Text
              style={[styles.addExerciseButtonText, { color: colors.primary }]}
            >
              새로운 운동 추가하기
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
  },
  exerciseList: {
    gap: 12,
  },
  exerciseCard: {
    padding: 16,
    borderRadius: 12,
  },
  exerciseCardContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  exerciseMuscleGroup: {
    fontSize: 14,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  radioButtonInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#fff",
  },
  addExerciseSection: {
    marginTop: 24,
    alignItems: "center",
    paddingVertical: 16,
  },
  addExerciseTitle: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  addExerciseSubtitle: {
    fontSize: 13,
    marginBottom: 16,
  },
  addExerciseButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    borderWidth: 1,
  },
  addExerciseButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
