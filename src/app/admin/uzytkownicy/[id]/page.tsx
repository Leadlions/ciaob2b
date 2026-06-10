import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, Card, Field, Select, btnSecondary } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";
import { updateUser } from "../actions";

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: user } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, client_id")
    .eq("id", id)
    .single();

  if (!user) notFound();

  const { data: clients } = await supabase
    .from("clients")
    .select("id, name")
    .order("name");

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Edycja użytkownika"
        description={user.full_name ?? user.email ?? ""}
      />

      <form action={updateUser} className="space-y-5">
        <input type="hidden" name="id" value={user.id} />

        <Card className="space-y-4">
          <div className="text-sm">
            <span className="text-foreground/50">E-mail: </span>
            <span className="font-medium">{user.email}</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Rola" htmlFor="role">
              <Select id="role" name="role" defaultValue={user.role}>
                <option value="client">Klient</option>
                <option value="admin">Administrator</option>
              </Select>
            </Field>

            <Field
              label="Przypisana firma"
              htmlFor="client_id"
              hint="Wymagane dla roli Klient"
            >
              <Select
                id="client_id"
                name="client_id"
                defaultValue={user.client_id ?? ""}
              >
                <option value="">— brak —</option>
                {(clients ?? []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        </Card>

        <div className="flex gap-3">
          <SubmitButton>Zapisz zmiany</SubmitButton>
          <Link href="/admin/uzytkownicy" className={btnSecondary}>
            Anuluj
          </Link>
        </div>
      </form>
    </div>
  );
}
