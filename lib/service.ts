import {
  fetchWorkoutSessionExercise,
  insertSessionExercise,
  type SessionExerciseWithSets,
} from "./queries/workoutSessionExercises.query";
import { getOrCreateWorkoutSession } from "./queries/workoutSessions.query";
import {
  insertWorkoutSetsForSessionExercise,
  type WorkoutSetPlanInput,
} from "./queries/workoutSets.query";

/**
 * 주어진 날짜와 운동, 세트 계획으로 세션 운동을 생성합니다.
 *
 * - 해당 날짜의 세션이 없으면 생성합니다.
 * - 세션 내 기존 운동 개수를 기준으로 `orderInSession`을 결정합니다.
 * - 세트 계획을 모두 생성한 뒤, 실제 저장된 세션 운동 정보를 조회해서 반환합니다.
 *
 * UI에서 사용하는 `workoutSetList` 형태는 호출 측에서
 * `WorkoutSetPlanInput[]` 형태로 변환해서 넘기도록 합니다.
 */
export const createSessionExercise = async (
  date: Date | string,
  exerciseId: string,
  plannedSets: WorkoutSetPlanInput[],
): Promise<SessionExerciseWithSets> => {
  // 1) 날짜에 해당하는 세션 조회 / 생성
  const workoutSession = await getOrCreateWorkoutSession(date);

  // 2) 세션 내 기존 운동 개수로 orderInSession 계산
  const existingExercises = await fetchWorkoutSessionExercise(
    workoutSession.id,
  );
  const orderInSession = existingExercises.length;

  // 3) 세션 운동 기본 정보 생성
  const sessionExerciseBase = await insertSessionExercise({
    sessionId: workoutSession.id,
    exerciseId,
    orderInSession,
  });

  // 4) 세트 계획 생성
  await insertWorkoutSetsForSessionExercise({
    sessionExerciseId: sessionExerciseBase.id,
    plannedSets,
  });

  // 5) 생성된 세션 운동 상세 정보 조회
  const details = await fetchWorkoutSessionExercise(workoutSession.id);
  const created = details.find((d) => d.id === sessionExerciseBase.id);

  if (!created) {
    throw new Error("생성된 세션 운동 정보를 찾을 수 없습니다.");
  }

  return created;
};
