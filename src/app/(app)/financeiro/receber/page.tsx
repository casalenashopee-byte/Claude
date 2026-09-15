import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard, StatGrid } from "@/components/ui/StatCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { markSalePaidAction } from "@/actions/sales";
import { formatBRL, round2 } from "@/lib/calc";

export default async function ContasReceberPage() {
  const user = await requireUser();
  const pending = await prisma.sale.findMany({
    where: { userId: user.id, receiptType: "APRAZO", status: { in: ["PENDENTE", "ATRASADO"] } },
    include: { customer: true },
    orderBy: { dueDate: "asc" },
  });

  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);
  const endOfWeek = new Date(startOfToday);
  endOfWeek.setDate(endOfWeek.getDate() + 7);

  const totalPendente = round2(pending.reduce((s, sale) => s + sale.totalCharged, 0));
  const venceEstaSemana = pending.filter(
    (s) => s.dueDate && s.dueDate >= startOfToday && s.dueDate <= endOfWeek
  );
  const atrasados = pending.filter((s) => s.dueDate && s.dueDate < startOfToday);

  const recebidoHoje = await prisma.sale.findMany({
    where: {
      userId: user.id,
      receiptType: "APRAZO",
      status: "PAGO",
      createdAt: { gte: startOfToday, lte: endOfToday },
    },
  });

  return (
    <div>
      <PageHeader
        eyebrow="Financeiro"
        title="Contas a receber"
        description="Vendas a prazo, vencimentos e inadimplência."
      />

      <StatGrid>
        <StatCard label="Total pendente" value={formatBRL(totalPendente)} tone="warning" />
        <StatCard
          label="Recebido hoje"
          value={formatBRL(round2(recebidoHoje.reduce((s, r) => s + r.totalCharged, 0)))}
          tone="brand"
        />
        <StatCard label="Vence esta semana" value={String(venceEstaSemana.length)} />
        <StatCard label="Atrasados" value={String(atrasados.length)} tone={atrasados.length ? "danger" : "default"} />
      </StatGrid>

      <div className="mt-6">
        {pending.length === 0 ? (
          <EmptyState
            title="Nenhuma conta a receber"
            description="Vendas registradas como 'a prazo' aparecem aqui até serem quitadas."
          />
        ) : (
          <div className="rounded-2xl border border-border bg-surface overflow-hidden overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-muted text-left text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Cliente</th>
                  <th className="px-4 py-3 font-medium">Vencimento</th>
                  <th className="px-4 py-3 font-medium">Valor</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium w-32"></th>
                </tr>
              </thead>
              <tbody>
                {pending.map((s) => {
                  const late = s.dueDate && s.dueDate < startOfToday;
                  return (
                    <tr key={s.id} className="border-t border-border">
                      <td className="px-4 py-3 font-medium">
                        {s.customer?.name || s.customerName || "—"}
                      </td>
                      <td className="px-4 py-3 text-muted">
                        {s.dueDate ? s.dueDate.toLocaleDateString("pt-BR") : "—"}
                      </td>
                      <td className="px-4 py-3 font-medium">{formatBRL(s.totalCharged)}</td>
                      <td className="px-4 py-3">
                        <Badge tone={late ? "danger" : "warning"}>
                          {late ? "Atrasado" : "Pendente"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <form action={markSalePaidAction}>
                          <input type="hidden" name="id" value={s.id} />
                          <button
                            type="submit"
                            className="rounded-lg border border-border px-2.5 py-1 text-xs font-medium hover:bg-brand-soft hover:text-brand-strong hover:border-brand"
                          >
                            Marcar como pago
                          </button>
                        </form>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
