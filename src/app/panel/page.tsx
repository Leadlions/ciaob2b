import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth";
import { getEffectiveClientId } from "@/lib/view-as";
import { formatDate, formatPrice } from "@/lib/constants";
import { LinkButton } from "@/components/ui";

export default async function PanelDashboard() {
  const { profile } = await getSessionProfile();
  const { clientId, isAdmin } = await getEffectiveClientId();

  if (!clientId) {
    return (
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-semibold">
          Witaj{profile?.full_name ? `, ${profile.full_name}` : ""}!
        </h1>
        <div className="mt-6 rounded-2xl border border-border bg-brand-50 p-6 text-sm text-brand-dark">
          {isAdmin ? (
            <p>
              Wybierz firmę w pasku podglądu powyżej, aby zobaczyć panel oczami
              klienta.
            </p>
          ) : (
            <>
              <p className="font-medium">Konto czeka na przypisanie do firmy</p>
              <p className="mt-1">
                Twoje konto jest aktywne, ale administrator nie przypisał Cię
                jeszcze do kartoteki firmy.
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  const supabase = await createClient();
  const monthPrefix = new Date().toISOString().slice(0, 7);
  const today = new Date().toISOString().slice(0, 10);

  const [{ data: orders }, { data: recurring }] = await Promise.all([
    supabase
      .from("orders")
      .select("id, created_at, delivery_date, status")
      .eq("client_id", clientId),
    supabase
      .from("recurring_orders")
      .select("id, is_active")
      .eq("client_id", clientId),
  ]);

  const ids = (orders ?? []).map((o) => o.id);
  let totalItems = 0;
  let monthValue = 0;
  const monthOrderIds = new Set(
    (orders ?? [])
      .filter((o) => (o.created_at ?? "").slice(0, 7) === monthPrefix)
      .map((o) => o.id),
  );
  if (ids.length) {
    const { data: items } = await supabase
      .from("order_items")
      .select("order_id, quantity, unit_price")
      .in("order_id", ids);
    for (const it of items ?? []) {
      totalItems += it.quantity;
      if (monthOrderIds.has(it.order_id))
        monthValue += it.quantity * it.unit_price;
    }
  }

  const ordersThisMonth = monthOrderIds.size;
  const activeRecurring = (recurring ?? []).filter((r) => r.is_active).length;
  const nextDelivery = (orders ?? [])
    .filter((o) => o.status !== "anulowane" && o.delivery_date >= today)
    .map((o) => o.delivery_date)
    .sort()[0];

  const stats = [
    { label: "Zamówień w tym miesiącu", value: String(ordersThisMonth) },
    { label: "Słodkości zamówionych łącznie", value: `${totalItems} szt.` },
    { label: "Wartość zamówień (mies.)", value: formatPrice(monthValue) },
    {
      label: "Najbliższa dostawa",
      value: nextDelivery ? formatDate(nextDelivery) : "—",
    },
  ];

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-semibold">
        Witaj{profile?.full_name && !isAdmin ? `, ${profile.full_name}` : ""}! 🧁
      </h1>
      <p className="mt-1 text-sm text-foreground/60">
        Miło Cię widzieć w panelu ciao.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-border bg-surface p-5"
          >
            <div className="text-2xl font-semibold text-brand-dark">
              {s.value}
            </div>
            <div className="mt-1 text-xs text-foreground/55">{s.label}</div>
          </div>
        ))}
      </div>

      {activeRecurring > 0 && (
        <div className="mt-4 rounded-2xl border border-border bg-surface p-4 text-sm text-foreground/70">
          {activeRecurring === 1
            ? "1 aktywny harmonogram cykliczny"
            : `${activeRecurring} aktywne harmonogramy cykliczne`}{" "}
          — zamówienia generują się automatycznie.
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <LinkButton href="/panel/nowe-zamowienie">+ Utwórz zamówienie</LinkButton>
        <Link
          href="/panel/katalog"
          className="inline-flex items-center rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground/80 transition hover:bg-muted"
        >
          Przeglądaj katalog
        </Link>
      </div>
    </div>
  );
}
