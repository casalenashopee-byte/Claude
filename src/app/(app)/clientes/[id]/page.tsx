import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { PageHeader } from "@/components/ui/PageHeader";
import { updateCustomerAction } from "@/actions/customers";
import { CustomerForm } from "../CustomerForm";

export default async function EditarClientePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  const customer = await prisma.customer.findFirst({ where: { id, userId: user.id } });
  if (!customer) notFound();

  const action = updateCustomerAction.bind(null, id);

  return (
    <div>
      <PageHeader eyebrow="Cadastro" title="Editar cliente" />
      <CustomerForm action={action} defaults={customer} />
    </div>
  );
}
