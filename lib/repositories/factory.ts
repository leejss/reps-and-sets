import { LocalDayExerciseRepository } from "./local/day-exercise.repository";
import { LocalExerciseRepository } from "./local/exercise-library.repository";
import { LocalExerciseSetRepository } from "./local/exercise-set.repository";
import { LocalTrainingDayRepository } from "./local/training-day.repository";
import { SupabaseDayExerciseRepository } from "./supabase/day-exercise.repository";
import { SupabaseExerciseRepository } from "./supabase/exercise-library.repository";
import { SupabaseExerciseSetRepository } from "./supabase/exercise-set.repository";
import { SupabaseTrainingDayRepository } from "./supabase/training-day.repository";
import type { ILocalRepository, IRepository } from "./types";

let supabaseRepository: IRepository | null = null;
let localRepository: ILocalRepository | null = null;

/**
 * Supabase Repository 인스턴스 반환 (싱글톤)
 */
export function getSupabaseRepository(): IRepository {
  if (!supabaseRepository) {
    supabaseRepository = {
      exercise: new SupabaseExerciseRepository(),
      trainingDay: new SupabaseTrainingDayRepository(),
      dayExercise: new SupabaseDayExerciseRepository(),
      exerciseSet: new SupabaseExerciseSetRepository(),
    };
  }
  return supabaseRepository;
}

/**
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

/**
 * 인증 상태에 따라 적절한 Repository 반환
 */
export function getRepository(isAuthenticated: boolean): IRepository {
  return isAuthenticated ? getSupabaseRepository() : getLocalRepository();
}
