import {
  formatChipDate,
  formatLocalDateISO,
  getWeekRange,
  type WeekRange,
} from "@/lib/date";
import type { Exercise, ExerciseInput } from "@/lib/queries/exercises.model";
import {
  createExercise,
  deleteExercise as deleteExerciseApi,
  fetchExercises,
  updateExercise as updateExerciseApi,
} from "@/lib/queries/exercises.query";
import {
  deleteSessionExercise as deleteSessionExerciseRow,
  fetchWorkoutSessionExercise,
  insertSessionExercise,
  updateSessionExercise,
  type SessionExerciseWithSets,
} from "@/lib/queries/workoutSessionExercises.query";
import {
  fetchWorkoutSessionsWithSetsInRange,
  getOrCreateWorkoutSession,
  type WorkoutSessionWithDetails,
} from "@/lib/queries/workoutSessions.query";
import {
  fetchSessionExercisesByDate,
  insertWorkoutSetsForSessionExercise,
  replaceWorkoutSetsForSessionExercise,
  updateTodaySetCompletion,
  updateTodaySetDetails,
  updateTodayWorkoutCompletion,
  type WorkoutSet,
} from "@/lib/queries/workoutSets.query";
import { createSessionExercise } from "@/lib/service";
import {
  WeeklyPlan,
  WeeklyPlanExercise,
  WeeklySessionPlan,
  WeeklyWorkoutInput,
} from "@/types/weekly-plan";
import { create } from "zustand";
import { combine } from "zustand/middleware";
import { isAuthenticated } from "./auth-store";

const buildEmptyPlanFromRange = (range: WeekRange): WeeklyPlan => {
  const { startDay, endDay, startISO, endISO } = range;

  const sessionPlans: WeeklySessionPlan[] = Array.from({ length: 7 }).map(
    (_, index) => {
      const current = startDay.add(index, "day");
      return {
        sessionDate: formatLocalDateISO(current),
        exercises: [],
      };
    },
  );

  return {
    weekStartDate: startISO,
    weekEndDate: endISO,
    weekRange: `${formatChipDate(startDay)} - ${formatChipDate(endDay)}`,
    sessionPlans,
  };
};

const buildEmptyPlan = (pivotDate: Date): WeeklyPlan => {
  const range = getWeekRange(pivotDate);
  return buildEmptyPlanFromRange(range);
};

const createWeeklyPlanFromSessions = (
  range: WeekRange,
  sessionsWithDetails: WorkoutSessionWithDetails[],
): WeeklyPlan => {
  const basePlan = buildEmptyPlanFromRange(range);

  const sessionPlanMap = basePlan.sessionPlans.reduce<
    Record<string, WeeklySessionPlan>
  >((acc, sessionPlan) => {
    acc[sessionPlan.sessionDate] = { ...sessionPlan, exercises: [] };
    return acc;
  }, {});

  sessionsWithDetails.forEach(({ session, exercises }) => {
    const target = sessionPlanMap[session.date];
    if (!target) return;
    target.exercises = [...exercises]
      .sort((a, b) => a.orderInSession - b.orderInSession)
      .map(
        (exercise) =>
          ({
            ...exercise,
          } as WeeklyPlanExercise),
      );
  });

  return {
    ...basePlan,
    sessionPlans: basePlan.sessionPlans.map((plan) => ({
      ...plan,
      exercises: sessionPlanMap[plan.sessionDate].exercises,
    })),
  };
};

