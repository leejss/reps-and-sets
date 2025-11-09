import { useApp } from "@/context/app-context";

/**
 * Base Tokens - 기본 색상 팔레트
 * 모든 semantic token은 이 base token을 참조합니다.
 */
const BaseColors = {
  // Brand colors - Violet (에너지와 활력을 상징)
  violet: {
    400: "#A78BFA",
    500: "#8B5CF6",
    600: "#7C3AED",
  },

  // Grayscale
  gray: {
    50: "#F9FAFB",
    100: "#F3F4F6",
    200: "#E5E7EB",
    300: "#D1D5DB",
    400: "#9CA3AF",
    500: "#6B7280",
    600: "#4B5563",
    700: "#374151",
    800: "#1F2937",
    900: "#111827",
  },

  // Dark mode backgrounds
  dark: {
    900: "#0B0C10",
    800: "#16171c",
  },

  // Red (status)
  red: {
    600: "#DC2626",
    500: "#EF4444",
  },

  // Base colors
  white: "#FFFFFF",
  black: "#000000",
} as const;

/**
 * Semantic Tokens - 용도별 색상
 * Base token을 참조하여 의미있는 이름으로 정의합니다.
 */
export const Colors = {
  // Primary brand color
  primary: BaseColors.violet[500],
  primaryHover: BaseColors.violet[600],

  // Background colors
  background: {
    light: BaseColors.gray[50],
    dark: BaseColors.dark[900],
  },

  // Surface colors (cards, modals, etc.)
  surface: {
    light: BaseColors.white,
    dark: BaseColors.gray[800],
  },

  // Header surface colors
  headerSurface: {
    light: BaseColors.white,
    dark: BaseColors.dark[900],
  },

  // Border colors
  border: {
    light: BaseColors.gray[200],
    dark: BaseColors.gray[700],
  },

  // Text colors
  text: {
    primary: {
      light: BaseColors.dark[900],
      dark: BaseColors.white,
    },
    secondary: {
      light: BaseColors.gray[600],
      dark: BaseColors.gray[400],
    },
    tertiary: {
      light: BaseColors.gray[500],
      dark: BaseColors.gray[500],
    },
    label: {
      light: BaseColors.gray[700],
      dark: BaseColors.gray[300],
    },
  },

  // Input colors
  input: {
    background: {
      light: BaseColors.white,
      dark: BaseColors.gray[800],
    },
    border: {
      light: BaseColors.gray[300],
      dark: BaseColors.gray[700],
    },
    placeholder: {
      light: BaseColors.gray[400],
      dark: BaseColors.gray[500],
    },
  },

  // Tab bar colors
  tabBar: {
    background: {
      light: BaseColors.white,
      dark: BaseColors.dark[800],
    },
    active: BaseColors.violet[500],
    inactive: {
      light: BaseColors.gray[600],
      dark: BaseColors.gray[400],
    },
  },

  // Status colors
  status: {
    error: {
      light: BaseColors.red[600],
      dark: BaseColors.red[500],
    },
    success: BaseColors.violet[500],
  },

  // Button colors
  button: {
    primary: {
      background: BaseColors.violet[500],
      text: BaseColors.white,
      hover: BaseColors.violet[600],
    },
    secondary: {
      background: {
        light: BaseColors.gray[100],
        dark: BaseColors.gray[700],
      },
      text: {
        light: BaseColors.gray[700],
        dark: BaseColors.gray[300],
      },
    },
  },

  // Shadow colors
  shadow: BaseColors.black,

  // Avatar background
  avatar: {
    light: "rgba(139, 92, 246, 0.2)",
    dark: "rgba(139, 92, 246, 0.3)",
  },

  // Tag colors
  tag: {
    background: {
      light: BaseColors.gray[100],
      dark: BaseColors.gray[700],
    },
    text: {
      light: BaseColors.gray[600],
      dark: BaseColors.gray[400],
    },
    tutorial: {
      light: "rgba(139, 92, 246, 0.15)",
      dark: "rgba(139, 92, 246, 0.2)",
    },
    tutorialText: {
      light: BaseColors.violet[600],
      dark: BaseColors.violet[400],
    },
  },
} as const;

// Helper function to get color based on theme (deprecated - use useColor hook instead)
export const getColor = (
  colorSet: { light: string; dark: string },
  isDark: boolean,
) => (isDark ? colorSet.dark : colorSet.light);

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
    headerSurface: darkMode
      ? Colors.headerSurface.dark
      : Colors.headerSurface.light,

    // Border colors
    border: darkMode ? Colors.border.dark : Colors.border.light,

    // Text colors
    text: {
      primary: darkMode ? Colors.text.primary.dark : Colors.text.primary.light,
      secondary: darkMode
        ? Colors.text.secondary.dark
        : Colors.text.secondary.light,
      tertiary: darkMode
        ? Colors.text.tertiary.dark
        : Colors.text.tertiary.light,
      label: darkMode ? Colors.text.label.dark : Colors.text.label.light,
    },

    // Input colors
    input: {
      background: darkMode
        ? Colors.input.background.dark
        : Colors.input.background.light,
      border: darkMode ? Colors.input.border.dark : Colors.input.border.light,
      placeholder: darkMode
        ? Colors.input.placeholder.dark
        : Colors.input.placeholder.light,
    },

    // Tab bar colors
    tabBar: {
      background: darkMode
        ? Colors.tabBar.background.dark
        : Colors.tabBar.background.light,
      active: Colors.tabBar.active,
      inactive: darkMode
        ? Colors.tabBar.inactive.dark
        : Colors.tabBar.inactive.light,
    },

    // Status colors
    status: {
      error: darkMode ? Colors.status.error.dark : Colors.status.error.light,
      success: Colors.status.success,
    },

    // Button colors
    button: {
      primary: {
        background: Colors.button.primary.background,
        text: Colors.button.primary.text,
        hover: Colors.button.primary.hover,
      },
      secondary: {
        background: darkMode
          ? Colors.button.secondary.background.dark
          : Colors.button.secondary.background.light,
        text: darkMode
          ? Colors.button.secondary.text.dark
          : Colors.button.secondary.text.light,
      },
    },

    // Shadow
    shadow: Colors.shadow,

    // Avatar
    avatar: darkMode ? Colors.avatar.dark : Colors.avatar.light,

    // Tag colors
    tag: {
      background: darkMode
        ? Colors.tag.background.dark
        : Colors.tag.background.light,
      text: darkMode ? Colors.tag.text.dark : Colors.tag.text.light,
      tutorial: darkMode ? Colors.tag.tutorial.dark : Colors.tag.tutorial.light,
      tutorialText: darkMode
        ? Colors.tag.tutorialText.dark
        : Colors.tag.tutorialText.light,
    },
  };
};
