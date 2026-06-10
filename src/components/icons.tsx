import type { SVGProps } from "react";

// Lekki, własny zestaw ikon (styl liniowy). Bez zewnętrznych zależności.
type IconProps = SVGProps<SVGSVGElement>;

function base(props: IconProps) {
  return {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    ...props,
  };
}

export function IconDashboard(p: IconProps) {
  return (
    <svg {...base(p)}>
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  );
}

export function IconCatalog(p: IconProps) {
  return (
    <svg {...base(p)}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

export function IconCart(p: IconProps) {
  return (
    <svg {...base(p)}>
      <circle cx="9" cy="20" r="1" />
      <circle cx="18" cy="20" r="1" />
      <path d="M2 3h2l2.4 12.2a1 1 0 0 0 1 .8h8.8a1 1 0 0 0 1-.8L21 7H5" />
    </svg>
  );
}

export function IconClients(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M3 21V6a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v15" />
      <path d="M12 21V10a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v11" />
      <path d="M6 9h2M6 13h2M16 13h2M16 17h2" />
      <path d="M2 21h20" />
    </svg>
  );
}

export function IconUsers(p: IconProps) {
  return (
    <svg {...base(p)}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20a6 6 0 0 1 12 0" />
      <path d="M16 6a3 3 0 0 1 0 6M18 20a6 6 0 0 0-3-5.2" />
    </svg>
  );
}

export function IconProducts(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M4 21h16v-7H4z" />
      <path d="M5 14c0-2 1.5-3 3.5-3s3.5 1 3.5 3M12 14c0-2 1.5-3 3.5-3s3.5 1 3.5 3" />
      <path d="M12 4v3M10.5 5.5h3" />
    </svg>
  );
}

export function IconPromo(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0l-7.2-7.2A2 2 0 0 1 3 12V4h8a2 2 0 0 1 1.4.6l8.2 8.2a2 2 0 0 1 0 2.6z" />
      <circle cx="7.5" cy="7.5" r="1" />
    </svg>
  );
}

export function IconDoc(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z" />
      <path d="M14 3v5h5M8 13h8M8 17h6" />
    </svg>
  );
}

export function IconInvoice(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M5 21V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v17l-2.5-1.5L14 21l-2-1.5L10 21l-2.5-1.5z" />
      <path d="M9 7h6M9 11h6" />
    </svg>
  );
}

export function IconReports(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M3 3v18h18" />
      <rect x="7" y="12" width="3" height="6" rx="0.5" />
      <rect x="12" y="8" width="3" height="10" rx="0.5" />
      <rect x="17" y="5" width="3" height="13" rx="0.5" />
    </svg>
  );
}

export function IconEye(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export const ICONS = {
  dashboard: IconDashboard,
  eye: IconEye,
  catalog: IconCatalog,
  cart: IconCart,
  clients: IconClients,
  users: IconUsers,
  products: IconProducts,
  promo: IconPromo,
  doc: IconDoc,
  invoice: IconInvoice,
  reports: IconReports,
} as const;

export type IconName = keyof typeof ICONS;
