import React, { createContext, useContext, useState } from 'react';
import { Exercise, TodayWorkout, User } from '../types';

interface AppContextType {
  exercises: Exercise[];
  todayWorkouts: TodayWorkout[];
  user: User;
  darkMode: boolean;
  addExercise: (exercise: Omit<Exercise, 'id' | 'createdAt'>) => void;
  addTodayWorkout: (workout: Omit<TodayWorkout, 'id' | 'completedSets'>) => void;
  toggleWorkoutComplete: (id: string) => void;
  toggleSetComplete: (workoutId: string, setIndex: number) => void;
  toggleDarkMode: () => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const defaultExercises: Exercise[] = [
  {
    id: '1',
    name: 'Bench Press',
    muscleGroup: 'Chest',
    description: 'Classic chest exercise',
    createdAt: new Date(),
  },
  {
    id: '2',
    name: 'Squat',
    muscleGroup: 'Legs',
    description: 'Compound leg exercise',
    createdAt: new Date(),
  },
  {
    id: '3',
    name: 'Deadlift',
    muscleGroup: 'Back',
    description: 'Full body compound movement',
    createdAt: new Date(),
  },
];

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [exercises, setExercises] = useState<Exercise[]>(defaultExercises);
  const [todayWorkouts, setTodayWorkouts] = useState<TodayWorkout[]>([]);
  const [darkMode, setDarkMode] = useState(true);
  const [user] = useState<User>({
    name: 'Alex Johnson',
    email: 'alex@example.com',
  });

  const addExercise = (exercise: Omit<Exercise, 'id' | 'createdAt'>) => {
    const newExercise: Exercise = {
      ...exercise,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setExercises([...exercises, newExercise]);
  };

  const addTodayWorkout = (workout: Omit<TodayWorkout, 'id' | 'completedSets'>) => {
    const newWorkout: TodayWorkout = {
      ...workout,
      id: Date.now().toString(),
      completedSets: Array(workout.sets).fill(false), // 세트 수만큼 false로 초기화
    };
    setTodayWorkouts([...todayWorkouts, newWorkout]);
  };

  const toggleWorkoutComplete = (id: string) => {
    setTodayWorkouts(
      todayWorkouts.map((w) => {
        if (w.id === id) {
          const newCompleted = !w.completed;
          // 전체 완료 토글 시 모든 세트도 함께 토글
          return {
            ...w,
            completed: newCompleted,
            completedSets: w.completedSets.map(() => newCompleted),
          };
        }
        return w;
      })
    );
  };

  const toggleSetComplete = (workoutId: string, setIndex: number) => {
    setTodayWorkouts(
      todayWorkouts.map((w) => {
        if (w.id === workoutId) {
          const newCompletedSets = [...w.completedSets];
          newCompletedSets[setIndex] = !newCompletedSets[setIndex];
          
          // 모든 세트가 완료되었는지 확인
          const allCompleted = newCompletedSets.every(set => set === true);
          
          return {
            ...w,
            completedSets: newCompletedSets,
            completed: allCompleted,
          };
        }
        return w;
      })
    );
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const logout = () => {
    console.log('Logging out...');
  };

  return (
    <AppContext.Provider
      value={{
        exercises,
        todayWorkouts,
        user,
        darkMode,
        addExercise,
        addTodayWorkout,
        toggleWorkoutComplete,
        toggleSetComplete,
        toggleDarkMode,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
