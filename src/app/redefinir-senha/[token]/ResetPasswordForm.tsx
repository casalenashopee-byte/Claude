"use client";

import { useActionState } from "react";
import { resetPasswordAction } from "@/actions/passwordReset";
import { Button } from "@/components/ui/Button";
import { FieldGroup, Input, Label } from "@/components/ui/Field";

export function ResetPasswordForm({ token }: { token: string }) {
  const action = resetPasswordAction.bind(null, token);
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-4 rounded-2xl border border-border bg-surface p-6">
      <FieldGroup>
        <Label hint="mínimo 8 caracteres">Nova senha</Label>
        <Input type="password" name="password" required minLength={8} autoFocus placeholder="••••••••" />
      </FieldGroup>

      {state?.error && (
        <p className="text-sm text-danger bg-danger-soft rounded-lg px-3 py-2">{state.error}</p>
      )}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Salvando…" : "Redefinir senha"}
      </Button>
    </form>
  );
}
