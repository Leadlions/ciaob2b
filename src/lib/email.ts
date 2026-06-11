import nodemailer from "nodemailer";
import type { DailyReports } from "./reports";
import { formatDate } from "./constants";

// Wysyła maila z dwoma raportami PDF (WZ + produkcja) przez SMTP (dane z env).
export async function sendReportEmail(reports: DailyReports): Promise<void> {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM ?? user;
  const to = process.env.REPORT_TO;

  if (!host || !user || !pass || !to) {
    throw new Error(
      "Brak konfiguracji SMTP (SMTP_HOST/SMTP_USER/SMTP_PASS) lub REPORT_TO.",
    );
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // 465 = SSL, inaczej STARTTLS
    auth: { user, pass },
  });

  const d = formatDate(reports.dateStr);

  await transporter.sendMail({
    from,
    to,
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
        content: Buffer.from(reports.wzPdf),
        contentType: "application/pdf",
      },
      {
        filename: `Produkcja_${reports.dateStr}.pdf`,
        content: Buffer.from(reports.prodPdf),
        contentType: "application/pdf",
      },
    ],
  });
}
