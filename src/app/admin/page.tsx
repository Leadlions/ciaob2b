import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/constants";

export default async function AdminDashboard() {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);
  const monthPrefix = new Date().toISOString().slice(0, 7);

  const [{ data: orders }, { data: clients }] = await Promise.all([
    supabase.from("orders").select("id, created_at, status"),
    supabase.from("clients").select("id, is_active"),
  ]);

  const ids = (orders ?? []).map((o) => o.id);
  const monthOrderIds = new Set(
    (orders ?? [])
      .filter((o) => (o.created_at ?? "").slice(0, 7) === monthPrefix)
      .map((o) => o.id),
  );
  let monthValue = 0;
  if (ids.length) {
    const { data: items } = await supabase
      .from("order_items")
      .select("order_id, quantity, unit_price")
      .in("order_id", ids);
    for (const it of items ?? [])
      if (monthOrderIds.has(it.order_id))
        monthValue += it.quantity * it.unit_price;
  }

  const ordersToday = (orders ?? []).filter(
    (o) => (o.created_at ?? "").slice(0, 10) === today,
  ).length;
  const pending = (orders ?? []).filter(
    (o) => o.status === "nowe" || o.status === "potwierdzone",
  ).length;
  const activeClients = (clients ?? []).filter((c) => c.is_active).length;

  const KPI = [
    { label: "Nowe zamówienia (dziś)", value: String(ordersToday) },
    { label: "Do realizacji", value: String(pending) },
    { label: "Sprzedaż (mies.)", value: formatPrice(monthValue) },
    { label: "Aktywni klienci", value: String(activeClients) },
  ];

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-semibold">Pulpit administratora</h1>
      <p className="mt-1 text-sm text-foreground/60">
        Przegląd najważniejszych liczb ciao manufaktury.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {KPI.map((k) => (
          <div
            key={k.label}
            className="rounded-2xl border border-border bg-surface p-5"
          >
            <div className="text-2xl font-semibold text-brand-dark">
              {k.value}
            </div>
            <div className="mt-1 text-xs text-foreground/55">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/admin/zamowienia"
          className="inline-flex items-center rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark"
        >
          Zobacz zamówienia
        </Link>
        <Link
          href="/admin/produkty"
          className="inline-flex items-center rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground/80 transition hover:bg-muted"
        >
          Produkty
        </Link>
      </div>
    </div>
  );
}
