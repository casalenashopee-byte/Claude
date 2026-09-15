/**
 * Limitador de taxa simples, em memória — suficiente para uma instância
 * única (o cenário padrão de self-host deste app). Limitações conhecidas:
 * reseta ao reiniciar o processo, e não é compartilhado entre múltiplas
 * instâncias atrás de um load balancer. Ainda assim, eleva bastante o custo
 * de um ataque de força bruta contra login/reset de senha.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

// Evita crescimento infinito do Map em um processo de longa duração.
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt < now) buckets.delete(key);
  }
}, 5 * 60 * 1000).unref?.();

/** Retorna true se a ação pode prosseguir, false se o limite foi excedido. */
export function checkRateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (bucket.count >= max) return false;

  bucket.count += 1;
  return true;
}
