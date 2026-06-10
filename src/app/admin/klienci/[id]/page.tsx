import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  PageHeader,
  Card,
  Field,
  Input,
  Select,
  btnPrimary,
} from "@/components/ui";
import { ClientForm } from "@/components/client-form";
import { formatPrice } from "@/lib/constants";
import { setClientPrice, removeClientPrice } from "../actions";

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: client }, { data: users }, { data: products }, { data: prices }] =
    await Promise.all([
      supabase.from("clients").select("*").eq("id", id).single(),
      supabase.from("profiles").select("full_name, email").eq("client_id", id),
      supabase.from("products").select("id, name, base_price").order("name"),
      supabase
        .from("client_prices")
        .select("id, product_id, custom_price")
        .eq("client_id", id),
    ]);

  if (!client) notFound();

  const productMap = new Map(
    (products ?? []).map((p) => [p.id, p]),
  );

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Edycja klienta" description={client.name} />

      <ClientForm client={client} />

      {/* Ceny indywidualne */}
      <div className="mt-8 max-w-2xl">
        <h2 className="mb-3 text-lg font-semibold">Ceny indywidualne</h2>
        <p className="mb-4 text-sm text-foreground/60">
          Ustaw stałą cenę na wybrane produkty dla tego klienta. Cena
          indywidualna ma pierwszeństwo przed rabatem ogólnym.
        </p>

        <Card className="mb-4 p-0">
          {prices && prices.length > 0 ? (
            <table className="w-full text-sm">
              <thead className="border-b border-border text-left text-xs uppercase tracking-wide text-foreground/50">
                <tr>
                  <th className="px-4 py-3 font-medium">Produkt</th>
                  <th className="px-4 py-3 font-medium">Cena bazowa</th>
                  <th className="px-4 py-3 font-medium">Cena klienta</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {prices.map((pr) => {
                  const prod = productMap.get(pr.product_id);
                  return (
                    <tr key={pr.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3">{prod?.name ?? "—"}</td>
                      <td className="px-4 py-3 text-foreground/50">
                        {prod ? formatPrice(prod.base_price) : "—"}
                      </td>
                      <td className="px-4 py-3 font-medium text-brand-dark">
                        {formatPrice(pr.custom_price)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <form action={removeClientPrice}>
                          <input type="hidden" name="id" value={pr.id} />
                          <input type="hidden" name="client_id" value={client.id} />
                          <button
                            type="submit"
                            className="rounded-lg px-2 py-1 text-foreground/40 hover:bg-brand-50 hover:text-brand"
                          >
                            Usuń
                          </button>
                        </form>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p className="px-4 py-5 text-sm text-foreground/50">
              Brak cen indywidualnych — klient płaci ceny bazowe pomniejszone o
              rabat ogólny ({client.discount_pct}%).
            </p>
          )}
        </Card>

        {/* Dodanie ceny */}
        <Card>
          <form
            action={setClientPrice}
            className="flex flex-wrap items-end gap-3"
          >
            <input type="hidden" name="client_id" value={client.id} />
            <div className="min-w-[200px] flex-1">
              <Field label="Produkt" htmlFor="cp_product">
                <Select id="cp_product" name="product_id" defaultValue="" required>
                  <option value="" disabled>
                    Wybierz produkt…
                  </option>
                  {(products ?? []).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({formatPrice(p.base_price)})
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <div className="w-32">
              <Field label="Cena (zł)" htmlFor="cp_price">
                <Input
                  id="cp_price"
                  name="custom_price"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                />
              </Field>
            </div>
            <button type="submit" className={btnPrimary}>
              Ustaw cenę
            </button>
          </form>
        </Card>
      </div>

      {/* Przypisani użytkownicy */}
      <div className="mt-8 max-w-2xl">
        <Card>
          <div className="text-sm font-medium">Przypisani użytkownicy</div>
          {users && users.length > 0 ? (
            <ul className="mt-2 space-y-1 text-sm text-foreground/70">
              {users.map((u, i) => (
                <li key={i}>
                  {u.full_name ? `${u.full_name} — ` : ""}
                  {u.email}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-foreground/50">
              Brak przypisanych użytkowników. Dodasz ich w module Użytkownicy.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
