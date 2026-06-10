"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";

// Delikatne pojawianie się treści przy każdej zmianie trasy.
export function FadeIn({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="ciao-fade-in">
      {children}
    </div>
  );
}
