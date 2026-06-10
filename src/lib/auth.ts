import { createClient } from "@/lib/supabase/server";

export type UserRole = "admin" | "client";

export type Profile = {
  id: string;
  role: UserRole;
  client_id: string | null;
  full_name: string | null;
  email: string | null;
};

// Pobiera zalogowanego użytkownika wraz z jego profilem (rola, przypisana firma).
export async function getSessionProfile(): Promise<{
  user: { id: string; email?: string } | null;
  profile: Profile | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { user: null, profile: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, client_id, full_name, email")
    .eq("id", user.id)
    .single();

  return { user, profile: (profile as Profile) ?? null };
}
