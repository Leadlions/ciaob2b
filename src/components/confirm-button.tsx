"use client";

import { useFormStatus } from "react-dom";

// Przycisk submit z potwierdzeniem (window.confirm) i stanem oczekiwania.
export function ConfirmButton({
  children,
  confirm,
  className = "",
  pendingText = "…",
}: {
  children: React.ReactNode;
  confirm: string;
  className?: string;
  pendingText?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(e) => {
        if (!window.confirm(confirm)) e.preventDefault();
      }}
      className={className}
    >
      {pending ? pendingText : children}
    </button>
  );
}
