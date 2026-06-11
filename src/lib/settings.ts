import type { SupabaseClient } from "@supabase/supabase-js";

// Godzina graniczna przyjmowania zamówień na kolejny dzień (z bazy, fallback 18).
export async function getCutoffHour(supabase: SupabaseClient): Promise<number> {
  const { data } = await supabase
    .from("settings")
    .select("order_cutoff_hour")
    .eq("id", 1)
    .maybeSingle();
  const h = data?.order_cutoff_hour;
  return typeof h === "number" && h >= 0 && h <= 23 ? h : 18;
}
