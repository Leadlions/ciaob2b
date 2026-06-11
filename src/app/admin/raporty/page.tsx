import Link from "next/link";
import { warsawDate } from "@/lib/delivery";
import { formatDate } from "@/lib/constants";
import { PageHeader, Card, btnPrimary, btnSecondary } from "@/components/ui";
import { IconReports } from "@/components/icons";

const REPORTS = [
  {
    type: "wz",
    label: "Raport WZ",
    desc: "Wszystkie zamówienia/WZ na wybrany dzień — firma, godzina, pozycje.",
  },
  {
    type: "prod",
    label: "Raport produkcji",
    desc: "Suma ilości każdego produktu do wyprodukowania.",
  },
  {
    type: "sales",
    label: "Raport sprzedaży",
    desc: "Wartość zamówień per klient + suma.",
  },
];

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;
  const tomorrow = warsawDate(1);
  const today = warsawDate(0);
  const selected = /^\d{4}-\d{2}-\d{2}$/.test(date ?? "")
    ? (date as string)
    : tomorrow;

  const pill = (active: boolean) =>
    `rounded-full px-3 py-1.5 text-sm ${active ? "bg-brand text-white" : "bg-muted text-foreground/70"}`;

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        icon={<IconReports />}
        title="Raporty"
        description="Pobierz raporty na wybrany dzień w formacie PDF."
      />

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <Link href={`/admin/raporty?date=${tomorrow}`} className={pill(selected === tomorrow)}>
          Jutro
        </Link>
        <Link href={`/admin/raporty?date=${today}`} className={pill(selected === today)}>
          Dziś
        </Link>
        <form method="get" className="flex items-center gap-2">
          <input
            type="date"
            name="date"
            defaultValue={selected}
            className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm outline-none focus:border-brand"
          />
          <button type="submit" className={btnSecondary}>
            Pokaż
          </button>
        </form>
      </div>

      <p className="mb-3 text-sm text-foreground/60">
        Raporty na dzień: <strong>{formatDate(selected)}</strong>
      </p>

      <div className="grid gap-3 sm:grid-cols-3">
        {REPORTS.map((r) => (
          <Card key={r.type} className="flex flex-col">
            <div className="font-medium">{r.label}</div>
            <p className="mt-1 flex-1 text-xs text-foreground/55">{r.desc}</p>
            <a
              href={`/api/reports?type=${r.type}&date=${selected}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`${btnPrimary} mt-3`}
            >
              Pobierz PDF ↗
            </a>
          </Card>
        ))}
      </div>
    </div>
  );
}
