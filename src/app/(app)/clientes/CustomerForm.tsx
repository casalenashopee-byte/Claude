"use client";

import { useActionState } from "react";
import { Button, LinkButton } from "@/components/ui/Button";
import { FieldGroup, Input, Label, Textarea } from "@/components/ui/Field";
import type { FormState } from "@/actions/customers";

export function CustomerForm({
  action,
  defaults,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  defaults?: {
    name?: string;
    email?: string | null;
    phone?: string | null;
    document?: string | null;
    notes?: string | null;
  };
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="max-w-lg space-y-4 rounded-2xl border border-border bg-surface p-6">
      <FieldGroup>
        <Label>Nome</Label>
        <Input name="name" required autoFocus defaultValue={defaults?.name} />
      </FieldGroup>
      <div className="grid grid-cols-2 gap-3">
        <FieldGroup>
          <Label>Telefone</Label>
          <Input name="phone" defaultValue={defaults?.phone ?? ""} placeholder="(00) 00000-0000" />
        </FieldGroup>
        <FieldGroup>
          <Label>E-mail</Label>
          <Input type="email" name="email" defaultValue={defaults?.email ?? ""} />
        </FieldGroup>
      </div>
      <FieldGroup>
        <Label>CPF/CNPJ</Label>
        <Input name="document" defaultValue={defaults?.document ?? ""} />
      </FieldGroup>
      <FieldGroup>
        <Label>Observações</Label>
        <Textarea name="notes" rows={3} defaultValue={defaults?.notes ?? ""} />
      </FieldGroup>

      {state?.error && (
        <p className="text-sm text-danger bg-danger-soft rounded-lg px-3 py-2">
          {state.error}
        </p>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando…" : "Salvar"}
        </Button>
        <LinkButton href="/clientes" variant="secondary">
          Cancelar
        </LinkButton>
      </div>
    </form>
  );
}
