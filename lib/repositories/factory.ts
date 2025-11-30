import { LocalDayExerciseRepository } from "./local/day-exercise.repository";
import { LocalExerciseRepository } from "./local/exercise-library.repository";
import { LocalExerciseSetRepository } from "./local/exercise-set.repository";
import { LocalTrainingDayRepository } from "./local/training-day.repository";
import { SupabaseDayExerciseRepository } from "./supabase/day-exercise.repository";
import { SupabaseExerciseRepository } from "./supabase/exercise-library.repository";
import { SupabaseExerciseSetRepository } from "./supabase/exercise-set.repository";
import { SupabaseTrainingDayRepository } from "./supabase/training-day.repository";
import type { ILocalRepository, IRepository } from "./types";

let repository: IRepository | null = null;
let localRepository: ILocalRepository | null = null;

/**
 * Repository 인스턴스 반환 (싱글톤)
 * 현재는 Supabase만 단일 데이터 소스로 사용
 */
export function getRepository(): IRepository {
  if (!repository) {
    repository = {
      exercise: new SupabaseExerciseRepository(),
      trainingDay: new SupabaseTrainingDayRepository(),
      dayExercise: new SupabaseDayExerciseRepository(),
      exerciseSet: new SupabaseExerciseSetRepository(),
    };
  }
  return repository;
}

// 기존 API 호환성을 위한 alias
export const getSupabaseRepository = getRepository;

/**
 * @deprecated 현재 사용하지 않음. 동기화 기능 활성화 시 사용
 * Local Repository 인스턴스 반환 (싱글톤)
 */
export function getLocalRepository(): ILocalRepository {
  if (!localRepository) {
    localRepository = {
      exercise: new LocalExerciseRepository(),
      trainingDay: new LocalTrainingDayRepository(),
      dayExercise: new LocalDayExerciseRepository(),
      exerciseSet: new LocalExerciseSetRepository(),
    };
  }
  return localRepository;
}
