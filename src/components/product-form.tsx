"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  saveProduct,
  type ProductFormState,
} from "@/app/admin/produkty/actions";
import { UNITS, VAT_RATES, DEFAULT_VAT_RATE } from "@/lib/constants";
import type { Category } from "@/lib/categories";
import type { Tables } from "@/lib/database.types";
import { Card, Field, Input, Select, Textarea, btnSecondary } from "./ui";
import { SubmitButton } from "./submit-button";

const initial: ProductFormState = { error: null };

export function ProductForm({
  product,
  categories,
}: {
  product?: Tables<"products">;
  categories: Category[];
}) {
  const [state, action] = useActionState(saveProduct, initial);
  const editing = !!product;

  return (
    <form action={action} className="max-w-2xl space-y-5">
      {editing && <input type="hidden" name="id" value={product.id} />}
      <input
        type="hidden"
        name="current_image_url"
        value={product?.image_url ?? ""}
      />
      <input
        type="hidden"
        name="current_pdf_url"
        value={product?.pdf_url ?? ""}
      />

      <Card className="space-y-4">
        <Field label="Nazwa produktu" htmlFor="name">
          <Input
            id="name"
            name="name"
            required
            defaultValue={product?.name ?? ""}
            placeholder="np. Sernik wiedeński"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Kategoria" htmlFor="category">
            <Select
              id="category"
              name="category"
              defaultValue={product?.category ?? ""}
              required
            >
              <option value="" disabled>
                Wybierz…
              </option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.label}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Jednostka miary" htmlFor="unit">
            <Select id="unit" name="unit" defaultValue={product?.unit ?? "szt"}>
              {UNITS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Cena bazowa netto (zł)" htmlFor="base_price">
            <Input
              id="base_price"
              name="base_price"
              type="number"
              step="0.01"
              min="0"
              defaultValue={product?.base_price ?? ""}
              placeholder="0,00"
            />
          </Field>
          <Field label="Stawka VAT" htmlFor="vat_rate">
            <Select
              id="vat_rate"
              name="vat_rate"
              defaultValue={String(product?.vat_rate ?? DEFAULT_VAT_RATE)}
            >
              {VAT_RATES.map((v) => (
                <option key={v} value={v}>
                  {v}%
                </option>
              ))}
            </Select>
          </Field>
          <Field
            label="Min. ilość"
            htmlFor="min_order_qty"
            hint="Najmniejsze możliwe zamówienie"
          >
            <Input
              id="min_order_qty"
              name="min_order_qty"
              type="number"
              step="0.01"
              min="0"
              defaultValue={product?.min_order_qty ?? 1}
            />
          </Field>
          <Field
            label="Kolejność"
            htmlFor="sort_order"
            hint="Mniejsza = wyżej"
          >
            <Input
              id="sort_order"
              name="sort_order"
              type="number"
              step="1"
              defaultValue={product?.sort_order ?? 0}
            />
          </Field>
        </div>

        <Field label="Opis (opcjonalnie)" htmlFor="description">
          <Textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={product?.description ?? ""}
            placeholder="Krótki opis, skład, alergeny…"
          />
        </Field>
      </Card>

      <Card className="space-y-4">
        <Field
          label="Zdjęcie produktu"
          htmlFor="image"
          hint="JPG/PNG. Zostaw puste, aby nie zmieniać."
        >
          {product?.image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image_url}
              alt={product.name}
              className="mb-2 h-24 w-24 rounded-lg border border-border object-cover"
            />
          )}
          <Input id="image" name="image" type="file" accept="image/*" />
        </Field>

        <Field
          label="Karta produktu (PDF)"
          htmlFor="pdf"
          hint="Opcjonalnie. Zostaw puste, aby nie zmieniać."
        >
          {product?.pdf_url && (
            <a
              href={product.pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mb-2 block text-sm text-brand underline"
            >
              Obecna karta PDF ↗
            </a>
          )}
          <Input id="pdf" name="pdf" type="file" accept="application/pdf" />
        </Field>
      </Card>

      <Card>
        <label className="flex items-center gap-3 text-sm font-medium">
          <input
            type="checkbox"
            name="is_active"
            defaultChecked={product?.is_active ?? true}
            className="h-4 w-4 accent-brand"
          />
          Produkt aktywny (widoczny w katalogu dla klientów)
        </label>
      </Card>

      {state.error && (
        <p className="rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-dark">
          {state.error}
        </p>
      )}

      <div className="flex gap-3">
        <SubmitButton>{editing ? "Zapisz zmiany" : "Dodaj produkt"}</SubmitButton>
        <Link href="/admin/produkty" className={btnSecondary}>
          Anuluj
        </Link>
      </div>
    </form>
  );
}
