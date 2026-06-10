import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getEffectiveClientId } from "@/lib/view-as";
import { computePrice } from "@/lib/pricing";
import { PageHeader } from "@/components/ui";
import { OrderCreator, type ProductItem } from "@/components/order-creator";

export default async function NewOrderPage() {
  const { clientId, isAdmin } = await getEffectiveClientId();

  if (!clientId) {
    return (
      <div className="mx-auto max-w-3xl">
        <PageHeader title="Utwórz zamówienie" />
        <div className="rounded-2xl border border-border bg-brand-50 p-6 text-sm text-brand-dark">
          {isAdmin
            ? "Wybierz firmę w pasku podglądu powyżej, aby złożyć zamówienie w jej imieniu."
            : "Twoje konto nie jest jeszcze przypisane do firmy."}
        </div>
      </div>
    );
  }

  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const [{ data: client }, { data: products }, { data: cprices }, { data: promos }] =
    await Promise.all([
      supabase
        .from("clients")
        .select("discount_pct, orders_suspended")
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
        .select("product_id, promo_price")
        .eq("is_active", true)
        .lte("start_date", today)
        .gte("end_date", today),
    ]);

  if (client?.orders_suspended) {
    return (
      <div className="mx-auto max-w-3xl">
        <PageHeader title="Utwórz zamówienie" />
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800">
          Składanie zamówień jest obecnie wstrzymane dla Twojego konta.
        </div>
      </div>
    );
  }

  const customMap = new Map(
    (cprices ?? []).map((c) => [c.product_id, c.custom_price]),
  );
  const promoMap = new Map<string, number>();
  for (const pr of promos ?? []) {
    const cur = promoMap.get(pr.product_id);
    if (cur == null || pr.promo_price < cur)
      promoMap.set(pr.product_id, pr.promo_price);
  }

  const items: ProductItem[] = (products ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    unit: p.unit,
    min_order_qty: p.min_order_qty,
    image_url: p.image_url,
    description: p.description,
    pdf_url: p.pdf_url,
    price: computePrice({
      basePrice: p.base_price,
      discountPct: client?.discount_pct ?? 0,
      customPrice: customMap.get(p.id) ?? null,
      promoPrice: promoMap.get(p.id) ?? null,
    }).effective,
  }));

  const minDate = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-4">
        <Link
          href="/panel/zamowienia"
          className="text-sm text-brand hover:underline"
        >
          ← Wróć do zamówień
        </Link>
      </div>
      <PageHeader
        title="Utwórz zamówienie"
        description="Wybierz produkty, a następnie dostawę jednorazową lub cykliczną."
      />
      <OrderCreator products={items} minDate={minDate} />
    </div>
  );
}
