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

export type ReportEmails = { wz: string | null; prod: string | null };

// Adresy e-mail dla raportów dziennych (osobno WZ i produkcja). Puste = brak.
export async function getReportEmails(
  supabase: SupabaseClient,
): Promise<ReportEmails> {
  const { data } = await supabase
    .from("settings")
    .select("report_email_wz, report_email_prod")
    .eq("id", 1)
    .maybeSingle();
  const clean = (v: unknown) =>
    typeof v === "string" && v.trim() ? v.trim() : null;
  return { wz: clean(data?.report_email_wz), prod: clean(data?.report_email_prod) };
}
