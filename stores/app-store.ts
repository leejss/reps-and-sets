import { create } from "zustand";
import { combine } from "zustand/middleware";

export const useAppStore = create(
  combine(
    {
      darkMode: true,
    },
    (set) => ({
      /**
       * 다크 모드 토글
       */
      toggleDarkMode: () => {
        set((state) => ({ darkMode: !state.darkMode }));
      },
    }),
  ),
);
