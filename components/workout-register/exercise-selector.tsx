import { useColor } from "@/constants/colors";
import { useDataStore } from "@/stores/data-store";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useWorkoutRegister } from "./context";

export function ExerciseSelector() {
  const exercises = useDataStore((state) => state.exercises);
  const colors = useColor();
  const { selectedExerciseId, setSelectedExerciseId } = useWorkoutRegister();

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
        운동 선택
      </Text>

      <View style={styles.exerciseList}>
        {exercises.map((exercise) => (
          <TouchableOpacity
            key={exercise.id}
            style={[
              styles.exerciseCard,
              {
                backgroundColor: colors.surface,
                borderColor:
                  selectedExerciseId === exercise.id
                    ? colors.primary
                    : colors.border,
                borderWidth: selectedExerciseId === exercise.id ? 2 : 1,
              },
            ]}
            onPress={() => setSelectedExerciseId(exercise.id)}
            activeOpacity={0.7}
          >
            <View style={styles.exerciseCardContent}>
              <View style={styles.exerciseInfo}>
                <Text
                  style={[styles.exerciseName, { color: colors.text.primary }]}
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
              <View
                style={[
                  styles.radioButton,
                  {
                    borderColor:
                      selectedExerciseId === exercise.id
                        ? colors.primary
                        : colors.input.border,
                    backgroundColor:
                      selectedExerciseId === exercise.id
                        ? colors.primary
                        : "transparent",
                  },
                ]}
              >
                {selectedExerciseId === exercise.id && (
                  <View style={styles.radioButtonInner} />
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
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
    backgroundColor: "#0B0C10",
  },
});
