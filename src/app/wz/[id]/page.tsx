import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth";
import { PrintButton } from "@/components/print-button";
import { WzSheet } from "@/components/wz-sheet";
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

      <WzSheet
        data={{
          wzNumber: order.wz_number,
          docDate: doc?.created_at ?? null,
          deliveryDate: order.delivery_date,
          deliverySlot: order.delivery_slot,
          clientName: client?.name ?? null,
          clientNip: client?.nip ?? null,
          clientAddress: client?.address ?? null,
          notes: order.notes,
          items: (items ?? []).map((it) => ({
            name: prod.get(it.product_id)?.name ?? "—",
            unit: prod.get(it.product_id)?.unit ?? "",
            quantity: it.quantity,
            unit_price: it.unit_price,
            vat_rate: it.vat_rate,
          })),
        }}
      />
    </div>
  );
}
