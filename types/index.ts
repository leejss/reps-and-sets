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
  completed: boolean;
  date: string;
}

export interface User {
  name: string;
  email: string;
  profilePhoto?: string;
}
