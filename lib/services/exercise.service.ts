import type { Exercise, ExerciseInput } from "../models/exercise";
import type { IRepository } from "../repositories/types";

export class ExerciseService {
  constructor(private readonly repo: IRepository) {}

  findAll(): Promise<Exercise[]> {
    return this.repo.exercise.findAll();
  }

  findById(id: string): Promise<Exercise | null> {
    return this.repo.exercise.findById(id);
  }

  create(input: ExerciseInput): Promise<Exercise> {
    return this.repo.exercise.create(input);
  }

  update(id: string, input: ExerciseInput): Promise<Exercise> {
    return this.repo.exercise.update(id, input);
  }

  delete(id: string): Promise<void> {
    return this.repo.exercise.delete(id);
  }
}
