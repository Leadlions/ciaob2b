"use client";

import { useActionState, useMemo, useState } from "react";
import {
  submitOrder,
  type CreateOrderState,
} from "@/app/panel/nowe-zamowienie/actions";
import {
  CATEGORIES,
  CATEGORY_LABELS,
  DELIVERY_SLOTS,
  DELIVERY_SLOT_LABELS,
  WEEKDAYS,
  formatDate,
  formatPrice,
} from "@/lib/constants";
import type { Enums } from "@/lib/database.types";
import { SubmitButton } from "./submit-button";
import { Badge, btnPrimary, btnSecondary } from "./ui";

export type ProductItem = {
  id: string;
  name: string;
  category: Enums<"product_category">;
  unit: string;
  min_order_qty: number;
  price: number;
  image_url: string | null;
  description: string | null;
  pdf_url: string | null;
};

const initial: CreateOrderState = { error: null };

export function OrderCreator({
  products,
  minDate,
  cutoffHour = 18,
}: {
  products: ProductItem[];
  minDate: string;
  cutoffHour?: number;
}) {
  const [state, action] = useActionState(submitOrder, initial);

  // koszyk
  const [qty, setQty] = useState<Record<string, number>>({});
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("");
  const [preview, setPreview] = useState<ProductItem | null>(null);

  // tryb i pola dostawy
  const [mode, setMode] = useState<"jednorazowe" | "cykliczne">("jednorazowe");
  const [singleDate, setSingleDate] = useState("");
  const [slot, setSlot] = useState("");
  const [recurFrom, setRecurFrom] = useState("");
  const [recurTo, setRecurTo] = useState("");
  const [weekdays, setWeekdays] = useState<number[]>([]);
  const [excluded, setExcluded] = useState<string[]>([]);
  const [exclInput, setExclInput] = useState("");
  const [notes, setNotes] = useState("");

  const visible = useMemo(() => {
    const s = search.trim().toLowerCase();
    return products.filter(
      (p) =>
        (!cat || p.category === cat) &&
        (!s || p.name.toLowerCase().includes(s)),
    );
  }, [products, search, cat]);

  const cart = useMemo(
    () => products.map((p) => ({ p, q: qty[p.id] || 0 })).filter((x) => x.q > 0),
    [products, qty],
  );
  const total = cart.reduce((s, x) => s + x.q * x.p.price, 0);
  const items = cart.map((x) => ({ product_id: x.p.id, quantity: x.q }));
  const setQ = (id: string, v: number) =>
    setQty((m) => ({ ...m, [id]: v < 0 ? 0 : v }));

  const toggleDay = (n: number) =>
    setWeekdays((w) => (w.includes(n) ? w.filter((x) => x !== n) : [...w, n]));

  const addExcluded = () => {
    if (exclInput && !excluded.includes(exclInput))
      setExcluded((e) => [...e, exclInput].sort());
    setExclInput("");
  };

  return (
    <form action={action} className="grid gap-6 lg:grid-cols-[1fr_380px]">
      {/* LEWA: produkty */}
      <div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Szukaj produktu…"
          className="mb-3 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
        <div className="mb-4 flex flex-wrap gap-2 text-sm">
          <button
            type="button"
            onClick={() => setCat("")}
            className={`rounded-full px-3 py-1 ${!cat ? "bg-brand text-white" : "bg-muted text-foreground/70"}`}
          >
            Wszystkie
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCat(c)}
              className={`rounded-full px-3 py-1 ${cat === c ? "bg-brand text-white" : "bg-muted text-foreground/70"}`}
            >
              {CATEGORY_LABELS[c]}
            </button>
          ))}
        </div>

        <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
          {visible.map((p) => {
            const q = qty[p.id] || 0;
            const min = p.min_order_qty || 1;
            return (
              <div key={p.id} className="flex items-center gap-3 px-3 py-2.5">
                <button
                  type="button"
                  onClick={() => setPreview(p)}
                  title="Podgląd produktu"
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                >
                  <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-muted">
                    {p.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.image_url}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    ) : (
                      <span className="absolute inset-0 flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="/ciao-logo.png"
                          alt=""
                          className="max-h-4 w-auto opacity-25"
                        />
                      </span>
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">
                      {p.name}
                    </span>
                    <span className="block text-xs text-foreground/50">
                      {formatPrice(p.price)} / {p.unit} · min. {min}
                    </span>
                  </span>
                </button>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setQ(p.id, q <= min ? 0 : q - 1)}
                    className="h-7 w-7 rounded-lg border border-border text-foreground/60 hover:bg-muted"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min={0}
                    value={q || ""}
                    onChange={(e) => setQ(p.id, Number(e.target.value))}
                    placeholder="0"
                    className="h-7 w-14 rounded-lg border border-border bg-background text-center text-sm outline-none focus:border-brand"
                  />
                  <button
                    type="button"
                    onClick={() => setQ(p.id, q === 0 ? min : q + 1)}
                    className="h-7 w-7 rounded-lg border border-border text-foreground/60 hover:bg-muted"
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PRAWA: dostawa */}
      <div className="lg:sticky lg:top-6 lg:self-start">
        <div className="rounded-2xl border border-border bg-surface p-5">
          {/* przełącznik trybu */}
          <div className="mb-4 grid grid-cols-2 gap-1 rounded-lg bg-muted p-1 text-sm">
            <button
              type="button"
              onClick={() => setMode("jednorazowe")}
              className={`rounded-md py-1.5 font-medium ${mode === "jednorazowe" ? "bg-surface shadow-sm" : "text-foreground/60"}`}
            >
              Jednorazowe
            </button>
            <button
              type="button"
              onClick={() => setMode("cykliczne")}
              className={`rounded-md py-1.5 font-medium ${mode === "cykliczne" ? "bg-surface shadow-sm" : "text-foreground/60"}`}
            >
              Cykliczne
            </button>
          </div>

          <p className="mb-3 rounded-lg bg-brand-50 px-3 py-1.5 text-xs text-brand-dark">
            Najwcześniejsza możliwa data dostawy:{" "}
            <strong>{formatDate(minDate)}</strong>. Zamówienia na kolejny dzień
            przyjmujemy do <strong>{String(cutoffHour).padStart(2, "0")}:00</strong>.
          </p>

          {mode === "jednorazowe" ? (
            <div className="mb-3">
              <label
                htmlFor="single_date"
                className="mb-1 block text-sm font-medium"
              >
                Data dostawy
              </label>
              <input
                id="single_date"
                type="date"
                min={minDate}
                value={singleDate}
                onChange={(e) => setSingleDate(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand"
              />
            </div>
          ) : (
            <div className="mb-3 space-y-3">
              <div>
                <span className="mb-1.5 block text-sm font-medium">
                  Powtarzaj w dni
                </span>
                <div className="flex gap-1.5">
                  {WEEKDAYS.map((w) => {
                    const on = weekdays.includes(w.n);
                    return (
                      <button
                        key={w.n}
                        type="button"
                        title={w.long}
                        onClick={() => toggleDay(w.n)}
                        className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-medium transition ${
                          on
                            ? "bg-brand text-white"
                            : "border border-border text-foreground/60 hover:bg-muted"
                        }`}
                      >
                        {w.short.slice(0, 2)}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium">Od dnia</label>
                  <input
                    type="date"
                    min={minDate}
                    value={recurFrom}
                    onChange={(e) => setRecurFrom(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-2 py-2 text-sm outline-none focus:border-brand"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Do dnia</label>
                  <input
                    type="date"
                    min={minDate}
                    value={recurTo}
                    onChange={(e) => setRecurTo(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-2 py-2 text-sm outline-none focus:border-brand"
                  />
                </div>
              </div>

              {/* wykluczone dni */}
              <div>
                <span className="mb-1 block text-sm font-medium">
                  Wyklucz dni (np. święta)
                </span>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={exclInput}
                    onChange={(e) => setExclInput(e.target.value)}
                    className="flex-1 rounded-lg border border-border bg-background px-2 py-2 text-sm outline-none focus:border-brand"
                  />
                  <button
                    type="button"
                    onClick={addExcluded}
                    className="rounded-lg border border-border px-3 text-sm font-medium hover:bg-muted"
                  >
                    Dodaj
                  </button>
                </div>
                {excluded.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {excluded.map((d) => (
                      <span
                        key={d}
                        className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs"
                      >
                        {formatDate(d)}
                        <button
                          type="button"
                          onClick={() =>
                            setExcluded((e) => e.filter((x) => x !== d))
                          }
                          className="text-foreground/40 hover:text-brand"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* godzina dostawy (wspólna) */}
          <div className="mb-3">
            <label
              htmlFor="order_slot"
              className="mb-1 block text-sm font-medium"
            >
              Godzina dostawy
            </label>
            <select
              id="order_slot"
              value={slot}
              onChange={(e) => setSlot(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand"
            >
              <option value="" disabled>
                Wybierz…
              </option>
              {DELIVERY_SLOTS.map((s) => (
                <option key={s} value={s}>
                  {DELIVERY_SLOT_LABELS[s]}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium">Uwagi (opcjonalnie)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand"
            />
          </div>

          {/* podsumowanie */}
          <div className="mb-3 border-t border-border pt-3">
            {cart.length === 0 ? (
              <p className="text-sm text-foreground/50">
                Dodaj produkty (ilości po lewej).
              </p>
            ) : (
              <>
                <ul className="mb-2 space-y-1 text-sm">
                  {cart.map((x) => (
                    <li key={x.p.id} className="flex justify-between">
                      <span className="min-w-0 truncate pr-2">
                        {x.q}× {x.p.name}
                      </span>
                      <span className="whitespace-nowrap font-medium">
                        {formatPrice(x.q * x.p.price)}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="flex justify-between text-sm font-semibold">
                  <span>Razem {mode === "cykliczne" ? "(za 1 dostawę)" : ""}</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </>
            )}
          </div>

          {/* ukryte pola dla akcji */}
          <input type="hidden" name="mode" value={mode} />
          <input type="hidden" name="items" value={JSON.stringify(items)} />
          <input type="hidden" name="notes" value={notes} />
          <input type="hidden" name="delivery_slot" value={slot} />
          <input type="hidden" name="delivery_date" value={singleDate} />
          <input type="hidden" name="start_date" value={recurFrom} />
          <input type="hidden" name="end_date" value={recurTo} />
          <input type="hidden" name="weekdays" value={JSON.stringify(weekdays)} />
          <input
            type="hidden"
            name="excluded_dates"
            value={JSON.stringify(excluded)}
          />

          {state.error && (
            <p className="mb-3 rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-dark">
              {state.error}
            </p>
          )}

          <SubmitButton pendingText="Zapisywanie…">
            {mode === "cykliczne" ? "Utwórz harmonogram" : "Złóż zamówienie"}
          </SubmitButton>
        </div>
      </div>

      {/* Modal podglądu produktu */}
      {preview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setPreview(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-md overflow-auto rounded-2xl bg-surface p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-muted">
              {preview.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={preview.image_url}
                  alt={preview.name}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center p-8">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/ciao-logo.png"
                    alt=""
                    className="max-h-14 w-auto opacity-25"
                  />
                </div>
              )}
            </div>

            <div className="mt-3 flex flex-wrap gap-1">
              <Badge>{CATEGORY_LABELS[preview.category]}</Badge>
            </div>
            <h3 className="mt-1 text-lg font-semibold">{preview.name}</h3>
            <div className="mt-1 flex items-end gap-2">
              <span className="text-xl font-semibold text-brand-dark">
                {formatPrice(preview.price)}
              </span>
              <span className="text-sm text-foreground/50">
                / {preview.unit}
              </span>
            </div>
            <p className="mt-1 text-sm text-foreground/55">
              Minimalne zamówienie: {preview.min_order_qty} {preview.unit}
            </p>
            {preview.description && (
              <p className="mt-3 text-sm leading-relaxed text-foreground/80">
                {preview.description}
              </p>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  const p = preview;
                  setQ(
                    p.id,
                    Math.max(qty[p.id] || 0, p.min_order_qty || 1),
                  );
                  setPreview(null);
                }}
                className={btnPrimary}
              >
                Dodaj do zamówienia
              </button>
              {preview.pdf_url && (
                <a
                  href={preview.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={btnSecondary}
                >
                  Karta PDF ↗
                </a>
              )}
              <button
                type="button"
                onClick={() => setPreview(null)}
                className={btnSecondary}
              >
                Zamknij
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
