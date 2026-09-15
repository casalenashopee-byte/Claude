// Regras de cálculo financeiro usadas em Produtos, Vendas e Analytics.
// Mantidas centralizadas aqui para não duplicar a lógica em cada tela
// (mesmo espírito do "uma tabela de taxas usada em todo lugar" do produto original).

export type FeeInput = {
  feePct: number;
  feeFixed: number;
};

/** Preço de venda sugerido a partir do custo e da margem alvo (% sobre o preço de venda). */
export function suggestedPrice(cost: number, targetMarginPct: number) {
  const margin = Math.min(Math.max(targetMarginPct, 0), 99) / 100;
  if (margin <= 0) return cost;
  return round2(cost / (1 - margin));
}

/** Taxa cobrada por um meio de pagamento sobre um valor. */
export function paymentFee(method: FeeInput, amount: number) {
  if (amount <= 0) return 0;
  return round2((amount * method.feePct) / 100 + method.feeFixed);
}

export type SaleItemInput = {
  qty: number;
  price: number;
  cost: number;
};

export type SaleTotals = {
  subtotal: number;
  totalCost: number;
  totalCharged: number;
  feeAmount: number;
  netProfit: number;
};

/** Recalcula os totais de uma venda a cada mudança — mesma engenharia usada nos orçamentos/OS. */
export function calcSaleTotals(params: {
  items: SaleItemInput[];
  discount: number;
  extraCosts: number;
  paymentMethod: FeeInput;
}): SaleTotals {
  const { items, discount, extraCosts, paymentMethod } = params;

  const subtotal = round2(items.reduce((sum, i) => sum + i.qty * i.price, 0));
  const totalCost = round2(items.reduce((sum, i) => sum + i.qty * i.cost, 0));
  const totalCharged = round2(Math.max(subtotal - discount, 0));
  const feeAmount = paymentFee(paymentMethod, totalCharged);
  const netProfit = round2(totalCharged - totalCost - feeAmount - extraCosts);

  return { subtotal, totalCost, totalCharged, feeAmount, netProfit };
}

/** Soma as taxas de uma venda cujo pagamento foi dividido entre vários métodos. */
export function calcSplitFee(splits: { method: FeeInput; amount: number }[]) {
  return round2(splits.reduce((sum, s) => sum + paymentFee(s.method, s.amount), 0));
}

export function round2(n: number) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function formatBRL(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatPct(n: number, digits = 1) {
  return `${n.toFixed(digits)}%`;
}
