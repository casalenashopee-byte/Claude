"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export type FormState = { error?: string; success?: string } | undefined;

function slugify(input: string) {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function updateCatalogAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await requireUser();

  const slug = slugify(String(formData.get("slug") || ""));
  if (!slug) return { error: "Informe um endereço (slug) válido." };

  const existing = await prisma.catalogSettings.findUnique({ where: { slug } });
  if (existing && existing.userId !== user.id) {
    return { error: "Esse endereço já está em uso por outra conta." };
  }

  const highlights = String(formData.get("highlights") || "[]");
  const faq = String(formData.get("faq") || "[]");

  await prisma.catalogSettings.update({
    where: { userId: user.id },
    data: {
      slug,
      title: String(formData.get("title") || "").trim() || null,
      description: String(formData.get("description") || "").trim() || null,
      whatsapp: String(formData.get("whatsapp") || "").trim() || null,
      instagram: String(formData.get("instagram") || "").trim() || null,
      active: formData.get("active") === "on",
      showStock: formData.get("showStock") === "on",
      layout: String(formData.get("layout") || "grid"),
      background: String(formData.get("background") || "#F8F7F4"),
      cardColor: String(formData.get("cardColor") || "#FFFFFF"),
      textColor: String(formData.get("textColor") || "#1A1A1A"),
      priceColor: String(formData.get("priceColor") || "#1F6F4A"),
      buttonColor: String(formData.get("buttonColor") || "#1F6F4A"),
      profilePhoto: String(formData.get("profilePhoto") || "").trim() || null,
      name: String(formData.get("name") || "").trim() || null,
      profession: String(formData.get("profession") || "").trim() || null,
      banner: String(formData.get("banner") || "").trim() || null,
      highlights,
      faq,
      removeBranding: formData.get("removeBranding") === "on",
    },
  });

  revalidatePath("/marketing/catalogo");
  revalidatePath(`/c/${slug}`);
  return { success: "Catálogo atualizado." };
}
