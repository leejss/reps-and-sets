import type {
  ExerciseSet,
  ExerciseSetActualInput,
  ExerciseSetPlanInput,
} from "../../models/exercise-set";
import type { ILocalExerciseSetRepository, Syncable } from "../types";
import { generateUUID, getDatabase, nowISO } from "./database";

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
  created_at: string;
  updated_at: string;
  sync_status: string;
}

function mapToExerciseSet(row: ExerciseSetRow): ExerciseSet & Syncable {
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
    syncStatus: row.sync_status as "pending" | "synced",
  };
}

export class LocalExerciseSetRepository implements ILocalExerciseSetRepository {
  async findByDayExerciseId(dayExerciseId: string): Promise<ExerciseSet[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<ExerciseSetRow>(
      `SELECT * FROM exercise_sets 
       WHERE day_exercise_id = ? 
       ORDER BY set_order ASC`,
      [dayExerciseId]
    );
    return rows.map(mapToExerciseSet);
  }

  async createMany(
    dayExerciseId: string,
    sets: ExerciseSetPlanInput[]
  ): Promise<ExerciseSet[]> {
    if (sets.length === 0) return [];

    const db = await getDatabase();
    const now = nowISO();
    const createdSets: ExerciseSet[] = [];

    for (let i = 0; i < sets.length; i++) {
      const set = sets[i];
      const id = generateUUID();

      await db.runAsync(
        `INSERT INTO exercise_sets 
          (id, day_exercise_id, set_order, planned_reps, planned_weight, 
           is_completed, created_at, updated_at, sync_status)
         VALUES (?, ?, ?, ?, ?, 0, ?, ?, 'pending')`,
        [
          id,
          dayExerciseId,
          i,
          set.reps ?? null,
          set.weight ?? null,
          now,
          now,
        ]
      );

      const row = await db.getFirstAsync<ExerciseSetRow>(
        "SELECT * FROM exercise_sets WHERE id = ?",
        [id]
      );
      if (row) createdSets.push(mapToExerciseSet(row));
    }

    return createdSets;
  }

  async replaceAll(
    dayExerciseId: string,
    sets: ExerciseSetPlanInput[]
  ): Promise<ExerciseSet[]> {
    const db = await getDatabase();

    // 기존 세트 삭제
    await db.runAsync(
      "DELETE FROM exercise_sets WHERE day_exercise_id = ?",
      [dayExerciseId]
    );

    if (sets.length === 0) return [];

    return this.createMany(dayExerciseId, sets);
  }

  async updateCompletion(
    dayExerciseId: string,
    setOrder: number,
    isCompleted: boolean
  ): Promise<void> {
    const db = await getDatabase();
    const now = nowISO();

    await db.runAsync(
      `UPDATE exercise_sets 
       SET is_completed = ?, completed_at = ?, updated_at = ?, sync_status = 'pending'
       WHERE day_exercise_id = ? AND set_order = ?`,
      [
        isCompleted ? 1 : 0,
        isCompleted ? now : null,
        now,
        dayExerciseId,
        setOrder,
      ]
    );
  }

  async updateActual(
    dayExerciseId: string,
    setOrder: number,
    input: ExerciseSetActualInput
  ): Promise<void> {
    const db = await getDatabase();
    const now = nowISO();

    await db.runAsync(
      `UPDATE exercise_sets 
       SET actual_reps = ?, actual_weight = ?, updated_at = ?, sync_status = 'pending'
       WHERE day_exercise_id = ? AND set_order = ?`,
      [
        input.actualReps,
        input.actualWeight ?? null,
        now,
        dayExerciseId,
        setOrder,
      ]
    );
  }

  async updateAllCompletion(
    dayExerciseId: string,
    isCompleted: boolean
  ): Promise<void> {
    const db = await getDatabase();
    const now = nowISO();

    await db.runAsync(
      `UPDATE exercise_sets 
       SET is_completed = ?, completed_at = ?, updated_at = ?, sync_status = 'pending'
       WHERE day_exercise_id = ?`,
      [isCompleted ? 1 : 0, isCompleted ? now : null, now, dayExerciseId]
    );
  }

  // Sync 전용 메서드
  async findAllPending(): Promise<(ExerciseSet & Syncable)[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<ExerciseSetRow>(
      "SELECT * FROM exercise_sets WHERE sync_status = 'pending' ORDER BY created_at ASC"
    );
    return rows.map(mapToExerciseSet);
  }

  async markAsSynced(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      "UPDATE exercise_sets SET sync_status = 'synced' WHERE id = ?",
      [id]
    );
  }

  async deleteSynced(): Promise<void> {
    const db = await getDatabase();
    await db.runAsync("DELETE FROM exercise_sets WHERE sync_status = 'synced'");
  }
}

