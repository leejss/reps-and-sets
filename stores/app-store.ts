import { create } from "zustand";
import { combine } from "zustand/middleware";

export const useAppStore = create(
  combine(
    {
      darkMode: true,
    },
    (set) => ({
      toggleDarkMode: () => {
        set((state) => ({ darkMode: !state.darkMode }));
      },
    }),
  ),
);
