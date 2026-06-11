import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dołącz pliki fontów do funkcji generującej raporty PDF (Vercel).
  outputFileTracingIncludes: {
    "/api/cron/daily-report": ["./src/fonts/**"],
  },
};

export default nextConfig;
