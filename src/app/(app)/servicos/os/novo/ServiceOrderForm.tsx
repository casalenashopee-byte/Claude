"use client";

import { useActionState, useState } from "react";
import { Button, LinkButton } from "@/components/ui/Button";
import { FieldGroup, Input, Label, Select, Textarea } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { formatBRL, round2 } from "@/lib/calc";
import type { FormState } from "@/actions/serviceOrders";

type Customer = { id: string; name: string };
type Item = { type: "servico" | "peca"; name: string; qty: number; price: number };

export function ServiceOrderForm({
  action,
  customers,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  customers: Customer[];
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [customerMode, setCustomerMode] = useState<"existing" | "free">("free");
  const [items, setItems] = useState<Item[]>([]);

  const total = round2(items.reduce((sum, i) => sum + i.qty * i.price, 0));

  return (
    <form action={formAction} className="space-y-4 max-w-2xl">
      <div className="rounded-2xl border border-border bg-surface p-6 space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <FieldGroup>
            <Label>Cliente</Label>
            <Select value={customerMode} onChange={(e) => setCustomerMode(e.target.value as typeof customerMode)}>
              <option value="free">Nome livre</option>
              <option value="existing">Cliente cadastrado</option>
            </Select>
          </FieldGroup>
          {customerMode === "existing" ? (
            <FieldGroup>
              <Label>Selecione</Label>
              <Select name="customerId">
                <option value="">Selecione…</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </FieldGroup>
          ) : (
            <FieldGroup>
              <Label>Nome</Label>
              <Input name="customerName" />
            </FieldGroup>
          )}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <FieldGroup>
            <Label>Equipamento</Label>
            <Input name="equipment" placeholder="Ex: iPhone 12" />
          </FieldGroup>
          <FieldGroup>
            <Label>IMEI/série</Label>
            <Input name="imei" />
          </FieldGroup>
        </div>
        <FieldGroup>
          <Label>Problema relatado</Label>
          <Textarea name="reportedProblem" rows={3} />
        </FieldGroup>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-6 space-y-3">
        <h3 className="text-base font-semibold">Serviços e peças</h3>
        <p className="text-sm text-muted">
          Opcionais para abrir a OS, mas obrigatórios para concluí-la.
        </p>
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <Select
              className="w-28"
              value={item.type}
              onChange={(e) =>
                setItems((prev) =>
                  prev.map((it, idx) =>
                    idx === i ? { ...it, type: e.target.value as Item["type"] } : it
                  )
                )
              }
            >
              <option value="servico">Serviço</option>
              <option value="peca">Peça</option>
            </Select>
            <Input
              placeholder="Descrição"
              value={item.name}
              onChange={(e) =>
                setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, name: e.target.value } : it)))
              }
              className="flex-1"
            />
            <Input
              type="number"
              step="1"
              min="0"
              className="w-20"
              value={item.qty}
              onChange={(e) =>
                setItems((prev) =>
                  prev.map((it, idx) => (idx === i ? { ...it, qty: parseFloat(e.target.value) || 0 } : it))
                )
              }
            />
            <Input
              type="number"
              step="0.01"
              min="0"
              className="w-28"
              value={item.price}
              onChange={(e) =>
                setItems((prev) =>
                  prev.map((it, idx) => (idx === i ? { ...it, price: parseFloat(e.target.value) || 0 } : it))
                )
              }
            />
            <button
              type="button"
              onClick={() => setItems((prev) => prev.filter((_, idx) => idx !== i))}
              className="rounded-lg p-1.5 text-muted hover:bg-danger-soft hover:text-danger"
            >
              <Icon name="Trash2" size={15} />
            </button>
          </div>
        ))}
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => setItems((prev) => [...prev, { type: "servico", name: "", qty: 1, price: 0 }])}
        >
          <Icon name="Plus" size={14} /> Adicionar item
        </Button>
        <input
          type="hidden"
          name="items"
          value={JSON.stringify(items.filter((i) => i.name))}
        />
        <p className="text-sm font-medium pt-2 border-t border-border">Total: {formatBRL(total)}</p>
      </div>

      {state?.error && (
        <p className="text-sm text-danger bg-danger-soft rounded-lg px-3 py-2">{state.error}</p>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando…" : "Abrir ordem de serviço"}
        </Button>
        <LinkButton href="/servicos?tab=os" variant="secondary">
          Cancelar
        </LinkButton>
      </div>
    </form>
  );
}
