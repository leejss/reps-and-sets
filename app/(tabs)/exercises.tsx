import { FloatingActionButton } from "@/components/floating-action-button";
import { useColor } from "@/constants/colors";
import { useApp } from "@/context/app-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ExercisesScreen() {
  const { exercises, deleteExercise } = useApp();
  const colors = useColor();

  const onNavigateToRegister = () => {
    router.push("/exercise-register");
  };

  const handleEdit = (exerciseId: string) => {
    router.push(`/exercise-register?id=${exerciseId}`);
  };

  const handleDelete = (exerciseId: string, exerciseName: string) => {
    Alert.alert(
      "운동 삭제",
      `"${exerciseName}" 운동을 삭제하시겠습니까?`,
      [
        {
          text: "취소",
          style: "cancel",
        },
        {
          text: "삭제",
          style: "destructive",
          onPress: () => deleteExercise(exerciseId),
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.headerSurface }]}>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
          내 운동
        </Text>
        <Text style={[styles.headerSubtitle, { color: colors.text.secondary }]}>
          {exercises.length}개의 운동이 등록되었습니다.
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
            {/* Card Header with Action Buttons */}
            <View style={styles.cardHeader}>
              <Text style={[styles.exerciseName, { color: colors.text.primary }]}>
                {exercise.name}
              </Text>
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  onPress={() => handleEdit(exercise.id)}
                  style={[
                    styles.actionButton,
                    { backgroundColor: colors.iconButton.background },
                  ]}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="pencil"
                    size={16}
                    color={colors.text.secondary}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDelete(exercise.id, exercise.name)}
                  style={[
                    styles.actionButton,
                    { backgroundColor: colors.iconButton.background },
                  ]}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="trash-outline"
                    size={16}
                    color={colors.status.error}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <Text
              style={[
                styles.exerciseDescription,
                { color: colors.text.secondary },
              ]}
            >
              {exercise.description || "설명이 없습니다"}
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
                <Text style={[styles.tagText, { color: colors.tag.text }]}>
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
                    style={[styles.tagText, { color: colors.tag.tutorialText }]}
                  >
                    링크 있음
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
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
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
