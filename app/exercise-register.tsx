import { useColor } from "@/constants/colors";
import { useAppStore } from "@/stores/app-store";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const muscleGroups = [
  "가슴",
  "등",
  "하체",
  "어깨",
  "팔",
  "코어",
  "카디오",
  "전신",
];

export default function ExerciseRegisterScreen() {
  const addExercise = useAppStore((state) => state.addExercise);
  const updateExercise = useAppStore((state) => state.updateExercise);
  const exercises = useAppStore((state) => state.exercises);
  const colors = useColor();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string }>();
  const isEditMode = !!params.id;

  const [name, setName] = useState("");
  const [muscleGroup, setMuscleGroup] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");

  // 편집 모드인 경우 기존 데이터 로드
  useEffect(() => {
    if (isEditMode && params.id) {
      const exercise = exercises.find((e) => e.id === params.id);
      if (exercise) {
        setName(exercise.name);
        setMuscleGroup(exercise.targetMuscleGroup);
        setDescription(exercise.description || "");
        setLink(exercise.link || "");
      }
    }
  }, [isEditMode, params.id, exercises]);

  const handleSubmit = async () => {
    if (!name || !muscleGroup) {
      return;
    }

    try {
      if (isEditMode && params.id) {
        // 편집 모드: 기존 운동 업데이트
        await updateExercise(params.id, {
          name,
          targetMuscleGroup: muscleGroup,
          description: description || undefined,
          link: link || undefined,
        });
      } else {
        // 추가 모드: 새 운동 추가
        await addExercise({
          name,
          targetMuscleGroup: muscleGroup,
          description: description || undefined,
          link: link || undefined,
        });
      }

      router.back();
    } catch (error) {
      console.error("운동 저장 실패:", error);
      // 에러는 Context에서 이미 처리되었으므로 여기서는 로그만 남김
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.headerSurface,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
          {isEditMode ? "운동 수정하기" : "새로운 운동 추가하기"}
        </Text>
      </View>

      {/* Content */}
      <ScrollView
        style={{ ...styles.content }}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.formSection}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text.label }]}>
              운동 이름 *
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.input.background,
                  borderColor: colors.input.border,
                  color: colors.text.primary,
                },
              ]}
              placeholder="e.g., Pull-ups"
              placeholderTextColor={colors.input.placeholder}
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text.label }]}>
              운동 부위 *
            </Text>
            <View style={styles.muscleGroupGrid}>
              {muscleGroups.map((group) => (
                <TouchableOpacity
                  key={group}
                  style={[
                    styles.muscleGroupButton,
                    {
                      backgroundColor:
                        muscleGroup === group ? colors.primary : colors.surface,
                      borderColor:
                        muscleGroup === group ? colors.primary : colors.border,
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
                            ? colors.text.primary
                            : colors.text.primary,
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
            <Text style={[styles.label, { color: colors.text.label }]}>
              운동 설명
            </Text>
            <TextInput
              style={[
                styles.textArea,
                {
                  backgroundColor: colors.input.background,
                  borderColor: colors.input.border,
                  color: colors.text.primary,
                },
              ]}
              placeholder="Brief description or notes..."
              placeholderTextColor={colors.input.placeholder}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text.label }]}>
              링크 (선택)
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.input.background,
                  borderColor: colors.input.border,
                  color: colors.text.primary,
                },
              ]}
              placeholder="https://youtube.com/..."
              placeholderTextColor={colors.input.placeholder}
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
            backgroundColor: colors.headerSurface,
            borderTopColor: colors.border,
            paddingBottom: insets.bottom,
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.submitButton,
            {
              backgroundColor: colors.button.primary.background,
              opacity: !name || !muscleGroup ? 0.5 : 1,
            },
          ]}
          onPress={handleSubmit}
          disabled={!name || !muscleGroup}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.submitButtonText,
              { color: colors.button.primary.text },
            ]}
          >
            {isEditMode ? "수정 완료" : "운동 추가하기"}
          </Text>
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
    height: 48,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
