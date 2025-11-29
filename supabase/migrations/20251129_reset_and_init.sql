-- ============================================================
-- 데이터베이스 리셋 및 새 스키마 초기화
-- ⚠️ 주의: 모든 데이터가 삭제됩니다!
-- Supabase 대시보드 SQL Editor에서 직접 실행하세요.
-- ============================================================

-- 1. 기존 테이블 삭제 (FK 역순으로)
DROP TABLE IF EXISTS workout_sets CASCADE;
DROP TABLE IF EXISTS workout_session_exercises CASCADE;
DROP TABLE IF EXISTS workout_sessions CASCADE;
DROP TABLE IF EXISTS exercises CASCADE;

-- 새 스키마 테이블도 혹시 있으면 삭제
DROP TABLE IF EXISTS exercise_sets CASCADE;
DROP TABLE IF EXISTS day_exercises CASCADE;
DROP TABLE IF EXISTS training_days CASCADE;
DROP TABLE IF EXISTS exercise_library CASCADE;

-- 2. Enum 타입 삭제 및 재생성
DROP TYPE IF EXISTS workout_status_enum CASCADE;
DROP TYPE IF EXISTS training_status CASCADE;

CREATE TYPE training_status AS ENUM ('planned', 'in_progress', 'completed');

-- ============================================================
-- 3. 새 테이블 생성
-- ============================================================

-- profiles 테이블 (이미 존재하면 스킵)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- exercise_library (운동 종목 라이브러리)
CREATE TABLE exercise_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_muscle_group TEXT NOT NULL,
  description TEXT,
  external_link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- training_days (훈련 일자)
CREATE TABLE training_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  training_date DATE NOT NULL,
  title TEXT,
  status training_status NOT NULL DEFAULT 'planned',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- 같은 유저의 같은 날짜에 중복 세션 방지
  UNIQUE(user_id, training_date)
);

-- day_exercises (일별 운동)
CREATE TABLE day_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  training_day_id UUID NOT NULL REFERENCES training_days(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES exercise_library(id) ON DELETE SET NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- exercise_sets (운동 세트)
CREATE TABLE exercise_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_exercise_id UUID NOT NULL REFERENCES day_exercises(id) ON DELETE CASCADE,
  set_order INTEGER NOT NULL,
  planned_reps INTEGER,
  planned_weight NUMERIC(6,2),
  actual_reps INTEGER,
  actual_weight NUMERIC(6,2),
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 4. 인덱스 생성
-- ============================================================

CREATE INDEX idx_exercise_library_user ON exercise_library(user_id);
CREATE INDEX idx_training_days_user ON training_days(user_id);
CREATE INDEX idx_training_days_date ON training_days(training_date);
CREATE INDEX idx_day_exercises_training_day ON day_exercises(training_day_id);
CREATE INDEX idx_exercise_sets_day_exercise ON exercise_sets(day_exercise_id);

-- ============================================================
-- 5. RLS (Row Level Security) 설정
-- ============================================================

-- RLS 활성화
ALTER TABLE exercise_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE day_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_sets ENABLE ROW LEVEL SECURITY;

-- exercise_library 정책
CREATE POLICY "Users can view own exercises" ON exercise_library
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own exercises" ON exercise_library
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own exercises" ON exercise_library
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own exercises" ON exercise_library
  FOR DELETE USING (auth.uid() = user_id);

-- training_days 정책
CREATE POLICY "Users can view own training days" ON training_days
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own training days" ON training_days
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own training days" ON training_days
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own training days" ON training_days
  FOR DELETE USING (auth.uid() = user_id);

-- day_exercises 정책 (training_days를 통해 권한 확인)
CREATE POLICY "Users can view own day exercises" ON day_exercises
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM training_days 
      WHERE training_days.id = day_exercises.training_day_id 
      AND training_days.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own day exercises" ON day_exercises
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM training_days 
      WHERE training_days.id = day_exercises.training_day_id 
      AND training_days.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own day exercises" ON day_exercises
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM training_days 
      WHERE training_days.id = day_exercises.training_day_id 
      AND training_days.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own day exercises" ON day_exercises
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM training_days 
      WHERE training_days.id = day_exercises.training_day_id 
      AND training_days.user_id = auth.uid()
    )
  );

-- exercise_sets 정책 (day_exercises → training_days를 통해 권한 확인)
CREATE POLICY "Users can view own exercise sets" ON exercise_sets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM day_exercises
      JOIN training_days ON training_days.id = day_exercises.training_day_id
      WHERE day_exercises.id = exercise_sets.day_exercise_id
      AND training_days.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own exercise sets" ON exercise_sets
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM day_exercises
      JOIN training_days ON training_days.id = day_exercises.training_day_id
      WHERE day_exercises.id = exercise_sets.day_exercise_id
      AND training_days.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own exercise sets" ON exercise_sets
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM day_exercises
      JOIN training_days ON training_days.id = day_exercises.training_day_id
      WHERE day_exercises.id = exercise_sets.day_exercise_id
      AND training_days.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own exercise sets" ON exercise_sets
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM day_exercises
      JOIN training_days ON training_days.id = day_exercises.training_day_id
      WHERE day_exercises.id = exercise_sets.day_exercise_id
      AND training_days.user_id = auth.uid()
    )
  );

-- ============================================================
-- 6. updated_at 자동 업데이트 트리거
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_exercise_library_updated_at
  BEFORE UPDATE ON exercise_library
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_training_days_updated_at
  BEFORE UPDATE ON training_days
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_day_exercises_updated_at
  BEFORE UPDATE ON day_exercises
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exercise_sets_updated_at
  BEFORE UPDATE ON exercise_sets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 완료!
-- ============================================================
-- 이 SQL 실행 후:
-- 1. Supabase CLI로 타입 재생성: 
--    npx supabase gen types typescript --project-id <PROJECT_ID> > lib/database.types.ts
-- 2. 앱의 Supabase Repository 코드에서 테이블 이름 업데이트
-- ============================================================

