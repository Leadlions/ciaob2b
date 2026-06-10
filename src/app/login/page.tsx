"use client";

import { useActionState } from "react";
import Image from "next/image";
import { signIn, type LoginState } from "./actions";

const initialState: LoginState = { error: null };

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(signIn, initialState);

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <Image
            src="/ciao-logo.png"
            alt="ciao!"
            width={1920}
            height={1080}
            priority
            className="h-20 w-auto"
          />
          <p className="mt-2 text-sm text-foreground/60">Panel zamówień B2B</p>
        </div>

        <form
          action={formAction}
          className="rounded-2xl border border-border bg-surface p-6 shadow-sm"
        >
          <h1 className="mb-5 text-lg font-semibold">Zaloguj się</h1>

          <label className="mb-1 block text-sm font-medium" htmlFor="email">
            E-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="mb-4 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          />

          <label className="mb-1 block text-sm font-medium" htmlFor="password">
            Hasło
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="mb-4 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          />

          {state.error && (
            <p className="mb-4 rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-dark">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
          >
            {pending ? "Logowanie…" : "Zaloguj się"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-foreground/50">
          Dostęp tylko na zaproszenie. Problem z logowaniem? Skontaktuj się z
          administratorem.
        </p>
      </div>
    </main>
  );
}
