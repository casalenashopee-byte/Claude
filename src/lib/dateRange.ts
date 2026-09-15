export type PeriodKey =
  | "hoje"
  | "7d"
  | "30d"
  | "mes"
  | "3m"
  | "6m"
  | "12m";

export function periodLabel(key: PeriodKey) {
  const map: Record<PeriodKey, string> = {
    hoje: "Hoje",
    "7d": "Últimos 7 dias",
    "30d": "Últimos 30 dias",
    mes: "Este mês",
    "3m": "Últimos 3 meses",
    "6m": "Últimos 6 meses",
    "12m": "Últimos 12 meses",
  };
  return map[key];
}

export function rangeFromPeriod(key: PeriodKey, now = new Date()) {
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  switch (key) {
    case "hoje":
      break;
    case "7d":
      start.setDate(start.getDate() - 6);
      break;
    case "30d":
      start.setDate(start.getDate() - 29);
      break;
    case "mes":
      start.setDate(1);
      break;
    case "3m":
      start.setMonth(start.getMonth() - 3);
      break;
    case "6m":
      start.setMonth(start.getMonth() - 6);
      break;
    case "12m":
      start.setMonth(start.getMonth() - 12);
      break;
  }

  return { start, end };
}

/** Período imediatamente anterior, de mesma duração — usado nas comparações de crescimento. */
export function previousRange(start: Date, end: Date) {
  const durationMs = end.getTime() - start.getTime();
  const prevEnd = new Date(start.getTime() - 1);
  const prevStart = new Date(prevEnd.getTime() - durationMs);
  return { start: prevStart, end: prevEnd };
}
