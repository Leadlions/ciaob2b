import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth";
import { generateDailyReports } from "@/lib/reports";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

const FILE_LABEL: Record<string, string> = {
  wz: "WZ",
  prod: "Produkcja",
  sales: "Sprzedaz",
};

export async function GET(req: NextRequest) {
  const { profile } = await getSessionProfile();
  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const type = url.searchParams.get("type") ?? "wz";
  const date = url.searchParams.get("date") ?? "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "bad date" }, { status: 400 });
  }
  if (!["wz", "prod", "sales"].includes(type)) {
    return NextResponse.json({ error: "bad type" }, { status: 400 });
  }

  const supabase = await createClient();
  const reports = await generateDailyReports(supabase, date);
  const pdf =
    type === "prod"
      ? reports.prodPdf
      : type === "sales"
        ? reports.salesPdf
        : reports.wzPdf;

  return new NextResponse(Buffer.from(pdf), {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `inline; filename="${FILE_LABEL[type]}_${date}.pdf"`,
    },
  });
}
