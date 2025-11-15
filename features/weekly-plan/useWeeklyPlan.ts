import { useState } from "react";

import {
  DayPlan,
  Weekday,
  WeeklyPlan,
  WeeklyWorkout,
  WeeklyWorkoutInput,
} from "./types";

const initialPlan: WeeklyPlan = {
  weekRange: "11.11 - 11.17",
  dayPlans: [
    {
      id: "Mon",
      label: "월요일",
      dateLabel: "11.11",
      workouts: [
        {
          id: "mon-1",
          exerciseId: "ex-1",
          exerciseName: "벤치 프레스",
          muscleGroup: "가슴",
          setDetails: [
            { reps: 10, weight: 60, completed: false },
            { reps: 10, weight: 60, completed: false },
            { reps: 10, weight: 60, completed: false },
            { reps: 10, weight: 60, completed: false },
            { reps: 10, weight: 60, completed: false },
          ],
        },
      ],
    },
    {
      id: "Tue",
      label: "화요일",
      dateLabel: "11.12",
      workouts: [],
    },
    {
      id: "Wed",
      label: "수요일",
      dateLabel: "11.13",
      workouts: [
        {
          id: "wed-1",
          exerciseId: "ex-2",
          exerciseName: "스쿼트",
          muscleGroup: "하체",
          setDetails: [
            { reps: 8, weight: 100, completed: false },
            { reps: 8, weight: 100, completed: false },
            { reps: 8, weight: 100, completed: false },
            { reps: 8, weight: 100, completed: false },
          ],
        },
      ],
    },
    {
      id: "Thu",
      label: "목요일",
      dateLabel: "11.14",
      workouts: [],
    },
    {
      id: "Fri",
      label: "금요일",
      dateLabel: "11.15",
      workouts: [
        {
          id: "fri-1",
          exerciseId: "ex-3",
          exerciseName: "데드리프트",
          muscleGroup: "등",
          setDetails: [
            { reps: 8, weight: 70, completed: false },
            { reps: 8, weight: 70, completed: false },
            { reps: 8, weight: 70, completed: false },
            { reps: 8, weight: 70, completed: false },
            { reps: 8, weight: 70, completed: false },
          ],
        },
      ],
    },
    {
      id: "Sat",
      label: "토요일",
      dateLabel: "11.16",
      workouts: [],
    },
    {
      id: "Sun",
      label: "일요일",
      dateLabel: "11.17",
      workouts: [],
    },
  ],
};

export const useWeeklyPlan = () => {
  const [plan, setPlan] = useState<WeeklyPlan>(initialPlan);
  const [selectedDay, setSelectedDay] = useState<Weekday>("Mon");

  const updateDayPlans = (updater: (dayPlans: DayPlan[]) => DayPlan[]) => {
    setPlan((prev) => ({
      ...prev,
      dayPlans: updater(prev.dayPlans),
    }));
  };

  const addWorkout = (dayId: Weekday, workout: WeeklyWorkoutInput) => {
    updateDayPlans((dayPlans) =>
      dayPlans.map((day) =>
        day.id === dayId
          ? {
              ...day,
              workouts: [
                ...day.workouts,
                {
                  ...workout,
                  id: `weekly-${Date.now()}-${Math.random()
                    .toString(36)
                    .slice(2, 6)}`,
                },
              ],
            }
          : day,
      ),
    );
  };

  const editWorkout = (
    dayId: Weekday,
    workoutId: string,
    nextWorkout: WeeklyWorkoutInput,
  ) => {
    updateDayPlans((dayPlans) =>
      dayPlans.map((day) =>
        day.id === dayId
          ? {
              ...day,
              workouts: day.workouts.map((workout) =>
                workout.id === workoutId
                  ? { ...workout, ...nextWorkout }
                  : workout,
              ),
            }
          : day,
      ),
    );
  };

  const removeWorkout = (dayId: Weekday, workoutId: string) => {
    updateDayPlans((dayPlans) =>
      dayPlans.map((day) =>
        day.id === dayId
          ? {
              ...day,
              workouts: day.workouts.filter(
                (workout: WeeklyWorkout) => workout.id !== workoutId,
              ),
            }
          : day,
      ),
    );
  };

  return {
    plan,
    selectedDay,
    selectDay: setSelectedDay,
    addWorkout,
    editWorkout,
    removeWorkout,
  };
};
