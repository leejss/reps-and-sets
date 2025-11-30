import { useColor } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTodayExerciseRegister } from "./context";

export function SetConfiguration() {
  const colors = useColor();
  const {
    selectedExerciseId,
    numberOfSets,
    setNumberOfSets,
    workoutSetList,
    useUniformValues,
    setUseUniformValues,
    uniformReps,
    setUniformReps,
    uniformWeight,
    setUniformWeight,
    handleSetDetailChange,
  } = useTodayExerciseRegister();

  if (!selectedExerciseId) {
    return null;
  }

  return (
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
                borderColor: useUniformValues ? colors.primary : colors.border,
              },
            ]}
            onPress={() => setUseUniformValues(!useUniformValues)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={useUniformValues ? "checkbox" : "square-outline"}
              size={20}
              color={
                useUniformValues ? colors.text.primary : colors.text.secondary
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
                <Text style={[styles.label, { color: colors.text.label }]}>
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
                <Text style={[styles.label, { color: colors.text.label }]}>
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
                style={[styles.subsectionTitle, { color: colors.text.primary }]}
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
                    style={[styles.setLabel, { color: colors.text.primary }]}
                  >
                    {index + 1} 세트
                  </Text>
                  <View style={styles.setInputRow}>
                    <View style={styles.halfInput}>
                      <Text
                        style={[
                          styles.smallLabel,
                          { color: colors.text.label },
                        ]}
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
                        무게 (kg)
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
  );
}

const styles = StyleSheet.create({
  detailsSection: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
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
});
