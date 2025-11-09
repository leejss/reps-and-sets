import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useApp } from "@/context/app-context";
import { useColor } from "@/constants/colors";
import { FloatingActionButton } from "@/components/floating-action-button";

export default function ExercisesScreen() {
  const { exercises } = useApp();
  const colors = useColor();

  const onNavigateToRegister = () => {
    router.push("/exercise-register");
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background },
      ]}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          { backgroundColor: colors.headerSurface },
        ]}
      >
        <Text
          style={[
            styles.headerTitle,
            { color: colors.text.primary },
          ]}
        >
          My Exercises
        </Text>
        <Text style={[styles.headerSubtitle, { color: colors.text.secondary }]}>
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
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
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
                styles.exerciseDescription,
                { color: colors.text.secondary },
              ]}
            >
              {exercise.description || "No description"}
            </Text>
            <View style={styles.tagContainer}>
              <View
                style={[
                  styles.tag,
                  {
                    backgroundColor: colors.tag.background,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.tagText,
                    { color: colors.tag.text },
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
                      backgroundColor: colors.tag.tutorial,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.tagText,
                      { color: colors.tag.tutorialText },
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
      <FloatingActionButton onPress={onNavigateToRegister} />
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
});
