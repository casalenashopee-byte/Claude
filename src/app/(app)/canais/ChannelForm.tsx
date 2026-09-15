"use client";

import { useActionState } from "react";
import { Button, LinkButton } from "@/components/ui/Button";
import { FieldGroup, Input, Label } from "@/components/ui/Field";
import type { FormState } from "@/actions/channels";

export function ChannelForm({
  action,
  defaultName,
  defaultActive = true,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  defaultName?: string;
  defaultActive?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="max-w-sm space-y-4 rounded-2xl border border-border bg-surface p-6">
      <FieldGroup>
        <Label>Nome do canal</Label>
        <Input name="name" required autoFocus defaultValue={defaultName} placeholder="Ex: TikTok Shop" />
      </FieldGroup>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="active" defaultChecked={defaultActive} className="h-4 w-4 rounded border-border" />
        Canal ativo
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
        <LinkButton href="/canais" variant="secondary">
          Cancelar
        </LinkButton>
      </div>
    </form>
  );
}
