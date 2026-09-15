import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { PageHeader } from "@/components/ui/PageHeader";
import { updateCategoryAction } from "@/actions/categories";
import { CategoryForm } from "../CategoryForm";

export default async function EditarCategoriaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  const category = await prisma.category.findFirst({
    where: { id, userId: user.id },
  });
  if (!category) notFound();

  const action = updateCategoryAction.bind(null, id);

  return (
    <div>
      <PageHeader eyebrow="Cadastro" title="Editar categoria" />
      <CategoryForm action={action} defaultName={category.name} />
    </div>
  );
}
