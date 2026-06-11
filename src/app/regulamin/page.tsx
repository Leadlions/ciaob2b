export const metadata = {
  title: "Regulamin — ciao manufaktura",
};

export default function RegulaminPage() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-10">
      <h1 className="text-2xl font-semibold">Regulamin zamówień B2B</h1>
      <p className="mt-1 text-sm text-foreground/60">
        ciao manufaktura — sprzedaż hurtowa
      </p>

      <div className="mt-6 space-y-5 text-sm leading-relaxed text-foreground/80">
        <section>
          <h2 className="font-medium text-foreground">1. Składanie zamówień</h2>
          <p className="mt-1">
            Zamówienia na kolejny dzień przyjmujemy do godziny granicznej
            wskazanej w portalu. Po jej przekroczeniu najwcześniejszy możliwy
            termin dostawy to kolejny dzień roboczy.
          </p>
        </section>

        <section>
          <h2 className="font-medium text-foreground">
            2. Obowiązek zapłaty
          </h2>
          <p className="mt-1">
            Złożenie zamówienia poprzez przycisk „Zamawiam z obowiązkiem
            zapłaty" jest wiążące i zobowiązuje do zapłaty za zamówiony towar.
          </p>
        </section>

        <section>
          <h2 className="font-medium text-foreground">3. Dostawa i odbiór</h2>
          <p className="mt-1">
            Szczegóły dotyczące dostaw, minimalnych ilości oraz warunków
            płatności ustalane są indywidualnie z klientem.
          </p>
        </section>

        <p className="pt-4 text-xs text-foreground/50">
          To jest wstępna treść regulaminu — do uzupełnienia ostatecznymi
          zapisami.
        </p>
      </div>
    </main>
  );
}
