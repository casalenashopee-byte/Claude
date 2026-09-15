import { headers } from "next/headers";

/**
 * URL canônica do app. Prioriza APP_URL (definida no .env) — confiar no
 * header Host da requisição é arriscado sempre que a URL vai para fora do
 * navegador (e-mail, link de indicação): alguém pode forjar esse header e
 * fazer o link apontar para um domínio próprio. Em links que carregam um
 * segredo (ex.: redefinição de senha) isso é ainda mais sério.
 */
export async function getAppOrigin() {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, "");

  const h = await headers();
  const host = h.get("host") || "localhost:3000";
  const proto = host.startsWith("localhost") ? "http" : "https";
  return `${proto}://${host}`;
}
