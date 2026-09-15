"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { parseDateInput } from "@/lib/dateRange";
import { CashEntryType } from "@prisma/client";

export type FormState = { error?: string } | undefined;

export async function createCashEntryAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await requireUser();
  const type = String(formData.get("type") || "ENTRADA") as CashEntryType;
  const amount = parseFloat(String(formData.get("amount") || "0")) || 0;
  const category = String(formData.get("category") || "").trim() || null;
  const description = String(formData.get("description") || "").trim() || null;
  const dateRaw = String(formData.get("date") || "");
  const date = dateRaw ? parseDateInput(dateRaw) : new Date();
  const impactsProfit = formData.get("impactsProfit") === "on";
  const movesCash = formData.get("movesCash") === "on";

  if (!amount || amount <= 0) return { error: "Informe um valor válido." };

  await prisma.cashEntry.create({
    data: { userId: user.id, type, amount, category, description, date, impactsProfit, movesCash },
  });

  revalidatePath("/financeiro/caixa");
  revalidatePath("/dashboard");
  redirect("/financeiro/caixa");
}

export async function deleteCashEntryAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") || "");
  await prisma.cashEntry.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/financeiro/caixa");
  revalidatePath("/dashboard");
}
