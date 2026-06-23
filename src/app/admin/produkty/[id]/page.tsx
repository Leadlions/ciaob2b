import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui";
import { ProductForm } from "@/components/product-form";
import { getCategories } from "@/lib/categories";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: product }, categories] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).single(),
    getCategories(supabase),
  ]);

  if (!product) notFound();

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Edycja produktu" description={product.name} />
      <ProductForm product={product} categories={categories} />
    </div>
  );
}
