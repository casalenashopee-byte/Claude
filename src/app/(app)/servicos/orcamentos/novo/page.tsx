import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { PageHeader } from "@/components/ui/PageHeader";
import { createQuoteAction } from "@/actions/quotes";
import { QuoteForm } from "./QuoteForm";

export default async function NovoOrcamentoPage() {
  const user = await requireUser();
  const customers = await prisma.customer.findMany({
    where: { userId: user.id },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <PageHeader eyebrow="Serviços" title="Novo orçamento" />
      <QuoteForm action={createQuoteAction} customers={customers} />
    </div>
  );
}
