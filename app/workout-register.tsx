import { useColor } from "@/constants/colors";
import { formatLocalDateISO } from "@/lib/date";
import { addTodaySessionExercise, useDataStore } from "@/stores/data-store";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
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

export default function WorkoutRegisterScreen() {
  const insets = useSafeAreaInsets();
  const exercises = useDataStore((state) => state.exercises);
  const colors = useColor();
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(
    null,
  );
  const [numberOfSets, setNumberOfSets] = useState("");
  const [workoutSetList, setWorkoutSetList] = useState<
    {
      setOrder: number;
      plannedReps?: number;
      plannedWeight?: number;
      completed: boolean;
    }[]
  >([]);
  const [useUniformValues, setUseUniformValues] = useState(true);
  const [uniformReps, setUniformReps] = useState("");
  const [uniformWeight, setUniformWeight] = useState("");

  const selectedExercise = exercises.find((e) => e.id === selectedExerciseId);

  useEffect(() => {
    const numSets = parseInt(numberOfSets);
    if (numSets > 0 && numSets <= 20) {
      setWorkoutSetList(
        Array.from({ length: numSets }, (_, index) => ({
          setOrder: index,
          plannedReps: 0,
          plannedWeight: undefined,
          completed: false,
        })),
      );
    } else {
      setWorkoutSetList([]);
    }
  }, [numberOfSets]);

  useEffect(() => {
    if (useUniformValues && workoutSetList.length > 0) {
      const reps = parseInt(uniformReps) || 0;
      const weight = uniformWeight ? parseFloat(uniformWeight) : undefined;
      setWorkoutSetList((prevDetails) =>
        prevDetails.map((set) => ({
          ...set,
          plannedReps: reps,
          plannedWeight: weight,
        })),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uniformReps, uniformWeight, useUniformValues]);

  const handleSetDetailChange = (
    index: number,
    field: "reps" | "weight",
    value: string,
  ) => {
    const newSetDetails = [...workoutSetList];
    if (field === "reps") {
      newSetDetails[index].plannedReps = parseInt(value) || 0;
    } else {
      newSetDetails[index].plannedWeight = value
        ? parseFloat(value)
        : undefined;
    }
    setWorkoutSetList(newSetDetails);
  };

  const handleSubmit = async () => {
    if (!selectedExercise || workoutSetList.length === 0) {
      return;
    }

    // 최소한 하나의 세트에 reps가 입력되어야 함
    const hasValidSet = workoutSetList.some(
      (set) => (set.plannedReps ?? 0) > 0,
    );
    if (!hasValidSet) {
      return;
    }

    try {
      const today = formatLocalDateISO(new Date());
      await addTodaySessionExercise({
        exerciseId: selectedExercise.id,
        exerciseName: selectedExercise.name,
        targetMuscleGroup: selectedExercise.targetMuscleGroup,
        workoutSetList: workoutSetList.map((set, index) => ({
          id: undefined,
          setOrder: set.setOrder ?? index,
          plannedReps: set.plannedReps ?? 0,
          plannedWeight: set.plannedWeight ?? undefined,
          actualReps: null,
          actualWeight: null,
          completed: false,
        })),
        completed: false,
        date: today,
      });

      setSelectedExerciseId(null);
      setNumberOfSets("");
      setWorkoutSetList([]);
      setUniformReps("");
      setUniformWeight("");
      setUseUniformValues(true);
      router.back();
    } catch (error) {
      console.error("운동 추가 실패:", error);
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
          오늘의 운동 추가하기
        </Text>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
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

        {selectedExercise && (
          <View style={styles.detailsSection}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
              운동 상세 정보
            </Text>

            {/* 세트 수 입력 */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text.label }]}>
                세트 수
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
                placeholder="예: 3"
                placeholderTextColor={colors.input.placeholder}
                value={numberOfSets}
                onChangeText={setNumberOfSets}
                keyboardType="numeric"
              />
            </View>

            {/* 세트가 생성된 경우 */}
            {workoutSetList.length > 0 && (
              <>
                {/* 동일한 값 적용 토글 */}
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    {
                      backgroundColor: useUniformValues
                        ? colors.primary
                        : colors.surface,
                      borderColor: useUniformValues
                        ? colors.primary
                        : colors.border,
                    },
                  ]}
                  onPress={() => setUseUniformValues(!useUniformValues)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={useUniformValues ? "checkbox" : "square-outline"}
                    size={20}
                    color={
                      useUniformValues
                        ? colors.text.primary
                        : colors.text.secondary
                    }
                  />
                  <Text
                    style={[
                      styles.toggleText,
                      {
                        color: useUniformValues
                          ? colors.text.primary
                          : colors.text.secondary,
                      },
                    ]}
                  >
                    모든 세트에 동일한 값 적용
                  </Text>
                </TouchableOpacity>

                {/* 동일한 값 입력 모드 */}
                {useUniformValues ? (
                  <View style={styles.uniformInputs}>
                    <View style={styles.inputGroup}>
                      <Text
                        style={[styles.label, { color: colors.text.label }]}
                      >
                        반복 횟수 (Reps)
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
                        placeholder="예: 10"
                        placeholderTextColor={colors.input.placeholder}
                        value={uniformReps}
                        onChangeText={setUniformReps}
                        keyboardType="numeric"
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text
                        style={[styles.label, { color: colors.text.label }]}
                      >
                        무게 (kg) - 선택사항
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
                        placeholder="예: 60"
                        placeholderTextColor={colors.input.placeholder}
                        value={uniformWeight}
                        onChangeText={setUniformWeight}
                        keyboardType="decimal-pad"
                      />
                    </View>
                  </View>
                ) : (
                  /* 세트별 개별 입력 모드 */
                  <View style={styles.setsContainer}>
                    <Text
                      style={[
                        styles.subsectionTitle,
                        { color: colors.text.primary },
                      ]}
                    >
                      세트별 상세 정보
                    </Text>
                    {workoutSetList.map((set, index) => (
                      <View
                        key={index}
                        style={[
                          styles.setDetailCard,
                          {
                            backgroundColor: colors.surface,
                            borderColor: colors.border,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.setLabel,
                            { color: colors.text.primary },
                          ]}
                        >
                          Set {index + 1}
                        </Text>
                        <View style={styles.setInputRow}>
                          <View style={styles.halfInput}>
                            <Text
                              style={[
                                styles.smallLabel,
                                { color: colors.text.label },
                              ]}
                            >
                              Reps
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
                              placeholder="10"
                              placeholderTextColor={colors.input.placeholder}
                              value={
                                (set.plannedReps ?? 0) > 0
                                  ? String(set.plannedReps)
                                  : ""
                              }
                              onChangeText={(value) =>
                                handleSetDetailChange(index, "reps", value)
                              }
                              keyboardType="numeric"
                            />
                          </View>
                          <View style={styles.halfInput}>
                            <Text
                              style={[
                                styles.smallLabel,
                                { color: colors.text.label },
                              ]}
                            >
                              Weight (kg)
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
                              placeholder="60"
                              placeholderTextColor={colors.input.placeholder}
                              value={
                                set.plannedWeight !== undefined
                                  ? set.plannedWeight.toString()
                                  : ""
                              }
                              onChangeText={(value) =>
                                handleSetDetailChange(index, "weight", value)
                              }
                              keyboardType="decimal-pad"
                            />
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </>
            )}
          </View>
        )}
      </ScrollView>

      {/* Bottom Button */}
      {selectedExercise && (
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
                opacity:
                  workoutSetList.length === 0 ||
                  !workoutSetList.some((s) => (s.plannedReps ?? 0) > 0)
                    ? 0.5
                    : 1,
              },
            ]}
            onPress={handleSubmit}
            disabled={
              workoutSetList.length === 0 ||
              !workoutSetList.some((s) => (s.plannedReps ?? 0) > 0)
            }
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={20} color={colors.button.primary.text} />
            <Text
              style={[
                styles.submitButtonText,
                { color: colors.button.primary.text },
              ]}
            >
              오늘의 운동에 추가
            </Text>
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
  toggleButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    gap: 8,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: "600",
  },
  uniformInputs: {
    gap: 16,
  },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  setsContainer: {
    gap: 12,
  },
  setDetailCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  setLabel: {
    fontSize: 15,
    fontWeight: "600",
  },
  setInputRow: {
    flexDirection: "row",
    gap: 12,
  },
  halfInput: {
    flex: 1,
    gap: 8,
  },
  smallLabel: {
    fontSize: 13,
    fontWeight: "500",
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
