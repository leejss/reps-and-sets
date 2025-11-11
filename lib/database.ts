/**
 * 데이터베이스 헬퍼 함수
 * 
 * Supabase 데이터베이스와 상호작용하는 모든 함수를 정의합니다.
 * Single Responsibility Principle을 따라 각 함수는 하나의 책임만 가집니다.
 */

import { supabase } from './supabase';
import { Exercise, TodayWorkout, SetDetail } from '../types';

// ============================================
// 타입 변환 헬퍼
// ============================================

/**
 * 데이터베이스의 Date 문자열을 JavaScript Date 객체로 변환
 */
const parseDate = (dateString: string): Date => {
  return new Date(dateString);
};

/**
 * Date 객체를 ISO 문자열로 변환
 */
const formatDate = (date: Date): string => {
  return date.toISOString();
};

/**
 * Date 객체를 YYYY-MM-DD 형식으로 변환
 */
const formatDateOnly = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// ============================================
// Exercise CRUD 함수
// ============================================

/**
 * 현재 사용자의 모든 운동 목록 조회
 */
export async function fetchExercises(): Promise<Exercise[]> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('인증되지 않은 사용자입니다.');
  }

  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('운동 목록 조회 실패:', error);
    throw error;
  }

  // 데이터베이스 형식을 앱 형식으로 변환
  return (data || []).map(exercise => ({
    id: exercise.id,
    name: exercise.name,
    muscleGroup: exercise.muscle_group,
    description: exercise.description || undefined,
    link: exercise.link || undefined,
    createdAt: parseDate(exercise.created_at),
  }));
}

/**
 * 새 운동 생성
 */
export async function createExercise(
  exercise: Omit<Exercise, 'id' | 'createdAt'>
): Promise<Exercise> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('인증되지 않은 사용자입니다.');
  }

  const { data, error } = await supabase
    .from('exercises')
    .insert({
      user_id: user.id,
      name: exercise.name,
      muscle_group: exercise.muscleGroup,
      description: exercise.description || null,
      link: exercise.link || null,
    })
    .select()
    .single();

  if (error) {
    console.error('운동 생성 실패:', error);
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    muscleGroup: data.muscle_group,
    description: data.description || undefined,
    link: data.link || undefined,
    createdAt: parseDate(data.created_at),
  };
}

/**
 * 운동 수정
 */
export async function updateExercise(
  id: string,
  exercise: Omit<Exercise, 'id' | 'createdAt'>
): Promise<Exercise> {
  const { data, error } = await supabase
    .from('exercises')
    .update({
      name: exercise.name,
      muscle_group: exercise.muscleGroup,
      description: exercise.description || null,
      link: exercise.link || null,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('운동 수정 실패:', error);
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    muscleGroup: data.muscle_group,
    description: data.description || undefined,
    link: data.link || undefined,
    createdAt: parseDate(data.created_at),
  };
}

/**
 * 운동 삭제
 */
export async function deleteExercise(id: string): Promise<void> {
  const { error } = await supabase
    .from('exercises')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('운동 삭제 실패:', error);
    throw error;
  }
}

// ============================================
// Workout Log CRUD 함수
// ============================================

/**
 * 특정 날짜의 운동 기록 조회
 */
export async function fetchWorkoutLogs(date: Date): Promise<TodayWorkout[]> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('인증되지 않은 사용자입니다.');
  }

  const dateString = formatDateOnly(date);

  const { data, error } = await supabase
    .from('workout_logs')
    .select('*')
    .eq('user_id', user.id)
    .eq('workout_date', dateString)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('운동 기록 조회 실패:', error);
    throw error;
  }

  // 데이터베이스 형식을 앱 형식으로 변환
  return (data || []).map(log => ({
    id: log.id,
    exerciseId: log.exercise_id || '',
    exerciseName: log.exercise_name,
    muscleGroup: log.muscle_group,
    setDetails: log.set_details as SetDetail[],
    completed: log.completed,
    date: log.workout_date,
  }));
}

/**
 * 새 운동 기록 생성
 */
export async function createWorkoutLog(
  workout: Omit<TodayWorkout, 'id'>
): Promise<TodayWorkout> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('인증되지 않은 사용자입니다.');
  }

  const { data, error } = await supabase
    .from('workout_logs')
    .insert({
      user_id: user.id,
      exercise_id: workout.exerciseId || null,
      exercise_name: workout.exerciseName,
      muscle_group: workout.muscleGroup,
      set_details: workout.setDetails,
      completed: workout.completed,
      workout_date: workout.date,
    })
    .select()
    .single();

  if (error) {
    console.error('운동 기록 생성 실패:', error);
    throw error;
  }

  return {
    id: data.id,
    exerciseId: data.exercise_id || '',
    exerciseName: data.exercise_name,
    muscleGroup: data.muscle_group,
    setDetails: data.set_details as SetDetail[],
    completed: data.completed,
    date: data.workout_date,
  };
}

/**
 * 운동 기록 수정
 */
export async function updateWorkoutLog(
  id: string,
  workout: Partial<Omit<TodayWorkout, 'id'>>
): Promise<TodayWorkout> {
  const updateData: any = {};
  
  if (workout.exerciseId !== undefined) {
    updateData.exercise_id = workout.exerciseId || null;
  }
  if (workout.exerciseName !== undefined) {
    updateData.exercise_name = workout.exerciseName;
  }
  if (workout.muscleGroup !== undefined) {
    updateData.muscle_group = workout.muscleGroup;
  }
  if (workout.setDetails !== undefined) {
    updateData.set_details = workout.setDetails;
  }
  if (workout.completed !== undefined) {
    updateData.completed = workout.completed;
  }
  if (workout.date !== undefined) {
    updateData.workout_date = workout.date;
  }

  const { data, error } = await supabase
    .from('workout_logs')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('운동 기록 수정 실패:', error);
    throw error;
  }

  return {
    id: data.id,
    exerciseId: data.exercise_id || '',
    exerciseName: data.exercise_name,
    muscleGroup: data.muscle_group,
    setDetails: data.set_details as SetDetail[],
    completed: data.completed,
    date: data.workout_date,
  };
}

/**
 * 운동 기록 삭제
 */
export async function deleteWorkoutLog(id: string): Promise<void> {
  const { error } = await supabase
    .from('workout_logs')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('운동 기록 삭제 실패:', error);
    throw error;
  }
}

// ============================================
// 사용자 프로필 함수
// ============================================

/**
 * 사용자 프로필 조회
 */
export async function fetchUserProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('인증되지 않은 사용자입니다.');
  }

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('사용자 프로필 조회 실패:', error);
    throw error;
  }

  return data;
}

/**
 * 사용자 프로필 업데이트
 */
export async function updateUserProfile(updates: {
  name?: string;
  profile_photo?: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('인증되지 않은 사용자입니다.');
  }

  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', user.id)
    .select()
    .single();

  if (error) {
    console.error('사용자 프로필 업데이트 실패:', error);
    throw error;
  }

  return data;
}

