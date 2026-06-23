import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_TONE,
  CLIENT_EDITABLE_STATUSES,
  DELIVERY_SLOT_LABELS,
  formatDate,
  formatPrice,
  grossFromNet,
  orderRef,
} from "@/lib/constants";
import { Badge, Card, PageHeader, btnDanger, btnSecondary } from "@/components/ui";
import { PendingButton } from "@/components/pending-button";
import { cancelOrder } from "../actions";

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ utworzono?: string }>;
}) {
  const { id } = await params;
  const { utworzono } = await searchParams;
  const supabase = await createClient();

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .single();
  if (!order) notFound();

  const { data: items } = await supabase
    .from("order_items")
    .select("product_id, quantity, unit_price, vat_rate")
    .eq("order_id", id);

  const productIds = (items ?? []).map((i) => i.product_id);
  const nameMap = new Map<string, { name: string; unit: string }>();
  if (productIds.length) {
    const { data: products } = await supabase
      .from("products")
      .select("id, name, unit")
      .in("id", productIds);
    for (const p of products ?? [])
      nameMap.set(p.id, { name: p.name, unit: p.unit });
  }

  const totalNet = (items ?? []).reduce(
    (s, i) => s + i.quantity * i.unit_price,
    0,
  );
  const totalGross = (items ?? []).reduce(
    (s, i) => s + grossFromNet(i.quantity * i.unit_price, i.vat_rate),
    0,
  );
  const totalVat = Math.round((totalGross - totalNet) * 100) / 100;
  const canCancel = CLIENT_EDITABLE_STATUSES.includes(order.status);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title={`Zamówienie #${orderRef(order.id)}`}
        description={`Złożone ${formatDate(order.created_at)}`}
        action={
          <Link href="/panel/zamowienia" className={btnSecondary}>
            ← Wróć
          </Link>
        }
      />

      {utworzono && (
        <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          Zamówienie zostało złożone. Status: <strong>Nowe</strong>. Damy znać,
          gdy je potwierdzimy.
        </div>
      )}

      <Card className="mb-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1 text-sm">
            <div>
              <span className="text-foreground/50">Status: </span>
              <Badge tone={ORDER_STATUS_TONE[order.status]}>
                {ORDER_STATUS_LABELS[order.status]}
              </Badge>
            </div>
            <div>
              <span className="text-foreground/50">Dostawa: </span>
              {formatDate(order.delivery_date)},{" "}
              {DELIVERY_SLOT_LABELS[order.delivery_slot]}
            </div>
            {order.wz_number && (
              <div>
                <span className="text-foreground/50">Nr WZ: </span>
                <Link
                  href={`/wz/${order.id}`}
                  className="font-medium text-brand hover:underline"
                >
                  {order.wz_number} — Podgląd / PDF ↗
                </Link>
              </div>
            )}
          </div>
        </div>
        {order.notes && (
          <p className="mt-3 border-t border-border pt-3 text-sm">
            <span className="text-foreground/50">Uwagi: </span>
            {order.notes}
          </p>
        )}
      </Card>

      <Card className="mb-5 p-0">
        <table className="w-full text-sm">
          <thead className="border-b border-border text-left text-xs uppercase tracking-wide text-foreground/50">
            <tr>
              <th className="px-4 py-3 font-medium">Produkt</th>
              <th className="px-4 py-3 font-medium">Ilość</th>
              <th className="px-4 py-3 font-medium">Cena netto</th>
              <th className="px-4 py-3 font-medium">VAT</th>
              <th className="px-4 py-3 text-right font-medium">Netto</th>
              <th className="px-4 py-3 text-right font-medium">Brutto</th>
            </tr>
          </thead>
          <tbody>
            {(items ?? []).map((it, idx) => {
              const p = nameMap.get(it.product_id);
              const net = it.quantity * it.unit_price;
              return (
                <tr key={idx} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">{p?.name ?? "—"}</td>
                  <td className="px-4 py-3">
                    {it.quantity} {p?.unit}
                  </td>
                  <td className="px-4 py-3">{formatPrice(it.unit_price)}</td>
                  <td className="px-4 py-3 text-foreground/60">{it.vat_rate}%</td>
                  <td className="px-4 py-3 text-right">{formatPrice(net)}</td>
                  <td className="px-4 py-3 text-right">
                    {formatPrice(grossFromNet(net, it.vat_rate))}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="border-t border-border">
            <tr>
              <td className="px-4 py-2 text-foreground/60" colSpan={4}>
                Razem netto
              </td>
              <td className="px-4 py-2 text-right" colSpan={2}>
                {formatPrice(totalNet)}
              </td>
            </tr>
            <tr>
              <td className="px-4 py-2 text-foreground/60" colSpan={4}>
                VAT
              </td>
              <td className="px-4 py-2 text-right" colSpan={2}>
                {formatPrice(totalVat)}
              </td>
            </tr>
            <tr className="font-semibold">
              <td className="px-4 py-2" colSpan={4}>
                Razem brutto
              </td>
              <td className="px-4 py-2 text-right" colSpan={2}>
                {formatPrice(totalGross)}
              </td>
            </tr>
          </tfoot>
        </table>
      </Card>

      {canCancel && (
        <form action={cancelOrder}>
          <input type="hidden" name="id" value={order.id} />
          <PendingButton className={btnDanger} pendingText="Anulowanie…">
            Anuluj zamówienie
          </PendingButton>
        </form>
      )}
    </div>
  );
}
