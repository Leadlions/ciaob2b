import { createClient } from "@/lib/supabase/server";
import { getCutoffHour, getReportEmails } from "@/lib/settings";
import { Card, PageHeader } from "@/components/ui";
import { IconSettings } from "@/components/icons";
import { SettingsForm } from "@/components/settings-form";

export default async function SettingsPage() {
  const supabase = await createClient();
  const cutoff = await getCutoffHour(supabase);
  const emails = await getReportEmails(supabase);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        icon={<IconSettings />}
        title="Ustawienia"
        description="Reguły działania portalu."
      />
      <Card>
        <SettingsForm
          cutoff={cutoff}
          emailWz={emails.wz ?? ""}
          emailProd={emails.prod ?? ""}
        />
      </Card>
    </div>
  );
}
