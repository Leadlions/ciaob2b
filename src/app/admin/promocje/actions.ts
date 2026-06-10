"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { TablesInsert } from "@/lib/database.types";

export type PromotionFormState = { error: string | null };

function parseNum(value: FormDataEntryValue | null): number {
  const n = Number(String(value ?? "").replace(",", ".").trim());
  return Number.isFinite(n) ? n : NaN;
}

export async function savePromotion(
  _prev: PromotionFormState,
  formData: FormData,
): Promise<PromotionFormState> {
  const id = (formData.get("id") as string) || null;
  const product_id = String(formData.get("product_id") ?? "");
  const promo_price = parseNum(formData.get("promo_price"));
  const start_date = String(formData.get("start_date") ?? "");
  const end_date = String(formData.get("end_date") ?? "");
  const is_promo_of_day = formData.get("is_promo_of_day") === "on";
  const is_active = formData.get("is_active") === "on";

  if (!product_id) return { error: "Wybierz produkt." };
  if (Number.isNaN(promo_price) || promo_price < 0)
    return { error: "Cena promocyjna musi być liczbą ≥ 0." };
  if (!start_date || !end_date)
    return { error: "Podaj daty obowiązywania promocji." };
  if (end_date < start_date)
    return { error: "Data końca nie może być wcześniejsza niż początek." };

  const supabase = await createClient();
  const payload: TablesInsert<"promotions"> = {
    product_id,
    promo_price,
    start_date,
    end_date,
    is_promo_of_day,
    is_active,
  };

  const { error } = id
    ? await supabase.from("promotions").update(payload).eq("id", id)
    : await supabase.from("promotions").insert(payload);

  if (error) return { error: `Nie udało się zapisać: ${error.message}` };

  revalidatePath("/admin/promocje");
  redirect("/admin/promocje");
}

export async function togglePromotionActive(formData: FormData) {
  const id = String(formData.get("id"));
  const next = formData.get("next") === "true";
  const supabase = await createClient();
  await supabase.from("promotions").update({ is_active: next }).eq("id", id);
  revalidatePath("/admin/promocje");
}

export async function deletePromotion(formData: FormData) {
  const id = String(formData.get("id"));
  const supabase = await createClient();
  await supabase.from("promotions").delete().eq("id", id);
  revalidatePath("/admin/promocje");
}
