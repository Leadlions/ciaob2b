import { PageHeader } from "@/components/ui";
import { ClientForm } from "@/components/client-form";

export default function NewClientPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Nowy klient"
        description="Dodaj kartotekę firmy."
      />
      <ClientForm />
    </div>
  );
}
