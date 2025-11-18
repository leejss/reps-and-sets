import type { SessionExerciseWithSets } from "@/lib/queries/workoutSessionExercises.query";
import { createSessionExercise } from "@/lib/service";
import { create } from "zustand";
import { combine } from "zustand/middleware";
import {
  createExercise,
  deleteExercise as deleteExerciseApi,
  Exercise,
  fetchExercises,
  updateExercise as updateExerciseApi,
} from "../lib/queries/exercises.query";
import {
  fetchSessionExercisesByDate,
  updateTodaySetCompletion,
  updateTodaySetDetails,
  updateTodayWorkoutCompletion,
} from "../lib/queries/workoutSets.query";
import { getAuthStore, useAuthStore } from "./auth-store";

import type { WorkoutSet } from "../lib/queries/workoutSets.query";

// 오늘의 운동: UI에서 사용하는 뷰 모델 타입
export interface TodayWorkout {
  id: string;
  sessionId: string;
  exerciseId: string;
  exerciseName: string;
  targetMuscleGroup: string;
  orderInSession: number;
  workoutSetList: WorkoutSet[];
  completed: boolean;
}

// DB에서 조회한 세션 운동 정보를 UI 뷰 모델로 변환
const mapSessionExerciseToTodayWorkout = (
  session: SessionExerciseWithSets,
): TodayWorkout => ({
  id: session.id,
  sessionId: session.sessionId,
  exerciseId: session.exerciseId,
  exerciseName: session.exerciseName,
  targetMuscleGroup: session.targetMuscleGroup,
  orderInSession: session.orderInSession,
  completed: session.completed,
  workoutSetList: session.sets,
});

