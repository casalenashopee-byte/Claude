import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { PageHeader } from "@/components/ui/PageHeader";
import { updateProductAction } from "@/actions/products";
import { ProductForm } from "../ProductForm";

export default async function EditarProdutoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  const [product, categories, suppliers, channels] = await Promise.all([
    prisma.product.findFirst({ where: { id, userId: user.id } }),
    prisma.category.findMany({ where: { userId: user.id }, orderBy: { name: "asc" } }),
    prisma.supplier.findMany({ where: { userId: user.id }, orderBy: { name: "asc" } }),
    prisma.channel.findMany({ where: { userId: user.id }, orderBy: { name: "asc" } }),
  ]);
  if (!product) notFound();

  const action = updateProductAction.bind(null, id);

  return (
    <div>
      <PageHeader eyebrow="Cadastro" title="Editar produto" />
      <ProductForm
        action={action}
        categories={categories}
        suppliers={suppliers}
        channels={channels}
        defaults={product}
      />
    </div>
  );
}
