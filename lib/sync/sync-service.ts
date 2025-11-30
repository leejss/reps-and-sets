import {
  getLocalRepository,
  getSupabaseRepository,
} from "../repositories/factory";

export interface SyncProgress {
  phase:
    | "exercises"
    | "trainingDays"
    | "dayExercises"
    | "exerciseSets"
    | "done";
  current: number;
  total: number;
}

export type SyncProgressCallback = (progress: SyncProgress) => void;

/**
 * 로컬 데이터를 Supabase로 동기화
 * FK 관계 순서: exercises → trainingDays → dayExercises → exerciseSets
 */
export async function syncLocalToRemote(
  onProgress?: SyncProgressCallback,
): Promise<{ success: boolean; error?: string }> {
  const localRepo = getLocalRepository();
  const remoteRepo = getSupabaseRepository();

  // 로컬 ID → 원격 ID 매핑 (FK 관계 유지를 위해)
  const exerciseIdMap = new Map<string, string>();
  const trainingDayIdMap = new Map<string, string>();
  const dayExerciseIdMap = new Map<string, string>();

  try {
    // 1. Exercise Library 동기화
    const pendingExercises = await localRepo.exercise.findAllPending();
    onProgress?.({
      phase: "exercises",
      current: 0,
      total: pendingExercises.length,
    });

    for (let i = 0; i < pendingExercises.length; i++) {
      const exercise = pendingExercises[i];
      const created = await remoteRepo.exercise.create({
        name: exercise.name,
        targetMuscleGroup: exercise.targetMuscleGroup,
        description: exercise.description,
        externalLink: exercise.externalLink,
      });
      exerciseIdMap.set(exercise.id, created.id);
      await localRepo.exercise.markAsSynced(exercise.id);
      onProgress?.({
        phase: "exercises",
        current: i + 1,
        total: pendingExercises.length,
      });
    }

    // 2. Training Days 동기화
    const pendingTrainingDays = await localRepo.trainingDay.findAllPending();
    onProgress?.({
      phase: "trainingDays",
      current: 0,
      total: pendingTrainingDays.length,
    });

    for (let i = 0; i < pendingTrainingDays.length; i++) {
      const trainingDay = pendingTrainingDays[i];
      // getOrCreate를 사용하여 중복 방지
      const created = await remoteRepo.trainingDay.getOrCreate(
        trainingDay.trainingDate,
      );
      trainingDayIdMap.set(trainingDay.id, created.id);
      await localRepo.trainingDay.markAsSynced(trainingDay.id);
      onProgress?.({
        phase: "trainingDays",
        current: i + 1,
        total: pendingTrainingDays.length,
      });
    }

    // 3. Day Exercises 동기화
    const pendingDayExercises = await localRepo.dayExercise.findAllPending();
    onProgress?.({
      phase: "dayExercises",
      current: 0,
      total: pendingDayExercises.length,
    });

    for (let i = 0; i < pendingDayExercises.length; i++) {
      const dayExercise = pendingDayExercises[i];

      // 매핑된 원격 ID 찾기
      const remoteTrainingDayId =
        trainingDayIdMap.get(dayExercise.trainingDayId) ??
        dayExercise.trainingDayId;

      // exerciseId가 로컬에서 생성된 경우 매핑된 ID 사용
      let remoteExerciseId = dayExercise.exerciseId;
      if (dayExercise.exerciseId) {
        remoteExerciseId =
          exerciseIdMap.get(dayExercise.exerciseId) ?? dayExercise.exerciseId;
      }

      const created = await remoteRepo.dayExercise.create({
        trainingDayId: remoteTrainingDayId,
        exerciseId: remoteExerciseId!,
        displayOrder: dayExercise.displayOrder,
      });
      dayExerciseIdMap.set(dayExercise.id, created.id);
      await localRepo.dayExercise.markAsSynced(dayExercise.id);
      onProgress?.({
        phase: "dayExercises",
        current: i + 1,
        total: pendingDayExercises.length,
      });
    }

    // 4. Exercise Sets 동기화
    const pendingExerciseSets = await localRepo.exerciseSet.findAllPending();
    onProgress?.({
      phase: "exerciseSets",
      current: 0,
      total: pendingExerciseSets.length,
    });

    // dayExerciseId로 그룹화하여 일괄 생성
    const setsByDayExercise = new Map<
      string,
      { reps: number | null; weight: number | null }[]
    >();

    for (const set of pendingExerciseSets) {
      const remoteDayExerciseId =
        dayExerciseIdMap.get(set.dayExerciseId!) ?? set.dayExerciseId!;

      if (!setsByDayExercise.has(remoteDayExerciseId)) {
        setsByDayExercise.set(remoteDayExerciseId, []);
      }
      setsByDayExercise.get(remoteDayExerciseId)!.push({
        reps: set.plannedReps ?? null,
        weight: set.plannedWeight ?? null,
      });
    }

    let syncedSets = 0;
    for (const [remoteDayExerciseId, sets] of setsByDayExercise) {
      await remoteRepo.exerciseSet.createMany(remoteDayExerciseId, sets);
      syncedSets += sets.length;
      onProgress?.({
        phase: "exerciseSets",
        current: syncedSets,
        total: pendingExerciseSets.length,
      });
    }

    // 모든 pending 세트 synced로 마킹
    for (const set of pendingExerciseSets) {
      if (set.id) {
        await localRepo.exerciseSet.markAsSynced(set.id);
      }
    }

    onProgress?.({ phase: "done", current: 0, total: 0 });

    return { success: true };
  } catch (error) {
    console.error("데이터 동기화 실패:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "동기화 중 오류 발생",
    };
  }
}

/**
 * 동기화 완료된 로컬 데이터 정리
 */
export async function cleanupSyncedLocalData(): Promise<void> {
  const localRepo = getLocalRepository();

  // FK 역순으로 삭제
  await localRepo.exerciseSet.deleteSynced();
  await localRepo.dayExercise.deleteSynced();
  await localRepo.trainingDay.deleteSynced();
  await localRepo.exercise.deleteSynced();
}

/**
 * 동기화 대기 중인 로컬 데이터 개수 확인
 */
export async function getPendingDataCount(): Promise<{
  exercises: number;
  trainingDays: number;
  dayExercises: number;
  exerciseSets: number;
  total: number;
}> {
  const localRepo = getLocalRepository();

  const [exercises, trainingDays, dayExercises, exerciseSets] =
    await Promise.all([
      localRepo.exercise.findAllPending(),
      localRepo.trainingDay.findAllPending(),
      localRepo.dayExercise.findAllPending(),
      localRepo.exerciseSet.findAllPending(),
    ]);

  return {
    exercises: exercises.length,
    trainingDays: trainingDays.length,
    dayExercises: dayExercises.length,
    exerciseSets: exerciseSets.length,
    total:
      exercises.length +
      trainingDays.length +
      dayExercises.length +
      exerciseSets.length,
  };
}
