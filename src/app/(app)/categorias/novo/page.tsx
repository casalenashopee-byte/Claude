import { PageHeader } from "@/components/ui/PageHeader";
import { createCategoryAction } from "@/actions/categories";
import { CategoryForm } from "../CategoryForm";

export default function NovaCategoriaPage() {
  return (
    <div>
      <PageHeader eyebrow="Cadastro" title="Nova categoria" />
      <CategoryForm action={createCategoryAction} />
    </div>
  );
}
