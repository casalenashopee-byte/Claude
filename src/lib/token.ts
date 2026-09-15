import { randomBytes, createHash } from "crypto";

// Módulo separado de lib/auth.ts de propósito: usa a API nativa `crypto` do
// Node, que quebra o bundle do middleware (roda no Edge Runtime) se ficar
// junto de algo que o middleware importa. Só server actions importam isto.

/** Token de uso único (ex.: redefinir senha) — só o hash fica salvo no banco. */
export function generateRawToken() {
  return randomBytes(32).toString("hex");
}

export function hashToken(rawToken: string) {
  return createHash("sha256").update(rawToken).digest("hex");
}
