import { createClient } from "@/lib/supabase/server";
import { formatDate, formatPrice } from "@/lib/constants";
import { Badge, EmptyState, LinkButton, PageHeader } from "@/components/ui";
import { IconPromo } from "@/components/icons";
import { togglePromotionActive, deletePromotion } from "./actions";

export default async function PromotionsPage() {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data: promotions } = await supabase
    .from("promotions")
    .select("*")
    .order("start_date", { ascending: false });

  const productIds = [...new Set((promotions ?? []).map((p) => p.product_id))];
  const nameMap = new Map<string, string>();
  if (productIds.length) {
    const { data: products } = await supabase
      .from("products")
      .select("id, name")
      .in("id", productIds);
    for (const p of products ?? []) nameMap.set(p.id, p.name);
  }

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        icon={<IconPromo />}
        title="Promocje"
        description="Czasowe obniżki cen widoczne dla klientów w katalogu."
        action={<LinkButton href="/admin/promocje/nowy">+ Nowa promocja</LinkButton>}
      />

      {!promotions || promotions.length === 0 ? (
        <EmptyState
          title="Brak promocji"
          description="Dodaj pierwszą promocję, aby pojawiła się w katalogu klientów."
          action={<LinkButton href="/admin/promocje/nowy">+ Nowa promocja</LinkButton>}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-foreground/50">
              <tr>
                <th className="px-4 py-3 font-medium">Produkt</th>
                <th className="px-4 py-3 font-medium">Cena promo</th>
                <th className="px-4 py-3 font-medium">Okres</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {promotions.map((p) => {
                const live =
                  p.is_active && p.start_date <= today && p.end_date >= today;
                return (
                  <tr key={p.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3">
                      <div className="font-medium">
                        {nameMap.get(p.product_id) ?? "—"}
                      </div>
                      {p.is_promo_of_day && (
                        <Badge tone="red">Promocja dnia</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-brand-dark">
                      {formatPrice(p.promo_price)}
                    </td>
                    <td className="px-4 py-3 text-foreground/70">
                      {formatDate(p.start_date)} – {formatDate(p.end_date)}
                    </td>
                    <td className="px-4 py-3">
                      {live ? (
                        <Badge tone="green">Trwa</Badge>
                      ) : p.is_active ? (
                        <Badge tone="amber">Zaplanowana / zakończona</Badge>
                      ) : (
                        <Badge>Nieaktywna</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <a
                          href={`/admin/promocje/${p.id}`}
                          className="rounded-lg px-2 py-1 text-brand hover:bg-brand-50"
                        >
                          Edytuj
                        </a>
                        <form action={togglePromotionActive}>
                          <input type="hidden" name="id" value={p.id} />
                          <input
                            type="hidden"
                            name="next"
                            value={(!p.is_active).toString()}
                          />
                          <button
                            type="submit"
                            className="rounded-lg px-2 py-1 text-foreground/60 hover:bg-muted"
                          >
                            {p.is_active ? "Wyłącz" : "Włącz"}
                          </button>
                        </form>
                        <form action={deletePromotion}>
                          <input type="hidden" name="id" value={p.id} />
                          <button
                            type="submit"
                            className="rounded-lg px-2 py-1 text-foreground/40 hover:bg-brand-50 hover:text-brand"
                          >
                            Usuń
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
