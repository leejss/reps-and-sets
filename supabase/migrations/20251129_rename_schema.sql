-- ============================================================
-- 스키마 이름 변경 마이그레이션
-- Supabase 대시보드 SQL Editor에서 직접 실행하세요.
-- ============================================================

-- 1. 테이블 이름 변경
ALTER TABLE exercises RENAME TO exercise_library;
ALTER TABLE workout_sessions RENAME TO training_days;
ALTER TABLE workout_session_exercises RENAME TO day_exercises;
ALTER TABLE workout_sets RENAME TO exercise_sets;

-- 2. training_days 컬럼 이름 변경
ALTER TABLE training_days RENAME COLUMN session_date TO training_date;

-- 3. day_exercises 컬럼 이름 변경
ALTER TABLE day_exercises RENAME COLUMN session_id TO training_day_id;
ALTER TABLE day_exercises RENAME COLUMN order_in_session TO display_order;

-- 4. exercise_sets 컬럼 이름 변경
ALTER TABLE exercise_sets RENAME COLUMN session_exercise_id TO day_exercise_id;

-- 5. Foreign Key 제약조건 업데이트 (기존 FK 삭제 후 새로 생성)
-- day_exercises FK 업데이트
ALTER TABLE day_exercises DROP CONSTRAINT IF EXISTS workout_session_exercises_session_id_fkey;
ALTER TABLE day_exercises DROP CONSTRAINT IF EXISTS workout_session_exercises_exercise_id_fkey;

ALTER TABLE day_exercises 
  ADD CONSTRAINT day_exercises_training_day_id_fkey 
  FOREIGN KEY (training_day_id) REFERENCES training_days(id) ON DELETE CASCADE;

ALTER TABLE day_exercises 
  ADD CONSTRAINT day_exercises_exercise_id_fkey 
  FOREIGN KEY (exercise_id) REFERENCES exercise_library(id) ON DELETE SET NULL;

-- exercise_sets FK 업데이트
ALTER TABLE exercise_sets DROP CONSTRAINT IF EXISTS workout_sets_session_exercise_id_fkey;

ALTER TABLE exercise_sets 
  ADD CONSTRAINT exercise_sets_day_exercise_id_fkey 
  FOREIGN KEY (day_exercise_id) REFERENCES day_exercises(id) ON DELETE CASCADE;

-- 6. RLS 정책 업데이트 (기존 정책 삭제 후 새 테이블 이름으로 재생성)
-- exercise_library RLS
DROP POLICY IF EXISTS "Users can view their own exercises" ON exercise_library;
DROP POLICY IF EXISTS "Users can insert their own exercises" ON exercise_library;
DROP POLICY IF EXISTS "Users can update their own exercises" ON exercise_library;
DROP POLICY IF EXISTS "Users can delete their own exercises" ON exercise_library;

CREATE POLICY "Users can view their own exercises" ON exercise_library
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own exercises" ON exercise_library
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own exercises" ON exercise_library
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own exercises" ON exercise_library
  FOR DELETE USING (auth.uid() = user_id);

-- training_days RLS
DROP POLICY IF EXISTS "Users can view their own workout sessions" ON training_days;
DROP POLICY IF EXISTS "Users can insert their own workout sessions" ON training_days;
DROP POLICY IF EXISTS "Users can update their own workout sessions" ON training_days;
DROP POLICY IF EXISTS "Users can delete their own workout sessions" ON training_days;

CREATE POLICY "Users can view their own training days" ON training_days
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own training days" ON training_days
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own training days" ON training_days
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own training days" ON training_days
  FOR DELETE USING (auth.uid() = user_id);

-- day_exercises RLS (training_days를 통해 접근 권한 확인)
DROP POLICY IF EXISTS "Users can view their own session exercises" ON day_exercises;
DROP POLICY IF EXISTS "Users can insert their own session exercises" ON day_exercises;
DROP POLICY IF EXISTS "Users can update their own session exercises" ON day_exercises;
DROP POLICY IF EXISTS "Users can delete their own session exercises" ON day_exercises;

CREATE POLICY "Users can view their own day exercises" ON day_exercises
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM training_days 
      WHERE training_days.id = day_exercises.training_day_id 
      AND training_days.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own day exercises" ON day_exercises
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM training_days 
      WHERE training_days.id = day_exercises.training_day_id 
      AND training_days.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own day exercises" ON day_exercises
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM training_days 
      WHERE training_days.id = day_exercises.training_day_id 
      AND training_days.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own day exercises" ON day_exercises
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM training_days 
      WHERE training_days.id = day_exercises.training_day_id 
      AND training_days.user_id = auth.uid()
    )
  );

-- exercise_sets RLS (day_exercises -> training_days를 통해 접근 권한 확인)
DROP POLICY IF EXISTS "Users can view their own workout sets" ON exercise_sets;
DROP POLICY IF EXISTS "Users can insert their own workout sets" ON exercise_sets;
DROP POLICY IF EXISTS "Users can update their own workout sets" ON exercise_sets;
DROP POLICY IF EXISTS "Users can delete their own workout sets" ON exercise_sets;

CREATE POLICY "Users can view their own exercise sets" ON exercise_sets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM day_exercises
      JOIN training_days ON training_days.id = day_exercises.training_day_id
      WHERE day_exercises.id = exercise_sets.day_exercise_id
      AND training_days.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own exercise sets" ON exercise_sets
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM day_exercises
      JOIN training_days ON training_days.id = day_exercises.training_day_id
      WHERE day_exercises.id = exercise_sets.day_exercise_id
      AND training_days.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own exercise sets" ON exercise_sets
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM day_exercises
      JOIN training_days ON training_days.id = day_exercises.training_day_id
      WHERE day_exercises.id = exercise_sets.day_exercise_id
      AND training_days.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own exercise sets" ON exercise_sets
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM day_exercises
      JOIN training_days ON training_days.id = day_exercises.training_day_id
      WHERE day_exercises.id = exercise_sets.day_exercise_id
      AND training_days.user_id = auth.uid()
    )
  );

