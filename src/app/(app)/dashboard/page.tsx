import Link from "next/link";
import { requireUser } from "@/lib/session";
import { PageHeader } from "@/components/ui/PageHeader";
import { LinkButton } from "@/components/ui/Button";
import { StatCard, StatGrid } from "@/components/ui/StatCard";
import { Card, CardTitle } from "@/components/ui/Card";
import { PeriodFilter } from "@/components/PeriodFilter";
import { PrimeirosPassos } from "@/components/dashboard/PrimeirosPassos";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { Icon } from "@/components/ui/Icon";
import { getDashboardData } from "@/lib/dashboard";
import { formatBRL, formatPct } from "@/lib/calc";
import { periodLabel, type PeriodKey } from "@/lib/dateRange";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ p?: string }>;
}) {
  const { p = "30d" } = await searchParams;
  const period = (p as PeriodKey) || "30d";

  const user = await requireUser();
  const data = await getDashboardData(user.id, period);

  return (
    <div>
      <PageHeader
        eyebrow="Menu principal"
        title="Dashboard"
        description={`Painel de métricas — ${periodLabel(period)}.`}
        action={<LinkButton href="/vendas/nova">Nova venda</LinkButton>}
      />

      <PrimeirosPassos steps={data.steps} />

      {data.overdueCount > 0 && (
        <Link
          href="/financeiro/receber"
          className="mb-6 flex items-center justify-between gap-3 rounded-2xl border border-danger/30 bg-danger-soft px-4 py-3 text-sm hover:brightness-95"
        >
          <span className="flex items-center gap-2 font-medium text-danger">
            <Icon name="AlertTriangle" size={16} />
            {data.overdueCount} {data.overdueCount === 1 ? "conta atrasada" : "contas atrasadas"} ·{" "}
            {formatBRL(data.totalOverdue)}
          </span>
          <span className="text-danger/80">Ver contas a receber →</span>
        </Link>
      )}

      <div className="mb-4">
        <PeriodFilter basePath="/dashboard" current={period} />
      </div>

      <StatGrid>
        <StatCard
          label="Lucro líquido"
          value={formatBRL(data.metrics.lucroLiquido)}
          tone={data.metrics.lucroLiquido >= 0 ? "brand" : "danger"}
        />
        <StatCard label="Total em vendas" value={formatBRL(data.metrics.totalVendas)} />
        <StatCard label="Qtd. vendida" value={String(data.metrics.qtdVendida)} />
        <StatCard label="Margem" value={formatPct(data.metrics.margem)} />
      </StatGrid>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardTitle eyebrow="Evolução" title="Receita & lucro" />
          {data.daily.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <p className="text-sm text-muted">Nenhuma venda registrada neste período ainda.</p>
              <LinkButton href="/vendas/nova">Nova venda</LinkButton>
            </div>
          ) : (
            <RevenueChart data={data.daily} />
          )}
        </Card>

        <Card>
          <CardTitle title="Resumo do período" />
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">A receber (pendente)</span>
              <Link href="/financeiro/receber" className="font-medium hover:underline">
                {formatBRL(data.totalPendingReceivable)}
              </Link>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Estoque baixo</span>
              <Link href="/produtos?f=low" className="font-medium hover:underline">
                {data.lowStock.length} {data.lowStock.length === 1 ? "produto" : "produtos"}
              </Link>
            </div>
            {data.lowStock.length > 0 && (
              <ul className="space-y-1 border-t border-border pt-2">
                {data.lowStock.slice(0, 4).map((p) => (
                  <li key={p.id} className="flex justify-between text-xs text-muted">
                    <span className="truncate">{p.name}</span>
                    <span>
                      {p.stockQty}/{p.lowStockAlert}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardTitle title="Vendas por canal" />
          {data.byChannel.length === 0 ? (
            <p className="text-sm text-muted">Sem dados no período.</p>
          ) : (
            <BarList data={data.byChannel} />
          )}
        </Card>
        <Card>
          <CardTitle title="Vendas por forma de pagamento" />
          {data.byPayment.length === 0 ? (
            <p className="text-sm text-muted">Sem dados no período.</p>
          ) : (
            <BarList data={data.byPayment} />
          )}
        </Card>
      </div>

      <Card className="mt-4">
        <CardTitle
          title="Vendas recentes"
          action={
            <Link href="/vendas" className="text-sm text-brand font-medium hover:underline">
              Ver todas
            </Link>
          }
        />
        {data.recentSales.length === 0 ? (
          <p className="text-sm text-muted">Nenhuma venda ainda.</p>
        ) : (
          <div className="divide-y divide-border">
            {data.recentSales.map((s) => (
              <div key={s.id} className="flex items-center justify-between py-2.5 text-sm">
                <div>
                  <p className="font-medium">{s.customer?.name || s.customerName || "Venda"}</p>
                  <p className="text-xs text-muted">
                    {s.channel.name} · {s.createdAt.toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <p className="font-medium">{formatBRL(s.totalCharged)}</p>
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <GrowthCard
          icon="Smartphone"
          title="Leve no bolso"
          description="Instale como app no seu celular direto pelo navegador."
        />
        <GrowthCard
          icon="Gift"
          title="Indique e ganhe"
          description="Ganhe comissão recorrente indicando outros vendedores."
          href="/marketing/indique"
        />
        <GrowthCard
          icon="MessagesSquare"
          title="Comunidade"
          description="Troque experiências com outros pequenos vendedores."
        />
      </div>
    </div>
  );
}

function BarList({ data }: { data: [string, number][] }) {
  const max = Math.max(...data.map(([, v]) => v), 1);
  return (
    <div className="space-y-2.5">
      {data.map(([label, value]) => (
        <div key={label}>
          <div className="mb-1 flex justify-between text-xs">
            <span className="text-muted">{label}</span>
            <span className="font-medium">{formatBRL(value)}</span>
          </div>
          <div className="h-1.5 rounded-full bg-surface-muted">
            <div
              className="h-1.5 rounded-full bg-brand"
              style={{ width: `${Math.max((value / max) * 100, 4)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function GrowthCard({
  icon,
  title,
  description,
  href,
}: {
  icon: string;
  title: string;
  description: string;
  href?: string;
}) {
  const content = (
    <Card className="h-full">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-soft text-accent">
        <Icon name={icon} size={17} />
      </div>
      <p className="mt-3 text-sm font-semibold">{title}</p>
      <p className="mt-1 text-xs text-muted">{description}</p>
    </Card>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}
