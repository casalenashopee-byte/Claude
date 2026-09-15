import { prisma } from "./prisma";
import { round2 } from "./calc";
import { rangeFromPeriod, previousRange, type PeriodKey } from "./dateRange";
import { getCashOnHand } from "./cashflow";

const WEEKDAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

function pct(part: number, whole: number) {
  return whole > 0 ? round2((part / whole) * 100) : 0;
}

async function revenueAndProfit(userId: string, start: Date, end: Date) {
  const sales = await prisma.sale.findMany({
    where: { userId, createdAt: { gte: start, lte: end }, status: { not: "CANCELADO" } },
  });
  const expenses = await prisma.expense.findMany({ where: { userId, date: { gte: start, lte: end } } });

  const revenue = round2(sales.reduce((s, x) => s + x.totalCharged, 0));
  const cost = round2(sales.reduce((s, x) => s + x.totalCost, 0));
  const fees = round2(sales.reduce((s, x) => s + x.feeAmount, 0));
  const extra = round2(sales.reduce((s, x) => s + x.extraCosts, 0));
  const salesProfit = round2(sales.reduce((s, x) => s + x.netProfit, 0));
  const expensesSum = round2(expenses.reduce((s, x) => s + x.amount, 0));
  const netProfit = round2(salesProfit - expensesSum);

  return { sales, revenue, cost, fees, extra, expensesSum, netProfit };
}

/**
 * Métricas financeiras "de verdade" ao invés de só gráficos de vaidade —
 * algumas (giro, liquidez) usam o estoque/caixa atuais como aproximação,
 * já que o produto não guarda um histórico de saldo diário.
 */
