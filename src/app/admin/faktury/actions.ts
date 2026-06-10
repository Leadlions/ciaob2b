"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth";

export type InvoiceFormState = { error: string | null };

export async function uploadInvoice(
  _prev: InvoiceFormState,
  formData: FormData,
): Promise<InvoiceFormState> {
  const { profile } = await getSessionProfile();
  if (profile?.role !== "admin") return { error: "Brak uprawnień." };

  const client_id = String(formData.get("client_id") ?? "");
  const number = String(formData.get("number") ?? "").trim() || null;
  const file = formData.get("file") as File | null;

  if (!client_id) return { error: "Wybierz klienta." };
  if (!file || file.size === 0) return { error: "Wybierz plik PDF faktury." };
  if (file.type && file.type !== "application/pdf")
    return { error: "Faktura musi być plikiem PDF." };

  const supabase = await createClient();
  const path = `${client_id}/${crypto.randomUUID()}.pdf`;

  const { error: upErr } = await supabase.storage
    .from("documents")
    .upload(path, file, { contentType: "application/pdf" });
  if (upErr) return { error: `Nie udało się wgrać pliku: ${upErr.message}` };

  const { error: dErr } = await supabase.from("documents").insert({
    client_id,
    type: "faktura",
    number,
    file_url: path,
  });
  if (dErr) {
    await supabase.storage.from("documents").remove([path]);
    return { error: `Nie udało się zapisać faktury: ${dErr.message}` };
  }

  revalidatePath("/admin/faktury");
  redirect("/admin/faktury");
}

export async function deleteInvoice(formData: FormData) {
  const { profile } = await getSessionProfile();
  if (profile?.role !== "admin") return;

  const id = String(formData.get("id"));
  const path = String(formData.get("path") ?? "");

  const supabase = await createClient();
  if (path) await supabase.storage.from("documents").remove([path]);
  await supabase.from("documents").delete().eq("id", id);
  revalidatePath("/admin/faktury");
}
