import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui";
import { PromotionForm } from "@/components/promotion-form";

export default async function NewPromotionPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("id, name")
    .eq("is_active", true)
    .order("name");

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Nowa promocja" description="Czasowa obniżka ceny produktu." />
      <PromotionForm products={products ?? []} />
    </div>
  );
}
