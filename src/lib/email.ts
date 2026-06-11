import type { DailyReports } from "./reports";
import type { ReportEmails } from "./settings";
import { formatDate } from "./constants";

type SendResult = { wzSent: string[]; prodSent: string[]; skipped: string[] };

function recipients(value: string | null | undefined): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

async function sendOne(
  apiKey: string,
  from: string,
  to: string[],
  subject: string,
  text: string,
  filename: string,
  pdf: Uint8Array,
): Promise<void> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject,
      text,
      attachments: [
        { filename, content: Buffer.from(pdf).toString("base64") },
      ],
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend błąd ${res.status}: ${body}`);
  }
}

// Wysyła raporty dzienne dwoma osobnymi mailami:
//  • WZ        → adres ustawiony w panelu (report_email_wz), fallback REPORT_TO
//  • Produkcja → adres ustawiony w panelu (report_email_prod), fallback REPORT_TO
// Jeśli dla danego raportu nie ma żadnego adresu, ten mail jest pomijany.
export async function sendReportEmail(
  reports: DailyReports,
  emails?: ReportEmails,
): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("Brak RESEND_API_KEY w zmiennych środowiskowych.");
  }
  const from =
    process.env.REPORT_FROM ?? "ciao manufaktura <onboarding@resend.dev>";
  const fallback = recipients(process.env.REPORT_TO);

  const wzTo = emails?.wz ? recipients(emails.wz) : fallback;
  const prodTo = emails?.prod ? recipients(emails.prod) : fallback;

  const d = formatDate(reports.dateStr);
  const result: SendResult = { wzSent: [], prodSent: [], skipped: [] };

  if (wzTo.length) {
    await sendOne(
      apiKey,
      from,
      wzTo,
      `ciao — WZ na ${d}`,
      `Dzień dobry,\n\n` +
        `w załączniku zbiorczy raport WZ na dzień ${d} (${reports.orderCount} zamówień).\n\n` +
        `Wiadomość wygenerowana automatycznie przez panel ciao.`,
      `WZ_${reports.dateStr}.pdf`,
      reports.wzPdf,
    );
    result.wzSent = wzTo;
  } else {
    result.skipped.push("WZ (brak adresu)");
  }

  if (prodTo.length) {
    await sendOne(
      apiKey,
      from,
      prodTo,
      `ciao — produkcja na ${d}`,
      `Dzień dobry,\n\n` +
        `w załączniku raport produkcji na dzień ${d} ` +
        `(${reports.productLineCount} pozycji do wyprodukowania).\n\n` +
        `Wiadomość wygenerowana automatycznie przez panel ciao.`,
      `Produkcja_${reports.dateStr}.pdf`,
      reports.prodPdf,
    );
    result.prodSent = prodTo;
  } else {
    result.skipped.push("Produkcja (brak adresu)");
  }

  return result;
}
