import { create } from "zustand";
import { combine } from "zustand/middleware";
import {
  createExercise,
  deleteExercise as deleteExerciseApi,
  fetchExercises,
  updateExercise as updateExerciseApi,
} from "../lib/queries/exercises.query";
import {
  createTodayWorkout,
  fetchTodayWorkouts,
  updateTodaySetCompletion,
  updateTodaySetDetails,
  updateTodayWorkoutCompletion,
} from "../lib/queries/todayWorkouts.query";
import { Exercise, TodayWorkout } from "../types";
import { getAuthStore, useAuthStore } from "./auth-store";

export const useAppStore = create(
  combine(
    {
      // 상태
      exercises: [] as Exercise[],
      todayWorkouts: [] as TodayWorkout[],
      darkMode: true,
      isLoadingExercises: false,
      isLoadingWorkouts: false,
    },
    (set, get) => ({
      /**
       * Supabase에서 운동 목록 새로고침
       */
      refreshExercises: async () => {
        const { isAuthenticated } = useAuthStore.getState();
        if (!isAuthenticated) return;

        set({ isLoadingExercises: true });
        try {
          const data = await fetchExercises();
          set({ exercises: data });
        } catch (error) {
          console.error("운동 목록 로드 실패:", error);
        } finally {
          set({ isLoadingExercises: false });
        }
      },

      /**
       * Supabase에서 오늘의 운동 기록 새로고침
       */
      refreshWorkouts: async () => {
        const { isAuthenticated } = useAuthStore.getState();
        if (!isAuthenticated) return;

        set({ isLoadingWorkouts: true });
        try {
          const today = new Date();
          const todayWorkouts = await fetchTodayWorkouts(today);
          set({ todayWorkouts });
        } catch (error) {
          console.error("운동 기록 로드 실패:", error);
        } finally {
          set({ isLoadingWorkouts: false });
        }
      },

      loadInitialData: async () => {
        const { isAuthenticated } = getAuthStore();
        if (!isAuthenticated) {
          return;
        }

        try {
          const today = new Date();
          const [exercises, todayWorkouts] = await Promise.all([
            fetchExercises(),
            fetchTodayWorkouts(today),
          ]);

          set({
            exercises,
            todayWorkouts,
          });
        } catch (error) {
          console.error("초기 데이터 로드 실패:", error);
        }
      },

      clearData: () => {
        set({
          exercises: [],
          todayWorkouts: [],
        });
      },

      addExercise: async (exercise: Omit<Exercise, "id" | "createdAt">) => {
        const { isAuthenticated } = useAuthStore.getState();
        if (!isAuthenticated) {
          throw new Error("로그인이 필요합니다.");
        }

        // Optimistic Update: UI에 즉시 반영
        const tempExercise: Exercise = {
          ...exercise,
          id: `temp-${Date.now()}`,
          createdAt: new Date(),
        };
        set((state) => ({
          exercises: [tempExercise, ...state.exercises],
        }));

        try {
          // Supabase에 저장
          const newExercise = await createExercise(exercise);

          // 임시 항목을 실제 데이터로 교체
          set((state) => ({
            exercises: state.exercises.map((e) =>
              e.id === tempExercise.id ? newExercise : e,
            ),
          }));
        } catch (error) {
          // 실패 시 임시 항목 제거 (Rollback)
          set((state) => ({
            exercises: state.exercises.filter((e) => e.id !== tempExercise.id),
          }));
          console.error("운동 추가 실패:", error);
          throw error;
        }
      },

      /**
       * 운동 수정 (Optimistic Update + Supabase 동기화)
       */
      updateExercise: async (
        id: string,
        exercise: Omit<Exercise, "id" | "createdAt">,
      ) => {
        const { isAuthenticated } = useAuthStore.getState();
        if (!isAuthenticated) {
          throw new Error("로그인이 필요합니다.");
        }

        // 이전 상태 저장 (롤백용)
        const previousExercises = get().exercises;

        // Optimistic Update
        set((state) => ({
          exercises: state.exercises.map((e) =>
            e.id === id ? { ...e, ...exercise } : e,
          ),
        }));

        try {
          // Supabase에 업데이트
          await updateExerciseApi(id, exercise);
        } catch (error) {
          // 실패 시 롤백
          set({ exercises: previousExercises });
          console.error("운동 수정 실패:", error);
          throw error;
        }
      },

      /**
       * 운동 삭제 (Optimistic Update + Supabase 동기화)
       */
      deleteExercise: async (id: string) => {
        const { isAuthenticated } = useAuthStore.getState();
        if (!isAuthenticated) {
          throw new Error("로그인이 필요합니다.");
        }

        // 이전 상태 저장 (롤백용)
        const previousExercises = get().exercises;

        // Optimistic Update
        set((state) => ({
          exercises: state.exercises.filter((e) => e.id !== id),
        }));

        try {
          // Supabase에서 삭제
          await deleteExerciseApi(id);
        } catch (error) {
          // 실패 시 롤백
          set({ exercises: previousExercises });
          console.error("운동 삭제 실패:", error);
          throw error;
        }
      },

      addTodayWorkout: async (workout: Omit<TodayWorkout, "id">) => {
        const { isAuthenticated } = useAuthStore.getState();

        if (!isAuthenticated) {
          throw new Error("로그인이 필요합니다.");
        }

        // Optimistic Update
        const tempWorkout = {
          ...workout,
          id: `temp-${Date.now()}`,
        };

        set((state) => ({
          todayWorkouts: [tempWorkout, ...state.todayWorkouts],
        }));

        try {
          const newWorkout = await createTodayWorkout(workout);

          // 임시 항목을 실제 데이터로 교체
          set((state) => ({
            todayWorkouts: state.todayWorkouts.map((w) =>
              w.id === tempWorkout.id ? newWorkout : w,
            ),
          }));
        } catch (error) {
          set((state) => ({
            todayWorkouts: state.todayWorkouts.filter(
              (w) => w.id !== tempWorkout.id,
            ),
          }));

          console.error("운동 기록 추가 실패:", error);
          throw error;
        }
      },

      /**
       * 운동 완료 상태 토글 (Optimistic Update + Supabase 동기화)
       */
      toggleWorkoutComplete: async (id: string) => {
        const { isAuthenticated } = useAuthStore.getState();
        if (!isAuthenticated) {
          throw new Error("로그인이 필요합니다.");
        }

        // 이전 상태 저장
        const previousWorkouts = get().todayWorkouts;

        // Optimistic Update
        const updatedWorkouts = previousWorkouts.map((w) => {
          if (w.id === id) {
            const newCompleted = !w.completed;
            return {
              ...w,
              completed: newCompleted,
              setDetails: w.setDetails.map((set) => ({
                ...set,
                completed: newCompleted,
              })),
            };
          }
          return w;
        });
        set({ todayWorkouts: updatedWorkouts });

        try {
          const workout = updatedWorkouts.find((w) => w.id === id);
          if (workout) {
            await updateTodayWorkoutCompletion(id, workout.completed);
          }
        } catch (error) {
          // 실패 시 롤백
          set({ todayWorkouts: previousWorkouts });
          console.error("운동 완료 토글 실패:", error);
          throw error;
        }
      },

      /**
       * 세트 완료 상태 토글 (Optimistic Update + Supabase 동기화)
       */
      toggleSetComplete: async (workoutId: string, setIndex: number) => {
        const { isAuthenticated } = useAuthStore.getState();
        if (!isAuthenticated) {
          throw new Error("로그인이 필요합니다.");
        }

        // 이전 상태 저장
        const previousWorkouts = get().todayWorkouts;

        // Optimistic Update
        const updatedWorkouts = previousWorkouts.map((w) => {
          if (w.id === workoutId) {
            const newSetDetails = [...w.setDetails];
            newSetDetails[setIndex] = {
              ...newSetDetails[setIndex],
              completed: !newSetDetails[setIndex].completed,
            };

            const allCompleted = newSetDetails.every(
              (set) => set.completed === true,
            );

            return {
              ...w,
              setDetails: newSetDetails,
              completed: allCompleted,
            };
          }
          return w;
        });
        set({ todayWorkouts: updatedWorkouts });

        try {
          // Supabase에 업데이트
          const workout = updatedWorkouts.find((w) => w.id === workoutId);
          if (workout) {
            const set = workout.setDetails[setIndex];
            await updateTodaySetCompletion(workoutId, setIndex, set.completed);
          }
        } catch (error) {
          // 실패 시 롤백
          set({ todayWorkouts: previousWorkouts });
          console.error("세트 완료 토글 실패:", error);
          throw error;
        }
      },

      /**
       * 세트 상세 정보 업데이트 (Optimistic Update + Supabase 동기화)
       */
      updateSetDetails: async (
        workoutId: string,
        setIndex: number,
        reps: number,
        weight?: number,
      ) => {
        const { isAuthenticated } = useAuthStore.getState();
        if (!isAuthenticated) {
          throw new Error("로그인이 필요합니다.");
        }

        // 이전 상태 저장
        const previousWorkouts = get().todayWorkouts;

        // Optimistic Update
        const updatedWorkouts = previousWorkouts.map((w) => {
          if (w.id === workoutId) {
            const newSetDetails = [...w.setDetails];
            newSetDetails[setIndex] = {
              ...newSetDetails[setIndex],
              reps,
              weight,
            };

            return {
              ...w,
              setDetails: newSetDetails,
            };
          }
          return w;
        });
        set({ todayWorkouts: updatedWorkouts });

        try {
          // Supabase에 업데이트
          const workout = updatedWorkouts.find((w) => w.id === workoutId);
          if (workout) {
            await updateTodaySetDetails(workoutId, setIndex, reps, weight);
          }
        } catch (error) {
          // 실패 시 롤백
          set({ todayWorkouts: previousWorkouts });
          console.error("세트 상세 업데이트 실패:", error);
          throw error;
        }
      },

      // ========================================
      // 설정 (Settings)
      // ========================================

      /**
       * 다크 모드 토글
       */
      toggleDarkMode: () => {
        set((state) => ({ darkMode: !state.darkMode }));
      },
    }),
  ),
);
