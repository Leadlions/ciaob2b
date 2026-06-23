"use client";

import { useActionState } from "react";
import {
  addCategory,
  renameCategory,
  moveCategory,
  deleteCategory,
  type CategoryState,
} from "@/app/admin/kategorie/actions";
import { Card, Input, btnPrimary } from "./ui";
import { PendingButton } from "./pending-button";

const initial: CategoryState = { error: null };

type Row = { slug: string; label: string; count: number };

export function CategoryManager({ rows }: { rows: Row[] }) {
  const [state, action] = useActionState(addCategory, initial);

  return (
    <div className="space-y-5">
      <Card>
        <form action={action} className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="label" className="mb-1 block text-sm font-medium">
              Nowa kategoria
            </label>
            <Input id="label" name="label" placeholder="np. Babeczki" />
          </div>
          <PendingButton className={btnPrimary} pendingText="Dodawanie…">
            Dodaj
          </PendingButton>
        </form>
        {state.ok && (
          <p className="mt-2 text-sm text-green-700">Dodano ✓</p>
        )}
        {state.error && (
          <p className="mt-2 text-sm text-brand-dark">{state.error}</p>
        )}
      </Card>

      <Card className="p-0">
        <table className="w-full text-sm">
          <thead className="border-b border-border text-left text-xs uppercase tracking-wide text-foreground/50">
            <tr>
              <th className="px-4 py-3 font-medium">Kolejność</th>
              <th className="px-4 py-3 font-medium">Nazwa</th>
              <th className="px-4 py-3 font-medium">Produkty</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c, i) => (
              <tr key={c.slug} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <form action={moveCategory}>
                      <input type="hidden" name="slug" value={c.slug} />
                      <input type="hidden" name="dir" value="up" />
                      <button
                        type="submit"
                        disabled={i === 0}
                        className="rounded px-1.5 py-0.5 text-foreground/60 hover:bg-muted disabled:opacity-30"
                      >
                        ↑
                      </button>
                    </form>
                    <form action={moveCategory}>
                      <input type="hidden" name="slug" value={c.slug} />
                      <input type="hidden" name="dir" value="down" />
                      <button
                        type="submit"
                        disabled={i === rows.length - 1}
                        className="rounded px-1.5 py-0.5 text-foreground/60 hover:bg-muted disabled:opacity-30"
                      >
                        ↓
                      </button>
                    </form>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <form action={renameCategory} className="flex items-center gap-2">
                    <input type="hidden" name="slug" value={c.slug} />
                    <Input
                      name="label"
                      defaultValue={c.label}
                      className="max-w-[220px]"
                    />
                    <PendingButton
                      className="rounded-lg px-2 py-1 text-brand hover:bg-brand-50"
                      pendingText="…"
                    >
                      Zapisz
                    </PendingButton>
                  </form>
                </td>
                <td className="px-4 py-3 text-foreground/60">{c.count}</td>
                <td className="px-4 py-3 text-right">
                  {c.count > 0 ? (
                    <span
                      className="text-xs text-foreground/40"
                      title="Najpierw przenieś produkty do innej kategorii"
                    >
                      w użyciu
                    </span>
                  ) : (
                    <form action={deleteCategory}>
                      <input type="hidden" name="slug" value={c.slug} />
                      <PendingButton
                        className="rounded-lg px-2 py-1 text-brand-dark hover:bg-brand-50"
                        pendingText="…"
                      >
                        Usuń
                      </PendingButton>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
