import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { PageHeader } from "@/components/ui/PageHeader";
import { LinkButton } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { ToggleStatusButton } from "@/components/ui/ToggleStatusButton";
import { Icon } from "@/components/ui/Icon";
import { InlineAlert } from "@/components/ui/InlineAlert";
import { deleteChannelAction, toggleChannelActiveAction } from "@/actions/channels";

export default async function CanaisPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const { erro } = await searchParams;
  const user = await requireUser();
  const channels = await prisma.channel.findMany({
    where: { userId: user.id },
    orderBy: { name: "asc" },
    include: { _count: { select: { sales: true } } },
  });

  return (
    <div>
      <PageHeader
        eyebrow="Menu principal"
        title="Canais"
        description="Onde a venda aconteceu — Instagram, loja física, marketplace…"
        action={<LinkButton href="/canais/novo">Novo canal</LinkButton>}
      />

      {erro === "canal-em-uso" && (
        <InlineAlert>
          Esse canal já tem vendas vinculadas e não pode ser excluído — ele foi desativado em vez disso.
        </InlineAlert>
      )}

      {channels.length === 0 ? (
        <EmptyState
          title="Nenhum canal cadastrado"
          description="Cadastre os lugares onde você vende para acompanhar o desempenho de cada um."
          actionLabel="Criar canal"
          actionHref="/canais/novo"
        />
      ) : (
        <div className="rounded-2xl border border-border bg-surface overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface-muted text-left text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">Vendas</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium w-24"></th>
              </tr>
            </thead>
            <tbody>
              {channels.map((c) => (
                <tr key={c.id} className="border-t border-border">
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3 text-muted">{c._count.sales}</td>
                  <td className="px-4 py-3">
                    <ToggleStatusButton
                      action={toggleChannelActiveAction}
                      id={c.id}
                      active={c.active}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/canais/${c.id}`}
                        className="rounded-lg p-1.5 text-muted hover:bg-surface-muted"
                        title="Editar"
                      >
                        <Icon name="Pencil" size={16} />
                      </Link>
                      <DeleteButton action={deleteChannelAction} id={c.id} />
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
