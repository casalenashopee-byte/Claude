"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export type FormState = { error?: string } | undefined;

function parseFields(formData: FormData) {
  return {
    name: String(formData.get("name") || "").trim(),
    email: String(formData.get("email") || "").trim() || null,
    phone: String(formData.get("phone") || "").trim() || null,
    document: String(formData.get("document") || "").trim() || null,
    notes: String(formData.get("notes") || "").trim() || null,
  };
}

export async function createCustomerAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await requireUser();
  const data = parseFields(formData);
  if (!data.name) return { error: "Informe o nome do cliente." };

  await prisma.customer.create({ data: { userId: user.id, ...data } });
  revalidatePath("/clientes");
  redirect("/clientes");
}

export async function updateCustomerAction(
  id: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await requireUser();
  const data = parseFields(formData);
  if (!data.name) return { error: "Informe o nome do cliente." };

  await prisma.customer.updateMany({ where: { id, userId: user.id }, data });
  revalidatePath("/clientes");
  redirect("/clientes");
}

export async function deleteCustomerAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") || "");
  await prisma.customer.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/clientes");
}
