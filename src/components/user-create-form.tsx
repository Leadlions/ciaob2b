"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  createUser,
  type CreateUserState,
} from "@/app/admin/uzytkownicy/actions";
import { Card, Field, Input, Select, btnSecondary } from "./ui";
import { SubmitButton } from "./submit-button";

const initial: CreateUserState = { error: null };

type ClientOption = { id: string; name: string };

export function UserCreateForm({ clients }: { clients: ClientOption[] }) {
  const [state, action] = useActionState(createUser, initial);

  // Po sukcesie pokazujemy dane logowania do przekazania użytkownikowi.
  if (state.createdEmail && state.tempPassword) {
    return (
      <Card className="max-w-2xl space-y-3 border-green-200 bg-green-50">
        <p className="font-semibold text-green-800">
          Konto utworzone ✅
        </p>
        <p className="text-sm text-green-900">
          Przekaż użytkownikowi poniższe dane. Hasło jest tymczasowe — zaleci mu
          się jego zmianę po pierwszym logowaniu.
        </p>
        <div className="rounded-lg border border-green-200 bg-white p-3 text-sm">
          <div>
            <span className="text-foreground/50">E-mail: </span>
            <span className="font-medium">{state.createdEmail}</span>
          </div>
          <div>
            <span className="text-foreground/50">Hasło tymczasowe: </span>
            <span className="font-mono font-medium">{state.tempPassword}</span>
          </div>
        </div>
        <div className="flex gap-3 pt-1">
          <Link href="/admin/uzytkownicy/nowy" className={btnSecondary}>
            Dodaj kolejnego
          </Link>
          <Link href="/admin/uzytkownicy" className={btnSecondary}>
            Wróć do listy
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <form action={action} className="max-w-2xl space-y-5">
      <Card className="space-y-4">
        <Field label="Imię i nazwisko" htmlFor="full_name">
          <Input id="full_name" name="full_name" placeholder="np. Anna Kowalska" />
        </Field>

        <Field label="Adres e-mail (login)" htmlFor="email">
          <Input id="email" name="email" type="email" required />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Rola" htmlFor="role">
            <Select id="role" name="role" defaultValue="client">
              <option value="client">Klient</option>
              <option value="admin">Administrator</option>
            </Select>
          </Field>

          <Field
            label="Przypisana firma"
            htmlFor="client_id"
            hint="Wymagane dla roli Klient"
          >
            <Select id="client_id" name="client_id" defaultValue="">
              <option value="">— brak —</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </Card>

      {state.error && (
        <p className="rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-dark">
          {state.error}
        </p>
      )}

      <div className="flex gap-3">
        <SubmitButton pendingText="Tworzenie…">Utwórz konto</SubmitButton>
        <Link href="/admin/uzytkownicy" className={btnSecondary}>
          Anuluj
        </Link>
      </div>
    </form>
  );
}
