import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CatalogPreview } from "@/components/catalog/CatalogPreview";

export default async function PublicCatalogPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const settings = await prisma.catalogSettings.findUnique({ where: { slug } });
  if (!settings || !settings.active) notFound();

  const products = await prisma.product.findMany({
    where: { userId: settings.userId, inCatalog: true, status: true },
    orderBy: { name: "asc" },
  });

  return (
    <CatalogPreview
      settings={{
        title: settings.title,
        description: settings.description,
        whatsapp: settings.whatsapp,
        instagram: settings.instagram,
        showStock: settings.showStock,
        layout: settings.layout,
        background: settings.background,
        cardColor: settings.cardColor,
        textColor: settings.textColor,
        priceColor: settings.priceColor,
        buttonColor: settings.buttonColor,
        profilePhoto: settings.profilePhoto,
        name: settings.name,
        profession: settings.profession,
        banner: settings.banner,
        highlights: JSON.parse(settings.highlights || "[]"),
        faq: JSON.parse(settings.faq || "[]"),
        removeBranding: settings.removeBranding,
      }}
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
