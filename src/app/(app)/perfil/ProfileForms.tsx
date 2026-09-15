"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { FieldGroup, Input, Label } from "@/components/ui/Field";
import {
  updateProfileAction,
  updateEmailAction,
  changePasswordAction,
  type ProfileState,
} from "@/actions/profile";

function Feedback({ state }: { state: ProfileState }) {
  if (!state) return null;
  if (state.error) return <p className="text-sm text-danger bg-danger-soft rounded-lg px-3 py-2">{state.error}</p>;
  if (state.success) return <p className="text-sm text-brand-strong bg-brand-soft rounded-lg px-3 py-2">{state.success}</p>;
  return null;
}

export function ProfileDataForm({
  name,
  companyName,
  companyDoc,
}: {
  name: string;
  companyName: string;
  companyDoc: string;
}) {
  const [state, formAction, pending] = useActionState(updateProfileAction, undefined);
  return (
    <form action={formAction} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <FieldGroup>
          <Label>Seu nome</Label>
          <Input name="name" defaultValue={name} required />
        </FieldGroup>
        <FieldGroup>
          <Label>Nome da empresa</Label>
          <Input name="companyName" defaultValue={companyName} />
        </FieldGroup>
      </div>
      <FieldGroup>
        <Label>CNPJ/CPF (cabeçalho de recibo)</Label>
        <Input name="companyDoc" defaultValue={companyDoc} />
      </FieldGroup>
      <Feedback state={state} />
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Salvando…" : "Salvar dados"}
      </Button>
    </form>
  );
}

export function EmailForm({ email }: { email: string }) {
  const [state, formAction, pending] = useActionState(updateEmailAction, undefined);
  return (
    <form action={formAction} className="space-y-3">
      <FieldGroup>
        <Label>E-mail</Label>
        <Input type="email" name="email" defaultValue={email} required />
      </FieldGroup>
      <Feedback state={state} />
      <Button type="submit" size="sm" variant="secondary" disabled={pending}>
        {pending ? "Salvando…" : "Atualizar e-mail"}
      </Button>
    </form>
  );
}

export function PasswordForm() {
  const [state, formAction, pending] = useActionState(changePasswordAction, undefined);
  return (
    <form action={formAction} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <FieldGroup>
          <Label>Senha atual</Label>
          <Input type="password" name="currentPassword" required />
        </FieldGroup>
        <FieldGroup>
          <Label hint="mínimo 8 caracteres">Nova senha</Label>
          <Input type="password" name="newPassword" required minLength={8} />
        </FieldGroup>
      </div>
      <Feedback state={state} />
      <Button type="submit" size="sm" variant="secondary" disabled={pending}>
        {pending ? "Salvando…" : "Trocar senha"}
      </Button>
    </form>
  );
}
