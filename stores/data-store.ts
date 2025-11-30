import {
  formatChipDate,
  formatLocalDateISO,
  getWeekRange,
  type WeekRange,
} from "@/lib/date";
import type { DayExerciseWithDetails } from "@/lib/models/day-exercise";
import type { Exercise, ExerciseInput } from "@/lib/models/exercise";
import type { ExerciseSet } from "@/lib/models/exercise-set";
import type { TrainingDay } from "@/lib/models/training-day";
import { getRepository } from "@/lib/repositories/factory";
import type { IRepository } from "@/lib/repositories/types";
import type {
  WeeklyPlan,
  WeeklyPlanExercise,
  WeeklySessionPlan,
  WeeklyWorkoutInput,
} from "@/types/weekly-plan";
import { create } from "zustand";
import { combine } from "zustand/middleware";

function getRepo(): IRepository {
  return getRepository();
}

async function execute<T>(
  action: (repo: IRepository) => Promise<T>,
  options: {
    errorMessage?: string;
    onError?: (error: unknown) => void;
    onFinally?: () => void;
    shouldThrow?: boolean; // 기본값 true
  } = {},
): Promise<T | undefined> {
  const { errorMessage, onError, onFinally, shouldThrow = true } = options;
  try {
    const repo = getRepo();
    return await action(repo);
  } catch (error) {
    if (errorMessage) {
      console.error(errorMessage, error);
    }
    if (onError) {
      onError(error);
    }
    if (shouldThrow) {
      throw error;
    }
    return undefined;
  } finally {
    if (onFinally) {
      onFinally();
    }
  }
}

