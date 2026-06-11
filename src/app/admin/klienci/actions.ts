"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { TablesInsert } from "@/lib/database.types";

export type ClientFormState = { error: string | null };

function parseNum(value: FormDataEntryValue | null): number {
  const n = Number(String(value ?? "").replace(",", ".").trim());
  return Number.isFinite(n) ? n : NaN;
}

export async function saveClient(
  _prev: ClientFormState,
  formData: FormData,
): Promise<ClientFormState> {
  const id = (formData.get("id") as string) || null;

  const name = String(formData.get("name") ?? "").trim();
  const nip = String(formData.get("nip") ?? "").trim() || null;
  const address = String(formData.get("address") ?? "").trim() || null;
  const contact_email =
    String(formData.get("contact_email") ?? "").trim() || null;
  const contact_phone =
    String(formData.get("contact_phone") ?? "").trim() || null;
  const internal_notes =
    String(formData.get("internal_notes") ?? "").trim() || null;
  const discount_pct = parseNum(formData.get("discount_pct"));
  const min_order_value_raw = String(formData.get("min_order_value") ?? "").trim();
  const min_order_value = min_order_value_raw
    ? parseNum(formData.get("min_order_value"))
    : 0;
  const orders_suspended = formData.get("orders_suspended") === "on";
  const is_active = formData.get("is_active") === "on";

  if (!name) return { error: "Podaj nazwę firmy." };
  if (Number.isNaN(discount_pct) || discount_pct < 0 || discount_pct > 100)
    return { error: "Rabat ogólny musi być liczbą od 0 do 100." };
  if (Number.isNaN(min_order_value) || min_order_value < 0)
    return { error: "Minimum kwotowe musi być liczbą ≥ 0." };

  const supabase = await createClient();

  const payload: TablesInsert<"clients"> = {
    name,
    nip,
    address,
    contact_email,
    contact_phone,
    internal_notes,
    discount_pct,
    min_order_value,
    orders_suspended,
    is_active,
  };

  const { error } = id
    ? await supabase.from("clients").update(payload).eq("id", id)
    : await supabase.from("clients").insert(payload);

  if (error) return { error: `Nie udało się zapisać: ${error.message}` };

  revalidatePath("/admin/klienci");
  redirect("/admin/klienci");
}

export async function toggleClientActive(formData: FormData) {
  const id = String(formData.get("id"));
  const next = formData.get("next") === "true";
  const supabase = await createClient();
  await supabase.from("clients").update({ is_active: next }).eq("id", id);
  revalidatePath("/admin/klienci");
}

export async function toggleOrdersSuspended(formData: FormData) {
  const id = String(formData.get("id"));
  const next = formData.get("next") === "true";
  const supabase = await createClient();
  await supabase
    .from("clients")
    .update({ orders_suspended: next })
    .eq("id", id);
  revalidatePath("/admin/klienci");
  revalidatePath(`/admin/klienci/${id}`);
}

export async function setClientPrice(formData: FormData) {
  const client_id = String(formData.get("client_id"));
  const product_id = String(formData.get("product_id"));
  const custom_price = parseNum(formData.get("custom_price"));
  if (!client_id || !product_id || Number.isNaN(custom_price) || custom_price < 0)
    return;

  const supabase = await createClient();
  await supabase
    .from("client_prices")
    .upsert(
      { client_id, product_id, custom_price },
      { onConflict: "client_id,product_id" },
    );
  revalidatePath(`/admin/klienci/${client_id}`);
}

export async function removeClientPrice(formData: FormData) {
  const id = String(formData.get("id"));
  const client_id = String(formData.get("client_id"));
  const supabase = await createClient();
  await supabase.from("client_prices").delete().eq("id", id);
  revalidatePath(`/admin/klienci/${client_id}`);
}
