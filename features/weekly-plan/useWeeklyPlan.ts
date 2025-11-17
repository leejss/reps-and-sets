import {
  formatChipDate,
  formatLocalDateISO,
  getCurrentDate,
  getStartOfWeek,
} from "@/lib/date";
import {
  createSessionExerciseWithSets,
  deleteSessionExercise,
  fetchSessionDetail,
  fetchSessionsInRange,
  getOrCreateSessionForDate,
  updateSessionExerciseAndSets,
  type SessionExercise,
} from "@/lib/queries/workoutSessions.query";
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
import { useCallback, useEffect, useMemo, useState } from "react";

const buildEmptyPlan = (weekStart: string): WeeklyPlan => {
  const weekStartDay = getStartOfWeek(weekStart);
  const weekEndDay = weekStartDay.add(6, "day");

  const dayPlans: DayPlan[] = WEEKDAY_ORDER.map((weekday, index) => {
    const current = weekStartDay.add(index, "day");
    return {
      id: weekday,
      label: WEEKDAY_LABELS[weekday],
      dateLabel: formatChipDate(current),
      dateISO: formatLocalDateISO(current),
      workouts: [],
    };
  });

  return {
    weekStartDate: formatLocalDateISO(weekStartDay),
    weekEndDate: formatLocalDateISO(weekEndDay),
    weekRange: `${formatChipDate(weekStartDay)} - ${formatChipDate(
      weekEndDay,
    )}`,
    dayPlans,
  };
};

const mergeWorkoutsIntoPlan = (
  basePlan: WeeklyPlan,
  workouts: WeeklyWorkout[],
): WeeklyPlan => {
  const orderMap = workouts.reduce<Record<string, number>>((acc, record) => {
    acc[record.id] = record.orderInSession;
    return acc;
  }, {});

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
          (a, b) => orderMap[a.id] - orderMap[b.id],
        ),
      };
    }),
  };
};

const mapSessionExerciseToWeeklyWorkout = (
  session: { id: string; date: string },
  exercise: SessionExercise,
): WeeklyWorkout => ({
  id: exercise.id,
  sessionId: session.id,
  scheduledDate: session.date,
  exerciseId: exercise.exerciseId,
  exerciseName: exercise.exerciseName,
  muscleGroup: exercise.muscleGroup,
  orderInSession: exercise.orderInSession,
  setDetails: exercise.sets.map((set) => ({
    reps: set.plannedReps ?? 0,
    weight: set.plannedWeight ?? undefined,
    completed: false,
  })),
  note: undefined,
});

export const useWeeklyPlan = () => {
  const anchorDate = useMemo(() => getCurrentDate(), []);
  const initialPlan = useMemo(
    () => buildEmptyPlan(formatLocalDateISO(anchorDate)),
    [anchorDate],
  );

  const [plan, setPlan] = useState<WeeklyPlan>(initialPlan);
  const [selectedDay, setSelectedDay] = useState<Weekday>("Mon");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState(false);

  const loadWeeklyPlan = useCallback(async () => {
    setIsLoading(true);
    try {
      const weekStartDay = getStartOfWeek(anchorDate);
      const weekEndDay = weekStartDay.add(6, "day");
      const weekStart = formatLocalDateISO(weekStartDay);
      const weekEnd = formatLocalDateISO(weekEndDay);

      const sessions = await fetchSessionsInRange(weekStart, weekEnd);
      const detailsList = await Promise.all(
        sessions.map((session) => fetchSessionDetail(session.id)),
      );

      const workouts: WeeklyWorkout[] = [];

      sessions.forEach((session, index) => {
        const exercises = detailsList[index];
        exercises.forEach((exercise) => {
          workouts.push(mapSessionExerciseToWeeklyWorkout(session, exercise));
        });
      });

      const basePlan = buildEmptyPlan(weekStart);
      setPlan(mergeWorkoutsIntoPlan(basePlan, workouts));
      setError(null);
    } catch (err) {
      console.error("주간 계획 로드 실패:", err);
      setError("주간 계획을 불러오지 못했습니다.");
      setPlan(buildEmptyPlan(formatLocalDateISO(anchorDate)));
    } finally {
      setIsLoading(false);
    }
  }, [anchorDate]);

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
        const session = await getOrCreateSessionForDate(targetDay.dateISO);

        const orderInSession = targetDay.workouts.length;
        const sessionExercise = await createSessionExerciseWithSets({
          sessionId: session.id,
          exerciseId: workout.exerciseId,
          orderInSession,
          plannedSets: workout.setDetails.map((set) => ({
            reps: set.reps,
            weight: set.weight,
          })),
        });

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

        const updatedExercise = await updateSessionExerciseAndSets({
          sessionExerciseId: workoutId,
          exerciseId: payload.exerciseId,
          plannedSets: payload.setDetails.map((set) => ({
            reps: set.reps,
            weight: set.weight,
          })),
        });

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
        await deleteSessionExercise(workoutId);
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
