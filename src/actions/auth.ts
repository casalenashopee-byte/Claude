"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  createSessionToken,
  hashPassword,
  setSessionCookie,
  clearSessionCookie,
  verifyPassword,
} from "@/lib/auth";
import { provisionNewUser } from "@/lib/provision";
import { checkRateLimit } from "@/lib/rateLimit";

export type AuthState = { error?: string } | undefined;

export async function loginAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { error: "Preencha e-mail e senha." };
  }

  // No máximo 10 tentativas a cada 15 min por e-mail — dificulta força
  // bruta sem travar alguém que só errou a senha algumas vezes.
  if (!checkRateLimit(`login:${email}`, 10, 15 * 60 * 1000)) {
    return { error: "Muitas tentativas. Aguarde alguns minutos e tente novamente." };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { error: "E-mail ou senha incorretos." };
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return { error: "E-mail ou senha incorretos." };
  }

  const token = await createSessionToken(user.id);
  await setSessionCookie(token);
  redirect("/dashboard");
}

export async function registerAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const name = String(formData.get("name") || "").trim();
  const companyName = String(formData.get("companyName") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!name || !email || !password) {
    return { error: "Preencha nome, e-mail e senha." };
  }
  if (password.length < 8) {
    return { error: "A senha precisa ter pelo menos 8 caracteres." };
  }

  if (!checkRateLimit(`register:${email}`, 5, 60 * 60 * 1000)) {
    return { error: "Muitas tentativas. Aguarde um pouco e tente novamente." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Já existe uma conta com esse e-mail." };
  }

  const refCode = String(formData.get("ref") || "").trim();
  const referrer = refCode
    ? await prisma.user.findUnique({ where: { referralCode: refCode } })
    : null;

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      name,
      companyName: companyName || null,
      email,
      passwordHash,
      referredById: referrer?.id,
    },
  });

  await provisionNewUser(user.id, user.companyName);

  const token = await createSessionToken(user.id);
  await setSessionCookie(token);
  redirect("/dashboard");
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/login");
}
