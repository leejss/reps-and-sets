import {
  DELETED_EXERCISE_MUSCLE_GROUP,
  DELETED_EXERCISE_NAME,
  type DayExercise,
  type DayExerciseInput,
  type DayExerciseWithDetails,
} from "../../models/day-exercise";
import type { ExerciseSet } from "../../models/exercise-set";
import type { TrainingDay, TrainingStatus } from "../../models/training-day";
import type { ILocalDayExerciseRepository, Syncable } from "../types";
import { generateUUID, getDatabase, nowISO } from "./database";

interface DayExerciseRow {
  id: string;
  training_day_id: string;
  exercise_id: string | null;
  display_order: number;
  is_completed: number;
  created_at: string;
  updated_at: string;
  sync_status: string;
}

interface DayExerciseJoinedRow extends DayExerciseRow {
  exercise_name: string | null;
  target_muscle_group: string | null;
}

interface TrainingDayRow {
  id: string;
  training_date: string;
  title: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

interface ExerciseSetRow {
  id: string;
  day_exercise_id: string;
  set_order: number;
  planned_reps: number | null;
  planned_weight: number | null;
  actual_reps: number | null;
  actual_weight: number | null;
  is_completed: number;
  completed_at: string | null;
}

function mapToDayExercise(row: DayExerciseRow): DayExercise & Syncable {
  return {
    id: row.id,
    trainingDayId: row.training_day_id,
    exerciseId: row.exercise_id,
    displayOrder: row.display_order,
    isCompleted: row.is_completed === 1,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    syncStatus: row.sync_status as "pending" | "synced",
  };
}

function mapToExerciseSet(row: ExerciseSetRow): ExerciseSet {
  return {
    id: row.id,
    dayExerciseId: row.day_exercise_id,
    setOrder: row.set_order,
    plannedReps: row.planned_reps,
    plannedWeight: row.planned_weight,
    actualReps: row.actual_reps,
    actualWeight: row.actual_weight,
    isCompleted: row.is_completed === 1,
    completedAt: row.completed_at ? new Date(row.completed_at) : null,
  };
}

function mapToTrainingDay(row: TrainingDayRow): TrainingDay {
  return {
    id: row.id,
    trainingDate: row.training_date,
    title: row.title,
    status: row.status as TrainingStatus,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export class LocalDayExerciseRepository implements ILocalDayExerciseRepository {
  async findByTrainingDayId(
    trainingDayId: string
  ): Promise<DayExerciseWithDetails[]> {
    const db = await getDatabase();

    const dayExercises = await db.getAllAsync<DayExerciseJoinedRow>(
      `SELECT de.*, el.name as exercise_name, el.target_muscle_group
       FROM day_exercises de
       LEFT JOIN exercise_library el ON de.exercise_id = el.id
       WHERE de.training_day_id = ?
       ORDER BY de.display_order ASC`,
      [trainingDayId]
    );

    const result: DayExerciseWithDetails[] = [];

    for (const de of dayExercises) {
      const sets = await db.getAllAsync<ExerciseSetRow>(
        `SELECT * FROM exercise_sets 
         WHERE day_exercise_id = ? 
         ORDER BY set_order ASC`,
        [de.id]
      );

      const isDeleted = de.exercise_id === null || de.exercise_name === null;

      result.push({
        id: de.id,
        trainingDayId: de.training_day_id,
        exerciseId: de.exercise_id,
        exerciseName: de.exercise_name ?? DELETED_EXERCISE_NAME,
        targetMuscleGroup: de.target_muscle_group ?? DELETED_EXERCISE_MUSCLE_GROUP,
        displayOrder: de.display_order,
        isCompleted: de.is_completed === 1,
        sets: sets.map(mapToExerciseSet),
        isDeleted,
      });
    }

    return result;
  }

  async findByDateRange(
    startDate: string,
    endDate: string
  ): Promise<{ trainingDay: TrainingDay; exercises: DayExerciseWithDetails[] }[]> {
    const db = await getDatabase();

    const trainingDays = await db.getAllAsync<TrainingDayRow>(
      `SELECT * FROM training_days 
       WHERE training_date >= ? AND training_date <= ? 
       ORDER BY training_date ASC`,
      [startDate, endDate]
    );

    const result: { trainingDay: TrainingDay; exercises: DayExerciseWithDetails[] }[] = [];

    for (const td of trainingDays) {
      const exercises = await this.findByTrainingDayId(td.id);
      result.push({
        trainingDay: mapToTrainingDay(td),
        exercises,
      });
    }

    return result;
  }

  async create(input: DayExerciseInput): Promise<DayExercise> {
    const db = await getDatabase();
    const id = generateUUID();
    const now = nowISO();

    await db.runAsync(
      `INSERT INTO day_exercises 
        (id, training_day_id, exercise_id, display_order, is_completed, created_at, updated_at, sync_status)
       VALUES (?, ?, ?, ?, 0, ?, ?, 'pending')`,
      [id, input.trainingDayId, input.exerciseId, input.displayOrder, now, now]
    );

    const row = await db.getFirstAsync<DayExerciseRow>(
      "SELECT * FROM day_exercises WHERE id = ?",
      [id]
    );
    if (!row) throw new Error("일별 운동 생성 실패");
    return mapToDayExercise(row);
  }

  async update(
    id: string,
    input: Partial<Pick<DayExerciseInput, "exerciseId" | "displayOrder">>
  ): Promise<DayExercise> {
    const db = await getDatabase();
    const now = nowISO();

    const sets: string[] = [];
    const values: (string | number | null)[] = [];

    if (input.exerciseId !== undefined) {
      sets.push("exercise_id = ?");
      values.push(input.exerciseId);
    }
    if (input.displayOrder !== undefined) {
      sets.push("display_order = ?");
      values.push(input.displayOrder);
    }

    if (sets.length === 0) {
      const row = await db.getFirstAsync<DayExerciseRow>(
        "SELECT * FROM day_exercises WHERE id = ?",
        [id]
      );
      if (!row) throw new Error("일별 운동을 찾을 수 없음");
      return mapToDayExercise(row);
    }

    sets.push("updated_at = ?", "sync_status = 'pending'");
    values.push(now, id);

    await db.runAsync(
      `UPDATE day_exercises SET ${sets.join(", ")} WHERE id = ?`,
      values
    );

    const row = await db.getFirstAsync<DayExerciseRow>(
      "SELECT * FROM day_exercises WHERE id = ?",
      [id]
    );
    if (!row) throw new Error("일별 운동 수정 실패");
    return mapToDayExercise(row);
  }

  async updateCompletion(id: string, isCompleted: boolean): Promise<void> {
    const db = await getDatabase();
    const now = nowISO();

    await db.runAsync(
      `UPDATE day_exercises 
       SET is_completed = ?, updated_at = ?, sync_status = 'pending' 
       WHERE id = ?`,
      [isCompleted ? 1 : 0, now, id]
    );
  }

  async delete(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync("DELETE FROM day_exercises WHERE id = ?", [id]);
  }

  // Sync 전용 메서드
  async findAllPending(): Promise<(DayExercise & Syncable)[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<DayExerciseRow>(
      "SELECT * FROM day_exercises WHERE sync_status = 'pending' ORDER BY created_at ASC"
    );
    return rows.map(mapToDayExercise);
  }

  async markAsSynced(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      "UPDATE day_exercises SET sync_status = 'synced' WHERE id = ?",
      [id]
    );
  }

  async deleteSynced(): Promise<void> {
    const db = await getDatabase();
    await db.runAsync("DELETE FROM day_exercises WHERE sync_status = 'synced'");
  }
}

