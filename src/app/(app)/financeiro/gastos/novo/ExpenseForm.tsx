"use client";

import { useActionState } from "react";
import { Button, LinkButton } from "@/components/ui/Button";
import { FieldGroup, Input, Label } from "@/components/ui/Field";
import type { FormState } from "@/actions/expenses";

export function ExpenseForm({
  action,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="max-w-md space-y-4 rounded-2xl border border-border bg-surface p-6">
      <FieldGroup>
        <Label>Categoria</Label>
        <Input name="category" required autoFocus placeholder="Ex: Aluguel, Tráfego pago, Frete" />
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
        <Label>Descrição</Label>
        <Input name="description" />
      </FieldGroup>

      {state?.error && (
        <p className="text-sm text-danger bg-danger-soft rounded-lg px-3 py-2">{state.error}</p>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando…" : "Salvar gasto"}
        </Button>
        <LinkButton href="/financeiro/gastos" variant="secondary">
          Cancelar
        </LinkButton>
      </div>
    </form>
  );
}
