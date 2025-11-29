import type { Exercise, ExerciseInput } from "../../models/exercise";
import type { ILocalExerciseRepository, Syncable } from "../types";
import { generateUUID, getDatabase, nowISO } from "./database";

interface ExerciseRow {
  id: string;
  name: string;
  target_muscle_group: string;
  description: string | null;
  external_link: string | null;
  created_at: string;
  updated_at: string;
  sync_status: string;
}

function mapToExercise(row: ExerciseRow): Exercise & Syncable {
  return {
    id: row.id,
    name: row.name,
    targetMuscleGroup: row.target_muscle_group,
    description: row.description ?? undefined,
    externalLink: row.external_link ?? undefined,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    syncStatus: row.sync_status as "pending" | "synced",
  };
}

export class LocalExerciseRepository implements ILocalExerciseRepository {
  async findAll(): Promise<Exercise[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<ExerciseRow>(
      "SELECT * FROM exercise_library ORDER BY created_at DESC",
    );
    return rows.map(mapToExercise);
  }

  async findById(id: string): Promise<Exercise | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<ExerciseRow>(
      "SELECT * FROM exercise_library WHERE id = ?",
      [id],
    );
    return row ? mapToExercise(row) : null;
  }

  async create(input: ExerciseInput): Promise<Exercise> {
    const db = await getDatabase();
    const id = generateUUID();
    const now = nowISO();

    await db.runAsync(
      `INSERT INTO exercise_library 
        (id, name, target_muscle_group, description, external_link, created_at, updated_at, sync_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        id,
        input.name,
        input.targetMuscleGroup,
        input.description ?? null,
        input.externalLink ?? null,
        now,
        now,
      ],
    );

    const created = await this.findById(id);
    if (!created) throw new Error("운동 생성 실패");
    return created;
  }

  async update(id: string, input: ExerciseInput): Promise<Exercise> {
    const db = await getDatabase();
    const now = nowISO();

    await db.runAsync(
      `UPDATE exercise_library 
       SET name = ?, target_muscle_group = ?, description = ?, external_link = ?, 
           updated_at = ?, sync_status = 'pending'
       WHERE id = ?`,
      [
        input.name,
        input.targetMuscleGroup,
        input.description ?? null,
        input.externalLink ?? null,
        now,
        id,
      ],
    );

    const updated = await this.findById(id);
    if (!updated) throw new Error("운동 수정 실패");
    return updated;
  }

  async delete(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync("DELETE FROM exercise_library WHERE id = ?", [id]);
  }

  // Sync 전용 메서드
  async findAllPending(): Promise<(Exercise & Syncable)[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<ExerciseRow>(
      "SELECT * FROM exercise_library WHERE sync_status = 'pending' ORDER BY created_at ASC",
    );
    return rows.map(mapToExercise);
  }

  async markAsSynced(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      "UPDATE exercise_library SET sync_status = 'synced' WHERE id = ?",
      [id],
    );
  }

  async deleteSynced(): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      "DELETE FROM exercise_library WHERE sync_status = 'synced'",
    );
  }
}
