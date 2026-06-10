import { createClient } from "@/lib/supabase/server";
import { hasServiceRole } from "@/lib/supabase/admin";
import { PageHeader } from "@/components/ui";
import { UserCreateForm } from "@/components/user-create-form";

export default async function NewUserPage() {
  if (!hasServiceRole()) {
    return (
      <div className="mx-auto max-w-5xl">
        <PageHeader title="Nowy użytkownik" />
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Tworzenie kont wymaga klucza serwisowego{" "}
          <span className="font-mono">SUPABASE_SERVICE_ROLE_KEY</span> w pliku{" "}
          <span className="font-mono">.env.local</span>.
        </div>
      </div>
    );
  }

  const supabase = await createClient();
  const { data: clients } = await supabase
    .from("clients")
    .select("id, name")
    .eq("is_active", true)
    .order("name");

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Nowy użytkownik"
        description="Tworzy konto z hasłem tymczasowym, które przekażesz użytkownikowi."
      />
      <UserCreateForm clients={clients ?? []} />
    </div>
  );
}
