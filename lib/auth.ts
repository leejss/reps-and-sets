import { supabase } from "./supabase";

export async function getSupabaseSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error("[fetchSupabaseSession] error:", error);
    throw error;
  }

  return data.session;
}
