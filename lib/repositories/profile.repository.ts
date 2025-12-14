import type { Tables } from "../database.types";

export interface IProfileRepository {
  /** 프로필 조회. 없으면 자동 생성 */
  getOrCreate(
    userId: string,
    displayName?: string | null,
  ): Promise<Tables<"profiles">>;
}
