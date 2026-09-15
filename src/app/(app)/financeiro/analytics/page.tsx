import { requireUser } from "@/lib/session";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardTitle } from "@/components/ui/Card";
import { PeriodFilter } from "@/components/PeriodFilter";
import { getAnalytics } from "@/lib/analytics";
import { formatBRL, formatPct } from "@/lib/calc";
import { type PeriodKey } from "@/lib/dateRange";

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between border-t border-border py-2 first:border-t-0 first:pt-0">
      <span className="text-sm text-muted">{label}</span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}

function Delta({ value }: { value: number | null }) {
  if (value === null) return <span className="text-muted">—</span>;
  const positive = value >= 0;
  return (
    <span className={positive ? "text-brand-strong" : "text-danger"}>
      {positive ? "+" : ""}
      {value.toFixed(1)}%
    </span>
  );
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ p?: string }>;
}) {
  const { p = "30d" } = await searchParams;
  const period = (p as PeriodKey) || "30d";
  const user = await requireUser();
  const a = await getAnalytics(user.id, period);

  return (
    <div>
      <PageHeader
        eyebrow="Financeiro"
        title="Analytics"
        description="Indicadores de eficiência, giro, rentabilidade e liquidez — não só gráficos de vaidade."
      />

      <div className="mb-4">
        <PeriodFilter basePath="/financeiro/analytics" current={period} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardTitle title="Eficiência" />
          <Metric label="Margem bruta" value={formatPct(a.eficiencia.margemBruta)} />
          <Metric label="Margem após taxas" value={formatPct(a.eficiencia.margemAposTaxas)} />
          <Metric label="Margem operacional" value={formatPct(a.eficiencia.margemOperacional)} />
          <Metric label="Margem líquida" value={formatPct(a.eficiencia.margemLiquida)} />
          <Metric label="CMV % da receita" value={formatPct(a.eficiencia.cmvPctReceita)} />
          <Metric label="Despesas % da receita" value={formatPct(a.eficiencia.despesasPctReceita)} />
          <Metric label="Taxas % da receita" value={formatPct(a.eficiencia.taxasPctReceita)} />
        </Card>

        <Card>
          <CardTitle title="Giro & ciclo" />
          <Metric label="Giro de estoque" value={a.giroCiclo.giro.toFixed(2) + "x"} />
          <Metric label="Dias de estoque" value={`${a.giroCiclo.diasEstoque} dias`} />
          <Metric label="Dias de recebimento" value={`${a.giroCiclo.diasRecebimento} dias`} />
          <Metric label="Ciclo de caixa" value={`${a.giroCiclo.cicloCaixa} dias`} />
        </Card>

        <Card>
          <CardTitle title="Rentabilidade & liquidez" />
          <Metric
            label="Retorno sobre capital operacional"
            value={formatPct(a.rentabilidadeLiquidez.retornoCapitalOperacional)}
          />
          <Metric label="Retorno sobre estoque" value={formatPct(a.rentabilidadeLiquidez.retornoEstoque)} />
          <Metric label="Liquidez operacional" value={a.rentabilidadeLiquidez.liquidezOperacional.toFixed(2)} />
          <Metric label="A receber / receita" value={formatPct(a.rentabilidadeLiquidez.liquidezReceber)} />
          <Metric
            label="Cobertura de despesas"
            value={a.rentabilidadeLiquidez.coberturaDespesas.toFixed(2) + "x"}
          />
        </Card>

        <Card>
          <CardTitle title="Crescimento" hint="vs. período anterior de mesma duração" />
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-xs text-muted mb-1">Δ Receita</p>
              <Delta value={a.crescimento.deltaReceita} />
            </div>
            <div>
              <p className="text-xs text-muted mb-1">Δ Lucro</p>
              <Delta value={a.crescimento.deltaLucro} />
            </div>
            <div>
              <p className="text-xs text-muted mb-1">Δ Margem líquida</p>
              <Delta value={a.crescimento.deltaMargem} />
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Card>
          <CardTitle title="Top produtos" />
          {a.topProducts.length === 0 ? (
            <p className="text-sm text-muted">Sem vendas no período.</p>
          ) : (
            <div className="space-y-2">
              {a.topProducts.map((p) => (
                <div key={p.name} className="flex justify-between text-sm">
                  <span className="truncate">{p.name}</span>
                  <span className="font-medium">{formatBRL(p.total)}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardTitle title="Distribuição por categoria" />
          {a.categoryDistribution.length === 0 ? (
            <p className="text-sm text-muted">Sem vendas no período.</p>
          ) : (
            <div className="space-y-2">
              {a.categoryDistribution.map(([name, total]) => (
                <div key={name} className="flex justify-between text-sm">
                  <span className="truncate">{name}</span>
                  <span className="font-medium">{formatBRL(total)}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardTitle title="Ticket médio & projeção" />
          <Metric label="Ticket médio" value={formatBRL(a.ticketMedio)} />
          <Metric label="Média diária de receita" value={formatBRL(a.dailyAvg)} />
          <Metric label="Projeção (30 dias no ritmo atual)" value={formatBRL(a.projecaoMensal)} />
        </Card>

        <Card>
          <CardTitle title="Sazonalidade semanal" />
          <p className="text-sm text-muted">
            Melhor dia de vendas no período: <strong className="text-foreground">{a.bestWeekday}</strong>
          </p>
        </Card>
      </div>
    </div>
  );
}
