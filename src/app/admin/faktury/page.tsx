import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/constants";
import { Card, EmptyState, PageHeader } from "@/components/ui";
import { InvoiceUploadForm } from "@/components/invoice-upload-form";
import { deleteInvoice } from "./actions";

export default async function AdminInvoicesPage() {
  const supabase = await createClient();

  const [{ data: invoices }, { data: clients }] = await Promise.all([
    supabase
      .from("documents")
      .select("*")
      .eq("type", "faktura")
      .order("created_at", { ascending: false }),
    supabase.from("clients").select("id, name").order("name"),
  ]);

  const clientName = new Map((clients ?? []).map((c) => [c.id, c.name]));

  // Podpisane linki do pobrania (prywatny bucket).
  const links = new Map<string, string>();
  await Promise.all(
    (invoices ?? []).map(async (inv) => {
      if (!inv.file_url) return;
      const { data } = await supabase.storage
        .from("documents")
        .createSignedUrl(inv.file_url, 3600);
      if (data?.signedUrl) links.set(inv.id, data.signedUrl);
    }),
  );

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Faktury"
        description="Wgrywaj faktury PDF i przypisuj je do klientów."
      />

      <div className="mb-6">
        <InvoiceUploadForm clients={clients ?? []} />
      </div>

      {!invoices || invoices.length === 0 ? (
        <EmptyState title="Brak faktur" description="Wgraj pierwszą fakturę powyżej." />
      ) : (
        <Card className="p-0">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-foreground/50">
              <tr>
                <th className="px-4 py-3 font-medium">Numer</th>
                <th className="px-4 py-3 font-medium">Klient</th>
                <th className="px-4 py-3 font-medium">Data</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium">{inv.number ?? "—"}</td>
                  <td className="px-4 py-3 text-foreground/70">
                    {clientName.get(inv.client_id) ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-foreground/70">
                    {formatDate(inv.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {links.get(inv.id) && (
                        <a
                          href={links.get(inv.id)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg px-2 py-1 text-brand hover:bg-brand-50"
                        >
                          Pobierz
                        </a>
                      )}
                      <form action={deleteInvoice}>
                        <input type="hidden" name="id" value={inv.id} />
                        <input type="hidden" name="path" value={inv.file_url ?? ""} />
                        <button
                          type="submit"
                          className="rounded-lg px-2 py-1 text-foreground/40 hover:bg-brand-50 hover:text-brand"
                        >
                          Usuń
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
