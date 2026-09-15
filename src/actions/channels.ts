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
