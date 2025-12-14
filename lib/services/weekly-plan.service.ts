import type { WeeklyWorkoutInput } from "../../types/weekly-plan";
import type { DayExerciseWithDetails } from "../models/day-exercise";
import type { IRepository } from "../repositories/types";

export class WeeklyPlanService {
  constructor(private readonly repo: IRepository) {}

  loadWeekData(startISO: string, endISO: string) {
    return this.repo.dayExercise.findByDateRange(startISO, endISO);
  }

  async addWorkout(input: {
    trainingDate: string;
    workout: WeeklyWorkoutInput;
    displayOrder: number;
  }): Promise<DayExerciseWithDetails> {
    const trainingDay = await this.repo.trainingDay.getOrCreate(
      input.trainingDate,
    );

    const dayExercise = await this.repo.dayExercise.create({
      trainingDayId: trainingDay.id,
      exerciseId: input.workout.exerciseId,
      displayOrder: input.displayOrder,
    });

    await this.repo.exerciseSet.createMany(
      dayExercise.id,
      input.workout.setDetails.map((s) => ({
        reps: s.plannedReps ?? null,
        weight: s.plannedWeight ?? null,
      })),
    );

    const exercises = await this.repo.dayExercise.findByTrainingDayId(
      trainingDay.id,
    );
    const created = exercises.find((e) => e.id === dayExercise.id);

    if (!created) {
      throw new Error("생성된 운동 정보를 찾을 수 없습니다.");
    }

    return created;
  }

  async editWorkout(input: {
    trainingDayId: string;
    workoutId: string;
    payload: WeeklyWorkoutInput;
  }): Promise<DayExerciseWithDetails> {
    await this.repo.dayExercise.update(input.workoutId, {
      exerciseId: input.payload.exerciseId,
    });

    await this.repo.exerciseSet.replaceAll(
      input.workoutId,
      input.payload.setDetails.map((s) => ({
        reps: s.plannedReps ?? null,
        weight: s.plannedWeight ?? null,
      })),
    );

    const exercises = await this.repo.dayExercise.findByTrainingDayId(
      input.trainingDayId,
    );
    const updated = exercises.find((e) => e.id === input.workoutId);

    if (!updated) {
      throw new Error("수정된 운동을 찾을 수 없습니다.");
    }

    return updated;
  }

  removeWorkout(workoutId: string): Promise<void> {
    return this.repo.dayExercise.delete(workoutId);
  }
}
