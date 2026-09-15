"use client";

import { useActionState } from "react";
import { Button, LinkButton } from "@/components/ui/Button";
import { FieldGroup, Input, Label } from "@/components/ui/Field";
import type { FormState } from "@/actions/categories";

export function CategoryForm({
  action,
  defaultName,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  defaultName?: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="max-w-sm space-y-4 rounded-2xl border border-border bg-surface p-6">
      <FieldGroup>
        <Label>Nome da categoria</Label>
        <Input name="name" required autoFocus defaultValue={defaultName} placeholder="Ex: Acessórios" />
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
        <LinkButton href="/categorias" variant="secondary">
          Cancelar
        </LinkButton>
      </div>
    </form>
  );
}
