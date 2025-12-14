import type { DayExerciseWithDetails } from "@/lib/models/day-exercise";
import type { ExerciseSet } from "@/lib/models/exercise-set";
import type { StoreApi } from "zustand";
import type {
  DataStore,
  TodayWorkoutSliceActions,
  TodayWorkoutSliceState,
} from "../types";
import type { StoreHelpers } from "../utils";

export function createTodayWorkoutSlice(
  set: StoreApi<DataStore>["setState"],
  get: StoreApi<DataStore>["getState"],
  helpers: StoreHelpers,
): TodayWorkoutSliceState & TodayWorkoutSliceActions {
  return {
    todayExercises: [],
    isLoadingWorkouts: false,

    addTodayExercise: async (input: {
      exerciseId: string;
      exerciseName: string;
      targetMuscleGroup: string;
      sets: ExerciseSet[];
      date: string;
    }) => {
      const tempExercise: DayExerciseWithDetails = {
        id: `temp-${Date.now()}`,
        trainingDayId: "temp-training-day",
        exerciseId: input.exerciseId,
        exerciseName: input.exerciseName,
        targetMuscleGroup: input.targetMuscleGroup,
        displayOrder: 0,
        isCompleted: false,
        sets: input.sets.map((s, index) => ({
          ...s,
          setOrder: s.setOrder ?? index,
          isCompleted: s.isCompleted ?? false,
        })),
        isDeleted: false,
      };

      set((state) => ({
        todayExercises: [tempExercise, ...state.todayExercises],
      }));

      await helpers.execute(
        async (services) => {
          const created = await services.todayWorkout.addTodayExercise({
            exerciseId: input.exerciseId,
            sets: input.sets,
            date: input.date,
          });

          set((state) => ({
            todayExercises: state.todayExercises.map((w) =>
              w.id === tempExercise.id ? created : w,
            ),
          }));
        },
        {
          errorMessage: "운동 기록 추가 실패:",
          onError: () => {
            set((state) => ({
              todayExercises: state.todayExercises.filter(
                (w) => w.id !== tempExercise.id,
              ),
            }));
          },
        },
      );
    },

    toggleExerciseComplete: async (id: string) => {
      const previousExercises = get().todayExercises;

      const updatedExercises = previousExercises.map((w) => {
        if (w.id === id) {
          const newCompleted = !w.isCompleted;
          return {
            ...w,
            isCompleted: newCompleted,
            sets: w.sets.map((s, index) => ({
              ...s,
              isCompleted: newCompleted,
              actualReps:
                s.actualReps ?? s.plannedReps ?? (newCompleted ? 0 : null),
              setOrder: s.setOrder ?? index,
            })),
          };
        }
        return w;
      });

      set({ todayExercises: updatedExercises });

      await helpers.execute(
        async (services) => {
          const exercise = updatedExercises.find((w) => w.id === id);
          if (exercise) {
            await services.todayWorkout.setExerciseCompletion(
              id,
              exercise.isCompleted,
            );
          }
        },
        {
          errorMessage: "운동 완료 토글 실패:",
          onError: () => set({ todayExercises: previousExercises }),
        },
      );
    },

    toggleSetComplete: async (dayExerciseId: string, setOrder: number) => {
      const previousExercises = get().todayExercises;

      const updatedExercises = previousExercises.map((w) => {
        if (w.id === dayExerciseId) {
          const newSets = [...w.sets];
          newSets[setOrder] = {
            ...newSets[setOrder],
            isCompleted: !newSets[setOrder].isCompleted,
          };

          const allCompleted = newSets.every((s) => s.isCompleted);

          return {
            ...w,
            sets: newSets,
            isCompleted: allCompleted,
          };
        }
        return w;
      });

      set({ todayExercises: updatedExercises });

      await helpers.execute(
        async (services) => {
          const exercise = updatedExercises.find((w) => w.id === dayExerciseId);
          if (exercise) {
            const targetSet = exercise.sets[setOrder];
            await services.todayWorkout.setSetCompletion(
              dayExerciseId,
              setOrder,
              targetSet.isCompleted,
            );
          }
        },
        {
          errorMessage: "세트 완료 토글 실패:",
          onError: () => set({ todayExercises: previousExercises }),
        },
      );
    },

    updateSetDetails: async (
      dayExerciseId: string,
      setIndex: number,
      reps: number,
      weight?: number,
    ) => {
      const previousExercises = get().todayExercises;

      const updatedExercises = previousExercises.map((w) => {
        if (w.id === dayExerciseId) {
          const newSets = [...w.sets];
          newSets[setIndex] = {
            ...newSets[setIndex],
            actualReps: reps,
            actualWeight: weight ?? null,
          };

          return {
            ...w,
            sets: newSets,
          };
        }
        return w;
      });

      set({ todayExercises: updatedExercises });

      await helpers.execute(
        async (services) => {
          await services.todayWorkout.updateSetActual(dayExerciseId, setIndex, {
            actualReps: reps,
            actualWeight: weight ?? null,
          });
        },
        {
          errorMessage: "세트 상세 업데이트 실패:",
          onError: () => set({ todayExercises: previousExercises }),
        },
      );
    },
  };
}
