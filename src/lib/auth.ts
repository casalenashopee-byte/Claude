import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE_NAME = "vf_session";
const ALG = "HS256";

const WEAK_SECRETS = new Set([
  "troque-este-valor-por-uma-string-aleatoria-longa",
  "dev-only-secret-mude-em-producao",
  "test-secret-nao-use-em-producao",
  "ci-secret-nao-use-em-producao",
  "secret",
  "changeme",
]);

function getSecretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error(
      "AUTH_SECRET não definido. Configure a variável de ambiente AUTH_SECRET (.env)."
    );
  }

  // Em produção, recusa rodar com o valor de exemplo do .env.example ou um
  // segredo curto demais — assinar sessões com um valor previsível permite
  // forjar o cookie de login de qualquer conta.
  if (process.env.NODE_ENV === "production") {
    const looksWeak = secret.length < 32 || WEAK_SECRETS.has(secret);
    if (looksWeak) {
      throw new Error(
        "AUTH_SECRET fraco ou de exemplo detectado em produção. Gere um valor aleatório longo (ex.: `openssl rand -hex 32`) antes de publicar."
      );
    }
  }

  return new TextEncoder().encode(secret);
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(userId: string) {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getSecretKey());
}

export async function verifySessionToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload.sub as string | undefined;
  } catch {
    return undefined;
  }
}

export async function setSessionCookie(token: string) {
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function getSessionUserId() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return undefined;
  return verifySessionToken(token);
}

export { COOKIE_NAME };
