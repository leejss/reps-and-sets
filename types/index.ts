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

export interface TodayWorkout {
  id: string;
  exerciseId: string;
  exerciseName: string;
  muscleGroup: string;
  reps: number;
  sets: number;
  weight?: number;
  completed: boolean; // 전체 완료 여부 (모든 세트 완료 시 true)
  completedSets: boolean[]; // 각 세트별 완료 여부 [set1, set2, set3, ...]
  date: string;
}

export interface User {
  name: string;
  email: string;
  profilePhoto?: string;
}
