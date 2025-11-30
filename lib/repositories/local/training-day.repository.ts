import type {
  TrainingDay,
  TrainingDayInput,
  TrainingStatus,
} from "../../models/training-day";
import type { ILocalTrainingDayRepository, Syncable } from "../types";
import { generateUUID, getDatabase, nowISO } from "./database";

interface TrainingDayRow {
  id: string;
  training_date: string;
  title: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  sync_status: string;
}

function mapToTrainingDay(row: TrainingDayRow): TrainingDay & Syncable {
  return {
    id: row.id,
    trainingDate: row.training_date,
    title: row.title,
    status: row.status as TrainingStatus,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    syncStatus: row.sync_status as "pending" | "synced",
  };
}

export class LocalTrainingDayRepository implements ILocalTrainingDayRepository {
  async findByDate(date: string): Promise<TrainingDay | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<TrainingDayRow>(
      "SELECT * FROM training_days WHERE training_date = ?",
      [date],
    );
    return row ? mapToTrainingDay(row) : null;
  }

  async findByDateRange(
    startDate: string,
    endDate: string,
  ): Promise<TrainingDay[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<TrainingDayRow>(
      `SELECT * FROM training_days 
       WHERE training_date >= ? AND training_date <= ? 
       ORDER BY training_date ASC`,
      [startDate, endDate],
    );
    return rows.map(mapToTrainingDay);
  }

  async getOrCreate(date: string): Promise<TrainingDay> {
    const existing = await this.findByDate(date);
    if (existing) return existing;

    return this.create({ trainingDate: date, status: "planned" });
  }

  async create(input: TrainingDayInput): Promise<TrainingDay> {
    const db = await getDatabase();
    const id = generateUUID();
    const now = nowISO();

    await db.runAsync(
      `INSERT INTO training_days 
        (id, training_date, title, status, created_at, updated_at, sync_status)
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [
        id,
        input.trainingDate,
        input.title ?? null,
        input.status ?? "planned",
        now,
        now,
      ],
    );

    const created = await this.findByDate(input.trainingDate);
    if (!created) throw new Error("훈련일 생성 실패");
    return created;
  }

  async update(
    id: string,
    input: Partial<TrainingDayInput>,
  ): Promise<TrainingDay> {
    const db = await getDatabase();
    const now = nowISO();

    const sets: string[] = [];
    const values: (string | null)[] = [];

    if (input.trainingDate !== undefined) {
      sets.push("training_date = ?");
      values.push(input.trainingDate);
    }
    if (input.title !== undefined) {
      sets.push("title = ?");
      values.push(input.title ?? null);
    }
    if (input.status !== undefined) {
      sets.push("status = ?");
      values.push(input.status);
    }

    sets.push("updated_at = ?", "sync_status = 'pending'");
    values.push(now, id);

    await db.runAsync(
      `UPDATE training_days SET ${sets.join(", ")} WHERE id = ?`,
      values,
    );

    const row = await db.getFirstAsync<TrainingDayRow>(
      "SELECT * FROM training_days WHERE id = ?",
      [id],
    );
    if (!row) throw new Error("훈련일 수정 실패");
    return mapToTrainingDay(row);
  }

  async delete(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync("DELETE FROM training_days WHERE id = ?", [id]);
  }

  // Sync 전용 메서드
  async findAllPending(): Promise<(TrainingDay & Syncable)[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<TrainingDayRow>(
      "SELECT * FROM training_days WHERE sync_status = 'pending' ORDER BY created_at ASC",
    );
    return rows.map(mapToTrainingDay);
  }

  async markAsSynced(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      "UPDATE training_days SET sync_status = 'synced' WHERE id = ?",
      [id],
    );
  }

  async deleteSynced(): Promise<void> {
    const db = await getDatabase();
    await db.runAsync("DELETE FROM training_days WHERE sync_status = 'synced'");
  }
}
