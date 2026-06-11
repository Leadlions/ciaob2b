import type { DailyReports } from "./reports";
import { formatDate } from "./constants";

// Wysyła maila z dwoma raportami PDF (WZ + produkcja) przez Resend (HTTP API).
export async function sendReportEmail(reports: DailyReports): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.REPORT_TO;
  const from =
    process.env.REPORT_FROM ?? "ciao manufaktura <onboarding@resend.dev>";

  if (!apiKey || !to) {
    throw new Error("Brak RESEND_API_KEY lub REPORT_TO w zmiennych środowiskowych.");
  }

  const d = formatDate(reports.dateStr);

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: to.split(",").map((s) => s.trim()),
      subject: `ciao — raporty na ${d} (WZ + produkcja)`,
      text:
        `Dzień dobry,\n\n` +
        `w załączniku raporty dotyczące dostaw na dzień ${d}:\n` +
        `• WZ — ${reports.orderCount} zamówień\n` +
        `• Produkcja — ${reports.productLineCount} pozycji do wyprodukowania\n\n` +
        `Wiadomość wygenerowana automatycznie przez panel ciao.`,
      attachments: [
        {
          filename: `WZ_${reports.dateStr}.pdf`,
          content: Buffer.from(reports.wzPdf).toString("base64"),
        },
        {
          filename: `Produkcja_${reports.dateStr}.pdf`,
          content: Buffer.from(reports.prodPdf).toString("base64"),
        },
      ],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend błąd ${res.status}: ${body}`);
  }
}
