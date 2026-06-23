import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth";
import {
  formatDate,
  formatPrice,
  grossFromNet,
  DELIVERY_SLOT_LABELS,
} from "@/lib/constants";
import { PrintButton } from "@/components/print-button";
import { Logo } from "@/components/logo";
import { btnSecondary } from "@/components/ui";

export default async function WzDocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { user, profile } = await getSessionProfile();
  if (!user) redirect("/login");

  const supabase = await createClient();

  // RLS: klient widzi tylko swoje zamówienia, admin wszystkie.
  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .single();
  if (!order || !order.wz_number) notFound();

  const [{ data: client }, { data: items }, { data: doc }] = await Promise.all([
    supabase
      .from("clients")
      .select("name, nip, address")
      .eq("id", order.client_id)
      .single(),
    supabase
      .from("order_items")
      .select("product_id, quantity, unit_price, vat_rate")
      .eq("order_id", id),
    supabase
      .from("documents")
      .select("number, created_at")
      .eq("order_id", id)
      .eq("type", "wz")
      .maybeSingle(),
  ]);

  const productIds = (items ?? []).map((i) => i.product_id);
  const prod = new Map<string, { name: string; unit: string }>();
  if (productIds.length) {
    const { data: products } = await supabase
      .from("products")
      .select("id, name, unit")
      .in("id", productIds);
    for (const p of products ?? [])
      prod.set(p.id, { name: p.name, unit: p.unit });
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
  const backHref = profile?.role === "admin" ? "/admin/dokumenty" : "/panel/dokumenty";

  return (
    <div className="min-h-screen bg-muted py-6 print:bg-white print:py-0">
      {/* @page A4 + ukrycie paska przy druku */}
      <style>{`@media print { @page { size: A4; margin: 14mm; } }`}</style>

      {/* Pasek narzędzi — niewidoczny przy druku */}
      <div className="mx-auto mb-4 flex max-w-[210mm] items-center justify-between px-4 print:hidden">
        <Link href={backHref} className={btnSecondary}>
          ← Wróć
        </Link>
        <PrintButton />
      </div>

      {/* Kartka A4 */}
      <div className="mx-auto max-w-[210mm] bg-white p-[16mm] text-[12px] text-black shadow-sm print:max-w-none print:p-0 print:shadow-none">
        {/* Nagłówek */}
        <div className="flex items-start justify-between border-b-2 border-black pb-4">
          <div>
            <Logo className="h-10 w-auto" />
            <div className="mt-2 text-[13px] font-semibold">ciao manufaktura</div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold">WYDANIE ZEWNĘTRZNE</div>
            <div className="text-base font-semibold">{order.wz_number}</div>
            <div className="mt-1 text-[11px] text-neutral-600">
              Data wystawienia: {formatDate(doc?.created_at ?? null)}
            </div>
          </div>
        </div>

        {/* Strony */}
        <div className="mt-5 grid grid-cols-2 gap-6">
          <div>
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
              Sprzedawca / Wydający
            </div>
            <div className="font-semibold">ciao manufaktura</div>
          </div>
          <div>
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
              Nabywca / Odbiorca
            </div>
            <div className="font-semibold">{client?.name}</div>
            {client?.nip && <div>NIP: {client.nip}</div>}
            {client?.address && <div>{client.address}</div>}
          </div>
        </div>

        {/* Dostawa */}
        <div className="mt-4 rounded border border-neutral-300 px-3 py-2 text-[11px]">
          <span className="text-neutral-500">Data dostawy: </span>
          <span className="font-medium">{formatDate(order.delivery_date)}</span>
          <span className="ml-4 text-neutral-500">Godzina: </span>
          <span className="font-medium">
            {DELIVERY_SLOT_LABELS[order.delivery_slot]}
          </span>
        </div>

        {/* Pozycje */}
        <table className="mt-5 w-full border-collapse text-[11px]">
          <thead>
            <tr className="border-y border-black text-left">
              <th className="w-6 py-1.5 pr-1">Lp.</th>
              <th className="py-1.5 pr-1">Nazwa towaru</th>
              <th className="w-12 py-1.5 pr-1 text-right">Ilość</th>
              <th className="w-10 py-1.5 pr-1">J.m.</th>
              <th className="w-20 py-1.5 pr-1 text-right">Cena netto</th>
              <th className="w-10 py-1.5 pr-1 text-right">VAT</th>
              <th className="w-20 py-1.5 pr-1 text-right">Wart. netto</th>
              <th className="w-20 py-1.5 text-right">Wart. brutto</th>
            </tr>
          </thead>
          <tbody>
            {(items ?? []).map((it, idx) => {
              const p = prod.get(it.product_id);
              const net = it.quantity * it.unit_price;
              return (
                <tr key={idx} className="border-b border-neutral-300">
                  <td className="py-1.5 pr-1">{idx + 1}</td>
                  <td className="py-1.5 pr-1">{p?.name ?? "—"}</td>
                  <td className="py-1.5 pr-1 text-right">{it.quantity}</td>
                  <td className="py-1.5 pr-1">{p?.unit}</td>
                  <td className="py-1.5 pr-1 text-right">
                    {formatPrice(it.unit_price)}
                  </td>
                  <td className="py-1.5 pr-1 text-right">{it.vat_rate}%</td>
                  <td className="py-1.5 pr-1 text-right">{formatPrice(net)}</td>
                  <td className="py-1.5 text-right">
                    {formatPrice(grossFromNet(net, it.vat_rate))}
                  </td>
                </tr>
              );
            })}
            {/* Puste wiersze na dopiski ręczne */}
            {Array.from({ length: 4 }).map((_, i) => (
              <tr key={`empty-${i}`} className="border-b border-neutral-300">
                <td className="py-2.5">&nbsp;</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-black font-semibold">
              <td className="py-2" colSpan={6}>
                Razem netto
              </td>
              <td className="py-2 text-right" colSpan={2}>
                {formatPrice(totalNet)}
              </td>
            </tr>
            <tr className="font-semibold">
              <td className="py-1" colSpan={6}>
                VAT
              </td>
              <td className="py-1 text-right" colSpan={2}>
                {formatPrice(totalVat)}
              </td>
            </tr>
            <tr className="border-t border-black text-[13px] font-bold">
              <td className="py-2" colSpan={6}>
                Razem brutto
              </td>
              <td className="py-2 text-right" colSpan={2}>
                {formatPrice(totalGross)}
              </td>
            </tr>
          </tfoot>
        </table>

        {order.notes && (
          <div className="mt-4 text-[11px]">
            <span className="text-neutral-500">Uwagi: </span>
            {order.notes}
          </div>
        )}

        {/* Podpisy */}
        <div className="mt-16 grid grid-cols-2 gap-12 text-center text-[11px] text-neutral-600">
          <div>
            <div className="border-t border-neutral-400 pt-1">
              Podpis osoby wydającej
            </div>
          </div>
          <div>
            <div className="border-t border-neutral-400 pt-1">
              Podpis osoby odbierającej
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
