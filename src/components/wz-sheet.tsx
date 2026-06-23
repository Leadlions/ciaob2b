import {
  formatDate,
  formatPrice,
  grossFromNet,
  DELIVERY_SLOT_LABELS,
} from "@/lib/constants";
import { Logo } from "./logo";

export type WzItem = {
  name: string;
  unit: string;
  quantity: number;
  unit_price: number;
  vat_rate: number;
};

export type WzSheetData = {
  wzNumber: string | null;
  docDate: string | null;
  deliveryDate: string | null;
  deliverySlot: keyof typeof DELIVERY_SLOT_LABELS;
  clientName: string | null;
  clientNip: string | null;
  clientAddress: string | null;
  notes: string | null;
  items: WzItem[];
};

// Kartka A4 dokumentu WZ. Używana zarówno przy pojedynczym dokumencie,
// jak i przy zbiorczym druku zakresu (każda kartka z osobnej strony).
export function WzSheet({
  data,
  className = "",
}: {
  data: WzSheetData;
  className?: string;
}) {
  const totalNet = data.items.reduce((s, i) => s + i.quantity * i.unit_price, 0);
  const totalGross = data.items.reduce(
    (s, i) => s + grossFromNet(i.quantity * i.unit_price, i.vat_rate),
    0,
  );
  const totalVat = Math.round((totalGross - totalNet) * 100) / 100;

  return (
    <div
      className={`mx-auto max-w-[210mm] bg-white p-[16mm] text-[12px] text-black shadow-sm print:max-w-none print:p-0 print:shadow-none ${className}`}
    >
      <div className="flex items-start justify-between border-b-2 border-black pb-4">
        <div>
          <Logo className="h-10 w-auto" />
          <div className="mt-2 text-[13px] font-semibold">ciao manufaktura</div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold">WYDANIE ZEWNĘTRZNE</div>
          <div className="text-base font-semibold">{data.wzNumber}</div>
          <div className="mt-1 text-[11px] text-neutral-600">
            Data wystawienia: {formatDate(data.docDate)}
          </div>
        </div>
      </div>

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
          <div className="font-semibold">{data.clientName}</div>
          {data.clientNip && <div>NIP: {data.clientNip}</div>}
          {data.clientAddress && <div>{data.clientAddress}</div>}
        </div>
      </div>

      <div className="mt-4 rounded border border-neutral-300 px-3 py-2 text-[11px]">
        <span className="text-neutral-500">Data dostawy: </span>
        <span className="font-medium">{formatDate(data.deliveryDate)}</span>
        <span className="ml-4 text-neutral-500">Godzina: </span>
        <span className="font-medium">
          {DELIVERY_SLOT_LABELS[data.deliverySlot]}
        </span>
      </div>

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
          {data.items.map((it, idx) => {
            const net = it.quantity * it.unit_price;
            return (
              <tr key={idx} className="border-b border-neutral-300">
                <td className="py-1.5 pr-1">{idx + 1}</td>
                <td className="py-1.5 pr-1">{it.name}</td>
                <td className="py-1.5 pr-1 text-right">{it.quantity}</td>
                <td className="py-1.5 pr-1">{it.unit}</td>
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

      {data.notes && (
        <div className="mt-4 text-[11px]">
          <span className="text-neutral-500">Uwagi: </span>
          {data.notes}
        </div>
      )}

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
  );
}
