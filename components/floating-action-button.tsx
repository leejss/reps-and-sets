import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, ViewStyle } from "react-native";

import { useColor } from "@/constants/colors";

interface FloatingActionButtonProps {
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  iconSize?: number;
  style?: ViewStyle;
  bottom?: number;
  right?: number;
}

export function FloatingActionButton({
  onPress,
  icon = "add",
  iconSize = 32,
  style,
  bottom = 96,
  right = 24,
}: FloatingActionButtonProps) {
  const colors = useColor();

  return (
    <TouchableOpacity
      style={[
        styles.fab,
        {
          backgroundColor: colors.primary,
          bottom,
          right,
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Ionicons name={icon} size={iconSize} color={colors.primarySurface} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
});
