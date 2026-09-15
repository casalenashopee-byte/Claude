"use client";

import { useActionState } from "react";
import { requestPasswordResetAction } from "@/actions/passwordReset";
import { Button } from "@/components/ui/Button";
import { FieldGroup, Input, Label } from "@/components/ui/Field";

export function RequestResetForm() {
  const [state, formAction, pending] = useActionState(requestPasswordResetAction, undefined);

  if (state?.success) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-6">
        <p className="text-sm text-brand-strong bg-brand-soft rounded-lg px-3 py-2">
          {state.success}
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4 rounded-2xl border border-border bg-surface p-6">
      <FieldGroup>
        <Label>E-mail</Label>
        <Input type="email" name="email" required autoFocus placeholder="voce@email.com" />
      </FieldGroup>

      {state?.error && (
        <p className="text-sm text-danger bg-danger-soft rounded-lg px-3 py-2">{state.error}</p>
      )}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Enviando…" : "Enviar link de redefinição"}
      </Button>
    </form>
  );
}
