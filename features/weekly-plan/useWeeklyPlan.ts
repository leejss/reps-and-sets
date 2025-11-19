import {
  formatChipDate,
  formatLocalDateISO,
  getWeekRange,
  type WeekRange,
} from "@/lib/date";
import {
  deleteSessionExercise as deleteSessionExerciseRow,
  fetchWorkoutSessionExercise,
  insertSessionExercise,
  updateSessionExercise,
  type SessionExerciseWithSets,
} from "@/lib/queries/workoutSessionExercises.query";
import {
  fetchWorkoutSessionsWithDetailsInRange,
  getOrCreateWorkoutSession,
} from "@/lib/queries/workoutSessions.query";
import {
  insertWorkoutSetsForSessionExercise,
  replaceWorkoutSetsForSessionExercise,
} from "@/lib/queries/workoutSets.query";
import { getWeekdayFromDate } from "@/lib/utils";
import {
  DayPlan,
  Weekday,
  WEEKDAY_LABELS,
  WEEKDAY_ORDER,
  WeeklyPlan,
  WeeklyWorkout,
  WeeklyWorkoutInput,
} from "@/types/weekly-plan";
import { useCallback, useEffect, useState } from "react";

type WeekRangeInput = Parameters<typeof getWeekRange>[0];

const buildEmptyPlanFromRange = (range: WeekRange): WeeklyPlan => {
  const { startDay, endDay, startISO, endISO } = range;

  const dayPlans: DayPlan[] = WEEKDAY_ORDER.map((weekday, index) => {
    const current = startDay.add(index, "day");
    return {
      id: weekday,
      label: WEEKDAY_LABELS[weekday],
      dateLabel: formatChipDate(current),
      dateISO: formatLocalDateISO(current),
      workouts: [],
    };
  });

  return {
    weekStartDate: startISO,
    weekEndDate: endISO,
    weekRange: `${formatChipDate(startDay)} - ${formatChipDate(endDay)}`,
    dayPlans,
  };
};

const buildEmptyPlan = (pivotDate: WeekRangeInput): WeeklyPlan => {
  const range = getWeekRange(pivotDate);
  return buildEmptyPlanFromRange(range);
};

const createWeeklyPlanFromWorkouts = (
  range: WeekRange,
  workouts: WeeklyWorkout[],
): WeeklyPlan => {
  const basePlan = buildEmptyPlanFromRange(range);

  const dayPlanMap = basePlan.dayPlans.reduce<Record<Weekday, DayPlan>>(
    (acc, day) => {
      acc[day.id] = { ...day, workouts: [] };
      return acc;
    },
    {} as Record<Weekday, DayPlan>,
  );

  workouts.forEach((record) => {
    const weekday = getWeekdayFromDate(record.scheduledDate);
    const targetDay = dayPlanMap[weekday];
    if (!targetDay) return;
    targetDay.workouts.push(record);
  });

  return {
    ...basePlan,
    dayPlans: WEEKDAY_ORDER.map((weekday) => {
      const day = dayPlanMap[weekday];
      return {
        ...day,
        workouts: [...day.workouts].sort(
          (a, b) => a.orderInSession - b.orderInSession,
        ),
      };
    }),
  };
};

const mapSessionExerciseToWeeklyWorkout = (
  session: { id: string; date: string },
  exercise: SessionExerciseWithSets,
): WeeklyWorkout => ({
  id: exercise.id,
  sessionId: session.id,
  scheduledDate: session.date,
  exerciseId: exercise.exerciseId,
  exerciseName: exercise.exerciseName,
  muscleGroup: exercise.targetMuscleGroup,
  orderInSession: exercise.orderInSession,
  setDetails: exercise.sets.map((set, index) => ({
    id: set.id,
    setOrder: set.setOrder ?? index,
    plannedReps: set.plannedReps ?? 0,
    plannedWeight: set.plannedWeight ?? undefined,
    actualReps: set.actualReps ?? null,
    actualWeight: set.actualWeight ?? null,
    completed: false,
  })),
  note: undefined,
});

