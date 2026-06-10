"use client";

import { useActionState } from "react";
import {
  uploadInvoice,
  type InvoiceFormState,
} from "@/app/admin/faktury/actions";
import { Card, Field, Input, Select } from "./ui";
import { SubmitButton } from "./submit-button";

const initial: InvoiceFormState = { error: null };

export function InvoiceUploadForm({
  clients,
}: {
  clients: { id: string; name: string }[];
}) {
  const [state, action] = useActionState(uploadInvoice, initial);

  return (
    <Card>
      <form action={action} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Klient" htmlFor="client_id">
            <Select id="client_id" name="client_id" defaultValue="" required>
              <option value="" disabled>
                Wybierz klienta…
              </option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Numer faktury (opcjonalnie)" htmlFor="number">
            <Input id="number" name="number" placeholder="np. FV/2026/06/001" />
          </Field>
        </div>

        <Field label="Plik PDF faktury" htmlFor="file">
          <Input id="file" name="file" type="file" accept="application/pdf" required />
        </Field>

        {state.error && (
          <p className="rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-dark">
            {state.error}
          </p>
        )}

        <SubmitButton pendingText="Wgrywanie…">Wgraj fakturę</SubmitButton>
      </form>
    </Card>
  );
}
