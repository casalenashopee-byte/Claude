"use client";

import { useActionState } from "react";
import { registerAction } from "@/actions/auth";
import { Button } from "@/components/ui/Button";
import { FieldGroup, Input, Label } from "@/components/ui/Field";

export function RegisterForm({ refCode }: { refCode?: string }) {
  const [state, formAction, pending] = useActionState(registerAction, undefined);

  return (
    <form action={formAction} className="space-y-4 rounded-2xl border border-border bg-surface p-6">
      {refCode && <input type="hidden" name="ref" value={refCode} />}
      <FieldGroup>
        <Label>Seu nome</Label>
        <Input name="name" required autoFocus placeholder="Como podemos te chamar" />
      </FieldGroup>
      <FieldGroup>
        <Label>Nome da empresa/loja</Label>
        <Input name="companyName" placeholder="Opcional" />
      </FieldGroup>
      <FieldGroup>
        <Label>E-mail</Label>
        <Input type="email" name="email" required placeholder="voce@email.com" />
      </FieldGroup>
      <FieldGroup>
        <Label hint="mínimo 8 caracteres">Senha</Label>
        <Input type="password" name="password" required minLength={8} placeholder="••••••••" />
      </FieldGroup>

      {state?.error && (
        <p className="text-sm text-danger bg-danger-soft rounded-lg px-3 py-2">
          {state.error}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Criando conta…" : "Criar conta grátis"}
      </Button>
    </form>
  );
}
