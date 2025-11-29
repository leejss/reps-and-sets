/**
 * 훈련 상태
 */
export type TrainingStatus = "planned" | "in_progress" | "completed";

/**
 * 훈련 일자 (Training Day)
 * 특정 날짜의 훈련 계획/기록
 */
export interface TrainingDay {
  id: string;
  trainingDate: string; // YYYY-MM-DD
  title?: string | null;
  status: TrainingStatus;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 훈련 일자 생성 입력
 */
export interface TrainingDayInput {
  trainingDate: string;
  title?: string;
  status?: TrainingStatus;
}

