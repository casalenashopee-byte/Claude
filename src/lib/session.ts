import { redirect } from "next/navigation";
import { prisma } from "./prisma";
import { getSessionUserId } from "./auth";

/** Usa em Server Components/Actions da área logada — redireciona para /login se não houver sessão. */
export async function requireUser() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) redirect("/login");

  return user;
}

/** Retorna o usuário logado ou null, sem redirecionar. */
export async function getCurrentUser() {
  const userId = await getSessionUserId();
  if (!userId) return null;
  return prisma.user.findUnique({ where: { id: userId } });
}
