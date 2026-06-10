"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function regenerate() {
  try {
    const admin = createAdminClient();
    await (admin.rpc as unknown as (
      fn: string,
      args: Record<string, unknown>,
    ) => Promise<unknown>)("generate_recurring_orders", { horizon_days: 14 });
  } catch {
    // brak klucza serwisowego — wygeneruje nocny harmonogram
  }
}

export async function toggleRecurringActive(formData: FormData) {
  const id = String(formData.get("id"));
  const next = formData.get("next") === "true";
  const supabase = await createClient();
  await supabase
    .from("recurring_orders")
    .update({ is_active: next })
    .eq("id", id);
  if (next) await regenerate();
  revalidatePath("/panel/zamowienia");
}

export async function deleteRecurring(formData: FormData) {
  const id = String(formData.get("id"));
  const supabase = await createClient();
  await supabase.from("recurring_orders").delete().eq("id", id);
  revalidatePath("/panel/zamowienia");
}
