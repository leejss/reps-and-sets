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
        async (repo) => {
          const range = getWeekRange(today);
          const { startISO, endISO } = range;

          const trainingDaysWithExercises =
            await repo.dayExercise.findByDateRange(startISO, endISO);

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
        async (repo) => {
          const weeklyPlan = get().weeklyPlan;
          const targetDay = weeklyPlan.sessionPlans.find(
            (day) => day.trainingDate === trainingDate,
          );

          if (!targetDay) {
            throw new Error("선택한 날짜 정보를 찾을 수 없습니다.");
          }

          const trainingDay = await repo.trainingDay.getOrCreate(trainingDate);
          const displayOrder = targetDay.exercises.length;

          const dayExercise = await repo.dayExercise.create({
            trainingDayId: trainingDay.id,
            exerciseId: workout.exerciseId,
            displayOrder,
          });

          await repo.exerciseSet.createMany(
            dayExercise.id,
            workout.setDetails.map((s) => ({
              reps: s.plannedReps ?? null,
              weight: s.plannedWeight ?? null,
            })),
          );

          const exercises = await repo.dayExercise.findByTrainingDayId(
            trainingDay.id,
          );
          const createdExercise = exercises.find(
            (e) => e.id === dayExercise.id,
          );

          if (!createdExercise) {
            throw new Error("생성된 운동 정보를 찾을 수 없습니다.");
          }

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
        async (repo) => {
          const weeklyPlan = get().weeklyPlan;
          const current = weeklyPlan.sessionPlans
            .flatMap((day) => day.exercises)
            .find((w) => w.id === workoutId);

          if (!current) {
            throw new Error("수정할 운동을 찾을 수 없습니다.");
          }

          await repo.dayExercise.update(workoutId, {
            exerciseId: payload.exerciseId,
          });

          await repo.exerciseSet.replaceAll(
            workoutId,
            payload.setDetails.map((s) => ({
              reps: s.plannedReps ?? null,
              weight: s.plannedWeight ?? null,
            })),
          );

          const exercises = await repo.dayExercise.findByTrainingDayId(
            current.trainingDayId,
          );
          const updatedExercise = exercises.find((e) => e.id === workoutId);

          if (!updatedExercise) {
            throw new Error("수정된 운동을 찾을 수 없습니다.");
          }

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
        async (repo) => {
          await repo.dayExercise.delete(workoutId);

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
