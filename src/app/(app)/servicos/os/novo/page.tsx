import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { PageHeader } from "@/components/ui/PageHeader";
import { createServiceOrderAction } from "@/actions/serviceOrders";
import { ServiceOrderForm } from "./ServiceOrderForm";

export default async function NovaOSPage() {
  const user = await requireUser();
  const customers = await prisma.customer.findMany({
    where: { userId: user.id },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <PageHeader eyebrow="Serviços" title="Nova ordem de serviço" />
      <ServiceOrderForm action={createServiceOrderAction} customers={customers} />
    </div>
  );
}
