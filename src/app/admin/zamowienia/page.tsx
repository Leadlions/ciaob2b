import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_TONE,
  DELIVERY_SLOT_LABELS,
  formatDate,
  formatPrice,
  orderRef,
} from "@/lib/constants";
import { Badge, EmptyState, PageHeader } from "@/components/ui";
import { IconCart } from "@/components/icons";
import type { Enums } from "@/lib/database.types";

const STATUSES = Object.keys(ORDER_STATUS_LABELS) as Enums<"order_status">[];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; arch?: string }>;
}) {
  const { status, arch: archParam } = await searchParams;
  const arch = archParam === "1";
  const supabase = await createClient();

  let query = supabase
    .from("orders")
    .select("*")
    .order("delivery_date", { ascending: true })
    .order("created_at", { ascending: false });
  query = arch
    ? query.not("archived_at", "is", null)
    : query.is("archived_at", null);
  if (status && STATUSES.includes(status as Enums<"order_status">))
    query = query.eq("status", status as Enums<"order_status">);

  const { data: orders } = await query;

  const ids = (orders ?? []).map((o) => o.id);
  const clientIds = [...new Set((orders ?? []).map((o) => o.client_id))];

  const [{ data: items }, { data: clients }] = await Promise.all([
    ids.length
      ? supabase
          .from("order_items")
          .select("order_id, quantity, unit_price")
          .in("order_id", ids)
      : Promise.resolve({ data: [] as { order_id: string; quantity: number; unit_price: number }[] }),
    clientIds.length
      ? supabase.from("clients").select("id, name").in("id", clientIds)
      : Promise.resolve({ data: [] as { id: string; name: string }[] }),
  ]);

  const totals = new Map<string, number>();
  for (const it of items ?? [])
    totals.set(
      it.order_id,
      (totals.get(it.order_id) ?? 0) + it.quantity * it.unit_price,
    );
  const clientName = new Map((clients ?? []).map((c) => [c.id, c.name]));

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        icon={<IconCart />}
        title="Zamówienia"
        description="Wszystkie zamówienia klientów. Sortowane wg daty dostawy."
      />

      <div className="mb-5 flex flex-wrap items-center gap-2 text-sm">
        <Link
          href="/admin/zamowienia"
          className={`rounded-full px-3 py-1 ${!status && !arch ? "bg-brand text-white" : "bg-muted text-foreground/70"}`}
        >
          Wszystkie
        </Link>
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/zamowienia?status=${s}`}
            className={`rounded-full px-3 py-1 ${status === s && !arch ? "bg-brand text-white" : "bg-muted text-foreground/70"}`}
          >
            {ORDER_STATUS_LABELS[s]}
          </Link>
        ))}
        <Link
          href="/admin/zamowienia?arch=1"
          className={`ml-auto rounded-full px-3 py-1 ${arch ? "bg-brand text-white" : "bg-muted text-foreground/70"}`}
        >
          Archiwum
        </Link>
      </div>

      {arch && (
        <p className="mb-3 text-sm text-foreground/60">
          Pokazujesz zarchiwizowane zamówienia.{" "}
          <Link href="/admin/zamowienia" className="text-brand hover:underline">
            ← wróć do aktywnych
          </Link>
        </p>
      )}

      {!orders || orders.length === 0 ? (
        <EmptyState title="Brak zamówień" />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-foreground/50">
              <tr>
                <th className="px-4 py-3 font-medium">Nr</th>
                <th className="px-4 py-3 font-medium">Klient</th>
                <th className="px-4 py-3 font-medium">Dostawa</th>
                <th className="px-4 py-3 font-medium">Wartość</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium">
                    #{orderRef(o.id)}
                    {o.wz_number && (
                      <span className="mt-0.5 block text-xs font-normal text-brand">
                        WZ {o.wz_number}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {clientName.get(o.client_id) ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-foreground/70">
                    {formatDate(o.delivery_date)}
                    <span className="block text-xs text-foreground/45">
                      {DELIVERY_SLOT_LABELS[o.delivery_slot]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {formatPrice(totals.get(o.id) ?? 0)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={ORDER_STATUS_TONE[o.status]}>
                      {ORDER_STATUS_LABELS[o.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/zamowienia/${o.id}`}
                      className="rounded-lg px-2 py-1 text-brand hover:bg-brand-50"
                    >
                      Otwórz
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
