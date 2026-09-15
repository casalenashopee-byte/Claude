import { requireUser } from "@/lib/session";
import { PageHeader } from "@/components/ui/PageHeader";
import { LinkButton } from "@/components/ui/Button";
import { StatCard, StatGrid } from "@/components/ui/StatCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { PeriodFilter } from "@/components/PeriodFilter";
import { Badge } from "@/components/ui/Badge";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { deleteCashEntryAction } from "@/actions/cashEntries";
import { getCashFlow } from "@/lib/cashflow";
import { formatBRL } from "@/lib/calc";
import { rangeFromPeriod, type PeriodKey } from "@/lib/dateRange";

const sourceLabel = { venda: "Venda", gasto: "Gasto", manual: "Lançamento" } as const;

export default async function FluxoCaixaPage({
  searchParams,
}: {
  searchParams: Promise<{ p?: string }>;
}) {
  const { p = "30d" } = await searchParams;
  const period = (p as PeriodKey) || "30d";
  const { start, end } = rangeFromPeriod(period);

  const user = await requireUser();
  const { rows, totals } = await getCashFlow(user.id, start, end);

  return (
    <div>
      <PageHeader
        eyebrow="Financeiro"
        title="Fluxo de caixa"
        description="Extrato de entradas e saídas, com lançamentos manuais."
        action={<LinkButton href="/financeiro/caixa/novo">Novo lançamento</LinkButton>}
      />

      <div className="mb-4">
        <PeriodFilter basePath="/financeiro/caixa" current={period} />
      </div>

      <StatGrid>
        <StatCard label="Entradas" value={formatBRL(totals.entradas)} tone="brand" />
        <StatCard label="Saídas" value={formatBRL(totals.saidas)} tone="danger" />
        <StatCard
          label="Saldo no período"
          value={formatBRL(totals.saldo)}
          tone={totals.saldo >= 0 ? "brand" : "danger"}
        />
        <StatCard label="Lançamentos" value={String(rows.length)} />
      </StatGrid>

      <div className="mt-6">
        {rows.length === 0 ? (
          <EmptyState
            title="Nenhuma movimentação neste período"
            description="Vendas pagas, gastos e lançamentos manuais aparecem aqui automaticamente."
            actionLabel="Novo lançamento manual"
            actionHref="/financeiro/caixa/novo"
          />
        ) : (
          <div className="rounded-2xl border border-border bg-surface overflow-hidden overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-muted text-left text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Data</th>
                  <th className="px-4 py-3 font-medium">Descrição</th>
                  <th className="px-4 py-3 font-medium">Categoria</th>
                  <th className="px-4 py-3 font-medium">Origem</th>
                  <th className="px-4 py-3 font-medium">Valor</th>
                  <th className="px-4 py-3 font-medium w-16"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={`${r.source}-${r.id}`} className="border-t border-border">
                    <td className="px-4 py-3 text-muted">{r.date.toLocaleDateString("pt-BR")}</td>
                    <td className="px-4 py-3">{r.description || "—"}</td>
                    <td className="px-4 py-3 text-muted">{r.category || "—"}</td>
                    <td className="px-4 py-3">
                      <Badge tone="neutral">{sourceLabel[r.source]}</Badge>
                    </td>
                    <td className={r.type === "ENTRADA" ? "px-4 py-3 font-medium text-brand-strong" : "px-4 py-3 font-medium text-danger"}>
                      {r.type === "ENTRADA" ? "+" : "-"} {formatBRL(r.amount)}
                    </td>
                    <td className="px-4 py-3">
                      {r.source === "manual" && (
                        <DeleteButton action={deleteCashEntryAction} id={r.id} />
                      )}
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
