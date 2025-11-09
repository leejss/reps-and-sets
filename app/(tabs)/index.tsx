import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useApp } from "@/context/app-context";

export default function HomeScreen() {
  const { todayWorkouts, toggleWorkoutComplete, darkMode } = useApp();
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const navigateToRegister = () => {
    router.push("/workout-register");
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
          { backgroundColor: darkMode ? "#0B0C10" : "#FFFFFF" },
        ]}
      >
        <Text
          style={[
            styles.headerTitle,
            { color: darkMode ? "#FFFFFF" : "#0B0C10" },
          ]}
        >
          Reps and Set
        </Text>
        <Text style={[styles.headerDate, { color: darkMode ? "#9CA3AF" : "#4B5563" }]}>
          {today}
        </Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Text
          style={[
            styles.sectionTitle,
            { color: darkMode ? "#FFFFFF" : "#0B0C10" },
          ]}
        >
          Today&apos;s Workout List
        </Text>

        {todayWorkouts.length === 0 ? (
          <View
            style={[
              styles.emptyCard,
              {
                backgroundColor: darkMode ? "#1F2937" : "#F9FAFB",
                borderColor: darkMode ? "#374151" : "#E5E7EB",
              },
            ]}
          >
            <Text style={[styles.emptyText, { color: darkMode ? "#9CA3AF" : "#4B5563" }]}>
              No workouts scheduled for today.
            </Text>
            <Text
              style={[styles.emptySubtext, { color: darkMode ? "#6B7280" : "#6B7280" }]}
            >
              Tap the + button to add exercises
            </Text>
          </View>
        ) : (
          <View style={styles.workoutList}>
            {todayWorkouts.map((workout) => (
              <View
                key={workout.id}
                style={[
                  styles.workoutCard,
                  {
                    backgroundColor: darkMode ? "#1F2937" : "#FFFFFF",
                    borderColor: darkMode ? "#374151" : "#E5E7EB",
                    opacity: workout.completed ? 0.6 : 1,
                  },
                ]}
              >
                <View style={styles.workoutCardContent}>
                  <View style={styles.workoutInfo}>
                    <Text
                      style={[
                        styles.workoutName,
                        {
                          color: darkMode ? "#FFFFFF" : "#0B0C10",
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
                        { color: darkMode ? "#9CA3AF" : "#4B5563" },
                      ]}
                    >
                      {workout.sets} sets × {workout.reps} reps
                      {workout.weight && ` @ ${workout.weight}kg`}
                    </Text>
                    <View
                      style={[
                        styles.muscleGroupTag,
                        {
                          backgroundColor: darkMode ? "#374151" : "#F3F4F6",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.muscleGroupText,
                          { color: darkMode ? "#9CA3AF" : "#4B5563" },
                        ]}
                      >
                        {workout.muscleGroup}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => toggleWorkoutComplete(workout.id)}
                    style={[
                      styles.checkButton,
                      {
                        backgroundColor: workout.completed
                          ? "#00FFC6"
                          : darkMode
                          ? "#374151"
                          : "#F3F4F6",
                        borderColor: workout.completed
                          ? "#00FFC6"
                          : darkMode
                          ? "#4B5563"
                          : "#D1D5DB",
                      },
                    ]}
                    activeOpacity={0.7}
                  >
                    {workout.completed && (
                      <Ionicons name="checkmark" size={20} color="#0B0C10" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={navigateToRegister}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#0B0C10" />
      </TouchableOpacity>
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
  fab: {
    position: "absolute",
    bottom: 96,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#00FFC6",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
