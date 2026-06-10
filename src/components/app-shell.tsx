import { ReactNode } from "react";
import { Logo } from "./logo";
import { Sidebar, type NavItem } from "./sidebar";
import { SignOutButton } from "./sign-out-button";

export function AppShell({
  items,
  panelLabel,
  userEmail,
  children,
}: {
  items: NavItem[];
  panelLabel: string;
  userEmail: string | null;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="shrink-0 border-b border-border bg-surface md:w-64 md:border-b-0 md:border-r">
        <div className="flex items-center gap-2 px-5 py-4">
          <Logo className="h-8 w-auto" />
          <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-dark">
            {panelLabel}
          </span>
        </div>
        <div className="px-3 pb-4">
          <Sidebar items={items} />
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-end gap-3 border-b border-border bg-surface px-6 py-3">
          {userEmail && (
            <span className="hidden text-sm text-foreground/60 sm:inline">
              {userEmail}
            </span>
          )}
          <SignOutButton />
        </header>
        <main className="flex-1 p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
