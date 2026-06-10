import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getSessionProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/app-shell";
import { AdminPreviewBar } from "@/components/admin-preview-bar";
import { VIEW_AS_COOKIE } from "@/lib/view-as";
import type { NavItem } from "@/components/sidebar";

const NAV: NavItem[] = [
  { label: "Pulpit", href: "/panel", ready: true, icon: "dashboard" },
  { label: "Katalog", href: "/panel/katalog", ready: true, icon: "catalog" },
  { label: "Zamówienia", href: "/panel/zamowienia", ready: true, icon: "cart" },
  { label: "Dokumenty WZ", href: "/panel/dokumenty", ready: true, icon: "doc" },
  { label: "Faktury", href: "/panel/faktury", icon: "invoice" },
];

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile } = await getSessionProfile();
  if (!user) redirect("/login");

  const isAdmin = profile?.role === "admin";

  let preview = null;
  if (isAdmin) {
    const supabase = await createClient();
    const { data: clients } = await supabase
      .from("clients")
      .select("id, name")
      .order("name");
    const current = (await cookies()).get(VIEW_AS_COOKIE)?.value || "";
    preview = <AdminPreviewBar clients={clients ?? []} current={current} />;
  }

  return (
    <AppShell
      items={NAV}
      panelLabel={isAdmin ? "Podgląd" : "Klient"}
      userEmail={profile?.email ?? null}
    >
      {preview}
      {children}
    </AppShell>
  );
}
