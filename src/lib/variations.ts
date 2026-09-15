export type VariationOption = { value: string; price: string };
export type VariationAttr = { name: string; options: VariationOption[] };

export function parseVariations(json: string | null | undefined): VariationAttr[] {
  try {
    const attrs = JSON.parse(json || "[]");
    if (!Array.isArray(attrs)) return [];
    return attrs.filter((a) => a?.name && Array.isArray(a.options) && a.options.length > 0);
  } catch {
    return [];
  }
}

/**
 * Preço adicional de uma combinação escolhida (uma opção por atributo).
 * Só soma quando TODAS as opções selecionadas têm preço definido —
 * senão retorna null e quem chama usa o preço base do produto.
 */
export function combinationExtraPrice(
  attrs: VariationAttr[],
  selection: Record<string, string>
): number | null {
  let sum = 0;
  for (const attr of attrs) {
    const chosen = selection[attr.name];
    const option = attr.options.find((o) => o.value === chosen);
    if (!option || option.price === "" || option.price === undefined) return null;
    const price = parseFloat(option.price);
    if (Number.isNaN(price)) return null;
    sum += price;
  }
  return sum;
}

export function combinationLabel(selection: Record<string, string>) {
  return Object.values(selection).filter(Boolean).join(" / ");
}
