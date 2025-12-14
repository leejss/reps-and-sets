import type { TrainingDay, TrainingDayInput } from "../models/training-day";
import type { IRepository } from "../repositories/types";

export class TrainingDayService {
  constructor(private readonly repo: IRepository) {}

  findByDate(date: string): Promise<TrainingDay | null> {
    return this.repo.trainingDay.findByDate(date);
  }

  findByDateRange(startDate: string, endDate: string): Promise<TrainingDay[]> {
    return this.repo.trainingDay.findByDateRange(startDate, endDate);
  }

  getOrCreate(date: string): Promise<TrainingDay> {
    return this.repo.trainingDay.getOrCreate(date);
  }

  create(input: TrainingDayInput): Promise<TrainingDay> {
    return this.repo.trainingDay.create(input);
  }

  update(id: string, input: Partial<TrainingDayInput>): Promise<TrainingDay> {
    return this.repo.trainingDay.update(id, input);
  }

  delete(id: string): Promise<void> {
    return this.repo.trainingDay.delete(id);
  }
}
