import { formatLocalDateISO } from "@/lib/date";
import { buildEmptyPlan } from "@/lib/weekly-plan/builders";
import { create } from "zustand";
import { createExerciseSlice } from "./data-store/slices/exercise.slice";
import { createTodayWorkoutSlice } from "./data-store/slices/today-workout.slice";
import { createWeeklyPlanSlice } from "./data-store/slices/weekly-plan.slice";
import type { DataStore } from "./data-store/types";
import { createStoreHelpers } from "./data-store/utils";

const helpers = createStoreHelpers();

export const useDataStore = create<DataStore>()((set, get) => ({
  ...createExerciseSlice(set, get, helpers),
  ...createTodayWorkoutSlice(set, get, helpers),
  ...createWeeklyPlanSlice(set, get, helpers),

  loadInitialData: async () => {
    await helpers.execute(
      async (services) => {
        const today = new Date();
        const todayISO = formatLocalDateISO(today);

        const trainingDay = await services.trainingDay.getOrCreate(todayISO);

        const [exercises, todayExercises] = await Promise.all([
          services.exercise.findAll(),
          services.dayExercise.findByTrainingDayId(trainingDay.id),
        ]);

        set({ exercises, todayExercises });

        await get().loadWeeklyPlan();
      },
      {
        errorMessage: "초기 데이터 로드 실패:",
        shouldThrow: false,
      },
    );
  },

  clearData: () => {
    set({
      exercises: [],
      todayExercises: [],
      weeklyPlan: buildEmptyPlan(new Date()),
    });
  },
}));

export const loadInitialData = useDataStore.getState().loadInitialData;
export const addTodayExercise = useDataStore.getState().addTodayExercise;
export const refreshExercises = useDataStore.getState().refreshExercises;
export const clearData = useDataStore.getState().clearData;
export const addExercise = useDataStore.getState().addExercise;
export const updateExercise = useDataStore.getState().updateExercise;
export const deleteExercise = useDataStore.getState().deleteExercise;
export const toggleExerciseComplete =
  useDataStore.getState().toggleExerciseComplete;
export const toggleSetComplete = useDataStore.getState().toggleSetComplete;
export const updateSetDetails = useDataStore.getState().updateSetDetails;
export const loadWeeklyPlan = useDataStore.getState().loadWeeklyPlan;
export const addWorkout = useDataStore.getState().addWorkout;
export const editWorkout = useDataStore.getState().editWorkout;
export const removeWorkout = useDataStore.getState().removeWorkout;
