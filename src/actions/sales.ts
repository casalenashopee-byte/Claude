"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { calcSplitFee, round2 } from "@/lib/calc";
import { parseDateInput } from "@/lib/dateRange";
import { ReceiptType, SaleStatus } from "@prisma/client";

export type FormState = { error?: string } | undefined;

type ItemInput = {
  productId?: string;
  name: string;
  qty: number;
  price: number;
  cost: number;
};

type SplitInput = { paymentMethodId: string; amount: number };

export async function createSaleAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await requireUser();

  let items: ItemInput[] = [];
  let splits: SplitInput[] = [];
  try {
    items = JSON.parse(String(formData.get("items") || "[]"));
    splits = JSON.parse(String(formData.get("paymentSplit") || "[]"));
  } catch {
    return { error: "Dados da venda inválidos." };
  }

  if (items.length === 0) return { error: "Adicione ao menos um item." };
  if (splits.length === 0) return { error: "Informe a forma de pagamento." };

  const channelId = String(formData.get("channelId") || "");
  if (!channelId) return { error: "Selecione o canal de venda." };

  const customerId = String(formData.get("customerId") || "") || null;
  const customerName = String(formData.get("customerName") || "").trim() || null;
  const receiptType = String(formData.get("receiptType") || "AVISTA") as ReceiptType;
  const dueDateRaw = String(formData.get("dueDate") || "");
  const dueDate = dueDateRaw ? parseDateInput(dueDateRaw) : null;
  const discount = parseFloat(String(formData.get("discount") || "0")) || 0;
  const extraCosts = parseFloat(String(formData.get("extraCosts") || "0")) || 0;
  const extraCostsDesc = String(formData.get("extraCostsDesc") || "").trim() || null;
  const notes = String(formData.get("notes") || "").trim() || null;

  const methods = await prisma.paymentMethod.findMany({
    where: { userId: user.id, id: { in: splits.map((s) => s.paymentMethodId) } },
  });
  const methodMap = new Map(methods.map((m) => [m.id, m]));

  const subtotal = round2(items.reduce((sum, i) => sum + i.qty * i.price, 0));
  const totalCost = round2(items.reduce((sum, i) => sum + i.qty * i.cost, 0));
  const totalCharged = round2(Math.max(subtotal - discount, 0));

  const feeAmount = calcSplitFee(
    splits.map((s) => {
      const m = methodMap.get(s.paymentMethodId);
      return { method: { feePct: m?.feePct ?? 0, feeFixed: m?.feeFixed ?? 0 }, amount: s.amount };
    })
  );

  const netProfit = round2(totalCharged - totalCost - feeAmount - extraCosts);
  const status: SaleStatus = receiptType === "APRAZO" ? "PENDENTE" : "PAGO";

  await prisma.$transaction(async (tx) => {
    const sale = await tx.sale.create({
      data: {
        userId: user.id,
        customerId,
        customerName,
        channelId,
        paymentMethodId: splits[0].paymentMethodId,
        paymentSplit: JSON.stringify(splits),
        receiptType,
        dueDate,
        status,
        discount,
        extraCosts,
        extraCostsDesc,
        notes,
        subtotal,
        totalCost,
        feeAmount,
        totalCharged,
        netProfit,
        items: {
          create: items.map((i) => ({
            productId: i.productId || null,
            name: i.name,
            qty: i.qty,
            price: i.price,
            cost: i.cost,
            subtotal: round2(i.qty * i.price),
          })),
        },
      },
    });

    for (const item of items) {
      if (!item.productId) continue;
      const product = await tx.product.findUnique({ where: { id: item.productId } });
      if (product && product.type === "FISICO") {
        await tx.product.update({
          where: { id: item.productId },
          data: { stockQty: Math.max(product.stockQty - item.qty, 0) },
        });
      }
    }

    return sale;
  });

  revalidatePath("/vendas");
  revalidatePath("/dashboard");
  revalidatePath("/produtos");
  redirect("/vendas");
}

export async function deleteSaleAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") || "");

  const sale = await prisma.sale.findFirst({
    where: { id, userId: user.id },
    include: { items: true },
  });
  if (!sale) return;

  await prisma.$transaction(async (tx) => {
    for (const item of sale.items) {
      if (!item.productId) continue;
      const product = await tx.product.findUnique({ where: { id: item.productId } });
      if (product && product.type === "FISICO") {
        await tx.product.update({
          where: { id: item.productId },
          data: { stockQty: product.stockQty + item.qty },
        });
      }
    }
    await tx.sale.delete({ where: { id } });
  });

  revalidatePath("/vendas");
  revalidatePath("/dashboard");
  revalidatePath("/produtos");
}

export async function markSalePaidAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") || "");
  await prisma.sale.updateMany({
    where: { id, userId: user.id },
    data: { status: "PAGO" },
  });
  revalidatePath("/vendas");
  revalidatePath("/financeiro/receber");
  revalidatePath("/dashboard");
}
