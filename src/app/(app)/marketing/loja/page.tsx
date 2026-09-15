import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { PageHeader } from "@/components/ui/PageHeader";
import { updateStoreSettingsAction } from "@/actions/store";
import { StoreSettingsForm } from "./StoreSettingsForm";

export default async function LojaPage() {
  const user = await requireUser();
  const [store, catalog] = await Promise.all([
    prisma.storeSettings.findUnique({ where: { userId: user.id } }),
    prisma.catalogSettings.findUnique({ where: { userId: user.id } }),
  ]);

  if (!store) return null;

  return (
    <div>
      <PageHeader
        eyebrow="Marketing"
        title="Loja virtual"
        description="Vitrine completa, com carrinho — o checkout manda o pedido inteiro para o seu WhatsApp."
      />
      <StoreSettingsForm
        action={updateStoreSettingsAction}
        publicUrl={catalog ? `/loja/${catalog.slug}` : null}
        defaults={{
          active: store.active,
          sections: JSON.parse(store.sections || "[]"),
          shippingFixed: store.shippingFixed,
          paymentInfo: store.paymentInfo,
          coupons: JSON.parse(store.coupons || "[]"),
          termsText: store.termsText,
        }}
      />
    </div>
  );
}
