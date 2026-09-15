import { prisma } from "./prisma";
import { round2 } from "./calc";
import { rangeFromPeriod, type PeriodKey } from "./dateRange";

export async function getDashboardData(userId: string, period: PeriodKey) {
  const { start, end } = rangeFromPeriod(period);

  const sales = await prisma.sale.findMany({
    where: { userId, createdAt: { gte: start, lte: end }, status: { not: "CANCELADO" } },
    include: { channel: true, paymentMethod: true, items: true, customer: true },
    orderBy: { createdAt: "desc" },
  });

  const totalVendas = round2(sales.reduce((s, sale) => s + sale.totalCharged, 0));
  const lucroLiquido = round2(sales.reduce((s, sale) => s + sale.netProfit, 0));
  const qtdVendida = round2(
    sales.reduce((s, sale) => s + sale.items.reduce((si, i) => si + i.qty, 0), 0)
  );
  const margem = totalVendas > 0 ? round2((lucroLiquido / totalVendas) * 100) : 0;

  const byChannel = new Map<string, number>();
  const byPayment = new Map<string, number>();
  for (const sale of sales) {
    byChannel.set(sale.channel.name, round2((byChannel.get(sale.channel.name) || 0) + sale.totalCharged));
    byPayment.set(
      sale.paymentMethod.name,
      round2((byPayment.get(sale.paymentMethod.name) || 0) + sale.totalCharged)
    );
  }

  const dailyMap = new Map<string, { receita: number; lucro: number }>();
  for (const sale of sales) {
    const key = sale.createdAt.toISOString().slice(0, 10);
    const cur = dailyMap.get(key) || { receita: 0, lucro: 0 };
    cur.receita = round2(cur.receita + sale.totalCharged);
    cur.lucro = round2(cur.lucro + sale.netProfit);
    dailyMap.set(key, cur);
  }
  const daily = [...dailyMap.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([date, v]) => ({ date, ...v }));

  const [productCount, lowStockProducts, pendingReceivables, cashEntryCount] = await Promise.all([
    prisma.product.count({ where: { userId } }),
    prisma.product.findMany({
      where: {
        userId,
        type: "FISICO",
        lowStockAlert: { gt: 0 },
      },
      select: { id: true, name: true, stockQty: true, lowStockAlert: true },
    }),
    prisma.sale.findMany({
      where: { userId, receiptType: "APRAZO", status: { in: ["PENDENTE", "ATRASADO"] } },
      select: { totalCharged: true },
    }),
    prisma.cashEntry.count({ where: { userId } }),
  ]);

  const lowStock = lowStockProducts.filter((p) => p.stockQty <= p.lowStockAlert);
  const totalPendingReceivable = round2(pendingReceivables.reduce((s, r) => s + r.totalCharged, 0));

  const [catalog, saleCountAllTime] = await Promise.all([
    prisma.catalogSettings.findUnique({ where: { userId } }),
    prisma.sale.count({ where: { userId } }),
  ]);
  void cashEntryCount;

  const catalogProductCount = catalog
    ? await prisma.product.count({ where: { userId, inCatalog: true } })
    : 0;

  return {
    range: { start, end },
    metrics: { totalVendas, lucroLiquido, qtdVendida, margem },
    byChannel: [...byChannel.entries()].sort((a, b) => b[1] - a[1]),
    byPayment: [...byPayment.entries()].sort((a, b) => b[1] - a[1]),
    daily,
    recentSales: sales.slice(0, 6),
    lowStock,
    totalPendingReceivable,
    steps: {
      hasProduct: productCount > 0,
      hasSale: saleCountAllTime > 0,
      hasCatalog: catalogProductCount > 0,
    },
  };
}
