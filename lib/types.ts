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
  setDetails: SetDetail[];
  completed: boolean;
  date: string;
}

export interface User {
  name: string;
  email: string;
  profilePhoto?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  profile_photo: string | null;
  created_at: string;
  updated_at: string;
}

export interface ScheduledWorkoutRecord {
  id: string;
  scheduledDate: string;
  exerciseId: string;
  exerciseName: string;
  muscleGroup: string;
  setDetails: SetDetail[];
  note?: string;
  orderIndex: number;
}

export interface WeeklyPlanWorkoutsResult {
  weekStartDate: string;
  workouts: ScheduledWorkoutRecord[];
}
