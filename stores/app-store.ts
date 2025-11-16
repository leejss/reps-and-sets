import { create } from "zustand";
import { combine } from "zustand/middleware";
import * as db from "../lib/database";
import { formatLocalDateISO } from "../lib/date";
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
          const data = await db.fetchExercises();
          set({ exercises: data });
        } catch (error) {
          console.error("운동 목록 로드 실패:", error);
        } finally {
          set({ isLoadingExercises: false });
        }
      },

      /**
       * Supabase에서 오늘의 운동 기록 새로고침
       * 계획에 있지만 기록에 없는 운동들을 자동으로 생성
       */
      refreshWorkouts: async () => {
        const { isAuthenticated } = useAuthStore.getState();
        if (!isAuthenticated) return;

        set({ isLoadingWorkouts: true });
        try {
          const today = new Date();
          const dateString = formatLocalDateISO(today);

          // 1. 오늘의 기록과 계획을 병렬로 조회
          const [workoutLogs, scheduledWorkouts] = await Promise.all([
            db.fetchWorkoutLogs(today),
            db.fetchScheduledWorkoutsForDate(dateString),
          ]);

          // 2. 계획에는 있지만 기록에 없는 운동들을 찾기
          const logsToCreate = scheduledWorkouts.filter(
            (scheduled) =>
              !workoutLogs.some(
                (log) => log.scheduledWorkoutId === scheduled.id,
              ),
          );

          // 3. 자동으로 workout_logs 생성
          const newLogs = await Promise.all(
            logsToCreate.map((scheduled) =>
              db.createWorkoutLog({
                exerciseId: scheduled.exerciseId,
                exerciseName: scheduled.exerciseName,
                muscleGroup: scheduled.muscleGroup,
                setDetails: scheduled.setDetails.map((set) => ({
                  ...set,
                  completed: false,
                })),
                completed: false,
                date: dateString,
                scheduledWorkoutId: scheduled.id,
              }),
            ),
          );

          // 4. 기존 기록과 새로 생성된 기록을 합쳐서 저장
          set({ todayWorkouts: [...workoutLogs, ...newLogs] });
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
          const dateString = formatLocalDateISO(today);

          // 1. 운동 목록, 오늘의 기록, 오늘의 계획을 병렬로 조회
          const [exercises, workoutLogs, scheduledWorkouts] = await Promise.all(
            [
              db.fetchExercises(),
              db.fetchWorkoutLogs(today),
              db.fetchScheduledWorkoutsForDate(dateString),
            ],
          );

          // 2. 계획에는 있지만 기록에 없는 운동들을 찾기
          const logsToCreate = scheduledWorkouts.filter(
            (scheduled) =>
              !workoutLogs.some(
                (log) => log.scheduledWorkoutId === scheduled.id,
              ),
          );

          // 3. 자동으로 workout_logs 생성 (계획을 실적으로 변환)
          const newLogs = await Promise.all(
            logsToCreate.map((scheduled) =>
              db.createWorkoutLog({
                exerciseId: scheduled.exerciseId,
                exerciseName: scheduled.exerciseName,
                muscleGroup: scheduled.muscleGroup,
                setDetails: scheduled.setDetails.map((set) => ({
                  ...set,
                  completed: false, // 초기 상태는 미완료
                })),
                completed: false,
                date: dateString,
                scheduledWorkoutId: scheduled.id,
              }),
            ),
          );

          // 4. 기존 기록과 새로 생성된 기록을 합쳐서 저장
          set({
            exercises,
            todayWorkouts: [...workoutLogs, ...newLogs],
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
          const newExercise = await db.createExercise(exercise);

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
          await db.updateExercise(id, exercise);
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
          await db.deleteExercise(id);
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
          const scheduledInput = {
            exerciseId: workout.exerciseId,
            exerciseName: workout.exerciseName,
            muscleGroup: workout.muscleGroup,
            setDetails: workout.setDetails,
          };

          const scheduled = await db.ensureScheduledWorkoutForDate({
            date: workout.date,
            workout: scheduledInput,
          });

          // Supabase에 저장
          const newWorkout = await db.createWorkoutLog({
            ...workout,
            scheduledWorkoutId: scheduled.id,
          });

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
            await db.updateWorkoutLog(id, {
              completed: workout.completed,
              setDetails: workout.setDetails,
            });
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
            await db.updateWorkoutLog(workoutId, {
              setDetails: workout.setDetails,
              completed: workout.completed,
            });
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
            await db.updateWorkoutLog(workoutId, {
              setDetails: workout.setDetails,
            });
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
