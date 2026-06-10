"use client";

import { useFormStatus } from "react-dom";
import type { ReactNode } from "react";

// Przycisk submit z natychmiastowym spinnerem (feedback zanim serwer odpowie).
export function PendingButton({
  children,
  className,
  pendingText,
}: {
  children: ReactNode;
  className?: string;
  pendingText?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={className}
    >
      <span className="inline-flex items-center gap-1.5">
        {pending && (
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-r-transparent opacity-70" />
        )}
        {pending && pendingText ? pendingText : children}
      </span>
    </button>
  );
}
