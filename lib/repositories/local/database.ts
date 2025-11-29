import * as SQLite from "expo-sqlite";

const DATABASE_NAME = "repsandsets.db";
const DATABASE_VERSION = 1;

let db: SQLite.SQLiteDatabase | null = null;

/**
 * SQLite 데이터베이스 인스턴스 반환
 */
export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;

  db = await SQLite.openDatabaseAsync(DATABASE_NAME);
  await initializeSchema(db);
  return db;
}

/**
 * 데이터베이스 스키마 초기화
 */
async function initializeSchema(
  database: SQLite.SQLiteDatabase,
): Promise<void> {
  // 버전 체크 테이블 생성
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS schema_version (
      version INTEGER PRIMARY KEY
    );
  `);

  // 현재 버전 확인
  const result = await database.getFirstAsync<{ version: number }>(
    "SELECT version FROM schema_version LIMIT 1",
  );
  const currentVersion = result?.version ?? 0;

  if (currentVersion < DATABASE_VERSION) {
    await runMigrations(database, currentVersion);
  }
}

/**
 * 마이그레이션 실행
 */
async function runMigrations(
  database: SQLite.SQLiteDatabase,
  fromVersion: number,
): Promise<void> {
  // Version 0 -> 1: 초기 스키마 생성
  if (fromVersion < 1) {
    await database.execAsync(`
      -- exercise_library 테이블 (운동 종목 라이브러리)
      CREATE TABLE IF NOT EXISTS exercise_library (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        target_muscle_group TEXT NOT NULL,
        description TEXT,
        external_link TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now')),
        sync_status TEXT NOT NULL DEFAULT 'pending'
      );

      -- training_days 테이블 (훈련 일자)
      CREATE TABLE IF NOT EXISTS training_days (
        id TEXT PRIMARY KEY,
        training_date TEXT NOT NULL,
        title TEXT,
        status TEXT NOT NULL DEFAULT 'planned',
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now')),
        sync_status TEXT NOT NULL DEFAULT 'pending'
      );

      -- training_days 날짜 인덱스
      CREATE INDEX IF NOT EXISTS idx_training_days_date ON training_days(training_date);

      -- day_exercises 테이블 (일별 운동)
      CREATE TABLE IF NOT EXISTS day_exercises (
        id TEXT PRIMARY KEY,
        training_day_id TEXT NOT NULL,
        exercise_id TEXT,
        display_order INTEGER NOT NULL DEFAULT 0,
        is_completed INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now')),
        sync_status TEXT NOT NULL DEFAULT 'pending',
        FOREIGN KEY (training_day_id) REFERENCES training_days(id) ON DELETE CASCADE,
        FOREIGN KEY (exercise_id) REFERENCES exercise_library(id) ON DELETE SET NULL
      );

      -- day_exercises 인덱스
      CREATE INDEX IF NOT EXISTS idx_day_exercises_training_day ON day_exercises(training_day_id);

      -- exercise_sets 테이블 (운동 세트)
      CREATE TABLE IF NOT EXISTS exercise_sets (
        id TEXT PRIMARY KEY,
        day_exercise_id TEXT NOT NULL,
        set_order INTEGER NOT NULL,
        planned_reps INTEGER,
        planned_weight REAL,
        actual_reps INTEGER,
        actual_weight REAL,
        is_completed INTEGER NOT NULL DEFAULT 0,
        completed_at TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now')),
        sync_status TEXT NOT NULL DEFAULT 'pending',
        FOREIGN KEY (day_exercise_id) REFERENCES day_exercises(id) ON DELETE CASCADE
      );

      -- exercise_sets 인덱스
      CREATE INDEX IF NOT EXISTS idx_exercise_sets_day_exercise ON exercise_sets(day_exercise_id);

      -- 버전 업데이트
      INSERT OR REPLACE INTO schema_version (version) VALUES (1);
    `);
  }

  // 향후 마이그레이션은 여기에 추가
  // if (fromVersion < 2) { ... }
}

/**
 * UUID 생성 (expo-crypto 없이 간단한 구현)
 */
export function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * 현재 ISO 시간 문자열 반환
 */
export function nowISO(): string {
  return new Date().toISOString();
}

/**
 * 데이터베이스 닫기 (테스트용)
 */
export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.closeAsync();
    db = null;
  }
}

/**
 * 데이터베이스 초기화 (모든 테이블 삭제 - 테스트/디버그용)
 */
export async function resetDatabase(): Promise<void> {
  const database = await getDatabase();
  await database.execAsync(`
    DROP TABLE IF EXISTS exercise_sets;
    DROP TABLE IF EXISTS day_exercises;
    DROP TABLE IF EXISTS training_days;
    DROP TABLE IF EXISTS exercise_library;
    DROP TABLE IF EXISTS schema_version;
  `);
  await closeDatabase();
  await getDatabase(); // 재초기화
}
