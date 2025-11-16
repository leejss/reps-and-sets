import { useColor } from "@/constants/colors";
import { Exercise, SetDetail } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WeeklyWorkoutInput } from "../types";

const MIN_SETS = 1;
const MAX_SETS = 20;

type PlanWorkoutEditorProps = {
  visible: boolean;
  mode: "create" | "edit";
  dayLabel: string;
  exercises: Exercise[];
  initialValues?: WeeklyWorkoutInput;
  onClose: () => void;
  onSubmit: (payload: WeeklyWorkoutInput) => Promise<void> | void;
};

export const PlanWorkoutEditor = ({
  visible,
  mode,
  dayLabel,
  exercises,
  initialValues,
  onClose,
  onSubmit,
}: PlanWorkoutEditorProps) => {
  const colors = useColor();
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(
    null,
  );
  const [numberOfSets, setNumberOfSets] = useState("");
  const [setDetails, setSetDetails] = useState<SetDetail[]>([]);
  const [useUniformValues, setUseUniformValues] = useState(true);
  const [uniformReps, setUniformReps] = useState("");
  const [uniformWeight, setUniformWeight] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string | null>(null);

  const selectedExercise = exercises.find((e) => e.id === selectedExerciseId);
  const fallbackExercise = initialValues
    ? {
        id: initialValues.exerciseId,
        name: initialValues.exerciseName,
        muscleGroup: initialValues.muscleGroup,
      }
    : null;
  const activeExercise = selectedExercise ?? fallbackExercise;

  useEffect(() => {
    const numSets = parseInt(numberOfSets);
    if (numSets > 0 && numSets <= 20) {
      setSetDetails(
        Array.from({ length: numSets }, () => ({
          reps: 0,
          weight: undefined,
          completed: false,
        })),
      );
    } else {
      setSetDetails([]);
    }
  }, [numberOfSets]);

  useEffect(() => {
    if (useUniformValues && setDetails.length > 0) {
      const reps = parseInt(uniformReps) || 0;
      const weight = uniformWeight ? parseFloat(uniformWeight) : undefined;
      setSetDetails((prevDetails) =>
        prevDetails.map((set) => ({
          ...set,
          reps,
          weight,
        })),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uniformReps, uniformWeight, useUniformValues]);

  useEffect(() => {
    if (!visible) {
      setIsSubmitting(false);
      return;
    }

    if (initialValues) {
      setSelectedExerciseId(initialValues.exerciseId);
      setNumberOfSets(String(initialValues.setDetails.length));
      setSetDetails(initialValues.setDetails);
      setNote(initialValues.note ?? "");

      const allSame = initialValues.setDetails.every(
        (set, _, arr) =>
          set.reps === arr[0].reps && set.weight === arr[0].weight,
      );
      setUseUniformValues(allSame);
      if (allSame && initialValues.setDetails.length > 0) {
        setUniformReps(String(initialValues.setDetails[0].reps));
        setUniformWeight(
          initialValues.setDetails[0].weight !== undefined
            ? String(initialValues.setDetails[0].weight)
            : "",
        );
      }
      return;
    }

    setSelectedExerciseId(null);
    setNumberOfSets("");
    setSetDetails([]);
    setUseUniformValues(true);
    setUniformReps("");
    setUniformWeight("");
    setNote("");
  }, [visible, initialValues]);

  const handleSetDetailChange = (
    index: number,
    field: "reps" | "weight",
    value: string,
  ) => {
    const newSetDetails = [...setDetails];
    if (field === "reps") {
      newSetDetails[index].reps = parseInt(value) || 0;
    } else {
      newSetDetails[index].weight = value ? parseFloat(value) : undefined;
    }
    setSetDetails(newSetDetails);
  };

  const isValid =
    !!activeExercise &&
    setDetails.length > 0 &&
    setDetails.some((set) => set.reps > 0) &&
    !errors &&
    !isSubmitting;

  const handleSubmit = async () => {
    if (!isValid || !activeExercise || isSubmitting || errors) return;
    try {
      setIsSubmitting(true);
      await onSubmit({
        exerciseId: activeExercise.id,
        exerciseName: activeExercise.name,
        muscleGroup: activeExercise.muscleGroup,
        setDetails: setDetails,
        note: note.trim() ? note.trim() : undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView
        style={[styles.modalContainer, { backgroundColor: colors.background }]}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <View
            style={[
              styles.modalHeader,
              {
                borderBottomColor: colors.border,
                backgroundColor: colors.headerSurface,
              },
            ]}
          >
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={[styles.modalTitle, { color: colors.text.primary }]}>
                {dayLabel} 운동 {mode === "create" ? "추가" : "수정"}
              </Text>
              <Text
                style={[styles.modalSubtitle, { color: colors.text.secondary }]}
              >
                주간 계획에 기록할 운동을 구성하세요.
              </Text>
            </View>
          </View>

          <ScrollView contentContainerStyle={styles.modalContent}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
              운동 선택
            </Text>
            <View style={styles.exerciseList}>
              {exercises.length === 0 ? (
                <View
                  style={[
                    styles.emptyExerciseCard,
                    {
                      borderColor: colors.border,
                      backgroundColor: colors.surface,
                    },
                  ]}
                >
                  <Text style={{ color: colors.text.secondary }}>
                    등록된 운동이 없습니다. 설정에서 운동을 추가해주세요.
                  </Text>
                </View>
              ) : (
                exercises.map((exercise) => {
                  const isSelected = selectedExerciseId === exercise.id;
                  return (
                    <TouchableOpacity
                      key={exercise.id}
                      style={[
                        styles.exerciseCard,
                        {
                          backgroundColor: colors.surface,
                          borderColor: isSelected
                            ? colors.primary
                            : colors.border,
                          borderWidth: isSelected ? 2 : 1,
                        },
                      ]}
                      onPress={() => {
                        setSelectedExerciseId(exercise.id);
                      }}
                      activeOpacity={0.75}
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
                            {exercise.muscleGroup}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.exerciseRadio,
                            {
                              borderColor: isSelected
                                ? colors.primary
                                : colors.input.border,
                              backgroundColor: isSelected
                                ? colors.primary
                                : "transparent",
                            },
                          ]}
                        >
                          {isSelected && (
                            <View
                              style={[
                                styles.exerciseRadioInner,
                                { backgroundColor: colors.button.primary.text },
                              ]}
                            />
                          )}
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </View>

            {activeExercise && (
              <View style={styles.detailsSection}>
                {/* <View
                  style={[
                    styles.selectedExerciseBanner,
                    { backgroundColor: colors.tag.background },
                  ]}
                >
                  <Ionicons
                    name="fitness-outline"
                    size={16}
                    color={colors.text.secondary}
                  />
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.selectedExerciseTitle,
                        { color: colors.text.primary },
                      ]}
                    >
                      {activeExercise.name}
                    </Text>
                    <Text
                      style={[
                        styles.selectedExerciseSubtitle,
                        { color: colors.text.secondary },
                      ]}
                    >
                      {activeExercise.muscleGroup}
                      {selectedExercise ? "" : " (현재 운동 목록에 없음)"}
                    </Text>
                  </View>
                </View> */}

                <Text
                  style={[styles.sectionTitle, { color: colors.text.primary }]}
                >
                  운동 상세 정보
                </Text>

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
                    keyboardType="numeric"
                    onChangeText={(val) => {
                      const num = parseInt(val);
                      if (num < MIN_SETS || num > MAX_SETS) {
                        setErrors(
                          `세트 수는 ${MIN_SETS}에서 ${MAX_SETS} 사이여야 합니다.`,
                        );
                        return;
                      }

                      setNumberOfSets(val);
                    }}
                  />
                  {errors && (
                    <View>
                      <Text style={{ color: "red", marginTop: 4 }}>
                        {errors}
                      </Text>
                    </View>
                  )}
                </View>

                {setDetails.length > 0 && (
                  <>
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
                            ? colors.button.primary.text
                            : colors.text.secondary
                        }
                      />
                      <Text
                        style={[
                          styles.toggleText,
                          {
                            color: useUniformValues
                              ? colors.button.primary.text
                              : colors.text.secondary,
                          },
                        ]}
                      >
                        모든 세트에 동일한 값 적용
                      </Text>
                    </TouchableOpacity>

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
                            무게 (kg) - 선택 사항
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
                      <View style={styles.setsContainer}>
                        <Text
                          style={[
                            styles.subsectionTitle,
                            { color: colors.text.primary },
                          ]}
                        >
                          세트별 상세 정보
                        </Text>
                        {setDetails.map((set, index) => (
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
                                  placeholderTextColor={
                                    colors.input.placeholder
                                  }
                                  value={
                                    set.reps > 0 ? set.reps.toString() : ""
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
                                  placeholderTextColor={
                                    colors.input.placeholder
                                  }
                                  value={
                                    set.weight !== undefined
                                      ? set.weight.toString()
                                      : ""
                                  }
                                  onChangeText={(value) =>
                                    handleSetDetailChange(
                                      index,
                                      "weight",
                                      value,
                                    )
                                  }
                                  keyboardType="decimal-pad"
                                />
                              </View>
                            </View>
                          </View>
                        ))}
                      </View>
                    )}

                    <View style={styles.inputGroup}>
                      <Text
                        style={[styles.label, { color: colors.text.label }]}
                      >
                        메모 (선택 사항)
                      </Text>
                      <TextInput
                        style={[
                          styles.input,
                          styles.multilineInput,
                          {
                            backgroundColor: colors.input.background,
                            borderColor: colors.input.border,
                            color: colors.text.primary,
                          },
                        ]}
                        placeholder="주의사항이나 변형 동작을 기록하세요."
                        placeholderTextColor={colors.input.placeholder}
                        value={note}
                        onChangeText={setNote}
                        multiline
                        numberOfLines={3}
                        textAlignVertical="top"
                      />
                    </View>
                  </>
                )}
              </View>
            )}
          </ScrollView>

          <View
            style={[
              styles.modalFooter,
              {
                borderTopColor: colors.border,
                backgroundColor: colors.headerSurface,
              },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.modalSubmit,
                {
                  backgroundColor: colors.primary,
                  opacity: isValid && !isSubmitting ? 1 : 0.4,
                },
              ]}
              disabled={!isValid || isSubmitting}
              onPress={handleSubmit}
              activeOpacity={0.85}
            >
              {isSubmitting ? (
                <ActivityIndicator color={colors.button.primary.text} />
              ) : (
                <Ionicons
                  name="checkmark"
                  size={20}
                  color={colors.button.primary.text}
                />
              )}
              <Text
                style={[
                  styles.modalSubmitText,
                  { color: colors.button.primary.text },
                ]}
              >
                {mode === "create" ? "운동 등록" : "변경 사항 저장"}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  modalSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    gap: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  exerciseList: {
    gap: 12,
    marginBottom: 16,
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
  exerciseRadio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  exerciseRadioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  emptyExerciseCard: {
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  detailsSection: {
    gap: 16,
  },
  selectedExerciseBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 12,
  },
  selectedExerciseTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  selectedExerciseSubtitle: {
    fontSize: 13,
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
  setsContainer: {
    gap: 12,
  },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
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
  multilineInput: {
    height: 80,
    paddingTop: 12,
    paddingBottom: 12,
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  modalSubmit: {
    height: 48,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  modalSubmitText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
