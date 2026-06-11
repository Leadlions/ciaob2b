import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dołącz pliki fontów do funkcji generujących raporty PDF (Vercel).
  outputFileTracingIncludes: {
    "/api/cron/daily-report": ["./src/fonts/**"],
    "/api/reports": ["./src/fonts/**"],
  },
};

export default nextConfig;
