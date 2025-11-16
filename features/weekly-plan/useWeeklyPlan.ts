import { useCallback, useEffect, useMemo, useState } from "react";

import {
  createWeeklyPlanWorkout,
  deleteWeeklyPlanWorkout,
  fetchWeeklyPlanWorkouts,
  ScheduledWorkoutRecord,
  updateWeeklyPlanWorkout,
} from "@/lib/database";

import {
  DayPlan,
  Weekday,
  WEEKDAY_LABELS,
  WEEKDAY_ORDER,
  WeeklyPlan,
  WeeklyWorkout,
  WeeklyWorkoutInput,
} from "./types";

const formatChipDate = (date: Date): string => {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${month}.${day}`;
};

const getStartOfWeek = (date: Date): Date => {
  const result = new Date(date);
  const day = result.getDay();
  const diffToMonday = (day + 6) % 7;
  result.setHours(0, 0, 0, 0);
  result.setDate(result.getDate() - diffToMonday);
  return result;
};

const buildEmptyPlan = (weekStart: Date): WeeklyPlan => {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const dayPlans: DayPlan[] = WEEKDAY_ORDER.map((weekday, index) => {
    const current = new Date(weekStart);
    current.setDate(weekStart.getDate() + index);
    return {
      id: weekday,
      label: WEEKDAY_LABELS[weekday],
      dateLabel: formatChipDate(current),
      dateISO: current.toISOString().split("T")[0],
      workouts: [],
    };
  });

  const toDateString = (date: Date) => date.toISOString().split("T")[0];

  return {
    weekStartDate: toDateString(weekStart),
    weekEndDate: toDateString(weekEnd),
    weekRange: `${formatChipDate(weekStart)} - ${formatChipDate(weekEnd)}`,
    dayPlans,
  };
};

const toWeeklyWorkout = (record: ScheduledWorkoutRecord): WeeklyWorkout => ({
  id: record.id,
  exerciseId: record.exerciseId,
  exerciseName: record.exerciseName,
  muscleGroup: record.muscleGroup,
  setDetails: record.setDetails,
  note: record.note,
});

const mergeWorkoutsIntoPlan = (
  basePlan: WeeklyPlan,
  workouts: ScheduledWorkoutRecord[],
): WeeklyPlan => {
  const orderMap = workouts.reduce<Record<string, number>>((acc, record) => {
    acc[record.id] = record.orderIndex;
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
    const targetDay = dayPlanMap[record.weekday];
    if (!targetDay) return;
    targetDay.workouts.push(toWeeklyWorkout(record));
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

export const useWeeklyPlan = () => {
  const anchorDate = useMemo(() => new Date(), []);
  const initialPlan = useMemo(
    () => buildEmptyPlan(getStartOfWeek(anchorDate)),
    [anchorDate],
  );

  const [plan, setPlan] = useState<WeeklyPlan>(initialPlan);
  const [selectedDay, setSelectedDay] = useState<Weekday>("Mon");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState(false);

  const populatePlan = useCallback(
    (records: ScheduledWorkoutRecord[], weekStartDate: string) => {
      const weekStart = new Date(`${weekStartDate}T00:00:00`);
      const basePlan = buildEmptyPlan(weekStart);
      setPlan(mergeWorkoutsIntoPlan(basePlan, records));
    },
    [],
  );

  const loadWeeklyPlan = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchWeeklyPlanWorkouts(anchorDate);
      populatePlan(data.workouts, data.weekStartDate);
      setError(null);
    } catch (err) {
      console.error("주간 계획 로드 실패:", err);
      setError("주간 계획을 불러오지 못했습니다.");
      setPlan(buildEmptyPlan(getStartOfWeek(anchorDate)));
    } finally {
      setIsLoading(false);
    }
  }, [anchorDate, populatePlan]);

  useEffect(() => {
    void loadWeeklyPlan();
  }, [loadWeeklyPlan]);

  const addWorkout = useCallback(
    async (dayId: Weekday, workout: WeeklyWorkoutInput) => {
      setIsMutating(true);
      try {
        const targetDay = plan.dayPlans.find((day) => day.id === dayId);
        if (!targetDay) {
          throw new Error("선택한 요일 정보를 찾을 수 없습니다.");
        }
        const orderIndex = targetDay.workouts.length;
        const created = await createWeeklyPlanWorkout({
          weekday: dayId,
          scheduledDate: targetDay.dateISO,
          workout,
          orderIndex,
        });
        setPlan((prev) => {
          const nextDayPlans = prev.dayPlans.map((day) =>
            day.id === dayId
              ? {
                  ...day,
                  workouts: [...day.workouts, toWeeklyWorkout(created)],
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
        const updated = await updateWeeklyPlanWorkout(workoutId, payload);
        setPlan((prev) => {
          const nextDayPlans = prev.dayPlans.map((day) =>
            day.id === dayId
              ? {
                  ...day,
                  workouts: day.workouts.map((workout) =>
                    workout.id === workoutId
                      ? toWeeklyWorkout(updated)
                      : workout,
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

  const removeWorkout = useCallback(
    async (dayId: Weekday, workoutId: string) => {
      setIsMutating(true);
      try {
        await deleteWeeklyPlanWorkout(workoutId);
        setPlan((prev) => {
          const nextDayPlans = prev.dayPlans.map((day) =>
            day.id === dayId
              ? {
                  ...day,
                  workouts: day.workouts.filter(
                    (workout: WeeklyWorkout) => workout.id !== workoutId,
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