export const useDataStore = create(
  combine(
    {
      exercises: [] as Exercise[],
      todayExercises: [] as SessionExerciseWithSets[],
      isLoadingExercises: false,
      isLoadingWorkouts: false,
      weeklyPlan: buildEmptyPlan(new Date()),
      isLoadingWeeklyPlan: false,
      weeklyPlanError: null as string | null,
      isMutatingWeeklyPlan: false,
    },
    (set, get) => ({
      refreshExercises: async () => {
        if (!isAuthenticated()) return;

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

      loadInitialData: async () => {
        if (!isAuthenticated()) {
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
            todayExercises: todaySessionExercises,
          });

          await (get() as any).loadWeeklyPlan();
        } catch (error) {
          console.error("초기 데이터 로드 실패:", error);
        }
      },

      clearData: () => {
        set({
          exercises: [],
          todayExercises: [],
          weeklyPlan: buildEmptyPlan(new Date()),
        });
      },

      addExercise: async (exercise: ExerciseInput) => {
        if (!isAuthenticated()) {
          throw new Error("로그인이 필요합니다.");
        }

        const tempExercise: Exercise = {
          ...exercise,
          id: `temp-${Date.now()}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({
          exercises: [tempExercise, ...state.exercises],
        }));

        try {
          const newExercise = await createExercise(exercise);

          set((state) => ({
            exercises: state.exercises.map((e) =>
              e.id === tempExercise.id ? newExercise : e,
            ),
          }));
        } catch (error) {
          set((state) => ({
            exercises: state.exercises.filter((e) => e.id !== tempExercise.id),
          }));
          console.error("운동 추가 실패:", error);
          throw error;
        }
      },

      updateExercise: async (id: string, exercise: ExerciseInput) => {
        if (!isAuthenticated()) {
          throw new Error("로그인이 필요합니다.");
        }

        const previousExercises = get().exercises;

        set((state) => ({
          exercises: state.exercises.map((e) =>
            e.id === id ? { ...e, ...exercise } : e,
          ),
        }));

        try {
          await updateExerciseApi(id, exercise);
        } catch (error) {
          set({ exercises: previousExercises });
          console.error("운동 수정 실패:", error);
          throw error;
        }
      },

      deleteExercise: async (id: string) => {
        if (!isAuthenticated()) {
          throw new Error("로그인이 필요합니다.");
        }

        const previousExercises = get().exercises;

        set((state) => ({
          exercises: state.exercises.filter((e) => e.id !== id),
        }));

        try {
          await deleteExerciseApi(id);
        } catch (error) {
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
        date: string;
      }) => {
        if (!isAuthenticated()) {
          throw new Error("로그인이 필요합니다.");
        }

        const tempWorkout: SessionExerciseWithSets = {
          id: `temp-${Date.now()}`,
          sessionId: "temp-session",
          exerciseId: input.exerciseId,
          exerciseName: input.exerciseName,
          targetMuscleGroup: input.targetMuscleGroup,
          orderInSession: 0,
          completed: false,
          sets: input.workoutSetList.map((set, index) => ({
            ...set,
            setOrder: set.setOrder ?? index,
            completed: set.completed ?? false,
          })),
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
          const newWorkout = created;

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

      toggleWorkoutComplete: async (id: string) => {
        if (!isAuthenticated()) {
          throw new Error("로그인이 필요합니다.");
        }

        const previousWorkouts = get().todayExercises;

        const updatedWorkouts: SessionExerciseWithSets[] = previousWorkouts.map(
          (w) => {
            if (w.id === id) {
              const newCompleted = !w.completed;
              return {
                ...w,
                completed: newCompleted,
                sets: w.sets.map((set, index) => ({
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
          },
        );
        set({ todayExercises: updatedWorkouts });

        try {
          const workout = updatedWorkouts.find((w) => w.id === id);
          if (workout) {
            await updateTodayWorkoutCompletion(id, workout.completed);
          }
        } catch (error) {
          set({ todayExercises: previousWorkouts });
          console.error("운동 완료 토글 실패:", error);
          throw error;
        }
      },

      toggleSetComplete: async (workoutId: string, setOrder: number) => {
        if (!isAuthenticated()) {
          throw new Error("로그인이 필요합니다.");
        }

        const previousWorkouts = get().todayExercises;

        const updatedWorkouts: SessionExerciseWithSets[] = previousWorkouts.map(
          (w) => {
            if (w.id === workoutId) {
              const newSetDetails = [...w.sets];
              newSetDetails[setOrder] = {
                ...newSetDetails[setOrder],
                completed: !newSetDetails[setOrder].completed,
              };

              const allCompleted = newSetDetails.every(
                (set) => set.completed === true,
              );

              return {
                ...w,
                sets: newSetDetails,
                completed: allCompleted,
              };
            }
            return w;
          },
        );

        set({ todayExercises: updatedWorkouts });

        try {
          const workout = updatedWorkouts.find((w) => w.id === workoutId);
          if (workout) {
            const set = workout.sets[setOrder];
            await updateTodaySetCompletion(workoutId, setOrder, set.completed);
          }
        } catch (error) {
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
        if (!isAuthenticated()) {
          throw new Error("로그인이 필요합니다.");
        }

        const previousWorkouts = get().todayExercises;

        const updatedWorkouts: SessionExerciseWithSets[] = previousWorkouts.map(
          (w) => {
            if (w.id === workoutId) {
              const newSetDetails = [...w.sets];
              newSetDetails[setIndex] = {
                ...newSetDetails[setIndex],
                actualReps: reps,
                actualWeight: weight,
              };

              return {
                ...w,
                sets: newSetDetails,
              };
            }
            return w;
          },
        );
        set({ todayExercises: updatedWorkouts });

        try {
          const workout = updatedWorkouts.find((w) => w.id === workoutId);
          if (workout) {
            await updateTodaySetDetails(workoutId, setIndex, reps, weight);
          }
        } catch (error) {
          set({ todayExercises: previousWorkouts });
          console.error("세트 상세 업데이트 실패:", error);
          throw error;
        }
      },

      loadWeeklyPlan: async () => {
        if (!isAuthenticated()) return;

        set({ isLoadingWeeklyPlan: true, weeklyPlanError: null });
        const today = new Date();
        try {
          const range = getWeekRange(today);
          const { startISO, endISO } = range;

          const sessionsWithSets = await fetchWorkoutSessionsWithSetsInRange(
            startISO,
            endISO,
          );

          set({
            weeklyPlan: createWeeklyPlanFromSessions(range, sessionsWithSets),
          });
        } catch (err) {
          console.error("주간 계획 로드 실패:", err);
          set({
            weeklyPlanError: "주간 계획을 불러오지 못했습니다.",
            weeklyPlan: buildEmptyPlan(today),
          });
        } finally {
          set({ isLoadingWeeklyPlan: false });
        }
      },

      addWorkout: async (sessionDate: string, workout: WeeklyWorkoutInput) => {
        if (!isAuthenticated()) throw new Error("로그인이 필요합니다.");

        set({ isMutatingWeeklyPlan: true });
        try {
          const weeklyPlan = get().weeklyPlan;
          const targetDay = weeklyPlan.sessionPlans.find(
            (day) => day.sessionDate === sessionDate,
          );
          if (!targetDay) {
            throw new Error("선택한 날짜 정보를 찾을 수 없습니다.");
          }
          const session = await getOrCreateWorkoutSession(sessionDate);

          const orderInSession = targetDay.exercises.length;
          const sessionExerciseBase = await insertSessionExercise({
            sessionId: session.id,
            exerciseId: workout.exerciseId,
            orderInSession,
          });

          await insertWorkoutSetsForSessionExercise({
            sessionExerciseId: sessionExerciseBase.id,
            plannedSets: workout.setDetails.map((set) => ({
              reps: set.plannedReps ?? 0,
              weight: set.plannedWeight ?? undefined,
            })),
          });

          const details = await fetchWorkoutSessionExercise(session.id);
          const sessionExercise = details.find(
            (exercise) => exercise.id === sessionExerciseBase.id,
          );

          if (!sessionExercise) {
            throw new Error("생성된 세션 운동 정보를 찾을 수 없습니다.");
          }

          const created: WeeklyPlanExercise = {
            ...sessionExercise,
            note: workout.note,
          };

          set((prev) => {
            const nextSessionPlans = prev.weeklyPlan.sessionPlans.map((day) =>
              day.sessionDate === sessionDate
                ? {
                    ...day,
                    exercises: [...day.exercises, created],
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
        } finally {
          set({ isMutatingWeeklyPlan: false });
        }
      },

      editWorkout: async (
        sessionDate: string,
        workoutId: string,
        payload: WeeklyWorkoutInput,
      ) => {
        if (!isAuthenticated()) throw new Error("로그인이 필요합니다.");

        set({ isMutatingWeeklyPlan: true });
        try {
          const weeklyPlan = get().weeklyPlan;
          const current = weeklyPlan.sessionPlans
            .flatMap((day) => day.exercises)
            .find((w) => w.id === workoutId);

          if (!current) {
            throw new Error("수정할 운동을 찾을 수 없습니다.");
          }

          await updateSessionExercise({
            sessionExerciseId: workoutId,
            exerciseId: payload.exerciseId,
          });

          await replaceWorkoutSetsForSessionExercise({
            sessionExerciseId: workoutId,
            plannedSets: payload.setDetails.map((set) => ({
              reps: set.plannedReps ?? 0,
              weight: set.plannedWeight ?? undefined,
            })),
          });

          const details = await fetchWorkoutSessionExercise(current.sessionId);
          const updatedExercise = details.find(
            (exercise) => exercise.id === workoutId,
          );

          if (!updatedExercise) {
            throw new Error("수정된 세션 운동을 찾을 수 없습니다.");
          }

          const updated: WeeklyPlanExercise = {
            ...updatedExercise,
            note: payload.note ?? current.note,
          };

          set((prev) => {
            const nextSessionPlans = prev.weeklyPlan.sessionPlans.map((day) =>
              day.sessionDate === sessionDate
                ? {
                    ...day,
                    exercises: day.exercises.map((workout) =>
                      workout.id === workoutId ? updated : workout,
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
        } finally {
          set({ isMutatingWeeklyPlan: false });
        }
      },

      removeWorkout: async (sessionDate: string, workoutId: string) => {
        if (!isAuthenticated()) throw new Error("로그인이 필요합니다.");

        set({ isMutatingWeeklyPlan: true });
        try {
          await deleteSessionExerciseRow(workoutId);
          set((prev) => {
            const nextSessionPlans = prev.weeklyPlan.sessionPlans.map((day) =>
              day.sessionDate === sessionDate
                ? {
                    ...day,
                    exercises: day.exercises.filter(
                      (workout) => workout.id !== workoutId,
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
        } finally {
          set({ isMutatingWeeklyPlan: false });
        }
      },
    }),
  ),
);

export const loadInitialData = useDataStore.getState().loadInitialData;
export const addTodaySessionExercise =
  useDataStore.getState().addTodaySessionExercise;
export const refreshExercises = useDataStore.getState().refreshExercises;
export const clearData = useDataStore.getState().clearData;
export const addExercise = useDataStore.getState().addExercise;
export const updateExercise = useDataStore.getState().updateExercise;
export const deleteExercise = useDataStore.getState().deleteExercise;
export const toggleWorkoutComplete =
  useDataStore.getState().toggleWorkoutComplete;
export const toggleSetComplete = useDataStore.getState().toggleSetComplete;
export const updateSetDetails = useDataStore.getState().updateSetDetails;
export const loadWeeklyPlan = useDataStore.getState().loadWeeklyPlan;
export const addWorkout = useDataStore.getState().addWorkout;
export const editWorkout = useDataStore.getState().editWorkout;
export const removeWorkout = useDataStore.getState().removeWorkout;
