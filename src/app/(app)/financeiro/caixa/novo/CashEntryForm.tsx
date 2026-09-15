"use client";

import { useActionState, useState } from "react";
import { Button, LinkButton } from "@/components/ui/Button";
import { FieldGroup, Input, Label, Select } from "@/components/ui/Field";
import type { FormState } from "@/actions/cashEntries";

export function CashEntryForm({
  action,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [type, setType] = useState<"ENTRADA" | "SAIDA">("SAIDA");

  return (
    <form action={formAction} className="max-w-md space-y-4 rounded-2xl border border-border bg-surface p-6">
      <FieldGroup>
        <Label>Tipo</Label>
        <Select name="type" value={type} onChange={(e) => setType(e.target.value as typeof type)}>
          <option value="ENTRADA">Entrada</option>
          <option value="SAIDA">Saída</option>
        </Select>
      </FieldGroup>
      <div className="grid grid-cols-2 gap-3">
        <FieldGroup>
          <Label>Valor (R$)</Label>
          <Input type="number" step="0.01" min="0" name="amount" required />
        </FieldGroup>
        <FieldGroup>
          <Label>Data</Label>
          <Input type="date" name="date" defaultValue={new Date().toISOString().slice(0, 10)} />
        </FieldGroup>
      </div>
      <FieldGroup>
        <Label>Categoria</Label>
        <Input name="category" placeholder="Ex: retirada de sócio" />
      </FieldGroup>
      <FieldGroup>
        <Label>Descrição</Label>
        <Input name="description" />
      </FieldGroup>

      <div className="space-y-2 rounded-lg bg-surface-muted p-3">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="impactsProfit" className="h-4 w-4 rounded border-border" />
          Impacta o lucro
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="movesCash" defaultChecked className="h-4 w-4 rounded border-border" />
          Movimenta o caixa
        </label>
        <p className="text-xs text-muted">
          Os dois toggles são independentes — ex: retirada de sócio movimenta o
          caixa mas não impacta o lucro.
        </p>
      </div>

      {state?.error && (
        <p className="text-sm text-danger bg-danger-soft rounded-lg px-3 py-2">{state.error}</p>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando…" : "Salvar lançamento"}
        </Button>
        <LinkButton href="/financeiro/caixa" variant="secondary">
          Cancelar
        </LinkButton>
      </div>
    </form>
  );
}
