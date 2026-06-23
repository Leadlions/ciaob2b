import { PageHeader } from "@/components/ui";
import { ProductForm } from "@/components/product-form";
import { createClient } from "@/lib/supabase/server";
import { getCategories } from "@/lib/categories";

export default async function NewProductPage() {
  const supabase = await createClient();
  const categories = await getCategories(supabase);
  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Nowy produkt"
        description="Dodaj produkt do katalogu."
      />
      <ProductForm categories={categories} />
    </div>
  );
}
