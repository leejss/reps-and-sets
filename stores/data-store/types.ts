import type { DayExerciseWithDetails } from "@/lib/models/day-exercise";
import type { Exercise, ExerciseInput } from "@/lib/models/exercise";
import type { ExerciseSet } from "@/lib/models/exercise-set";
import type { WeeklyPlan, WeeklyWorkoutInput } from "@/types/weekly-plan";

export type ExerciseSliceState = {
  exercises: Exercise[];
  isLoadingExercises: boolean;
};

export type ExerciseSliceActions = {
  refreshExercises: () => Promise<void>;
  addExercise: (exercise: ExerciseInput) => Promise<void>;
  updateExercise: (id: string, exercise: ExerciseInput) => Promise<void>;
  deleteExercise: (id: string) => Promise<void>;
};

export type TodayWorkoutSliceState = {
  todayExercises: DayExerciseWithDetails[];
  isLoadingWorkouts: boolean;
};

export type TodayWorkoutSliceActions = {
  addTodayExercise: (input: {
    exerciseId: string;
    exerciseName: string;
    targetMuscleGroup: string;
    sets: ExerciseSet[];
    date: string;
  }) => Promise<void>;
  toggleExerciseComplete: (id: string) => Promise<void>;
  toggleSetComplete: (dayExerciseId: string, setOrder: number) => Promise<void>;
  updateSetDetails: (
    dayExerciseId: string,
    setIndex: number,
    reps: number,
    weight?: number,
  ) => Promise<void>;
};

export type WeeklyPlanSliceState = {
  weeklyPlan: WeeklyPlan;
  isLoadingWeeklyPlan: boolean;
  weeklyPlanError: string | null;
  isMutatingWeeklyPlan: boolean;
};

export type WeeklyPlanSliceActions = {
  loadWeeklyPlan: (silent?: boolean) => Promise<void>;
  addWorkout: (
    trainingDate: string,
    workout: WeeklyWorkoutInput,
  ) => Promise<void>;
  editWorkout: (
    trainingDate: string,
    workoutId: string,
    payload: WeeklyWorkoutInput,
  ) => Promise<void>;
  removeWorkout: (trainingDate: string, workoutId: string) => Promise<void>;
};

export type AppSliceActions = {
  loadInitialData: () => Promise<void>;
  clearData: () => void;
};

export type DataStoreState = ExerciseSliceState &
  TodayWorkoutSliceState &
  WeeklyPlanSliceState;

export type DataStoreActions = ExerciseSliceActions &
  TodayWorkoutSliceActions &
  WeeklyPlanSliceActions &
  AppSliceActions;

export type DataStore = DataStoreState & DataStoreActions;
