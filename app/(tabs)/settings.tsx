import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "@/context/app-context";

export default function SettingsScreen() {
  const { user, darkMode, toggleDarkMode, logout } = useApp();

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
          { backgroundColor: darkMode ? "#0B0C10" : "#FFFFFF" },
        ]}
      >
        <Text
          style={[
            styles.headerTitle,
            { color: darkMode ? "#FFFFFF" : "#0B0C10" },
          ]}
        >
          Settings
        </Text>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        {/* User Profile */}
        <View
          style={[
            styles.profileCard,
            {
              backgroundColor: darkMode ? "#1F2937" : "#FFFFFF",
              borderColor: darkMode ? "#374151" : "#E5E7EB",
            },
          ]}
        >
          <View style={styles.profileContent}>
            <View
              style={[
                styles.avatar,
                {
                  backgroundColor: darkMode
                    ? "rgba(0, 255, 198, 0.2)"
                    : "rgba(0, 255, 198, 0.3)",
                },
              ]}
            >
              <Ionicons name="person" size={32} color="#00FFC6" />
            </View>
            <View style={styles.userInfo}>
              <Text
                style={[
                  styles.userName,
                  { color: darkMode ? "#FFFFFF" : "#0B0C10" },
                ]}
              >
                {user.name}
              </Text>
              <Text
                style={[
                  styles.userEmail,
                  { color: darkMode ? "#9CA3AF" : "#4B5563" },
                ]}
              >
                {user.email}
              </Text>
            </View>
          </View>
        </View>

        {/* Settings Options */}
        <View style={styles.settingsSection}>
          {/* Dark Mode Toggle */}
          <View
            style={[
              styles.settingCard,
              {
                backgroundColor: darkMode ? "#1F2937" : "#FFFFFF",
                borderColor: darkMode ? "#374151" : "#E5E7EB",
              },
            ]}
          >
            <View style={styles.settingContent}>
              <View style={styles.settingInfo}>
                <Ionicons
                  name={darkMode ? "moon" : "sunny"}
                  size={20}
                  color="#00FFC6"
                  style={styles.settingIcon}
                />
                <View>
                  <Text
                    style={[
                      styles.settingTitle,
                      { color: darkMode ? "#FFFFFF" : "#0B0C10" },
                    ]}
                  >
                    Dark Mode
                  </Text>
                  <Text
                    style={[
                      styles.settingSubtitle,
                      { color: darkMode ? "#9CA3AF" : "#4B5563" },
                    ]}
                  >
                    {darkMode ? "Enabled" : "Disabled"}
                  </Text>
                </View>
              </View>
              <Switch
                value={darkMode}
                onValueChange={toggleDarkMode}
                trackColor={{ false: "#D1D5DB", true: "#00FFC6" }}
                thumbColor={darkMode ? "#FFFFFF" : "#F3F4F6"}
              />
            </View>
          </View>

          {/* Edit Profile Button */}
          <TouchableOpacity
            style={[
              styles.settingCard,
              {
                backgroundColor: darkMode ? "#1F2937" : "#FFFFFF",
                borderColor: darkMode ? "#374151" : "#E5E7EB",
              },
            ]}
            activeOpacity={0.7}
          >
            <View style={styles.settingButton}>
              <Ionicons
                name="person-outline"
                size={20}
                color={darkMode ? "#9CA3AF" : "#4B5563"}
                style={styles.settingIcon}
              />
              <Text
                style={[
                  styles.settingTitle,
                  { color: darkMode ? "#FFFFFF" : "#0B0C10" },
                ]}
              >
                Edit Profile
              </Text>
            </View>
          </TouchableOpacity>

          {/* App Info Button */}
          <TouchableOpacity
            style={[
              styles.settingCard,
              {
                backgroundColor: darkMode ? "#1F2937" : "#FFFFFF",
                borderColor: darkMode ? "#374151" : "#E5E7EB",
              },
            ]}
            activeOpacity={0.7}
          >
            <View style={styles.settingInfoRow}>
              <View style={styles.settingButton}>
                <Ionicons
                  name="information-circle-outline"
                  size={20}
                  color={darkMode ? "#9CA3AF" : "#4B5563"}
                  style={styles.settingIcon}
                />
                <Text
                  style={[
                    styles.settingTitle,
                    { color: darkMode ? "#FFFFFF" : "#0B0C10" },
                  ]}
                >
                  App Info
                </Text>
              </View>
              <Text
                style={[
                  styles.versionText,
                  { color: darkMode ? "#9CA3AF" : "#4B5563" },
                ]}
              >
                v1.0.0
              </Text>
            </View>
          </TouchableOpacity>

          {/* Logout Button */}
          <TouchableOpacity
            style={[
              styles.logoutButton,
              {
                backgroundColor: darkMode ? "#1F2937" : "#FFFFFF",
                borderColor: darkMode ? "#374151" : "#E5E7EB",
              },
            ]}
            onPress={logout}
            activeOpacity={0.7}
          >
            <Ionicons
              name="log-out-outline"
              size={20}
              color={darkMode ? "#EF4444" : "#DC2626"}
              style={styles.settingIcon}
            />
            <Text
              style={[
                styles.logoutText,
                { color: darkMode ? "#EF4444" : "#DC2626" },
              ]}
            >
              Log Out
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingBottom: 32,
  },
  profileCard: {
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  profileContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
  },
  settingsSection: {
    gap: 12,
  },
  settingCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  settingContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 44,
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingIcon: {
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  settingSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  settingButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 44,
  },
  versionText: {
    fontSize: 14,
  },
  logoutButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 56,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
