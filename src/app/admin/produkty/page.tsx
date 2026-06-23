import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCategories, categoryLabelMap } from "@/lib/categories";
import { EmptyState, LinkButton, PageHeader } from "@/components/ui";
import { IconProducts } from "@/components/icons";
import { ProductsTable } from "@/components/products-table";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ kat?: string; status?: string }>;
}) {
  const { kat, status } = await searchParams;
  const supabase = await createClient();

  const categories = await getCategories(supabase);
  const catLabel = categoryLabelMap(categories);
  const validKat = categories.some((c) => c.slug === kat);

  let query = supabase
    .from("products")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (kat && validKat) {
    query = query.eq("category", kat);
  }
  if (status === "aktywne") query = query.eq("is_active", true);
  if (status === "nieaktywne") query = query.eq("is_active", false);

  const { data: products } = await query;

  const filterLink = (params: Record<string, string | undefined>) => {
    const sp = new URLSearchParams();
    const next = { kat, status, ...params };
    if (next.kat) sp.set("kat", next.kat);
    if (next.status) sp.set("status", next.status);
    const qs = sp.toString();
    return `/admin/produkty${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        icon={<IconProducts />}
        title="Produkty"
        description="Katalog produktów ciao manufaktury."
        action={<LinkButton href="/admin/produkty/nowy">+ Nowy produkt</LinkButton>}
      />

      {/* Filtry */}
      <div className="mb-5 flex flex-wrap gap-2 text-sm">
        <Link
          href={filterLink({ kat: undefined })}
          className={`rounded-full px-3 py-1 ${!kat ? "bg-brand text-white" : "bg-muted text-foreground/70"}`}
        >
          Wszystkie kategorie
        </Link>
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={filterLink({ kat: c.slug })}
            className={`rounded-full px-3 py-1 ${kat === c.slug ? "bg-brand text-white" : "bg-muted text-foreground/70"}`}
          >
            {c.label}
          </Link>
        ))}
      </div>

      {!products || products.length === 0 ? (
        <EmptyState
          title="Brak produktów"
          description="Dodaj pierwszy produkt, aby pojawił się w katalogu."
          action={<LinkButton href="/admin/produkty/nowy">+ Nowy produkt</LinkButton>}
        />
      ) : (
        <ProductsTable products={products} catLabel={catLabel} />
      )}
    </div>
  );
}
