import type { ExerciseSet } from "./exercise-set";

/**
 * 일별 운동 (Day Exercise)
 * 특정 훈련일에 포함된 운동 항목
 */
export interface DayExercise {
  id: string;
  trainingDayId: string;
  exerciseId: string | null;
  displayOrder: number;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 운동 정보가 포함된 일별 운동
 */
export interface DayExerciseWithDetails {
  id: string;
  trainingDayId: string;
  exerciseId: string | null;
  exerciseName: string;
  targetMuscleGroup: string;
  displayOrder: number;
  isCompleted: boolean;
  sets: ExerciseSet[];
  /** 운동이 삭제되었는지 여부 */
  isDeleted: boolean;
}

/**
 * 일별 운동 생성 입력
 */
export interface DayExerciseInput {
  trainingDayId: string;
  exerciseId: string;
  displayOrder: number;
}

/** 삭제된 운동의 기본 표시 텍스트 */
export const DELETED_EXERCISE_NAME = "삭제된 운동";
export const DELETED_EXERCISE_MUSCLE_GROUP = "미분류";

