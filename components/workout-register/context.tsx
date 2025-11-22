import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface WorkoutSet {
  setOrder: number;
  plannedReps?: number;
  plannedWeight?: number;
  completed: boolean;
}

interface WorkoutRegisterContextType {
  selectedExerciseId: string | null;
  setSelectedExerciseId: (id: string | null) => void;
  numberOfSets: string;
  setNumberOfSets: (value: string) => void;
  workoutSetList: WorkoutSet[];
  setWorkoutSetList: React.Dispatch<React.SetStateAction<WorkoutSet[]>>;
  useUniformValues: boolean;
  setUseUniformValues: (value: boolean) => void;
  uniformReps: string;
  setUniformReps: (value: string) => void;
  uniformWeight: string;
  setUniformWeight: (value: string) => void;
  handleSetDetailChange: (
    index: number,
    field: "reps" | "weight",
    value: string,
  ) => void;
  resetState: () => void;
}

const WorkoutRegisterContext = createContext<
  WorkoutRegisterContextType | undefined
>(undefined);

export function WorkoutRegisterProvider({ children }: { children: ReactNode }) {
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(
    null,
  );
  const [numberOfSets, setNumberOfSets] = useState("");
  const [workoutSetList, setWorkoutSetList] = useState<WorkoutSet[]>([]);
  const [useUniformValues, setUseUniformValues] = useState(false);
  const [uniformReps, setUniformReps] = useState("");
  const [uniformWeight, setUniformWeight] = useState("");

  useEffect(() => {
    const numSets = parseInt(numberOfSets);
    if (numSets > 0 && numSets <= 20) {
      setWorkoutSetList(
        Array.from({ length: numSets }, (_, index) => ({
          setOrder: index,
          plannedReps: 0,
          plannedWeight: undefined,
          completed: false,
        })),
      );
    } else {
      setWorkoutSetList([]);
    }
  }, [numberOfSets]);

  useEffect(() => {
    if (useUniformValues && workoutSetList.length > 0) {
      const reps = parseInt(uniformReps) || 0;
      const weight = uniformWeight ? parseFloat(uniformWeight) : undefined;
      setWorkoutSetList((prev) =>
        prev.map((set) => ({
          ...set,
          plannedReps: reps,
          plannedWeight: weight,
        })),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uniformReps, uniformWeight, useUniformValues]);

  const handleSetDetailChange = (
    index: number,
    field: "reps" | "weight",
    value: string,
  ) => {
    const newSetDetails = [...workoutSetList];
    if (field === "reps") {
      newSetDetails[index].plannedReps = parseInt(value) || 0;
    } else {
      newSetDetails[index].plannedWeight = value
        ? parseFloat(value)
        : undefined;
    }
    setWorkoutSetList(newSetDetails);
  };

  const resetState = () => {
    setSelectedExerciseId(null);
    setNumberOfSets("");
    setWorkoutSetList([]);
    setUseUniformValues(true);
    setUniformReps("");
    setUniformWeight("");
  };

  return (
    <WorkoutRegisterContext.Provider
      value={{
        selectedExerciseId,
        setSelectedExerciseId,
        numberOfSets,
        setNumberOfSets,
        workoutSetList,
        setWorkoutSetList,
        useUniformValues,
        setUseUniformValues,
        uniformReps,
        setUniformReps,
        uniformWeight,
        setUniformWeight,
        handleSetDetailChange,
        resetState,
      }}
    >
      {children}
    </WorkoutRegisterContext.Provider>
  );
}

export function useWorkoutRegister() {
  const context = useContext(WorkoutRegisterContext);
  if (context === undefined) {
    throw new Error(
      "useWorkoutRegister must be used within a WorkoutRegisterProvider",
    );
  }
  return context;
}
