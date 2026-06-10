import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

// Klient z kluczem SERWISOWYM (service_role) — pełne uprawnienia, OMIJA RLS.
// Używać WYŁĄCZNIE po stronie serwera (Server Actions / Route Handlers) i tylko
// po sprawdzeniu, że bieżący użytkownik jest administratorem.
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error(
      "Brak klucza SUPABASE_SERVICE_ROLE_KEY w pliku .env.local — nie można tworzyć użytkowników.",
    );
  }
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    key,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

export function hasServiceRole(): boolean {
  return !!process.env.SUPABASE_SERVICE_ROLE_KEY;
}
