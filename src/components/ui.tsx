import { ReactNode, SelectHTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import Link from "next/link";

/* ---------- Przyciski (klasy współdzielone) ---------- */
export const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60";
export const btnSecondary =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground/80 transition hover:bg-muted";
export const btnDanger =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-brand/30 bg-surface px-4 py-2 text-sm font-medium text-brand transition hover:bg-brand-50";

export function LinkButton({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
}) {
  return (
    <Link href={href} className={variant === "primary" ? btnPrimary : btnSecondary}>
      {children}
    </Link>
  );
}

/* ---------- Nagłówek strony ---------- */
export function PageHeader({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="flex items-center gap-2.5 text-2xl font-semibold">
          {icon && <span className="text-brand [&>svg]:h-6 [&>svg]:w-6">{icon}</span>}
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-foreground/60">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

/* ---------- Karta ---------- */
export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-border bg-surface p-5 ${className}`}
    >
      {children}
    </div>
  );
}

/* ---------- Pole formularza (label + zawartość) ---------- */
export function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-foreground/50">{hint}</p>}
    </div>
  );
}

const fieldBase =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${fieldBase} ${props.className ?? ""}`} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea {...props} className={`${fieldBase} ${props.className ?? ""}`} />
  );
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={`${fieldBase} ${props.className ?? ""}`} />
  );
}

/* ---------- Odznaka statusu ---------- */
export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "green" | "red" | "amber";
}) {
  const tones: Record<string, string> = {
    neutral: "bg-muted text-foreground/60",
    green: "bg-green-100 text-green-700",
    red: "bg-brand-50 text-brand-dark",
    amber: "bg-amber-100 text-amber-700",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

/* ---------- Pusty stan ---------- */
export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-surface/60 p-10 text-center">
      <p className="font-medium text-foreground/80">{title}</p>
      {description && (
        <p className="mx-auto mt-1 max-w-md text-sm text-foreground/55">
          {description}
        </p>
      )}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}
