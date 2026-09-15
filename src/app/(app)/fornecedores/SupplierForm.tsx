"use client";

import { useActionState } from "react";
import { Button, LinkButton } from "@/components/ui/Button";
import { FieldGroup, Input, Label, Select } from "@/components/ui/Field";
import type { FormState } from "@/actions/suppliers";

export function SupplierForm({
  action,
  defaults,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  defaults?: {
    name?: string;
    document?: string | null;
    category?: string | null;
    city?: string | null;
    state?: string | null;
    status?: string;
  };
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="max-w-lg space-y-4 rounded-2xl border border-border bg-surface p-6">
      <FieldGroup>
        <Label>Nome/Razão social</Label>
        <Input name="name" required autoFocus defaultValue={defaults?.name} />
      </FieldGroup>
      <div className="grid grid-cols-2 gap-3">
        <FieldGroup>
          <Label>CNPJ/CPF</Label>
          <Input name="document" defaultValue={defaults?.document ?? ""} />
        </FieldGroup>
        <FieldGroup>
          <Label>Categoria</Label>
          <Input name="category" defaultValue={defaults?.category ?? ""} placeholder="Ex: Distribuidor" />
        </FieldGroup>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FieldGroup>
          <Label>Cidade</Label>
          <Input name="city" defaultValue={defaults?.city ?? ""} />
        </FieldGroup>
        <FieldGroup>
          <Label>UF</Label>
          <Input name="state" maxLength={2} defaultValue={defaults?.state ?? ""} />
        </FieldGroup>
      </div>
      <FieldGroup>
        <Label>Status</Label>
        <Select name="status" defaultValue={defaults?.status ?? "ATIVO"}>
          <option value="ATIVO">Ativo</option>
          <option value="PENDENTE">Pendente</option>
          <option value="INATIVO">Inativo</option>
        </Select>
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
        <LinkButton href="/fornecedores" variant="secondary">
          Cancelar
        </LinkButton>
      </div>
    </form>
  );
}
