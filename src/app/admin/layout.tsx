import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth";
import { AppShell } from "@/components/app-shell";
import type { NavItem } from "@/components/sidebar";

const NAV: NavItem[] = [
  { label: "Pulpit", href: "/admin", ready: true, icon: "dashboard" },
  { label: "Zamówienia", href: "/admin/zamowienia", ready: true, icon: "cart" },
  { label: "Klienci", href: "/admin/klienci", ready: true, icon: "clients" },
  { label: "Użytkownicy", href: "/admin/uzytkownicy", ready: true, icon: "users" },
  { label: "Produkty", href: "/admin/produkty", ready: true, icon: "products" },
  { label: "Promocje", href: "/admin/promocje", ready: true, icon: "promo" },
  { label: "Dokumenty WZ", href: "/admin/dokumenty", ready: true, icon: "doc" },
  { label: "Faktury", href: "/admin/faktury", icon: "invoice" },
  { label: "Raporty", href: "/admin/raporty", icon: "reports" },
  { label: "Podgląd klienta", href: "/panel", ready: true, icon: "eye" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile } = await getSessionProfile();

  if (!user) redirect("/login");
  if (profile?.role !== "admin") redirect("/panel");

  return (
    <AppShell items={NAV} panelLabel="Admin" userEmail={profile?.email ?? null}>
      {children}
    </AppShell>
  );
}
