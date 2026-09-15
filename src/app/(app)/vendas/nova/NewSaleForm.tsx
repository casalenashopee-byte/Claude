"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { Button, LinkButton } from "@/components/ui/Button";
import { FieldGroup, Input, Label, Select, Textarea } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { formatBRL, paymentFee, round2 } from "@/lib/calc";
import type { FormState } from "@/actions/sales";

type Product = { id: string; name: string; retailPrice: number; costPrice: number; unit: string };
type Channel = { id: string; name: string };
type PaymentMethod = { id: string; name: string; feePct: number; feeFixed: number };
type Customer = { id: string; name: string };

type Item = { productId?: string; name: string; qty: number; price: number; cost: number };
type Split = { paymentMethodId: string; amount: number };

export function NewSaleForm({
  action,
  products,
  channels,
  paymentMethods,
  customers,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  products: Product[];
  channels: Channel[];
  paymentMethods: PaymentMethod[];
  customers: Customer[];
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  const [items, setItems] = useState<Item[]>([]);
  const [productPick, setProductPick] = useState("");

  const [channelId, setChannelId] = useState(channels[0]?.id || "");
  const [customerMode, setCustomerMode] = useState<"none" | "existing" | "free">("none");
  const [customerId, setCustomerId] = useState("");
  const [customerName, setCustomerName] = useState("");

  const [receiptType, setReceiptType] = useState<"AVISTA" | "APRAZO">("AVISTA");
  const [dueDate, setDueDate] = useState("");

  const [splits, setSplits] = useState<Split[]>(() =>
    paymentMethods[0] ? [{ paymentMethodId: paymentMethods[0].id, amount: 0 }] : []
  );

  const [discount, setDiscount] = useState("0");
  const [extraCosts, setExtraCosts] = useState("0");
  const [extraCostsDesc, setExtraCostsDesc] = useState("");
  const [notes, setNotes] = useState("");

  const subtotal = useMemo(
    () => round2(items.reduce((sum, i) => sum + i.qty * i.price, 0)),
    [items]
  );
  const totalCost = useMemo(
    () => round2(items.reduce((sum, i) => sum + i.qty * i.cost, 0)),
    [items]
  );
  const totalCharged = useMemo(
    () => round2(Math.max(subtotal - (parseFloat(discount) || 0), 0)),
    [subtotal, discount]
  );

  // Mantém o valor do único método de pagamento sincronizado com o total, até o usuário dividir.
  useEffect(() => {
    if (splits.length === 1) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sincroniza com o total calculado, não com props/estado local
      setSplits([{ ...splits[0], amount: totalCharged }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalCharged]);

  const methodMap = useMemo(() => new Map(paymentMethods.map((m) => [m.id, m])), [paymentMethods]);

  const feeAmount = useMemo(
    () =>
      round2(
        splits.reduce((sum, s) => {
          const m = methodMap.get(s.paymentMethodId);
          if (!m) return sum;
          return sum + paymentFee(m, s.amount);
        }, 0)
      ),
    [splits, methodMap]
  );

  const netProfit = round2(
    totalCharged - totalCost - feeAmount - (parseFloat(extraCosts) || 0)
  );

  const splitSum = round2(splits.reduce((sum, s) => sum + s.amount, 0));
  const splitMismatch = splits.length > 1 && Math.abs(splitSum - totalCharged) > 0.01;

  function addProduct() {
    const product = products.find((p) => p.id === productPick);
    if (!product) return;
    setItems((prev) => [
      ...prev,
      {
        productId: product.id,
        name: product.name,
        qty: 1,
        price: product.retailPrice,
        cost: product.costPrice,
      },
    ]);
    setProductPick("");
  }

  function addCustomItem() {
    setItems((prev) => [...prev, { name: "Item avulso", qty: 1, price: 0, cost: 0 }]);
  }

  return (
    <form action={formAction} className="space-y-4 pb-28">
      <div className="rounded-2xl border border-border bg-surface p-6 space-y-4">
        <h3 className="text-base font-semibold">Itens</h3>

        <div className="flex flex-wrap gap-2">
          <Select value={productPick} onChange={(e) => setProductPick(e.target.value)} className="flex-1 min-w-[200px]">
            <option value="">Buscar produto…</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} · {formatBRL(p.retailPrice)}
              </option>
            ))}
          </Select>
          <Button type="button" variant="secondary" onClick={addProduct} disabled={!productPick}>
            Adicionar
          </Button>
          <Button type="button" variant="ghost" onClick={addCustomItem}>
            Item avulso
          </Button>
        </div>

        {items.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-muted">
                <tr>
                  <th className="py-2 font-medium">Item</th>
                  <th className="py-2 font-medium w-20">Qtd.</th>
                  <th className="py-2 font-medium w-28">Preço</th>
                  <th className="py-2 font-medium w-28">Subtotal</th>
                  <th className="py-2 w-8"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="py-2 pr-2">{item.name}</td>
                    <td className="py-2 pr-2">
                      <Input
                        type="number"
                        step="1"
                        min="0"
                        value={item.qty}
                        onChange={(e) =>
                          setItems((prev) =>
                            prev.map((it, idx) =>
                              idx === i ? { ...it, qty: parseFloat(e.target.value) || 0 } : it
                            )
                          )
                        }
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.price}
                        onChange={(e) =>
                          setItems((prev) =>
                            prev.map((it, idx) =>
                              idx === i ? { ...it, price: parseFloat(e.target.value) || 0 } : it
                            )
                          )
                        }
                      />
                    </td>
                    <td className="py-2 pr-2 font-medium">{formatBRL(item.qty * item.price)}</td>
                    <td className="py-2">
                      <button
                        type="button"
                        onClick={() => setItems((prev) => prev.filter((_, idx) => idx !== i))}
                        className="rounded-lg p-1.5 text-muted hover:bg-danger-soft hover:text-danger"
                      >
                        <Icon name="Trash2" size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <input type="hidden" name="items" value={JSON.stringify(items)} />
      </div>

      <div className="rounded-2xl border border-border bg-surface p-6 space-y-4">
        <h3 className="text-base font-semibold">Canal e cliente</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <FieldGroup>
            <Label>Canal de venda</Label>
            <Select
              name="channelId"
              value={channelId}
              onChange={(e) => setChannelId(e.target.value)}
              required
            >
              {channels.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </FieldGroup>
          <FieldGroup>
            <Label>Cliente</Label>
            <Select value={customerMode} onChange={(e) => setCustomerMode(e.target.value as typeof customerMode)}>
              <option value="none">Não vinculado</option>
              <option value="existing">Cliente cadastrado</option>
              <option value="free">Nome livre</option>
            </Select>
          </FieldGroup>
        </div>

        {customerMode === "existing" && (
          <FieldGroup>
            <Label>Selecione o cliente</Label>
            <Select name="customerId" value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
              <option value="">Selecione…</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </FieldGroup>
        )}
        {customerMode === "free" && (
          <FieldGroup>
            <Label>Nome do cliente</Label>
            <Input
              name="customerName"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </FieldGroup>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-surface p-6 space-y-4">
        <h3 className="text-base font-semibold">Pagamento</h3>

        <div className="grid gap-3 sm:grid-cols-2">
          <FieldGroup>
            <Label>Tipo de recebimento</Label>
            <Select
              name="receiptType"
              value={receiptType}
              onChange={(e) => setReceiptType(e.target.value as typeof receiptType)}
            >
              <option value="AVISTA">À vista</option>
              <option value="APRAZO">A prazo</option>
            </Select>
          </FieldGroup>
          {receiptType === "APRAZO" && (
            <FieldGroup>
              <Label>Data de vencimento</Label>
              <Input
                type="date"
                name="dueDate"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </FieldGroup>
          )}
        </div>

        <div className="space-y-2">
          {splits.map((split, i) => (
            <div key={i} className="flex items-center gap-2">
              <Select
                value={split.paymentMethodId}
                onChange={(e) =>
                  setSplits((prev) =>
                    prev.map((s, idx) => (idx === i ? { ...s, paymentMethodId: e.target.value } : s))
                  )
                }
                className="flex-1"
              >
                {paymentMethods.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </Select>
              <Input
                type="number"
                step="0.01"
                min="0"
                className="w-32"
                value={split.amount}
                disabled={splits.length === 1}
                onChange={(e) =>
                  setSplits((prev) =>
                    prev.map((s, idx) =>
                      idx === i ? { ...s, amount: parseFloat(e.target.value) || 0 } : s
                    )
                  )
                }
              />
              {splits.length > 1 && (
                <button
                  type="button"
                  onClick={() => setSplits((prev) => prev.filter((_, idx) => idx !== i))}
                  className="rounded-lg p-1.5 text-muted hover:bg-danger-soft hover:text-danger"
                >
                  <Icon name="X" size={15} />
                </button>
              )}
            </div>
          ))}
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() =>
              setSplits((prev) => [
                ...prev,
                { paymentMethodId: paymentMethods[0]?.id || "", amount: 0 },
              ])
            }
          >
            <Icon name="Plus" size={14} /> Dividir em mais de um método
          </Button>
          {splitMismatch && (
            <p className="text-xs text-warning">
              A soma dos métodos ({formatBRL(splitSum)}) é diferente do total cobrado (
              {formatBRL(totalCharged)}).
            </p>
          )}
        </div>
        <input type="hidden" name="paymentSplit" value={JSON.stringify(splits)} />
      </div>

      <div className="rounded-2xl border border-border bg-surface p-6 space-y-4">
        <h3 className="text-base font-semibold">Descontos e gastos extras</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          <FieldGroup>
            <Label>Desconto (R$)</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              name="discount"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
            />
          </FieldGroup>
          <FieldGroup>
            <Label>Gastos extras (R$)</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              name="extraCosts"
              value={extraCosts}
              onChange={(e) => setExtraCosts(e.target.value)}
            />
          </FieldGroup>
          <FieldGroup>
            <Label>Descrição dos gastos</Label>
            <Input
              name="extraCostsDesc"
              placeholder="Ex: motoboy, embalagem"
              value={extraCostsDesc}
              onChange={(e) => setExtraCostsDesc(e.target.value)}
            />
          </FieldGroup>
        </div>
        <FieldGroup>
          <Label>Observações</Label>
          <Textarea name="notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </FieldGroup>
      </div>

      {state?.error && (
        <p className="text-sm text-danger bg-danger-soft rounded-lg px-3 py-2">{state.error}</p>
      )}

      <div className="fixed bottom-0 left-0 right-0 md:left-60 border-t border-border bg-surface/95 backdrop-blur px-4 py-3 md:px-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
            <span className="text-muted">
              Subtotal: <strong className="text-foreground">{formatBRL(subtotal)}</strong>
            </span>
            <span className="text-muted">
              Taxas: <strong className="text-foreground">{formatBRL(feeAmount)}</strong>
            </span>
            <span className="text-muted">
              Total cobrado: <strong className="text-foreground">{formatBRL(totalCharged)}</strong>
            </span>
            <span className={netProfit >= 0 ? "text-brand" : "text-danger"}>
              Lucro líquido: <strong>{formatBRL(netProfit)}</strong>
            </span>
          </div>
          <div className="flex gap-2">
            <LinkButton href="/vendas" variant="secondary">
              Cancelar
            </LinkButton>
            <Button type="submit" disabled={pending || items.length === 0}>
              {pending ? "Salvando…" : "Registrar venda"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
