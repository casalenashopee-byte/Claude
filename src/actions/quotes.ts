"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { round2 } from "@/lib/calc";
import { QuoteStatus } from "@prisma/client";

export type FormState = { error?: string } | undefined;

export async function createQuoteAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await requireUser();

  let items: { name: string; qty: number; price: number }[] = [];
  try {
    items = JSON.parse(String(formData.get("items") || "[]"));
  } catch {
    return { error: "Itens inválidos." };
  }
  if (items.length === 0) return { error: "Adicione ao menos um item." };

  const customerId = String(formData.get("customerId") || "") || null;
  if (customerId) {
    const customer = await prisma.customer.findFirst({ where: { id: customerId, userId: user.id } });
    if (!customer) return { error: "Cliente inválido." };
  }
  const customerName = String(formData.get("customerName") || "").trim() || null;
  const contact = String(formData.get("contact") || "").trim() || null;
  const document = String(formData.get("document") || "").trim() || null;
  const validityDays = parseInt(String(formData.get("validityDays") || "7"), 10) || 7;
  const notes = String(formData.get("notes") || "").trim() || null;
  const terms = String(formData.get("terms") || "").trim() || null;

  const total = round2(items.reduce((sum, i) => sum + i.qty * i.price, 0));

  await prisma.quote.create({
    data: {
      userId: user.id,
      customerId,
      customerName,
      contact,
      document,
      validityDays,
      items: JSON.stringify(items),
      total,
      notes,
      terms,
    },
  });

  revalidatePath("/servicos");
  redirect("/servicos?tab=orcamentos");
}

export async function updateQuoteStatusAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "") as QuoteStatus;
  await prisma.quote.updateMany({ where: { id, userId: user.id }, data: { status } });
  revalidatePath("/servicos");
}

export async function deleteQuoteAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") || "");
  await prisma.quote.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/servicos");
}
