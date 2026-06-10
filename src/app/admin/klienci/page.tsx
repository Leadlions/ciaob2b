import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge, EmptyState, LinkButton, PageHeader } from "@/components/ui";
import { IconClients } from "@/components/icons";

export default async function ClientsPage() {
  const supabase = await createClient();
  const { data: clients } = await supabase
    .from("clients")
    .select("*")
    .order("name", { ascending: true });

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        icon={<IconClients />}
        title="Klienci"
        description="Kartoteki firm zamawiających."
        action={<LinkButton href="/admin/klienci/nowy">+ Nowy klient</LinkButton>}
      />

      {!clients || clients.length === 0 ? (
        <EmptyState
          title="Brak klientów"
          description="Dodaj pierwszą firmę, aby móc przypisać do niej użytkowników i zamówienia."
          action={<LinkButton href="/admin/klienci/nowy">+ Nowy klient</LinkButton>}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-foreground/50">
              <tr>
                <th className="px-4 py-3 font-medium">Firma</th>
                <th className="px-4 py-3 font-medium">NIP</th>
                <th className="px-4 py-3 font-medium">Rabat</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <div className="font-medium">{c.name}</div>
                    {c.contact_email && (
                      <div className="text-xs text-foreground/50">
                        {c.contact_email}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-foreground/70">
                    {c.nip ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-foreground/70">
                    {c.discount_pct > 0 ? `${c.discount_pct}%` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {c.is_active ? (
                        <Badge tone="green">Aktywny</Badge>
                      ) : (
                        <Badge>Nieaktywny</Badge>
                      )}
                      {c.orders_suspended && (
                        <Badge tone="amber">Zamówienia wstrzymane</Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/klienci/${c.id}`}
                      className="rounded-lg px-2 py-1 text-brand hover:bg-brand-50"
                    >
                      Edytuj
                    </Link>
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
