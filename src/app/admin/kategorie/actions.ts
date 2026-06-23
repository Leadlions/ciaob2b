"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth";

export type CategoryState = { error: string | null; ok?: boolean };

const PL_MAP: Record<string, string> = {
  ą: "a", ć: "c", ę: "e", ł: "l", ń: "n", ó: "o", ś: "s", ź: "z", ż: "z",
};

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[ąćęłńóśźż]/g, (ch) => PL_MAP[ch] ?? ch)
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 50);
}

async function requireAdmin() {
  const { profile } = await getSessionProfile();
  return profile?.role === "admin";
}

export async function addCategory(
  _prev: CategoryState,
  formData: FormData,
): Promise<CategoryState> {
  if (!(await requireAdmin())) return { error: "Brak uprawnień." };

  const label = String(formData.get("label") ?? "").trim();
  if (!label) return { error: "Podaj nazwę kategorii." };
  const slug = slugify(label);
  if (!slug) return { error: "Nazwa musi zawierać litery lub cyfry." };

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("categories")
    .select("slug")
    .eq("slug", slug)
    .maybeSingle();
  if (existing) return { error: "Kategoria o takiej nazwie już istnieje." };

  const { data: last } = await supabase
    .from("categories")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const sort_order = (last?.sort_order ?? 0) + 1;

  const { error } = await supabase
    .from("categories")
    .insert({ slug, label, sort_order });
  if (error) return { error: `Nie udało się dodać: ${error.message}` };

  revalidatePath("/admin/kategorie");
  return { error: null, ok: true };
}

export async function renameCategory(formData: FormData) {
  if (!(await requireAdmin())) return;
  const slug = String(formData.get("slug") ?? "");
  const label = String(formData.get("label") ?? "").trim();
  if (!slug || !label) return;
  const supabase = await createClient();
  await supabase.from("categories").update({ label }).eq("slug", slug);
  revalidatePath("/admin/kategorie");
  revalidatePath("/admin/produkty");
}

export async function moveCategory(formData: FormData) {
  if (!(await requireAdmin())) return;
  const slug = String(formData.get("slug") ?? "");
  const dir = String(formData.get("dir") ?? ""); // "up" | "down"
  if (!slug) return;
  const supabase = await createClient();
  const { data: cats } = await supabase
    .from("categories")
    .select("slug, sort_order")
    .order("sort_order", { ascending: true });
  if (!cats) return;
  const idx = cats.findIndex((c) => c.slug === slug);
  const swapIdx = dir === "up" ? idx - 1 : idx + 1;
  if (idx < 0 || swapIdx < 0 || swapIdx >= cats.length) return;
  const a = cats[idx];
  const b = cats[swapIdx];
  await supabase.from("categories").update({ sort_order: b.sort_order }).eq("slug", a.slug);
  await supabase.from("categories").update({ sort_order: a.sort_order }).eq("slug", b.slug);
  revalidatePath("/admin/kategorie");
}

export async function deleteCategory(formData: FormData) {
  if (!(await requireAdmin())) return;
  const slug = String(formData.get("slug") ?? "");
  if (!slug) return;
  const supabase = await createClient();

  // Zabezpieczenie: nie usuwaj, jeśli są produkty w tej kategorii.
  const { count } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("category", slug);
  if ((count ?? 0) > 0) return;

  await supabase.from("categories").delete().eq("slug", slug);
  revalidatePath("/admin/kategorie");
  revalidatePath("/admin/produkty");
}
