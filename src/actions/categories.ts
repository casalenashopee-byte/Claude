"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export type FormState = { error?: string } | undefined;

export async function createCategoryAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await requireUser();
  const name = String(formData.get("name") || "").trim();
  if (!name) return { error: "Informe um nome." };

  await prisma.category.create({ data: { userId: user.id, name } });
  revalidatePath("/categorias");
  redirect("/categorias");
}

export async function updateCategoryAction(
  id: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await requireUser();
  const name = String(formData.get("name") || "").trim();
  if (!name) return { error: "Informe um nome." };

  await prisma.category.updateMany({
    where: { id, userId: user.id },
    data: { name },
  });
  revalidatePath("/categorias");
  redirect("/categorias");
}

export async function deleteCategoryAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") || "");
  await prisma.category.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/categorias");
}
