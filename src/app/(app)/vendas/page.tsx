import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { PageHeader } from "@/components/ui/PageHeader";
import { LinkButton } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { Badge } from "@/components/ui/Badge";
import { PeriodFilter } from "@/components/PeriodFilter";
import { Pagination, PAGE_SIZE, paginationSkip } from "@/components/ui/Pagination";
import { deleteSaleAction, markSalePaidAction } from "@/actions/sales";
import { formatBRL } from "@/lib/calc";
import { rangeFromPeriod, type PeriodKey } from "@/lib/dateRange";
import { syncOverdueSales } from "@/lib/receivables";

const statusTone = {
  PAGO: "brand",
  PENDENTE: "warning",
  ATRASADO: "danger",
  CANCELADO: "neutral",
} as const;

export default async function VendasPage({
  searchParams,
}: {
  searchParams: Promise<{ p?: string; page?: string }>;
}) {
  const { p = "30d", page: pageRaw } = await searchParams;
  const period = (p as PeriodKey) || "30d";
  const page = Math.max(parseInt(pageRaw || "1", 10) || 1, 1);
  const { start, end } = rangeFromPeriod(period);

  const user = await requireUser();
  await syncOverdueSales(user.id);

  const where = { userId: user.id, createdAt: { gte: start, lte: end } };
  const [sales, total] = await Promise.all([
    prisma.sale.findMany({
      where,
      include: { channel: true, paymentMethod: true, customer: true },
      orderBy: { createdAt: "desc" },
      skip: paginationSkip(page),
      take: PAGE_SIZE,
    }),
    prisma.sale.count({ where }),
  ]);

  return (
    <div>
      <PageHeader
        eyebrow="Menu principal"
        title="Vendas"
        description="Registro de pedidos com cálculo automático de lucro."
        action={<LinkButton href="/vendas/nova">Nova venda</LinkButton>}
      />

      <div className="mb-4">
        <PeriodFilter basePath="/vendas" current={period} />
      </div>

      {sales.length === 0 ? (
        <EmptyState
          title="Nenhuma venda neste período"
          description="Registre sua primeira venda para começar a acompanhar seu lucro."
          actionLabel="Registrar primeira venda"
          actionHref="/vendas/nova"
        />
      ) : (
        <div className="rounded-2xl border border-border bg-surface overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-muted text-left text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Data</th>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Canal</th>
                <th className="px-4 py-3 font-medium">Pagamento</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Lucro</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium w-24"></th>
              </tr>
            </thead>
            <tbody>
              {sales.map((s) => (
                <tr key={s.id} className="border-t border-border">
                  <td className="px-4 py-3 text-muted">
                    {s.createdAt.toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-4 py-3">{s.customer?.name || s.customerName || "—"}</td>
                  <td className="px-4 py-3 text-muted">{s.channel.name}</td>
                  <td className="px-4 py-3 text-muted">{s.paymentMethod.name}</td>
                  <td className="px-4 py-3 font-medium">{formatBRL(s.totalCharged)}</td>
                  <td className={s.netProfit >= 0 ? "px-4 py-3 text-brand-strong font-medium" : "px-4 py-3 text-danger font-medium"}>
                    {formatBRL(s.netProfit)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={statusTone[s.status]}>{s.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {s.status === "PENDENTE" && (
                        <form action={markSalePaidAction}>
                          <input type="hidden" name="id" value={s.id} />
                          <button
                            type="submit"
                            className="rounded-lg p-1.5 text-muted hover:bg-brand-soft hover:text-brand-strong"
                            title="Marcar como pago"
                          >
                            ✓
                          </button>
                        </form>
                      )}
                      <DeleteButton
                        action={deleteSaleAction}
                        id={s.id}
                        confirmMessage="Excluir esta venda? O estoque dos produtos será devolvido."
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={page} total={total} buildHref={(n) => `/vendas?p=${period}&page=${n}`} />
    </div>
  );
}
