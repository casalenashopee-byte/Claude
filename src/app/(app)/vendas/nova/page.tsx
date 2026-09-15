import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { createSaleAction } from "@/actions/sales";
import { NewSaleForm } from "./NewSaleForm";

export default async function NovaVendaPage() {
  const user = await requireUser();
  const [products, channels, paymentMethods, customers] = await Promise.all([
    prisma.product.findMany({
      where: { userId: user.id, status: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, retailPrice: true, costPrice: true, unit: true, variations: true },
    }),
    prisma.channel.findMany({ where: { userId: user.id, active: true }, orderBy: { name: "asc" } }),
    prisma.paymentMethod.findMany({ where: { userId: user.id, active: true }, orderBy: { name: "asc" } }),
    prisma.customer.findMany({ where: { userId: user.id }, orderBy: { name: "asc" } }),
  ]);

  if (channels.length === 0 || paymentMethods.length === 0) {
    return (
      <div>
        <PageHeader eyebrow="Menu principal" title="Nova venda" />
        <EmptyState
          title="Configure canais e formas de pagamento antes de vender"
          description="Você precisa de ao menos um canal ativo e uma forma de pagamento ativa para registrar uma venda."
          actionLabel="Ir para Canais"
          actionHref="/canais"
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Menu principal"
        title="Nova venda"
        description="Registre uma venda e veja o lucro calculado em tempo real."
      />
      <NewSaleForm
        action={createSaleAction}
        products={products}
        channels={channels}
        paymentMethods={paymentMethods}
        customers={customers}
      />
    </div>
  );
}
