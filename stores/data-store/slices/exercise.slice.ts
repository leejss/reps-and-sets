import type { Exercise, ExerciseInput } from "@/lib/models/exercise";
import type { StoreApi } from "zustand";
import type {
  DataStore,
  ExerciseSliceActions,
  ExerciseSliceState,
} from "../types";
import type { StoreHelpers } from "../utils";

export function createExerciseSlice(
  set: StoreApi<DataStore>["setState"],
  get: StoreApi<DataStore>["getState"],
  helpers: StoreHelpers,
): ExerciseSliceState & ExerciseSliceActions {
  return {
    exercises: [],
    isLoadingExercises: false,

    refreshExercises: async () => {
      set({ isLoadingExercises: true });
      await helpers.execute(
        async (repo) => {
          const data = await repo.exercise.findAll();
          set({ exercises: data });
        },
        {
          errorMessage: "운동 목록 로드 실패:",
          onFinally: () => set({ isLoadingExercises: false }),
          shouldThrow: false,
        },
      );
    },

    addExercise: async (exercise: ExerciseInput) => {
      const tempExercise: Exercise = {
        ...exercise,
        id: `temp-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      set((state) => ({ exercises: [tempExercise, ...state.exercises] }));

      await helpers.execute(
        async (repo) => {
          const newExercise = await repo.exercise.create(exercise);
          set((state) => ({
            exercises: state.exercises.map((e) =>
              e.id === tempExercise.id ? newExercise : e,
            ),
          }));
        },
        {
          errorMessage: "운동 추가 실패:",
          onError: () => {
            set((state) => ({
              exercises: state.exercises.filter(
                (e) => e.id !== tempExercise.id,
              ),
            }));
          },
        },
      );
    },

    updateExercise: async (id: string, exercise: ExerciseInput) => {
      const previousExercises = get().exercises;

      set((state) => ({
        exercises: state.exercises.map((e) =>
          e.id === id ? { ...e, ...exercise } : e,
        ),
      }));

      await helpers.execute(
        async (repo) => {
          await repo.exercise.update(id, exercise);
        },
        {
          errorMessage: "운동 수정 실패:",
          onError: () => set({ exercises: previousExercises }),
        },
      );
    },

    deleteExercise: async (id: string) => {
      const previousExercises = get().exercises;

      set((state) => ({
        exercises: state.exercises.filter((e) => e.id !== id),
      }));

      await helpers.execute(
        async (repo) => {
          await repo.exercise.delete(id);
        },
        {
          errorMessage: "운동 삭제 실패:",
          onError: () => set({ exercises: previousExercises }),
        },
      );
    },
  };
}
