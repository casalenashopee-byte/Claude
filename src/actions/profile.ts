"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { clearSessionCookie, hashPassword, verifyPassword } from "@/lib/auth";

export async function toggleThemeAction(theme: "light" | "dark") {
  const user = await requireUser();
  await prisma.user.update({ where: { id: user.id }, data: { theme } });
  revalidatePath("/", "layout");
}

export type ProfileState = { error?: string; success?: string } | undefined;

export async function updateProfileAction(
  _prev: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const user = await requireUser();
  const name = String(formData.get("name") || "").trim();
  const companyName = String(formData.get("companyName") || "").trim();
  const companyDoc = String(formData.get("companyDoc") || "").trim();

  if (!name) return { error: "Informe seu nome." };

  await prisma.user.update({
    where: { id: user.id },
    data: {
      name,
      companyName: companyName || null,
      companyDoc: companyDoc || null,
    },
  });

  revalidatePath("/perfil");
  return { success: "Dados atualizados." };
}

export async function changePasswordAction(
  _prev: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const user = await requireUser();
  const currentPassword = String(formData.get("currentPassword") || "");
  const newPassword = String(formData.get("newPassword") || "");

  if (newPassword.length < 8) {
    return { error: "A nova senha precisa ter pelo menos 8 caracteres." };
  }

  const valid = await verifyPassword(currentPassword, user.passwordHash);
  if (!valid) return { error: "Senha atual incorreta." };

  const passwordHash = await hashPassword(newPassword);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

  return { success: "Senha alterada com sucesso." };
}

export async function updateEmailAction(
  _prev: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const user = await requireUser();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  if (!email) return { error: "Informe um e-mail válido." };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing && existing.id !== user.id) {
    return { error: "Esse e-mail já está em uso." };
  }

  await prisma.user.update({ where: { id: user.id }, data: { email } });
  revalidatePath("/perfil");
  return { success: "E-mail atualizado." };
}

/** "Limpar meus dados" — apaga o operacional, mantém conta e plano. */
export async function clearMyDataAction() {
  const user = await requireUser();
  const userId = user.id;

  await prisma.$transaction([
    prisma.saleItem.deleteMany({ where: { sale: { userId } } }),
    prisma.sale.deleteMany({ where: { userId } }),
    prisma.quote.deleteMany({ where: { userId } }),
    prisma.serviceOrder.deleteMany({ where: { userId } }),
    prisma.cashEntry.deleteMany({ where: { userId } }),
    prisma.expense.deleteMany({ where: { userId } }),
    prisma.product.deleteMany({ where: { userId } }),
    prisma.customer.deleteMany({ where: { userId } }),
    prisma.supplier.deleteMany({ where: { userId } }),
  ]);

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

/** "Excluir minha conta" — apaga tudo permanentemente. */
export async function deleteAccountAction() {
  const user = await requireUser();
  await prisma.user.delete({ where: { id: user.id } });
  await clearSessionCookie();
  redirect("/login");
}
