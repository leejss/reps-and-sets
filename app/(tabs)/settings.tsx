import { useColor } from "@/constants/colors";
import { useApp } from "@/context/app-context";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function SettingsScreen() {
  const { user, darkMode, toggleDarkMode, logout } = useApp();
  const colors = useColor();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.headerSurface }]}>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
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
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.profileContent}>
            <View
              style={[
                styles.avatar,
                {
                  backgroundColor: colors.avatar,
                },
              ]}
            >
              <Ionicons name="person" size={32} color={colors.primary} />
            </View>
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: colors.text.primary }]}>
                {user.name}
              </Text>
              <Text
                style={[styles.userEmail, { color: colors.text.secondary }]}
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
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.settingContent}>
              <View style={styles.settingInfo}>
                <Ionicons
                  name={darkMode ? "moon" : "sunny"}
                  size={20}
                  color={colors.primary}
                  style={styles.settingIcon}
                />
                <View>
                  <Text
                    style={[
                      styles.settingTitle,
                      { color: colors.text.primary },
                    ]}
                  >
                    Dark Mode
                  </Text>
                  <Text
                    style={[
                      styles.settingSubtitle,
                      { color: colors.text.secondary },
                    ]}
                  >
                    {darkMode ? "Enabled" : "Disabled"}
                  </Text>
                </View>
              </View>
              <Switch
                value={darkMode}
                onValueChange={toggleDarkMode}
                trackColor={{
                  false: colors.input.border,
                  true: colors.primary,
                }}
                thumbColor={
                  darkMode ? colors.text.primary : colors.tag.background
                }
              />
            </View>
          </View>

          {/* Edit Profile Button */}
          <TouchableOpacity
            style={[
              styles.settingCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
            activeOpacity={0.7}
          >
            <View style={styles.settingButton}>
              <Ionicons
                name="person-outline"
                size={20}
                color={colors.text.secondary}
                style={styles.settingIcon}
              />
              <Text
                style={[styles.settingTitle, { color: colors.text.primary }]}
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
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
            activeOpacity={0.7}
          >
            <View style={styles.settingInfoRow}>
              <View style={styles.settingButton}>
                <Ionicons
                  name="information-circle-outline"
                  size={20}
                  color={colors.text.secondary}
                  style={styles.settingIcon}
                />
                <Text
                  style={[styles.settingTitle, { color: colors.text.primary }]}
                >
                  App Info
                </Text>
              </View>
              <Text
                style={[styles.versionText, { color: colors.text.secondary }]}
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
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
            onPress={logout}
            activeOpacity={0.7}
          >
            <Ionicons
              name="log-out-outline"
              size={20}
              color={colors.status.error}
              style={styles.settingIcon}
            />
            <Text style={[styles.logoutText, { color: colors.status.error }]}>
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
