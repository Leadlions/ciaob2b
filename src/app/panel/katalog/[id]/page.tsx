import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getEffectiveClientId } from "@/lib/view-as";
import { computePrice } from "@/lib/pricing";
import { formatPrice } from "@/lib/constants";
import { Badge, btnPrimary, btnSecondary } from "@/components/ui";

export default async function CatalogProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { clientId } = await getEffectiveClientId();
  if (!clientId) notFound();

  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .single();
  if (!product) notFound();

  const { data: cat } = await supabase
    .from("categories")
    .select("label")
    .eq("slug", product.category)
    .maybeSingle();

  const [{ data: client }, { data: cp }, { data: promos }] = await Promise.all([
    supabase
      .from("clients")
      .select("discount_pct")
      .eq("id", clientId)
      .single(),
    supabase
      .from("client_prices")
      .select("custom_price")
      .eq("client_id", clientId)
      .eq("product_id", id)
      .maybeSingle(),
    supabase
      .from("promotions")
      .select("promo_price, is_promo_of_day")
      .eq("product_id", id)
      .eq("is_active", true)
      .lte("start_date", today)
      .gte("end_date", today),
  ]);

  let promoPrice: number | null = null;
  let promoOfDay = false;
  for (const pr of promos ?? []) {
    if (promoPrice == null || pr.promo_price < promoPrice) {
      promoPrice = pr.promo_price;
      promoOfDay = pr.is_promo_of_day;
    }
  }

  const price = computePrice({
    basePrice: product.base_price,
    discountPct: client?.discount_pct ?? 0,
    customPrice: cp?.custom_price ?? null,
    promoPrice,
    isPromoOfDay: promoOfDay,
  });

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/panel/katalog"
        className="mb-4 inline-block text-sm text-brand hover:underline"
      >
        ← Wróć do katalogu
      </Link>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-muted">
          {product.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image_url}
              alt={product.name}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center p-10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/ciao-logo.png"
                alt=""
                className="max-h-16 w-auto opacity-25"
              />
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <div className="mb-2 flex flex-wrap gap-1">
            <Badge>{cat?.label ?? product.category}</Badge>
            {price.isPromoOfDay && <Badge tone="red">Promocja dnia</Badge>}
            {price.isPromo && !price.isPromoOfDay && (
              <Badge tone="red">Promocja</Badge>
            )}
          </div>

          <h1 className="text-2xl font-semibold">{product.name}</h1>

          <div className="mt-3 flex items-end gap-2">
            <span className="text-2xl font-semibold text-brand-dark">
              {formatPrice(price.effective)}
            </span>
            {price.hasDiscount && (
              <span className="text-foreground/40 line-through">
                {formatPrice(price.base)}
              </span>
            )}
            <span className="text-sm text-foreground/50">/ {product.unit}</span>
          </div>

          <p className="mt-2 text-sm text-foreground/60">
            Minimalne zamówienie: {product.min_order_qty} {product.unit}
          </p>

          {product.description && (
            <p className="mt-4 text-sm leading-relaxed text-foreground/80">
              {product.description}
            </p>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/panel/nowe-zamowienie" className={btnPrimary}>
              Złóż zamówienie
            </Link>
            {product.pdf_url && (
              <a
                href={product.pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className={btnSecondary}
              >
                Karta produktu (PDF) ↗
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