const buildEmptyPlanFromRange = (range: WeekRange): WeeklyPlan => {
  const { startDay, endDay, startISO, endISO } = range;

  const sessionPlans: WeeklySessionPlan[] = Array.from({ length: 7 }).map(
    (_, index) => {
      const current = startDay.add(index, "day");
      return {
        trainingDate: formatLocalDateISO(current),
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

const createWeeklyPlanFromData = (
  range: WeekRange,
  trainingDaysWithExercises: {
    trainingDay: TrainingDay;
    exercises: DayExerciseWithDetails[];
  }[],
): WeeklyPlan => {
  const basePlan = buildEmptyPlanFromRange(range);

  const sessionPlanMap = basePlan.sessionPlans.reduce<
    Record<string, WeeklySessionPlan>
  >((acc, sessionPlan) => {
    acc[sessionPlan.trainingDate] = { ...sessionPlan, exercises: [] };
    return acc;
  }, {});

  trainingDaysWithExercises.forEach(({ trainingDay, exercises }) => {
    const target = sessionPlanMap[trainingDay.trainingDate];
    if (!target) return;
    target.exercises = [...exercises]
      .sort((a, b) => a.displayOrder - b.displayOrder)
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
      exercises: sessionPlanMap[plan.trainingDate].exercises,
    })),
  };
};

export const useDataStore = create(
  combine(
    {
      exercises: [] as Exercise[],
      todayExercises: [] as DayExerciseWithDetails[],
      isLoadingExercises: false,
      isLoadingWorkouts: false,
      weeklyPlan: buildEmptyPlan(new Date()),
      isLoadingWeeklyPlan: false,
      weeklyPlanError: null as string | null,
      isMutatingWeeklyPlan: false,
    },
    (set, get) => ({
      refreshExercises: async () => {
        set({ isLoadingExercises: true });
        await execute(
          async (repo) => {
            const data = await repo.exercise.findAll();
            set({ exercises: data });
          },
          {
            errorMessage: "운동 목록 로드 실패:",
            onFinally: () => set({ isLoadingExercises: false }),
            shouldThrow: false, // 로드 실패가 앱을 멈추게 하지 않음
          },
        );
      },

      loadInitialData: async () => {
        await execute(
          async (repo) => {
            const today = new Date();
            const todayISO = formatLocalDateISO(today);

            // 오늘의 훈련일 조회 또는 생성
            const trainingDay = await repo.trainingDay.getOrCreate(todayISO);

            const [exercises, todayExercises] = await Promise.all([
              repo.exercise.findAll(),
              repo.dayExercise.findByTrainingDayId(trainingDay.id),
            ]);

            set({
              exercises,
              todayExercises,
            });

            await (
              get() as ReturnType<typeof get> & {
                loadWeeklyPlan: () => Promise<void>;
              }
            ).loadWeeklyPlan();
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

      addExercise: async (exercise: ExerciseInput) => {
        const tempExercise: Exercise = {
          ...exercise,
          id: `temp-${Date.now()}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // 1. 낙관적 업데이트
        set((state) => ({
          exercises: [tempExercise, ...state.exercises],
        }));

        // 2. 리포지토리 실행
        await execute(
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

        await execute(
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

        await execute(
          async (repo) => {
            await repo.exercise.delete(id);
          },
          {
            errorMessage: "운동 삭제 실패:",
            onError: () => set({ exercises: previousExercises }),
          },
        );
      },

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

        await execute(
          async (repo) => {
            // 훈련일 조회 또는 생성
            const trainingDay = await repo.trainingDay.getOrCreate(input.date);

            // 현재 운동 개수로 순서 결정
            const currentExercises = await repo.dayExercise.findByTrainingDayId(
              trainingDay.id,
            );
            const displayOrder = currentExercises.length;

            // 일별 운동 생성
            const dayExercise = await repo.dayExercise.create({
              trainingDayId: trainingDay.id,
              exerciseId: input.exerciseId,
              displayOrder,
            });

            // 세트 생성
            await repo.exerciseSet.createMany(
              dayExercise.id,
              input.sets.map((s) => ({
                reps: s.plannedReps ?? null,
                weight: s.plannedWeight ?? null,
              })),
            );

            // 생성된 데이터 조회 및 업데이트
            const exercises = await repo.dayExercise.findByTrainingDayId(
              trainingDay.id,
            );

            const created = exercises.find((e) => e.id === dayExercise.id);

            if (!created) {
              throw new Error("생성된 운동 정보를 찾을 수 없습니다.");
            }

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

        await execute(
          async (repo) => {
            const exercise = updatedExercises.find((w) => w.id === id);
            if (exercise) {
              await repo.exerciseSet.updateAllCompletion(
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

        await execute(
          async (repo) => {
            const exercise = updatedExercises.find(
              (w) => w.id === dayExerciseId,
            );
            if (exercise) {
              const targetSet = exercise.sets[setOrder];
              await repo.exerciseSet.updateCompletion(
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

        await execute(
          async (repo) => {
            await repo.exerciseSet.updateActual(dayExerciseId, setIndex, {
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

      /**
       * @param silent - true면 로딩 UI를 보여주지 않음 (백그라운드 새로고침)
       */
      loadWeeklyPlan: async (silent = false) => {
        // silent 모드가 아닐 때만 로딩 상태 표시
        if (!silent) {
          set({ isLoadingWeeklyPlan: true, weeklyPlanError: null });
        }
        const today = new Date();

        await execute(
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
              // silent 모드에서는 에러도 조용히 처리
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

        await execute(
          async (repo) => {
            const weeklyPlan = get().weeklyPlan;
            const targetDay = weeklyPlan.sessionPlans.find(
              (day) => day.trainingDate === trainingDate,
            );
            if (!targetDay) {
              throw new Error("선택한 날짜 정보를 찾을 수 없습니다.");
            }

            const trainingDay = await repo.trainingDay.getOrCreate(
              trainingDate,
            );

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
          },
          {
            // 낙관적 업데이트가 아닌 경우 에러 메시지는 기본적으로 로그에만 남김
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

        await execute(
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

        await execute(
          async (repo) => {
            await repo.dayExercise.delete(workoutId);
            set((prev) => {
              const nextSessionPlans = prev.weeklyPlan.sessionPlans.map((day) =>
                day.trainingDate === trainingDate
                  ? {
                      ...day,
                      exercises: day.exercises.filter(
                        (w) => w.id !== workoutId,
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
    }),
  ),
);

// 편의를 위한 내보내기
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
