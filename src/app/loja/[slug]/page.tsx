import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StoreClient } from "./StoreClient";

export default async function PublicStorePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const catalog = await prisma.catalogSettings.findUnique({ where: { slug } });
  if (!catalog) notFound();

  const store = await prisma.storeSettings.findUnique({ where: { userId: catalog.userId } });
  if (!store || !store.active) notFound();

  const products = await prisma.product.findMany({
    where: { userId: catalog.userId, inStore: true, status: true },
    orderBy: { name: "asc" },
  });

  return (
    <StoreClient
      slug={slug}
      storeName={catalog.name || catalog.title || "Loja"}
      whatsapp={catalog.whatsapp}
      banner={catalog.banner}
      background={catalog.background}
      sections={JSON.parse(store.sections || "[]")}
      shippingFixed={store.shippingFixed}
      paymentInfo={store.paymentInfo}
      coupons={JSON.parse(store.coupons || "[]")}
      termsText={store.termsText}
      products={products.map((p) => ({
        id: p.id,
        name: p.name,
        retailPrice: p.retailPrice,
        images: JSON.parse(p.images || "[]"),
        stockQty: p.stockQty,
        type: p.type,
      }))}
    />
  );
}
