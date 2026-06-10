"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionProfile } from "@/lib/auth";
import type { Enums } from "@/lib/database.types";

export type CreateUserState = {
  error: string | null;
  createdEmail?: string;
  tempPassword?: string;
};

function generatePassword(): string {
  // Czytelne, mocne hasło tymczasowe: 3 bloki po 4 znaki.
  const part = () => crypto.randomUUID().replace(/-/g, "").slice(0, 4);
  return `ciao-${part()}-${part()}-${part()}`;
}

async function requireAdmin(): Promise<string | null> {
  const { profile } = await getSessionProfile();
  return profile?.role === "admin" ? null : "Brak uprawnień administratora.";
}

export async function createUser(
  _prev: CreateUserState,
  formData: FormData,
): Promise<CreateUserState> {
  const denied = await requireAdmin();
  if (denied) return { error: denied };

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const full_name = String(formData.get("full_name") ?? "").trim() || null;
  const role = String(formData.get("role") ?? "client") as Enums<"user_role">;
  const client_id = (formData.get("client_id") as string) || null;

  if (!email || !email.includes("@"))
    return { error: "Podaj poprawny adres e-mail." };
  if (role === "client" && !client_id)
    return { error: "Klient musi być przypisany do firmy." };

  let admin;
  try {
    admin = createAdminClient();
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Brak klucza serwisowego." };
  }

  const tempPassword = generatePassword();
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: full_name ? { full_name } : undefined,
  });

  if (error) {
    if (error.message.toLowerCase().includes("already"))
      return { error: "Użytkownik z tym adresem e-mail już istnieje." };
    return { error: `Nie udało się utworzyć konta: ${error.message}` };
  }

  const uid = data.user.id;
  const { error: pErr } = await admin
    .from("profiles")
    .update({
      role,
      client_id: role === "admin" ? null : client_id,
      full_name,
      email,
    })
    .eq("id", uid);

  if (pErr)
    return { error: `Konto utworzone, ale nie ustawiono profilu: ${pErr.message}` };

  revalidatePath("/admin/uzytkownicy");
  return { error: null, createdEmail: email, tempPassword };
}

export async function updateUser(formData: FormData) {
  const denied = await requireAdmin();
  if (denied) return;

  const id = String(formData.get("id"));
  const role = String(formData.get("role") ?? "client") as Enums<"user_role">;
  const client_id = (formData.get("client_id") as string) || null;

  const supabase = await createClient();
  await supabase
    .from("profiles")
    .update({ role, client_id: role === "admin" ? null : client_id })
    .eq("id", id);

  revalidatePath("/admin/uzytkownicy");
  revalidatePath(`/admin/uzytkownicy/${id}`);
}
