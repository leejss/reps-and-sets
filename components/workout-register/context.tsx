import { ExerciseSet } from "@/lib/models/exercise-set";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface TodayExerciseRegisterContextType {
  selectedExerciseId: string | null;
  setSelectedExerciseId: (id: string | null) => void;
  numberOfSets: string;
  setNumberOfSets: (value: string) => void;
  sets: ExerciseSet[];
  setSets: React.Dispatch<React.SetStateAction<ExerciseSet[]>>;
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

const TodayExerciseRegisterContext = createContext<
  TodayExerciseRegisterContextType | undefined
>(undefined);

export function TodayExerciseRegisterProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(
    null,
  );
  const [numberOfSets, setNumberOfSets] = useState("");
  const [sets, setSets] = useState<ExerciseSet[]>([]);
  const [useUniformValues, setUseUniformValues] = useState(false);
  const [uniformReps, setUniformReps] = useState("");
  const [uniformWeight, setUniformWeight] = useState("");

  useEffect(() => {
    const numSets = parseInt(numberOfSets);
    if (numSets > 0 && numSets <= 20) {
      setSets(
        Array.from({ length: numSets }, (_, index) => ({
          setOrder: index,
          isCompleted: false,
        })),
      );
    } else {
      setSets([]);
    }
  }, [numberOfSets]);

  useEffect(() => {
    if (useUniformValues && sets.length > 0) {
      const reps = parseInt(uniformReps) || 0;
      const weight = uniformWeight ? parseFloat(uniformWeight) : undefined;
      setSets((prev) =>
        prev.map((set) => ({
          ...set,
          plannedReps: reps,
          plannedWeight: weight,
        })),
      );
    }
  }, [uniformReps, uniformWeight, useUniformValues, sets]);

  const handleSetDetailChange = (
    index: number,
    field: "reps" | "weight",
    value: string,
  ) => {
    const newSetDetails = [...sets];
    if (field === "reps") {
      newSetDetails[index].plannedReps = parseInt(value) || 0;
    } else {
      newSetDetails[index].plannedWeight = value
        ? parseFloat(value)
        : undefined;
    }
    setSets(newSetDetails);
  };

  const resetState = () => {
    setSelectedExerciseId(null);
    setNumberOfSets("");
    setSets([]);
    setUseUniformValues(true);
    setUniformReps("");
    setUniformWeight("");
  };

  return (
    <TodayExerciseRegisterContext.Provider
      value={{
        selectedExerciseId,
        setSelectedExerciseId,
        numberOfSets,
        setNumberOfSets,
        sets,
        setSets,
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
    </TodayExerciseRegisterContext.Provider>
  );
}

export function useTodayExerciseRegister() {
  const context = useContext(TodayExerciseRegisterContext);
  if (context === undefined) {
    throw new Error(
      "useWorkoutRegister must be used within a WorkoutRegisterProvider",
    );
  }
  return context;
}
