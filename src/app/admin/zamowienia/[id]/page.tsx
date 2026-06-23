import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_TONE,
  DELIVERY_SLOT_LABELS,
  formatDate,
  formatPrice,
  grossFromNet,
  orderRef,
} from "@/lib/constants";
import {
  Badge,
  Card,
  PageHeader,
  Select,
  btnPrimary,
  btnSecondary,
} from "@/components/ui";
import { PendingButton } from "@/components/pending-button";
import { ConfirmButton } from "@/components/confirm-button";
import {
  updateOrderStatus,
  generateWz,
  deleteWz,
  archiveOrder,
  deleteOrder,
} from "../actions";
import type { Enums } from "@/lib/database.types";

const STATUSES = Object.keys(ORDER_STATUS_LABELS) as Enums<"order_status">[];

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .single();
  if (!order) notFound();

  const [{ data: client }, { data: items }] = await Promise.all([
    supabase
      .from("clients")
      .select("name, nip, contact_phone, contact_email, address")
      .eq("id", order.client_id)
      .single(),
    supabase
      .from("order_items")
      .select("product_id, quantity, unit_price, vat_rate")
      .eq("order_id", id),
  ]);

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

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title={`Zamówienie #${orderRef(order.id)}`}
        description={`Złożone ${formatDate(order.created_at)}`}
        action={
          <Link href="/admin/zamowienia" className={btnSecondary}>
            ← Wróć
          </Link>
        }
      />

      <div className="mb-5 grid gap-4 sm:grid-cols-2">
        <Card>
          <div className="text-sm font-medium">Klient</div>
          <div className="mt-1 text-sm text-foreground/70">
            <div className="font-medium text-foreground">{client?.name}</div>
            {client?.nip && <div>NIP: {client.nip}</div>}
            {client?.address && <div>{client.address}</div>}
            {client?.contact_phone && <div>tel. {client.contact_phone}</div>}
            {client?.contact_email && <div>{client.contact_email}</div>}
          </div>
        </Card>
        <Card>
          <div className="text-sm font-medium">Dostawa</div>
          <div className="mt-1 text-sm text-foreground/70">
            <div>{formatDate(order.delivery_date)}</div>
            <div>{DELIVERY_SLOT_LABELS[order.delivery_slot]}</div>
            <div className="mt-2">
              <Badge tone={ORDER_STATUS_TONE[order.status]}>
                {ORDER_STATUS_LABELS[order.status]}
              </Badge>
            </div>
          </div>
        </Card>
      </div>

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

      {order.notes && (
        <Card className="mb-5">
          <span className="text-sm text-foreground/50">Uwagi klienta: </span>
          <span className="text-sm">{order.notes}</span>
        </Card>
      )}

      <Card>
        <form action={updateOrderStatus} className="flex flex-wrap items-end gap-3">
          <input type="hidden" name="id" value={order.id} />
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="status">
              Zmień status
            </label>
            <Select
              key={order.status}
              id="status"
              name="status"
              defaultValue={order.status}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {ORDER_STATUS_LABELS[s]}
                </option>
              ))}
            </Select>
          </div>
          <PendingButton className={btnPrimary} pendingText="Zapisywanie…">
            Zapisz status
          </PendingButton>
        </form>
      </Card>

      <Card className="mt-4">
        <div className="text-sm font-medium">Dokument WZ</div>
        {order.wz_number ? (
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <Badge tone="green">{order.wz_number}</Badge>
            <Link
              href={`/wz/${order.id}`}
              className="text-sm font-medium text-brand hover:underline"
            >
              Podgląd / PDF ↗
            </Link>
            <span className="text-sm text-foreground/60">
              widoczny dla klienta
            </span>
            <form action={deleteWz} className="ml-auto">
              <input type="hidden" name="id" value={order.id} />
              <PendingButton
                className="rounded-lg px-2 py-1 text-sm text-foreground/40 hover:bg-brand-50 hover:text-brand"
                pendingText="Usuwanie…"
              >
                Usuń WZ
              </PendingButton>
            </form>
          </div>
        ) : (
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <form action={generateWz}>
              <input type="hidden" name="id" value={order.id} />
              <PendingButton className={btnPrimary} pendingText="Generowanie…">
                Generuj WZ
              </PendingButton>
            </form>
            <span className="text-xs text-foreground/50">
              Numer zostanie nadany automatycznie. WZ tworzy się też samo przy
              statusie „Wysłane". Pozycje WZ = pozycje zamówienia.
            </span>
          </div>
        )}
      </Card>

      <Card className="mt-4">
        <div className="text-sm font-medium">Archiwizacja / usuwanie</div>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <form action={archiveOrder}>
            <input type="hidden" name="id" value={order.id} />
            <input
              type="hidden"
              name="next"
              value={(!order.archived_at).toString()}
            />
            <PendingButton className={btnSecondary} pendingText="…">
              {order.archived_at ? "Przywróć z archiwum" : "Archiwizuj"}
            </PendingButton>
          </form>
          <form action={deleteOrder} className="ml-auto">
            <input type="hidden" name="id" value={order.id} />
            <ConfirmButton
              confirm="Trwale usunąć to zamówienie wraz z pozycjami i dokumentem WZ? Tej operacji nie można cofnąć."
              className="rounded-lg px-3 py-2 text-sm font-medium text-brand-dark hover:bg-brand-50"
              pendingText="Usuwanie…"
            >
              Usuń trwale
            </ConfirmButton>
          </form>
        </div>
        <p className="mt-2 text-xs text-foreground/50">
          Archiwizacja chowa zamówienie z list (można przywrócić). Usunięcie jest
          nieodwracalne.
        </p>
      </Card>
    </div>
  );
}
