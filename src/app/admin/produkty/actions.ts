"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Enums, TablesInsert } from "@/lib/database.types";
import { CATEGORIES, VAT_RATES } from "@/lib/constants";

export type ProductFormState = { error: string | null };

function parseNum(value: FormDataEntryValue | null): number {
  const n = Number(String(value ?? "").replace(",", ".").trim());
  return Number.isFinite(n) ? n : NaN;
}

async function uploadFile(
  bucket: string,
  file: File | null,
): Promise<string | null> {
  if (!file || file.size === 0) return null;
  const supabase = await createClient();
  const ext = file.name.includes(".") ? file.name.split(".").pop() : "bin";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { contentType: file.type || undefined });
  if (error) throw new Error(`Nie udało się wgrać pliku: ${error.message}`);
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

export async function saveProduct(
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const id = (formData.get("id") as string) || null;

  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "") as Enums<"product_category">;
  const base_price = parseNum(formData.get("base_price"));
  const vat_rate = parseNum(formData.get("vat_rate"));
  const min_order_qty = parseNum(formData.get("min_order_qty"));
  const sort_order = parseNum(formData.get("sort_order"));
  const unit = String(formData.get("unit") ?? "szt").trim() || "szt";
  const description = String(formData.get("description") ?? "").trim() || null;
  const is_active = formData.get("is_active") === "on";

  if (!name) return { error: "Podaj nazwę produktu." };
  if (!CATEGORIES.includes(category)) return { error: "Wybierz kategorię." };
  if (Number.isNaN(base_price) || base_price < 0)
    return { error: "Cena bazowa musi być liczbą ≥ 0." };
  if (!VAT_RATES.includes(vat_rate as (typeof VAT_RATES)[number]))
    return { error: "Wybierz poprawną stawkę VAT." };
  if (Number.isNaN(min_order_qty) || min_order_qty < 0)
    return { error: "Minimalna ilość musi być liczbą ≥ 0." };

  const supabase = await createClient();

  let image_url = (formData.get("current_image_url") as string) || null;
  let pdf_url = (formData.get("current_pdf_url") as string) || null;

  try {
    const newImage = await uploadFile(
      "product-images",
      formData.get("image") as File | null,
    );
    if (newImage) image_url = newImage;
    const newPdf = await uploadFile(
      "product-cards",
      formData.get("pdf") as File | null,
    );
    if (newPdf) pdf_url = newPdf;
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Błąd wgrywania pliku." };
  }

  const payload: TablesInsert<"products"> = {
    name,
    category,
    base_price,
    vat_rate,
    unit,
    min_order_qty: Number.isNaN(min_order_qty) ? 1 : min_order_qty,
    sort_order: Number.isNaN(sort_order) ? 0 : sort_order,
    description,
    is_active,
    image_url,
    pdf_url,
  };

  const { error } = id
    ? await supabase.from("products").update(payload).eq("id", id)
    : await supabase.from("products").insert(payload);

  if (error) return { error: `Nie udało się zapisać: ${error.message}` };

  revalidatePath("/admin/produkty");
  redirect("/admin/produkty");
}

export async function toggleProductActive(formData: FormData) {
  const id = String(formData.get("id"));
  const next = formData.get("next") === "true";
  const supabase = await createClient();
  await supabase.from("products").update({ is_active: next }).eq("id", id);
  revalidatePath("/admin/produkty");
}
