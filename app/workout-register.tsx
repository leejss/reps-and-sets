import { WorkoutRegisterProvider } from "@/components/workout-register/context";
import { ExerciseSelector } from "@/components/workout-register/exercise-selector";
import { WorkoutRegisterFooter } from "@/components/workout-register/footer";
import { SetConfiguration } from "@/components/workout-register/set-configuration";
import { useColor } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

function WorkoutRegisterContent() {
  const colors = useColor();

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
        <ExerciseSelector />
        <SetConfiguration />
      </ScrollView>

      {/* Bottom Button */}
      <WorkoutRegisterFooter />
    </View>
  );
}

export default function WorkoutRegisterScreen() {
  return (
    <WorkoutRegisterProvider>
      <WorkoutRegisterContent />
    </WorkoutRegisterProvider>
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
});
