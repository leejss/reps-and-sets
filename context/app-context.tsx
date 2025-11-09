import React, { createContext, useContext, useState } from 'react';
import { Exercise, TodayWorkout, User } from '../types';

interface AppContextType {
  exercises: Exercise[];
  todayWorkouts: TodayWorkout[];
  user: User;
  darkMode: boolean;
  addExercise: (exercise: Omit<Exercise, 'id' | 'createdAt'>) => void;
  addTodayWorkout: (workout: Omit<TodayWorkout, 'id'>) => void;
  toggleWorkoutComplete: (id: string) => void;
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

  const addTodayWorkout = (workout: Omit<TodayWorkout, 'id'>) => {
    const newWorkout: TodayWorkout = {
      ...workout,
      id: Date.now().toString(),
    };
    setTodayWorkouts([...todayWorkouts, newWorkout]);
  };

  const toggleWorkoutComplete = (id: string) => {
    setTodayWorkouts(
      todayWorkouts.map((w) =>
        w.id === id ? { ...w, completed: !w.completed } : w
      )
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
