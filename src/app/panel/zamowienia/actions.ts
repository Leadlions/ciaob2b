"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { CLIENT_EDITABLE_STATUSES } from "@/lib/constants";

export async function cancelOrder(formData: FormData) {
  const id = String(formData.get("id"));
  const supabase = await createClient();

  // Anuluj tylko jeśli status pozwala (RLS i tak ogranicza do własnych zamówień).
  const { data: order } = await supabase
    .from("orders")
    .select("status")
    .eq("id", id)
    .single();
  if (!order || !CLIENT_EDITABLE_STATUSES.includes(order.status)) return;

  await supabase.from("orders").update({ status: "anulowane" }).eq("id", id);
  revalidatePath("/panel/zamowienia");
  revalidatePath(`/panel/zamowienia/${id}`);
}
