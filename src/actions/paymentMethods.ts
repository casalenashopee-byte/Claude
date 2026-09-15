"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export type FormState = { error?: string } | undefined;

function parseFields(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const feePct = parseFloat(String(formData.get("feePct") || "0")) || 0;
  const feeFixed = parseFloat(String(formData.get("feeFixed") || "0")) || 0;
  const active = formData.get("active") === "on";
  return { name, feePct, feeFixed, active };
}

export async function createPaymentMethodAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await requireUser();
  const { name, feePct, feeFixed, active } = parseFields(formData);
  if (!name) return { error: "Informe um nome." };

  await prisma.paymentMethod.create({
    data: { userId: user.id, name, feePct, feeFixed, active },
  });
  revalidatePath("/pagamentos");
  redirect("/pagamentos");
}

export async function updatePaymentMethodAction(
  id: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await requireUser();
  const { name, feePct, feeFixed, active } = parseFields(formData);
  if (!name) return { error: "Informe um nome." };

  await prisma.paymentMethod.updateMany({
    where: { id, userId: user.id },
    data: { name, feePct, feeFixed, active },
  });
  revalidatePath("/pagamentos");
  redirect("/pagamentos");
}

export async function deletePaymentMethodAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") || "");

  const salesCount = await prisma.sale.count({ where: { paymentMethodId: id, userId: user.id } });
  if (salesCount > 0) {
    // Forma de pagamento com vendas vinculadas não pode ser removida — desativa em vez de apagar.
    await prisma.paymentMethod.updateMany({ where: { id, userId: user.id }, data: { active: false } });
    revalidatePath("/pagamentos");
    redirect("/pagamentos?erro=forma-em-uso");
  }

  await prisma.paymentMethod.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/pagamentos");
}
