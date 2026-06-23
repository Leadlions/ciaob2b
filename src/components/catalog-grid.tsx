"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/constants";
import type { Category } from "@/lib/categories";
import { Badge, EmptyState } from "./ui";

export type CatalogCard = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  unit: string;
  min_order_qty: number;
  image_url: string | null;
  pdf_url: string | null;
  effective: number;
  base: number;
  hasDiscount: boolean;
  isPromo: boolean;
  isPromoOfDay: boolean;
};

export function CatalogGrid({
  products,
  categories,
}: {
  products: CatalogCard[];
  categories: Category[];
}) {
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("");

  const visible = useMemo(() => {
    const s = search.trim().toLowerCase();
    return products.filter(
      (p) =>
        (!cat || p.category === cat) &&
        (!s || p.name.toLowerCase().includes(s)),
    );
  }, [products, search, cat]);

  return (
    <>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Szukaj produktu…"
        className="mb-4 w-full max-w-sm rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
      />

      <div className="mb-6 flex flex-wrap gap-2 text-sm">
        <button
          type="button"
          onClick={() => setCat("")}
          className={`rounded-full px-3 py-1 ${!cat ? "bg-brand text-white" : "bg-muted text-foreground/70"}`}
        >
          Wszystkie
        </button>
        {categories.map((c) => (
          <button
            key={c.slug}
            type="button"
            onClick={() => setCat(c.slug)}
            className={`rounded-full px-3 py-1 ${cat === c.slug ? "bg-brand text-white" : "bg-muted text-foreground/70"}`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <EmptyState
          title="Brak produktów"
          description="Nie znaleziono produktów dla wybranych filtrów."
        />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {visible.map((p) => (
            <Link
              key={p.id}
              href={`/panel/katalog/${p.id}`}
              className="flex flex-col overflow-hidden rounded-2xl border border-border bg-surface transition hover:border-brand/40"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                {p.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.image_url}
                    alt={p.name}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center p-6">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/ciao-logo.png"
                      alt=""
                      className="max-h-12 w-auto opacity-25"
                    />
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col p-3">
                <div className="mb-1 flex flex-wrap gap-1">
                  {p.isPromoOfDay && <Badge tone="red">Promocja dnia</Badge>}
                  {p.isPromo && !p.isPromoOfDay && (
                    <Badge tone="red">Promocja</Badge>
                  )}
                </div>

                <h3 className="text-sm font-medium leading-snug">{p.name}</h3>

                <div className="mt-2 flex items-end gap-1.5">
                  <span className="text-base font-semibold text-brand-dark">
                    {formatPrice(p.effective)}
                  </span>
                  {p.hasDiscount && (
                    <span className="text-xs text-foreground/40 line-through">
                      {formatPrice(p.base)}
                    </span>
                  )}
                </div>

                <div className="mt-1 text-xs text-foreground/50">
                  min. {p.min_order_qty} {p.unit}
                  {p.pdf_url && " · karta PDF"}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
