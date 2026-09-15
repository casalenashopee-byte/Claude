import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { PageHeader } from "@/components/ui/PageHeader";
import { updateCatalogAction } from "@/actions/catalog";
import { CatalogBuilderForm } from "./CatalogBuilderForm";

export default async function CatalogoPage() {
  const user = await requireUser();
  const [settings, products] = await Promise.all([
    prisma.catalogSettings.findUnique({ where: { userId: user.id } }),
    prisma.product.findMany({
      where: { userId: user.id, inCatalog: true, status: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!settings) return null;

  return (
    <div>
      <PageHeader
        eyebrow="Marketing"
        title="Catálogo online"
        description="Um link público para mostrar produtos com preço — o cliente fecha a compra fora do sistema, por WhatsApp ou Instagram."
      />
      <CatalogBuilderForm
        action={updateCatalogAction}
        publicUrl={`/c/${settings.slug}`}
        defaults={{
          slug: settings.slug,
          title: settings.title,
          description: settings.description,
          whatsapp: settings.whatsapp,
          instagram: settings.instagram,
          active: settings.active,
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
    </div>
  );
}
