import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_TONE,
  DELIVERY_SLOT_LABELS,
  formatDate,
  formatPrice,
  orderRef,
  weekdaysLabel,
} from "@/lib/constants";
import { Badge, EmptyState, LinkButton, PageHeader } from "@/components/ui";
import { IconCart } from "@/components/icons";
import { getEffectiveClientId } from "@/lib/view-as";
import {
  toggleRecurringActive,
  deleteRecurring,
} from "../zamowienia-cykliczne/actions";
import type { Enums } from "@/lib/database.types";

const STATUSES = Object.keys(ORDER_STATUS_LABELS) as Enums<"order_status">[];

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; utworzono?: string }>;
}) {
  const { status, utworzono } = await searchParams;
  const supabase = await createClient();
  const { clientId } = await getEffectiveClientId();
  const cid = clientId ?? "00000000-0000-0000-0000-000000000000";

  // Zamówienia cykliczne (szablony) + ich pozycje.
  const { data: recurring } = await supabase
    .from("recurring_orders")
    .select("*")
    .eq("client_id", cid)
    .order("created_at", { ascending: false });

  const roIds = (recurring ?? []).map((r) => r.id);
  const itemsByRo = new Map<string, { name: string; quantity: number }[]>();
  if (roIds.length) {
    const { data: ritems } = await supabase
      .from("recurring_order_items")
      .select("recurring_order_id, product_id, quantity")
      .in("recurring_order_id", roIds);
    const pIds = [...new Set((ritems ?? []).map((i) => i.product_id))];
    const nameMap = new Map<string, string>();
    if (pIds.length) {
      const { data: prods } = await supabase
        .from("products")
        .select("id, name")
        .in("id", pIds);
      for (const p of prods ?? []) nameMap.set(p.id, p.name);
    }
    for (const it of ritems ?? []) {
      const arr = itemsByRo.get(it.recurring_order_id) ?? [];
      arr.push({ name: nameMap.get(it.product_id) ?? "—", quantity: it.quantity });
      itemsByRo.set(it.recurring_order_id, arr);
    }
  }

  // Lista zamówień (z filtrem statusu).
  let q = supabase
    .from("orders")
    .select("*")
    .eq("client_id", cid)
    .order("created_at", { ascending: false });
  if (status && STATUSES.includes(status as Enums<"order_status">))
    q = q.eq("status", status as Enums<"order_status">);
  const { data: orders } = await q;

  const ids = (orders ?? []).map((o) => o.id);
  const totals = new Map<string, number>();
  if (ids.length) {
    const { data: oi } = await supabase
      .from("order_items")
      .select("order_id, quantity, unit_price")
      .in("order_id", ids);
    for (const it of oi ?? [])
      totals.set(
        it.order_id,
        (totals.get(it.order_id) ?? 0) + it.quantity * it.unit_price,
      );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        icon={<IconCart />}
        title="Zamówienia"
        description="Twoje zamówienia jednorazowe i cykliczne w jednym miejscu."
        action={
          <LinkButton href="/panel/nowe-zamowienie">+ Utwórz zamówienie</LinkButton>
        }
      />

      {utworzono === "cykl" && (
        <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          Harmonogram utworzony. Zamówienia na najbliższe dni zostały już
          wygenerowane — znajdziesz je na liście poniżej.
        </div>
      )}

      {/* SEKCJA: cykliczne */}
      {recurring && recurring.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-foreground/50">
            Harmonogramy cykliczne
          </h2>
          <div className="space-y-3">
            {recurring.map((r) => (
              <div
                key={r.id}
                className="rounded-2xl border border-border bg-surface p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {weekdaysLabel(r.weekdays)}
                      </span>
                      {r.is_active ? (
                        <Badge tone="green">Aktywny</Badge>
                      ) : (
                        <Badge>Wstrzymany</Badge>
                      )}
                    </div>
                    <div className="mt-1 text-sm text-foreground/60">
                      {DELIVERY_SLOT_LABELS[r.delivery_slot]} · od{" "}
                      {formatDate(r.start_date)}
                      {r.end_date
                        ? ` do ${formatDate(r.end_date)}`
                        : " (bezterminowo)"}
                    </div>
                    {r.excluded_dates && r.excluded_dates.length > 0 && (
                      <div className="mt-1 text-xs text-foreground/45">
                        Wykluczone: {r.excluded_dates.map((d) => formatDate(d)).join(", ")}
                      </div>
                    )}
                    <div className="mt-2 text-sm text-foreground/70">
                      {(itemsByRo.get(r.id) ?? [])
                        .map((it) => `${it.quantity}× ${it.name}`)
                        .join(", ")}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <form action={toggleRecurringActive}>
                      <input type="hidden" name="id" value={r.id} />
                      <input
                        type="hidden"
                        name="next"
                        value={(!r.is_active).toString()}
                      />
                      <button
                        type="submit"
                        className="rounded-lg px-2 py-1 text-sm text-foreground/60 hover:bg-muted"
                      >
                        {r.is_active ? "Wstrzymaj" : "Wznów"}
                      </button>
                    </form>
                    <form action={deleteRecurring}>
                      <input type="hidden" name="id" value={r.id} />
                      <button
                        type="submit"
                        className="rounded-lg px-2 py-1 text-sm text-foreground/40 hover:bg-brand-50 hover:text-brand"
                      >
                        Usuń
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SEKCJA: zamówienia */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-foreground/50">
          Zamówienia
        </h2>

        <div className="mb-4 flex flex-wrap gap-2 text-sm">
          <Link
            href="/panel/zamowienia"
            className={`rounded-full px-3 py-1 ${!status ? "bg-brand text-white" : "bg-muted text-foreground/70"}`}
          >
            Wszystkie
          </Link>
          {STATUSES.map((s) => (
            <Link
              key={s}
              href={`/panel/zamowienia?status=${s}`}
              className={`rounded-full px-3 py-1 ${status === s ? "bg-brand text-white" : "bg-muted text-foreground/70"}`}
            >
              {ORDER_STATUS_LABELS[s]}
            </Link>
          ))}
        </div>

        {!orders || orders.length === 0 ? (
          <EmptyState
            title="Brak zamówień"
            description="Nie masz jeszcze zamówień w tej kategorii."
            action={
              <LinkButton href="/panel/nowe-zamowienie">
                Utwórz pierwsze zamówienie
              </LinkButton>
            }
          />
        ) : (
          <div className="space-y-3">
            {orders.map((o) => (
              <Link
                key={o.id}
                href={`/panel/zamowienia/${o.id}`}
                className="block rounded-2xl border border-border bg-surface p-4 transition hover:border-brand/40"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 font-medium">
                      Zamówienie #{orderRef(o.id)}
                      {o.recurring_id && (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-foreground/50">
                          cykliczne
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-foreground/60">
                      Dostawa: {formatDate(o.delivery_date)},{" "}
                      {DELIVERY_SLOT_LABELS[o.delivery_slot]}
                    </div>
                    {o.wz_number && (
                      <div className="mt-0.5 text-xs font-medium text-brand">
                        WZ {o.wz_number}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">
                      {formatPrice(totals.get(o.id) ?? 0)}
                    </span>
                    <Badge tone={ORDER_STATUS_TONE[o.status]}>
                      {ORDER_STATUS_LABELS[o.status]}
                    </Badge>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
