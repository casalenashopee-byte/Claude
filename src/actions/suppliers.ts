"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { SupplierStatus } from "@prisma/client";

export type FormState = { error?: string } | undefined;

function parseFields(formData: FormData) {
  return {
    name: String(formData.get("name") || "").trim(),
    document: String(formData.get("document") || "").trim() || null,
    category: String(formData.get("category") || "").trim() || null,
    city: String(formData.get("city") || "").trim() || null,
    state: String(formData.get("state") || "").trim() || null,
    status: (String(formData.get("status") || "ATIVO") as SupplierStatus),
  };
}

export async function createSupplierAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await requireUser();
  const data = parseFields(formData);
  if (!data.name) return { error: "Informe o nome/razão social." };

  await prisma.supplier.create({ data: { userId: user.id, ...data } });
  revalidatePath("/fornecedores");
  redirect("/fornecedores");
}

export async function updateSupplierAction(
  id: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await requireUser();
  const data = parseFields(formData);
  if (!data.name) return { error: "Informe o nome/razão social." };

  await prisma.supplier.updateMany({ where: { id, userId: user.id }, data });
  revalidatePath("/fornecedores");
  redirect("/fornecedores");
}

export async function deleteSupplierAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") || "");
  await prisma.supplier.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/fornecedores");
}
