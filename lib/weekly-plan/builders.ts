import {
  formatChipDate,
  formatLocalDateISO,
  getWeekRange,
  type WeekRange,
} from "@/lib/date";
import type { DayExerciseWithDetails } from "@/lib/models/day-exercise";
import type { TrainingDay } from "@/lib/models/training-day";
import type {
  WeeklyPlan,
  WeeklyPlanExercise,
  WeeklySessionPlan,
} from "@/types/weekly-plan";

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

export const buildEmptyPlan = (pivotDate: Date): WeeklyPlan => {
  const range = getWeekRange(pivotDate);
  return buildEmptyPlanFromRange(range);
};

export const createWeeklyPlanFromData = (
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
      .map((exercise) => ({ ...exercise } as WeeklyPlanExercise));
  });

  return {
    ...basePlan,
    sessionPlans: basePlan.sessionPlans.map((plan) => ({
      ...plan,
      exercises: sessionPlanMap[plan.trainingDate].exercises,
    })),
  };
};
