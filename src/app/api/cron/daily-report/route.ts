import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateDailyReports } from "@/lib/reports";
import { sendReportEmail } from "@/lib/email";
import { getCutoffHour } from "@/lib/settings";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

function warsawHour(): number {
  return Number(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Warsaw",
      hour: "2-digit",
      hour12: false,
    }).format(new Date()),
  );
}

// Jutro wg czasu Europe/Warsaw, format YYYY-MM-DD.
function tomorrowWarsaw(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Warsaw",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date()); // YYYY-MM-DD (dzisiaj w Warszawie)
  const d = new Date(`${parts}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

async function handle(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const url = new URL(req.url);
  const provided =
    req.headers.get("authorization")?.replace("Bearer ", "") ??
    url.searchParams.get("secret");

  if (!secret || provided !== secret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const test = url.searchParams.get("test") === "1";

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );

    // Wysyłamy tylko o godzinie granicznej (czasu polskiego). Cron odpala co godzinę
    // o :30 — strażnik decyduje, kiedy faktycznie wysłać. Tryb test pomija strażnik.
    const cutoff = await getCutoffHour(supabase);
    if (!test && warsawHour() !== cutoff) {
      return NextResponse.json({ skipped: true, warsawHour: warsawHour(), cutoff });
    }

    const dateStr = url.searchParams.get("date") ?? tomorrowWarsaw();
    const reports = await generateDailyReports(supabase, dateStr);

    // Podgląd/pobranie konkretnego raportu (bez wysyłki maila).
    const download = url.searchParams.get("download");
    if (download === "wz" || download === "prod") {
      const pdf = download === "wz" ? reports.wzPdf : reports.prodPdf;
      return new NextResponse(Buffer.from(pdf), {
        headers: {
          "content-type": "application/pdf",
          "content-disposition": `inline; filename="${download}_${dateStr}.pdf"`,
        },
      });
    }

    await sendReportEmail(reports);
    return NextResponse.json({
      ok: true,
      date: dateStr,
      orders: reports.orderCount,
      products: reports.productLineCount,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Błąd raportu" },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  return handle(req);
}
export async function POST(req: NextRequest) {
  return handle(req);
}
