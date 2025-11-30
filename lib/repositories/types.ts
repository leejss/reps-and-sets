import type {
  DayExercise,
  DayExerciseInput,
  DayExerciseWithDetails,
} from "../models/day-exercise";
import type { Exercise, ExerciseInput } from "../models/exercise";
import type {
  ExerciseSet,
  ExerciseSetActualInput,
  ExerciseSetPlanInput,
} from "../models/exercise-set";
import type { TrainingDay, TrainingDayInput } from "../models/training-day";

/**
 * 동기화 상태
 */
export type SyncStatus = "pending" | "synced";

/**
 * 동기화 가능한 엔티티
 */
export interface Syncable {
  syncStatus?: SyncStatus;
}

// ============================================================
// Exercise Library Repository
// ============================================================

export interface IExerciseRepository {
  /** 모든 운동 종목 조회 */
  findAll(): Promise<Exercise[]>;

  /** ID로 운동 종목 조회 */
  findById(id: string): Promise<Exercise | null>;

  /** 운동 종목 생성 */
  create(input: ExerciseInput): Promise<Exercise>;

  /** 운동 종목 수정 */
  update(id: string, input: ExerciseInput): Promise<Exercise>;

  /** 운동 종목 삭제 */
  delete(id: string): Promise<void>;
}

// ============================================================
// Training Day Repository
// ============================================================

export interface ITrainingDayRepository {
  /** 날짜로 훈련일 조회 (없으면 null) */
  findByDate(date: string): Promise<TrainingDay | null>;

  /** 날짜 범위로 훈련일 조회 */
  findByDateRange(startDate: string, endDate: string): Promise<TrainingDay[]>;

  /** 날짜로 훈련일 조회 또는 생성 */
  getOrCreate(date: string): Promise<TrainingDay>;

  /** 훈련일 생성 */
  create(input: TrainingDayInput): Promise<TrainingDay>;

  /** 훈련일 수정 */
  update(id: string, input: Partial<TrainingDayInput>): Promise<TrainingDay>;

  /** 훈련일 삭제 */
  delete(id: string): Promise<void>;
}

// ============================================================
// Day Exercise Repository
// ============================================================

export interface IDayExerciseRepository {
  /** 훈련일의 모든 운동 조회 (상세 정보 포함) */
  findByTrainingDayId(trainingDayId: string): Promise<DayExerciseWithDetails[]>;

  /** 날짜 범위의 모든 훈련일과 운동 조회 */
  findByDateRange(
    startDate: string,
    endDate: string,
  ): Promise<
    { trainingDay: TrainingDay; exercises: DayExerciseWithDetails[] }[]
  >;

  /** 일별 운동 생성 */
  create(input: DayExerciseInput): Promise<DayExercise>;

  /** 일별 운동 수정 */
  update(
    id: string,
    input: Partial<Pick<DayExerciseInput, "exerciseId" | "displayOrder">>,
  ): Promise<DayExercise>;

  /** 일별 운동 완료 상태 토글 */
  updateCompletion(id: string, isCompleted: boolean): Promise<void>;

  /** 일별 운동 삭제 */
  delete(id: string): Promise<void>;
}

// ============================================================
// Exercise Set Repository
// ============================================================

export interface IExerciseSetRepository {
  /** 일별 운동의 모든 세트 조회 */
  findByDayExerciseId(dayExerciseId: string): Promise<ExerciseSet[]>;

  /** 세트 일괄 생성 */
  createMany(
    dayExerciseId: string,
    sets: ExerciseSetPlanInput[],
  ): Promise<ExerciseSet[]>;

  /** 세트 교체 (기존 삭제 후 새로 생성) */
  replaceAll(
    dayExerciseId: string,
    sets: ExerciseSetPlanInput[],
  ): Promise<ExerciseSet[]>;

  /** 세트 완료 상태 업데이트 */
  updateCompletion(
    dayExerciseId: string,
    setOrder: number,
    isCompleted: boolean,
  ): Promise<void>;

  /** 세트 실제 기록 업데이트 */
  updateActual(
    dayExerciseId: string,
    setOrder: number,
    input: ExerciseSetActualInput,
  ): Promise<void>;

  /** 일별 운동의 모든 세트 완료 상태 일괄 업데이트 */
  updateAllCompletion(
    dayExerciseId: string,
    isCompleted: boolean,
  ): Promise<void>;
}

// ============================================================
// Combined Repository Interface
// ============================================================

export interface IRepository {
  exercise: IExerciseRepository;
  trainingDay: ITrainingDayRepository;
  dayExercise: IDayExerciseRepository;
  exerciseSet: IExerciseSetRepository;
}

// ============================================================
// Local Repository Extensions (for sync)
// ============================================================

export interface ILocalExerciseRepository extends IExerciseRepository {
  /** 동기화 대기 중인 운동 조회 */
  findAllPending(): Promise<(Exercise & Syncable)[]>;

  /** 동기화 완료 처리 */
  markAsSynced(id: string): Promise<void>;

  /** 동기화된 데이터 삭제 */
  deleteSynced(): Promise<void>;
}

export interface ILocalTrainingDayRepository extends ITrainingDayRepository {
  findAllPending(): Promise<(TrainingDay & Syncable)[]>;
  markAsSynced(id: string): Promise<void>;
  deleteSynced(): Promise<void>;
}

export interface ILocalDayExerciseRepository extends IDayExerciseRepository {
  findAllPending(): Promise<(DayExercise & Syncable)[]>;
  markAsSynced(id: string): Promise<void>;
  deleteSynced(): Promise<void>;
}

export interface ILocalExerciseSetRepository extends IExerciseSetRepository {
  findAllPending(): Promise<(ExerciseSet & Syncable)[]>;
  markAsSynced(id: string): Promise<void>;
  deleteSynced(): Promise<void>;
}

export interface ILocalRepository {
  exercise: ILocalExerciseRepository;
  trainingDay: ILocalTrainingDayRepository;
  dayExercise: ILocalDayExerciseRepository;
  exerciseSet: ILocalExerciseSetRepository;
}
