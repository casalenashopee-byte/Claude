import { prisma } from "./prisma";
import { round2 } from "./calc";

export type LedgerRow = {
  id: string;
  date: Date;
  type: "ENTRADA" | "SAIDA";
  amount: number;
  category: string | null;
  description: string | null;
  source: "venda" | "gasto" | "manual";
};

/**
 * Consolida vendas pagas + gastos + lançamentos manuais em um único extrato.
 * Espelha o "toggle mestre" do produto original: só lançamentos manuais com
 * `movesCash=true` entram no saldo de caixa; vendas e gastos sempre entram.
 */
export async function getCashFlow(userId: string, start: Date, end: Date) {
  const [sales, expenses, entries] = await Promise.all([
    prisma.sale.findMany({
      where: { userId, status: "PAGO", createdAt: { gte: start, lte: end } },
      include: { channel: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.expense.findMany({
      where: { userId, date: { gte: start, lte: end } },
      orderBy: { date: "desc" },
    }),
    prisma.cashEntry.findMany({
      where: { userId, date: { gte: start, lte: end } },
      orderBy: { date: "desc" },
    }),
  ]);

  const rows: LedgerRow[] = [
    ...sales.map((s) => ({
      id: s.id,
      date: s.createdAt,
      type: "ENTRADA" as const,
      amount: s.totalCharged,
      category: s.channel.name,
      description: `Venda${s.customerName ? ` — ${s.customerName}` : ""}`,
      source: "venda" as const,
    })),
    ...expenses.map((e) => ({
      id: e.id,
      date: e.date,
      type: "SAIDA" as const,
      amount: e.amount,
      category: e.category,
      description: e.description,
      source: "gasto" as const,
    })),
    ...entries.map((c) => ({
      id: c.id,
      date: c.date,
      type: c.type,
      amount: c.amount,
      category: c.category,
      description: c.description,
      source: "manual" as const,
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  const cashRows = rows.filter((r) => {
    const entry = entries.find((e) => e.id === r.id && r.source === "manual");
    return r.source !== "manual" || entry?.movesCash;
  });

  const entradas = round2(cashRows.filter((r) => r.type === "ENTRADA").reduce((s, r) => s + r.amount, 0));
  const saidas = round2(cashRows.filter((r) => r.type === "SAIDA").reduce((s, r) => s + r.amount, 0));

  return { rows, totals: { entradas, saidas, saldo: round2(entradas - saidas) } };
}

/**
 * Saldo de caixa acumulado desde sempre (não só do período) — usado como
 * proxy de "dinheiro disponível" no Analytics (liquidez operacional).
 */
export async function getCashOnHand(userId: string) {
  const [salesSum, expensesSum, entriesIn, entriesOut] = await Promise.all([
    prisma.sale.aggregate({ where: { userId, status: "PAGO" }, _sum: { totalCharged: true } }),
    prisma.expense.aggregate({ where: { userId }, _sum: { amount: true } }),
    prisma.cashEntry.aggregate({
      where: { userId, type: "ENTRADA", movesCash: true },
      _sum: { amount: true },
    }),
    prisma.cashEntry.aggregate({
      where: { userId, type: "SAIDA", movesCash: true },
      _sum: { amount: true },
    }),
  ]);

  const entradas = round2((salesSum._sum.totalCharged || 0) + (entriesIn._sum.amount || 0));
  const saidas = round2((expensesSum._sum.amount || 0) + (entriesOut._sum.amount || 0));
  return round2(entradas - saidas);
}
