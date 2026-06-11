"use client";

import { useFormStatus } from "react-dom";
import { btnPrimary } from "./ui";

export function SubmitButton({
  children,
  pendingText,
  disabled,
}: {
  children: React.ReactNode;
  pendingText?: string;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className={`${btnPrimary} disabled:cursor-not-allowed disabled:opacity-50`}
    >
      {pending ? (pendingText ?? "Zapisywanie…") : children}
    </button>
  );
}
