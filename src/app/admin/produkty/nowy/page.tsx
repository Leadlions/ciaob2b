import { PageHeader } from "@/components/ui";
import { ProductForm } from "@/components/product-form";

export default function NewProductPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Nowy produkt"
        description="Dodaj produkt do katalogu."
      />
      <ProductForm />
    </div>
  );
}
