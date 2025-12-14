import { getRepository } from "../repositories/factory";
import type { IRepository } from "../repositories/types";
import { DayExerciseService } from "./day-exercise.service";
import { ExerciseSetService } from "./exercise-set.service";
import { ExerciseService } from "./exercise.service";
import { TodayWorkoutService } from "./today-workout.service";
import { TrainingDayService } from "./training-day.service";
import { WeeklyPlanService } from "./weekly-plan.service";

export type Services = {
  exercise: ExerciseService;
  trainingDay: TrainingDayService;
  dayExercise: DayExerciseService;
  exerciseSet: ExerciseSetService;
  todayWorkout: TodayWorkoutService;
  weeklyPlan: WeeklyPlanService;
};

export function createServices(repo: IRepository): Services {
  return {
    exercise: new ExerciseService(repo),
    trainingDay: new TrainingDayService(repo),
    dayExercise: new DayExerciseService(repo),
    exerciseSet: new ExerciseSetService(repo),
    todayWorkout: new TodayWorkoutService(repo),
    weeklyPlan: new WeeklyPlanService(repo),
  };
}

let services: Services | null = null;

/**
 * Service 인스턴스 반환 (싱글톤)
 */
export function getServices(): Services {
  if (!services) {
    services = createServices(getRepository());
  }
  return services;
}
