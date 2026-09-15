"use client";

import { useActionState } from "react";
import { Button, LinkButton } from "@/components/ui/Button";
import { FieldGroup, Input, Label } from "@/components/ui/Field";
import type { FormState } from "@/actions/paymentMethods";

export function PaymentMethodForm({
  action,
  defaults,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  defaults?: {
    name?: string;
    feePct?: number;
    feeFixed?: number;
    active?: boolean;
  };
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="max-w-sm space-y-4 rounded-2xl border border-border bg-surface p-6">
      <FieldGroup>
        <Label>Nome</Label>
        <Input name="name" required autoFocus defaultValue={defaults?.name} placeholder="Ex: PIX" />
      </FieldGroup>
      <div className="grid grid-cols-2 gap-3">
        <FieldGroup>
          <Label>Taxa %</Label>
          <Input type="number" step="0.01" min="0" name="feePct" defaultValue={defaults?.feePct ?? 0} />
        </FieldGroup>
        <FieldGroup>
          <Label>Taxa fixa (R$)</Label>
          <Input type="number" step="0.01" min="0" name="feeFixed" defaultValue={defaults?.feeFixed ?? 0} />
        </FieldGroup>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="active"
          defaultChecked={defaults?.active ?? true}
          className="h-4 w-4 rounded border-border"
        />
        Forma de pagamento ativa
      </label>

      {state?.error && (
        <p className="text-sm text-danger bg-danger-soft rounded-lg px-3 py-2">
          {state.error}
        </p>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando…" : "Salvar"}
        </Button>
        <LinkButton href="/pagamentos" variant="secondary">
          Cancelar
        </LinkButton>
      </div>
    </form>
  );
}
