import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { PageHeader } from "@/components/ui/PageHeader";
import { LinkButton } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { Icon } from "@/components/ui/Icon";
import { deleteCustomerAction } from "@/actions/customers";

export default async function ClientesPage() {
  const user = await requireUser();
  const customers = await prisma.customer.findMany({
    where: { userId: user.id },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <PageHeader
        eyebrow="Cadastro"
        title="Clientes"
        description="Quem compra — necessário para vendas fiado e parceladas."
        action={<LinkButton href="/clientes/novo">Novo cliente</LinkButton>}
      />

      {customers.length === 0 ? (
        <EmptyState
          title="Nenhum cliente cadastrado"
          description="Cadastre clientes para vincular vendas a prazo e ver o histórico de compras."
          actionLabel="Criar cliente"
          actionHref="/clientes/novo"
        />
      ) : (
        <div className="rounded-2xl border border-border bg-surface overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-muted text-left text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">Contato</th>
                <th className="px-4 py-3 font-medium">CPF/CNPJ</th>
                <th className="px-4 py-3 font-medium w-24"></th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="border-t border-border">
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3 text-muted">
                    {[c.phone, c.email].filter(Boolean).join(" · ") || "—"}
                  </td>
                  <td className="px-4 py-3 text-muted">{c.document || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/clientes/${c.id}`}
                        className="rounded-lg p-1.5 text-muted hover:bg-surface-muted"
                        title="Editar"
                      >
                        <Icon name="Pencil" size={16} />
                      </Link>
                      <DeleteButton action={deleteCustomerAction} id={c.id} />
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
