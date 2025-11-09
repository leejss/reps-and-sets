import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useApp } from "@/context/app-context";

export default function WorkoutRegisterScreen() {
  const { exercises, addTodayWorkout, darkMode } = useApp();
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const [reps, setReps] = useState("");
  const [sets, setSets] = useState("");
  const [weight, setWeight] = useState("");

  const selectedExercise = exercises.find((e) => e.id === selectedExerciseId);

  const handleSubmit = () => {
    if (!selectedExercise || !reps || !sets) {
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    addTodayWorkout({
      exerciseId: selectedExercise.id,
      exerciseName: selectedExercise.name,
      muscleGroup: selectedExercise.muscleGroup,
      reps: parseInt(reps),
      sets: parseInt(sets),
      weight: weight ? parseFloat(weight) : undefined,
      completed: false,
      date: today,
    });

    // Reset form and go back
    setSelectedExerciseId(null);
    setReps("");
    setSets("");
    setWeight("");
    router.back();
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: darkMode ? "#0B0C10" : "#F9FAFB" },
      ]}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: darkMode ? "#0B0C10" : "#FFFFFF",
            borderBottomColor: darkMode ? "#374151" : "#E5E7EB",
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={darkMode ? "#FFFFFF" : "#0B0C10"}
          />
        </TouchableOpacity>
        <Text
          style={[styles.headerTitle, { color: darkMode ? "#FFFFFF" : "#0B0C10" }]}
        >
          Register Today&apos;s Workout
        </Text>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        <Text
          style={[
            styles.sectionTitle,
            { color: darkMode ? "#FFFFFF" : "#0B0C10" },
          ]}
        >
          Select Exercise
        </Text>

        <View style={styles.exerciseList}>
          {exercises.map((exercise) => (
            <TouchableOpacity
              key={exercise.id}
              style={[
                styles.exerciseCard,
                {
                  backgroundColor: darkMode ? "#1F2937" : "#FFFFFF",
                  borderColor:
                    selectedExerciseId === exercise.id
                      ? "#00FFC6"
                      : darkMode
                      ? "#374151"
                      : "#E5E7EB",
                  borderWidth: selectedExerciseId === exercise.id ? 2 : 1,
                },
              ]}
              onPress={() => setSelectedExerciseId(exercise.id)}
              activeOpacity={0.7}
            >
              <View style={styles.exerciseCardContent}>
                <View style={styles.exerciseInfo}>
                  <Text
                    style={[
                      styles.exerciseName,
                      { color: darkMode ? "#FFFFFF" : "#0B0C10" },
                    ]}
                  >
                    {exercise.name}
                  </Text>
                  <Text
                    style={[
                      styles.exerciseMuscleGroup,
                      { color: darkMode ? "#9CA3AF" : "#4B5563" },
                    ]}
                  >
                    {exercise.muscleGroup}
                  </Text>
                </View>
                <View
                  style={[
                    styles.radioButton,
                    {
                      borderColor:
                        selectedExerciseId === exercise.id
                          ? "#00FFC6"
                          : darkMode
                          ? "#4B5563"
                          : "#D1D5DB",
                      backgroundColor:
                        selectedExerciseId === exercise.id ? "#00FFC6" : "transparent",
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

        {selectedExercise && (
          <View style={styles.detailsSection}>
            <Text
              style={[
                styles.sectionTitle,
                { color: darkMode ? "#FFFFFF" : "#0B0C10" },
              ]}
            >
              Workout Details
            </Text>

            <View style={styles.inputGroup}>
              <Text
                style={[
                  styles.label,
                  { color: darkMode ? "#D1D5DB" : "#374151" },
                ]}
              >
                Sets
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: darkMode ? "#1F2937" : "#FFFFFF",
                    borderColor: darkMode ? "#374151" : "#D1D5DB",
                    color: darkMode ? "#FFFFFF" : "#0B0C10",
                  },
                ]}
                placeholder="e.g., 3"
                placeholderTextColor={darkMode ? "#6B7280" : "#9CA3AF"}
                value={sets}
                onChangeText={setSets}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text
                style={[
                  styles.label,
                  { color: darkMode ? "#D1D5DB" : "#374151" },
                ]}
              >
                Reps
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: darkMode ? "#1F2937" : "#FFFFFF",
                    borderColor: darkMode ? "#374151" : "#D1D5DB",
                    color: darkMode ? "#FFFFFF" : "#0B0C10",
                  },
                ]}
                placeholder="e.g., 10"
                placeholderTextColor={darkMode ? "#6B7280" : "#9CA3AF"}
                value={reps}
                onChangeText={setReps}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text
                style={[
                  styles.label,
                  { color: darkMode ? "#D1D5DB" : "#374151" },
                ]}
              >
                Weight (kg) - Optional
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: darkMode ? "#1F2937" : "#FFFFFF",
                    borderColor: darkMode ? "#374151" : "#D1D5DB",
                    color: darkMode ? "#FFFFFF" : "#0B0C10",
                  },
                ]}
                placeholder="e.g., 60"
                placeholderTextColor={darkMode ? "#6B7280" : "#9CA3AF"}
                value={weight}
                onChangeText={setWeight}
                keyboardType="decimal-pad"
              />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Button */}
      {selectedExercise && (
        <View
          style={[
            styles.bottomBar,
            {
              backgroundColor: darkMode ? "#0B0C10" : "#FFFFFF",
              borderTopColor: darkMode ? "#374151" : "#E5E7EB",
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.submitButton,
              { opacity: !reps || !sets ? 0.5 : 1 },
            ]}
            onPress={handleSubmit}
            disabled={!reps || !sets}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={20} color="#0B0C10" />
            <Text style={styles.submitButtonText}>Add to Today&apos;s Workout</Text>
          </TouchableOpacity>
        </View>
      )}
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
    paddingVertical: 16,
    paddingTop: 48,
    borderBottomWidth: 1,
    gap: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -8,
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
    paddingVertical: 24,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
  },
  exerciseList: {
    gap: 12,
    marginBottom: 32,
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
  detailsSection: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
  },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  bottomBar: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  submitButton: {
    backgroundColor: "#00FFC6",
    height: 48,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  submitButtonText: {
    color: "#0B0C10",
    fontSize: 16,
    fontWeight: "600",
  },
});
