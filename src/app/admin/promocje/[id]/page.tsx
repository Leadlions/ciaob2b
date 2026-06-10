import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui";
import { PromotionForm } from "@/components/promotion-form";

export default async function EditPromotionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: promotion }, { data: products }] = await Promise.all([
    supabase.from("promotions").select("*").eq("id", id).single(),
    supabase.from("products").select("id, name").order("name"),
  ]);

  if (!promotion) notFound();

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Edycja promocji" />
      <PromotionForm products={products ?? []} promotion={promotion} />
    </div>
  );
}
