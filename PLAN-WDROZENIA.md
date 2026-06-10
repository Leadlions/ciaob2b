# 🗺️ Plan wdrożenia — Portal B2B ciao manufaktura

> Portal do zamówień ciast B2B dla klientów biznesowych (restauracje, kawiarnie, hotele, catering).
> Migracja z base44 na własny stack. Dokument roboczy — aktualizowany w trakcie projektu.
>
> **Data:** 2026-06-10

---

## 1. Jak to będzie zbudowane (w skrócie)

| Warstwa | Czym jest | Po co |
|---|---|---|
| **Next.js** | Sama aplikacja (to, co widzą klienci i admin) | Strony, formularze, wygląd |
| **Supabase – Postgres** | Baza danych | Produkty, klienci, zamówienia |
| **Supabase – Auth** | Logowanie i zaproszenia | Dostęp tylko dla zaproszonych |
| **Supabase – Storage** | Pliki | Zdjęcia, karty PDF, faktury, WZ |
| **Supabase – RLS** | „Ochrona danych na poziomie bazy" | Klient fizycznie nie zobaczy cudzych danych |
| **Vercel** | Hosting | Adres pod którym działa portal |

**Dlaczego to rozwiązuje bóle z base44:**

- **Brak limitów funkcji** — ceny indywidualne, cykliczne, walidacje robimy dokładnie jak trzeba, nic nie jest „za paywallem".
- **Koszty** — Supabase i Vercel mają darmowe plany, które udźwigną start. Realny koszt na starcie: **0 zł/mies.**, później rzędu ~100–150 zł/mies. dopiero przy większym ruchu.
- **Zero lock-in** — dane są w zwykłym Postgresie, kod jest Twój, w każdej chwili można go wyeksportować.

---

## 2. Model danych (fundament wszystkiego)

Tabele zakładane w bazie:

- **profiles** — rozszerzenie konta logowania: rola (`admin`/`client`) + powiązanie z firmą
- **clients** — kartoteki firm: nazwa, NIP, adres, kontakt, **rabat ogólny %**, `orders_suspended`, `is_active`, notatki wewnętrzne
- **products** — produkty: nazwa, kategoria, cena bazowa, jednostka, **min. ilość zamówienia**, zdjęcie, karta PDF, `is_active`
- **client_prices** — indywidualne ceny/rabaty klienta na konkretny produkt
- **promotions** — promocje: cena promocyjna, daty od–do, „promocja dnia", aktywna/nie
- **orders** + **order_items** — zamówienie (klient, status, data i slot dostawy, uwagi, nr WZ) + pozycje (produkt, ilość, **zapisana cena z chwili zamówienia**)
- **recurring_orders** — szablony cykliczne: dni tygodnia, zakres dat, pozycje, slot
- **documents** — WZ i faktury (plik PDF) powiązane z klientem/zamówieniem

**Reguła bezpieczeństwa (RLS):** klient widzi tylko wiersze swojej firmy, admin widzi wszystko. Pilnowane przez bazę, nie przez aplikację — nawet przy próbie obejścia interfejsu baza nie odda cudzych danych.

**Słowniki:**

- Kategorie produktów: `ciasta`, `torty`, `ciastka`, `desery`, `pieczywo słodkie`
- Sloty dostawy: `06:00-09:00`, `09:00-12:00`, `12:00-15:00`, `15:00-18:00`, `18:00-21:00`
- Statusy zamówień: `nowe → potwierdzone → w realizacji → wysłane → dostarczone → anulowane`

---

## 3. Fazy wdrożenia

Idziemy tak, żeby najszybciej dało się **wprowadzić produkty i klientów**, a potem włączać kolejne klocki. Po każdej fazie jest działająca wersja do obejrzenia.

### Faza 0 — Fundament *(szkielet + logowanie)*
Projekt Next.js, połączenie z Supabase, tabele w bazie, logowanie, role admin/klient, RLS, pierwszy deploy na adres testowy.
✅ *Efekt:* logowanie jako admin, pusty panel.

### Faza 1 — Panel admina: Produkty + Klienci + Zaproszenia
Dodawanie/edycja produktów (zdjęcia, PDF, kategorie, min. ilości, ceny bazowe). Kartoteki klientów (rabat ogólny, blokady, notatki). Zapraszanie użytkowników mailem i przypisywanie ich do firmy.
✅ *Efekt:* wprowadzenie realnego katalogu i pierwszych klientów.

### Faza 2 — Panel klienta: Katalog
Klient po zalogowaniu widzi produkty **ze swoją ceną** (po rabacie / cenie indywidualnej) i aktywne promocje. Pobieranie kart PDF, zdjęcia, kategorie, wyszukiwarka.
✅ *Efekt:* klient widzi „swój" cennik.

