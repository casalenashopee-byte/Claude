import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { PageHeader } from "@/components/ui/PageHeader";
import { updateSupplierAction } from "@/actions/suppliers";
import { SupplierForm } from "../SupplierForm";

export default async function EditarFornecedorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  const supplier = await prisma.supplier.findFirst({ where: { id, userId: user.id } });
  if (!supplier) notFound();

  const action = updateSupplierAction.bind(null, id);

  return (
    <div>
      <PageHeader eyebrow="Cadastro" title="Editar fornecedor" />
      <SupplierForm action={action} defaults={supplier} />
    </div>
  );
}
