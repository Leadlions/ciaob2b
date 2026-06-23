import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatDate, orderRef } from "@/lib/constants";
import { warsawDate } from "@/lib/delivery";
import { EmptyState, PageHeader, btnPrimary } from "@/components/ui";
import { IconDoc } from "@/components/icons";

export default async function AdminDocumentsPage() {
  const supabase = await createClient();
  const today = warsawDate(0);

  const { data: docs } = await supabase
    .from("documents")
    .select("*")
    .eq("type", "wz")
    .order("created_at", { ascending: false });

  const clientIds = [...new Set((docs ?? []).map((d) => d.client_id))];
  const clientName = new Map<string, string>();
  if (clientIds.length) {
    const { data: clients } = await supabase
      .from("clients")
      .select("id, name")
      .in("id", clientIds);
    for (const c of clients ?? []) clientName.set(c.id, c.name);
  }

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        icon={<IconDoc />}
        title="Dokumenty WZ"
        description="Dokumenty wydania zewnętrznego. Numer WZ nadajesz na karcie zamówienia."
      />

      {/* Zbiorczy druk WZ wg daty dostawy */}
      <form
        method="get"
        action="/wz/druk"
        target="_blank"
        className="mb-5 flex flex-wrap items-end gap-2 rounded-xl border border-border bg-surface p-3 text-sm"
      >
        <div>
          <label htmlFor="from" className="mb-1 block text-xs text-foreground/60">
            Od (data dostawy)
          </label>
          <input
            id="from"
            type="date"
            name="from"
            defaultValue={today}
            className="rounded-lg border border-border bg-background px-3 py-1.5 outline-none focus:border-brand"
          />
        </div>
        <div>
          <label htmlFor="to" className="mb-1 block text-xs text-foreground/60">
            Do
          </label>
          <input
            id="to"
            type="date"
            name="to"
            defaultValue={today}
            className="rounded-lg border border-border bg-background px-3 py-1.5 outline-none focus:border-brand"
          />
        </div>
        <button type="submit" className={btnPrimary}>
          Drukuj WZ z zakresu ↗
        </button>
      </form>

      {!docs || docs.length === 0 ? (
        <EmptyState
          title="Brak dokumentów WZ"
          description="Nadaj numer WZ na karcie zamówienia, aby utworzyć dokument."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-foreground/50">
              <tr>
                <th className="px-4 py-3 font-medium">Numer WZ</th>
                <th className="px-4 py-3 font-medium">Klient</th>
                <th className="px-4 py-3 font-medium">Zamówienie</th>
                <th className="px-4 py-3 font-medium">Data</th>
              </tr>
            </thead>
            <tbody>
              {docs.map((d) => (
                <tr key={d.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium">
                    {d.order_id ? (
                      <Link
                        href={`/wz/${d.order_id}`}
                        className="text-brand hover:underline"
                      >
                        {d.number} ↗
                      </Link>
                    ) : (
                      d.number
                    )}
                  </td>
                  <td className="px-4 py-3 text-foreground/70">
                    {clientName.get(d.client_id) ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    {d.order_id ? (
                      <Link
                        href={`/admin/zamowienia/${d.order_id}`}
                        className="text-brand hover:underline"
                      >
                        #{orderRef(d.order_id)}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3 text-foreground/70">
                    {formatDate(d.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
