import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { PageHeader } from "@/components/ui/PageHeader";
import { createProductAction } from "@/actions/products";
import { ProductForm } from "../ProductForm";

export default async function NovoProdutoPage() {
  const user = await requireUser();
  const [categories, suppliers, channels] = await Promise.all([
    prisma.category.findMany({ where: { userId: user.id }, orderBy: { name: "asc" } }),
    prisma.supplier.findMany({ where: { userId: user.id }, orderBy: { name: "asc" } }),
    prisma.channel.findMany({ where: { userId: user.id }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <PageHeader eyebrow="Cadastro" title="Novo produto" />
      <ProductForm
        action={createProductAction}
        categories={categories}
        suppliers={suppliers}
        channels={channels}
      />
    </div>
  );
}
