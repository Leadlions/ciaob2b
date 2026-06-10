"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import type { Enums } from "@/lib/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";

// Tworzy dokument WZ z automatycznym numerem (idempotentnie — pomija, jeśli już jest).
async function createWzForOrder(
  supabase: SupabaseClient,
  orderId: string,
): Promise<void> {
  const { data: order } = await supabase
    .from("orders")
    .select("client_id, wz_number")
    .eq("id", orderId)
    .single();
  if (!order || order.wz_number) return; // już ma WZ

  const { data: number, error } = await (
    supabase.rpc as unknown as (
      fn: string,
    ) => Promise<{ data: string | null; error: unknown }>
  )("next_wz_number");
  if (error || !number) return;

  await supabase.from("orders").update({ wz_number: number }).eq("id", orderId);
  await supabase.from("documents").insert({
    client_id: order.client_id,
    order_id: orderId,
    type: "wz",
    number,
  });
}

export async function updateOrderStatus(formData: FormData) {
  const { profile } = await getSessionProfile();
  if (profile?.role !== "admin") return;

  const id = String(formData.get("id"));
  const status = String(formData.get("status")) as Enums<"order_status">;
  if (!(status in ORDER_STATUS_LABELS)) return;

  const supabase = await createClient();
  await supabase.from("orders").update({ status }).eq("id", id);

  // Automatyczne wystawienie WZ, gdy zamówienie zostaje wysłane.
  if (status === "wyslane") await createWzForOrder(supabase, id);

  revalidatePath("/admin/zamowienia");
  revalidatePath(`/admin/zamowienia/${id}`);
  revalidatePath("/admin/dokumenty");
}

export async function generateWz(formData: FormData) {
  const { profile } = await getSessionProfile();
  if (profile?.role !== "admin") return;

  const id = String(formData.get("id"));
  const supabase = await createClient();
  await createWzForOrder(supabase, id);

  revalidatePath("/admin/zamowienia");
  revalidatePath(`/admin/zamowienia/${id}`);
  revalidatePath("/admin/dokumenty");
}

export async function deleteWz(formData: FormData) {
  const { profile } = await getSessionProfile();
  if (profile?.role !== "admin") return;

  const id = String(formData.get("id"));
  const supabase = await createClient();
  await supabase.from("orders").update({ wz_number: null }).eq("id", id);
  await supabase
    .from("documents")
    .delete()
    .eq("order_id", id)
    .eq("type", "wz");

  revalidatePath("/admin/zamowienia");
  revalidatePath(`/admin/zamowienia/${id}`);
  revalidatePath("/admin/dokumenty");
}
