"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export type FormState = { error?: string } | undefined;

export async function createChannelAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await requireUser();
  const name = String(formData.get("name") || "").trim();
  if (!name) return { error: "Informe um nome." };
  const active = formData.get("active") === "on";

  await prisma.channel.create({ data: { userId: user.id, name, active } });
  revalidatePath("/canais");
  redirect("/canais");
}

export async function updateChannelAction(
  id: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await requireUser();
  const name = String(formData.get("name") || "").trim();
  if (!name) return { error: "Informe um nome." };
  const active = formData.get("active") === "on";

  await prisma.channel.updateMany({
    where: { id, userId: user.id },
    data: { name, active },
  });
  revalidatePath("/canais");
  redirect("/canais");
}

export async function deleteChannelAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") || "");

  const salesCount = await prisma.sale.count({ where: { channelId: id, userId: user.id } });
  if (salesCount > 0) {
    // Canal com vendas vinculadas não pode ser removido (evita erro de integridade) —
    // desativa em vez de apagar, o que já o tira das opções de nova venda.
    await prisma.channel.updateMany({ where: { id, userId: user.id }, data: { active: false } });
    revalidatePath("/canais");
    redirect("/canais?erro=canal-em-uso");
  }

  await prisma.channel.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/canais");
}

export async function toggleChannelActiveAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") || "");
  const channel = await prisma.channel.findFirst({ where: { id, userId: user.id } });
  if (!channel) return;
  await prisma.channel.update({
    where: { id },
    data: { active: !channel.active },
  });
  revalidatePath("/canais");
}
