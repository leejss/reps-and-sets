/**
 * 운동 세트 (Exercise Set)
 * 각 운동의 세트별 반복/무게 정보
 */
export interface ExerciseSet {
  id?: string;
  dayExerciseId?: string;
  /** 세트 순서 */
  setOrder: number;
  /** 계획 반복 수 */
  plannedReps?: number | null;
  /** 계획 무게 (kg) */
  plannedWeight?: number | null;
  /** 실제 반복 수 */
  actualReps?: number | null;
  /** 실제 무게 (kg) */
  actualWeight?: number | null;
  /** 세트 완료 여부 */
  isCompleted: boolean;
  /** 완료 시간 */
  completedAt?: Date | null;
}

/**
 * 세트 계획 입력
 */
export interface ExerciseSetPlanInput {
  reps?: number | null;
  weight?: number | null;
}

/**
 * 세트 실제 기록 입력
 */
export interface ExerciseSetActualInput {
  actualReps: number;
  actualWeight?: number | null;
}

