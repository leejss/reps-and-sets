import { getWeekRange } from "@/lib/date";
import {
  buildEmptyPlan,
  createWeeklyPlanFromData,
} from "@/lib/weekly-plan/builders";
import type {
  WeeklyPlanExercise,
  WeeklyWorkoutInput,
} from "@/types/weekly-plan";
import type { StoreApi } from "zustand";
import type {
  DataStore,
  WeeklyPlanSliceActions,
  WeeklyPlanSliceState,
} from "../types";
import type { StoreHelpers } from "../utils";

export function createWeeklyPlanSlice(
  set: StoreApi<DataStore>["setState"],
  get: StoreApi<DataStore>["getState"],
  helpers: StoreHelpers,
): WeeklyPlanSliceState & WeeklyPlanSliceActions {
  return {
    weeklyPlan: buildEmptyPlan(new Date()),
    isLoadingWeeklyPlan: false,
    weeklyPlanError: null,
    isMutatingWeeklyPlan: false,

    loadWeeklyPlan: async (silent = false) => {
      if (!silent) {
        set({ isLoadingWeeklyPlan: true, weeklyPlanError: null });
      }

      const today = new Date();

      await helpers.execute(
        async (services) => {
          const range = getWeekRange(today);
          const { startISO, endISO } = range;

          const trainingDaysWithExercises =
            await services.weeklyPlan.loadWeekData(startISO, endISO);

          set({
            weeklyPlan: createWeeklyPlanFromData(
              range,
              trainingDaysWithExercises,
            ),
          });
        },
        {
          errorMessage: "주간 계획 로드 실패:",
          shouldThrow: false,
          onError: () => {
            if (!silent) {
              set({
                weeklyPlanError: "주간 계획을 불러오지 못했습니다.",
                weeklyPlan: buildEmptyPlan(today),
              });
            }
          },
          onFinally: () => {
            if (!silent) {
              set({ isLoadingWeeklyPlan: false });
            }
          },
        },
      );
    },

    addWorkout: async (trainingDate: string, workout: WeeklyWorkoutInput) => {
      set({ isMutatingWeeklyPlan: true });

      await helpers.execute(
        async (services) => {
          const weeklyPlan = get().weeklyPlan;
          const targetDay = weeklyPlan.sessionPlans.find(
            (day) => day.trainingDate === trainingDate,
          );

          if (!targetDay) {
            throw new Error("선택한 날짜 정보를 찾을 수 없습니다.");
          }

          const displayOrder = targetDay.exercises.length;
          const createdExercise = await services.weeklyPlan.addWorkout({
            trainingDate,
            workout,
            displayOrder,
          });

          const created: WeeklyPlanExercise = {
            ...createdExercise,
            note: workout.note,
          };

          set((prev) => {
            const nextSessionPlans = prev.weeklyPlan.sessionPlans.map((day) =>
              day.trainingDate === trainingDate
                ? { ...day, exercises: [...day.exercises, created] }
                : day,
            );

            return {
              weeklyPlan: {
                ...prev.weeklyPlan,
                sessionPlans: nextSessionPlans,
              },
            };
          });
        },
        {
          onFinally: () => set({ isMutatingWeeklyPlan: false }),
        },
      );
    },

    editWorkout: async (
      trainingDate: string,
      workoutId: string,
      payload: WeeklyWorkoutInput,
    ) => {
      set({ isMutatingWeeklyPlan: true });

      await helpers.execute(
        async (services) => {
          const weeklyPlan = get().weeklyPlan;
          const current = weeklyPlan.sessionPlans
            .flatMap((day) => day.exercises)
            .find((w) => w.id === workoutId);

          if (!current) {
            throw new Error("수정할 운동을 찾을 수 없습니다.");
          }

          const updatedExercise = await services.weeklyPlan.editWorkout({
            trainingDayId: current.trainingDayId,
            workoutId,
            payload,
          });

          const updated: WeeklyPlanExercise = {
            ...updatedExercise,
            note: payload.note ?? current.note,
          };

          set((prev) => {
            const nextSessionPlans = prev.weeklyPlan.sessionPlans.map((day) =>
              day.trainingDate === trainingDate
                ? {
                    ...day,
                    exercises: day.exercises.map((w) =>
                      w.id === workoutId ? updated : w,
                    ),
                  }
                : day,
            );

            return {
              weeklyPlan: {
                ...prev.weeklyPlan,
                sessionPlans: nextSessionPlans,
              },
            };
          });
        },
        {
          onFinally: () => set({ isMutatingWeeklyPlan: false }),
        },
      );
    },

    removeWorkout: async (trainingDate: string, workoutId: string) => {
      set({ isMutatingWeeklyPlan: true });

      await helpers.execute(
        async (services) => {
          await services.weeklyPlan.removeWorkout(workoutId);

          set((prev) => {
            const nextSessionPlans = prev.weeklyPlan.sessionPlans.map((day) =>
              day.trainingDate === trainingDate
                ? {
                    ...day,
                    exercises: day.exercises.filter((w) => w.id !== workoutId),
                  }
                : day,
            );

            return {
              weeklyPlan: {
                ...prev.weeklyPlan,
                sessionPlans: nextSessionPlans,
              },
            };
          });
        },
        {
          onFinally: () => set({ isMutatingWeeklyPlan: false }),
        },
      );
    },
  };
}
