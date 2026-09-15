"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { parseDateInput } from "@/lib/dateRange";
import { ProductType } from "@prisma/client";

export type FormState = { error?: string } | undefined;

function num(formData: FormData, key: string) {
  const v = parseFloat(String(formData.get(key) || "0"));
  return Number.isFinite(v) ? v : 0;
}

function generateSku() {
  return `SKU-${Date.now().toString(36).toUpperCase()}`;
}

function parseFields(formData: FormData) {
  const type = String(formData.get("type") || "FISICO") as ProductType;
  const name = String(formData.get("name") || "").trim();
  const brand = String(formData.get("brand") || "").trim() || null;
  const status = formData.get("status") === "on";
  const categoryId = String(formData.get("categoryId") || "") || null;
  const description = String(formData.get("description") || "").trim() || null;
  const images = String(formData.get("images") || "[]");

  const costPrice = num(formData, "costPrice");
  const targetMarginPct = num(formData, "targetMarginPct");
  const retailPrice = num(formData, "retailPrice");
  const hasWholesale = formData.get("hasWholesale") === "on";
  const wholesalePriceRaw = formData.get("wholesalePrice");
  const wholesalePrice =
    hasWholesale && wholesalePriceRaw ? num(formData, "wholesalePrice") : null;

  const stockQty = num(formData, "stockQty");
  const lowStockAlert = num(formData, "lowStockAlert");
  const unit = String(formData.get("unit") || "un").trim() || "un";
  const weightRaw = formData.get("weight");
  const weight = weightRaw ? num(formData, "weight") : null;
  const dimensions = String(formData.get("dimensions") || "").trim() || null;
  let sku = String(formData.get("sku") || "").trim();
  if (!sku) sku = generateSku();
  const barcode = String(formData.get("barcode") || "").trim() || null;

  const variations = String(formData.get("variations") || "[]");

  const supplierId = String(formData.get("supplierId") || "") || null;
  const purchaseDateRaw = String(formData.get("purchaseDate") || "");
  const purchaseDate = purchaseDateRaw ? parseDateInput(purchaseDateRaw) : null;
  const supplierNotes = String(formData.get("supplierNotes") || "").trim() || null;

  const channelIds = String(formData.get("channelIds") || "[]");
  const inCatalog = formData.get("inCatalog") === "on";
  const inStore = formData.get("inStore") === "on";

  return {
    type,
    name,
    brand,
    status,
    categoryId,
    description,
    images,
    costPrice,
    targetMarginPct,
    retailPrice,
    hasWholesale,
    wholesalePrice,
    stockQty,
    lowStockAlert,
    unit,
    weight,
    dimensions,
    sku,
    barcode,
    variations,
    supplierId,
    purchaseDate,
    supplierNotes,
    channelIds,
    inCatalog,
    inStore,
  };
}

export async function createProductAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await requireUser();
  const data = parseFields(formData);
  if (!data.name) return { error: "Informe o nome do produto." };
  if (!data.retailPrice || data.retailPrice <= 0)
    return { error: "Informe um preço de varejo válido." };

  await prisma.product.create({ data: { userId: user.id, ...data } });
  revalidatePath("/produtos");
  redirect("/produtos");
}

export async function updateProductAction(
  id: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await requireUser();
  const data = parseFields(formData);
  if (!data.name) return { error: "Informe o nome do produto." };
  if (!data.retailPrice || data.retailPrice <= 0)
    return { error: "Informe um preço de varejo válido." };

  await prisma.product.updateMany({ where: { id, userId: user.id }, data });
  revalidatePath("/produtos");
  redirect("/produtos");
}

export async function deleteProductAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") || "");
  await prisma.product.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/produtos");
}
