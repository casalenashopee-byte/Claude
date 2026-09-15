"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export type FormState = { error?: string; success?: string } | undefined;

const MIN_WITHDRAWAL = 20;

/**
 * Sem gateway de pagamento real conectado, o saque aqui só registra a
 * solicitação (zera o saldo disponível) — no produto original isso é
 * "processado manualmente pelo administrador via PIX".
 */
export async function requestWithdrawalAction(
  _prev: FormState,
  _formData: FormData
): Promise<FormState> {
  const user = await requireUser();
  const wallet = await prisma.referralWallet.findUnique({ where: { userId: user.id } });
  if (!wallet || wallet.balanceAvailable < MIN_WITHDRAWAL) {
    return { error: `Saldo mínimo para saque é R$ ${MIN_WITHDRAWAL},00.` };
  }

  await prisma.referralWallet.update({
    where: { userId: user.id },
    data: {
      totalWithdrawn: { increment: wallet.balanceAvailable },
      balanceAvailable: 0,
    },
  });

  revalidatePath("/marketing/indique");
  return { success: "Saque solicitado! Será processado via PIX." };
}
