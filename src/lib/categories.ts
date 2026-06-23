import type { SupabaseClient } from "@supabase/supabase-js";

export type Category = { slug: string; label: string; sort_order: number };

// Lista kategorii z bazy (posortowana). Używane w panelach i katalogu.
export async function getCategories(
  supabase: SupabaseClient,
): Promise<Category[]> {
  const { data } = await supabase
    .from("categories")
    .select("slug, label, sort_order")
    .order("sort_order", { ascending: true })
    .order("label", { ascending: true });
  return (data ?? []) as Category[];
}

// Mapa slug -> etykieta (do wyświetlania nazwy kategorii produktu).
export function categoryLabelMap(cats: Category[]): Record<string, string> {
  return Object.fromEntries(cats.map((c) => [c.slug, c.label]));
}
