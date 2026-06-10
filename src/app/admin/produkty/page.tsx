import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  CATEGORIES,
  CATEGORY_LABELS,
  formatPrice,
} from "@/lib/constants";
import {
  Badge,
  EmptyState,
  LinkButton,
  PageHeader,
} from "@/components/ui";
import { IconProducts } from "@/components/icons";
import { PendingButton } from "@/components/pending-button";
import { toggleProductActive } from "./actions";
import type { Enums } from "@/lib/database.types";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ kat?: string; status?: string }>;
}) {
  const { kat, status } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (kat && CATEGORIES.includes(kat as Enums<"product_category">)) {
    query = query.eq("category", kat as Enums<"product_category">);
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
        {CATEGORIES.map((c) => (
          <Link
            key={c}
            href={filterLink({ kat: c })}
            className={`rounded-full px-3 py-1 ${kat === c ? "bg-brand text-white" : "bg-muted text-foreground/70"}`}
          >
            {CATEGORY_LABELS[c]}
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
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-foreground/50">
              <tr>
                <th className="px-4 py-3 font-medium">Produkt</th>
                <th className="px-4 py-3 font-medium">Kategoria</th>
                <th className="px-4 py-3 font-medium">Cena bazowa</th>
                <th className="px-4 py-3 font-medium">Min.</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.image_url}
                          alt={p.name}
                          className="h-10 w-10 rounded-lg border border-border object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-lg border border-dashed border-border" />
                      )}
                      <span className="font-medium">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-foreground/70">
                    {CATEGORY_LABELS[p.category]}
                  </td>
                  <td className="px-4 py-3">{formatPrice(p.base_price)}</td>
                  <td className="px-4 py-3 text-foreground/70">
                    {p.min_order_qty} {p.unit}
                  </td>
                  <td className="px-4 py-3">
                    {p.is_active ? (
                      <Badge tone="green">Aktywny</Badge>
                    ) : (
                      <Badge>Nieaktywny</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/produkty/${p.id}`}
                        className="rounded-lg px-2 py-1 text-brand hover:bg-brand-50"
                      >
                        Edytuj
                      </Link>
                      <form action={toggleProductActive}>
                        <input type="hidden" name="id" value={p.id} />
                        <input
                          type="hidden"
                          name="next"
                          value={(!p.is_active).toString()}
                        />
                        <PendingButton
                          className="rounded-lg px-2 py-1 text-foreground/60 hover:bg-muted"
                          pendingText="…"
                        >
                          {p.is_active ? "Dezaktywuj" : "Aktywuj"}
                        </PendingButton>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
