import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { getSupabaseSession } from "../auth";
import type { Tables } from "../database.types";
import { getProfileRepository } from "../repositories/profile-factory";
import { supabase } from "../supabase";

export class AuthService {
  async getSession(): Promise<Session | null> {
    return getSupabaseSession();
  }

  async getOrCreateProfile(
    userId: string,
    displayName?: string | null,
  ): Promise<Tables<"profiles">> {
    const profileRepo = getProfileRepository();
    return profileRepo.getOrCreate(userId, displayName);
  }

  onAuthStateChange(
    handler: (event: AuthChangeEvent, session: Session | null) => void,
  ) {
    return supabase.auth.onAuthStateChange(handler);
  }

  async signInWithGoogleIdToken(idToken: string) {
    return supabase.auth.signInWithIdToken({
      provider: "google",
      token: idToken,
    });
  }

  async signInWithEmail(email: string, password: string) {
    return supabase.auth.signInWithPassword({ email, password });
  }

  async signOut() {
    return supabase.auth.signOut();
  }
}

let authService: AuthService | null = null;

export function getAuthService(): AuthService {
  if (!authService) {
    authService = new AuthService();
  }
  return authService;
}
