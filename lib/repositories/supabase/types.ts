/**
 * 새 스키마에 맞는 Supabase 테이블 타입 정의
 * Supabase 마이그레이션 실행 후 `supabase gen types typescript`로 재생성 필요
 */

export type TrainingStatus = "planned" | "in_progress" | "completed";

// ============================================================
// exercise_library 테이블
// ============================================================

export interface ExerciseLibraryRow {
  id: string;
  user_id: string | null;
  name: string;
  target_muscle_group: string;
  description: string | null;
  external_link: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExerciseLibraryInsert {
  id?: string;
  user_id?: string | null;
  name: string;
  target_muscle_group: string;
  description?: string | null;
  external_link?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ExerciseLibraryUpdate {
  name?: string;
  target_muscle_group?: string;
  description?: string | null;
  external_link?: string | null;
  updated_at?: string;
}

// ============================================================
// training_days 테이블
// ============================================================

export interface TrainingDayRow {
  id: string;
  user_id: string;
  training_date: string;
  title: string | null;
  status: TrainingStatus;
  created_at: string;
  updated_at: string;
}

export interface TrainingDayInsert {
  id?: string;
  user_id: string;
  training_date: string;
  title?: string | null;
  status?: TrainingStatus;
  created_at?: string;
  updated_at?: string;
}

export interface TrainingDayUpdate {
  training_date?: string;
  title?: string | null;
  status?: TrainingStatus;
  updated_at?: string;
}

// ============================================================
// day_exercises 테이블
// ============================================================

export interface DayExerciseRow {
  id: string;
  training_day_id: string;
  exercise_id: string | null;
  display_order: number;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface DayExerciseInsert {
  id?: string;
  training_day_id: string;
  exercise_id?: string | null;
  display_order?: number;
  is_completed?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface DayExerciseUpdate {
  exercise_id?: string | null;
  display_order?: number;
  is_completed?: boolean;
  updated_at?: string;
}

// ============================================================
// exercise_sets 테이블
// ============================================================

export interface ExerciseSetRow {
  id: string;
  day_exercise_id: string;
  set_order: number;
  planned_reps: number | null;
  planned_weight: number | null;
  actual_reps: number | null;
  actual_weight: number | null;
  is_completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExerciseSetInsert {
  id?: string;
  day_exercise_id: string;
  set_order: number;
  planned_reps?: number | null;
  planned_weight?: number | null;
  actual_reps?: number | null;
  actual_weight?: number | null;
  is_completed?: boolean;
  completed_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ExerciseSetUpdate {
  set_order?: number;
  planned_reps?: number | null;
  planned_weight?: number | null;
  actual_reps?: number | null;
  actual_weight?: number | null;
  is_completed?: boolean;
  completed_at?: string | null;
  updated_at?: string;
}

// ============================================================
// Joined Types
// ============================================================

export interface DayExerciseJoinedRow extends DayExerciseRow {
  exercise_library: ExerciseLibraryRow | null;
  exercise_sets: ExerciseSetRow[];
}

export interface TrainingDayWithExercisesRow extends TrainingDayRow {
  day_exercises: DayExerciseJoinedRow[];
}