export const useWeeklyPlan = () => {
  const [plan, setPlan] = useState<WeeklyPlan>(() =>
    buildEmptyPlan(new Date()),
  );
  const [selectedDay, setSelectedDay] = useState<Weekday>(() =>
    getWeekdayFromDate(new Date()),
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState(false);

  const loadWeeklyPlan = useCallback(async () => {
    setIsLoading(true);
    const today = new Date();
    try {
      const range = getWeekRange(today);
      const { startISO, endISO } = range;
      const workouts: WeeklyWorkout[] = [];

      const sessionsWithDetails = await fetchWorkoutSessionsWithDetailsInRange(
        startISO,
        endISO,
      );

      sessionsWithDetails.forEach(({ session, exercises }) => {
        exercises.forEach((exercise) => {
          workouts.push(
            mapSessionExerciseToWeeklyWorkout(
              { id: session.id, date: session.date },
              exercise,
            ),
          );
        });
      });
      setPlan(createWeeklyPlanFromWorkouts(range, workouts));
      setError(null);
    } catch (err) {
      console.error("주간 계획 로드 실패:", err);
      setError("주간 계획을 불러오지 못했습니다.");
      setPlan(buildEmptyPlan(today));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWeeklyPlan();
  }, [loadWeeklyPlan]);

  const addWorkout = useCallback(
    async (dayId: Weekday, workout: WeeklyWorkoutInput) => {
      setIsMutating(true);
      try {
        const targetDay = plan.dayPlans.find((day) => day.id === dayId);
        if (!targetDay) {
          throw new Error("선택한 요일 정보를 찾을 수 없습니다.");
        }
        const session = await getOrCreateWorkoutSession(targetDay.dateISO);

        const orderInSession = targetDay.workouts.length;
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

        const created: WeeklyWorkout = {
          ...mapSessionExerciseToWeeklyWorkout(session, sessionExercise),
          note: workout.note,
        };
        setPlan((prev) => {
          const nextDayPlans = prev.dayPlans.map((day) =>
            day.id === dayId
              ? {
                  ...day,
                  workouts: [...day.workouts, created],
                }
              : day,
          );
          return { ...prev, dayPlans: nextDayPlans };
        });
      } finally {
        setIsMutating(false);
      }
    },
    [plan.dayPlans],
  );

  const editWorkout = useCallback(
    async (dayId: Weekday, workoutId: string, payload: WeeklyWorkoutInput) => {
      setIsMutating(true);
      try {
        const current = plan.dayPlans
          .flatMap((day) => day.workouts)
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

        const updated: WeeklyWorkout = {
          ...mapSessionExerciseToWeeklyWorkout(
            { id: current.sessionId, date: current.scheduledDate },
            updatedExercise,
          ),
          note: payload.note ?? current.note,
        };
        setPlan((prev) => {
          const nextDayPlans = prev.dayPlans.map((day) =>
            day.id === dayId
              ? {
                  ...day,
                  workouts: day.workouts.map((workout) =>
                    workout.id === workoutId ? updated : workout,
                  ),
                }
              : day,
          );
          return { ...prev, dayPlans: nextDayPlans };
        });
      } finally {
        setIsMutating(false);
      }
    },
    [plan.dayPlans],
  );

  const removeWorkout = useCallback(
    async (dayId: Weekday, workoutId: string) => {
      setIsMutating(true);
      try {
        await deleteSessionExerciseRow(workoutId);
        setPlan((prev) => {
          const nextDayPlans = prev.dayPlans.map((day) =>
            day.id === dayId
              ? {
                  ...day,
                  workouts: day.workouts.filter(
                    (workout) => workout.id !== workoutId,
                  ),
                }
              : day,
          );
          return { ...prev, dayPlans: nextDayPlans };
        });
      } finally {
        setIsMutating(false);
      }
    },
    [],
  );

  return {
    plan,
    selectedDay,
    selectDay: setSelectedDay,
    addWorkout,
    editWorkout,
    removeWorkout,
    isLoading,
    error,
    isMutating,
    refresh: loadWeeklyPlan,
  };
};
