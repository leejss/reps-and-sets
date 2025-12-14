import type {
  ExerciseSet,
  ExerciseSetActualInput,
  ExerciseSetPlanInput,
} from "../models/exercise-set";
import type { IRepository } from "../repositories/types";

export class ExerciseSetService {
  constructor(private readonly repo: IRepository) {}

  findByDayExerciseId(dayExerciseId: string): Promise<ExerciseSet[]> {
    return this.repo.exerciseSet.findByDayExerciseId(dayExerciseId);
  }

  createMany(
    dayExerciseId: string,
    sets: ExerciseSetPlanInput[],
  ): Promise<ExerciseSet[]> {
    return this.repo.exerciseSet.createMany(dayExerciseId, sets);
  }

  replaceAll(
    dayExerciseId: string,
    sets: ExerciseSetPlanInput[],
  ): Promise<ExerciseSet[]> {
    return this.repo.exerciseSet.replaceAll(dayExerciseId, sets);
  }

  updateCompletion(
    dayExerciseId: string,
    setOrder: number,
    isCompleted: boolean,
  ): Promise<void> {
    return this.repo.exerciseSet.updateCompletion(
      dayExerciseId,
      setOrder,
      isCompleted,
    );
  }

  updateActual(
    dayExerciseId: string,
    setOrder: number,
    input: ExerciseSetActualInput,
  ): Promise<void> {
    return this.repo.exerciseSet.updateActual(dayExerciseId, setOrder, input);
  }

  updateAllCompletion(
    dayExerciseId: string,
    isCompleted: boolean,
  ): Promise<void> {
    return this.repo.exerciseSet.updateAllCompletion(
      dayExerciseId,
      isCompleted,
    );
  }
}
