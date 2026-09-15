import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { PageHeader } from "@/components/ui/PageHeader";
import { LinkButton } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { Icon } from "@/components/ui/Icon";
import { InlineAlert } from "@/components/ui/InlineAlert";
import { deletePaymentMethodAction } from "@/actions/paymentMethods";

export default async function PagamentosPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const { erro } = await searchParams;
  const user = await requireUser();
  const methods = await prisma.paymentMethod.findMany({
    where: { userId: user.id },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <PageHeader
        eyebrow="Menu principal"
        title="Formas de pagamento"
        description="Cada método tem taxa percentual + taxa fixa. Essas taxas alimentam o cálculo de lucro em toda venda."
        action={<LinkButton href="/pagamentos/novo">Nova forma de pagamento</LinkButton>}
      />

      {erro === "forma-em-uso" && (
        <InlineAlert>
          Essa forma de pagamento já tem vendas vinculadas e não pode ser excluída — ela foi desativada em vez disso.
        </InlineAlert>
      )}

      {methods.length === 0 ? (
        <EmptyState
          title="Nenhuma forma de pagamento"
          description="Cadastre como você recebe (PIX, cartão, boleto…) para calcular o lucro líquido de cada venda."
          actionLabel="Criar forma de pagamento"
          actionHref="/pagamentos/novo"
        />
      ) : (
        <div className="rounded-2xl border border-border bg-surface overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface-muted text-left text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">Taxa %</th>
                <th className="px-4 py-3 font-medium">Taxa fixa</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium w-24"></th>
              </tr>
            </thead>
            <tbody>
              {methods.map((m) => (
                <tr key={m.id} className="border-t border-border">
                  <td className="px-4 py-3 font-medium">{m.name}</td>
                  <td className="px-4 py-3 text-muted">{m.feePct.toFixed(2)}%</td>
                  <td className="px-4 py-3 text-muted">
                    R$ {m.feeFixed.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {m.active ? "Ativo" : "Inativo"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/pagamentos/${m.id}`}
                        className="rounded-lg p-1.5 text-muted hover:bg-surface-muted"
                        title="Editar"
                      >
                        <Icon name="Pencil" size={16} />
                      </Link>
                      <DeleteButton action={deletePaymentMethodAction} id={m.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
