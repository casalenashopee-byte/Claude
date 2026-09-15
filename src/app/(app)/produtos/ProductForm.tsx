"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { Button, LinkButton } from "@/components/ui/Button";
import { FieldGroup, Input, Label, Select, Textarea } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { ImageUploadButton } from "@/components/ui/ImageUploadButton";
import { suggestedPrice, formatBRL } from "@/lib/calc";
import type { FormState } from "@/actions/products";

type Option = { id: string; name: string };

type VariationOption = { value: string; price: string };
type VariationAttr = { name: string; options: VariationOption[] };

const TABS = [
  { key: "geral", label: "Geral" },
  { key: "financeiro", label: "Financeiro" },
  { key: "estoque", label: "Estoque" },
  { key: "variacoes", label: "Variações" },
  { key: "fornecedor", label: "Fornecedor" },
  { key: "canais", label: "Canais" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export function ProductForm({
  action,
  categories,
  suppliers,
  channels,
  defaults,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  categories: Option[];
  suppliers: Option[];
  channels: Option[];
  defaults?: {
    type?: string;
    name?: string;
    brand?: string | null;
    status?: boolean;
    categoryId?: string | null;
    description?: string | null;
    images?: string;
    costPrice?: number;
    targetMarginPct?: number;
    retailPrice?: number;
    hasWholesale?: boolean;
    wholesalePrice?: number | null;
    stockQty?: number;
    lowStockAlert?: number;
    unit?: string;
    weight?: number | null;
    dimensions?: string | null;
    sku?: string | null;
    barcode?: string | null;
    variations?: string;
    supplierId?: string | null;
    purchaseDate?: Date | null;
    supplierNotes?: string | null;
    channelIds?: string;
    inCatalog?: boolean;
    inStore?: boolean;
  };
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [tab, setTab] = useState<TabKey>("geral");

  // Campos obrigatórios podem estar numa aba escondida — leva o usuário até
  // ela em vez de deixar o erro sem contexto.
  useEffect(() => {
    if (!state?.error) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sincroniza com o resultado da server action, não com estado local
    if (state.error.toLowerCase().includes("varejo")) setTab("financeiro");
    else if (state.error.toLowerCase().includes("nome")) setTab("geral");
  }, [state]);

  const [type, setType] = useState(defaults?.type || "FISICO");
  const [costPrice, setCostPrice] = useState(String(defaults?.costPrice ?? ""));
  const [targetMarginPct, setTargetMarginPct] = useState(
    String(defaults?.targetMarginPct ?? 30)
  );
  const [retailPrice, setRetailPrice] = useState(String(defaults?.retailPrice ?? ""));
  const [hasWholesale, setHasWholesale] = useState(defaults?.hasWholesale ?? false);

  const [images, setImages] = useState<string[]>(() => {
    try {
      return JSON.parse(defaults?.images || "[]");
    } catch {
      return [];
    }
  });
  const [imageUrl, setImageUrl] = useState("");

  const [attrs, setAttrs] = useState<VariationAttr[]>(() => {
    try {
      return JSON.parse(defaults?.variations || "[]");
    } catch {
      return [];
    }
  });

  const [selectedChannels, setSelectedChannels] = useState<string[]>(() => {
    try {
      return JSON.parse(defaults?.channelIds || "[]");
    } catch {
      return [];
    }
  });

  const suggestion = useMemo(() => {
    const cost = parseFloat(costPrice) || 0;
    const margin = parseFloat(targetMarginPct) || 0;
    if (!cost) return null;
    return suggestedPrice(cost, margin);
  }, [costPrice, targetMarginPct]);

  const combos = useMemo(() => buildCombos(attrs), [attrs]);

  function toggleChannel(id: string) {
    setSelectedChannels((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="flex flex-wrap gap-1 rounded-xl border border-border bg-surface-muted p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={clsx(
              "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              tab === t.key
                ? "bg-surface shadow-sm text-foreground"
                : "text-muted hover:text-foreground"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-surface p-6">
        {/* GERAL */}
        <div className={clsx("space-y-4", tab !== "geral" && "hidden")}>
          <FieldGroup>
            <Label>Tipo de item</Label>
            <Select name="type" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="FISICO">Produto físico</option>
              <option value="SERVICO">Serviço</option>
              <option value="DIGITAL">Produto digital</option>
            </Select>
          </FieldGroup>
          <FieldGroup>
            <Label>Nome</Label>
            <Input name="name" autoFocus defaultValue={defaults?.name} />
          </FieldGroup>
          <div className="grid grid-cols-2 gap-3">
            <FieldGroup>
              <Label>Marca</Label>
              <Input name="brand" defaultValue={defaults?.brand ?? ""} />
            </FieldGroup>
            <FieldGroup>
              <Label>Categoria</Label>
              <Select name="categoryId" defaultValue={defaults?.categoryId ?? ""}>
                <option value="">Sem categoria</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </FieldGroup>
          </div>
          <FieldGroup>
            <Label>Descrição</Label>
            <Textarea name="description" rows={3} defaultValue={defaults?.description ?? ""} />
          </FieldGroup>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="status"
              defaultChecked={defaults?.status ?? true}
              className="h-4 w-4 rounded border-border"
            />
            Produto ativo
          </label>

          <FieldGroup>
            <Label>Fotos</Label>
            <div className="flex flex-wrap items-center gap-2">
              <ImageUploadButton
                label="Enviar fotos do dispositivo"
                multiple
                onPick={(dataUrls) => setImages((prev) => [...prev, ...dataUrls])}
              />
              <span className="text-xs text-muted">ou</span>
              <Input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="cole uma URL"
                className="max-w-[220px]"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  if (!imageUrl.trim()) return;
                  setImages((prev) => [...prev, imageUrl.trim()]);
                  setImageUrl("");
                }}
              >
                Adicionar
              </Button>
            </div>
            {images.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {images.map((url, i) => (
                  <div key={i} className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt=""
                      className="h-16 w-16 rounded-lg object-cover border border-border"
                    />
                    <button
                      type="button"
                      onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                      className="absolute -right-1.5 -top-1.5 rounded-full bg-danger text-white p-0.5"
                    >
                      <Icon name="X" size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <input type="hidden" name="images" value={JSON.stringify(images)} />
          </FieldGroup>
        </div>

        {/* FINANCEIRO */}
        <div className={clsx("space-y-4", tab !== "financeiro" && "hidden")}>
          <div className="grid grid-cols-2 gap-3">
            <FieldGroup>
              <Label>Preço de custo</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                name="costPrice"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
              />
            </FieldGroup>
            <FieldGroup>
              <Label>Margem alvo (%)</Label>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="99"
                name="targetMarginPct"
                value={targetMarginPct}
                onChange={(e) => setTargetMarginPct(e.target.value)}
              />
            </FieldGroup>
          </div>

          {suggestion !== null && (
            <p className="text-sm text-muted">
              Preço sugerido pela margem:{" "}
              <button
                type="button"
                className="font-medium text-brand hover:underline"
                onClick={() => setRetailPrice(String(suggestion))}
              >
                {formatBRL(suggestion)} · usar este valor
              </button>
            </p>
          )}

          <FieldGroup>
            <Label>Preço de varejo</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              name="retailPrice"
              value={retailPrice}
              onChange={(e) => setRetailPrice(e.target.value)}
            />
          </FieldGroup>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="hasWholesale"
              checked={hasWholesale}
              onChange={(e) => setHasWholesale(e.target.checked)}
              className="h-4 w-4 rounded border-border"
            />
            Ativar preço de atacado
          </label>

          {hasWholesale && (
            <FieldGroup>
              <Label>Preço de atacado</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                name="wholesalePrice"
                defaultValue={defaults?.wholesalePrice ?? ""}
              />
            </FieldGroup>
          )}
        </div>

        {/* ESTOQUE */}
        <div className={clsx("space-y-4", tab !== "estoque" && "hidden")}>
          <div className="grid grid-cols-2 gap-3">
            <FieldGroup>
              <Label>Quantidade em estoque</Label>
              <Input type="number" step="1" name="stockQty" defaultValue={defaults?.stockQty ?? 0} />
            </FieldGroup>
            <FieldGroup>
              <Label>Alerta de estoque baixo</Label>
              <Input
                type="number"
                step="1"
                name="lowStockAlert"
                defaultValue={defaults?.lowStockAlert ?? 0}
              />
            </FieldGroup>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FieldGroup>
              <Label>Unidade de medida</Label>
              <Input name="unit" defaultValue={defaults?.unit ?? "un"} />
            </FieldGroup>
            <FieldGroup>
              <Label>Peso (kg)</Label>
              <Input type="number" step="0.01" name="weight" defaultValue={defaults?.weight ?? ""} />
            </FieldGroup>
          </div>
          <FieldGroup>
            <Label>Dimensões</Label>
            <Input name="dimensions" placeholder="L x A x P (cm)" defaultValue={defaults?.dimensions ?? ""} />
          </FieldGroup>
          <div className="grid grid-cols-2 gap-3">
            <FieldGroup>
              <Label hint="deixe em branco para gerar automaticamente">SKU</Label>
              <Input name="sku" defaultValue={defaults?.sku ?? ""} />
            </FieldGroup>
            <FieldGroup>
              <Label>Código de barras (EAN/GTIN)</Label>
              <Input name="barcode" defaultValue={defaults?.barcode ?? ""} />
            </FieldGroup>
          </div>
        </div>

        {/* VARIAÇÕES */}
        <div className={clsx("space-y-4", tab !== "variacoes" && "hidden")}>
          <p className="text-sm text-muted">
            Atributos livres (cor, tamanho…). O preço de cada combinação é a
            soma dos preços das opções só quando todas estiverem precificadas
            — senão usa o preço de varejo.
          </p>

          {attrs.map((attr, ai) => (
            <div key={ai} className="rounded-xl border border-border p-3 space-y-2">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Nome do atributo (ex: Cor)"
                  value={attr.name}
                  onChange={(e) =>
                    setAttrs((prev) =>
                      prev.map((a, i) => (i === ai ? { ...a, name: e.target.value } : a))
                    )
                  }
                />
                <button
                  type="button"
                  onClick={() => setAttrs((prev) => prev.filter((_, i) => i !== ai))}
                  className="rounded-lg p-2 text-muted hover:bg-danger-soft hover:text-danger"
                >
                  <Icon name="Trash2" size={16} />
                </button>
              </div>

              <div className="space-y-1.5">
                {attr.options.map((opt, oi) => (
                  <div key={oi} className="flex items-center gap-2">
                    <Input
                      placeholder="Valor (ex: Azul)"
                      value={opt.value}
                      onChange={(e) =>
                        setAttrs((prev) =>
                          prev.map((a, i) =>
                            i === ai
                              ? {
                                  ...a,
                                  options: a.options.map((o, j) =>
                                    j === oi ? { ...o, value: e.target.value } : o
                                  ),
                                }
                              : a
                          )
                        )
                      }
                    />
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Preço adicional"
                      className="w-40"
                      value={opt.price}
                      onChange={(e) =>
                        setAttrs((prev) =>
                          prev.map((a, i) =>
                            i === ai
                              ? {
                                  ...a,
                                  options: a.options.map((o, j) =>
                                    j === oi ? { ...o, price: e.target.value } : o
                                  ),
                                }
                              : a
                          )
                        )
                      }
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setAttrs((prev) =>
                          prev.map((a, i) =>
                            i === ai
                              ? { ...a, options: a.options.filter((_, j) => j !== oi) }
                              : a
                          )
                        )
                      }
                      className="rounded-lg p-2 text-muted hover:bg-danger-soft hover:text-danger"
                    >
                      <Icon name="X" size={14} />
                    </button>
                  </div>
                ))}
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    setAttrs((prev) =>
                      prev.map((a, i) =>
                        i === ai
                          ? { ...a, options: [...a.options, { value: "", price: "" }] }
                          : a
                      )
                    )
                  }
                >
                  <Icon name="Plus" size={14} /> Adicionar opção
                </Button>
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="secondary"
            onClick={() => setAttrs((prev) => [...prev, { name: "", options: [] }])}
          >
            <Icon name="Plus" size={16} /> Adicionar atributo
          </Button>

          {combos.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-medium text-muted mb-2">
                Pré-visualização das combinações
              </p>
              <div className="flex flex-wrap gap-2">
                {combos.map((c, i) => (
                  <span key={i} className="rounded-full bg-surface-muted px-3 py-1 text-xs">
                    {c.label}
                    {c.price !== null && ` · +${c.price.toFixed(2)}`}
                  </span>
                ))}
              </div>
            </div>
          )}

          <input type="hidden" name="variations" value={JSON.stringify(attrs)} />
        </div>

        {/* FORNECEDOR */}
        <div className={clsx("space-y-4", tab !== "fornecedor" && "hidden")}>
          <FieldGroup>
            <Label>Fornecedor</Label>
            <Select name="supplierId" defaultValue={defaults?.supplierId ?? ""}>
              <option value="">Nenhum</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </FieldGroup>
          <FieldGroup>
            <Label>Data da compra</Label>
            <Input
              type="date"
              name="purchaseDate"
              defaultValue={
                defaults?.purchaseDate
                  ? new Date(defaults.purchaseDate).toISOString().slice(0, 10)
                  : ""
              }
            />
          </FieldGroup>
          <FieldGroup>
            <Label hint="não aparecem no catálogo">Observações internas</Label>
            <Textarea name="supplierNotes" rows={3} defaultValue={defaults?.supplierNotes ?? ""} />
          </FieldGroup>
        </div>

        {/* CANAIS */}
        <div className={clsx("space-y-4", tab !== "canais" && "hidden")}>
          <p className="text-sm text-muted">Onde este produto pode ser vendido.</p>
          <div className="flex flex-wrap gap-2">
            {channels.map((c) => (
              <button
                type="button"
                key={c.id}
                onClick={() => toggleChannel(c.id)}
                className={clsx(
                  "rounded-full border px-3 py-1.5 text-sm transition-colors",
                  selectedChannels.includes(c.id)
                    ? "border-brand bg-brand-soft text-brand-strong"
                    : "border-border text-muted hover:bg-surface-muted"
                )}
              >
                {c.name}
              </button>
            ))}
          </div>
          <input type="hidden" name="channelIds" value={JSON.stringify(selectedChannels)} />

          <div className="flex flex-col gap-2 pt-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="inCatalog"
                defaultChecked={defaults?.inCatalog ?? false}
                className="h-4 w-4 rounded border-border"
              />
              Adicionar ao catálogo online
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="inStore"
                defaultChecked={defaults?.inStore ?? false}
                className="h-4 w-4 rounded border-border"
              />
              Adicionar à loja virtual
            </label>
          </div>
        </div>
      </div>

      {state?.error && (
        <p className="text-sm text-danger bg-danger-soft rounded-lg px-3 py-2">
          {state.error}
        </p>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando…" : "Salvar produto"}
        </Button>
        <LinkButton href="/produtos" variant="secondary">
          Cancelar
        </LinkButton>
      </div>
    </form>
  );
}

function buildCombos(attrs: VariationAttr[]) {
  const usable = attrs.filter((a) => a.name && a.options.length > 0);
  if (usable.length === 0) return [];

  let combos: { label: string; price: number | null }[] = [{ label: "", price: 0 }];

  for (const attr of usable) {
    const next: typeof combos = [];
    for (const combo of combos) {
      for (const opt of attr.options) {
        if (!opt.value) continue;
        const priceVal = opt.price !== "" ? parseFloat(opt.price) : null;
        next.push({
          label: combo.label ? `${combo.label} / ${opt.value}` : opt.value,
          price:
            combo.price === null || priceVal === null
              ? null
              : combo.price + priceVal,
        });
      }
    }
    combos = next;
  }

  return combos.filter((c) => c.label);
}
