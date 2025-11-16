export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  description?: string;
  link?: string;
  createdAt: Date;
}

export interface WorkoutSet {
  reps: number;
  sets: number;
  weight?: number;
}

export interface SetDetail {
  reps: number;
  weight?: number;
  completed: boolean;
}

export interface TodayWorkout {
  id: string;
  exerciseId: string;
  exerciseName: string;
  muscleGroup: string;
  setDetails: SetDetail[]; // 각 세트별 상세 정보 (reps, weight, completed)
  completed: boolean; // 전체 완료 여부 (모든 세트 완료 시 true)
  date: string;
  scheduledWorkoutId?: string;
}

export interface User {
  name: string;
  email: string;
  profilePhoto?: string;
}
