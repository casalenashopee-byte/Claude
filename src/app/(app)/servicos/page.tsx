import Link from "next/link";
import clsx from "clsx";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { PageHeader } from "@/components/ui/PageHeader";
import { LinkButton } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { formatBRL } from "@/lib/calc";
import { deleteQuoteAction, updateQuoteStatusAction } from "@/actions/quotes";
import {
  deleteServiceOrderAction,
  updateServiceOrderStatusAction,
} from "@/actions/serviceOrders";

export default async function ServicosPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab = "orcamentos" } = await searchParams;
  const user = await requireUser();

  const [quotes, orders] = await Promise.all([
    prisma.quote.findMany({
      where: { userId: user.id },
      include: { customer: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.serviceOrder.findMany({
      where: { userId: user.id },
      include: { customer: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div>
      <PageHeader
        eyebrow="Menu principal"
        title="Serviços"
        description="Orçamentos e ordens de serviço para quem cobra por trabalho, não só produto."
        action={
          <LinkButton href={tab === "os" ? "/servicos/os/novo" : "/servicos/orcamentos/novo"}>
            {tab === "os" ? "Nova ordem de serviço" : "Novo orçamento"}
          </LinkButton>
        }
      />

      <div className="mb-4 flex gap-1 rounded-xl border border-border bg-surface-muted p-1 w-fit">
        <Link
          href="/servicos?tab=orcamentos"
          className={clsx(
            "rounded-lg px-3 py-1.5 text-sm font-medium",
            tab !== "os" ? "bg-surface shadow-sm" : "text-muted"
          )}
        >
          Orçamentos
        </Link>
        <Link
          href="/servicos?tab=os"
          className={clsx(
            "rounded-lg px-3 py-1.5 text-sm font-medium",
            tab === "os" ? "bg-surface shadow-sm" : "text-muted"
          )}
        >
          Ordens de serviço
        </Link>
      </div>

      {tab === "os" ? (
        orders.length === 0 ? (
          <EmptyState
            title="Nenhuma ordem de serviço"
            description="Abra uma OS para registrar equipamento, problema relatado e itens do serviço."
            actionLabel="Criar OS"
            actionHref="/servicos/os/novo"
          />
        ) : (
          <div className="rounded-2xl border border-border bg-surface overflow-hidden overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-muted text-left text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Cliente</th>
                  <th className="px-4 py-3 font-medium">Equipamento</th>
                  <th className="px-4 py-3 font-medium">Problema</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium w-24"></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-t border-border">
                    <td className="px-4 py-3 font-medium">
                      {o.customer?.name || o.customerName || "—"}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {o.equipment || "—"}
                      {o.imei && <span className="block text-xs">IMEI: {o.imei}</span>}
                    </td>
                    <td className="px-4 py-3 text-muted max-w-xs truncate">
                      {o.reportedProblem || "—"}
                    </td>
                    <td className="px-4 py-3 font-medium">{formatBRL(o.total)}</td>
                    <td className="px-4 py-3">
                      <form action={updateServiceOrderStatusAction}>
                        <input type="hidden" name="id" value={o.id} />
                        <select
                          name="status"
                          defaultValue={o.status}
                          onChange={(e) => e.currentTarget.form?.requestSubmit()}
                          className="rounded-lg border border-border bg-surface px-2 py-1 text-xs"
                        >
                          <option value="ABERTA">Aberta</option>
                          <option value="EM_ANDAMENTO">Em andamento</option>
                          <option value="CONCLUIDA">Concluída</option>
                          <option value="CANCELADA">Cancelada</option>
                        </select>
                      </form>
                    </td>
                    <td className="px-4 py-3">
                      <DeleteButton action={deleteServiceOrderAction} id={o.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : quotes.length === 0 ? (
        <EmptyState
          title="Nenhum orçamento"
          description="Crie um orçamento para enviar ao cliente antes de fechar o serviço."
          actionLabel="Criar orçamento"
          actionHref="/servicos/orcamentos/novo"
        />
      ) : (
        <div className="rounded-2xl border border-border bg-surface overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-muted text-left text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Emissão</th>
                <th className="px-4 py-3 font-medium">Validade</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium w-24"></th>
              </tr>
            </thead>
            <tbody>
              {quotes.map((q) => {
                const validUntil = new Date(q.issueDate);
                validUntil.setDate(validUntil.getDate() + q.validityDays);
                return (
                  <tr key={q.id} className="border-t border-border">
                    <td className="px-4 py-3 font-medium">
                      {q.customer?.name || q.customerName || "—"}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {q.issueDate.toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {validUntil.toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-4 py-3 font-medium">{formatBRL(q.total)}</td>
                    <td className="px-4 py-3">
                      <form action={updateQuoteStatusAction}>
                        <input type="hidden" name="id" value={q.id} />
                        <select
                          name="status"
                          defaultValue={q.status}
                          onChange={(e) => e.currentTarget.form?.requestSubmit()}
                          className="rounded-lg border border-border bg-surface px-2 py-1 text-xs"
                        >
                          <option value="RASCUNHO">Rascunho</option>
                          <option value="ENVIADO">Enviado</option>
                          <option value="APROVADO">Aprovado</option>
                          <option value="RECUSADO">Recusado</option>
                          <option value="EXPIRADO">Expirado</option>
                        </select>
                      </form>
                    </td>
                    <td className="px-4 py-3">
                      <DeleteButton action={deleteQuoteAction} id={q.id} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
