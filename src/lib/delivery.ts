// Godzina graniczna przyjmowania zamówień na kolejny dzień (czas polski).
export const ORDER_CUTOFF_HOUR = 18;

function warsawHour(now: Date): number {
  return Number(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Warsaw",
      hour: "2-digit",
      hour12: false,
    }).format(now),
  );
}

function warsawToday(now: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Warsaw",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now); // YYYY-MM-DD
}

// Data w strefie Europe/Warsaw przesunięta o offsetDays (YYYY-MM-DD).
export function warsawDate(offsetDays = 0, now: Date = new Date()): string {
  const base = new Date(`${warsawToday(now)}T12:00:00Z`);
  base.setUTCDate(base.getUTCDate() + offsetDays);
  return base.toISOString().slice(0, 10);
}

// Najwcześniejsza możliwa data dostawy (YYYY-MM-DD):
//  - przed godziną graniczną (czas polski) → jutro,
//  - od godziny granicznej → pojutrze (minęła granica na jutro).
export function earliestDeliveryDate(
  cutoffHour: number = ORDER_CUTOFF_HOUR,
  now: Date = new Date(),
): string {
  const addDays = warsawHour(now) < cutoffHour ? 1 : 2;
  const base = new Date(`${warsawToday(now)}T12:00:00Z`);
  base.setUTCDate(base.getUTCDate() + addDays);
  return base.toISOString().slice(0, 10);
}
