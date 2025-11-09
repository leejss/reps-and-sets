import { useApp } from "@/context/app-context";

// Centralized color theme for the Reps and Set app
export const Colors = {
  // Primary brand color
  primary: "#00FFC6",
  primaryHover: "#00E6B3",
  
  // Background colors
  background: {
    light: "#F9FAFB",
    dark: "#0B0C10",
  },
  
  // Surface colors (cards, modals, etc.)
  surface: {
    light: "#FFFFFF",
    dark: "#1F2937",
  },
  
  // Header surface colors
  headerSurface: {
    light: "#FFFFFF",
    dark: "#0B0C10",
  },
  
  // Border colors
  border: {
    light: "#E5E7EB",
    dark: "#374151",
  },
  
  // Text colors
  text: {
    primary: {
      light: "#0B0C10",
      dark: "#FFFFFF",
    },
    secondary: {
      light: "#4B5563",
      dark: "#9CA3AF",
    },
    tertiary: {
      light: "#6B7280",
      dark: "#6B7280",
    },
    label: {
      light: "#374151",
      dark: "#D1D5DB",
    },
  },
  
  // Input colors
  input: {
    background: {
      light: "#FFFFFF",
      dark: "#1F2937",
    },
    border: {
      light: "#D1D5DB",
      dark: "#374151",
    },
    placeholder: {
      light: "#9CA3AF",
      dark: "#6B7280",
    },
  },
  
  // Tab bar colors
  tabBar: {
    background: {
      light: "#FFFFFF",
      dark: "#0B0C10",
    },
    active: "#00FFC6",
    inactive: {
      light: "#4B5563",
      dark: "#9CA3AF",
    },
  },
  
  // Status colors
  status: {
    error: {
      light: "#DC2626",
      dark: "#EF4444",
    },
    success: "#00FFC6",
  },
  
  // Shadow colors
  shadow: "#000000",
  
  // Avatar background
  avatar: {
    light: "rgba(0, 255, 198, 0.3)",
    dark: "rgba(0, 255, 198, 0.2)",
  },
  
  // Tag colors
  tag: {
    background: {
      light: "#F3F4F6",
      dark: "#374151",
    },
    text: {
      light: "#4B5563",
      dark: "#9CA3AF",
    },
    tutorial: {
      light: "rgba(0, 255, 198, 0.2)",
      dark: "rgba(0, 255, 198, 0.1)",
    },
    tutorialText: {
      light: "#0B0C10",
      dark: "#00FFC6",
    },
  },
};

// Helper function to get color based on theme (deprecated - use useColor hook instead)
export const getColor = (colorSet: { light: string; dark: string }, isDark: boolean) => 
  isDark ? colorSet.dark : colorSet.light;

// Hook to get themed colors based on current dark mode state
export const useColor = () => {
  const { darkMode } = useApp();
  
  return {
    // Primary brand color
    primary: Colors.primary,
    primaryHover: Colors.primaryHover,
    
    // Background colors
    background: darkMode ? Colors.background.dark : Colors.background.light,
    
    // Surface colors
    surface: darkMode ? Colors.surface.dark : Colors.surface.light,
    
    // Header surface
    headerSurface: darkMode ? Colors.headerSurface.dark : Colors.headerSurface.light,
    
    // Border colors
    border: darkMode ? Colors.border.dark : Colors.border.light,
    
    // Text colors
    text: {
      primary: darkMode ? Colors.text.primary.dark : Colors.text.primary.light,
      secondary: darkMode ? Colors.text.secondary.dark : Colors.text.secondary.light,
      tertiary: darkMode ? Colors.text.tertiary.dark : Colors.text.tertiary.light,
      label: darkMode ? Colors.text.label.dark : Colors.text.label.light,
    },
    
    // Input colors
    input: {
      background: darkMode ? Colors.input.background.dark : Colors.input.background.light,
      border: darkMode ? Colors.input.border.dark : Colors.input.border.light,
      placeholder: darkMode ? Colors.input.placeholder.dark : Colors.input.placeholder.light,
    },
    
    // Tab bar colors
    tabBar: {
      background: darkMode ? Colors.tabBar.background.dark : Colors.tabBar.background.light,
      active: Colors.tabBar.active,
      inactive: darkMode ? Colors.tabBar.inactive.dark : Colors.tabBar.inactive.light,
    },
    
    // Status colors
    status: {
      error: darkMode ? Colors.status.error.dark : Colors.status.error.light,
      success: Colors.status.success,
    },
    
    // Shadow
    shadow: Colors.shadow,
    
    // Avatar
    avatar: darkMode ? Colors.avatar.dark : Colors.avatar.light,
    
    // Tag colors
    tag: {
      background: darkMode ? Colors.tag.background.dark : Colors.tag.background.light,
      text: darkMode ? Colors.tag.text.dark : Colors.tag.text.light,
      tutorial: darkMode ? Colors.tag.tutorial.dark : Colors.tag.tutorial.light,
      tutorialText: darkMode ? Colors.tag.tutorialText.dark : Colors.tag.tutorialText.light,
    },
  };
};
