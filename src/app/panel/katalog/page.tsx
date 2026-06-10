import { createClient } from "@/lib/supabase/server";
import { getEffectiveClientId } from "@/lib/view-as";
import { computePrice } from "@/lib/pricing";
import { PageHeader } from "@/components/ui";
import { IconCatalog } from "@/components/icons";
import { CatalogGrid, type CatalogCard } from "@/components/catalog-grid";

export default async function CatalogPage() {
  const { clientId, isAdmin } = await getEffectiveClientId();

  if (!clientId) {
    return (
      <div className="mx-auto max-w-3xl">
        <PageHeader title="Katalog" icon={<IconCatalog />} />
        <div className="rounded-2xl border border-border bg-brand-50 p-6 text-sm text-brand-dark">
          {isAdmin
            ? "Wybierz firmę w pasku podglądu powyżej, aby zobaczyć katalog z jej cenami."
            : "Twoje konto nie jest jeszcze przypisane do firmy. Po przypisaniu przez administratora zobaczysz tu katalog ze swoimi cenami."}
        </div>
      </div>
    );
  }

  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const [{ data: client }, { data: products }, { data: clientPrices }, { data: promos }] =
    await Promise.all([
      supabase
        .from("clients")
        .select("discount_pct")
        .eq("id", clientId)
        .single(),
      supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("sort_order")
        .order("name"),
      supabase
        .from("client_prices")
        .select("product_id, custom_price")
        .eq("client_id", clientId),
      supabase
        .from("promotions")
        .select("product_id, promo_price, is_promo_of_day")
        .eq("is_active", true)
        .lte("start_date", today)
        .gte("end_date", today),
    ]);

  const discountPct = client?.discount_pct ?? 0;
  const customByProduct = new Map(
    (clientPrices ?? []).map((c) => [c.product_id, c.custom_price]),
  );
  const promoByProduct = new Map<string, { price: number; ofDay: boolean }>();
  for (const p of promos ?? []) {
    const cur = promoByProduct.get(p.product_id);
    if (!cur || p.promo_price < cur.price)
      promoByProduct.set(p.product_id, {
        price: p.promo_price,
        ofDay: p.is_promo_of_day,
      });
  }

  const cards: CatalogCard[] = (products ?? []).map((p) => {
    const promo = promoByProduct.get(p.id);
    const price = computePrice({
      basePrice: p.base_price,
      discountPct,
      customPrice: customByProduct.get(p.id) ?? null,
      promoPrice: promo?.price ?? null,
      isPromoOfDay: promo?.ofDay,
    });
    return {
      id: p.id,
      name: p.name,
      description: p.description,
      category: p.category,
      unit: p.unit,
      min_order_qty: p.min_order_qty,
      image_url: p.image_url,
      pdf_url: p.pdf_url,
      effective: price.effective,
      base: price.base,
      hasDiscount: price.hasDiscount,
      isPromo: price.isPromo,
      isPromoOfDay: price.isPromoOfDay,
    };
  });

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        icon={<IconCatalog />}
        title="Katalog"
        description="Produkty z Twoimi cenami. Ceny po rabacie i promocje są już uwzględnione."
      />
      <CatalogGrid products={cards} />
    </div>
  );
}
