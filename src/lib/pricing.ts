// Logika wyznaczania ceny dla klienta.
// Zasady (ustalone w planie):
//  - cena indywidualna (client_prices) ma pierwszeństwo przed rabatem ogólnym,
//  - w przeciwnym razie: cena bazowa pomniejszona o rabat ogólny %,
//  - jeśli jest aktywna promocja: klient płaci NIŻSZĄ z (cena klienta, cena promocyjna).

export type PriceInfo = {
  effective: number; // cena do zapłaty
  base: number; // cena katalogowa (bazowa)
  hasDiscount: boolean; // efektywna < bazowa (pokaż przekreślenie)
  isPromo: boolean; // zastosowano promocję
  isPromoOfDay: boolean;
  isCustom: boolean; // zastosowano cenę indywidualną
};

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function computePrice(opts: {
  basePrice: number;
  discountPct?: number | null;
  customPrice?: number | null;
  promoPrice?: number | null;
  isPromoOfDay?: boolean;
}): PriceInfo {
  const base = opts.basePrice;
  const afterDiscount =
    opts.customPrice != null
      ? opts.customPrice
      : round2(base * (1 - (opts.discountPct ?? 0) / 100));

  let effective = afterDiscount;
  let isPromo = false;
  if (opts.promoPrice != null && opts.promoPrice < effective) {
    effective = opts.promoPrice;
    isPromo = true;
  }
  effective = round2(effective);

  return {
    effective,
    base,
    hasDiscount: effective < base,
    isPromo,
    isPromoOfDay: isPromo && !!opts.isPromoOfDay,
    isCustom: opts.customPrice != null && !isPromo,
  };
}
