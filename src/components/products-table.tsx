"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { formatPrice, grossFromNet, VAT_RATES } from "@/lib/constants";
import type { Category } from "@/lib/categories";
import {
  bulkUpdateProducts,
  toggleProductActive,
  type BulkState,
} from "@/app/admin/produkty/actions";
import { Badge, Input, Select, btnPrimary } from "./ui";
import { PendingButton } from "./pending-button";

type Row = {
  id: string;
  name: string;
  category: string;
  base_price: number;
  vat_rate: number;
  unit: string;
  min_order_qty: number;
  is_active: boolean;
  image_url: string | null;
};

const initial: BulkState = { error: null };

export function ProductsTable({
  products,
  categories,
  catLabel,
}: {
  products: Row[];
  categories: Category[];
  catLabel: Record<string, string>;
}) {
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [op, setOp] = useState("set_price");
  const [state, action] = useActionState(bulkUpdateProducts, initial);

  const allSelected = products.length > 0 && sel.size === products.length;
  const toggle = (id: string) =>
    setSel((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  const toggleAll = () =>
    setSel(allSelected ? new Set() : new Set(products.map((p) => p.id)));

  return (
    <div>
      {/* Pasek akcji grupowych */}
      <form
        action={action}
        className="mb-4 flex flex-wrap items-end gap-2 rounded-xl border border-border bg-surface p-3"
      >
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
          <option value="set_price">Ustaw cenę netto (zł)</option>
          <option value="pct">Zmień o procent (%)</option>
          <option value="amount">Zmień o kwotę (zł)</option>
          <option value="set_vat">Ustaw VAT (%)</option>
          <option value="set_category">Przypisz kategorię</option>
          <option value="activate">Aktywuj</option>
          <option value="deactivate">Dezaktywuj</option>
        </select>
        {op === "set_vat" ? (
          <Select name="value" className="max-w-[100px]" defaultValue="8">
            {VAT_RATES.map((v) => (
              <option key={v} value={v}>
                {v}%
              </option>
            ))}
          </Select>
        ) : op === "set_category" ? (
          <Select name="value" className="max-w-[200px]" defaultValue="">
            <option value="" disabled>
              Wybierz kategorię…
            </option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.label}
              </option>
            ))}
          </Select>
        ) : op === "activate" || op === "deactivate" ? null : (
          <Input
            name="value"
            type="number"
            step="0.01"
            placeholder={op === "pct" ? "np. -10 lub 5" : "np. 12,50"}
            className="max-w-[140px]"
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

      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-foreground/50">
            <tr>
              <th className="px-3 py-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="h-4 w-4 accent-brand"
                />
              </th>
              <th className="px-4 py-3 font-medium">Produkt</th>
              <th className="px-4 py-3 font-medium">Kategoria</th>
              <th className="px-4 py-3 font-medium">Netto</th>
              <th className="px-4 py-3 font-medium">VAT</th>
              <th className="px-4 py-3 font-medium">Brutto</th>
              <th className="px-4 py-3 font-medium">Min.</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr
                key={p.id}
                className={`border-b border-border last:border-0 ${sel.has(p.id) ? "bg-brand-50/40" : ""}`}
              >
                <td className="px-3 py-3">
                  <input
                    type="checkbox"
                    checked={sel.has(p.id)}
                    onChange={() => toggle(p.id)}
                    className="h-4 w-4 accent-brand"
                  />
                </td>
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
                  {catLabel[p.category] ?? p.category}
                </td>
                <td className="px-4 py-3">{formatPrice(p.base_price)}</td>
                <td className="px-4 py-3 text-foreground/60">{p.vat_rate}%</td>
                <td className="px-4 py-3 font-medium">
                  {formatPrice(grossFromNet(p.base_price, p.vat_rate))}
                </td>
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
    </div>
  );
}