### Faza 3 — Składanie i obsługa zamówień *(serce systemu)*
Klient: nowe zamówienie (produkty + data/-y + slot, automatyczne ceny, walidacja min. ilości, blokada gdy zawieszony), „Moje zamówienia" z historią i edycją. Admin: lista wszystkich zamówień, filtry, zmiana statusu, widok dzienny/tygodniowy do realizacji.
✅ *Efekt:* pełny obieg zamówienia od klienta do realizacji.

### Faza 4 — Ceny indywidualne + Promocje (zarządzanie)
Admin ustawia ceny indywidualne na konkretne produkty i tworzy promocje (czasowe, „promocja dnia"). To, co klient widzi w katalogu od Fazy 2, tu dostaje pełne sterowanie.
✅ *Efekt:* pełna kontrola nad cenami i akcjami.

### Faza 5 — Zamówienia cykliczne
Klient definiuje stałe zamówienie (dni tygodnia + zakres dat), system generuje je automatycznie wg harmonogramu. Włączanie/wyłączanie/usuwanie.
✅ *Efekt:* stali klienci zamawiają „raz a dobrze".

### Faza 6 — Dokumenty WZ + Faktury
WZ powiązane z zamówieniami (numery, pozycje, lista u klienta). Faktury: **upload gotowego PDF** z programu do faktur i przypisanie do klienta/zamówienia (bez generowania w systemie).
✅ *Efekt:* klient ma w jednym miejscu swoje WZ i faktury.

### Faza 7 — Dashboardy, raporty, branding
KPI admina (liczba zamówień, sprzedaż, aktywni klienci), dashboard klienta, podstawowe raporty, dopracowanie wyglądu pod markę ciao i wersji mobilnej.
✅ *Efekt:* dopięta, „ładna" całość.

> **Poza MVP, na później:** generowanie faktur w systemie, wysyłka faktur mailem, asystent AI dla admina (`/AdminAIAssistant`), rozbudowane raporty.

---

## 4. Czego potrzebuję od Ciebie (na bieżąco)

1. **Konto Supabase** — przy Fazie 0, poprowadzę. MCP już podłączone.
2. **Dane do startu** — lista produktów (nazwy, kategorie, ceny, jednostki, min. ilości), zdjęcia, karty PDF; lista pierwszych klientów z rabatami.
3. **Branding** — logo ciao, kolory, ewentualnie domena (np. `zamowienia.ciao.pl`).
4. **Decyzje biznesowe** po drodze — krótkie, konkretne pytania.

---

## 5. Decyzje do podjęcia (mogą poczekać do odpowiednich faz)

| Decyzja | Propozycja domyślna |
|---|---|
| Rabat ogólny vs cena indywidualna na ten sam produkt | Cena indywidualna ma pierwszeństwo |
| Promocja vs cena klienta | Klient płaci niższą z dwóch (zawsze korzystniej) |
| Do kiedy klient może edytować zamówienie | Do statusu „potwierdzone" i do 24h przed dostawą |
| Domena pod portal | Do ustalenia |

---

## 6. Status prac

- [x] Faza 0 — Fundament *(baza + RLS + logowanie + role + panele; lokalnie. Pozostał deploy na Vercel.)*
- [x] Faza 1 — Produkty + Klienci + Użytkownicy *(pełen CRUD, tworzenie kont z hasłem tymczasowym, onboarding klienta zweryfikowany)*
- [x] Faza 2 — Katalog klienta *(ceny po rabacie/indywidualne + promocje, filtry, wyszukiwarka; import 84 produktów i 9 klientów z Excela)*
- [x] Faza 3 — Zamówienia *(klient: koszyk + dostawa + Moje zamówienia; admin: lista + statusy; pełny obieg zweryfikowany. Wielodniowość: do dołożenia.)*
- [x] Faza 4 — Ceny indywidualne + Promocje *(moduł promocji + ceny indywidualne na karcie klienta; oba widoczne w katalogu — zweryfikowane)*
- [x] Faza 5 — Zamówienia cykliczne *(szablony wg dni tygodnia + zakres dat; automatyczne generowanie: pg_cron co noc + natychmiast po utworzeniu; zweryfikowane)*
- [~] Faza 6 — WZ + Faktury *(WZ gotowe: admin nadaje nr WZ na zamówieniu → dokument widoczny u klienta. Faktury ODŁOŻONE na życzenie — kod admina gotowy, ukryty z menu.)*
- [x] Optymalizacja: filtry katalogu działają natychmiast (po stronie przeglądarki)
- [ ] Faza 7 — Dashboardy + raporty + branding
