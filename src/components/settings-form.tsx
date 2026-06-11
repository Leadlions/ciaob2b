"use client";

import { useActionState } from "react";
import { saveSettings, type SettingsState } from "@/app/admin/ustawienia/actions";
import { Field, Select } from "./ui";
import { SubmitButton } from "./submit-button";

const initial: SettingsState = { error: null };

export function SettingsForm({ cutoff }: { cutoff: number }) {
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