export async function getAnalytics(userId: string, period: PeriodKey) {
  const { start, end } = rangeFromPeriod(period);
  const prev = previousRange(start, end);

  const current = await revenueAndProfit(userId, start, end);
  const previous = await revenueAndProfit(userId, prev.start, prev.end);

  const days = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1);

  // Eficiência
  const margemBruta = pct(current.revenue - current.cost, current.revenue);
  const margemAposTaxas = pct(current.revenue - current.cost - current.fees, current.revenue);
  const margemOperacional = pct(
    current.revenue - current.cost - current.fees - current.extra,
    current.revenue
  );
  const margemLiquida = pct(current.netProfit, current.revenue);
  const cmvPctReceita = pct(current.cost, current.revenue);
  const despesasPctReceita = pct(current.expensesSum, current.revenue);
  const taxasPctReceita = pct(current.fees, current.revenue);

  // Giro & ciclo — estoque médio do período (inicial + final) / 2, a fórmula
  // padrão de giro de estoque. O "inicial" é reconstruído somando de volta
  // ao estoque atual tudo que foi vendido no período (assume que nenhum
  // ajuste manual de estoque aconteceu no meio do caminho — a única lacuna
  // real seria uma correção manual de quantidade, que o produto não audita).
  const products = await prisma.product.findMany({
    where: { userId, type: "FISICO" },
    select: { id: true, costPrice: true, stockQty: true },
  });
  const soldQtyByProduct = await prisma.saleItem.groupBy({
    by: ["productId"],
    where: {
      productId: { not: null },
      sale: { userId, createdAt: { gte: start, lte: end }, status: { not: "CANCELADO" } },
    },
    _sum: { qty: true },
  });
  const soldQtyMap = new Map(soldQtyByProduct.map((r) => [r.productId, r._sum.qty || 0]));

  const endingInventoryValue = round2(products.reduce((s, p) => s + p.costPrice * p.stockQty, 0));
  const beginningInventoryValue = round2(
    products.reduce((s, p) => s + p.costPrice * (p.stockQty + (soldQtyMap.get(p.id) || 0)), 0)
  );
  const avgInventoryValue = round2((beginningInventoryValue + endingInventoryValue) / 2);

  const giro = avgInventoryValue > 0 ? round2(current.cost / avgInventoryValue) : 0;
  const diasEstoque = giro > 0 ? round2(days / giro) : 0;

  const pendingReceivable = await prisma.sale.aggregate({
    where: { userId, receiptType: "APRAZO", status: { in: ["PENDENTE", "ATRASADO"] } },
    _sum: { totalCharged: true },
  });
  const receivable = round2(pendingReceivable._sum.totalCharged || 0);
  const diasRecebimento = current.revenue > 0 ? round2((receivable / current.revenue) * days) : 0;
  const cicloCaixa = round2(diasEstoque + diasRecebimento);

  // Rentabilidade & liquidez
  const capitalOperacional = round2(current.cost + current.expensesSum);
  const retornoCapitalOperacional = pct(current.netProfit, capitalOperacional);
  const retornoEstoque = pct(current.netProfit, avgInventoryValue);

  const cashOnHand = await getCashOnHand(userId);
  const liquidezOperacional =
    current.expensesSum > 0 ? round2(cashOnHand / current.expensesSum) : 0;
  const liquidezReceber = pct(receivable, current.revenue);
  const coberturaDespesas =
    current.expensesSum > 0 ? round2(current.revenue / current.expensesSum) : 0;

  // Crescimento
  const deltaReceita = previous.revenue > 0
    ? round2(((current.revenue - previous.revenue) / previous.revenue) * 100)
    : null;
  const deltaLucro = previous.netProfit !== 0
    ? round2(((current.netProfit - previous.netProfit) / Math.abs(previous.netProfit)) * 100)
    : null;
  const margemLiquidaAnterior = pct(previous.netProfit, previous.revenue);
  const deltaMargem = round2(margemLiquida - margemLiquidaAnterior);

  // Top produtos & categorias
  const items = await prisma.saleItem.findMany({
    where: { sale: { userId, createdAt: { gte: start, lte: end }, status: { not: "CANCELADO" } } },
    include: { product: { include: { category: true } } },
  });
  const byProduct = new Map<string, { qty: number; total: number }>();
  const byCategory = new Map<string, number>();
  for (const item of items) {
    const key = item.name;
    const cur = byProduct.get(key) || { qty: 0, total: 0 };
    cur.qty = round2(cur.qty + item.qty);
    cur.total = round2(cur.total + item.subtotal);
    byProduct.set(key, cur);

    const catName = item.product?.category?.name || "Sem categoria";
    byCategory.set(catName, round2((byCategory.get(catName) || 0) + item.subtotal));
  }
  const topProducts = [...byProduct.entries()]
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 5)
    .map(([name, v]) => ({ name, ...v }));
  const categoryDistribution = [...byCategory.entries()].sort((a, b) => b[1] - a[1]);

  // Ticket médio, projeção, sazonalidade
  const ticketMedio = current.sales.length ? round2(current.revenue / current.sales.length) : 0;
  const dailyAvg = round2(current.revenue / days);
  const projecaoMensal = round2(dailyAvg * 30);

  const byWeekday = new Array(7).fill(0);
  for (const s of current.sales) byWeekday[s.createdAt.getDay()] += s.totalCharged;
  const bestWeekdayIndex = byWeekday.indexOf(Math.max(...byWeekday));

  return {
    period: { start, end, days },
    eficiencia: {
      margemBruta,
      margemAposTaxas,
      margemOperacional,
      margemLiquida,
      cmvPctReceita,
      despesasPctReceita,
      taxasPctReceita,
    },
    giroCiclo: { giro, diasEstoque, diasRecebimento, cicloCaixa },
    rentabilidadeLiquidez: {
      retornoCapitalOperacional,
      retornoEstoque,
      liquidezOperacional,
      liquidezReceber,
      coberturaDespesas,
    },
    crescimento: { deltaReceita, deltaLucro, deltaMargem },
    topProducts,
    categoryDistribution,
    ticketMedio,
    projecaoMensal,
    dailyAvg,
    bestWeekday: WEEKDAYS[bestWeekdayIndex],
    revenue: current.revenue,
    netProfit: current.netProfit,
  };
}
