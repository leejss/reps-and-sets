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

const muscleGroups = [
  "Chest",
  "Back",
  "Legs",
  "Shoulders",
  "Arms",
  "Core",
  "Cardio",
  "Full Body",
];

export default function ExerciseRegisterScreen() {
  const { addExercise, darkMode } = useApp();
  const [name, setName] = useState("");
  const [muscleGroup, setMuscleGroup] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");

  const handleSubmit = () => {
    if (!name || !muscleGroup) {
      return;
    }

    addExercise({
      name,
      muscleGroup,
      description: description || undefined,
      link: link || undefined,
    });

    // Reset form and go back
    setName("");
    setMuscleGroup("");
    setDescription("");
    setLink("");
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
          Register New Exercise
        </Text>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.formSection}>
          <View style={styles.inputGroup}>
            <Text
              style={[
                styles.label,
                { color: darkMode ? "#D1D5DB" : "#374151" },
              ]}
            >
              Exercise Name *
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
              placeholder="e.g., Pull-ups"
              placeholderTextColor={darkMode ? "#6B7280" : "#9CA3AF"}
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text
              style={[
                styles.label,
                { color: darkMode ? "#D1D5DB" : "#374151" },
              ]}
            >
              Muscle Group *
            </Text>
            <View style={styles.muscleGroupGrid}>
              {muscleGroups.map((group) => (
                <TouchableOpacity
                  key={group}
                  style={[
                    styles.muscleGroupButton,
                    {
                      backgroundColor:
                        muscleGroup === group
                          ? "#00FFC6"
                          : darkMode
                          ? "#1F2937"
                          : "#FFFFFF",
                      borderColor:
                        muscleGroup === group
                          ? "#00FFC6"
                          : darkMode
                          ? "#374151"
                          : "#D1D5DB",
                    },
                  ]}
                  onPress={() => setMuscleGroup(group)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.muscleGroupButtonText,
                      {
                        color:
                          muscleGroup === group
                            ? "#0B0C10"
                            : darkMode
                            ? "#FFFFFF"
                            : "#0B0C10",
                      },
                    ]}
                  >
                    {group}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text
              style={[
                styles.label,
                { color: darkMode ? "#D1D5DB" : "#374151" },
              ]}
            >
              Description
            </Text>
            <TextInput
              style={[
                styles.textArea,
                {
                  backgroundColor: darkMode ? "#1F2937" : "#FFFFFF",
                  borderColor: darkMode ? "#374151" : "#D1D5DB",
                  color: darkMode ? "#FFFFFF" : "#0B0C10",
                },
              ]}
              placeholder="Brief description or notes..."
              placeholderTextColor={darkMode ? "#6B7280" : "#9CA3AF"}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text
              style={[
                styles.label,
                { color: darkMode ? "#D1D5DB" : "#374151" },
              ]}
            >
              Tutorial Link (Optional)
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
              placeholder="https://youtube.com/..."
              placeholderTextColor={darkMode ? "#6B7280" : "#9CA3AF"}
              value={link}
              onChangeText={setLink}
              keyboardType="url"
              autoCapitalize="none"
            />
          </View>
        </View>
      </ScrollView>

      {/* Bottom Button */}
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
            { opacity: !name || !muscleGroup ? 0.5 : 1 },
          ]}
          onPress={handleSubmit}
          disabled={!name || !muscleGroup}
          activeOpacity={0.8}
        >
          <Ionicons name="save" size={20} color="#0B0C10" />
          <Text style={styles.submitButtonText}>Save Exercise</Text>
        </TouchableOpacity>
      </View>
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
  },
  formSection: {
    gap: 24,
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
  muscleGroupGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  muscleGroupButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  muscleGroupButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  textArea: {
    minHeight: 100,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
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
