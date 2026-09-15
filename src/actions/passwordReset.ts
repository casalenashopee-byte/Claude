"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { generateRawToken, hashToken } from "@/lib/token";
import { hashPassword } from "@/lib/auth";
import { sendMail } from "@/lib/mailer";

export type FormState = { error?: string; success?: string } | undefined;

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hora

async function getOrigin() {
  const h = await headers();
  const host = h.get("host") || "localhost:3000";
  const proto = host.startsWith("localhost") ? "http" : "https";
  return `${proto}://${host}`;
}

export async function requestPasswordResetAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  if (!email) return { error: "Informe seu e-mail." };

  // Resposta sempre genérica — não revela se o e-mail existe (evita enumeração de contas).
  const genericSuccess = {
    success:
      "Se esse e-mail tiver uma conta, enviamos um link de redefinição. Confira sua caixa de entrada (e o spam).",
  };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return genericSuccess;

  const rawToken = generateRawToken();
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(rawToken),
      expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
    },
  });

  const origin = await getOrigin();
  const link = `${origin}/redefinir-senha/${rawToken}`;

  const result = await sendMail({
    to: user.email,
    subject: "Redefinir sua senha — VendaFácil",
    text: `Clique no link para redefinir sua senha (válido por 1 hora): ${link}`,
    html: `<p>Clique no link para redefinir sua senha (válido por 1 hora):</p><p><a href="${link}">${link}</a></p>`,
  });

  if (!result.sent) {
    // Sem SMTP configurado: não dá pra mandar e-mail, mas também não dá pra
    // mostrar o link na tela (qualquer um poderia digitar o e-mail de outra
    // pessoa e sequestrar a conta). Registrado só no log do servidor, que só
    // quem hospeda o app enxerga.
    console.log(
      `[reset-senha] SMTP não configurado. Link para ${email} (válido 1h): ${link}`
    );
  }

  return genericSuccess;
}

export async function resetPasswordAction(
  token: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const password = String(formData.get("password") || "");
  if (password.length < 8) {
    return { error: "A senha precisa ter pelo menos 8 caracteres." };
  }

  const tokenHash = hashToken(token);
  const resetToken = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });

  if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
    return { error: "Link inválido ou expirado. Solicite um novo." };
  }

  const passwordHash = await hashPassword(password);
  await prisma.$transaction([
    prisma.user.update({ where: { id: resetToken.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    }),
  ]);

  redirect("/login?reset=1");
}

export async function isResetTokenValid(token: string) {
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(token) },
  });
  return Boolean(resetToken && !resetToken.usedAt && resetToken.expiresAt > new Date());
}
