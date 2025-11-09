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

export default function ExercisesScreen() {
  const { exercises, darkMode } = useApp();

  const onNavigateToRegister = () => {
    router.push("/exercise-register");
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
          My Exercises
        </Text>
        <Text style={[styles.headerSubtitle, { color: darkMode ? "#9CA3AF" : "#4B5563" }]}>
          {exercises.length} exercise{exercises.length !== 1 ? "s" : ""} registered
        </Text>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        {exercises.map((exercise) => (
          <View
            key={exercise.id}
            style={[
              styles.exerciseCard,
              {
                backgroundColor: darkMode ? "#1F2937" : "#FFFFFF",
                borderColor: darkMode ? "#374151" : "#E5E7EB",
              },
            ]}
          >
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
                styles.exerciseDescription,
                { color: darkMode ? "#9CA3AF" : "#4B5563" },
              ]}
            >
              {exercise.description || "No description"}
            </Text>
            <View style={styles.tagContainer}>
              <View
                style={[
                  styles.tag,
                  {
                    backgroundColor: darkMode ? "#374151" : "#F3F4F6",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.tagText,
                    { color: darkMode ? "#9CA3AF" : "#4B5563" },
                  ]}
                >
                  {exercise.muscleGroup}
                </Text>
              </View>
              {exercise.link && (
                <View
                  style={[
                    styles.tag,
                    {
                      backgroundColor: darkMode
                        ? "rgba(0, 255, 198, 0.1)"
                        : "rgba(0, 255, 198, 0.2)",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.tagText,
                      { color: darkMode ? "#00FFC6" : "#0B0C10" },
                    ]}
                  >
                    Has tutorial
                  </Text>
                </View>
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={onNavigateToRegister}
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
  headerSubtitle: {
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
  exerciseCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  exerciseDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  tagContainer: {
    flexDirection: "row",
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
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
