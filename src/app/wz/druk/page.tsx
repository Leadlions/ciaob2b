import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth";
import { formatDate } from "@/lib/constants";
import { warsawDate } from "@/lib/delivery";
import { PrintButton } from "@/components/print-button";
import { WzSheet, type WzSheetData } from "@/components/wz-sheet";
import { btnSecondary } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function WzRangePrintPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const { user, profile } = await getSessionProfile();
  if (!user) redirect("/login");
  if (profile?.role !== "admin") redirect("/panel");

  const sp = await searchParams;
  const re = /^\d{4}-\d{2}-\d{2}$/;
  const today = warsawDate(0);
  const from = re.test(sp.from ?? "") ? (sp.from as string) : today;
  const to = re.test(sp.to ?? "") ? (sp.to as string) : from;

  const supabase = await createClient();

  const { data: orders } = await supabase
    .from("orders")
    .select("id, wz_number, delivery_date, delivery_slot, notes, client_id")
    .not("wz_number", "is", null)
    .gte("delivery_date", from)
    .lte("delivery_date", to)
    .order("delivery_date", { ascending: true })
    .order("wz_number", { ascending: true });

  const orderIds = (orders ?? []).map((o) => o.id);
  const clientIds = [...new Set((orders ?? []).map((o) => o.client_id))];

  const [{ data: items }, { data: clients }, { data: docs }] = await Promise.all([
    orderIds.length
      ? supabase
          .from("order_items")
          .select("order_id, product_id, quantity, unit_price, vat_rate")
          .in("order_id", orderIds)
      : Promise.resolve({ data: [] as never[] }),
    clientIds.length
      ? supabase.from("clients").select("id, name, nip, address").in("id", clientIds)
      : Promise.resolve({ data: [] as never[] }),
    orderIds.length
      ? supabase
          .from("documents")
          .select("order_id, created_at")
          .eq("type", "wz")
          .in("order_id", orderIds)
      : Promise.resolve({ data: [] as never[] }),
  ]);

  const productIds = [...new Set((items ?? []).map((i) => i.product_id))];
  const { data: products } = productIds.length
    ? await supabase.from("products").select("id, name, unit").in("id", productIds)
    : { data: [] as never[] };

  const prod = new Map((products ?? []).map((p) => [p.id, p]));
  const clientMap = new Map((clients ?? []).map((c) => [c.id, c]));
  const docMap = new Map((docs ?? []).map((d) => [d.order_id, d.created_at]));
  const itemsByOrder = new Map<string, typeof items>();
  for (const it of items ?? []) {
    const arr = itemsByOrder.get(it.order_id) ?? [];
    arr.push(it);
    itemsByOrder.set(it.order_id, arr);
  }

  const sheets: WzSheetData[] = (orders ?? []).map((o) => {
    const c = clientMap.get(o.client_id);
    return {
      wzNumber: o.wz_number,
      docDate: docMap.get(o.id) ?? null,
      deliveryDate: o.delivery_date,
      deliverySlot: o.delivery_slot,
      clientName: c?.name ?? null,
      clientNip: c?.nip ?? null,
      clientAddress: c?.address ?? null,
      notes: o.notes,
      items: (itemsByOrder.get(o.id) ?? []).map((it) => ({
        name: prod.get(it.product_id)?.name ?? "—",
        unit: prod.get(it.product_id)?.unit ?? "",
        quantity: it.quantity,
        unit_price: it.unit_price,
        vat_rate: it.vat_rate,
      })),
    };
  });

  return (
    <div className="min-h-screen bg-muted py-6 print:bg-white print:py-0">
      <style>{`@media print { @page { size: A4; margin: 14mm; } }`}</style>

      <div className="mx-auto mb-4 flex max-w-[210mm] items-center justify-between px-4 print:hidden">
        <Link href="/admin/dokumenty" className={btnSecondary}>
          ← Wróć
        </Link>
        <div className="text-sm text-foreground/60">
          WZ: {formatDate(from)}
          {to !== from && ` – ${formatDate(to)}`} · {sheets.length} szt.
        </div>
        <PrintButton />
      </div>

      {sheets.length === 0 ? (
        <div className="mx-auto max-w-[210mm] rounded-2xl bg-surface p-8 text-center text-sm text-foreground/60 print:hidden">
          Brak wystawionych WZ w wybranym zakresie dat dostawy.
        </div>
      ) : (
        sheets.map((data, i) => (
          <WzSheet
            key={i}
            data={data}
            className={`mb-6 print:mb-0 ${i < sheets.length - 1 ? "print:break-after-page" : ""}`}
          />
        ))
      )}
    </div>
  );
}
