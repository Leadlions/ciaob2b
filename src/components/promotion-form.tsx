"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  savePromotion,
  type PromotionFormState,
} from "@/app/admin/promocje/actions";
import type { Tables } from "@/lib/database.types";
import { Card, Field, Input, Select, btnSecondary } from "./ui";
import { SubmitButton } from "./submit-button";

const initial: PromotionFormState = { error: null };

export function PromotionForm({
  products,
  promotion,
}: {
  products: { id: string; name: string }[];
  promotion?: Tables<"promotions">;
}) {
  const [state, action] = useActionState(savePromotion, initial);
  const editing = !!promotion;

  return (
    <form action={action} className="max-w-2xl space-y-5">
      {editing && <input type="hidden" name="id" value={promotion.id} />}

      <Card className="space-y-4">
        <Field label="Produkt" htmlFor="product_id">
          <Select
            id="product_id"
            name="product_id"
            defaultValue={promotion?.product_id ?? ""}
            required
          >
            <option value="" disabled>
              Wybierz produkt…
            </option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Cena promocyjna (zł)" htmlFor="promo_price">
          <Input
            id="promo_price"
            name="promo_price"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={promotion?.promo_price ?? ""}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Obowiązuje od" htmlFor="start_date">
            <Input
              id="start_date"
              name="start_date"
              type="date"
              required
              defaultValue={promotion?.start_date ?? ""}
            />
          </Field>
          <Field label="Obowiązuje do" htmlFor="end_date">
            <Input
              id="end_date"
              name="end_date"
              type="date"
              required
              defaultValue={promotion?.end_date ?? ""}
            />
          </Field>
        </div>
      </Card>

      <Card className="space-y-3">
        <label className="flex items-center gap-3 text-sm font-medium">
          <input
            type="checkbox"
            name="is_promo_of_day"
            defaultChecked={promotion?.is_promo_of_day ?? false}
            className="h-4 w-4 accent-brand"
          />
          Oznacz jako „promocja dnia"
        </label>
        <label className="flex items-center gap-3 text-sm font-medium">
          <input
            type="checkbox"
            name="is_active"
            defaultChecked={promotion?.is_active ?? true}
            className="h-4 w-4 accent-brand"
          />
          Promocja aktywna
        </label>
      </Card>

      {state.error && (
        <p className="rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-dark">
          {state.error}
        </p>
      )}

      <div className="flex gap-3">
        <SubmitButton>{editing ? "Zapisz zmiany" : "Dodaj promocję"}</SubmitButton>
        <Link href="/admin/promocje" className={btnSecondary}>
          Anuluj
        </Link>
      </div>
    </form>
  );
}
