"use client";

import { useActionState, useMemo, useState } from "react";
import { formatPrice } from "@/lib/constants";
import type { Category } from "@/lib/categories";
import {
  bulkSetClientPrices,
  type BulkPriceState,
} from "@/app/admin/klienci/actions";
import { Card, Input, Select, btnPrimary } from "./ui";
import { PendingButton } from "./pending-button";

type Prod = {
  id: string;
  name: string;
  category: string;
  base_price: number;
  custom: number | null;
};

const initial: BulkPriceState = { error: null };

export function ClientPricesBulk({
  clientId,
  products,
  categories,
}: {
  clientId: string;
  products: Prod[];
  categories: Category[];
}) {
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [op, setOp] = useState("pct_off");
  const [cat, setCat] = useState("");
  const [state, action] = useActionState(bulkSetClientPrices, initial);

  const visible = useMemo(
    () => (cat ? products.filter((p) => p.category === cat) : products),
    [products, cat],
  );
  const allSel = visible.length > 0 && visible.every((p) => sel.has(p.id));

  const toggle = (id: string) =>
    setSel((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  const toggleAll = () =>
    setSel((s) => {
      const n = new Set(s);
      if (allSel) visible.forEach((p) => n.delete(p.id));
      else visible.forEach((p) => n.add(p.id));
      return n;
    });

  return (
    <div className="space-y-3">
      {/* Pasek akcji */}
      <form
        action={action}
        className="flex flex-wrap items-end gap-2 rounded-xl border border-border bg-surface p-3"
      >
        <input type="hidden" name="client_id" value={clientId} />
        <input type="hidden" name="ids" value={JSON.stringify([...sel])} />
        <div className="text-sm">
          <span className="font-medium">{sel.size}</span> zaznaczonych
        </div>
        <select
          name="op"
          value={op}
          onChange={(e) => setOp(e.target.value)}
          className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm"
        >
          <option value="pct_off">Rabat % od ceny bazowej</option>
          <option value="amount_off">Taniej o kwotę (zł)</option>
          <option value="set">Stała cena (zł)</option>
          <option value="remove">Usuń cenę indywidualną</option>
        </select>
        {op !== "remove" && (
          <Input
            name="value"
            type="number"
            step="0.01"
            placeholder={op === "pct_off" ? "np. 15" : "np. 12,50"}
            className="max-w-[130px]"
          />
        )}
        <PendingButton
          className={`${btnPrimary} ${sel.size === 0 ? "pointer-events-none opacity-50" : ""}`}
          pendingText="Zapisywanie…"
        >
          Zastosuj
        </PendingButton>
        {state.ok && <span className="text-sm text-green-700">{state.ok}</span>}
        {state.error && (
          <span className="text-sm text-brand-dark">{state.error}</span>
        )}
      </form>

      {/* Filtr kategorii */}
      <div className="flex flex-wrap gap-2 text-sm">
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

      <Card className="max-h-[420px] overflow-auto p-0">
        <table className="w-full text-sm">
          <thead className="sticky top-0 border-b border-border bg-muted/60 text-left text-xs uppercase tracking-wide text-foreground/50">
            <tr>
              <th className="px-3 py-2.5">
                <input
                  type="checkbox"
                  checked={allSel}
                  onChange={toggleAll}
                  className="h-4 w-4 accent-brand"
                />
              </th>
              <th className="px-4 py-2.5 font-medium">Produkt</th>
              <th className="px-4 py-2.5 font-medium">Cena bazowa</th>
              <th className="px-4 py-2.5 font-medium">Cena klienta</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((p) => (
              <tr
                key={p.id}
                className={`border-b border-border last:border-0 ${sel.has(p.id) ? "bg-brand-50/40" : ""}`}
              >
                <td className="px-3 py-2.5">
                  <input
                    type="checkbox"
                    checked={sel.has(p.id)}
                    onChange={() => toggle(p.id)}
                    className="h-4 w-4 accent-brand"
                  />
                </td>
                <td className="px-4 py-2.5">{p.name}</td>
                <td className="px-4 py-2.5 text-foreground/50">
                  {formatPrice(p.base_price)}
                </td>
                <td className="px-4 py-2.5 font-medium text-brand-dark">
                  {p.custom != null ? formatPrice(p.custom) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
