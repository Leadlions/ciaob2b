"use client";

import { useActionState } from "react";
import { saveSettings, type SettingsState } from "@/app/admin/ustawienia/actions";
import { Field, Select, Input } from "./ui";
import { SubmitButton } from "./submit-button";

const initial: SettingsState = { error: null };

export function SettingsForm({
  cutoff,
  emailWz,
  emailProd,
}: {
  cutoff: number;
  emailWz: string;
  emailProd: string;
}) {
  const [state, action] = useActionState(saveSettings, initial);

  return (
    <form action={action} className="max-w-md space-y-4">
      <Field
        label="Godzina graniczna zamówień na kolejny dzień"
        htmlFor="order_cutoff_hour"
        hint="Po tej godzinie klient może zamówić najwcześniej na pojutrze. Raport dzienny wychodzi krótko po tej godzinie."
      >
        <Select
          id="order_cutoff_hour"
          name="order_cutoff_hour"
          defaultValue={String(cutoff)}
        >
          {Array.from({ length: 24 }).map((_, h) => (
            <option key={h} value={h}>
              {String(h).padStart(2, "0")}:00
            </option>
          ))}
        </Select>
      </Field>

      <div className="border-t border-border pt-4">
        <p className="mb-3 text-sm font-medium">Adresy e-mail raportów dziennych</p>

        <Field
          label="Raport WZ — adres e-mail"
          htmlFor="report_email_wz"
          hint="Tu trafia codzienny mail z raportem WZ. Można podać kilka adresów po przecinku."
        >
          <Input
            id="report_email_wz"
            name="report_email_wz"
            type="text"
            inputMode="email"
            placeholder="np. wz@ciaomanufaktura.pl"
            defaultValue={emailWz}
          />
        </Field>

        <Field
          label="Raport produkcji — adres e-mail"
          htmlFor="report_email_prod"
          hint="Tu trafia codzienny mail z raportem produkcji. Można podać kilka adresów po przecinku."
        >
          <Input
            id="report_email_prod"
            name="report_email_prod"
            type="text"
            inputMode="email"
            placeholder="np. produkcja@ciaomanufaktura.pl"
            defaultValue={emailProd}
          />
        </Field>
      </div>

      {state.ok && (
        <p className="rounded-lg bg-green-100 px-3 py-2 text-sm text-green-700">
          Zapisano ✓
        </p>
      )}
      {state.error && (
        <p className="rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-dark">
          {state.error}
        </p>
      )}

      <SubmitButton>Zapisz ustawienia</SubmitButton>
    </form>
  );
}
