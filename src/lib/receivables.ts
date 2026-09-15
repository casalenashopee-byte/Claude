import { prisma } from "./prisma";

/**
 * Promove vendas pendentes vencidas para ATRASADO. Chamado sob demanda (não
 * há job agendado no self-host) sempre que a tela de Contas a Receber ou o
 * Dashboard são abertos — é barato e mantém o status sempre correto.
 */
export async function syncOverdueSales(userId: string) {
  await prisma.sale.updateMany({
    where: {
      userId,
      status: "PENDENTE",
      receiptType: "APRAZO",
      dueDate: { lt: new Date() },
    },
    data: { status: "ATRASADO" },
  });
}
