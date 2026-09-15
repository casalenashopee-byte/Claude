import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardTitle } from "@/components/ui/Card";
import { StatCard, StatGrid } from "@/components/ui/StatCard";
import { CopyButton } from "@/components/CopyButton";
import { WithdrawButton } from "./WithdrawButton";
import { formatBRL } from "@/lib/calc";
import { getAppOrigin } from "@/lib/origin";

export default async function IndiquePage() {
  const user = await requireUser();
  const [wallet, referredCount] = await Promise.all([
    prisma.referralWallet.findUnique({ where: { userId: user.id } }),
    prisma.user.count({ where: { referredById: user.id } }),
  ]);

  const origin = await getAppOrigin();
  const link = `${origin}/registrar?ref=${user.referralCode}`;

  return (
    <div>
      <PageHeader
        eyebrow="Marketing"
        title="Indique e ganhe"
        description="20% de comissão recorrente sobre cada assinatura gerada pelo seu link."
      />

      <Card className="mb-6">
        <CardTitle title="Seu link de indicação" />
        <div className="flex flex-wrap items-center gap-2">
          <code className="flex-1 min-w-[200px] rounded-lg bg-surface-muted px-3 py-2 text-sm break-all">
            {link}
          </code>
          <CopyButton text={link} />
        </div>
        <p className="mt-2 text-sm text-muted">
          Código: <strong>{user.referralCode}</strong> · Pessoas indicadas: {referredCount}
        </p>
      </Card>

      <StatGrid>
        <StatCard label="Saldo disponível" value={formatBRL(wallet?.balanceAvailable || 0)} tone="brand" />
        <StatCard label="Total ganho" value={formatBRL(wallet?.totalEarned || 0)} />
        <StatCard label="Total sacado" value={formatBRL(wallet?.totalWithdrawn || 0)} />
        <StatCard label="Saque mínimo" value="R$ 20,00" />
      </StatGrid>

      <Card className="mt-6">
        <CardTitle title="Sacar saldo" hint="Processado manualmente via PIX pelo administrador da conta." />
        <WithdrawButton canWithdraw={(wallet?.balanceAvailable || 0) >= 20} />
      </Card>
    </div>
  );
}
