"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth";

export type SettingsState = { error: string | null; ok?: boolean };

export async function saveSettings(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const { profile } = await getSessionProfile();
  if (profile?.role !== "admin") return { error: "Brak uprawnień." };

  const h = Number(formData.get("order_cutoff_hour"));
  if (!Number.isInteger(h) || h < 0 || h > 23)
    return { error: "Wybierz poprawną godzinę." };

  // Adresy mogą być puste albo zawierać kilka maili po przecinku.
  const isEmail = (s: string) => /^[^\s@,]+@[^\s@,]+\.[^\s@,]+$/.test(s);
  const parseEmails = (raw: FormDataEntryValue | null, label: string) => {
    const value = (typeof raw === "string" ? raw : "").trim();
    if (!value) return { value: null as string | null, error: null as string | null };
    const parts = value.split(",").map((s) => s.trim()).filter(Boolean);
    const bad = parts.find((p) => !isEmail(p));
    if (bad) return { value: null, error: `Niepoprawny adres e-mail (${label}): ${bad}` };
    return { value: parts.join(", "), error: null };
  };

  const wz = parseEmails(formData.get("report_email_wz"), "WZ");
  if (wz.error) return { error: wz.error };
  const prod = parseEmails(formData.get("report_email_prod"), "produkcja");
  if (prod.error) return { error: prod.error };

  const supabase = await createClient();
  const { error } = await supabase
    .from("settings")
    .update({
      order_cutoff_hour: h,
      report_email_wz: wz.value,
      report_email_prod: prod.value,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);
  if (error) return { error: `Nie udało się zapisać: ${error.message}` };

  revalidatePath("/admin/ustawienia");
  return { error: null, ok: true };
}
