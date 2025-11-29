/**
 * 운동 종목 (Exercise Library)
 * 사용자가 정의한 운동 종목 마스터 데이터
 */
export interface Exercise {
  id: string;
  name: string;
  targetMuscleGroup: string;
  description?: string;
  externalLink?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 운동 종목 생성/수정 입력
 */
export interface ExerciseInput {
  name: string;
  targetMuscleGroup: string;
  description?: string;
  externalLink?: string;
}

