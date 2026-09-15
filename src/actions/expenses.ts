"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { parseDateInput } from "@/lib/dateRange";

export type FormState = { error?: string } | undefined;

export async function createExpenseAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await requireUser();
  const category = String(formData.get("category") || "").trim();
  const description = String(formData.get("description") || "").trim() || null;
  const amount = parseFloat(String(formData.get("amount") || "0")) || 0;
  const dateRaw = String(formData.get("date") || "");
  const date = dateRaw ? parseDateInput(dateRaw) : new Date();

  if (!category) return { error: "Informe uma categoria." };
  if (!amount || amount <= 0) return { error: "Informe um valor válido." };

  await prisma.expense.create({
    data: { userId: user.id, category, description, amount, date },
  });

  revalidatePath("/financeiro/gastos");
  revalidatePath("/financeiro/caixa");
  revalidatePath("/dashboard");
  redirect("/financeiro/gastos");
}

export async function deleteExpenseAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") || "");
  await prisma.expense.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/financeiro/gastos");
  revalidatePath("/financeiro/caixa");
  revalidatePath("/dashboard");
}
