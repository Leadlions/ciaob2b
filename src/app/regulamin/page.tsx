import { createClient } from "@/lib/supabase/server";
import { getCutoffHour } from "@/lib/settings";

export const metadata = {
  title: "Regulamin — ciao manufaktura",
};

export default async function RegulaminPage() {
  const supabase = await createClient();
  const cutoffHour = await getCutoffHour(supabase);
  const cutoff = `${String(cutoffHour).padStart(2, "0")}:00`;

  return (
    <main className="mx-auto max-w-2xl px-5 py-10">
      <h1 className="text-2xl font-semibold">Regulamin zamówień B2B</h1>
      <p className="mt-1 text-sm text-foreground/60">
        ciao manufaktura — sprzedaż hurtowa
      </p>

      <div className="mt-6 space-y-6 text-sm leading-relaxed text-foreground/80">
        <section>
          <h2 className="font-medium text-foreground">
            §1. Postanowienia ogólne
          </h2>
          <p className="mt-1">
            Niniejszy regulamin określa zasady składania, realizacji i
            rozliczania zamówień składanych przez Klientów biznesowych (B2B) za
            pośrednictwem portalu zamówień ciao manufaktura.
          </p>
        </section>

        <section>
          <h2 className="font-medium text-foreground">
            §2. Składanie zamówień
          </h2>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            <li>
              Zamówienia składa się przez portal, wybierając produkty oraz datę
              dostawy.
            </li>
            <li>
              Zamówienia na kolejny dzień przyjmujemy do godziny{" "}
              <strong>{cutoff}</strong>. Po tej godzinie najwcześniejszym
              możliwym terminem dostawy jest dzień następny.
            </li>
            <li>
              Złożenie zamówienia przyciskiem „Zamawiam z obowiązkiem zapłaty"
              jest wiążące i stanowi zobowiązanie do zapłaty za zamówiony towar.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-medium text-foreground">
            §3. Anulowanie zamówień i okno logistyczne
          </h2>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            <li>
              Zamówienie można anulować lub zmienić wyłącznie do godziny{" "}
              <strong>{cutoff}</strong> dnia poprzedzającego dostawę.
            </li>
            <li>
              O godzinie <strong>{cutoff}</strong> zamykamy okno logistyczne na
              kolejny dzień — wszystkie zamówienia na ten dzień przechodzą
              <strong> automatycznie do realizacji</strong> (planowanie
              produkcji i dostaw).
            </li>
            <li>
              Po zamknięciu okna logistycznego zamówień nie można już anulować
              ani modyfikować, a Klient zobowiązany jest do zapłaty za towar
              skierowany do realizacji.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-medium text-foreground">§4. Płatności</h2>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            <li>
              Klient zobowiązuje się do zapłaty za wszystkie zamówienia
              zrealizowane i dostarczone w danym miesiącu.
            </li>
            <li>
              Rozliczenie następuje <strong>na koniec miesiąca</strong>, na
              podstawie zbiorczego zestawienia faktycznie dostarczonych towarów
              (dokumenty WZ).
            </li>
            <li>
              Podstawą rozliczenia są towary dostarczone — pozycje niedostarczone
              z przyczyn leżących po stronie ciao manufaktura nie obciążają
              Klienta.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-medium text-foreground">§5. Dostawa</h2>
          <p className="mt-1">
            Dostawy realizowane są w terminach wskazanych w zamówieniu. Każda
            dostawa potwierdzana jest dokumentem WZ, który stanowi podstawę
            miesięcznego rozliczenia.
          </p>
        </section>

        <section>
          <h2 className="font-medium text-foreground">§6. Reklamacje</h2>
          <p className="mt-1">
            Reklamacje dotyczące jakości lub zgodności dostawy należy zgłaszać
            niezwłocznie w dniu dostawy. Zasady reklamacji i ewentualnych korekt
            ustalane są indywidualnie z Klientem.
          </p>
        </section>

        <section>
          <h2 className="font-medium text-foreground">
            §7. Postanowienia końcowe
          </h2>
          <p className="mt-1">
            W sprawach nieuregulowanych niniejszym regulaminem zastosowanie mają
            powszechnie obowiązujące przepisy prawa. ciao manufaktura zastrzega
            sobie prawo do zmiany regulaminu; o zmianach Klienci informowani są
            za pośrednictwem portalu.
          </p>
        </section>
      </div>
    </main>
  );
}
