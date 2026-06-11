"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  saveClient,
  type ClientFormState,
} from "@/app/admin/klienci/actions";
import type { Tables } from "@/lib/database.types";
import { Card, Field, Input, Textarea, btnSecondary } from "./ui";
import { SubmitButton } from "./submit-button";

const initial: ClientFormState = { error: null };

export function ClientForm({ client }: { client?: Tables<"clients"> }) {
  const [state, action] = useActionState(saveClient, initial);
  const editing = !!client;

  return (
    <form action={action} className="max-w-2xl space-y-5">
      {editing && <input type="hidden" name="id" value={client.id} />}

      <Card className="space-y-4">
        <Field label="Nazwa firmy" htmlFor="name">
          <Input
            id="name"
            name="name"
            required
            defaultValue={client?.name ?? ""}
            placeholder="np. Kawiarnia Pod Lipą sp. z o.o."
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="NIP" htmlFor="nip">
            <Input
              id="nip"
              name="nip"
              defaultValue={client?.nip ?? ""}
              placeholder="0000000000"
            />
          </Field>
          <Field label="Rabat ogólny (%)" htmlFor="discount_pct" hint="0–100">
            <Input
              id="discount_pct"
              name="discount_pct"
              type="number"
              step="0.01"
              min="0"
              max="100"
              defaultValue={client?.discount_pct ?? 0}
            />
          </Field>
        </div>

        <Field
          label="Minimum kwotowe zamówienia (zł)"
          htmlFor="min_order_value"
          hint="Najniższa wartość koszyka, jaką ten klient może zamówić. 0 lub puste = brak minimum."
        >
          <Input
            id="min_order_value"
            name="min_order_value"
            type="number"
            step="0.01"
            min="0"
            inputMode="decimal"
            defaultValue={client?.min_order_value ? client.min_order_value : ""}
            placeholder="0"
          />
        </Field>

        <Field label="Adres" htmlFor="address">
          <Textarea
            id="address"
            name="address"
            rows={2}
            defaultValue={client?.address ?? ""}
            placeholder="Ulica, kod pocztowy, miasto"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="E-mail kontaktowy" htmlFor="contact_email">
            <Input
              id="contact_email"
              name="contact_email"
              type="email"
              defaultValue={client?.contact_email ?? ""}
            />
          </Field>
          <Field label="Telefon" htmlFor="contact_phone">
            <Input
              id="contact_phone"
              name="contact_phone"
              defaultValue={client?.contact_phone ?? ""}
            />
          </Field>
        </div>
      </Card>

      <Card className="space-y-3">
        <label className="flex items-center gap-3 text-sm font-medium">
          <input
            type="checkbox"
            name="is_active"
            defaultChecked={client?.is_active ?? true}
            className="h-4 w-4 accent-brand"
          />
          Klient aktywny (może się logować i zamawiać)
        </label>
        <label className="flex items-center gap-3 text-sm font-medium">
          <input
            type="checkbox"
            name="orders_suspended"
            defaultChecked={client?.orders_suspended ?? false}
            className="h-4 w-4 accent-brand"
          />
          Wstrzymaj składanie zamówień (blokada koszyka)
        </label>
      </Card>

      <Card>
        <Field label="Notatki wewnętrzne (niewidoczne dla klienta)" htmlFor="internal_notes">
          <Textarea
            id="internal_notes"
            name="internal_notes"
            rows={3}
            defaultValue={client?.internal_notes ?? ""}
          />
        </Field>
      </Card>

      {state.error && (
        <p className="rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-dark">
          {state.error}
        </p>
      )}

      <div className="flex gap-3">
        <SubmitButton>{editing ? "Zapisz zmiany" : "Dodaj klienta"}</SubmitButton>
        <Link href="/admin/klienci" className={btnSecondary}>
          Anuluj
        </Link>
      </div>
    </form>
  );
}
