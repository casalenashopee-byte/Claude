"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { requestWithdrawalAction, type FormState } from "@/actions/referral";

export function WithdrawButton({ canWithdraw }: { canWithdraw: boolean }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    requestWithdrawalAction,
    undefined
  );

  return (
    <form action={formAction} className="space-y-2">
      <Button type="submit" disabled={!canWithdraw || pending} variant="secondary">
        {pending ? "Solicitando…" : "Solicitar saque via PIX"}
      </Button>
      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      {state?.success && <p className="text-sm text-brand-strong">{state.success}</p>}
    </form>
  );
}
