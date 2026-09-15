import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { PageHeader } from "@/components/ui/PageHeader";
import { updatePaymentMethodAction } from "@/actions/paymentMethods";
import { PaymentMethodForm } from "../PaymentMethodForm";

export default async function EditarFormaPagamentoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  const method = await prisma.paymentMethod.findFirst({
    where: { id, userId: user.id },
  });
  if (!method) notFound();

  const action = updatePaymentMethodAction.bind(null, id);

  return (
    <div>
      <PageHeader eyebrow="Menu principal" title="Editar forma de pagamento" />
      <PaymentMethodForm action={action} defaults={method} />
    </div>
  );
}
