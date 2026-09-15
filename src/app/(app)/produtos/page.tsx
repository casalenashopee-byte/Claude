import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { PageHeader } from "@/components/ui/PageHeader";
import { LinkButton } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { deleteProductAction } from "@/actions/products";
import { formatBRL } from "@/lib/calc";
import clsx from "clsx";

const FILTERS = [
  { key: "", label: "Todos" },
  { key: "out", label: "Sem estoque" },
  { key: "low", label: "Estoque baixo" },
  { key: "instock", label: "Em estoque" },
  { key: "never-sold", label: "Nunca vendido" },
  { key: "sold", label: "Já vendido" },
] as const;

export default async function ProdutosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; f?: string }>;
}) {
  const { q = "", f = "" } = await searchParams;
  const user = await requireUser();

  const products = await prisma.product.findMany({
    where: {
      userId: user.id,
      ...(q ? { name: { contains: q } } : {}),
    },
    include: { category: true, _count: { select: { saleItems: true } } },
    orderBy: { createdAt: "desc" },
  });

  const filtered = products.filter((p) => {
    switch (f) {
      case "out":
        return p.stockQty <= 0;
      case "low":
        return p.stockQty > 0 && p.lowStockAlert > 0 && p.stockQty <= p.lowStockAlert;
      case "instock":
        return p.stockQty > 0;
      case "never-sold":
        return p._count.saleItems === 0;
      case "sold":
        return p._count.saleItems > 0;
      default:
        return true;
    }
  });

  return (
    <div>
      <PageHeader
        eyebrow="Cadastro"
        title="Produtos"
        description="Estoque, precificação e ficha técnica de cada item."
        action={<LinkButton href="/produtos/novo">Novo produto</LinkButton>}
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <form className="flex-1 min-w-[200px]">
          <input type="hidden" name="f" value={f} />
          <input
            name="q"
            defaultValue={q}
            placeholder="Buscar produto…"
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
          />
        </form>
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((filter) => (
            <Link
              key={filter.key}
              href={`/produtos?f=${filter.key}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
              className={clsx(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                f === filter.key
                  ? "border-brand bg-brand-soft text-brand-strong"
                  : "border-border text-muted hover:bg-surface-muted"
              )}
            >
              {filter.label}
            </Link>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={products.length === 0 ? "Nenhum produto cadastrado" : "Nada encontrado"}
          description={
            products.length === 0
              ? "Cadastre seu primeiro produto para começar a vender."
              : "Ajuste a busca ou o filtro para ver outros produtos."
          }
          actionLabel={products.length === 0 ? "Cadastrar produto" : undefined}
          actionHref={products.length === 0 ? "/produtos/novo" : undefined}
        />
      ) : (
        <div className="rounded-2xl border border-border bg-surface overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-muted text-left text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Produto</th>
                <th className="px-4 py-3 font-medium">Categoria</th>
                <th className="px-4 py-3 font-medium">Estoque</th>
                <th className="px-4 py-3 font-medium">Preço</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium w-24"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-t border-border">
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3 text-muted">{p.category?.name || "—"}</td>
                  <td className="px-4 py-3">
                    {p.type === "FISICO" ? (
                      <span
                        className={
                          p.stockQty <= 0
                            ? "text-danger"
                            : p.lowStockAlert > 0 && p.stockQty <= p.lowStockAlert
                            ? "text-warning"
                            : "text-muted"
                        }
                      >
                        {p.stockQty} {p.unit}
                      </span>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium">{formatBRL(p.retailPrice)}</td>
                  <td className="px-4 py-3">
                    <Badge tone={p.status ? "brand" : "neutral"}>
                      {p.status ? "Ativo" : "Inativo"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/produtos/${p.id}`}
                        className="rounded-lg p-1.5 text-muted hover:bg-surface-muted"
                        title="Editar"
                      >
                        <Icon name="Pencil" size={16} />
                      </Link>
                      <DeleteButton action={deleteProductAction} id={p.id} />
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
