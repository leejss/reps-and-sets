export interface Exercise {
  id: string;
  name: string;
  targetMuscleGroup: string;
  description?: string;
  link?: string;
  createdAt: Date;
}

export interface WorkoutSet {
  id?: string;
  /**
   * 세션 내 세트 순서 (workout_sets.set_order)
   */
  setOrder: number;
  /**
   * 계획 반복 수 (workout_sets.planned_reps)
   */
  plannedReps?: number | null;
  /**
   * 계획 무게 (workout_sets.planned_weight)
   */
  plannedWeight?: number | null;
  /**
   * 실제 반복 수 (workout_sets.actual_reps)
   */
  actualReps?: number | null;
  /**
   * 실제 무게 (workout_sets.actual_weight)
   */
  actualWeight?: number | null;
  /**
   * 세트 완료 여부 (workout_sets.is_completed)
   */
  completed: boolean;
}

export interface TodayWorkout {
  id: string;
  exerciseId: string;
  exerciseName: string;
  targetMuscleGroup: string;
  workoutSetList: WorkoutSet[];
  completed: boolean;
  date: string;
}

export interface User {
  name: string;
  email: string;
  profilePhoto?: string;
}

export interface ScheduledWorkoutRecord {
  id: string;
  scheduledDate: string;
  exerciseId: string;
  exerciseName: string;
  muscleGroup: string;
  setDetails: WorkoutSet[];
  note?: string;
  orderIndex: number;
}

export interface WeeklyPlanWorkoutsResult {
  weekStartDate: string;
  workouts: ScheduledWorkoutRecord[];
}
