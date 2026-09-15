import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { PageHeader } from "@/components/ui/PageHeader";
import { LinkButton } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { Icon } from "@/components/ui/Icon";
import { Pagination, PAGE_SIZE, paginationSkip } from "@/components/ui/Pagination";
import { deleteCustomerAction } from "@/actions/customers";

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q = "", page: pageRaw } = await searchParams;
  const page = Math.max(parseInt(pageRaw || "1", 10) || 1, 1);
  const user = await requireUser();

  const where = {
    userId: user.id,
    ...(q
      ? {
          OR: [
            { name: { contains: q } },
            { phone: { contains: q } },
            { email: { contains: q } },
            { document: { contains: q } },
          ],
        }
      : {}),
  };

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      orderBy: { name: "asc" },
      skip: paginationSkip(page),
      take: PAGE_SIZE,
    }),
    prisma.customer.count({ where }),
  ]);

  return (
    <div>
      <PageHeader
        eyebrow="Cadastro"
        title="Clientes"
        description="Quem compra — necessário para vendas fiado e parceladas."
        action={<LinkButton href="/clientes/novo">Novo cliente</LinkButton>}
      />

      <form className="mb-4 max-w-sm">
        <input
          name="q"
          defaultValue={q}
          placeholder="Buscar por nome, telefone, e-mail ou documento…"
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
        />
      </form>

      {customers.length === 0 ? (
        <EmptyState
          title={total === 0 && !q ? "Nenhum cliente cadastrado" : "Nada encontrado"}
          description={
            total === 0 && !q
              ? "Cadastre clientes para vincular vendas a prazo e ver o histórico de compras."
              : "Ajuste a busca para ver outros clientes."
          }
          actionLabel={total === 0 && !q ? "Criar cliente" : undefined}
          actionHref={total === 0 && !q ? "/clientes/novo" : undefined}
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

      <Pagination
        page={page}
        total={total}
        buildHref={(n) => `/clientes?${q ? `q=${encodeURIComponent(q)}&` : ""}page=${n}`}
      />
    </div>
  );
}
