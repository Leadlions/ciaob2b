import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { hasServiceRole } from "@/lib/supabase/admin";
import { Badge, EmptyState, LinkButton, PageHeader } from "@/components/ui";
import { IconUsers } from "@/components/icons";

export default async function UsersPage() {
  const supabase = await createClient();
  const [{ data: users }, { data: clients }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, email, full_name, role, client_id")
      .order("created_at", { ascending: true }),
    supabase.from("clients").select("id, name"),
  ]);

  const clientName = new Map((clients ?? []).map((c) => [c.id, c.name]));
  const canCreate = hasServiceRole();

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        icon={<IconUsers />}
        title="Użytkownicy"
        description="Konta osób korzystających z platformy."
        action={
          canCreate ? (
            <LinkButton href="/admin/uzytkownicy/nowy">
              + Nowy użytkownik
            </LinkButton>
          ) : undefined
        }
      />

      {!canCreate && (
        <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Aby tworzyć konta użytkowników, w pliku{" "}
          <span className="font-mono">.env.local</span> musi być ustawiony klucz
          serwisowy <span className="font-mono">SUPABASE_SERVICE_ROLE_KEY</span>.
        </div>
      )}

      {!users || users.length === 0 ? (
        <EmptyState title="Brak użytkowników" />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-foreground/50">
              <tr>
                <th className="px-4 py-3 font-medium">Użytkownik</th>
                <th className="px-4 py-3 font-medium">Rola</th>
                <th className="px-4 py-3 font-medium">Firma</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <div className="font-medium">{u.full_name ?? "—"}</div>
                    <div className="text-xs text-foreground/50">{u.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    {u.role === "admin" ? (
                      <Badge tone="red">Administrator</Badge>
                    ) : (
                      <Badge>Klient</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-foreground/70">
                    {(u.client_id && clientName.get(u.client_id)) ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/uzytkownicy/${u.id}`}
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
