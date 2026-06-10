"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ICONS, type IconName } from "./icons";

export type NavItem = {
  label: string;
  href: string;
  ready?: boolean;
  icon?: IconName;
};

export function Sidebar({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-0.5">
      {items.map((item) => {
        const Icon = item.icon ? ICONS[item.icon] : null;
        const active =
          pathname === item.href ||
          (item.href !== "/admin" &&
            item.href !== "/panel" &&
            pathname.startsWith(item.href));

        if (!item.ready) {
          return (
            <span
              key={item.href}
              className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-foreground/35"
            >
              <span className="flex items-center gap-2.5">
                {Icon && <Icon className="shrink-0 opacity-60" />}
                {item.label}
              </span>
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-foreground/40">
                wkrótce
              </span>
            </span>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
              active
                ? "bg-brand-50 text-brand-dark"
                : "text-foreground/70 hover:bg-muted"
            }`}
          >
            {Icon && <Icon className="shrink-0" />}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
