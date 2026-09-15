import { requireUser } from "@/lib/session";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardTitle } from "@/components/ui/Card";
import { PeriodFilter } from "@/components/PeriodFilter";
import { PrintButton } from "@/components/PrintButton";
import { getAnalytics } from "@/lib/analytics";
import { getCashFlow } from "@/lib/cashflow";
import { formatBRL, formatPct } from "@/lib/calc";
import { periodLabel, rangeFromPeriod, type PeriodKey } from "@/lib/dateRange";

export default async function RelatoriosPage({
  searchParams,
}: {
  searchParams: Promise<{ p?: string }>;
}) {
  const { p = "mes" } = await searchParams;
  const period = (p as PeriodKey) || "mes";
  const user = await requireUser();
  const { start, end } = rangeFromPeriod(period);
  const [a, cashflow] = await Promise.all([
    getAnalytics(user.id, period),
    getCashFlow(user.id, start, end),
  ]);

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3 print:hidden">
        <PageHeader
          eyebrow="Financeiro"
          title="Relatórios"
          description="Versão resumida e exportável do Analytics — pronta para enviar ao contador."
        />
        <PrintButton />
      </div>

      <div className="mb-4 print:hidden">
        <PeriodFilter basePath="/financeiro/relatorios" current={period} />
      </div>

      <div className="rounded-2xl border border-border bg-surface p-8 print:border-0 print:p-0">
        <div className="mb-6 border-b border-border pb-4">
          <p className="eyebrow">Relatório financeiro</p>
          <h2 className="font-serif text-2xl font-medium">
            {user.companyName || user.name}
          </h2>
          <p className="text-sm text-muted">
            {periodLabel(period)} · {start.toLocaleDateString("pt-BR")} a{" "}
            {end.toLocaleDateString("pt-BR")}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-8">
          <SummaryStat label="Receita" value={formatBRL(a.revenue)} />
          <SummaryStat label="Lucro líquido" value={formatBRL(a.netProfit)} />
          <SummaryStat label="Margem líquida" value={formatPct(a.eficiencia.margemLiquida)} />
          <SummaryStat label="Ticket médio" value={formatBRL(a.ticketMedio)} />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <Card className="print:border print:border-border">
            <CardTitle title="Fluxo de caixa" />
            <Row label="Entradas" value={formatBRL(cashflow.totals.entradas)} />
            <Row label="Saídas" value={formatBRL(cashflow.totals.saidas)} />
            <Row label="Saldo" value={formatBRL(cashflow.totals.saldo)} />
          </Card>

          <Card className="print:border print:border-border">
            <CardTitle title="Eficiência" />
            <Row label="Margem bruta" value={formatPct(a.eficiencia.margemBruta)} />
            <Row label="CMV % da receita" value={formatPct(a.eficiencia.cmvPctReceita)} />
            <Row label="Despesas % da receita" value={formatPct(a.eficiencia.despesasPctReceita)} />
          </Card>

          <Card className="print:border print:border-border">
            <CardTitle title="Top produtos" />
            {a.topProducts.length === 0 ? (
              <p className="text-sm text-muted">Sem vendas no período.</p>
            ) : (
              a.topProducts.map((p) => <Row key={p.name} label={p.name} value={formatBRL(p.total)} />)
            )}
          </Card>

          <Card className="print:border print:border-border">
            <CardTitle title="Crescimento vs. período anterior" />
            <Row label="Δ Receita" value={a.crescimento.deltaReceita !== null ? `${a.crescimento.deltaReceita}%` : "—"} />
            <Row label="Δ Lucro" value={a.crescimento.deltaLucro !== null ? `${a.crescimento.deltaLucro}%` : "—"} />
            <Row label="Δ Margem líquida" value={`${a.crescimento.deltaMargem} p.p.`} />
          </Card>
        </div>
      </div>
    </div>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-t border-border py-1.5 text-sm first:border-t-0 first:pt-0">
      <span className="text-muted truncate pr-2">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
