import { createClient } from "@/lib/supabase/server";
import { getCategories } from "@/lib/categories";
import { PageHeader } from "@/components/ui";
import { IconCatalog } from "@/components/icons";
import { CategoryManager } from "@/components/category-manager";

export default async function CategoriesPage() {
  const supabase = await createClient();
  const [categories, { data: products }] = await Promise.all([
    getCategories(supabase),
    supabase.from("products").select("category"),
  ]);

  const counts = new Map<string, number>();
  for (const p of products ?? [])
    counts.set(p.category, (counts.get(p.category) ?? 0) + 1);

  const rows = categories.map((c) => ({
    slug: c.slug,
    label: c.label,
    count: counts.get(c.slug) ?? 0,
  }));

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        icon={<IconCatalog />}
        title="Kategorie"
        description="Dodawaj, zmieniaj nazwy i kolejność kategorii produktów."
      />
      <CategoryManager rows={rows} />
    </div>
  );
}
