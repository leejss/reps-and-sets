import React, { createContext, useContext, useState, useEffect } from 'react';
import { Exercise, TodayWorkout, User } from '../types';
import { useAuth } from './auth-context';

interface AppContextType {
  exercises: Exercise[];
  todayWorkouts: TodayWorkout[];
  user: User;
  darkMode: boolean;
  addExercise: (exercise: Omit<Exercise, 'id' | 'createdAt'>) => void;
  addTodayWorkout: (workout: Omit<TodayWorkout, 'id'>) => void;
  toggleWorkoutComplete: (id: string) => void;
  toggleSetComplete: (workoutId: string, setIndex: number) => void;
  updateSetDetails: (workoutId: string, setIndex: number, reps: number, weight?: number) => void;
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
  const auth = useAuth();
  
  // AuthContext의 user를 AppContext의 user로 사용
  const [user, setUser] = useState<User>({
    name: 'Guest',
    email: 'guest@example.com',
  });

  // AuthContext의 user 정보가 변경되면 동기화
  useEffect(() => {
    if (auth.user) {
      setUser({
        name: auth.user.name,
        email: auth.user.email,
      });
    }
  }, [auth.user]);

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
      todayWorkouts.map((w) => {
        if (w.id === id) {
          const newCompleted = !w.completed;
          // 전체 완료 토글 시 모든 세트도 함께 토글
          return {
            ...w,
            completed: newCompleted,
            setDetails: w.setDetails.map((set) => ({
              ...set,
              completed: newCompleted,
            })),
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
          const newSetDetails = [...w.setDetails];
          newSetDetails[setIndex] = {
            ...newSetDetails[setIndex],
            completed: !newSetDetails[setIndex].completed,
          };
          
          // 모든 세트가 완료되었는지 확인
          const allCompleted = newSetDetails.every((set) => set.completed === true);
          
          return {
            ...w,
            setDetails: newSetDetails,
            completed: allCompleted,
          };
        }
        return w;
      })
    );
  };

  const updateSetDetails = (workoutId: string, setIndex: number, reps: number, weight?: number) => {
    setTodayWorkouts(
      todayWorkouts.map((w) => {
        if (w.id === workoutId) {
          const newSetDetails = [...w.setDetails];
          newSetDetails[setIndex] = {
            ...newSetDetails[setIndex],
            reps,
            weight,
          };
          
          return {
            ...w,
            setDetails: newSetDetails,
          };
        }
        return w;
      })
    );
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const logout = async () => {
    try {
      await auth.logout();
      // 로그아웃 시 앱 상태 초기화 (선택적)
      setTodayWorkouts([]);
    } catch (error) {
      console.error('Logout error in AppContext:', error);
    }
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
        updateSetDetails,
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
