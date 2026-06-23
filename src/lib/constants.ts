import type { Enums } from "@/lib/database.types";

// Kategorie produktów — wartość w bazie -> etykieta po polsku.
export const CATEGORY_LABELS: Record<Enums<"product_category">, string> = {
  ciasta: "Ciasta",
  torty: "Torty",
  ciastka: "Ciastka",
  desery: "Desery",
  pieczywo_slodkie: "Pieczywo słodkie",
};

export const CATEGORIES = Object.keys(
  CATEGORY_LABELS,
) as Enums<"product_category">[];

// Przedziały godzinowe dostawy.
export const DELIVERY_SLOT_LABELS: Record<Enums<"delivery_slot">, string> = {
  "06-09": "06:00–09:00",
  "09-12": "09:00–12:00",
  "12-15": "12:00–15:00",
  "15-18": "15:00–18:00",
  "18-21": "18:00–21:00",
};

export const DELIVERY_SLOTS = Object.keys(
  DELIVERY_SLOT_LABELS,
) as Enums<"delivery_slot">[];

// Statusy zamówień.
export const ORDER_STATUS_LABELS: Record<Enums<"order_status">, string> = {
  nowe: "Nowe",
  potwierdzone: "Potwierdzone",
  w_realizacji: "W realizacji",
  wyslane: "Wysłane",
  dostarczone: "Dostarczone",
  anulowane: "Anulowane",
};

// Kolejność statusów (do widoku postępu) i kolor odznaki.
export const ORDER_STATUS_FLOW: Enums<"order_status">[] = [
  "nowe",
  "potwierdzone",
  "w_realizacji",
  "wyslane",
  "dostarczone",
];

export const ORDER_STATUS_TONE: Record<
  Enums<"order_status">,
  "neutral" | "green" | "red" | "amber"
> = {
  nowe: "amber",
  potwierdzone: "green",
  w_realizacji: "green",
  wyslane: "green",
  dostarczone: "neutral",
  anulowane: "red",
};

// Statusy, w których klient może jeszcze edytować/anulować zamówienie.
export const CLIENT_EDITABLE_STATUSES: Enums<"order_status">[] = [
  "nowe",
  "potwierdzone",
];

// Typowe jednostki miary.
export const UNITS = ["szt", "kg", "opak", "blacha", "porcja"];

// Dni tygodnia (numeracja jak w JS/Postgres: 0=niedziela). Kolejność wyświetlania od poniedziałku.
export const WEEKDAYS: { n: number; short: string; long: string }[] = [
  { n: 1, short: "Pon", long: "Poniedziałek" },
  { n: 2, short: "Wt", long: "Wtorek" },
  { n: 3, short: "Śr", long: "Środa" },
  { n: 4, short: "Czw", long: "Czwartek" },
  { n: 5, short: "Pt", long: "Piątek" },
  { n: 6, short: "Sob", long: "Sobota" },
  { n: 0, short: "Niedz", long: "Niedziela" },
];

export function weekdaysLabel(days: number[]): string {
  return WEEKDAYS.filter((w) => days.includes(w.n))
    .map((w) => w.short)
    .join(", ");
}

// Formatowanie daty (z YYYY-MM-DD lub ISO) na format polski.
export function formatDate(d: string | null): string {
  if (!d) return "—";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return d;
  return date.toLocaleDateString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// Krótki identyfikator zamówienia do wyświetlenia.
export function orderRef(id: string): string {
  return id.slice(0, 8).toUpperCase();
}

// Formatowanie ceny w PLN.
export function formatPrice(value: number): string {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
  }).format(value);
}

// Dostępne stawki VAT (%) dla produktów.
export const VAT_RATES = [0, 5, 8, 23] as const;
export const DEFAULT_VAT_RATE = 8;

// Brutto z netto przy danej stawce VAT (%), zaokrąglone do groszy.
export function grossFromNet(net: number, vatRate: number): number {
  return Math.round(net * (1 + vatRate / 100) * 100) / 100;
}
