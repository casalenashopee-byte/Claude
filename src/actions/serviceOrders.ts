"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { round2 } from "@/lib/calc";
import { ServiceOrderStatus } from "@prisma/client";

export type FormState = { error?: string } | undefined;

export async function createServiceOrderAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await requireUser();

  let items: { type: string; name: string; qty: number; price: number }[] = [];
  try {
    items = JSON.parse(String(formData.get("items") || "[]"));
  } catch {
    return { error: "Itens inválidos." };
  }

  const customerId = String(formData.get("customerId") || "") || null;
  if (customerId) {
    const customer = await prisma.customer.findFirst({ where: { id: customerId, userId: user.id } });
    if (!customer) return { error: "Cliente inválido." };
  }
  const customerName = String(formData.get("customerName") || "").trim() || null;
  const equipment = String(formData.get("equipment") || "").trim() || null;
  const imei = String(formData.get("imei") || "").trim() || null;
  const reportedProblem = String(formData.get("reportedProblem") || "").trim() || null;

  const total = round2(items.reduce((sum, i) => sum + i.qty * i.price, 0));

  await prisma.serviceOrder.create({
    data: {
      userId: user.id,
      customerId,
      customerName,
      equipment,
      imei,
      reportedProblem,
      items: JSON.stringify(items),
      total,
    },
  });

  revalidatePath("/servicos");
  redirect("/servicos?tab=os");
}

export async function updateServiceOrderStatusAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "") as ServiceOrderStatus;

  const data: { status: ServiceOrderStatus; closedAt?: Date } = { status };
  if (status === "CONCLUIDA" || status === "CANCELADA") data.closedAt = new Date();

  await prisma.serviceOrder.updateMany({ where: { id, userId: user.id }, data });
  revalidatePath("/servicos");
}

export async function deleteServiceOrderAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") || "");
  await prisma.serviceOrder.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/servicos");
}
