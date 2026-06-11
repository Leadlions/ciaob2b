"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionProfile } from "@/lib/auth";
import { getEffectiveClientId } from "@/lib/view-as";
import { computePrice } from "@/lib/pricing";
import { earliestDeliveryDate } from "@/lib/delivery";
import { getCutoffHour } from "@/lib/settings";
import { DELIVERY_SLOTS, formatDate } from "@/lib/constants";
import type { Enums } from "@/lib/database.types";

export type CreateOrderState = { error: string | null };

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

function parseItems(formData: FormData): { product_id: string; quantity: number }[] {
  try {
    const items = JSON.parse(String(formData.get("items") ?? "[]"));
    return (items ?? []).filter(
      (i: { product_id?: string; quantity?: number }) =>
        i && i.product_id && Number(i.quantity) > 0,
    );
  } catch {
    return [];
  }
}

export async function submitOrder(
  _prev: CreateOrderState,
  formData: FormData,
): Promise<CreateOrderState> {
  const { profile } = await getSessionProfile();
  const { clientId } = await getEffectiveClientId();
  if (!profile || !clientId)
    return { error: "Brak przypisanej firmy (lub nie wybrano firmy w podglądzie)." };

  const mode = String(formData.get("mode") ?? "jednorazowe");
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const items = parseItems(formData);
  if (items.length === 0) return { error: "Dodaj przynajmniej jeden produkt." };

  const supabase = await createClient();
  const cutoffHour = await getCutoffHour(supabase);
  const earliest = earliestDeliveryDate(cutoffHour);
  const cutoffMsg = `Najwcześniejsza możliwa data to ${formatDate(earliest)} — zamówienia na kolejny dzień przyjmujemy do godz. ${String(cutoffHour).padStart(2, "0")}:00.`;

  const { data: client } = await supabase
    .from("clients")
    .select("discount_pct, orders_suspended")
    .eq("id", clientId)
    .single();
  if (!client) return { error: "Nie znaleziono firmy." };
  if (client.orders_suspended)
    return { error: "Składanie zamówień jest obecnie wstrzymane." };

  // Walidacja produktów i minimalnych ilości (wspólna).
  const ids = items.map((i) => i.product_id);
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .in("id", ids)
    .eq("is_active", true);
  const prodMap = new Map((products ?? []).map((p) => [p.id, p]));
  for (const it of items) {
    const p = prodMap.get(it.product_id);
    if (!p) return { error: "Jeden z produktów jest niedostępny." };
    if (Number(it.quantity) < p.min_order_qty)
      return {
        error: `„${p.name}" — minimalna ilość to ${p.min_order_qty} ${p.unit}.`,
      };
  }

  // ====== TRYB CYKLICZNY ======
  if (mode === "cykliczne") {
    const slot = String(
      formData.get("delivery_slot") ?? "",
    ) as Enums<"delivery_slot">;
    const start_date = String(formData.get("start_date") ?? "");
    const end_date = String(formData.get("end_date") ?? "") || null;

    let weekdays: number[] = [];
    let excluded: string[] = [];
    try {
      weekdays = (JSON.parse(String(formData.get("weekdays") ?? "[]")) as number[])
        .map(Number)
        .filter((n) => n >= 0 && n <= 6);
    } catch {}
    try {
      excluded = (JSON.parse(String(formData.get("excluded_dates") ?? "[]")) as string[])
        .filter(Boolean);
    } catch {}

    if (weekdays.length === 0)
      return { error: "Wybierz przynajmniej jeden dzień tygodnia." };
    if (!start_date) return { error: "Podaj datę początku." };
    if (start_date < earliest) return { error: cutoffMsg };
    if (!DELIVERY_SLOTS.includes(slot))
      return { error: "Wybierz godzinę dostawy." };
    if (end_date && end_date < start_date)
      return { error: "Data końca nie może być wcześniejsza niż początek." };

    const { data: ro, error } = await supabase
      .from("recurring_orders")
      .insert({
        client_id: clientId,
        created_by: profile.id,
        weekdays,
        excluded_dates: excluded,
        start_date,
        end_date,
        delivery_slot: slot,
        notes,
        is_active: true,
      })
      .select("id")
      .single();
    if (error || !ro)
      return { error: "Nie udało się utworzyć harmonogramu." };

    const { error: iErr } = await supabase.from("recurring_order_items").insert(
      items.map((it) => ({
        recurring_order_id: ro.id,
        product_id: it.product_id,
        quantity: Number(it.quantity),
      })),
    );
    if (iErr) {
      await supabase.from("recurring_orders").delete().eq("id", ro.id);
      return { error: "Nie udało się zapisać pozycji." };
    }

    await regenerate();
    revalidatePath("/panel/zamowienia");
    redirect("/panel/zamowienia?utworzono=cykl");
  }

  // ====== TRYB JEDNORAZOWY ======
  const delivery_date = String(formData.get("delivery_date") ?? "");
  const delivery_slot = String(
    formData.get("delivery_slot") ?? "",
  ) as Enums<"delivery_slot">;
  if (!delivery_date) return { error: "Wybierz datę dostawy." };
  if (delivery_date < earliest) return { error: cutoffMsg };
  if (!DELIVERY_SLOTS.includes(delivery_slot))
    return { error: "Wybierz godzinę dostawy." };

  const today = new Date().toISOString().slice(0, 10);
  const [{ data: cprices }, { data: promos }] = await Promise.all([
    supabase
      .from("client_prices")
      .select("product_id, custom_price")
      .eq("client_id", clientId)
      .in("product_id", ids),
    supabase
      .from("promotions")
      .select("product_id, promo_price")
      .eq("is_active", true)
      .lte("start_date", today)
      .gte("end_date", today)
      .in("product_id", ids),
  ]);
  const customMap = new Map(
    (cprices ?? []).map((c) => [c.product_id, c.custom_price]),
  );
  const promoMap = new Map<string, number>();
  for (const pr of promos ?? []) {
    const cur = promoMap.get(pr.product_id);
    if (cur == null || pr.promo_price < cur) promoMap.set(pr.product_id, pr.promo_price);
  }

  const orderItems = items.map((it) => {
    const p = prodMap.get(it.product_id)!;
    const price = computePrice({
      basePrice: p.base_price,
      discountPct: client.discount_pct,
      customPrice: customMap.get(p.id) ?? null,
      promoPrice: promoMap.get(p.id) ?? null,
    });
    return { product_id: p.id, quantity: Number(it.quantity), unit_price: price.effective };
  });

  const { data: order, error: oErr } = await supabase
    .from("orders")
    .insert({
      client_id: clientId,
      created_by: profile.id,
      status: "nowe",
      delivery_date,
      delivery_slot,
      notes,
    })
    .select("id")
    .single();
  if (oErr || !order)
    return { error: "Nie udało się utworzyć zamówienia." };

  const { error: iErr } = await supabase
    .from("order_items")
    .insert(orderItems.map((oi) => ({ ...oi, order_id: order.id })));
  if (iErr) {
    await supabase.from("orders").delete().eq("id", order.id);
    return { error: "Nie udało się zapisać pozycji zamówienia." };
  }

  redirect(`/panel/zamowienia/${order.id}?utworzono=1`);
}
