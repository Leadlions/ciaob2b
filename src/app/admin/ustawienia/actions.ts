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

  const supabase = await createClient();
  const { error } = await supabase
    .from("settings")
    .update({ order_cutoff_hour: h, updated_at: new Date().toISOString() })
    .eq("id", 1);
  if (error) return { error: `Nie udało się zapisać: ${error.message}` };

  revalidatePath("/admin/ustawienia");
  return { error: null, ok: true };
}
