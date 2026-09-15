import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { PageHeader } from "@/components/ui/PageHeader";
import { LinkButton } from "@/components/ui/Button";
import { StatCard, StatGrid } from "@/components/ui/StatCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { PeriodFilter } from "@/components/PeriodFilter";
import { deleteExpenseAction } from "@/actions/expenses";
import { formatBRL, round2 } from "@/lib/calc";
import { rangeFromPeriod, type PeriodKey } from "@/lib/dateRange";

export default async function GastosPage({
  searchParams,
}: {
  searchParams: Promise<{ p?: string }>;
}) {
  const { p = "30d" } = await searchParams;
  const period = (p as PeriodKey) || "30d";
  const { start, end } = rangeFromPeriod(period);

  const user = await requireUser();
  const expenses = await prisma.expense.findMany({
    where: { userId: user.id, date: { gte: start, lte: end } },
    orderBy: { date: "desc" },
  });

  const total = round2(expenses.reduce((s, e) => s + e.amount, 0));
  const byCategory = new Map<string, number>();
  for (const e of expenses) {
    byCategory.set(e.category, round2((byCategory.get(e.category) || 0) + e.amount));
  }
  const topCategory = [...byCategory.entries()].sort((a, b) => b[1] - a[1])[0];
  const average = expenses.length ? round2(total / expenses.length) : 0;

  return (
    <div>
      <PageHeader
        eyebrow="Financeiro"
        title="Gastos"
        description="Despesas operacionais — separadas do custo de mercadoria (aluguel, tráfego, frete…)."
        action={<LinkButton href="/financeiro/gastos/novo">Novo gasto</LinkButton>}
      />

      <div className="mb-4">
        <PeriodFilter basePath="/financeiro/gastos" current={period} />
      </div>

      <StatGrid>
        <StatCard label="Total" value={formatBRL(total)} tone="danger" />
        <StatCard label="Lançamentos" value={String(expenses.length)} />
        <StatCard label="Maior categoria" value={topCategory?.[0] || "—"} />
        <StatCard label="Média por gasto" value={formatBRL(average)} />
      </StatGrid>

      <div className="mt-6">
        {expenses.length === 0 ? (
          <EmptyState
            title="Nenhum gasto neste período"
            description="Registre despesas operacionais para ver o custo real do seu negócio."
            actionLabel="Registrar gasto"
            actionHref="/financeiro/gastos/novo"
          />
        ) : (
          <div className="rounded-2xl border border-border bg-surface overflow-hidden overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-muted text-left text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Data</th>
                  <th className="px-4 py-3 font-medium">Categoria</th>
                  <th className="px-4 py-3 font-medium">Descrição</th>
                  <th className="px-4 py-3 font-medium">Valor</th>
                  <th className="px-4 py-3 font-medium w-16"></th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((e) => (
                  <tr key={e.id} className="border-t border-border">
                    <td className="px-4 py-3 text-muted">{e.date.toLocaleDateString("pt-BR")}</td>
                    <td className="px-4 py-3 font-medium">{e.category}</td>
                    <td className="px-4 py-3 text-muted">{e.description || "—"}</td>
                    <td className="px-4 py-3 font-medium text-danger">{formatBRL(e.amount)}</td>
                    <td className="px-4 py-3">
                      <DeleteButton action={deleteExpenseAction} id={e.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
