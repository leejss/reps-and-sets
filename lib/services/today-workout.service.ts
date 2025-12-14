import type { DayExerciseWithDetails } from "../models/day-exercise";
import type { ExerciseSet } from "../models/exercise-set";
import type { IRepository } from "../repositories/types";

export class TodayWorkoutService {
  constructor(private readonly repo: IRepository) {}

  /**
   * 오늘 운동을 (trainingDay, dayExercise, sets)까지 한 번에 생성하고,
   * 상세 조회 결과(DayExerciseWithDetails)를 반환합니다.
   */
  async addTodayExercise(input: {
    exerciseId: string;
    sets: ExerciseSet[];
    date: string;
  }): Promise<DayExerciseWithDetails> {
    const trainingDay = await this.repo.trainingDay.getOrCreate(input.date);

    const currentExercises = await this.repo.dayExercise.findByTrainingDayId(
      trainingDay.id,
    );
    const displayOrder = currentExercises.length;

    const dayExercise = await this.repo.dayExercise.create({
      trainingDayId: trainingDay.id,
      exerciseId: input.exerciseId,
      displayOrder,
    });

    await this.repo.exerciseSet.createMany(
      dayExercise.id,
      input.sets.map((s) => ({
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

  setExerciseCompletion(
    dayExerciseId: string,
    isCompleted: boolean,
  ): Promise<void> {
    return this.repo.exerciseSet.updateAllCompletion(
      dayExerciseId,
      isCompleted,
    );
  }

  setSetCompletion(
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

  updateSetActual(
    dayExerciseId: string,
    setOrder: number,
    input: { actualReps: number; actualWeight: number | null },
  ): Promise<void> {
    return this.repo.exerciseSet.updateActual(dayExerciseId, setOrder, input);
  }
}
