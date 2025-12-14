import type {
  DayExercise,
  DayExerciseInput,
  DayExerciseWithDetails,
} from "../models/day-exercise";
import type { TrainingDay } from "../models/training-day";
import type { IRepository } from "../repositories/types";

export class DayExerciseService {
  constructor(private readonly repo: IRepository) {}

  findByTrainingDayId(
    trainingDayId: string,
  ): Promise<DayExerciseWithDetails[]> {
    return this.repo.dayExercise.findByTrainingDayId(trainingDayId);
  }

  findByDateRange(
    startDate: string,
    endDate: string,
  ): Promise<
    { trainingDay: TrainingDay; exercises: DayExerciseWithDetails[] }[]
  > {
    return this.repo.dayExercise.findByDateRange(startDate, endDate);
  }

  create(input: DayExerciseInput): Promise<DayExercise> {
    return this.repo.dayExercise.create(input);
  }

  update(
    id: string,
    input: Partial<Pick<DayExerciseInput, "exerciseId" | "displayOrder">>,
  ): Promise<DayExercise> {
    return this.repo.dayExercise.update(id, input);
  }

  updateCompletion(id: string, isCompleted: boolean): Promise<void> {
    return this.repo.dayExercise.updateCompletion(id, isCompleted);
  }

  delete(id: string): Promise<void> {
    return this.repo.dayExercise.delete(id);
  }
}
