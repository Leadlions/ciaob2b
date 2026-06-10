import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatDate, orderRef } from "@/lib/constants";
import { EmptyState, PageHeader } from "@/components/ui";
import { IconDoc } from "@/components/icons";
import { getEffectiveClientId } from "@/lib/view-as";

export default async function ClientDocumentsPage() {
  const supabase = await createClient();
  const { clientId } = await getEffectiveClientId();
  const cid = clientId ?? "00000000-0000-0000-0000-000000000000";

  const { data: docs } = await supabase
    .from("documents")
    .select("*")
    .eq("type", "wz")
    .eq("client_id", cid)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        icon={<IconDoc />}
        title="Dokumenty WZ"
        description="Dokumenty wydania zewnętrznego powiązane z Twoimi zamówieniami."
      />

      {!docs || docs.length === 0 ? (
        <EmptyState
          title="Brak dokumentów WZ"
          description="Dokumenty pojawią się tu po realizacji zamówień."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-foreground/50">
              <tr>
                <th className="px-4 py-3 font-medium">Numer WZ</th>
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
                  <td className="px-4 py-3">
                    {d.order_id ? (
                      <Link
                        href={`/panel/zamowienia/${d.order_id}`}
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
