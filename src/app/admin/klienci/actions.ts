"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth";
import type { TablesInsert } from "@/lib/database.types";

export type ClientFormState = { error: string | null };
export type BulkPriceState = { error: string | null; ok?: string };

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
  revalidatePath("/panel", "layout");
}

// Masowe ustawianie cen indywidualnych dla JEDNEGO klienta na zaznaczonych produktach.
export async function bulkSetClientPrices(
  _prev: BulkPriceState,
  formData: FormData,
): Promise<BulkPriceState> {
  const { profile } = await getSessionProfile();
  if (profile?.role !== "admin") return { error: "Brak uprawnień." };

  const client_id = String(formData.get("client_id") ?? "");
  if (!client_id) return { error: "Brak klienta." };

  let ids: string[] = [];
  try {
    ids = (JSON.parse(String(formData.get("ids") ?? "[]")) as string[]).filter(Boolean);
  } catch {
    return { error: "Błędne zaznaczenie." };
  }
  if (ids.length === 0) return { error: "Nie zaznaczono produktów." };

  const op = String(formData.get("op") ?? "");
  const supabase = await createClient();

  // Usunięcie cen indywidualnych dla zaznaczonych produktów.
  if (op === "remove") {
    const { error } = await supabase
      .from("client_prices")
      .delete()
      .eq("client_id", client_id)
      .in("product_id", ids);
    if (error) return { error: `Nie udało się usunąć: ${error.message}` };
    revalidatePath(`/admin/klienci/${client_id}`);
    revalidatePath("/panel", "layout");
    return { error: null, ok: `Usunięto ceny indywidualne dla ${ids.length} produktów.` };
  }

  const value = parseNum(formData.get("value"));
  if (Number.isNaN(value)) return { error: "Podaj wartość." };
  if (!["pct_off", "amount_off", "set"].includes(op))
    return { error: "Nieznana operacja." };

  const { data: prods } = await supabase
    .from("products")
    .select("id, base_price")
    .in("id", ids);
  if (!prods) return { error: "Nie znaleziono produktów." };

  const round2 = (n: number) => Math.round(n * 100) / 100;
  const rows = prods.map((p) => {
    let price = value;
    if (op === "pct_off") price = p.base_price * (1 - value / 100);
    else if (op === "amount_off") price = p.base_price - value;
    return {
      client_id,
      product_id: p.id,
      custom_price: Math.max(0, round2(price)),
    };
  });

  const { error } = await supabase
    .from("client_prices")
    .upsert(rows, { onConflict: "client_id,product_id" });
  if (error) return { error: `Nie udało się zapisać: ${error.message}` };

  revalidatePath(`/admin/klienci/${client_id}`);
  revalidatePath("/panel", "layout");
  return { error: null, ok: `Ustawiono ceny indywidualne dla ${rows.length} produktów.` };
}
