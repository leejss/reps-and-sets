import type { IProfileRepository } from "./profile.repository";
import { SupabaseProfileRepository } from "./supabase/profile.repository";

let profileRepository: IProfileRepository | null = null;

export function getProfileRepository(): IProfileRepository {
  if (!profileRepository) {
    profileRepository = new SupabaseProfileRepository();
  }
  return profileRepository;
}
