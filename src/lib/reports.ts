import { readFileSync } from "fs";
import path from "path";
import { PDFDocument, PDFFont, PDFPage, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import type { SupabaseClient } from "@supabase/supabase-js";
import { DELIVERY_SLOT_LABELS, formatDate } from "@/lib/constants";

const A4_W = 595.28;
const A4_H = 841.89;
const MARGIN = 42;
const BRAND = rgb(0.78, 0.22, 0.17);
const GREY = rgb(0.45, 0.45, 0.45);
const BLACK = rgb(0.1, 0.1, 0.1);

function fontFile(name: string): Buffer {
  return readFileSync(path.join(process.cwd(), "src", "fonts", name));
}

// Usuwa znaki spoza BMP (emoji) i znaki sterujące, których font może nie mieć.
function clean(s: string): string {
  let out = "";
  for (const ch of s ?? "") {
    const code = ch.codePointAt(0) ?? 0;
    if (code > 0xffff) continue;
    if (code < 0x20 || (code >= 0x7f && code <= 0x9f)) { out += " "; continue; }
    out += ch;
  }
  return out.trim();
}

type Sheet = {
  doc: PDFDocument;
  page: PDFPage;
  y: number;
  reg: PDFFont;
  bold: PDFFont;
};

function addPage(s: Sheet) {
  s.page = s.doc.addPage([A4_W, A4_H]);
  s.y = A4_H - MARGIN;
}

function ensure(s: Sheet, space: number) {
  if (s.y - space < MARGIN) addPage(s);
}

function line(
  s: Sheet,
  text: string,
  opts: { x?: number; size?: number; bold?: boolean; color?: ReturnType<typeof rgb>; gap?: number } = {},
) {
  const size = opts.size ?? 10;
  ensure(s, size + (opts.gap ?? 4));
  s.page.drawText(clean(text), {
    x: opts.x ?? MARGIN,
    y: s.y - size,
    size,
    font: opts.bold ? s.bold : s.reg,
    color: opts.color ?? BLACK,
  });
  s.y -= size + (opts.gap ?? 4);
}

function rightText(
  s: Sheet,
  text: string,
  rightX: number,
  baselineY: number,
  opts: { size?: number; bold?: boolean; color?: ReturnType<typeof rgb> } = {},
) {
  const size = opts.size ?? 10;
  const font = opts.bold ? s.bold : s.reg;
  const w = font.widthOfTextAtSize(clean(text), size);
  s.page.drawText(clean(text), {
    x: rightX - w,
    y: baselineY,
    size,
    font,
    color: opts.color ?? BLACK,
  });
}

function hr(s: Sheet, color = rgb(0.85, 0.82, 0.76)) {
  ensure(s, 8);
  s.page.drawLine({
    start: { x: MARGIN, y: s.y },
    end: { x: A4_W - MARGIN, y: s.y },
    thickness: 0.7,
    color,
  });
  s.y -= 8;
}

function header(s: Sheet, title: string, subtitle: string) {
  line(s, "ciao manufaktura", { size: 11, bold: true, color: BRAND, gap: 2 });
  line(s, title, { size: 18, bold: true, gap: 2 });
  line(s, subtitle, { size: 10, color: GREY, gap: 10 });
  hr(s, rgb(0.1, 0.1, 0.1));
}

async function makeSheet(): Promise<Sheet> {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  const reg = await doc.embedFont(fontFile("Roboto-Regular.ttf"), { subset: true });
  const bold = await doc.embedFont(fontFile("Roboto-Bold.ttf"), { subset: true });
  const s: Sheet = { doc, page: null as unknown as PDFPage, y: 0, reg, bold };
  addPage(s);
  return s;
}

type OrderData = {
  id: string;
  wz_number: string | null;
  delivery_slot: keyof typeof DELIVERY_SLOT_LABELS;
  clientName: string;
  items: { name: string; unit: string; quantity: number }[];
};

// Raport WZ — lista zamówień na dany dzień (firma, godzina, pozycje).
async function buildWzPdf(orders: OrderData[], dateStr: string): Promise<Uint8Array> {
  const s = await makeSheet();
  header(
    s,
    "Raport WZ — dostawy",
    `Na dzień ${formatDate(dateStr)} · zamówień: ${orders.length}`,
  );

  if (orders.length === 0) {
    line(s, "Brak zamówień na ten dzień.", { color: GREY });
  }

  for (const o of orders) {
    ensure(s, 60);
    s.y -= 4;
    const wz = o.wz_number ? `WZ ${o.wz_number}` : "WZ: (nie wystawiono)";
    line(s, `${wz}  ·  ${o.clientName}`, { size: 12, bold: true, gap: 2 });
    line(s, `Dostawa: ${DELIVERY_SLOT_LABELS[o.delivery_slot]}`, {
      size: 9,
      color: GREY,
      gap: 4,
    });
    for (const it of o.items) {
      line(s, `   •  ${it.quantity} ${it.unit}  ×  ${it.name}`, { size: 10, gap: 3 });
    }
    hr(s);
  }

  return s.doc.save();
}

// Raport produkcji — suma ilości każdego produktu na dany dzień.
async function buildProductionPdf(
  totals: { name: string; unit: string; quantity: number }[],
  dateStr: string,
): Promise<Uint8Array> {
  const s = await makeSheet();
  header(
    s,
    "Raport produkcji",
    `Do wyprodukowania na dzień ${formatDate(dateStr)} · pozycji: ${totals.length}`,
  );

  // Nagłówek tabeli
  ensure(s, 18);
  line(s, "Produkt", { size: 9, bold: true, color: GREY, gap: 0 });
  rightText(s, "Ilość", A4_W - MARGIN, s.y + 9, { size: 9, bold: true, color: GREY });
  s.y -= 6;
  hr(s, rgb(0.1, 0.1, 0.1));

  if (totals.length === 0) {
    line(s, "Brak pozycji na ten dzień.", { color: GREY });
  }

  for (const t of totals) {
    ensure(s, 16);
    const baseline = s.y - 11;
    s.page.drawText(clean(t.name), {
      x: MARGIN,
      y: baseline,
      size: 11,
      font: s.reg,
      color: BLACK,
    });
    rightText(s, `${t.quantity} ${t.unit}`, A4_W - MARGIN, baseline, {
      size: 11,
      bold: true,
    });
    s.y -= 16;
    s.page.drawLine({
      start: { x: MARGIN, y: s.y + 4 },
      end: { x: A4_W - MARGIN, y: s.y + 4 },
      thickness: 0.4,
      color: rgb(0.9, 0.88, 0.83),
    });
  }

  return s.doc.save();
}

export type DailyReports = {
  dateStr: string;
  orderCount: number;
  productLineCount: number;
  wzPdf: Uint8Array;
  prodPdf: Uint8Array;
};

// Buduje oba raporty dla zamówień z dostawą w podanym dniu (YYYY-MM-DD).
export async function generateDailyReports(
  supabase: SupabaseClient,
  dateStr: string,
): Promise<DailyReports> {
  const { data: orders } = await supabase
    .from("orders")
    .select("id, wz_number, delivery_slot, client_id")
    .eq("delivery_date", dateStr)
    .neq("status", "anulowane")
    .order("delivery_slot");

  const orderIds = (orders ?? []).map((o) => o.id);
  const clientIds = [...new Set((orders ?? []).map((o) => o.client_id))];

  const [{ data: items }, { data: clients }] = await Promise.all([
    orderIds.length
      ? supabase
          .from("order_items")
          .select("order_id, product_id, quantity")
          .in("order_id", orderIds)
      : Promise.resolve({ data: [] as { order_id: string; product_id: string; quantity: number }[] }),
    clientIds.length
      ? supabase.from("clients").select("id, name").in("id", clientIds)
      : Promise.resolve({ data: [] as { id: string; name: string }[] }),
  ]);

  const productIds = [...new Set((items ?? []).map((i) => i.product_id))];
  const { data: products } = productIds.length
    ? await supabase.from("products").select("id, name, unit").in("id", productIds)
    : { data: [] as { id: string; name: string; unit: string }[] };

  const prodMap = new Map((products ?? []).map((p) => [p.id, p]));
  const clientMap = new Map((clients ?? []).map((c) => [c.id, c.name]));
  const itemsByOrder = new Map<string, { name: string; unit: string; quantity: number }[]>();
  const totals = new Map<string, { name: string; unit: string; quantity: number }>();

  for (const it of items ?? []) {
    const p = prodMap.get(it.product_id);
    const name = p?.name ?? "—";
    const unit = p?.unit ?? "szt";
    const arr = itemsByOrder.get(it.order_id) ?? [];
    arr.push({ name, unit, quantity: it.quantity });
    itemsByOrder.set(it.order_id, arr);

    const key = it.product_id;
    const cur = totals.get(key);
    if (cur) cur.quantity += it.quantity;
    else totals.set(key, { name, unit, quantity: it.quantity });
  }

  const orderData: OrderData[] = (orders ?? []).map((o) => ({
    id: o.id,
    wz_number: o.wz_number,
    delivery_slot: o.delivery_slot,
    clientName: clientMap.get(o.client_id) ?? "—",
    items: itemsByOrder.get(o.id) ?? [],
  }));

  const totalsArr = [...totals.values()].sort((a, b) =>
    a.name.localeCompare(b.name, "pl"),
  );

  const [wzPdf, prodPdf] = await Promise.all([
    buildWzPdf(orderData, dateStr),
    buildProductionPdf(totalsArr, dateStr),
  ]);

  return {
    dateStr,
    orderCount: orderData.length,
    productLineCount: totalsArr.length,
    wzPdf,
    prodPdf,
  };
}
