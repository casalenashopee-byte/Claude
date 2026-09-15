"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export type FormState = { error?: string; success?: string } | undefined;

export async function updateStoreSettingsAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await requireUser();

  const active = formData.get("active") === "on";
  const sections = String(formData.get("sections") || "[]");
  const shippingFixedRaw = formData.get("shippingFixed");
  const shippingFixed = shippingFixedRaw ? parseFloat(String(shippingFixedRaw)) || 0 : null;
  const paymentInfo = String(formData.get("paymentInfo") || "").trim() || null;
  const coupons = String(formData.get("coupons") || "[]");
  const termsText = String(formData.get("termsText") || "").trim() || null;

  await prisma.storeSettings.update({
    where: { userId: user.id },
    data: { active, sections, shippingFixed, paymentInfo, coupons, termsText },
  });

  const catalog = await prisma.catalogSettings.findUnique({ where: { userId: user.id } });
  revalidatePath("/marketing/loja");
  if (catalog) revalidatePath(`/loja/${catalog.slug}`);
  return { success: "Loja atualizada." };
}
