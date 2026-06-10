import { cookies } from "next/headers";
import { getSessionProfile } from "@/lib/auth";

export const VIEW_AS_COOKIE = "ciao_view_as";

// Zwraca "efektywną firmę": dla klienta jego własną, dla admina wybraną w podglądzie.
export async function getEffectiveClientId(): Promise<{
  clientId: string | null;
  isAdmin: boolean;
}> {
  const { profile } = await getSessionProfile();
  if (profile?.role === "admin") {
    const c = (await cookies()).get(VIEW_AS_COOKIE)?.value || null;
    return { clientId: c, isAdmin: true };
  }
  return { clientId: profile?.client_id ?? null, isAdmin: false };
}
