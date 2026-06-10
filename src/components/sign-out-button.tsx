"use client";

import { signOut } from "@/app/login/actions";

export function SignOutButton() {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground/70 transition hover:bg-muted"
      >
        Wyloguj
      </button>
    </form>
  );
}
