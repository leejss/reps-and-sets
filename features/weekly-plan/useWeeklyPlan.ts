import { useCallback, useEffect, useMemo, useState } from "react";

import {
  createWeeklyPlanWorkout,
  deleteWeeklyPlanWorkout,
  fetchWeeklyPlanWorkouts,
  getWeekdayFromDate,
  ScheduledWorkoutRecord,
  syncWorkoutLogFromSchedule,
  updateWeeklyPlanWorkout,
} from "@/lib/database";
import {
  formatChipDate,
  formatLocalDateISO,
  getCurrentDate,
  getStartOfWeek,
} from "@/lib/date";
import { useAppStore } from "@/stores/app-store";

import {
  DayPlan,
  Weekday,
  WEEKDAY_LABELS,
  WEEKDAY_ORDER,
  WeeklyPlan,
  WeeklyWorkout,
  WeeklyWorkoutInput,
} from "./types";

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
    const weekday = getWeekdayFromDate(record.scheduledDate);
    const targetDay = dayPlanMap[weekday];
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
  const anchorDate = useMemo(() => getCurrentDate(), []);
  const initialPlan = useMemo(
    () => buildEmptyPlan(formatLocalDateISO(anchorDate)),
    [anchorDate],
  );

  const refreshTodayWorkouts = useAppStore((state) => state.refreshWorkouts);

  const [plan, setPlan] = useState<WeeklyPlan>(initialPlan);
  const [selectedDay, setSelectedDay] = useState<Weekday>("Mon");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState(false);

  const populatePlan = useCallback(
    (records: ScheduledWorkoutRecord[], weekStartDate: string) => {
      const basePlan = buildEmptyPlan(weekStartDate);
      setPlan(mergeWorkoutsIntoPlan(basePlan, records));
    },
    [],
  );

  const loadWeeklyPlan = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchWeeklyPlanWorkouts(anchorDate.toDate());
      populatePlan(data.workouts, data.weekStartDate);
      setError(null);
    } catch (err) {
      console.error("주간 계획 로드 실패:", err);
      setError("주간 계획을 불러오지 못했습니다.");
      setPlan(buildEmptyPlan(formatLocalDateISO(anchorDate)));
    } finally {
      setIsLoading(false);
    }
  }, [anchorDate, populatePlan]);

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
        const orderIndex = targetDay.workouts.length;
        const created = await createWeeklyPlanWorkout({
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

        try {
          const synced = await syncWorkoutLogFromSchedule({
            scheduledWorkoutId: updated.id,
            workout: payload,
          });
          if (synced) {
            await refreshTodayWorkouts();
          }
        } catch (syncError) {
          console.error("오늘의 운동 동기화 실패:", syncError);
        }
      } finally {
        setIsMutating(false);
      }
    },
    [refreshTodayWorkouts],
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
