-- 운동(exercise) 삭제 시 workout_session_exercises의 exercise_id를 NULL로 설정
-- 삭제된 운동은 "삭제된 운동"으로 표시됨

-- 1. exercise_id 컬럼을 nullable로 변경
ALTER TABLE public.workout_session_exercises 
  ALTER COLUMN exercise_id DROP NOT NULL;

-- 2. 기존 FK 제약조건 삭제
ALTER TABLE public.workout_session_exercises 
  DROP CONSTRAINT IF EXISTS workout_session_exercises_exercise_id_fkey;

-- 3. ON DELETE SET NULL로 새 FK 제약조건 추가
ALTER TABLE public.workout_session_exercises 
  ADD CONSTRAINT workout_session_exercises_exercise_id_fkey 
  FOREIGN KEY (exercise_id) REFERENCES public.exercises(id) ON DELETE SET NULL;

