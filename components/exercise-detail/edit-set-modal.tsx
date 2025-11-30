import React from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import { useColor } from "@/constants/colors";
import type { EditableField, EditingState } from "./types";

type EditSetModalProps = {
  visible: boolean;
  editingState: EditingState;
  onUpdateField: (field: EditableField, value: string) => void;
  onSave: () => void;
  onCancel: () => void;
};

export const EditSetModal = ({
  visible,
  editingState,
  onUpdateField,
  onSave,
  onCancel,
}: EditSetModalProps) => {
  const colors = useColor();

  const currentSetNumber =
    editingState.index !== null ? editingState.index + 1 : 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onCancel}
      >
        <TouchableWithoutFeedback>
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.text.primary }]}>
              Set {currentSetNumber} 편집
            </Text>

            <View style={styles.modalInputGroup}>
              <Text style={[styles.modalLabel, { color: colors.text.label }]}>
                반복 횟수 (Reps)
              </Text>
              <TextInput
                style={[
                  styles.modalInput,
                  {
                    backgroundColor: colors.input.background,
                    borderColor: colors.input.border,
                    color: colors.text.primary,
                  },
                ]}
                placeholder="10"
                placeholderTextColor={colors.input.placeholder}
                value={editingState.reps}
                onChangeText={(text) => onUpdateField("reps", text)}
                keyboardType="numeric"
                autoFocus
              />
            </View>

            <View style={styles.modalInputGroup}>
              <Text style={[styles.modalLabel, { color: colors.text.label }]}>
                무게 (kg) - 선택사항
              </Text>
              <TextInput
                style={[
                  styles.modalInput,
                  {
                    backgroundColor: colors.input.background,
                    borderColor: colors.input.border,
                    color: colors.text.primary,
                  },
                ]}
                placeholder="60"
                placeholderTextColor={colors.input.placeholder}
                value={editingState.weight}
                onChangeText={(text) => onUpdateField("weight", text)}
                keyboardType="decimal-pad"
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.cancelButton,
                  {
                    backgroundColor: colors.tag.background,
                    borderColor: colors.border,
                  },
                ]}
                onPress={onCancel}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.modalButtonText,
                    { color: colors.text.secondary },
                  ]}
                >
                  취소
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.saveButton,
                  { backgroundColor: colors.primary },
                ]}
                onPress={onSave}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.modalButtonText,
                    { color: colors.text.primary },
                  ]}
                >
                  저장
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    width: "80%",
    maxWidth: 400,
    alignSelf: "center",
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    gap: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  modalInputGroup: {
    gap: 8,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  modalInput: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    borderWidth: 1,
  },
  saveButton: {},
  modalButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});