export const useAppStore = create(
  combine(
    {
      exercises: [] as Exercise[],
      todayExercises: [] as TodayWorkout[],
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
      // refreshWorkouts: async () => {
      //   const { isAuthenticated } = useAuthStore.getState();
      //   if (!isAuthenticated) return;

      //   set({ isLoadingWorkouts: true });
      //   try {
      //     const today = new Date();
      //     const todayWorkouts = await fetchSessionExercisesByDate(today);
      //     set({ todayExercises: todayWorkouts });
      //   } catch (error) {
      //     console.error("운동 기록 로드 실패:", error);
      //   } finally {
      //     set({ isLoadingWorkouts: false });
      //   }
      // },

      loadInitialData: async () => {
        const { isAuthenticated } = getAuthStore();
        if (!isAuthenticated) {
          return;
        }

        try {
          const today = new Date();
          const [exercises, todaySessionExercises] = await Promise.all([
            fetchExercises(),
            fetchSessionExercisesByDate(today),
          ]);

          set({
            exercises,
            todayExercises: todaySessionExercises.map(
              mapSessionExerciseToTodayWorkout,
            ),
          });
        } catch (error) {
          console.error("초기 데이터 로드 실패:", error);
        }
      },

      clearData: () => {
        set({
          exercises: [],
          todayExercises: [],
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

      addTodaySessionExercise: async (input: {
        exerciseId: string;
        exerciseName: string;
        targetMuscleGroup: string;
        workoutSetList: WorkoutSet[];
        completed: boolean;
        date: string;
      }) => {
        const { isAuthenticated } = useAuthStore.getState();

        if (!isAuthenticated) {
          throw new Error("로그인이 필요합니다.");
        }

        // Optimistic Update
        const tempWorkout: TodayWorkout = {
          id: `temp-${Date.now()}`,
          sessionId: "temp-session",
          exerciseId: input.exerciseId,
          exerciseName: input.exerciseName,
          targetMuscleGroup: input.targetMuscleGroup,
          orderInSession: 0,
          workoutSetList: input.workoutSetList,
          completed: input.completed,
        };

        set((state) => ({
          todayExercises: [tempWorkout, ...state.todayExercises],
        }));

        try {
          const created = await createSessionExercise(
            input.date,
            input.exerciseId,
            input.workoutSetList.map((set) => ({
              reps: set.plannedReps ?? 0,
              weight: set.plannedWeight ?? undefined,
            })),
          );
          const newWorkout = mapSessionExerciseToTodayWorkout(created);

          set((state) => ({
            todayExercises: state.todayExercises.map((w) =>
              w.id === tempWorkout.id ? newWorkout : w,
            ),
          }));
        } catch (error) {
          set((state) => ({
            todayExercises: state.todayExercises.filter(
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
        const previousWorkouts = get().todayExercises;

        // Optimistic Update
        const updatedWorkouts: TodayWorkout[] = previousWorkouts.map((w) => {
          if (w.id === id) {
            const newCompleted = !w.completed;
            return {
              ...w,
              completed: newCompleted,
              workoutSetList: w.workoutSetList.map((set, index) => ({
                ...set,
                completed: newCompleted,
                actualReps:
                  set.actualReps ??
                  set.plannedReps ??
                  (newCompleted ? 0 : null),
                setOrder: set.setOrder ?? index,
              })),
            };
          }
          return w;
        });
        set({ todayExercises: updatedWorkouts });

        try {
          const workout = updatedWorkouts.find((w) => w.id === id);
          if (workout) {
            await updateTodayWorkoutCompletion(id, workout.completed);
          }
        } catch (error) {
          // 실패 시 롤백
          set({ todayExercises: previousWorkouts });
          console.error("운동 완료 토글 실패:", error);
          throw error;
        }
      },

      toggleSetComplete: async (workoutId: string, setOrder: number) => {
        const { isAuthenticated } = useAuthStore.getState();
        if (!isAuthenticated) {
          throw new Error("로그인이 필요합니다.");
        }

        // 이전 상태 저장
        const previousWorkouts = get().todayExercises;

        // Optimistic Update
        const updatedWorkouts: TodayWorkout[] = previousWorkouts.map((w) => {
          if (w.id === workoutId) {
            const newSetDetails = [...w.workoutSetList];
            newSetDetails[setOrder] = {
              ...newSetDetails[setOrder],
              completed: !newSetDetails[setOrder].completed,
            };

            const allCompleted = newSetDetails.every(
              (set) => set.completed === true,
            );

            return {
              ...w,
              workoutSetList: newSetDetails,
              completed: allCompleted,
            };
          }
          return w;
        });

        set({ todayExercises: updatedWorkouts });

        try {
          const workout = updatedWorkouts.find((w) => w.id === workoutId);
          if (workout) {
            const set = workout.workoutSetList[setOrder];
            await updateTodaySetCompletion(workoutId, setOrder, set.completed);
          }
        } catch (error) {
          // 실패 시 롤백
          set({ todayExercises: previousWorkouts });
          console.error("세트 완료 토글 실패:", error);
          throw error;
        }
      },

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
        const previousWorkouts = get().todayExercises;

        // Optimistic Update
        const updatedWorkouts: TodayWorkout[] = previousWorkouts.map((w) => {
          if (w.id === workoutId) {
            const newSetDetails = [...w.workoutSetList];
            newSetDetails[setIndex] = {
              ...newSetDetails[setIndex],
              actualReps: reps,
              actualWeight: weight,
            };

            return {
              ...w,
              workoutSetList: newSetDetails,
            };
          }
          return w;
        });
        set({ todayExercises: updatedWorkouts });

        try {
          // Supabase에 업데이트
          const workout = updatedWorkouts.find((w) => w.id === workoutId);
          if (workout) {
            await updateTodaySetDetails(workoutId, setIndex, reps, weight);
          }
        } catch (error) {
          // 실패 시 롤백
          set({ todayExercises: previousWorkouts });
          console.error("세트 상세 업데이트 실패:", error);
          throw error;
        }
      },

      /**
       * 다크 모드 토글
       */
      toggleDarkMode: () => {
        set((state) => ({ darkMode: !state.darkMode }));
      },
    }),
  ),
);
